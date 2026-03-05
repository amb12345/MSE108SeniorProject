# Render + Aiven PostgreSQL Integration

This guide walks you through deploying the MSE108 Fleet Track app to Render with an Aiven PostgreSQL database.

## Architecture

- **Frontend + API**: Next.js app deployed as a Web Service on Render
- **Database**: Aiven PostgreSQL (hosted separately)
- **Tables**: `test_fleet_gps`, `test_fleet_sensors`, `test_fleet_decisions`

## Prerequisites

1. **Aiven account** with a PostgreSQL service running
2. **Render account** (free tier works)
3. **GitHub repo** with this project pushed

## Step 1: Prepare Your Aiven Database

### Get your connection string

From Aiven Console → your PostgreSQL service → **Connection information**:

```
postgres://avnadmin:YOUR_PASSWORD@YOUR_HOST.aivencloud.com:PORT/defaultdb?sslmode=require
```

### Ensure tables exist

If you haven't run the import yet:

```bash
# Set your Aiven connection string, then run:
export DATABASE_URL="postgres://avnadmin:PASSWORD@HOST:PORT/defaultdb?sslmode=require"
npm run db:import-aiven
```

This creates `test_fleet_gps`, `test_fleet_sensors`, and `test_fleet_decisions`.

### SSL for production (optional)

For stricter SSL verification, use Aiven's CA certificate instead of `NODE_TLS_REJECT_UNAUTHORIZED=0`:

1. Download `ca.pem` from Aiven service overview
2. Add `?sslmode=verify-full` and configure `ssl: { ca: ... }` in your app

## Step 2: Deploy to Render

### Option A: Blueprint (render.yaml)

1. Push `render.yaml` to your repo
2. In Render: **Dashboard** → **New** → **Blueprint**
3. Connect your GitHub repo
4. Render will detect the blueprint and create the service
5. Add `DATABASE_URL` in the service’s **Environment**:
   - Key: `DATABASE_URL`
   - Value: your Aiven connection string (mark as **Secret**)

### Option B: Manual Web Service

1. In Render: **Dashboard** → **New** → **Web Service**
2. Connect your GitHub repo
3. Configure:
   - **Name**: `mse108-fleet-track` (or similar)
   - **Region**: Oregon (or your choice)
   - **Branch**: `main`
   - **Runtime**: Node
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`
4. Add environment variable:
   - Key: `DATABASE_URL`
   - Value: your Aiven connection string
   - Enable **Encrypt** (secret)

### Do not set for Render

- Do **not** set `NEXT_PUBLIC_BUILD_MODE=static` — that would use static export and disable API routes.

## Step 3: Deploy and verify

1. Trigger a deploy (Blueprint auto-deploys on connect; manual services deploy on first save)
2. When the build succeeds, open the Render URL
3. Fleet data should load from Aiven instead of mock data

## Environment variables summary

| Variable           | Required | Description                                             |
|--------------------|----------|---------------------------------------------------------|
| `DATABASE_URL`     | Yes      | Aiven PostgreSQL connection string                     |
| `NEXT_PUBLIC_BUILD_MODE` | No  | Leave unset for Render (server mode)                    |
| `NODE_ENV`         | Auto     | Set to `production` by Render                          |

## Troubleshooting

### "Failed to fetch fleet data"

- Confirm `DATABASE_URL` is set correctly in Render
- Ensure Aiven allows connections from Render IPs (usually unrestricted)
- Check Render logs for Prisma/DB errors

### "self-signed certificate in certificate chain"

- Render connects over SSL; Aiven’s cert may not verify by default
- Use the full Aiven connection string with `sslmode=require`
- If it still fails, consider adding Aiven’s CA cert and `verify-full` (see SSL section above)

### Tables missing

Run the import locally against your Aiven URL:

```bash
DATABASE_URL="postgres://avnadmin:PASSWORD@HOST:PORT/defaultdb?sslmode=require" npm run db:import-aiven
```

### Static vs database mode

- **GitHub Pages** (static): `NEXT_PUBLIC_BUILD_MODE=static` → mock data, no API
- **Render** (server): no `NEXT_PUBLIC_BUILD_MODE` → API routes use Aiven DB

## Re-importing data

To refresh data from CSV files into Aiven:

```bash
DATABASE_URL="your-aiven-uri" npm run db:import-aiven
```

Note: The import script inserts new rows; it does not clear existing rows. To fully reset, drop and recreate tables in Aiven or via a migration script.
