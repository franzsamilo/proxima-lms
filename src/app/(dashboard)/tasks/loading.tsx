import { Skeleton } from "@/components/ui/skeleton"

export default function TasksLoading() {
  return (
    <div className="animate-[fadeIn_0.25s_ease]">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    </div>
  )
}
