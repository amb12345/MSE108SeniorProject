"""
Cost Engine for Cold-Chain Trucking Monte Carlo Simulation.

Scenario-based action comparison with continue / reroute / detour.
Each action has extra travel/handling time and a fixed cost.  Business
logic determines effective distance, delay, and spoilage per action,
then runs a vectorised Monte Carlo to score them.

Quantile scoring rule (pick action with LOWEST score):
    risk_threshold = 0.25  →  score = q75(cost)   Conservative: penalise tail
    risk_threshold = 0.50  →  score = q50(cost)   Balanced: median
    risk_threshold = 0.75  →  score = q25(cost)   Aggressive: optimise cheap case

Mapping: quantile_used = 1 − risk_threshold.
"""

import csv
import json
import sys
import numpy as np
from dataclasses import dataclass
from typing import Any, Dict, List, Optional


# ── Action definitions ───────────────────────────────────────────────

ACTIONS = [
    {"name": "continue", "extra_travel_minutes": 0,  "extra_handling_minutes": 0,  "fixed_cost": 0},
    {"name": "reroute",  "extra_travel_minutes": 45, "extra_handling_minutes": 3,  "fixed_cost": 500},
    {"name": "detour",   "extra_travel_minutes": 30, "extra_handling_minutes": 50, "fixed_cost": 2000},
]


@dataclass
class ScenarioRow:
    """One truck at one node/time with all scenario variables."""
    truck_id: int
    node_id: int
    minutes_above_temp: float
    future_violation_if_continue: float
    reroute_reduction: float
    detour_repair_benefit: float
    slack_minutes: float
    door_open: int             # 0 or 1
    high_humidity: int         # 0 or 1
    distance_base_miles: float
    delay_base_minutes: float
    spoilage_time_base_hours: float
    shipment_value: Optional[float] = None
    recommended_action: Optional[str] = None


# ── Business logic ───────────────────────────────────────────────────

def extra_violation_minutes(action_name: str, extra_time: float, row: ScenarioRow) -> float:
    """Additional violation minutes based on action type.

    continue – inherits all projected future violations.
    reroute  – reduces future violations but pays extra time if cargo is
               already above temperature threshold.
    detour   – extra time offset by repair benefit (cold-chain service stop).
    """
    future = row.future_violation_if_continue

    if action_name == "continue":
        return future

    if action_name == "reroute":
        reduced_future = max(0.0, future - row.reroute_reduction)
        pay_time = extra_time if row.minutes_above_temp > 0 else 0.0
        return reduced_future + pay_time

    if action_name == "detour":
        return max(0.0, extra_time - row.detour_repair_benefit)

    return future


# ── Monte Carlo simulation ───────────────────────────────────────────

def simulate_cost_distribution(
    distance: float,
    door_open: bool,
    humidity: bool,
    delay_minutes: float,
    spoilage_time_hours: float,
    shipment_value: Optional[float],
    fixed_cost: float = 0.0,
    n: int = 20_000,
    rng: Optional[np.random.Generator] = None,
) -> Dict[str, np.ndarray]:
    """Vectorised Monte Carlo of total shipment cost (no Python loops)."""
    if rng is None:
        rng = np.random.default_rng(42)

    # ── Operating & travel ──
    mile_cost = rng.uniform(2.20, 2.35, n)
    mph = rng.uniform(30, 55, n)
    rate_per_mile = (mile_cost * mph) / 60.0
    handling_fee = rng.uniform(100, 500, n)
    travel_cost = rate_per_mile * distance
    operating_travel = travel_cost + handling_fee

    # ── Delay / service ──
    if shipment_value is not None and shipment_value > 0:
        shipment_vals = np.full(n, shipment_value)
    else:
        shipment_vals = rng.triangular(50_000, 75_000, 100_000, n)

    otif_cost = 0.03 * shipment_vals
    detention_rate = rng.uniform(0.5, 0.83, n)
    detention_cost = detention_rate * max(delay_minutes, 0)
    delay_service = otif_cost + detention_cost

    # ── Spoilage (exponential P(loss), knee at 4 h) ──
    lambda_1_base = -np.log(1 - 0.2) / 1.0
    lambda_6_base = -np.log(1 - 0.8) / 6.0
    lambda_1 = lambda_1_base * rng.uniform(0.95, 1.05, n)
    lambda_6 = lambda_6_base * rng.uniform(0.95, 1.05, n)

    t = max(spoilage_time_hours, 0)
    if t <= 4:
        p_loss = 1 - np.exp(-lambda_1 * t)
    else:
        frac = np.clip((t - 4) / 2.0, 0, 1)
        lambda_t = lambda_1 + frac * (lambda_6 - lambda_1)
        p_loss = 1 - np.exp(-lambda_t * t)

    door_mult = 1.5 if door_open else 1.0
    humidity_mult = 1.2 if humidity else 1.0
    spoilage_cost = shipment_vals * p_loss * (door_mult * humidity_mult)

    total_cost = operating_travel + delay_service + spoilage_cost + fixed_cost

    return {
        "total_cost": total_cost,
        "operating_travel": operating_travel,
        "delay_service": delay_service,
        "spoilage": spoilage_cost,
    }


