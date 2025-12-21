'use client'

import dynamic from "next/dynamic";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Appointment } from "@/types";

const Dashboard = dynamic(() => import("@/components/pages/Dashboard"), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-slate-50 animate-pulse" />,
});

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  // Handle setPage for legacy support or redirect
  const handleSetPage = (page: string) => {
    router.push(`/${page.toLowerCase()}`);
  };

  return (
    <div className="pt-8">
      <Dashboard 
        user={user} 
        appointments={appointments} 
        setPage={handleSetPage}
      />
    </div>
  );
}
