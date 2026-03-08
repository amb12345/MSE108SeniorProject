"""
Flask API server for fleet data.
Pulls all data from fleet_decisions_full_6 (single table on Aiven).
Returns the raw table as-is - no split into decisions, gps, sensors.
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


def fetch_fleet_table(conn):
    """
    Pull all rows from fleet_decisions_full_6 exactly as stored in PostgreSQL.
    Returns one array of full rows, no split into decisions/gps/sensors.
    """
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM fleet_decisions_full_6")
        rows = cur.fetchall()
    return [_row_to_dict(dict(r)) for r in rows]


@app.route("/api/fleet-data", methods=["GET"])
def get_fleet_data():
    """
    Returns all rows from fleet_decisions_full_6 as a single table.
    Same columns and structure as in PostgreSQL - no decisions/gps/sensors split.
    """
    try:
        conn = get_db_connection()
        try:
            rows = fetch_fleet_table(conn)
        finally:
            conn.close()
        return jsonify({"rows": rows})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint for Render and load balancers."""
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=os.environ.get("FLASK_DEBUG", "false").lower() == "true")
