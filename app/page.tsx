"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Overview } from "@/components/dashboard/overview"
import { Tracking } from "@/components/dashboard/tracking"
import { RouteAnalytics } from "@/components/dashboard/route-analytics"
import { Alerts } from "@/components/dashboard/alerts"
import { TooltipProvider } from "@/components/ui/tooltip"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Overview onNavigate={setActiveTab} />
      case "tracking":
        return <Tracking />
      case "routes":
        return <RouteAnalytics />
      case "telemetry":
        return <Alerts />
      default:
        return <Overview onNavigate={setActiveTab} />
    }
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          collapsed={sidebarCollapsed}
          onCollapse={setSidebarCollapsed}
        />
        <main className="flex-1 overflow-auto h-screen">
          <div className="container max-w-7xl mx-auto p-6 lg:p-8">
            {renderContent()}
          </div>
        </main>
      </div>
    </TooltipProvider>
  )
}
