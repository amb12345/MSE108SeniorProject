"use client"

import { cn } from "@/lib/utils"
import {
  BarChart3,
  Activity,
  ChevronLeft,
  ChevronRight,
  Truck,
  DollarSign,
  Leaf,
  RefreshCw,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  collapsed: boolean
  onCollapse: (collapsed: boolean) => void
  onRefresh?: () => void
  refreshLoading?: boolean
}

const navItems = [
  { id: "home", label: "Home", icon: BarChart3 },
  { id: "telemetry", label: "Telemetry Alerts", icon: Activity },
  { id: "costs", label: "Optimization", icon: DollarSign },
  { id: "environmental", label: "Environmental Impact", icon: Leaf },
]

export function Sidebar({
  activeTab,
  onTabChange,
  collapsed,
  onCollapse,
  onRefresh,
  refreshLoading,
}: SidebarProps) {
  const showRefresh = Boolean(process.env.NEXT_PUBLIC_BACKEND_URL && onRefresh)

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
        collapsed ? "flex-col justify-center gap-1" : "gap-3"
      )}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/20">
          <Truck className="h-5 w-5 text-white" />
        </div>
        {!collapsed ? (
          <div className="flex flex-1 items-center justify-between min-w-0">
            <div className="flex flex-col min-w-0">
              <span className="text-xl font-bold text-white tracking-tight">IBM</span>
              <span className="text-[10px] text-white/70">Fleet Management</span>
            </div>
            {showRefresh && (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={onRefresh}
                      disabled={refreshLoading}
                      className={cn(
                        "ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
                        "bg-white/10 text-white/90 hover:bg-white/20 hover:text-white hover:scale-105",
                        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
                        "focus:outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-2 focus:ring-offset-transparent"
                      )}
                      aria-label="Refresh fleet data from backend"
                    >
                      <RefreshCw
                        className={cn(
                          "h-4 w-4",
                          refreshLoading && "animate-spin"
                        )}
                      />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    <p>Refresh Data</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        ) : showRefresh ? (
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onRefresh}
                  disabled={refreshLoading}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md transition-all",
                    "bg-white/10 text-white/90 hover:bg-white/20",
                    "disabled:opacity-50"
                  )}
                  aria-label="Refresh fleet data"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", refreshLoading && "animate-spin")} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Refresh from backend</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : null}
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
            return (
              <button
                key={item.id}
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
                {!collapsed && <span>{item.label}</span>}

                {isActive && (
                  <div className="absolute right-0 top-1/2 h-8 w-1 -translate-y-1/2 translate-x-1.5 rounded-l-full bg-white/50" />
                )}
              </button>
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
