import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPageLoading() {
  return (
    <div className="animate-[fadeIn_0.25s_ease]">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-5 w-32 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-5">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Skeleton className="lg:col-span-2 h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  )
}
