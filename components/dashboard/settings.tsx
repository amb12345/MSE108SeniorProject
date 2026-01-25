"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Settings as SettingsIcon, Bell, Shield, MapPin, Truck, Save, RotateCcw } from "lucide-react"

export function Settings() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your fleet dashboard preferences and configuration</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General Settings */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <SettingsIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">General Settings</CardTitle>
                <CardDescription>Manage your fleet management preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input
                id="company"
                defaultValue="FleetTrack"
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                defaultValue="America/New_York (EST)"
                className="bg-muted/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="units">Distance Units</Label>
              <Input
                id="units"
                defaultValue="Miles"
                className="bg-muted/50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                <Bell className="h-5 w-5 text-warning" />
              </div>
              <div>
                <CardTitle className="text-lg">Notifications</CardTitle>
                <CardDescription>Configure alert preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3 transition-colors hover:bg-muted/50">
              <div>
                <p className="text-sm font-medium text-foreground">Critical Alerts</p>
                <p className="text-xs text-muted-foreground">Engine warnings, accidents</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3 transition-colors hover:bg-muted/50">
              <div>
                <p className="text-sm font-medium text-foreground">Fuel Alerts</p>
                <p className="text-xs text-muted-foreground">Low fuel notifications</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3 transition-colors hover:bg-muted/50">
              <div>
                <p className="text-sm font-medium text-foreground">Route Deviations</p>
                <p className="text-xs text-muted-foreground">Off-route alerts</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3 transition-colors hover:bg-muted/50">
              <div>
                <p className="text-sm font-medium text-foreground">Delivery Updates</p>
                <p className="text-xs text-muted-foreground">Completion notifications</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                <Shield className="h-5 w-5 text-success" />
              </div>
              <div>
                <CardTitle className="text-lg">Security</CardTitle>
                <CardDescription>Manage security and access</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3 transition-colors hover:bg-muted/50">
              <div>
                <p className="text-sm font-medium text-foreground">Two-Factor Auth</p>
                <p className="text-xs text-muted-foreground">Extra account security</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3 transition-colors hover:bg-muted/50">
              <div>
                <p className="text-sm font-medium text-foreground">Session Timeout</p>
                <p className="text-xs text-muted-foreground">Auto logout after inactivity</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2 pt-2">
              <Label>Change Password</Label>
              <Input
                type="password"
                placeholder="New password"
                className="bg-muted/50"
              />
            </div>
          </CardContent>
        </Card>

        {/* Map Preferences */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10">
                <MapPin className="h-5 w-5 text-info" />
              </div>
              <div>
                <CardTitle className="text-lg">Map Preferences</CardTitle>
                <CardDescription>Customize map display</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3 transition-colors hover:bg-muted/50">
              <div>
                <p className="text-sm font-medium text-foreground">Dark Mode Map</p>
                <p className="text-xs text-muted-foreground">Use dark map tiles</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3 transition-colors hover:bg-muted/50">
              <div>
                <p className="text-sm font-medium text-foreground">Traffic Layer</p>
                <p className="text-xs text-muted-foreground">Show real-time traffic</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3 transition-colors hover:bg-muted/50">
              <div>
                <p className="text-sm font-medium text-foreground">Auto-Center</p>
                <p className="text-xs text-muted-foreground">Follow selected vehicle</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Fleet Configuration - Full Width */}
        <Card className="border-border shadow-sm lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Fleet Configuration</CardTitle>
                <CardDescription>Manage fleet-wide settings and thresholds</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Speed Limit Alert (MPH)</Label>
                <Input
                  type="number"
                  defaultValue="75"
                  className="bg-muted/50"
                />
                <p className="text-xs text-muted-foreground">Alert when vehicles exceed this speed</p>
              </div>
              <div className="space-y-2">
                <Label>Fuel Alert Threshold (%)</Label>
                <Input
                  type="number"
                  defaultValue="20"
                  className="bg-muted/50"
                />
                <p className="text-xs text-muted-foreground">Notify when fuel drops below</p>
              </div>
              <div className="space-y-2">
                <Label>Maintenance Interval (miles)</Label>
                <Input
                  type="number"
                  defaultValue="10000"
                  className="bg-muted/50"
                />
                <p className="text-xs text-muted-foreground">Schedule maintenance reminders</p>
              </div>
            </div>
            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
              <Button variant="outline" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset to Defaults
              </Button>
              <Button className="gap-2 bg-primary text-primary-foreground shadow-md shadow-primary/25 hover:bg-primary/90">
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
