export default function CalendarLoading() {
  return (
    <div className="animate-[fadeIn_0.25s_ease]">
      <div className="flex items-center justify-between mb-6">
        <div className="h-7 w-32 bg-surface-2 rounded-[var(--radius-md)]" />
        <div className="h-10 w-32 bg-surface-2 rounded-[var(--radius-md)]" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-2 rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-card)] h-80" />
        <div className="bg-surface-2 rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-card)] h-80" />
      </div>
    </div>
  )
}
