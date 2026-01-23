"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FleetMap } from "./fleet-map"
import { Route, Clock, Ruler, Fuel, Leaf, DollarSign, AlertTriangle, Zap, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const locations = [
  "New York, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Houston, TX",
  "Phoenix, AZ",
  "Philadelphia, PA",
  "San Antonio, TX",
  "San Diego, CA",
  "Dallas, TX",
  "Denver, CO",
]

const routeOptions = [
  {
    id: "fastest",
    name: "Fastest",
    icon: Zap,
    time: "8h 45m",
    distance: "542 mi",
    cost: "$245",
    carbon: "156 kg",
    risk: "Medium",
    selected: true,
  },
  {
    id: "min-risk",
    name: "Min Risk",
    icon: AlertTriangle,
    time: "9h 30m",
    distance: "578 mi",
    cost: "$268",
    carbon: "168 kg",
    risk: "Low",
    selected: false,
  },
  {
    id: "cost",
    name: "Lowest Cost",
    icon: DollarSign,
    time: "10h 15m",
    distance: "612 mi",
    cost: "$198",
    carbon: "178 kg",
    risk: "Medium",
    selected: false,
  },
  {
    id: "green",
    name: "Eco-Friendly",
    icon: Leaf,
    time: "9h 50m",
    distance: "595 mi",
    cost: "$232",
    carbon: "128 kg",
    risk: "Low",
    selected: false,
  },
]

const pastRoutes = [
  { id: "R001", from: "Chicago", to: "Denver", date: "Jan 18", time: "7h 32m", distance: "498 mi" },
  { id: "R002", from: "Dallas", to: "Houston", date: "Jan 17", time: "3h 45m", distance: "239 mi" },
  { id: "R003", from: "LA", to: "Phoenix", date: "Jan 16", time: "5h 12m", distance: "372 mi" },
  { id: "R004", from: "NY", to: "Philadelphia", date: "Jan 15", time: "1h 58m", distance: "95 mi" },
]

const routePoints = [
  { lat: 30, lng: 20 },
  { lat: 35, lng: 35 },
  { lat: 40, lng: 50 },
  { lat: 50, lng: 65 },
  { lat: 60, lng: 75 },
]

export function RouteAnalytics() {
  const [fromLocation, setFromLocation] = useState("New York, NY")
  const [toLocation, setToLocation] = useState("Los Angeles, CA")
  const [selectedOption, setSelectedOption] = useState("fastest")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Route Analytics</h1>
        <Badge variant="outline" className="text-sm">
          Route Optimizer v2.1
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Route Selection */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center gap-2">
              <Route className="h-5 w-5" />
              Plan Route
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">From</label>
              <Select value={fromLocation} onValueChange={setFromLocation}>
                <SelectTrigger className="bg-secondary border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {locations.map((location) => (
                    <SelectItem key={location} value={location} className="text-card-foreground">
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                <ArrowRight className="h-4 w-4 text-muted-foreground rotate-90" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">To</label>
              <Select value={toLocation} onValueChange={setToLocation}>
                <SelectTrigger className="bg-secondary border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {locations.map((location) => (
                    <SelectItem key={location} value={location} className="text-card-foreground">
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4">
              <p className="text-sm font-medium text-card-foreground mb-3">Optimize for</p>
              <div className="grid grid-cols-2 gap-2">
                {routeOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedOption(option.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg p-3 transition-colors border",
                      selectedOption === option.id
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-secondary/50 border-transparent text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    <option.icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{option.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
              Calculate Route
            </Button>
          </CardContent>
        </Card>

        {/* Route Map */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-card-foreground">Route Map</CardTitle>
          </CardHeader>
          <CardContent>
            <FleetMap showRoute routePoints={routePoints} />
          </CardContent>
        </Card>
      </div>

      {/* Route Options Comparison */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Route Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {routeOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedOption(option.id)}
                className={cn(
                  "rounded-lg p-4 text-left transition-all border",
                  selectedOption === option.id
                    ? "bg-primary/10 border-primary"
                    : "bg-secondary/30 border-transparent hover:bg-secondary/50"
                )}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg",
                      selectedOption === option.id ? "bg-primary" : "bg-secondary"
                    )}
                  >
                    <option.icon
                      className={cn(
                        "h-4 w-4",
                        selectedOption === option.id ? "text-primary-foreground" : "text-muted-foreground"
                      )}
                    />
                  </div>
                  <span className="font-medium text-card-foreground">{option.name}</span>
                  {selectedOption === option.id && (
                    <Badge className="ml-auto bg-primary text-primary-foreground">Selected</Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" /> Time
                    </span>
                    <span className="text-card-foreground">{option.time}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Ruler className="h-3.5 w-3.5" /> Distance
                    </span>
                    <span className="text-card-foreground">{option.distance}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <DollarSign className="h-3.5 w-3.5" /> Cost
                    </span>
                    <span className="text-card-foreground">{option.cost}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Leaf className="h-3.5 w-3.5" /> Carbon
                    </span>
                    <span className="text-card-foreground">{option.carbon}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <AlertTriangle className="h-3.5 w-3.5" /> Risk
                    </span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        option.risk === "Low"
                          ? "text-success border-success"
                          : "text-warning border-warning"
                      )}
                    >
                      {option.risk}
                    </Badge>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Past Routes */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Recent Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {pastRoutes.map((route) => (
              <div
                key={route.id}
                className="flex items-center justify-between rounded-lg bg-secondary/30 p-3 hover:bg-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                    <Route className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-card-foreground">
                      {route.from} → {route.to}
                    </p>
                    <p className="text-xs text-muted-foreground">{route.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-right">
                    <p className="text-muted-foreground">Time</p>
                    <p className="font-medium text-card-foreground">{route.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">Distance</p>
                    <p className="font-medium text-card-foreground">{route.distance}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