def compute_stats(costs: np.ndarray) -> Dict[str, float]:
    """Summary statistics for a cost distribution array."""
    return {
        "mean": float(np.mean(costs)),
        "median": float(np.median(costs)),
        "std": float(np.std(costs)),
        "min": float(np.min(costs)),
        "max": float(np.max(costs)),
        "p05": float(np.percentile(costs, 5)),
        "p25": float(np.percentile(costs, 25)),
        "p50": float(np.percentile(costs, 50)),
        "p75": float(np.percentile(costs, 75)),
        "p95": float(np.percentile(costs, 95)),
    }


# ── Evaluate all actions for one scenario row ────────────────────────

def evaluate_scenario(
    row: ScenarioRow,
    risk_threshold: float = 0.50,
    n: int = 20_000,
    seed: int = 42,
) -> Dict[str, Any]:
    """Run Monte Carlo for all 3 actions on a scenario row.

    Per action the engine derives:
        distance  = distance_base × (1 + extra_time / 300)
        net_delay = max(0, delay_base + extra_time − slack)
        spoilage  = spoilage_base + (minutes_above_temp + extra_violation) / 60

    Detour forces door_open=0, humidity=0 (cold-chain repaired).
    Fixed costs (reroute $500, detour $2 000) added post-simulation.

    Quantile scoring (lower wins):
        risk=0.25 → p75  |  risk=0.50 → p50  |  risk=0.75 → p25
    """
    rng = np.random.default_rng(seed)
    quantile_pct = 1.0 - risk_threshold
    quantile_label = f"p{int(quantile_pct * 100)}"

    per_action: Dict[str, Any] = {}
    scores: Dict[str, float] = {}

    for action_def in ACTIONS:
        name = action_def["name"]
        extra_travel = action_def["extra_travel_minutes"]
        extra_handling = action_def["extra_handling_minutes"]
        fc = action_def["fixed_cost"]
        extra_time = extra_travel + extra_handling

        distance = row.distance_base_miles * (1 + extra_time / 300.0)

        if name == "detour":
            door_open, humidity = False, False
        else:
            door_open = bool(row.door_open)
            humidity = bool(row.high_humidity)

        net_delay = max(0.0, row.delay_base_minutes + extra_time - row.slack_minutes)

        ev = extra_violation_minutes(name, extra_time, row)
        spoilage_time = row.spoilage_time_base_hours + (row.minutes_above_temp + ev) / 60.0

        result = simulate_cost_distribution(
            distance=distance,
            door_open=door_open,
            humidity=humidity,
            delay_minutes=net_delay,
            spoilage_time_hours=spoilage_time,
            shipment_value=row.shipment_value,
            fixed_cost=fc,
            n=n,
            rng=rng,
        )

        total = result["total_cost"]
        stats = compute_stats(total)
        score = float(np.percentile(total, quantile_pct * 100))

        per_action[name] = {
            "stats": stats,
            "percentiles": {
                "p05": stats["p05"],
                "p25": stats["p25"],
                "p50": stats["p50"],
                "p75": stats["p75"],
                "p95": stats["p95"],
            },
            "breakdown_means": {
                "operating_travel": float(np.mean(result["operating_travel"])),
                "delay_service": float(np.mean(result["delay_service"])),
                "spoilage": float(np.mean(result["spoilage"])),
                "fixed_cost": float(fc),
            },
            "score": score,
        }
        scores[name] = score

    # Use the action from CSV/DB if provided; otherwise fall back to quantile scoring
    risk_labels = {0.25: "25% Safe", 0.50: "50% Balanced", 0.75: "75% Cheap"}
    risk_label = risk_labels.get(risk_threshold, f"{int(risk_threshold * 100)}%")

    if row.recommended_action and row.recommended_action in scores:
        chosen = row.recommended_action
        rationale = (
            f"Action '{chosen}' from routing decision data "
            f"({quantile_label} cost: ${scores[chosen]:,.0f} at {risk_label} risk)"
        )
    else:
        chosen = min(scores, key=lambda k: scores[k])
        rationale = (
            f"Selected '{chosen}' because it minimizes {quantile_label} cost "
            f"(${scores[chosen]:,.0f}) at {risk_label} risk tolerance"
        )

    return {
        "truck_id": row.truck_id,
        "node_id": row.node_id,
        "inputs": {
            "minutes_above_temp": row.minutes_above_temp,
            "future_violation_if_continue": row.future_violation_if_continue,
            "reroute_reduction": row.reroute_reduction,
            "detour_repair_benefit": row.detour_repair_benefit,
            "slack_minutes": row.slack_minutes,
            "door_open": row.door_open,
            "high_humidity": row.high_humidity,
            "distance_base_miles": row.distance_base_miles,
            "delay_base_minutes": row.delay_base_minutes,
            "spoilage_time_base_hours": row.spoilage_time_base_hours,
            "shipment_value": row.shipment_value,
        },
        "per_action": per_action,
        "recommended_action": chosen,
        "risk_threshold": risk_threshold,
        "quantile_used": quantile_label,
        "rationale": rationale,
    }


