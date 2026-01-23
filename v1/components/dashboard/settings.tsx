"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Settings as SettingsIcon, Bell, Shield, MapPin, Users, Truck } from "lucide-react"

export function Settings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>Manage your fleet management preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company" className="text-card-foreground">Company Name</Label>
              <Input
                id="company"
                defaultValue="FleetTrack Inc."
                className="bg-secondary border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone" className="text-card-foreground">Timezone</Label>
              <Input
                id="timezone"
                defaultValue="America/New_York (EST)"
                className="bg-secondary border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="units" className="text-card-foreground">Distance Units</Label>
              <Input
                id="units"
                defaultValue="Miles"
                className="bg-secondary border-border text-foreground"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure alert preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-card-foreground">Critical Alerts</p>
                <p className="text-xs text-muted-foreground">Engine warnings, accidents</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-card-foreground">Fuel Alerts</p>
                <p className="text-xs text-muted-foreground">Low fuel notifications</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-card-foreground">Route Deviations</p>
                <p className="text-xs text-muted-foreground">Off-route alerts</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-card-foreground">Delivery Updates</p>
                <p className="text-xs text-muted-foreground">Completion notifications</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Manage security and access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-card-foreground">Two-Factor Auth</p>
                <p className="text-xs text-muted-foreground">Extra account security</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-card-foreground">Session Timeout</p>
                <p className="text-xs text-muted-foreground">Auto logout after inactivity</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="space-y-2">
              <Label className="text-card-foreground">Change Password</Label>
              <Input
                type="password"
                placeholder="New password"
                className="bg-secondary border-border text-foreground"
              />
            </div>
          </CardContent>
        </Card>

        {/* Map Settings */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Map Preferences
            </CardTitle>
            <CardDescription>Customize map display</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-card-foreground">Dark Mode Map</p>
                <p className="text-xs text-muted-foreground">Use dark map tiles</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-card-foreground">Traffic Layer</p>
                <p className="text-xs text-muted-foreground">Show real-time traffic</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-card-foreground">Auto-Center</p>
                <p className="text-xs text-muted-foreground">Follow selected vehicle</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Fleet Settings */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-card-foreground flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Fleet Configuration
            </CardTitle>
            <CardDescription>Manage fleet-wide settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-card-foreground">Speed Limit Alert (MPH)</Label>
                <Input
                  type="number"
                  defaultValue="75"
                  className="bg-secondary border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-card-foreground">Fuel Alert Threshold (%)</Label>
                <Input
                  type="number"
                  defaultValue="20"
                  className="bg-secondary border-border text-foreground"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-card-foreground">Maintenance Interval (miles)</Label>
                <Input
                  type="number"
                  defaultValue="10000"
                  className="bg-secondary border-border text-foreground"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" className="text-muted-foreground bg-transparent">
                Reset to Defaults
              </Button>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
