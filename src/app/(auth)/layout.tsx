export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-surface-0">
      <div className="w-full max-w-[460px] animate-[fadeIn_0.3s_ease]">
        {children}
      </div>
    </div>
  )
}
