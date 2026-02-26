# Database Setup Guide

This guide explains how to set up the database infrastructure for your IBM Fleet Management dashboard.

## Overview

The system is designed to:
1. **Load CSV data** into a PostgreSQL database
2. **Stream real-time data** (future: data will be inserted as it arrives every minute)
3. **Query data** via API endpoints
4. **Display data** in the dashboard automatically

## Data Structure

You have three types of data:

### 1. GPS Data (`fleet.gps.csv`)
- Location tracking (latitude, longitude)
- Speed information
- Route progress (nodes, edges)

### 2. Sensor Data (`fleet sensors.csv`)
- Temperature and humidity readings
- Door status (open/closed)
- Shipment value and slack time
- Violation tracking

### 3. Decision Data (`fleet decisions.csv`)
- Route recommendations (continue/reroute)
- Cost analysis (mean_cost, cost_components)
- Route information
- Monte Carlo samples

## Setup Options

### Option 1: Local PostgreSQL (Recommended for Development)

#### Step 1: Install PostgreSQL

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Windows:**
Download from https://www.postgresql.org/download/windows/

**Linux:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE fleet_management;
CREATE USER fleet_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE fleet_management TO fleet_user;

# Exit psql
\q
```

#### Step 3: Configure Environment

Create `.env` file in project root:

```env
DATABASE_URL="postgresql://fleet_user:your_secure_password@localhost:5432/fleet_management?schema=public"
```

#### Step 4: Initialize Database Schema

```bash
npx prisma generate
npx prisma db push
```

#### Step 5: Import CSV Data

```bash
npx ts-node scripts/import-csv.ts
```

### Option 2: Hosted PostgreSQL (Recommended for Production)

Use a cloud database provider:

#### Supabase (Free tier available)
1. Go to https://supabase.com
2. Create new project
3. Get connection string from Settings → Database
4. Add to `.env` as `DATABASE_URL`

#### Neon (Free tier available)
1. Go to https://neon.tech
2. Create new project
3. Copy connection string
4. Add to `.env` as `DATABASE_URL`

#### Railway (Free tier available)
1. Go to https://railway.app
2. Create new PostgreSQL database
3. Copy connection string
4. Add to `.env` as `DATABASE_URL`

Then run:
```bash
npx prisma generate
npx prisma db push
npx ts-node scripts/import-csv.ts
```

### Option 3: SQLite (Simplest, Local Only)

For quick local testing without PostgreSQL:

#### Step 1: Update `prisma/schema.prisma`

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

#### Step 2: Remove DATABASE_URL requirement

Create `.env`:
```env
DATABASE_URL="file:./dev.db"
```

#### Step 3: Initialize and Import

```bash
npx prisma generate
npx prisma db push
npx ts-node scripts/import-csv.ts
```

**Note:** SQLite is simpler but not recommended for production with streaming data.

## Viewing Your Data

### Using Prisma Studio (GUI)

```bash
npx prisma studio
```

Opens a browser-based GUI at http://localhost:5555 to view and edit data.

### Using psql (PostgreSQL)

```bash
psql postgresql://fleet_user:password@localhost:5432/fleet_management

# Query examples:
SELECT COUNT(*) FROM gps_data;
SELECT truck_id, COUNT(*) FROM gps_data GROUP BY truck_id;
SELECT * FROM gps_data WHERE truck_id = 1 ORDER BY timestamp DESC LIMIT 10;
```

## Streaming Data Setup (Future)

Once you have streaming data coming in every minute, you'll need to:

### 1. Create an API endpoint to receive data

```typescript
// app/api/ingest/route.ts
export async function POST(request: Request) {
  const data = await request.json()
  
  // Validate and insert into database
  await prisma.gpsData.create({ data: data.gps })
  await prisma.sensorData.create({ data: data.sensor })
  
  return Response.json({ success: true })
}
```

### 2. Set up real-time updates in dashboard

Use polling or WebSockets to fetch new data:

```typescript
// Polling example (every 60 seconds)
useEffect(() => {
  const interval = setInterval(async () => {
    const data = await fetch('/api/fleet/latest')
    // Update dashboard state
  }, 60000)
  
  return () => clearInterval(interval)
}, [])
```

## Dashboard Integration

The dashboard is pre-configured to accept database data. After importing, you can:

1. Query data via API routes (see `app/api/fleet/route.ts`)
2. Use React hooks to fetch and update data
3. Display real-time metrics automatically

## Troubleshooting

### "Can't connect to database"
- Check DATABASE_URL is correct in `.env`
- Ensure PostgreSQL is running: `brew services list` (macOS)
- Test connection: `psql $DATABASE_URL`

### "Table doesn't exist"
- Run `npx prisma db push` to create tables
- Check migrations: `npx prisma migrate status`

### "Import script fails"
- Ensure CSV files are in `data/` folder
- Check file names match exactly
- Verify CSV format with `head data/fleet.gps.csv`

### "Out of memory"
- Import data in batches (modify script to process 1000 rows at a time)
- Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=4096`

## Next Steps

1. Choose your database option (Local PostgreSQL, hosted, or SQLite)
2. Follow the setup steps above
3. Run the import script
4. Test with Prisma Studio
5. Connect dashboard to database (I'll help with API routes next)
