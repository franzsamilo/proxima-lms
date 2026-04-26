import { getCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { PackageCard } from "@/components/packages/package-card"
import { Panel } from "@/components/ui/panel"
import { Inbox } from "lucide-react"

export default async function PackagesPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  const packages = await prisma.lessonPackage.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
    include: {
      courses: {
        select: {
          id: true,
          modules: { select: { _count: { select: { lessons: true } } } },
        },
      },
    },
  })

  const packageData = packages.map((pkg) => {
    const moduleCount = pkg.courses.reduce((acc, c) => acc + c.modules.length, 0)
    const lessonCount = pkg.courses.reduce(
      (acc, c) => acc + c.modules.reduce((mAcc, mod) => mAcc + mod._count.lessons, 0),
      0
    )
    return {
      id: pkg.id,
      name: pkg.name,
      level: pkg.level,
      tier: pkg.tier,
      price: pkg.price,
      description: pkg.description,
      includes: pkg.includes,
      moduleCount,
      lessonCount,
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-[family-name:var(--font-family-display)] text-[28px] md:text-[36px] font-bold tracking-tight text-ink-primary leading-[1.05]">
          Lesson packages
        </h1>
        <p className="font-[family-name:var(--font-family-body)] text-[14px] text-ink-tertiary max-w-2xl">
          Tiered curriculum bundles. Each one is aligned to a hardware kit and a grade level —
          modules, lessons, projects, and assessments are all pre-loaded.
        </p>
      </div>

      {packageData.length === 0 ? (
        <Panel variant="outline" padding="lg">
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <Inbox size={32} className="text-ink-ghost" />
            <p className="font-[family-name:var(--font-family-body)] text-[14px] text-ink-tertiary">
              No packages available right now.
            </p>
          </div>
        </Panel>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packageData.map((pkg) => (
            <PackageCard key={pkg.id} package={pkg} />
          ))}
        </div>
      )}
    </div>
  )
}
