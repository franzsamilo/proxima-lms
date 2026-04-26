import Link from "next/link"
import {
  ArrowRight,
  Cpu,
  CodeXml,
  Layers3,
  GraduationCap,
  Wrench,
  Activity,
  Radar,
  Sparkles,
} from "lucide-react"
import { MissionLogo, LogoMark } from "@/components/ui/mission-logo"
import { ProtocolButton } from "@/components/ui/protocol-button"
import { ProtocolBadge } from "@/components/ui/protocol-badge"
import { Telemetry } from "@/components/ui/telemetry"
import { StatusPip } from "@/components/ui/status-dot"
import { Panel } from "@/components/ui/panel"
import { ChannelDivider, TickRow } from "@/components/ui/channel-divider"
import { OrbitalProgress, SignalBars } from "@/components/ui/orbital-progress"

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-surface-0 text-ink-primary overflow-x-hidden">
      {/* Background layers */}
      <div className="pointer-events-none fixed inset-0 -z-30 bg-grid-fine opacity-50" />
      <div className="pointer-events-none fixed inset-0 -z-30 bg-radial-vignette" />
      <div className="pointer-events-none fixed inset-0 -z-30 bg-noise opacity-60" />

      {/* Floating orbital glow */}
      <div className="pointer-events-none absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-signal/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-[40%] -left-40 w-[500px] h-[500px] rounded-full bg-plasma/8 blur-[120px]" />

      {/* ─── NAV ─────────────────────────────────────── */}
      <header className="relative z-10 border-b border-edge/60 bg-surface-0/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto h-16 px-6 lg:px-10 flex items-center justify-between">
          <MissionLogo size="md" />
          <nav className="hidden md:flex items-center gap-8 font-[family-name:var(--font-family-mono)] text-[11px] tracking-[0.18em] uppercase">
            <a href="#capabilities" className="text-ink-tertiary hover:text-signal transition-colors">Capabilities</a>
            <a href="#packages" className="text-ink-tertiary hover:text-signal transition-colors">Packages</a>
            <a href="#deck" className="text-ink-tertiary hover:text-signal transition-colors">Mission Deck</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <ProtocolButton variant="outline" size="sm">SIGN IN</ProtocolButton>
            </Link>
            <Link href="/register" className="hidden sm:inline-flex">
              <ProtocolButton variant="primary" size="sm">REQUEST CLEARANCE <ArrowRight size={12} /></ProtocolButton>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO ────────────────────────────────────── */}
      <section className="relative z-10 px-6 lg:px-10 pt-16 lg:pt-24 pb-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-10 lg:gap-16 items-end">
          {/* Left: copy */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <StatusPip status="live" label="ALPHA-CENT // LIVE BUILD" />
              <span className="hidden md:inline-block w-px h-4 bg-edge" />
              <Telemetry className="hidden md:inline text-ink-ghost">v1.0 · 2026-04</Telemetry>
            </div>

            <h1 className="font-[family-name:var(--font-family-display)] font-bold leading-[0.92] tracking-[-0.045em] text-[64px] sm:text-[88px] lg:text-[112px]">
              <span className="block text-ink-primary">Mission</span>
              <span className="block text-rim-gradient">control for</span>
              <span className="block text-ink-primary">robotics</span>
              <span className="block text-signal-gradient">classrooms.</span>
            </h1>

            <p className="font-[family-name:var(--font-family-body)] text-[16px] lg:text-[18px] text-ink-secondary leading-[1.65] max-w-xl">
              Proxima fuses curriculum, code, hardware kits, and video demos into a single
              precision deck. Built for instructors who teach things that have to actually move.
            </p>

            <div className="flex flex-wrap gap-3 mt-2">
              <Link href="/login">
                <ProtocolButton variant="primary" size="lg">
                  ENTER DECK <ArrowRight size={14} />
                </ProtocolButton>
              </Link>
              <a href="#capabilities">
                <ProtocolButton variant="outline" size="lg">
                  REVIEW SYSTEMS
                </ProtocolButton>
              </a>
            </div>

            <ChannelDivider label="VERIFIED FOR" className="mt-8 max-w-md" />
            <div className="flex flex-wrap gap-2">
              <ProtocolBadge tone="success" dot>ELEMENTARY</ProtocolBadge>
              <ProtocolBadge tone="info" dot>HIGH SCHOOL</ProtocolBadge>
              <ProtocolBadge tone="purple" dot>UNIVERSITY</ProtocolBadge>
              <ProtocolBadge tone="signal" bracket>ROS2-READY</ProtocolBadge>
              <ProtocolBadge tone="plasma" bracket>PYTHON · ARDUINO · C++</ProtocolBadge>
            </div>
          </div>

          {/* Right: telemetry panel */}
          <div className="lg:col-span-5">
            <HeroTelemetry />
          </div>
        </div>
      </section>

      {/* ─── CAPABILITIES ────────────────────────────── */}
      <section id="capabilities" className="relative z-10 px-6 lg:px-10 py-20 border-t border-edge/60">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12 gap-4 flex-wrap">
            <div>
              <Telemetry className="text-signal mb-3 block">SYSTEMS // 03</Telemetry>
              <h2 className="font-[family-name:var(--font-family-display)] text-[40px] lg:text-[56px] font-bold tracking-tight text-ink-primary leading-[0.95]">
                Three subsystems.<br />
                <span className="text-ink-tertiary">One mission deck.</span>
              </h2>
            </div>
            <TickRow count={20} className="hidden lg:flex" />
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            <CapabilityCard
              channel="CH-01"
              icon={<Wrench size={20} />}
              title="Hardware Kits"
              tags={["INVENTORY", "ASSIGNMENT", "CHECKOUT"]}
              body="Track every Scout, Ranger, and Apex unit. Assign kits to operators, monitor returns, and see availability in real time."
              metric={{ label: "ACTIVE UNITS", value: "095" }}
            />
            <CapabilityCard
              channel="CH-02"
              icon={<CodeXml size={20} />}
              title="Code & Video Demos"
              tags={["MONACO", "UPLOADTHING", "RUBRIC"]}
              body="In-browser editor for code submissions. Video upload for hardware demos. Structured rubrics for grading."
              metric={{ label: "SUBMISSIONS / WK", value: "240" }}
            />
            <CapabilityCard
              channel="CH-03"
              icon={<Layers3 size={20} />}
              title="Curriculum Packages"
              tags={["STARTER", "EXPLORER", "PROFESSIONAL"]}
              body="Tiered course bundles aligned to grade level. Modules, lessons, quizzes, and aligned hardware in one drop."
              metric={{ label: "TOTAL LESSONS", value: "180" }}
            />
          </div>
        </div>
      </section>

      {/* ─── PACKAGES ─────────────────────────────────── */}
      <section id="packages" className="relative z-10 px-6 lg:px-10 py-20 border-t border-edge/60">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-10 mb-12">
            <div className="lg:col-span-5">
              <Telemetry className="text-signal mb-3 block">PAYLOADS // TIERED</Telemetry>
              <h2 className="font-[family-name:var(--font-family-display)] text-[40px] lg:text-[52px] font-bold tracking-tight leading-[0.95]">
                Choose your <br /> <span className="text-rim-gradient">orbital tier.</span>
              </h2>
            </div>
            <p className="lg:col-span-7 lg:pt-6 font-[family-name:var(--font-family-body)] text-[16px] text-ink-secondary leading-[1.65]">
              Three curriculum tiers built around real hardware and progressive complexity.
              Each package ships with curated modules, slide decks, code skeletons, video tutorials,
              and project briefs aligned to a specific kit.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <PackageCard
              tier="STARTER"
              tone="success"
              level="ELEMENTARY"
              kit="Proxima Scout"
              price="299"
              modules={6}
              lessons={24}
              features={["Slide decks", "Code skeletons", "Quizzes", "Hardware setup guide"]}
            />
            <PackageCard
              tier="EXPLORER"
              tone="info"
              level="HIGH SCHOOL"
              kit="Proxima Ranger"
              price="499"
              modules={9}
              lessons={42}
              features={["Everything in Starter", "Video tutorials", "Project briefs", "Vision systems"]}
              highlight
            />
            <PackageCard
              tier="PROFESSIONAL"
              tone="purple"
              level="UNIVERSITY"
              kit="Proxima Apex"
              price="799"
              modules={12}
              lessons={68}
              features={["Everything in Explorer", "Research papers", "Lab manuals", "ROS2 + Kinematics"]}
            />
          </div>
        </div>
      </section>

      {/* ─── DECK PREVIEW ─────────────────────────────── */}
      <section id="deck" className="relative z-10 px-6 lg:px-10 py-20 border-t border-edge/60">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <Telemetry className="text-signal mb-3 block">DECK PREVIEW</Telemetry>
              <h2 className="font-[family-name:var(--font-family-display)] text-[40px] lg:text-[52px] font-bold tracking-tight leading-[0.95]">
                Built like a <br />
                <span className="text-rim-gradient">flight console.</span>
              </h2>
              <p className="mt-5 font-[family-name:var(--font-family-body)] text-[16px] text-ink-secondary leading-[1.65] max-w-xl">
                Every screen is dense, deliberate, and quiet under load. Telemetry-style
                indicators, mission timestamps, and channel codes mean you spend less time
                learning the UI and more time teaching robots.
              </p>
              <div className="mt-7 grid grid-cols-2 gap-3 max-w-md">
                <DeckStat label="ACTIVE COURSES" value="03" />
                <DeckStat label="OPERATORS" value="48" />
                <DeckStat label="KITS DEPLOYED" value="32" />
                <DeckStat label="UPTIME" value="99.94%" />
              </div>
            </div>

            <DeckMockup />
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────── */}
      <section className="relative z-10 px-6 lg:px-10 py-24 border-t border-edge/60">
        <div className="max-w-4xl mx-auto">
          <Panel bracket variant="default" padding="lg" className="bg-surface-1/80 backdrop-blur-sm overflow-hidden">
            <div className="flex flex-col items-center text-center gap-6 py-10">
              <Sparkles size={28} className="text-signal" />
              <h3 className="font-[family-name:var(--font-family-display)] text-[36px] lg:text-[48px] font-bold tracking-tight leading-[0.95]">
                Initiate the deck.
              </h3>
              <p className="font-[family-name:var(--font-family-body)] text-[15px] text-ink-secondary max-w-md leading-relaxed">
                Provision a free operator account in under a minute. Demo data shipped — log in
                with one of three sample roles to explore.
              </p>
              <div className="flex gap-3">
                <Link href="/register">
                  <ProtocolButton variant="primary" size="lg">
                    REQUEST CLEARANCE <ArrowRight size={14} />
                  </ProtocolButton>
                </Link>
                <Link href="/login">
                  <ProtocolButton variant="outline" size="lg">SIGN IN</ProtocolButton>
                </Link>
              </div>
            </div>
          </Panel>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────── */}
      <footer className="relative z-10 border-t border-edge/60 py-8 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <LogoMark size={20} />
            <span className="font-[family-name:var(--font-family-mono)] text-[11px] tracking-[0.18em] uppercase text-ink-tertiary">
              PROXIMA · ROBOTICS LMS
            </span>
          </div>
          <span className="font-[family-name:var(--font-family-mono)] text-[10px] tracking-[0.18em] uppercase text-ink-ghost">
            © 2026 · MISSION DECK · ALL SYSTEMS NOMINAL
          </span>
        </div>
      </footer>
    </div>
  )
}

