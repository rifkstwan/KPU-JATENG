"use client"

import { useState } from "react"
import CMSSidebar from "@/components/cms/CMSSidebar"
import CMSHeader from "@/components/cms/CMSHeader"
import { Menu } from "lucide-react"

interface CMSClientWrapperProps {
  user: {
    name?: string | null
    email?: string | null
    role?: string | null
  }
  initialUnreadCount: number
  initialUnreadItems: any[]
  children: React.ReactNode
}

export default function CMSClientWrapper({
  user,
  initialUnreadCount,
  initialUnreadItems,
  children,
}: CMSClientWrapperProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="h-screen flex overflow-hidden bg-[#f8f9fa] dark:bg-zinc-950 font-sans relative">
      {/* Sidebar - Desktop: fixed w-64, Mobile: absolute sliding panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white dark:bg-zinc-950 transition-transform duration-300 md:relative md:translate-x-0 flex flex-col flex-shrink-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <CMSSidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header container with hamburger toggle */}
        <div className="flex items-center bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 pr-6 pl-4 md:pl-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 mr-2 flex-shrink-0"
            aria-label="Open Sidebar"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <CMSHeader 
              user={user}
              initialUnreadCount={initialUnreadCount}
              initialUnreadItems={initialUnreadItems}
            />
          </div>
        </div>

        {/* Scrollable Content Container */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}
