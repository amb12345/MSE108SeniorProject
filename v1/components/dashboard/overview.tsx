"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck, AlertTriangle, DollarSign, TrendingUp, CheckCircle, Clock, XCircle } from "lucide-react"
import { FleetMap } from "./fleet-map"
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts"

const statusData = [
  { name: "Active", value: 45, color: "hsl(145, 60%, 45%)" },
  { name: "In Transit", value: 28, color: "hsl(250, 60%, 55%)" },
  { name: "Idle", value: 12, color: "hsl(35, 80%, 55%)" },
  { name: "Maintenance", value: 5, color: "hsl(0, 70%, 55%)" },
]

const costData = [
  { name: "Fuel", value: 45000 },
  { name: "Maintenance", value: 12000 },
  { name: "Insurance", value: 8000 },
  { name: "Labor", value: 35000 },
]

const alerts = [
  { id: 1, type: "warning", message: "Truck #102 fuel level low", time: "5 min ago" },
  { id: 2, type: "error", message: "Truck #087 engine warning", time: "12 min ago" },
  { id: 3, type: "info", message: "Truck #145 arrived at destination", time: "18 min ago" },
  { id: 4, type: "warning", message: "Truck #034 deviation from route", time: "25 min ago" },
]

export function Overview() {
  const totalTrucks = statusData.reduce((acc, item) => acc + item.value, 0)
  const activePercentage = Math.round((statusData[0].value / totalTrucks) * 100)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Trucks</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{totalTrucks}</div>
            <p className="text-xs text-muted-foreground">{activePercentage}% currently active</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">7</div>
            <p className="text-xs text-muted-foreground">3 critical, 4 warnings</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Monthly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">$100,000</div>
            <p className="text-xs text-success">-8% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">ROI</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">+24%</div>
            <p className="text-xs text-muted-foreground">Above target</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Fleet Status */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Fleet Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="ml-auto font-medium text-card-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Cost']}
                  />
                  <Bar dataKey="value" fill="hsl(250, 60%, 55%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex justify-between text-sm">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold text-card-foreground">
                ${costData.reduce((acc, item) => acc + item.value, 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Recent Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 rounded-lg bg-secondary/50 p-3"
                >
                  {alert.type === "warning" && (
                    <Clock className="h-4 w-4 shrink-0 text-warning mt-0.5" />
                  )}
                  {alert.type === "error" && (
                    <XCircle className="h-4 w-4 shrink-0 text-destructive mt-0.5" />
                  )}
                  {alert.type === "info" && (
                    <CheckCircle className="h-4 w-4 shrink-0 text-success mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-card-foreground truncate">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fleet Map */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Fleet Location Map</CardTitle>
        </CardHeader>
        <CardContent>
          <FleetMap />
        </CardContent>
      </Card>
    </div>
  )
}
