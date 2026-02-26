# Dashboard Integration Examples

This document shows how to integrate database data into your existing dashboard components.

## Configuration

Edit `/lib/use-data-source.ts` to switch between mock and database data:

```typescript
// Use database data (requires running npm run dev:db)
export const DATA_SOURCE: 'database' | 'mock' = 'database'

// Use mock data (works with static export)
export const DATA_SOURCE: 'database' | 'mock' = 'mock'
```

## Example 1: Live Tracking Page with Database

Here's how to modify `/components/dashboard/tracking.tsx` to use database data:

### Current Mock Data Approach

```typescript
// Current approach (using lib/data.ts)
import { trucksData } from '@/lib/data'

export default function Tracking() {
  const [trucks] = useState(trucksData)
  // ...
}
```

### New Database Approach

```typescript
import { useFleetData } from '@/hooks/use-fleet-data'
import { trucksData } from '@/lib/data'
import { DATA_SOURCE } from '@/lib/use-data-source'

export default function Tracking() {
  // Fetch from database (polls every 60 seconds)
  const { data: dbTrucks, loading, error } = useFleetData(undefined, 60000)
  
  // Use database data if available, otherwise fall back to mock data
  const trucks = DATA_SOURCE === 'database' && dbTrucks 
    ? transformDatabaseToTruckFormat(dbTrucks)
    : trucksData
  
  // Show loading state for database
  if (DATA_SOURCE === 'database' && loading) {
    return <div>Loading real-time fleet data...</div>
  }
  
  // Show error state
  if (DATA_SOURCE === 'database' && error) {
    console.error('Database error:', error)
    // Fall back to mock data
  }
  
  // Rest of your component code stays the same
  // ...
}

// Helper to transform database format to your current truck format
function transformDatabaseToTruckFormat(dbTrucks: any[]) {
  return dbTrucks.map(truck => ({
    id: truck.truck_id,
    name: `Truck ${truck.truck_id}`,
    lat: truck.gps?.latitude || 0,
    lng: truck.gps?.longitude || 0,
    speed: truck.gps?.speed_mph || 0,
    temperature: truck.sensor?.temperature_c || 0,
    humidity: truck.sensor?.humidity_pct || 0,
    status: determineStatus(truck),
    // ... map other fields
  }))
}

function determineStatus(truck: any) {
  if (!truck.sensor) return 'active'
  
  // Determine status based on sensor data
  if (truck.sensor.temperature_c > 100) return 'warning'
  if (truck.sensor.humidity_pct > 85) return 'warning'
  if (truck.sensor.remaining_slack_min < 0) return 'warning'
  
  return 'active'
}
```

## Example 2: Telemetry Graph with Historical Data

Update your telemetry component to fetch historical sensor data:

```typescript
import { useFleetHistory } from '@/hooks/use-fleet-data'
import { DATA_SOURCE } from '@/lib/use-data-source'

export default function TelemetryGraph({ truckId }: { truckId: number }) {
  const { data: sensorHistory } = useFleetHistory(
    truckId, 
    'sensor', 
    100 // Last 100 readings
  )
  
  // Transform to chart format
  const chartData = DATA_SOURCE === 'database' && sensorHistory
    ? sensorHistory.map((s: any) => ({
        time: new Date(s.timestamp).toLocaleTimeString(),
        temperature: s.temperature_c,
        humidity: s.humidity_pct,
      }))
    : mockChartData // Your existing mock data
  
  return (
    <AreaChart data={chartData}>
      {/* Your existing chart configuration */}
    </AreaChart>
  )
}
```

## Example 3: Overview Statistics

Update the overview page to show real fleet statistics:

```typescript
import { useFleetStats } from '@/hooks/use-fleet-data'
import { DATA_SOURCE } from '@/lib/use-data-source'

export default function Overview() {
  const { stats, loading } = useFleetStats(300000) // Poll every 5 minutes
  
  const displayStats = DATA_SOURCE === 'database' && stats
    ? {
        totalTrucks: stats.counts.trucks,
        avgTemperature: stats.averages.temperature_c.toFixed(1),
        avgSpeed: stats.averages.speed_mph.toFixed(1),
        dataPoints: stats.counts.gpsRecords,
      }
    : {
        // Your existing mock stats
        totalTrucks: 50,
        avgTemperature: '72.5',
        avgSpeed: '48.3',
        dataPoints: 15000,
      }
  
  return (
    <div>
      <Card>
        <CardHeader>Fleet Overview</CardHeader>
        <CardContent>
          <p>Total Trucks: {displayStats.totalTrucks}</p>
          <p>Avg Temperature: {displayStats.avgTemperature}°C</p>
          <p>Avg Speed: {displayStats.avgSpeed} mph</p>
          <p>Total Data Points: {displayStats.dataPoints}</p>
        </CardContent>
      </Card>
    </div>
  )
}
```

## Example 4: Alert Detection from Real Data

Generate alerts automatically from database sensor readings:

