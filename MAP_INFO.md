# Fleet Map - OpenStreetMap Integration

Your dashboard now uses **OpenStreetMap** with **Leaflet** for the live fleet tracking map.

## Why OpenStreetMap?

✅ **100% Free** - No API keys, no usage limits, no costs
✅ **No Setup Required** - Works immediately out of the box
✅ **High Quality** - Real topography, roads, cities, and geographic features
✅ **Open Source** - Maintained by a global community
✅ **Production Ready** - Used by major companies worldwide

## Features

- **Real-time truck tracking** - Shows exact GPS locations from your telemetry data
- **Interactive markers** - Click any truck to see detailed information
- **Color-coded status** - Green (active), Blue (transit), Orange (idle), Red (maintenance)
- **Auto-zoom** - Automatically fits all trucks in view
- **Popup details** - Shows truck name, driver, status, speed, and coordinates
- **Legend** - Status guide in bottom-left corner

## How It Works

The map:
1. Reads GPS coordinates from your `telemetryData`
2. Displays trucks at their exact locations
3. Updates colors based on speed/status
4. Shows real map tiles from OpenStreetMap servers

## No Configuration Needed

The map works immediately - no API keys or setup required!

Just run your development server:
```bash
npm run dev
```

That's it! Your fleet tracking map is ready to use.
