export default function TasksLoading() {
  return (
    <div className="animate-[fadeIn_0.25s_ease]">
      <div className="h-7 w-24 bg-surface-2 rounded-[var(--radius-md)] mb-6" />
      <div className="bg-surface-2 rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="p-5">
          <div className="flex gap-2 mb-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-9 w-20 bg-surface-3 rounded-[var(--radius-md)]" />
            ))}
          </div>
          <div className="space-y-0">
            <div className="h-10 w-full bg-surface-3 rounded mb-1" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 w-full bg-surface-3/50 rounded mb-1" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
