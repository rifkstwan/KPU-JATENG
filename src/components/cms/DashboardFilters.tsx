"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Filter, Calendar, ChevronDown, Check } from "lucide-react"

export default function DashboardFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentDays = searchParams.get("days") || "30"
  const currentStatus = searchParams.get("status") || "all"

  const [showDaysDropdown, setShowDaysDropdown] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)

  const daysRef = useRef<HTMLDivElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)

  const dayOptions = [
    { value: "1", label: "Hari Ini" },
    { value: "7", label: "7 Hari Terakhir" },
    { value: "30", label: "30 Hari Terakhir" },
    { value: "90", label: "90 Hari Terakhir" },
    { value: "all", label: "Semua Waktu" },
  ]

  const statusOptions = [
    { value: "all", label: "Semua Status" },
    { value: "BELUM_DIBACA", label: "Belum Dibaca" },
    { value: "SUDAH_DIBACA", label: "Sudah Dibaca" },
  ]

  const getDaysLabel = (val: string) => {
    return dayOptions.find(o => o.value === val)?.label || "30 Hari Terakhir"
  }

  const getStatusLabel = (val: string) => {
    return statusOptions.find(o => o.value === val)?.label || "Semua Status"
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (daysRef.current && !daysRef.current.contains(event.target as Node)) {
        setShowDaysDropdown(false)
      }
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setShowStatusDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const updateFilters = (newDays: string, newStatus: string) => {
    const params = new URLSearchParams()
    if (newDays !== "30") params.set("days", newDays)
    if (newStatus !== "all") params.set("status", newStatus)
    
    const query = params.toString()
    router.push(query ? `?${query}` : "?")
  }

  return (
    <div className="flex items-center gap-3 relative">
      {/* Status Filter Dropdown */}
      <div ref={statusRef} className="relative">
        <button
          onClick={() => setShowStatusDropdown(!showStatusDropdown)}
          className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
        >
          <Filter size={14} />
          <span>Status: {getStatusLabel(currentStatus)}</span>
          <ChevronDown size={12} className="text-zinc-400" />
        </button>

        {showStatusDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg py-1.5 z-30">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  updateFilters(currentDays, opt.value)
                  setShowStatusDropdown(false)
                }}
                className="w-full text-left px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-200 flex items-center justify-between"
              >
                <span>{opt.label}</span>
                {currentStatus === opt.value && <Check size={14} className="text-red-800" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Date Filter Dropdown */}
      <div ref={daysRef} className="relative">
        <button
          onClick={() => setShowDaysDropdown(!showDaysDropdown)}
          className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
        >
          <Calendar size={14} />
          <span>{getDaysLabel(currentDays)}</span>
          <ChevronDown size={12} className="text-zinc-400" />
        </button>

        {showDaysDropdown && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg py-1.5 z-30">
            {dayOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  updateFilters(opt.value, currentStatus)
                  setShowDaysDropdown(false)
                }}
                className="w-full text-left px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs text-zinc-700 dark:text-zinc-200 flex items-center justify-between"
              >
                <span>{opt.label}</span>
                {currentDays === opt.value && <Check size={14} className="text-red-850" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
