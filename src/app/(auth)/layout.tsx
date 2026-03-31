export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-0 flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] animate-[fadeIn_0.25s_ease]">
        {children}
      </div>
    </div>
  )
}