# ── CSV reader ───────────────────────────────────────────────────────

def read_scenarios_from_csv(csv_path: str) -> List[ScenarioRow]:
    """Read scenario rows from a CSV file."""
    rows: List[ScenarioRow] = []
    with open(csv_path, newline="") as f:
        reader = csv.DictReader(f)
        for r in reader:
            sv = r.get("shipment_value", "").strip()
            rows.append(ScenarioRow(
                truck_id=int(r["truck_id"]),
                node_id=int(r["node_id"]),
                minutes_above_temp=float(r["minutes_above_temp"]),
                future_violation_if_continue=float(r["future_violation_if_continue"]),
                reroute_reduction=float(r["reroute_reduction"]),
                detour_repair_benefit=float(r["detour_repair_benefit"]),
                slack_minutes=float(r["slack_minutes"]),
                door_open=int(float(r["door_open"])),
                high_humidity=int(float(r["high_humidity"])),
                distance_base_miles=float(r["distance_base_miles"]),
                delay_base_minutes=float(r["delay_base_minutes"]),
                spoilage_time_base_hours=float(r["spoilage_time_base_hours"]),
                shipment_value=float(sv) if sv else None,
                recommended_action=r.get("recommended_action", "").strip() or None,
            ))
    return rows


# ── CLI: reads JSON from stdin, writes JSON to stdout ────────────────

if __name__ == "__main__":
    input_data = json.loads(sys.stdin.read())

    risk_threshold = input_data.get("risk_threshold", 0.50)
    n = input_data.get("n", 20_000)
    seed = input_data.get("seed", 42)
    results = []

    if "csv_path" in input_data:
        scenarios = read_scenarios_from_csv(input_data["csv_path"])
        for row in scenarios:
            results.append(evaluate_scenario(row, risk_threshold, n, seed + row.truck_id))
    elif "trucks" in input_data:
        for truck in input_data["trucks"]:
            row = ScenarioRow(**truck)
            results.append(evaluate_scenario(row, risk_threshold, n, seed + row.truck_id))

    json.dump(results, sys.stdout)
