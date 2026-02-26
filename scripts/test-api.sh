#!/bin/bash

echo "🧪 Testing API Endpoints..."
echo ""

echo "📊 Fetching Fleet Data:"
curl -s http://localhost:3001/api/fleet | head -c 500
echo ""
echo ""

echo "📈 Fetching Fleet Stats:"
curl -s http://localhost:3001/api/fleet/stats
echo ""
echo ""

echo "✅ API test complete!"
