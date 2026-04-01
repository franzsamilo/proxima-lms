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
}

export function CalendarView({ events, courses, canCreate }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-[family-name:var(--font-family-display)] text-[24px] font-bold tracking-tight text-ink-primary">
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
          />
        </div>

        {/* Event list */}
        <div>
          <EventList events={sortedMonthEvents} />
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
