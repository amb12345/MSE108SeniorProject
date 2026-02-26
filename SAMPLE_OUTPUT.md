# Sample Database Output

This document shows examples of the data available from the database after importing CSV files.

## API Endpoints

### 1. GET `/api/fleet` - Get All Fleet Data

Returns latest data for all trucks in the fleet.

**Response:**
```json
[
  {
    "truck_id": 0,
    "gps": {
      "id": 12345,
      "t": 1771970887,
      "truck_id": 0,
      "timestamp": "2026-02-24T22:08:07.878Z",
      "latitude": 37.08,
      "longitude": -121.94,
      "speed_mph": 45.37,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": 64.0,
      "edge_progress_frac": 0.0,
      "createdAt": "2026-01-25T10:30:00.000Z"
    },
    "sensor": {
      "id": 67890,
      "t": 1771970887,
      "truck_id": 0,
      "timestamp": "2026-02-24T22:08:07.878Z",
      "temperature_c": 69.41,
      "humidity_pct": 95.0,
      "door_open": false,
      "shipment_value": 58882.30,
      "remaining_slack_min": -191.01,
      "violation_min": 0.0,
      "current_node": 19,
      "next_node": 19,
      "destination_node": 19,
      "at_node": true,
      "is_facility_node": false,
      "edge_travel_time_min": 64.0,
      "edge_progress_frac": 0.0,
      "createdAt": "2026-01-25T10:30:00.000Z"
    },
    "decision": {
      "id": 11223,
      "truck_id": 0,
      "timestamp": "2026-02-24T21:54:16.911Z",
      "recommended_action": "continue",
      "mean_cost": 16723.75,
      "all_actions": [
        {
          "action": "reroute",
          "next_node": 18,
          "edge_travel_time_min": "40.0",
          "extra_time_min": "0.0",
          "fixed_cost": "500.0",
          "mean_cost": 17516.93,
          "mean_cost_components": {
            "operating_travel": 389.26,
            "delay_service": 2377.47,
            "spoilage": 14250.2
          }
        },
        {
          "action": "continue",
          "next_node": 19,
          "edge_travel_time_min": "64.0",
          "extra_time_min": "0.0",
          "fixed_cost": "0.0",
          "mean_cost": 16723.75,
          "mean_cost_components": {
            "operating_travel": 382.7,
            "delay_service": 2339.92,
            "spoilage": 14001.13
          }
        }
      ],
      "reason": "MC_min_cost_over_outgoing_edges",
      "route": {
        "current_node": 16,
        "planned_next": 19,
        "chosen_next": 19,
        "valid_outgoing_next_nodes": [18, 19]
      },
      "mc_samples": 300,
      "createdAt": "2026-01-25T10:30:00.000Z"
    }
  },
  {
    "truck_id": 1,
    "gps": { /* ... */ },
    "sensor": { /* ... */ },
    "decision": { /* ... */ }
  }
  // ... more trucks
]
```

### 2. GET `/api/fleet?truckId=5` - Get Specific Truck Data

Returns latest data for a single truck.

**Response:**
```json
{
  "truck_id": 5,
  "gps": {
    "truck_id": 5,
    "latitude": 37.08,
    "longitude": -121.94,
    "speed_mph": 51.28,
    "timestamp": "2026-02-24T22:08:07.879Z"
  },
  "sensor": {
    "truck_id": 5,
    "temperature_c": 40.45,
    "humidity_pct": 95.0,
    "door_open": true,
    "shipment_value": 34738.34,
    "timestamp": "2026-02-24T22:08:07.879Z"
  },
  "decision": {
    "truck_id": 5,
    "recommended_action": "continue",
    "mean_cost": 12350.23,
    "timestamp": "2026-02-24T21:54:25.600Z"
  }
}
```

### 3. GET `/api/fleet/history?truckId=5&type=gps&limit=10` - Get Historical Data

Returns historical GPS data for a truck (last 10 records).

**Response:**
```json
[
  {
    "id": 1001,
    "truck_id": 5,
    "timestamp": "2026-02-24T22:08:07.879Z",
    "latitude": 37.08,
    "longitude": -121.94,
    "speed_mph": 51.28,
    "current_node": 19
  },
  {
    "id": 1000,
    "truck_id": 5,
    "timestamp": "2026-02-24T22:07:07.879Z",
    "latitude": 37.07,
    "longitude": -121.93,
    "speed_mph": 52.15,
    "current_node": 18
  }
  // ... 8 more records
]
```

