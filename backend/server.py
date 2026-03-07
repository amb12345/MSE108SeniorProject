"""
Flask API server for fleet data.
Pulls all data from fleet_decisions_full_6 (single table on Aiven).
Returns decisions, gps, sensors shaped for the frontend.
Designed for deployment on Render.
"""

import json
import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

def get_db_connection():
    """Create a database connection using DATABASE_URL from env."""
    url = os.environ.get("DATABASE_URL")
    if not url:
        raise ValueError("DATABASE_URL environment variable is not set")
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    return psycopg2.connect(url, cursor_factory=RealDictCursor)


def _serialize(val):
    """Convert value to JSON-serializable form."""
    if val is None:
        return None
    if hasattr(val, "isoformat"):
        return val.isoformat()
    if hasattr(val, "__float__") and not isinstance(val, (int, bool)):
        return float(val)
    return val


def _row_to_dict(row):
    """Convert a RealDict row to JSON-serializable dict."""
    if row is None:
        return None
    return {k: _serialize(v) for k, v in row.items()}


def fetch_fleet_data_from_full_table(conn):
    """
    Pull all rows from fleet_decisions_full_6 and split each row into
    decision, gps, and sensor records for the frontend API shape.
    """
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM fleet_decisions_full_6")
        rows = cur.fetchall()

    decisions = []
    gps = []
    sensors = []

    for r in rows:
        row = dict(r)
        truck_id = row.get("truck_id")
        ts = row.get("ts")
        if truck_id is None or ts is None:
            continue

        ts_str = _serialize(ts)

        # GPS record
        gps.append(_row_to_dict({
            "truck_id": truck_id,
            "timestamp": ts,
            "latitude": row.get("latitude"),
            "longitude": row.get("longitude"),
            "speed_mph": row.get("speed_mph"),
            "current_node": row.get("current_node"),
            "next_node": row.get("chosen_next") or row.get("planned_next"),
            "destination_node": row.get("destination_node"),
            "edge_progress_frac": row.get("edge_progress_frac"),
            "edge_travel_time_min": row.get("edge_travel_time_min"),
            "is_facility_node": bool(row.get("is_facility_node")) if row.get("is_facility_node") is not None else None,
        }))

        # Sensor record
        sensors.append(_row_to_dict({
            "truck_id": truck_id,
            "timestamp": ts,
            "temperature_c": row.get("temperature_c"),
            "humidity_pct": row.get("humidity_pct"),
            "door_open": bool(row.get("door_open")) if row.get("door_open") is not None else None,
            "shipment_value": row.get("shipment_value"),
            "remaining_slack_min": row.get("remaining_slack_min"),
            "violation_min": row.get("violation_min"),
            "current_node": row.get("current_node"),
            "next_node": row.get("chosen_next") or row.get("planned_next"),
            "destination_node": row.get("destination_node"),
            "edge_progress_frac": row.get("edge_progress_frac"),
            "edge_travel_time_min": row.get("edge_travel_time_min"),
            "is_facility_node": bool(row.get("is_facility_node")) if row.get("is_facility_node") is not None else None,
        }))

        # Route JSON
        route = {
            "current_node": row.get("current_node"),
            "planned_next": row.get("planned_next"),
            "chosen_next": row.get("chosen_next"),
            "valid_outgoing_next_nodes": [],
        }
        try:
            vjson = row.get("valid_outgoing_next_nodes_json")
            if vjson:
                route["valid_outgoing_next_nodes"] = json.loads(vjson) if isinstance(vjson, str) else vjson
        except (json.JSONDecodeError, TypeError):
            pass

        # all_actions from all_actions_json or build from continue/reroute/detour
        all_actions = []
        try:
            ajson = row.get("all_actions_json")
            if ajson:
                all_actions = json.loads(ajson) if isinstance(ajson, str) else ajson
        except (json.JSONDecodeError, TypeError):
            pass
        if not all_actions:
            for action_name, next_col, mean_col in [
                ("continue", "continue_next_node", "continue_mean_total"),
                ("reroute", "reroute_next_node", "reroute_mean_total"),
                ("detour", "detour_next_node", "detour_mean_total"),
            ]:
                nn = row.get(next_col)
                mc = row.get(mean_col)
                if nn is not None or mc is not None:
                    all_actions.append({"action": action_name, "next_node": nn, "mean_cost": mc})
        if not all_actions:
            all_actions = [{"action": row.get("recommended_action") or "continue", "mean_cost": row.get("mean_total_cost") or 0}]

        mean_cost = row.get("mean_total_cost") or row.get("best_mean_cost") or 0
        recommended = (row.get("recommended_action") or row.get("best_action") or "continue") or "continue"

        # Decision record
        decisions.append(_row_to_dict({
            "truck_id": truck_id,
            "timestamp": ts,
            "recommended_action": recommended,
            "mean_cost": mean_cost,
            "all_actions": all_actions,
            "reason": row.get("reason") or "",
            "route": route,
            "mc_samples": row.get("mc_samples") or 1000,
        }))

    return decisions, gps, sensors


@app.route("/api/fleet-data", methods=["GET"])
def get_fleet_data():
    """
    Single API endpoint that returns all data from fleet_decisions_full_6,
    shaped as decisions, gps, sensors for the frontend.
    """
    try:
        conn = get_db_connection()
        try:
            decisions, gps, sensors = fetch_fleet_data_from_full_table(conn)
        finally:
            conn.close()
        return jsonify({
            "decisions": decisions,
            "gps": gps,
            "sensors": sensors,
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint for Render and load balancers."""
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("FLASK_DEBUG", "false").lower() == "true")
