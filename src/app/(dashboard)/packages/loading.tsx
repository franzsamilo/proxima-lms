export default function PackagesLoading() {
  return (
    <div className="animate-[fadeIn_0.25s_ease]">
      <div className="h-7 w-44 bg-surface-2 rounded-[var(--radius-md)] mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-surface-2 rounded-[var(--radius-lg)] border-t-[3px] border-edge p-6 shadow-[var(--shadow-card)] h-96" />
        ))}
      </div>
    </div>
  )
}