/* ─────────────────────────────────────────────────────
   Hero Telemetry mock
   ───────────────────────────────────────────────────── */

function HeroTelemetry() {
  return (
    <Panel bracket variant="default" className="bg-surface-1/70 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Radar size={14} className="text-signal" />
          <Telemetry className="text-signal">DECK TELEMETRY</Telemetry>
        </div>
        <Telemetry className="text-ink-ghost">CH-00</Telemetry>
      </div>

      {/* Big number */}
      <div className="flex items-baseline gap-3 mb-1">
        <span className="font-[family-name:var(--font-family-display)] text-[68px] font-bold tracking-tighter leading-none text-rim-gradient tabular">
          47
        </span>
        <span className="font-[family-name:var(--font-family-mono)] text-[11px] tracking-[0.18em] uppercase text-ink-tertiary">
          ACTIVE OPERATORS
        </span>
      </div>
      <Telemetry className="text-success">▲ +12% week-over-week</Telemetry>

      <div className="my-5 h-px bg-edge" />

      <div className="grid grid-cols-2 gap-4 mb-5">
        <MicroStat label="COURSES" value="03" trend="up" />
        <MicroStat label="SUBMISSIONS" value="240" trend="up" />
        <MicroStat label="KITS DEPLOYED" value="32/95" trend="flat" />
        <MicroStat label="AVG GRADE" value="91.2" trend="up" />
      </div>

      <div className="flex items-center justify-between mb-2">
        <Telemetry className="text-ink-ghost">SIGNAL STRENGTH</Telemetry>
        <SignalBars value={85} />
      </div>
      <OrbitalProgress value={85} max={100} size="sm" />

      <div className="mt-5 pt-4 border-t border-edge flex items-center justify-between font-[family-name:var(--font-family-mono)] text-[10px] tracking-[0.16em] uppercase tabular">
        <span className="text-ink-ghost">LAT 14.7° N · LON 121.0° E</span>
        <span className="text-signal">● TRANSMITTING</span>
      </div>
    </Panel>
  )
}

