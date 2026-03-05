"""
Unit tests for the Environmental Impact (SROI) Engine.

Run with:
    cd backend && python -m pytest test_environmental_sroi.py -v
"""

import math
import pytest

from environmental_engine import (
    EPA_CARBON_MULTIPLIER,
    EMISSIONS_FACTOR,
    DEFAULT_CARGO_TONS,
    calculate_environmental_sroi,
    spoilage_cost_saved,
    compute_truck_environmental_impact,
)
from cost_engine import ScenarioRow, evaluate_scenario


# ── Fixtures ──────────────────────────────────────────────────────────

def _make_scenario(**overrides) -> ScenarioRow:
    defaults = dict(
        truck_id=1,
        node_id=10,
        minutes_above_temp=20.0,
        future_violation_if_continue=30.0,
        reroute_reduction=18.0,
        detour_repair_benefit=40.0,
        slack_minutes=10.0,
        door_open=0,
        high_humidity=0,
        distance_base_miles=100.0,
        delay_base_minutes=15.0,
        spoilage_time_base_hours=2.0,
        shipment_value=75_000.0,
        recommended_action=None,
    )
    defaults.update(overrides)
    return ScenarioRow(**defaults)


# ── Tests: calculate_environmental_sroi ───────────────────────────────

class TestCalculateEnvironmentalSROI:
    def test_positive_savings(self):
        result = calculate_environmental_sroi(120.0, 100.0)
        assert result["distance_saved"] == 20.0
        assert result["ton_miles_saved"] == 20.0 * DEFAULT_CARGO_TONS

        expected_tonnes = (20.0 * DEFAULT_CARGO_TONS * EMISSIONS_FACTOR) / 1_000_000
        assert abs(result["total_tonnes_carbon_saved"] - expected_tonnes) < 1e-5

        expected_value = EPA_CARBON_MULTIPLIER * expected_tonnes
        assert abs(result["environmental_value"] - expected_value) < 1e-3

    def test_no_savings_when_optimised_longer(self):
        result = calculate_environmental_sroi(100.0, 120.0)
        assert result["distance_saved"] == 0.0
        assert result["ton_miles_saved"] == 0.0
        assert result["total_tonnes_carbon_saved"] == 0.0
        assert result["environmental_value"] == 0.0
        assert "No distance saved" in result["assumptions"]["note"]

    def test_equal_distance(self):
        result = calculate_environmental_sroi(100.0, 100.0)
        assert result["distance_saved"] == 0.0
        assert result["environmental_value"] == 0.0

    def test_custom_cargo_tons(self):
        r1 = calculate_environmental_sroi(120.0, 100.0, cargo_tons=20.0)
        r2 = calculate_environmental_sroi(120.0, 100.0, cargo_tons=40.0)
        assert r2["ton_miles_saved"] == pytest.approx(r1["ton_miles_saved"] * 2, rel=1e-4)
        assert r2["environmental_value"] == pytest.approx(r1["environmental_value"] * 2, rel=1e-3)

    def test_custom_carbon_price(self):
        r1 = calculate_environmental_sroi(120.0, 100.0, carbon_price=190)
        r2 = calculate_environmental_sroi(120.0, 100.0, carbon_price=380)
        assert r2["environmental_value"] == pytest.approx(r1["environmental_value"] * 2, rel=1e-3)

    def test_assumptions_present(self):
        result = calculate_environmental_sroi(120.0, 100.0, cargo_tons=25.0, carbon_price=200)
        a = result["assumptions"]
        assert a["epa_carbon_multiplier"] == 200
        assert a["emissions_factor_g_per_ton_mile"] == EMISSIONS_FACTOR
        assert a["cargo_tons"] == 25.0


# ── Tests: spoilage_cost_saved ────────────────────────────────────────

class TestSpoilageCostSaved:
    def test_continue_vs_continue_is_zero(self):
        row = _make_scenario()
        sr = evaluate_scenario(row, 0.5, 5000, 42)
        result = spoilage_cost_saved(sr, "continue")
        assert result["expected_spoilage_cost_saved"] == 0.0

    def test_detour_reduces_spoilage(self):
        row = _make_scenario(door_open=1, high_humidity=1, minutes_above_temp=60)
        sr = evaluate_scenario(row, 0.5, 5000, 42)
        result = spoilage_cost_saved(sr, "detour")
        assert result["expected_spoilage_cost_saved"] >= 0


# ── Tests: compute_truck_environmental_impact ─────────────────────────

class TestComputeTruckEnvironmentalImpact:
    def test_continue_action_zero_env_savings(self):
        row = _make_scenario(recommended_action="continue")
        sr = evaluate_scenario(row, 0.5, 5000, 42)
        impact = compute_truck_environmental_impact(sr, row)
        assert impact["distance_saved"] == 0.0
        assert impact["environmental_value"] == 0.0
        assert impact["chosen_action"] == "continue"

    def test_reroute_has_negative_distance_saved(self):
        """Reroute adds extra travel; distance increases, so env savings = 0."""
        row = _make_scenario(recommended_action="reroute")
        sr = evaluate_scenario(row, 0.5, 5000, 42)
        impact = compute_truck_environmental_impact(sr, row)
        assert impact["distance_saved"] == 0.0
        assert impact["environmental_value"] == 0.0

    def test_truck_id_propagated(self):
        row = _make_scenario(truck_id=42)
        sr = evaluate_scenario(row, 0.5, 5000, 42)
        impact = compute_truck_environmental_impact(sr, row)
        assert impact["truck_id"] == 42

    def test_sustainability_value_is_sum(self):
        row = _make_scenario(recommended_action="detour", door_open=1, minutes_above_temp=60)
        sr = evaluate_scenario(row, 0.5, 5000, 42)
        impact = compute_truck_environmental_impact(sr, row)
        expected = impact["environmental_value"] + impact["expected_spoilage_cost_saved"]
        assert abs(impact["total_sustainability_value"] - expected) < 0.01

    def test_reproducibility(self):
        row = _make_scenario(recommended_action="detour")
        sr1 = evaluate_scenario(row, 0.5, 5000, 42)
        sr2 = evaluate_scenario(row, 0.5, 5000, 42)
        i1 = compute_truck_environmental_impact(sr1, row)
        i2 = compute_truck_environmental_impact(sr2, row)
        assert i1["total_sustainability_value"] == i2["total_sustainability_value"]

    def test_custom_params(self):
        row = _make_scenario(recommended_action="detour")
        sr = evaluate_scenario(row, 0.5, 5000, 42)
        i1 = compute_truck_environmental_impact(sr, row, cargo_tons=20, carbon_price=190)
        i2 = compute_truck_environmental_impact(sr, row, cargo_tons=40, carbon_price=380)
        # 2x cargo + 2x price ⇒ 4x environmental value
        if i1["environmental_value"] > 0:
            assert abs(i2["environmental_value"] / i1["environmental_value"] - 4.0) < 0.01


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
