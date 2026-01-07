'use client'

import React from 'react'
import { useAuth } from '@/lib/AuthContext'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  // During loading, show a minimal state or just the children (usually handled by pages)
  // For layout shift prevention, we might want to default to showing navbar unless we know for sure?
  // But user data comes from localStorage which is fast.
  
  if (isLoading) return <>{children}</>

  const isDoctor = user?.role === 'doctor' || user?.role === 'admin'

  if (isDoctor) {
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
