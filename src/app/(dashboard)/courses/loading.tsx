import { Skeleton } from "@/components/ui/skeleton"

export default function CoursesLoading() {
  return (
    <div className="animate-[fadeIn_0.25s_ease]">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    </div>
  )
}