function MicroStat({ label, value, trend }: { label: string; value: string; trend: "up" | "down" | "flat" }) {
  return (
    <div>
      <Telemetry className="text-ink-ghost block mb-0.5">{label}</Telemetry>
      <div className="flex items-baseline gap-1.5">
        <span className="font-[family-name:var(--font-family-display)] text-[20px] font-bold text-ink-primary tabular leading-none tracking-tight">
          {value}
        </span>
        <span
          className={
            trend === "up" ? "text-success text-[10px]" : trend === "down" ? "text-danger text-[10px]" : "text-ink-tertiary text-[10px]"
          }
        >
          {trend === "up" ? "▲" : trend === "down" ? "▼" : "—"}
        </span>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────
   Capability card
   ───────────────────────────────────────────────────── */

function CapabilityCard({
  channel,
  icon,
  title,
  tags,
  body,
  metric,
}: {
  channel: string
  icon: React.ReactNode
  title: string
  tags: string[]
  body: string
  metric: { label: string; value: string }
}) {
  return (
    <Panel bracket variant="default" className="group hover:bg-surface-3/40 transition-colors">
      <div className="flex items-start justify-between mb-5">
        <div className="w-10 h-10 rounded-[6px] bg-signal-muted border border-signal/30 flex items-center justify-center text-signal">
          {icon}
        </div>
        <Telemetry className="text-ink-ghost">{channel}</Telemetry>
      </div>
      <h3 className="font-[family-name:var(--font-family-display)] text-[20px] font-semibold text-ink-primary tracking-tight mb-3">
        {title}
      </h3>
      <p className="font-[family-name:var(--font-family-body)] text-[13px] text-ink-secondary leading-relaxed mb-5">
        {body}
      </p>
      <div className="flex flex-wrap gap-1.5 mb-5">
        {tags.map((t) => (
          <span
            key={t}
            className="font-[family-name:var(--font-family-mono)] text-[9px] tracking-[0.14em] uppercase text-ink-tertiary border border-edge px-1.5 py-0.5 rounded"
          >
            {t}
          </span>
        ))}
      </div>
      <div className="pt-4 border-t border-edge flex items-end justify-between">
        <Telemetry className="text-ink-ghost">{metric.label}</Telemetry>
        <span className="font-[family-name:var(--font-family-display)] text-[24px] font-bold text-signal tabular leading-none">
          {metric.value}
        </span>
      </div>
    </Panel>
  )
}

/* ─────────────────────────────────────────────────────
   Package card
   ───────────────────────────────────────────────────── */

function PackageCard({
  tier,
  tone,
  level,
  kit,
  price,
  modules,
  lessons,
  features,
  highlight = false,
}: {
  tier: string
  tone: "success" | "info" | "purple"
  level: string
  kit: string
  price: string
  modules: number
  lessons: number
  features: string[]
  highlight?: boolean
}) {
  return (
    <Panel
      bracket
      variant="default"
      className={`relative ${highlight ? "lg:-translate-y-3 ring-1 ring-signal/30 shadow-[0_0_48px_var(--color-signal-glow)]" : ""}`}
    >
      {highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <ProtocolBadge tone="signal" bracket>RECOMMENDED</ProtocolBadge>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <ProtocolBadge tone={tone} dot>{level}</ProtocolBadge>
        <Telemetry className="text-ink-ghost">{tier}</Telemetry>
      </div>

      <h3 className="font-[family-name:var(--font-family-display)] text-[22px] font-semibold text-ink-primary tracking-tight mb-1">
        {kit}
      </h3>
      <Telemetry className="text-ink-tertiary">PROXIMA-{tier.slice(0, 4)}</Telemetry>

      <div className="my-6 flex items-baseline gap-2">
        <span className="font-[family-name:var(--font-family-mono)] text-[14px] text-ink-tertiary">$</span>
        <span className="font-[family-name:var(--font-family-display)] text-[44px] font-bold text-ink-primary tabular leading-none tracking-tight">
          {price}
        </span>
        <span className="font-[family-name:var(--font-family-mono)] text-[11px] text-ink-tertiary uppercase tracking-[0.16em] ml-1">
          / SEAT
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-5">
        <CountStat label="MODULES" value={modules} />
        <CountStat label="LESSONS" value={lessons} />
      </div>

      <ul className="space-y-2 mb-6">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 font-[family-name:var(--font-family-body)] text-[13px] text-ink-secondary">
            <span className="mt-1 w-1 h-1 rounded-full bg-signal shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <Link href="/register" className="block">
        <ProtocolButton variant={highlight ? "primary" : "outline"} size="md" className="w-full">
          DEPLOY {tier} <ArrowRight size={12} />
        </ProtocolButton>
      </Link>
    </Panel>
  )
}

function CountStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-start gap-1 px-3 py-2 bg-surface-1 border border-edge rounded-[4px]">
      <Telemetry className="text-ink-ghost text-[9px]">{label}</Telemetry>
      <span className="font-[family-name:var(--font-family-display)] text-[20px] font-bold text-ink-primary tabular leading-none">
        {String(value).padStart(2, "0")}
      </span>
    </div>
  )
}

function DeckStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 p-3 bg-surface-1 border border-edge rounded-[4px]">
      <Telemetry className="text-ink-ghost">{label}</Telemetry>
      <span className="font-[family-name:var(--font-family-display)] text-[24px] font-bold text-ink-primary tabular leading-none tracking-tight">
        {value}
      </span>
    </div>
  )
}

