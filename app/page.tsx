"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Overview } from "@/components/dashboard/overview"
import { Alerts } from "@/components/dashboard/alerts"
import { Costs } from "@/components/dashboard/costs"
import { EnvironmentalImpact } from "@/components/dashboard/environmental-impact"
import { TooltipProvider } from "@/components/ui/tooltip"
import { FleetBackendProvider, useFleetBackend } from "@/contexts/fleet-backend-context"

function DashboardContent() {
  const [activeTab, setActiveTab] = useState("home")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { refresh, loading: refreshLoading } = useFleetBackend()

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <Overview onNavigate={setActiveTab} />
      case "telemetry":
        return <Alerts />
      case "costs":
        return <Costs />
      case "environmental":
        return <EnvironmentalImpact />
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
          onRefresh={refresh}
          refreshLoading={refreshLoading}
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

export default function Dashboard() {
  return (
    <FleetBackendProvider>
      <DashboardContent />
    </FleetBackendProvider>
  )
}
