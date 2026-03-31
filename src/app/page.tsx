import Link from "next/link"
import { Wrench, Code, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-0 flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-24">
        <div className="flex flex-col items-center text-center max-w-4xl w-full gap-8">
          {/* Logo */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #22D3B7, #0EA5A0)",
            }}
          >
            <span
              className="text-surface-0 text-[32px] font-extrabold leading-none"
              style={{ fontFamily: "var(--font-family-display)" }}
            >
              P
            </span>
          </div>

          {/* Title */}
          <h1
            className="text-4xl md:text-5xl font-extrabold tracking-[6px] bg-clip-text text-transparent"
            style={{
              fontFamily: "var(--font-family-display)",
              backgroundImage: "linear-gradient(135deg, #22D3B7, #0EA5A0)",
            }}
          >
            PROXIMA
          </h1>

          {/* Subtitle */}
          <p
            className="text-lg text-ink-tertiary -mt-4"
            style={{ fontFamily: "var(--font-family-body)" }}
          >
            Robotics Learning Management System
          </p>

          {/* Value Prop */}
          <p
            className="text-ink-secondary max-w-2xl leading-relaxed"
            style={{ fontFamily: "var(--font-family-body)" }}
          >
            Proxima LMS brings together curriculum management, hardware kit
            tracking, and hands-on code and video submissions into one
            mission-control platform — built for robotics educators and
            students who demand precision.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <Link href="/login">
              <Button variant="primary" size="default" className="min-w-[120px]">
                Sign In
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="secondary" size="default" className="min-w-[120px]">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="px-6 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Feature 1 */}
            <Card className="flex flex-col gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "var(--color-signal-muted)" }}
              >
                <Wrench className="w-5 h-5 text-signal" />
              </div>
              <div className="flex flex-col gap-2">
                <h3
                  className="text-base font-semibold text-ink-primary"
                  style={{ fontFamily: "var(--font-family-display)" }}
                >
                  Integrated Hardware Kits
                </h3>
                <p
                  className="text-sm text-ink-secondary leading-relaxed"
                  style={{ fontFamily: "var(--font-family-body)" }}
                >
                  Track, assign, and manage physical robotics kits alongside
                  your digital curriculum. Know exactly which student has which
                  hardware at any time.
                </p>
              </div>
            </Card>

            {/* Feature 2 */}
            <Card className="flex flex-col gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "var(--color-signal-muted)" }}
              >
                <Code className="w-5 h-5 text-signal" />
              </div>
              <div className="flex flex-col gap-2">
                <h3
                  className="text-base font-semibold text-ink-primary"
                  style={{ fontFamily: "var(--font-family-display)" }}
                >
                  Code &amp; Video Submissions
                </h3>
                <p
                  className="text-sm text-ink-secondary leading-relaxed"
                  style={{ fontFamily: "var(--font-family-body)" }}
                >
                  Students submit work via an in-browser code editor or video
                  demos. Teachers review, grade, and give structured feedback
                  — all in one place.
                </p>
              </div>
            </Card>

            {/* Feature 3 */}
            <Card className="flex flex-col gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "var(--color-signal-muted)" }}
              >
                <Package className="w-5 h-5 text-signal" />
              </div>
              <div className="flex flex-col gap-2">
                <h3
                  className="text-base font-semibold text-ink-primary"
                  style={{ fontFamily: "var(--font-family-display)" }}
                >
                  Curriculum Packages
                </h3>
                <p
                  className="text-sm text-ink-secondary leading-relaxed"
                  style={{ fontFamily: "var(--font-family-body)" }}
                >
                  Choose from tiered lesson packages — Beginner, Intermediate,
                  or Advanced — each with curated modules, lessons, and aligned
                  hardware requirements.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-edge py-8 text-center">
        <p
          className="text-sm text-ink-ghost"
          style={{ fontFamily: "var(--font-family-body)" }}
        >
          &copy; 2026 Proxima LMS
        </p>
      </footer>
    </div>
  )
}