/* ─────────────────────────────────────────────────────
   Mock deck preview (decorative)
   ───────────────────────────────────────────────────── */

function DeckMockup() {
  return (
    <Panel bracket variant="default" className="bg-surface-1/70 backdrop-blur-sm overflow-hidden p-0">
      {/* Window chrome */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-edge bg-surface-2/60">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-danger/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-warning/60" />
          <span className="w-2.5 h-2.5 rounded-full bg-success/60" />
          <Telemetry className="ml-3 text-ink-tertiary">deck.proxima/dashboard</Telemetry>
        </div>
        <StatusPip status="live" label="LIVE" />
      </div>

      {/* Body */}
      <div className="p-5 grid grid-cols-3 gap-3">
        <Panel variant="subtle" className="col-span-2 p-4">
          <Telemetry className="text-ink-ghost mb-2 block">MISSION BRIEF</Telemetry>
          <div className="font-[family-name:var(--font-family-display)] text-[28px] font-bold text-ink-primary leading-tight">
            Welcome, Operator.
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Tile label="ENROLLED" value="03" />
            <Tile label="PENDING" value="07" />
            <Tile label="GRADE" value="91" />
          </div>
        </Panel>

        <Panel variant="subtle" className="p-4 flex flex-col gap-3">
          <Telemetry className="text-signal">ACTIVITY</Telemetry>
          <div className="space-y-2">
            <ActivityRow label="LSN-029" status="success" />
            <ActivityRow label="LSN-014" status="warn" />
            <ActivityRow label="LSN-031" status="info" />
            <ActivityRow label="LSN-008" status="success" />
          </div>
        </Panel>

        <Panel variant="subtle" className="col-span-3 p-4">
          <div className="flex items-center justify-between mb-3">
            <Telemetry className="text-ink-ghost">PROGRESS · ROBOT PROGRAMMING</Telemetry>
            <span className="font-[family-name:var(--font-family-mono)] text-[11px] tabular text-signal">065/100</span>
          </div>
          <div className="h-1 bg-surface-3 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-signal-deep to-signal-hover rounded-full" style={{ width: "65%" }} />
          </div>
          <div className="mt-3 grid grid-cols-5 gap-1">
            {[true, true, true, true, false].map((on, i) => (
              <div key={i} className={`h-1 rounded ${on ? "bg-signal" : "bg-edge"}`} />
            ))}
          </div>
        </Panel>
      </div>
    </Panel>
  )
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-1 border border-edge rounded-[4px] px-2.5 py-2">
      <Telemetry className="text-ink-ghost block text-[9px]">{label}</Telemetry>
      <span className="font-[family-name:var(--font-family-display)] text-[18px] font-bold text-ink-primary tabular leading-none">
        {value}
      </span>
    </div>
  )
}

function ActivityRow({ label, status }: { label: string; status: "success" | "warn" | "info" }) {
  const colorMap = { success: "bg-success", warn: "bg-warning", info: "bg-info" }
  return (
    <div className="flex items-center justify-between font-[family-name:var(--font-family-mono)] text-[10px] tracking-[0.14em] uppercase">
      <span className="flex items-center gap-2 text-ink-tertiary">
        <span className={`w-1.5 h-1.5 rounded-full ${colorMap[status]}`} />
        {label}
      </span>
      <span className="text-ink-ghost tabular">T-{Math.floor(Math.random() * 24)}h</span>
    </div>
  )
}

/* unused-but-imported guard */
void Cpu
void GraduationCap
void Activity
