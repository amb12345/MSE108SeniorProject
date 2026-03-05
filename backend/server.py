"""
Flask API server for fleet data.
Pulls all data from test_fleet_decisions, test_fleet_gps, and test_fleet_sensors.
Designed for deployment on Render.
"""

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
    # Render/Aiven may use postgres://; psycopg2 needs postgresql://
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    return psycopg2.connect(url, cursor_factory=RealDictCursor)


def _serialize_row(row):
    """Convert a RealDict row to JSON-serializable dict (handle dates, decimals, etc.)."""
    if row is None:
        return None
    out = {}
    for k, v in row.items():
        if hasattr(v, "isoformat"):  # datetime
            out[k] = v.isoformat()
        elif hasattr(v, "__float__") and not isinstance(v, (int, bool)):
            out[k] = float(v)
        else:
            out[k] = v
    return out


def fetch_fleet_decisions(conn):
    """
    Pull all rows from test_fleet_decisions.
    Schema: id, all_actions, createdAt, mc_samples, mean_cost, reason,
            recommended_action, route, timestamp, truck_id
    """
    columns = [
        "id", "all_actions", '"createdAt"', "mc_samples", "mean_cost", "reason",
        "recommended_action", "route", "timestamp", "truck_id",
    ]
    with conn.cursor() as cur:
        cur.execute(f'SELECT {", ".join(columns)} FROM test_fleet_decisions')
        rows = cur.fetchall()
    return [_serialize_row(r) for r in rows]


def fetch_fleet_gps(conn):
    """
    Pull all rows from test_fleet_gps.
    Schema: id, at_node, createdAt, current_node, destination_node, edge_progress_frac,
            edge_travel_time_min, is_facility_node, latitude, longitude, next_node,
            speed_mph, t, timestamp, truck_id
    """
    columns = [
        "id", "at_node", '"createdAt"', "current_node", "destination_node",
        "edge_progress_frac", "edge_travel_time_min", "is_facility_node",
        "latitude", "longitude", "next_node", "speed_mph", "t", "timestamp",
        "truck_id",
    ]
    with conn.cursor() as cur:
        cur.execute(f'SELECT {", ".join(columns)} FROM test_fleet_gps')
        rows = cur.fetchall()
    return [_serialize_row(r) for r in rows]


def fetch_fleet_sensors(conn):
    """
    Pull all rows from test_fleet_sensors.
    Schema: id, at_node, createdAt, current_node, destination_node, door_open,
            edge_progress_frac, edge_travel_time_min, humidity_pct, is_facility_node,
            next_node, remaining_slack_min, shipment_value, t, temperature_c,
            timestamp, truck_id, violation_min
    """
    columns = [
        "id", "at_node", '"createdAt"', "current_node", "destination_node",
        "door_open", "edge_progress_frac", "edge_travel_time_min", "humidity_pct",
        "is_facility_node", "next_node", "remaining_slack_min", "shipment_value",
        "t", "temperature_c", "timestamp", "truck_id", "violation_min",
    ]
    with conn.cursor() as cur:
        cur.execute(f'SELECT {", ".join(columns)} FROM test_fleet_sensors')
        rows = cur.fetchall()
    return [_serialize_row(r) for r in rows]


@app.route("/api/fleet-data", methods=["GET"])
def get_fleet_data():
    """
    Single API endpoint that returns all data from all three fleet tables.
    Internally delegates to three functions, one per table.
    """
    try:
        conn = get_db_connection()
        try:
            decisions = fetch_fleet_decisions(conn)
            gps = fetch_fleet_gps(conn)
            sensors = fetch_fleet_sensors(conn)
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
    port = int(os.environ.get("PORT", 3000))
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("FLASK_DEBUG", "false").lower() == "true")
