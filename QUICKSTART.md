# Quick Start Guide

## Overview

You now have a complete database infrastructure for your IBM Fleet Management dashboard. Here's how to get started:

## Prerequisites

- Node.js 18+ installed
- PostgreSQL installed (or use a hosted database service)
- CSV data files in the `data/` folder

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

#### Option A: Local PostgreSQL (Recommended for Development)

```bash
# Start PostgreSQL (macOS with Homebrew)
brew services start postgresql@15

# Create database
createdb fleet_management

# Create .env file
echo 'DATABASE_URL="postgresql://$(whoami)@localhost:5432/fleet_management?schema=public"' > .env
```

#### Option B: Hosted Database (Supabase, Neon, Railway)

1. Create a PostgreSQL database on your preferred provider
2. Copy the connection string
3. Create `.env` file:

```bash
echo 'DATABASE_URL="your-connection-string-here"' > .env
```

### 3. Initialize Database and Import Data

```bash
npm run db:setup
```

This will:
- Generate Prisma client
- Create database tables
- Import all CSV data

**Expected output:**
```
🚀 Starting CSV import process...
📍 Importing GPS data...
✅ GPS Data: 15234 imported, 0 skipped
🌡️  Importing sensor data...
✅ Sensor Data: 15234 imported, 0 skipped
🎯 Importing decision data...
✅ Decision Data: 8912 imported, 0 skipped

📊 Import Summary:
   GPS Records: 15234
   Sensor Records: 15234
   Decision Records: 8912
   Unique Trucks: 50
```

### 4. Verify Import

```bash
npm run db:studio
```

Opens Prisma Studio at http://localhost:5555 where you can browse your data.

### 5. Run Development Server with Database

```bash
npm run dev:db
```

Opens at http://localhost:3001

## Using the API

### Fetch All Fleet Data

```bash
curl http://localhost:3001/api/fleet
```

### Fetch Specific Truck

```bash
curl http://localhost:3001/api/fleet?truckId=1
```

### Fetch Historical Data

```bash
curl "http://localhost:3001/api/fleet/history?truckId=1&type=sensor&limit=10"
```

### Fetch Fleet Statistics

```bash
curl http://localhost:3001/api/fleet/stats
```

## Integrating with Dashboard

### Example: Live Tracking Page

```typescript
import { useFleetData } from '@/hooks/use-fleet-data'

export default function TrackingPage() {
  // Fetch all trucks, poll every 60 seconds
  const { data: trucks, loading, error } = useFleetData(undefined, 60000)
  
  if (loading) return <div>Loading fleet data...</div>
  if (error) return <div>Error: {error}</div>
  
  return (
    <div>
      {trucks?.map(truck => (
        <div key={truck.truck_id}>
          <h3>Truck {truck.truck_id}</h3>
          <p>Location: {truck.gps?.latitude}, {truck.gps?.longitude}</p>
          <p>Speed: {truck.gps?.speed_mph} mph</p>
          <p>Temperature: {truck.sensor?.temperature_c}°C</p>
        </div>
      ))}
    </div>
  )
}
```

### Example: Telemetry History

```typescript
import { useFleetHistory } from '@/hooks/use-fleet-data'

export default function TelemetryChart({ truckId }: { truckId: number }) {
  const { data: sensorHistory } = useFleetHistory(truckId, 'sensor', 100)
  
  // Convert to chart data
  const chartData = sensorHistory?.map(s => ({
    time: new Date(s.timestamp).toLocaleTimeString(),
    temperature: s.temperature_c,
    humidity: s.humidity_pct
  }))
  
  return <YourChartComponent data={chartData} />
}
```

## Deployment Options

### Static Site (Current - GitHub Pages)

Your current setup exports a static site. To keep using this:

1. Keep API calls in a **separate backend** (e.g., Vercel serverless functions, AWS Lambda)
2. Update API endpoints in frontend to point to your backend URL
3. Build: `npm run build:static`

### Full-Stack Deployment (Recommended for Database Integration)

Deploy the entire Next.js app with API routes:

**Vercel (Easiest):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable
vercel env add DATABASE_URL
```

**Railway:**
1. Connect GitHub repo
2. Add PostgreSQL service
3. Set `DATABASE_URL` environment variable
4. Deploy automatically

**Other platforms:** AWS Amplify, Netlify, Render, Fly.io

## Streaming Data (Future)

When you have real-time streaming data:

### 1. Create an Ingestion Endpoint

```typescript
// app/api/ingest/route.ts
import { prisma } from '@/lib/db'

export async function POST(request: Request) {
  const { gps, sensor, decision } = await request.json()
  
  // Insert new data
  await Promise.all([
    prisma.gpsData.create({ data: gps }),
    prisma.sensorData.create({ data: sensor }),
    decision && prisma.decisionData.create({ data: decision })
  ])
  
  return Response.json({ success: true })
}
```

### 2. Send Data from Your Streaming Source

```bash
curl -X POST http://your-domain.com/api/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "gps": { "truck_id": 1, "latitude": 37.08, ... },
    "sensor": { "truck_id": 1, "temperature_c": 72, ... }
  }'
```

### 3. Dashboard Auto-Updates

The `useFleetData` hook already polls every 60 seconds. Adjust as needed:

```typescript
// Poll every 30 seconds
const { data } = useFleetData(undefined, 30000)

// Poll every 5 minutes for stats
const { stats } = useFleetStats(300000)
```

## Troubleshooting

### Can't connect to database
```bash
# Test connection
psql $DATABASE_URL

# Or use Prisma
npx prisma db pull
```

### Import fails
```bash
# Check CSV files exist
ls -lh data/*.csv

# Try importing one file at a time (edit scripts/import-csv.ts)
```

### API returns 404
Make sure you're using:
```bash
npm run dev:db
```
Not just `npm run dev` (which uses static export config).

### Memory issues during import
Reduce batch size or increase Node memory:
```bash
NODE_OPTIONS=--max-old-space-size=4096 npm run db:import
```

## Next Steps

1. ✅ Database infrastructure set up
2. ✅ CSV data imported
3. ✅ API endpoints created
4. 🔄 Update dashboard components to use real data
5. 🔄 Set up streaming data ingestion (when available)
6. 🔄 Deploy to production

Need help? Check:
- `DATABASE_SETUP.md` - Detailed database configuration
- `SAMPLE_OUTPUT.md` - API response examples
- `DEPLOYMENT.md` - GitHub Pages deployment (static site)
