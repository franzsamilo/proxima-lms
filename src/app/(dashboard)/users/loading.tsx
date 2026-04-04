export default function UsersLoading() {
  return (
    <div className="animate-[fadeIn_0.25s_ease]">
      <div className="mb-6">
        <div className="h-7 w-24 bg-surface-2 rounded-[var(--radius-md)] mb-2" />
        <div className="h-4 w-32 bg-surface-3 rounded" />
      </div>
      <div className="bg-surface-2 rounded-[var(--radius-lg)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="p-5 space-y-1">
          <div className="h-10 w-full bg-surface-3 rounded mb-1" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 w-full bg-surface-3/50 rounded mb-1" />
          ))}
        </div>
      </div>
    </div>
  )
}
