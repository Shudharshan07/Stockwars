import { memo } from 'react'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout = memo(({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen w-full bg-zinc-950 relative overflow-hidden">
      {/* Radial gradient in top-right corner with deep forest green at 10% opacity */}
      <div 
        className="absolute top-0 right-0 w-[800px] h-[800px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(6, 78, 59, 0.1) 0%, transparent 70%)',
          transform: 'translate(30%, -30%)'
        }}
      />
      {children}
    </div>
  )
})

Layout.displayName = 'Layout'