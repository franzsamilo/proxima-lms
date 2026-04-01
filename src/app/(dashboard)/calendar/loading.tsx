import { Skeleton } from "@/components/ui/skeleton"

export default function CalendarLoading() {
  return (
    <div className="animate-[fadeIn_0.25s_ease]">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Skeleton className="lg:col-span-2 h-[500px]" />
        <Skeleton className="h-[500px]" />
      </div>
    </div>
  )
}
