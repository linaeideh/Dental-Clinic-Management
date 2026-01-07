import React from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const pathname = usePathname()

  if (isLoading) return <>{children}</>

  // Only hide Navbar/Footer if user is doctor/admin AND matches specific dashboard routes
  // Or if we decide doctors should never see the public navbar (which is rare). 
  // Better: Hide if on dashboard pages.
  const isDashboardPage = pathname?.startsWith('/dashboard')
  const isDoctor = user?.role === 'doctor' || user?.role === 'admin'

  // Refined Logic warning: If a doctor goes to Home '/', they should see Navbar.
  // If they go to '/dashboard', they see the Sidebar/Dashboard Layout (which has its own header).
  
  // We hide the MAIN Navbar if:
  // 1. It's a Doctor ON the dashboard (using dashboard header)
  // 2. Or maybe we want to hide it always for doctors? (User complaint suggests "it disappears", implies unwanted).
  // Let's assume they want it VISIBLE on phone unless explicitly on a full-screen tool.
  
  // Actually, the user's specific complaint "Why on phone screen it disappears navbar" 
  // might be referring to the guest view? 
  // Let's ensure we fix the Route-Based hiding first.
  
  const shouldHideLayout = isDoctor && isDashboardPage

  if (shouldHideLayout) {
    return (
      <main className="min-h-screen bg-slate-50">
        {children}
      </main>
    )
  }

  return (
    <>
      <Navbar />
      <main className="flex-grow pt-28">
        {children}
      </main>
      <Footer />
    </>
  )
}
