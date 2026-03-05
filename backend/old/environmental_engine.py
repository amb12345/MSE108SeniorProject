"""
Environmental Impact (SROI) Engine for Cold-Chain Trucking.

Computes environmental and economic sustainability metrics by comparing
a baseline action ("continue") against the chosen risk-optimal action
from the cost Monte Carlo engine.

Constants sourced from:
    - EPA Social Cost of Carbon: $190 / metric ton CO₂
    - EPA emissions factor for medium/heavy-duty trucks: 161.8 g CO₂ per ton-mile

All calculations are transparent and reproducible with fixed seeds.
"""

import json
import sys
from dataclasses import dataclass, asdict
from typing import Any, Dict, Optional

from cost_engine import (
    ACTIONS,
    ScenarioRow,
    evaluate_scenario,
)

# ── Constants ─────────────────────────────────────────────────────────

EPA_CARBON_MULTIPLIER = 190      # $/metric ton CO₂
EMISSIONS_FACTOR = 161.8         # grams CO₂ per ton-mile
DEFAULT_CARGO_TONS = 20.0


# ── Core environmental SROI calculation ───────────────────────────────

def calculate_environmental_sroi(
    original_distance: float,
    optimized_distance: float,
    cargo_tons: float = DEFAULT_CARGO_TONS,
    carbon_price: float = EPA_CARBON_MULTIPLIER,
) -> Dict[str, Any]:
    """Calculate environmental savings from route optimisation.

    Parameters
    ----------
    original_distance : float
        Baseline distance in miles (action = "continue").
    optimized_distance : float
        Optimised distance in miles (chosen action).
    cargo_tons : float
        Cargo weight in short tons.  Default 20.
    carbon_price : float
        Shadow price of carbon in $/metric ton CO₂.  Default EPA $190.

    Returns
    -------
    dict with distance_saved, ton_miles_saved, total_tonnes_carbon_saved,
    environmental_value, and full assumptions dict.
    """
    distance_saved = original_distance - optimized_distance

    if distance_saved <= 0:
        return {
            "distance_saved": 0.0,
            "ton_miles_saved": 0.0,
            "total_tonnes_carbon_saved": 0.0,
            "environmental_value": 0.0,
            "assumptions": {
                "epa_carbon_multiplier": carbon_price,
                "emissions_factor_g_per_ton_mile": EMISSIONS_FACTOR,
                "cargo_tons": cargo_tons,
                "original_distance_miles": original_distance,
                "optimized_distance_miles": optimized_distance,
                "note": "No distance saved — optimised route is equal or longer",
            },
        }

    ton_miles_saved = distance_saved * cargo_tons
    total_tonnes_carbon_saved = (ton_miles_saved * EMISSIONS_FACTOR) / 1_000_000
    environmental_value = carbon_price * total_tonnes_carbon_saved

    return {
        "distance_saved": round(distance_saved, 4),
        "ton_miles_saved": round(ton_miles_saved, 4),
        "total_tonnes_carbon_saved": round(total_tonnes_carbon_saved, 6),
        "environmental_value": round(environmental_value, 4),
        "assumptions": {
            "epa_carbon_multiplier": carbon_price,
            "emissions_factor_g_per_ton_mile": EMISSIONS_FACTOR,
            "cargo_tons": cargo_tons,
            "original_distance_miles": round(original_distance, 4),
            "optimized_distance_miles": round(optimized_distance, 4),
        },
    }


# ── Spoilage cost savings (reuses Monte Carlo distributions) ─────────

def spoilage_cost_saved(
    baseline_result: Dict[str, Any],
    chosen_action: str,
) -> Dict[str, float]:
    """Compute expected spoilage cost saved: baseline (continue) vs chosen action."""
    baseline_spoilage = baseline_result["per_action"]["continue"]["breakdown_means"]["spoilage"]
    chosen_spoilage = baseline_result["per_action"][chosen_action]["breakdown_means"]["spoilage"]

    return {
        "baseline_expected_spoilage_cost": round(baseline_spoilage, 2),
        "chosen_expected_spoilage_cost": round(chosen_spoilage, 2),
        "expected_spoilage_cost_saved": round(baseline_spoilage - chosen_spoilage, 2),
    }


