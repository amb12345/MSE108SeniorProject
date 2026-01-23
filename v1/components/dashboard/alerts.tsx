"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, XCircle, Clock, Bell, Filter, Truck } from "lucide-react"
import { cn } from "@/lib/utils"

interface Alert {
  id: string
  type: "critical" | "warning" | "info" | "success"
  title: string
  message: string
  truck: string
  time: string
  acknowledged: boolean
}

const alertsData: Alert[] = [
  {
    id: "A001",
    type: "critical",
    title: "Engine Warning",
    message: "Engine temperature exceeding safe limits. Immediate attention required.",
    truck: "Truck 087",
    time: "12 min ago",
    acknowledged: false,
  },
  {
    id: "A002",
    type: "warning",
    title: "Low Fuel Level",
    message: "Fuel level at 15%. Recommend refueling within 50 miles.",
    truck: "Truck 102",
    time: "25 min ago",
    acknowledged: false,
  },
  {
    id: "A003",
    type: "warning",
    title: "Route Deviation",
    message: "Vehicle has deviated from planned route by 2.5 miles.",
    truck: "Truck 034",
    time: "38 min ago",
    acknowledged: false,
  },
  {
    id: "A004",
    type: "info",
    title: "Delivery Completed",
    message: "Package successfully delivered to Chicago Distribution Center.",
    truck: "Truck 145",
    time: "1 hour ago",
    acknowledged: true,
  },
  {
    id: "A005",
    type: "success",
    title: "Maintenance Complete",
    message: "Scheduled maintenance completed. Vehicle cleared for operation.",
    truck: "Truck 078",
    time: "2 hours ago",
    acknowledged: true,
  },
  {
    id: "A006",
    type: "warning",
    title: "Tire Pressure Low",
    message: "Rear left tire pressure at 28 PSI. Recommended: 35 PSI.",
    truck: "Truck 156",
    time: "3 hours ago",
    acknowledged: true,
  },
  {
    id: "A007",
    type: "info",
    title: "Rest Stop Required",
    message: "Driver has been active for 6 hours. Rest stop recommended.",
    truck: "Truck 023",
    time: "4 hours ago",
    acknowledged: true,
  },
]

const alertIcons = {
  critical: XCircle,
  warning: AlertTriangle,
  info: Clock,
  success: CheckCircle,
}

const alertColors = {
  critical: "text-destructive bg-destructive/10 border-destructive/30",
  warning: "text-warning bg-warning/10 border-warning/30",
  info: "text-accent bg-accent/10 border-accent/30",
  success: "text-success bg-success/10 border-success/30",
}

const badgeColors = {
  critical: "bg-destructive text-destructive-foreground",
  warning: "bg-warning text-foreground",
  info: "bg-accent text-accent-foreground",
  success: "bg-success text-foreground",
}

export function Alerts() {
  const [alerts, setAlerts] = useState(alertsData)
  const [filter, setFilter] = useState<string>("all")

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === "all") return true
    if (filter === "unacknowledged") return !alert.acknowledged
    return alert.type === filter
  })

  const handleAcknowledge = (id: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, acknowledged: true } : alert
      )
    )
  }

  const criticalCount = alerts.filter((a) => a.type === "critical" && !a.acknowledged).length
  const warningCount = alerts.filter((a) => a.type === "warning" && !a.acknowledged).length
  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Alerts Center</h1>
        <Badge variant="outline" className="text-sm">
          <Bell className="mr-1 h-3.5 w-3.5" />
          {unacknowledgedCount} Unread
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Alerts</p>
                <p className="text-2xl font-bold text-card-foreground">{alerts.length}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-destructive">{criticalCount}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold text-warning">{warningCount}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-success">
                  {alerts.filter((a) => a.acknowledged).length}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
          className={filter === "all" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}
        >
          All
        </Button>
        <Button
          variant={filter === "unacknowledged" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("unacknowledged")}
          className={filter === "unacknowledged" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}
        >
          Unread
        </Button>
        <Button
          variant={filter === "critical" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("critical")}
          className={filter === "critical" ? "bg-destructive text-destructive-foreground" : "text-muted-foreground"}
        >
          Critical
        </Button>
        <Button
          variant={filter === "warning" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("warning")}
          className={filter === "warning" ? "bg-warning text-foreground" : "text-muted-foreground"}
        >
          Warnings
        </Button>
        <Button
          variant={filter === "info" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("info")}
          className={filter === "info" ? "bg-accent text-accent-foreground" : "text-muted-foreground"}
        >
          Info
        </Button>
      </div>

      {/* Alerts List */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {filter === "all" ? "All Alerts" : filter.charAt(0).toUpperCase() + filter.slice(1)}
            <span className="text-muted-foreground font-normal">({filteredAlerts.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredAlerts.map((alert) => {
              const Icon = alertIcons[alert.type]
              return (
                <div
                  key={alert.id}
                  className={cn(
                    "flex items-start gap-4 rounded-lg border p-4 transition-colors",
                    alertColors[alert.type],
                    alert.acknowledged && "opacity-60"
                  )}
                >
                  <div className="mt-0.5">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-card-foreground">{alert.title}</p>
                      <Badge className={badgeColors[alert.type]} variant="secondary">
                        {alert.type}
                      </Badge>
                      {alert.acknowledged && (
                        <Badge variant="outline" className="text-success border-success">
                          Acknowledged
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Truck className="h-3.5 w-3.5" />
                        {alert.truck}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {alert.time}
                      </span>
                    </div>
                  </div>
                  {!alert.acknowledged && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAcknowledge(alert.id)}
                      className="shrink-0 text-card-foreground hover:bg-secondary"
                    >
                      Acknowledge
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