### 4. GET `/api/fleet/history?truckId=5` - Get All History Types

Returns all historical data types for a truck.

**Response:**
```json
{
  "gps": [
    { /* GPS record 1 */ },
    { /* GPS record 2 */ }
  ],
  "sensor": [
    { /* Sensor record 1 */ },
    { /* Sensor record 2 */ }
  ],
  "decision": [
    { /* Decision record 1 */ },
    { /* Decision record 2 */ }
  ]
}
```

### 5. GET `/api/fleet/stats` - Get Fleet Statistics

Returns aggregated statistics for the entire fleet.

**Response:**
```json
{
  "counts": {
    "trucks": 50,
    "gpsRecords": 15234,
    "sensorRecords": 15234,
    "decisionRecords": 8912
  },
  "timeRange": {
    "oldest": "2026-02-24T21:53:59.529Z",
    "newest": "2026-02-24T22:08:07.882Z"
  },
  "averages": {
    "temperature_c": 73.42,
    "humidity_pct": 93.87,
    "speed_mph": 49.23
  }
}
```

## Dashboard Integration Examples

### Example 1: Fetch All Trucks for Live Tracking

```typescript
// In your React component
useEffect(() => {
  async function fetchFleetData() {
    const response = await fetch('/api/fleet')
    const data = await response.json()
    
    // Update your dashboard state
    setTrucks(data)
  }
  
  fetchFleetData()
  
  // Poll every 60 seconds for new data
  const interval = setInterval(fetchFleetData, 60000)
  return () => clearInterval(interval)
}, [])
```

### Example 2: Fetch Specific Truck History

```typescript
async function fetchTruckHistory(truckId: number) {
  const response = await fetch(
    `/api/fleet/history?truckId=${truckId}&type=sensor&limit=100`
  )
  const sensorHistory = await response.json()
  
  // Use for telemetry graphs
  const temperatureData = sensorHistory.map(s => ({
    timestamp: s.timestamp,
    value: s.temperature_c
  }))
  
  setChartData(temperatureData)
}
```

### Example 3: Display Fleet Overview Stats

```typescript
async function fetchFleetStats() {
  const response = await fetch('/api/fleet/stats')
  const stats = await response.json()
  
  console.log(`Fleet size: ${stats.counts.trucks} trucks`)
  console.log(`Avg temperature: ${stats.averages.temperature_c.toFixed(1)}°C`)
  console.log(`Avg speed: ${stats.averages.speed_mph.toFixed(1)} mph`)
}
```

## Alert Detection Example

Based on sensor data, you can detect various alerts:

```typescript
function detectAlerts(sensorData) {
  const alerts = []
  
  // Temperature alerts
  if (sensorData.temperature_c > 100) {
    alerts.push({
      type: 'warning',
      message: 'High temperature detected',
      value: sensorData.temperature_c,
      threshold: 100
    })
  }
  
  // Humidity alerts
  if (sensorData.humidity_pct > 85) {
    alerts.push({
      type: 'warning',
      message: 'High humidity detected',
      value: sensorData.humidity_pct,
      threshold: 85
    })
  }
  
  // Door open alert
  if (sensorData.door_open) {
    alerts.push({
      type: 'info',
      message: 'Door is open',
    })
  }
  
  // Slack time violation
  if (sensorData.remaining_slack_min < 0) {
    alerts.push({
      type: 'error',
      message: 'Delivery behind schedule',
      value: Math.abs(sensorData.remaining_slack_min),
    })
  }
  
  return alerts
}
```

## Data Freshness

- **Current data**: CSVs contain historical snapshots
- **Streaming data** (future): New records will be inserted every minute
- **Polling strategy**: Recommended to poll `/api/fleet` every 30-60 seconds
- **WebSocket option**: For real-time updates, consider using WebSocket connections

## Database Schema

All data is stored in three main tables:

1. **gps_data**: Location and movement tracking
2. **sensor_data**: Environmental and cargo monitoring
3. **decision_data**: Route optimization recommendations

Indexes are created on `truck_id` and `timestamp` for efficient queries.