# ── Full environmental impact for one truck ──────────────────────────

def compute_truck_environmental_impact(
    scenario_result: Dict[str, Any],
    row: ScenarioRow,
    cargo_tons: float = DEFAULT_CARGO_TONS,
    carbon_price: float = EPA_CARBON_MULTIPLIER,
) -> Dict[str, Any]:
    """Combine environmental SROI + spoilage savings for one truck."""

    chosen_action = scenario_result["recommended_action"]
    baseline_action = "continue"

    # Distance for each action = distance_base × (1 + extra_time / 300)
    action_defs = {a["name"]: a for a in ACTIONS}
    def action_distance(name: str) -> float:
        a = action_defs[name]
        extra = a["extra_travel_minutes"] + a["extra_handling_minutes"]
        return row.distance_base_miles * (1 + extra / 300.0)

    original_distance = action_distance(baseline_action)
    optimized_distance = action_distance(chosen_action)

    env = calculate_environmental_sroi(
        original_distance, optimized_distance, cargo_tons, carbon_price,
    )

    spoilage = spoilage_cost_saved(scenario_result, chosen_action)

    total_sustainability_value = env["environmental_value"] + spoilage["expected_spoilage_cost_saved"]

    baseline_total_cost = scenario_result["per_action"][baseline_action]["stats"]["mean"]
    chosen_total_cost = scenario_result["per_action"][chosen_action]["stats"]["mean"]
    cost_difference = chosen_total_cost - baseline_total_cost

    sustainability_roi_ratio = (
        total_sustainability_value / max(abs(cost_difference), 1.0)
    )

    carbon_saved_per_dollar = (
        env["total_tonnes_carbon_saved"] / max(abs(cost_difference), 1.0)
    )

    return {
        "truck_id": scenario_result["truck_id"],
        "node_id": scenario_result["node_id"],
        "baseline_action": baseline_action,
        "chosen_action": chosen_action,
        "distance_saved": env["distance_saved"],
        "ton_miles_saved": env["ton_miles_saved"],
        "total_tonnes_carbon_saved": env["total_tonnes_carbon_saved"],
        "environmental_value": env["environmental_value"],
        "expected_spoilage_cost_saved": spoilage["expected_spoilage_cost_saved"],
        "baseline_expected_spoilage_cost": spoilage["baseline_expected_spoilage_cost"],
        "chosen_expected_spoilage_cost": spoilage["chosen_expected_spoilage_cost"],
        "total_sustainability_value": round(total_sustainability_value, 4),
        "cost_difference_vs_baseline": round(cost_difference, 2),
        "sustainability_roi_ratio": round(sustainability_roi_ratio, 4),
        "carbon_saved_per_dollar": round(carbon_saved_per_dollar, 6),
        "assumptions": env["assumptions"],
    }


# ── CLI ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    from cost_engine import read_scenarios_from_csv

    input_data = json.loads(sys.stdin.read())
    risk = input_data.get("risk_threshold", 0.50)
    n = input_data.get("n", 20_000)
    seed = input_data.get("seed", 42)
    cargo = input_data.get("cargo_tons", DEFAULT_CARGO_TONS)
    cprice = input_data.get("carbon_price", EPA_CARBON_MULTIPLIER)

    results = []
    if "csv_path" in input_data:
        scenarios = read_scenarios_from_csv(input_data["csv_path"])
        for row in scenarios:
            sr = evaluate_scenario(row, risk, n, seed + row.truck_id)
            results.append(compute_truck_environmental_impact(sr, row, cargo, cprice))

    json.dump(results, sys.stdout, indent=2)
