import { getCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { PackageCard } from "@/components/packages/package-card"

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
          modules: {
            select: {
              lessons: { select: { id: true } },
            },
          },
        },
      },
    },
  })

  const packageData = packages.map((pkg) => {
    const courseCount = pkg.courses.length
    const lessonCount = pkg.courses.reduce(
      (acc, course) =>
        acc +
        course.modules.reduce((mAcc, mod) => mAcc + mod.lessons.length, 0),
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
      courseCount,
      lessonCount,
    }
  })

  return (
    <div>
      <h1 className="font-[family-name:var(--font-family-display)] text-[20px] md:text-[24px] font-bold tracking-tight text-ink-primary mb-6">
        Lesson Packages
      </h1>

      {packageData.length === 0 ? (
        <p className="font-[family-name:var(--font-family-body)] text-[14px] text-ink-tertiary">
          No packages available at this time.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packageData.map((pkg) => (
            <PackageCard key={pkg.id} package={pkg} />
          ))}
        </div>
      )}
    </div>
  )
}
