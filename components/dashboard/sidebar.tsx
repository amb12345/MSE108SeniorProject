"use client"

import { cn } from "@/lib/utils"
import {
  BarChart3,
  MapPin,
  Link2,
  Activity,
  ChevronLeft,
  ChevronRight,
  Truck,
} from "lucide-react"

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  collapsed: boolean
  onCollapse: (collapsed: boolean) => void
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3, description: "Overview & metrics", children: [
    { id: "telemetry", label: "Telemetry Alerts", icon: Activity, description: "Sensor data" },
  ]},
  { id: "tracking", label: "Live Tracking", icon: MapPin, description: "Real-time location" },
  { id: "routes", label: "Route Analytics", icon: Link2, description: "Route optimization" },
]

export function Sidebar({ activeTab, onTabChange, collapsed, onCollapse }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full flex-col bg-sidebar transition-all duration-300 ease-out",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div className={cn(
        "flex items-center h-16 border-b border-white/20 px-4",
        collapsed ? "justify-center" : "gap-3"
      )}>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
          <Truck className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-xl font-bold text-white tracking-tight">IBM</span>
            <span className="text-[10px] text-white/70">Fleet Management</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <div className={cn(
          "mb-2 px-3 text-[10px] font-medium uppercase tracking-wider text-white/60",
          collapsed && "sr-only"
        )}>
          Navigation
        </div>
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id
            const hasChildren = item.children && item.children.length > 0
            const isChildActive = hasChildren && item.children?.some(child => child.id === activeTab)
            
            return (
              <div key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-white/20 text-white shadow-md shadow-black/10"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 shrink-0 transition-transform duration-200",
                    isActive && "scale-110"
                  )} />
                  {!collapsed && (
                    <div className="flex flex-col items-start">
                      <span>{item.label}</span>
                      {!isActive && (
                        <span className="text-[10px] font-normal text-white/60 opacity-0 transition-opacity group-hover:opacity-100">
                          {item.description}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute right-0 top-1/2 h-8 w-1 -translate-y-1/2 translate-x-1.5 rounded-l-full bg-white/50" />
                  )}
                </button>
                
                {/* Children */}
                {!collapsed && hasChildren && (isActive || isChildActive) && (
                  <div className="ml-6 mt-1 space-y-1 border-l-2 border-white/20 pl-3">
                    {item.children?.map((child) => {
                      const isChildItemActive = activeTab === child.id
                      return (
                        <button
                          key={child.id}
                          onClick={() => onTabChange(child.id)}
                          className={cn(
                            "group relative flex w-full items-center gap-2 rounded-lg px-2 py-2 text-xs font-medium transition-all duration-200",
                            isChildItemActive
                              ? "bg-white/15 text-white"
                              : "text-white/70 hover:bg-white/10 hover:text-white"
                          )}
                        >
                          <child.icon className="h-4 w-4 shrink-0" />
                          <span>{child.label}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-white/20 p-3">
        <button
          onClick={() => onCollapse(!collapsed)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white",
            collapsed && "justify-center"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
