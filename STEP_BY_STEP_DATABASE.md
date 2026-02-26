# Step-by-Step: Switch to Database Data

Follow these steps to connect your dashboard to a real database.

---

## Step 1: Choose Your Database Option

### Option A: Local PostgreSQL (Best for Learning)

**Install PostgreSQL on macOS:**
```bash
# Using Homebrew
brew install postgresql@15

# Start PostgreSQL
brew services start postgresql@15
```

**Create the database:**
```bash
# Create database
createdb fleet_management

# Test connection
psql fleet_management
# Type \q to exit
```

### Option B: Hosted Database (Easiest - Recommended)

**Using Supabase (Free):**

1. Go to https://supabase.com
2. Click "Start your project"
3. Create a new account (free)
4. Click "New project"
5. Fill in:
   - Name: `fleet-management`
   - Database Password: (create a strong password)
   - Region: Choose closest to you
6. Click "Create new project" (wait 2-3 minutes)
7. Go to Settings → Database
8. Copy the "Connection string" (URI format)
   - It looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.[project].supabase.co:5432/postgres`

**Using Neon (Free):**

1. Go to https://neon.tech
2. Sign up (free)
3. Click "Create a project"
4. Copy the connection string

---

## Step 2: Create Environment File

In your project root (`/Users/Amber/MSE108SeniorProject/`), create a `.env` file:

```bash
# In Terminal, run:
touch .env
```

Then open `.env` in your editor and add:

### If using Local PostgreSQL:
```env
DATABASE_URL="postgresql://YOUR_USERNAME@localhost:5432/fleet_management?schema=public"
```

Replace `YOUR_USERNAME` with your Mac username (run `whoami` to see it).

### If using Supabase/Neon:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres"
```

Paste the connection string you copied from Supabase/Neon.

**Save the file!**

---

## Step 3: Install Dependencies (Already Done)

You already have everything installed, but to verify:

```bash
npm install
```

---

## Step 4: Set Up Database Schema

Run these commands in order:

```bash
# 1. Generate Prisma client
npm run db:generate

# 2. Create database tables
npm run db:push
```

**Expected output:**
```
✔ Generated Prisma Client
Your database is now in sync with your schema.
```

---

## Step 5: Import CSV Data

```bash
npm run db:import
```

**This will take a few minutes.** You should see:

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

**Troubleshooting:**
- If it fails, check your `DATABASE_URL` in `.env`
- Make sure PostgreSQL is running (if using local)
- Try `npm run db:push` again

---

## Step 6: Verify Database Has Data

```bash
npm run db:test
```

You should see statistics about your data:

```
✅ Database connection successful!

📊 Record Counts:
   GPS Records: 15234
   Sensor Records: 15234
   Decision Records: 8912

🚚 Total Trucks: 50
   Truck IDs: 0, 1, 2, 3, ...

📍 Sample GPS Data (Truck 0):
   Location: 37.08, -121.94
   Speed: 45.37 mph
   ...
```

---

## Step 7: Switch Dashboard to Use Database

Open `/Users/Amber/MSE108SeniorProject/lib/use-data-source.ts`

Change this line:
```typescript
export const DATA_SOURCE: 'database' | 'mock' = 'mock'
```

To:
```typescript
export const DATA_SOURCE: 'database' | 'mock' = 'database'
```

**Save the file!**

---

## Step 8: Run Dashboard with Database

```bash
npm run dev:db
```

**Important:** Use `npm run dev:db` (NOT just `npm run dev`)

This enables the API routes needed for database access.

---

## Step 9: Open Your Dashboard

Go to: **http://localhost:3001**

You should see:
- ✅ **"Connected to Database"** badge in green at the top
- 🟢 Live pulsing dot
- Real numbers from your CSV data
- Alert counts based on actual sensor readings

---

## Step 10: Verify It's Working

Check these indicators:

### 1. Dashboard Header
Look for: **"Connected to Database"** with a green pulsing dot

### 2. Data Points Card
Should say: **"Live from DB"** instead of "Live telemetry"

### 3. Route Status
Should show actual active trucks vs completed based on destination

### 4. Alerts
Should show aggregated count from sensor data

### 5. Check Browser Console
Press `F12` → Console tab
- Should see no errors
- May see API calls to `/api/fleet` and `/api/fleet/stats`

---

## Troubleshooting

### "Cannot connect to database"

**Check 1:** Verify `.env` file exists
```bash
cat .env
```

**Check 2:** Test database connection
```bash
npm run db:test
```

**Check 3:** If using local PostgreSQL, ensure it's running
```bash
brew services list | grep postgresql
```

### "API route not found (404)"

**Solution:** Make sure you're using:
```bash
npm run dev:db
```

NOT just `npm run dev`

### "Still showing mock data"

**Solution:**
1. Check `/lib/use-data-source.ts` - make sure it says `'database'`
2. Hard refresh browser: `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)
3. Restart dev server: Stop with `Ctrl+C`, then `npm run dev:db`

### "Empty data or zeros"

**Solution:** Re-import data
```bash
npm run db:import
```

---

## Quick Reference

### Commands

```bash
# Set up database (one-time)
npm run db:setup

# Test database connection
npm run db:test

# View data in GUI
npm run db:studio

# Run dashboard with database
npm run dev:db

# Run dashboard with mock data
npm run dev
```

### Files to Edit

```
/lib/use-data-source.ts     → Switch between 'mock' and 'database'
/.env                        → Database connection string
```

---

## What's Next?

Once you have the database working:

1. **View your data:** Run `npm run db:studio` to see all data in a GUI
2. **Test streaming:** When real-time data arrives, POST to `/api/ingest` endpoint
3. **Update other pages:** Use patterns from `INTEGRATION_EXAMPLE.md`
4. **Deploy:** Follow `QUICKSTART.md` to deploy to Vercel with database

---

## Need Help?

### Can't install PostgreSQL?
→ Use Supabase (completely free, no installation needed)

### Import taking too long?
→ Normal for 30,000+ records, can take 5-10 minutes

### Want to reset everything?
```bash
# Delete all data and start over
npm run db:push -- --force-reset
npm run db:import
```

### Want to go back to mock data?
1. Edit `/lib/use-data-source.ts` → change to `'mock'`
2. Use `npm run dev` (not `npm run dev:db`)