```typescript
import { useFleetData } from '@/hooks/use-fleet-data'

export default function AlertsPanel() {
  const { data: trucks } = useFleetData(undefined, 60000)
  
  // Generate alerts from real sensor data
  const alerts = React.useMemo(() => {
    if (!trucks || !Array.isArray(trucks)) return []
    
    const detectedAlerts: any[] = []
    
    trucks.forEach(truck => {
      const { truck_id, sensor } = truck
      
      if (!sensor) return
      
      // Temperature alert
      if (sensor.temperature_c > 100) {
        detectedAlerts.push({
          id: `temp-${truck_id}-${Date.now()}`,
          truckId: truck_id,
          type: 'temperature',
          severity: 'high',
          message: `High temperature: ${sensor.temperature_c.toFixed(1)}°C`,
          timestamp: sensor.timestamp,
        })
      }
      
      // Humidity alert
      if (sensor.humidity_pct > 85) {
        detectedAlerts.push({
          id: `humidity-${truck_id}-${Date.now()}`,
          truckId: truck_id,
          type: 'humidity',
          severity: 'medium',
          message: `High humidity: ${sensor.humidity_pct.toFixed(1)}%`,
          timestamp: sensor.timestamp,
        })
      }
      
      // Slack time alert
      if (sensor.remaining_slack_min < 0) {
        detectedAlerts.push({
          id: `delay-${truck_id}-${Date.now()}`,
          truckId: truck_id,
          type: 'delay',
          severity: 'high',
          message: `Behind schedule by ${Math.abs(sensor.remaining_slack_min).toFixed(0)} min`,
          timestamp: sensor.timestamp,
        })
      }
      
      // Door open alert
      if (sensor.door_open) {
        detectedAlerts.push({
          id: `door-${truck_id}-${Date.now()}`,
          truckId: truck_id,
          type: 'door',
          severity: 'low',
          message: 'Door is open',
          timestamp: sensor.timestamp,
        })
      }
    })
    
    return detectedAlerts
  }, [trucks])
  
  return (
    <div>
      <h3>Active Alerts: {alerts.length}</h3>
      {alerts.map(alert => (
        <Alert key={alert.id} variant={alert.severity}>
          <AlertTitle>Truck {alert.truckId}</AlertTitle>
          <AlertDescription>{alert.message}</AlertDescription>
        </Alert>
      ))}
    </div>
  )
}
```

## Example 5: Route Decision Recommendations

Display route recommendations from decision data:

```typescript
import { useFleetData } from '@/hooks/use-fleet-data'

export default function RouteRecommendations({ truckId }: { truckId: number }) {
  const { data: truckData } = useFleetData(truckId, 60000)
  
  const decision = truckData?.decision
  
  if (!decision) return null
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Route Recommendation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="font-medium">Recommended Action:</p>
            <Badge variant={decision.recommended_action === 'continue' ? 'default' : 'warning'}>
              {decision.recommended_action.toUpperCase()}
            </Badge>
          </div>
          
          <div>
            <p className="font-medium">Expected Cost:</p>
            <p className="text-2xl">${decision.mean_cost.toFixed(2)}</p>
          </div>
          
          <div>
            <p className="font-medium">Route Info:</p>
            <p>Current Node: {decision.route.current_node}</p>
            <p>Next Node: {decision.route.chosen_next}</p>
          </div>
          
          {decision.all_actions && (
            <div>
              <p className="font-medium">Alternative Actions:</p>
              {decision.all_actions.map((action: any, i: number) => (
                <div key={i} className="p-2 border rounded mt-2">
                  <p>Action: {action.action}</p>
                  <p>Cost: ${action.mean_cost.toFixed(2)}</p>
                  <p>Travel Time: {action.edge_travel_time_min} min</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

## Gradual Migration Strategy

You can migrate to database data gradually:

### Step 1: Start with Overview/Stats
- Easiest to implement
- Low impact if something goes wrong
- Good way to test database connection

### Step 2: Add Live Tracking
- Shows real truck positions
- Most visible feature for users
- Requires map integration

### Step 3: Integrate Telemetry History
- More complex data transformation
- Need to handle time series data
- Good for performance monitoring

### Step 4: Enable Real-time Alerts
- Requires continuous monitoring
- Most critical for operations
- Should be last to ensure stability

## Testing Both Data Sources

Keep both working by using the `DATA_SOURCE` constant:

```typescript
// Development: Use database
export const DATA_SOURCE = 'database'

// Production (static): Use mock
export const DATA_SOURCE = 'mock'
```

Or use environment variable:

```typescript
export const DATA_SOURCE = 
  process.env.NEXT_PUBLIC_USE_DATABASE === 'true' 
    ? 'database' 
    : 'mock'
```

## Performance Tips

1. **Poll Intervals:**
   - GPS data: 30-60 seconds
   - Sensor data: 60 seconds
   - Stats: 5 minutes
   - Decisions: 60 seconds

2. **Caching:**
   - Use React Query or SWR for better caching
   - Consider implementing stale-while-revalidate

3. **Lazy Loading:**
   - Load historical data only when viewing specific trucks
   - Don't fetch all history on page load

4. **Pagination:**
   - Limit API responses to necessary data
   - Use `limit` parameter in queries

## Error Handling

Always provide fallbacks:

```typescript
const trucks = (() => {
  if (DATA_SOURCE === 'database') {
    if (error) {
      console.error('Database error, using mock data:', error)
      return trucksData
    }
    if (dbTrucks) {
      return transformDatabaseToTruckFormat(dbTrucks)
    }
  }
  return trucksData
})()
```

This ensures your dashboard always works, even if the database is unavailable.
