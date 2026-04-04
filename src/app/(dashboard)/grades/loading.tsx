export default function GradesLoading() {
  return (
    <div className="animate-[fadeIn_0.25s_ease] space-y-6">
      <div className="h-7 w-28 bg-surface-2 rounded-[var(--radius-md)]" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-surface-2 rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-card)] h-36" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface-2 rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-card)] h-64" />
        <div className="bg-surface-2 rounded-[var(--radius-lg)] p-5 shadow-[var(--shadow-card)] h-64" />
      </div>
    </div>
  )
}
