export default function DashboardLoading() {
  return (
    <div className="animate-[fadeIn_0.25s_ease]">
      <div className="h-7 w-48 bg-surface-2 rounded-[var(--radius-md)] mb-6" />
      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface-2 rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-card)]">
            <div className="h-3 w-20 bg-surface-3 rounded mb-3" />
            <div className="h-8 w-16 bg-surface-3 rounded mb-2" />
            <div className="h-3 w-32 bg-surface-3 rounded" />
          </div>
        ))}
      </div>
      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-2 rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-card)] h-64" />
        <div className="bg-surface-2 rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-card)] h-64" />
      </div>
    </div>
  )
}
