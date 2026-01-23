"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Overview } from "@/components/dashboard/overview"
import { Tracking } from "@/components/dashboard/tracking"
import { RouteAnalytics } from "@/components/dashboard/route-analytics"
import { Alerts } from "@/components/dashboard/alerts"
import { Settings } from "@/components/dashboard/settings"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Overview />
      case "tracking":
        return <Tracking />
      case "routes":
        return <RouteAnalytics />
      case "alerts":
        return <Alerts />
      case "settings":
        return <Settings />
      default:
        return <Overview />
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}
