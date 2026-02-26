"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FleetMap } from "./fleet-map"
import { Route, Clock, Ruler, Fuel, Leaf, DollarSign, AlertTriangle, Zap, ArrowRight, ArrowDown, CheckCircle2, MapPin, Truck } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFleetData } from "@/hooks/use-fleet-data"
import { DATA_SOURCE } from "@/lib/use-data-source"

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
    color: "primary",
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
    color: "success",
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
    color: "warning",
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
    color: "success",
  },
]

const mockAvailableTrucks = [
  { id: "T1", name: "Truck 1", driver: "John Smith", status: "available" },
  { id: "T2", name: "Truck 2", driver: "Sarah Johnson", status: "available" },
  { id: "T3", name: "Truck 3", driver: "Mike Davis", status: "available" },
  { id: "T4", name: "Truck 4", driver: "Emily Brown", status: "available" },
]

const mockPastRoutes = [
  { id: "R001", from: "Chicago", to: "Denver", date: "Jan 18", time: "7h 32m", distance: "498 mi", status: "completed" as const, truck: "Truck 1", progress: 100 },
  { id: "R002", from: "Dallas", to: "Houston", date: "Jan 17", time: "3h 45m", distance: "239 mi", status: "in-progress" as const, truck: "Truck 2", progress: 65 },
  { id: "R003", from: "LA", to: "Phoenix", date: "Jan 16", time: "5h 12m", distance: "372 mi", status: "queued" as const, truck: "Truck 3", progress: 0 },
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
  const [selectedTruck, setSelectedTruck] = useState("")
  const [recentRoutes, setRecentRoutes] = useState(mockPastRoutes)
  
  // Fetch database fleet data
  const { data: dbFleetData, loading } = useFleetData(undefined, 60000)
  
  // Transform database trucks into available trucks format
  const availableTrucks = useMemo(() => {
    if (DATA_SOURCE === 'database' && dbFleetData && Array.isArray(dbFleetData)) {
      return dbFleetData.map((truck: any) => ({
        id: `T${truck.truck_id}`,
        name: `Truck ${truck.truck_id}`,
        driver: `Driver ${truck.truck_id}`,
        status: truck.gps?.at_node === true ? "available" : "in-transit",
        truck_id: truck.truck_id,
      }))
    }
    return mockAvailableTrucks
  }, [dbFleetData])
  
  // Generate route history from database
  const routeHistory = useMemo(() => {
    if (DATA_SOURCE === 'database' && dbFleetData && Array.isArray(dbFleetData)) {
      return dbFleetData.slice(0, 10).map((truck: any, index: number) => {
        const isCompleted = truck.gps?.at_node === true
        const isMoving = truck.gps?.speed_mph > 0
        
        let status: 'completed' | 'in-progress' | 'queued' = 'queued'
        let progress = 0
        
        if (isCompleted) {
          status = 'completed'
          progress = 100
        } else if (isMoving) {
          status = 'in-progress'
          progress = truck.gps?.edge_progress_frac ? Math.round(truck.gps.edge_progress_frac * 100) : 50
        }
        
        return {
          id: `R${String(truck.truck_id).padStart(3, '0')}`,
          from: `Node ${truck.gps?.current_node || 0}`,
          to: `Node ${truck.gps?.destination_node || 0}`,
          date: new Date(truck.gps?.timestamp || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          time: "N/A",
          distance: "N/A",
          status,
          truck: `Truck ${truck.truck_id}`,
          progress,
        }
      })
    }
    return recentRoutes
  }, [dbFleetData, recentRoutes])

  const handleAssignRoute = () => {
    const selectedRouteOption = routeOptions.find(opt => opt.id === selectedOption)
    if (!selectedRouteOption || !selectedTruck) return

    const truck = availableTrucks.find(t => t.id === selectedTruck)
    if (!truck) return

    const newRoute = {
      id: `R${String(recentRoutes.length + 1).padStart(3, '0')}`,
      from: fromLocation.split(',')[0],
      to: toLocation.split(',')[0],
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: selectedRouteOption.time,
      distance: selectedRouteOption.distance,
      status: "queued" as const,
      truck: truck.name,
      progress: 0,
    }

    setRecentRoutes([newRoute, ...recentRoutes])
    // Note: In production, this would trigger an API call to create the route
    setSelectedTruck("")
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Route Analytics</h1>
        </div>
        <Badge variant="outline" className="w-fit border-primary/30 bg-primary/10 text-primary">
          <Route className="mr-1.5 h-3.5 w-3.5" />
          Optimizer v2.1
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Route Planner */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Route className="h-5 w-5 text-primary" />
              Plan Route
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Origin */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Origin</label>
              <Select value={fromLocation} onValueChange={setFromLocation}>
                <SelectTrigger className="bg-muted/50 border-border">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-success" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Direction Arrow */}
            <div className="flex justify-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <ArrowDown className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>

            {/* Destination */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Destination</label>
              <Select value={toLocation} onValueChange={setToLocation}>
                <SelectTrigger className="bg-muted/50 border-border">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Optimize Options */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-foreground">Optimize for</p>
              <div className="grid grid-cols-2 gap-2">
                {routeOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedOption(option.id)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-xl p-3 transition-all border",
                      selectedOption === option.id
                        ? "bg-primary/10 border-primary text-primary ring-1 ring-primary/20"
                        : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <option.icon className="h-5 w-5" />
                    <span className="text-xs font-medium">{option.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <Button className="w-full mt-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/25">
              <Route className="mr-2 h-4 w-4" />
              Calculate Route
            </Button>
          </CardContent>
        </Card>

        {/* Map */}
        <Card className="border-border shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Route Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <FleetMap showRoute routePoints={routePoints} />
          </CardContent>
        </Card>
      </div>

      {/* Route Options */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Route Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {routeOptions.map((option) => {
              const isSelected = selectedOption === option.id
              return (
                <button
                  key={option.id}
                  onClick={() => setSelectedOption(option.id)}
                  className={cn(
                    "relative rounded-xl p-5 text-left transition-all border group",
                    isSelected
                      ? "bg-primary/5 border-primary ring-1 ring-primary/20"
                      : "bg-muted/20 border-transparent hover:bg-muted/40 hover:border-border"
                  )}
                >
                  {/* Selected indicator */}
                  {isSelected && (
                    <div className="absolute right-3 top-3">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                    )}>
                      <option.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">{option.name}</span>
                      {isSelected && (
                        <p className="text-xs text-primary">Recommended</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        Time
                      </span>
                      <span className="text-sm font-medium text-foreground">{option.time}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Ruler className="h-3.5 w-3.5" />
                        Distance
                      </span>
                      <span className="text-sm font-medium text-foreground">{option.distance}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <DollarSign className="h-3.5 w-3.5" />
                        Cost
                      </span>
                      <span className="text-sm font-medium text-foreground">{option.cost}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Leaf className="h-3.5 w-3.5" />
                        CO2
                      </span>
                      <span className="text-sm font-medium text-foreground">{option.carbon}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Risk
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          option.risk === "Low"
                            ? "bg-success/10 text-success border-success/30"
                            : "bg-warning/10 text-warning border-warning/30"
                        )}
                      >
                        {option.risk}
                      </Badge>
                    </div>
                  </div>

                  {/* Assign Route Section */}
                  {isSelected && (
                    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                      <Select value={selectedTruck} onValueChange={setSelectedTruck}>
                        <SelectTrigger className="w-full h-8 text-xs">
                          <SelectValue placeholder="Select truck..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTrucks.map((truck) => (
                            <SelectItem key={truck.id} value={truck.id}>
                              <div className="flex items-center gap-2">
                                <Truck className="h-3 w-3" />
                                {truck.name} - {truck.driver}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAssignRoute()
                        }}
                        disabled={!selectedTruck}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-8 disabled:opacity-50"
                      >
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                        Assign Route
                      </Button>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Route Queue & Recent Routes */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Route Queue & Recent</CardTitle>
        </CardHeader>
        <CardContent>
          {DATA_SOURCE === 'database' && !loading && (
            <div className="mb-3 flex items-center gap-2 text-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              <span className="text-success">Live from Database</span>
            </div>
          )}
          <div className="space-y-3">
            {routeHistory.map((route, index) => (
              <div
                key={route.id}
                className="flex flex-col gap-4 rounded-xl bg-muted/30 p-4 transition-colors hover:bg-muted/50"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl",
                      route.status === "completed" && "bg-success/10",
                      route.status === "in-progress" && "bg-primary/10",
                      route.status === "queued" && "bg-warning/10"
                    )}>
                      <Route className={cn(
                        "h-6 w-6",
                        route.status === "completed" && "text-success",
                        route.status === "in-progress" && "text-primary",
                        route.status === "queued" && "text-warning"
                      )} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{route.from}</p>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <p className="font-semibold text-foreground">{route.to}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-sm text-muted-foreground">{route.date}</span>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            route.status === "completed" && "bg-success/10 text-success border-success/30",
                            route.status === "in-progress" && "bg-primary/10 text-primary border-primary/30",
                            route.status === "queued" && "bg-warning/10 text-warning border-warning/30"
                          )}
                        >
                          {route.status === "completed" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                          {route.status === "completed" && "Completed"}
                          {route.status === "in-progress" && "In Progress"}
                          {route.status === "queued" && "Queued"}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Truck className="h-3 w-3" />
                          {route.truck}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-semibold text-foreground">{route.time}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Distance</p>
                      <p className="font-semibold text-foreground">{route.distance}</p>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                {route.status !== "completed" && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress to Destination</span>
                      <span className="font-medium text-foreground">{route.progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          route.status === "in-progress" && "bg-primary",
                          route.status === "queued" && "bg-warning"
                        )}
                        style={{ width: `${route.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
