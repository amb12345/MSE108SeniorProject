# Switching Between Mock and Database Data

Your dashboard now supports both **mock data** (for static demos) and **real database data** (for production use).

## Current Configuration

The data source is controlled by `/lib/use-data-source.ts`:

```typescript
export const DATA_SOURCE: 'database' | 'mock' = 'mock'
```

## How to Switch

### Option 1: Use Mock Data (Default - Works Everywhere)

```typescript
// /lib/use-data-source.ts
export const DATA_SOURCE: 'database' | 'mock' = 'mock'
```

**When to use:**
- GitHub Pages deployment
- Static site hosting
- Demo/presentation mode
- No database setup required

**Run with:**
```bash
npm run dev
# or
npm run build
```

### Option 2: Use Database Data (Real-Time)

```typescript
// /lib/use-data-source.ts
export const DATA_SOURCE: 'database' | 'mock' = 'database'
```

**When to use:**
- Local development with database
- Production deployment (Vercel, Railway, etc.)
- Real-time fleet monitoring
- When streaming data arrives

**Requirements:**
1. Database must be set up (PostgreSQL)
2. `.env` file with `DATABASE_URL`
3. Data imported via `npm run db:import`

**Run with:**
```bash
npm run dev:db
# This uses next.config.dev.mjs which enables API routes
```

## What Changes with Database Data

When `DATA_SOURCE = 'database'`:

### ✅ Overview Page (Updated)
- **Route Status**: Shows actual active trucks vs completed (based on destination reached)
- **Alerts**: Aggregates real alerts from sensor data:
  - Temperature > 100°C or < 0°C
  - Humidity > 85%
  - Door open
  - Behind schedule (remaining_slack_min < 0)
- **Avg Temperature**: Pulled directly from database (converted °C to °F)
- **Humidity Alerts**: Counts trucks with humidity > 85%
- **Avg Speed**: Calculated from all GPS records
- **Data Points**: Shows actual database record count

### 🔄 Live Tracking Page (Needs Update)
Currently uses mock data. To enable database:
1. Import `useFleetData` hook
2. Transform database format to match current truck structure
3. See `INTEGRATION_EXAMPLE.md` for code samples

### 🔄 Other Pages (Not Yet Updated)
- Alerts page
- Route Analytics page
- Settings page

These still use mock data. Follow patterns in `INTEGRATION_EXAMPLE.md` to update them.

## Visual Indicators

When database is active, you'll see:
- **"Connected to Database"** badge in dashboard header
- **"Live from DB"** indicator on data points card
- Green pulsing dot showing live connection

## Testing Both Modes

### Test Mock Data (No Database)
```bash
# Edit /lib/use-data-source.ts
export const DATA_SOURCE = 'mock'

# Run
npm run dev
```

Visit http://localhost:3001 - Should work immediately

### Test Database Data
```bash
# 1. Set up database (if not done)
npm run db:setup

# 2. Edit /lib/use-data-source.ts
export const DATA_SOURCE = 'database'

# 3. Run with API routes enabled
npm run dev:db
```

Visit http://localhost:3001 - Should show real data from database

## Deployment Strategy

### GitHub Pages (Static)
```typescript
// Keep as 'mock' for GitHub Pages
export const DATA_SOURCE = 'mock'
```
```bash
npm run build  # Uses next.config.mjs (static export)
```

### Vercel/Railway (Full-Stack)
```typescript
// Switch to 'database' for production
export const DATA_SOURCE = 'database'
```
```bash
vercel --prod
# Make sure DATABASE_URL is set in environment variables
```

## Troubleshooting

### "Data not loading from database"
1. Check `DATA_SOURCE` is set to `'database'`
2. Verify you're running `npm run dev:db` (not just `npm run dev`)
3. Confirm `.env` file has valid `DATABASE_URL`
4. Test database connection: `npm run db:studio`

### "API route not found (404)"
- You're running `npm run dev` which uses static export config
- Switch to `npm run dev:db` to enable API routes

### "Still seeing mock data"
- Clear browser cache
- Check browser console for errors
- Verify `DATA_SOURCE` in `/lib/use-data-source.ts`

## Current Dashboard Status

| Component | Mock Data | Database Data | Auto-Updates |
|-----------|-----------|---------------|--------------|
| Overview | ✅ | ✅ | ✅ (60s) |
| Live Tracking | ✅ | ❌ | ❌ |
| Alerts | ✅ | ❌ | ❌ |
| Route Analytics | ✅ | ❌ | ❌ |
| Fleet Map | ✅ | ❌ | ❌ |

See `INTEGRATION_EXAMPLE.md` to add database support to remaining pages.

## Quick Commands

```bash
# Use mock data (works everywhere)
npm run dev

# Use database data (requires database setup)
npm run dev:db

# View data in database
npm run db:studio

# Import CSV data
npm run db:import

# Build for GitHub Pages (static)
npm run build

# Build for Vercel/Railway (with API routes)
# Uses next.config.dev.mjs automatically
```
