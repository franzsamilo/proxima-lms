"use client"

import { useState } from "react"
import { CalendarGrid } from "@/components/calendar/calendar-grid"
import { EventList } from "@/components/calendar/event-list"
import { CreateEventForm } from "@/components/calendar/create-event-form"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface CalendarEvent {
  id: string
  title: string
  date: string
  type: string
}

interface Course {
  id: string
  title: string
}

interface CalendarViewProps {
  events: CalendarEvent[]
  courses: Course[]
  canCreate: boolean
  today: string // YYYY-MM-DD from server
}

export function CalendarView({ events, courses, canCreate, today }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    // Seed from server-truth "today" (YYYY-MM-DD) to avoid client/server drift
    const [y, m] = today.split("-").map(Number)
    return new Date(y, m - 1, 1)
  })
  const [showForm, setShowForm] = useState(false)

  // Filter events for the current month
  const monthEvents = events.filter((evt) => {
    const d = new Date(evt.date)
    return (
      d.getFullYear() === currentMonth.getFullYear() &&
      d.getMonth() === currentMonth.getMonth()
    )
  })

  // Sort by date ascending
  const sortedMonthEvents = [...monthEvents].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="font-[family-name:var(--font-family-display)] text-[20px] md:text-[24px] font-bold tracking-tight text-ink-primary">
          Calendar
        </h1>
        {canCreate && (
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} className="mr-1.5" />
            Add Event
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar grid — wider column */}
        <div className="lg:col-span-2 bg-surface-2 shadow-[var(--shadow-card)] rounded-[var(--radius-lg)] p-5">
          <CalendarGrid
            events={events}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            today={today}
          />
        </div>

        {/* Event list */}
        <div>
          <EventList events={sortedMonthEvents} canDelete={canCreate} />
        </div>
      </div>

      {canCreate && (
        <CreateEventForm
          open={showForm}
          onClose={() => setShowForm(false)}
          courses={courses}
        />
      )}
    </>
  )
}
