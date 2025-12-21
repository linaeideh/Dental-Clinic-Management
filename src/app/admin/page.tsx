'use client'

import Dashboard from "@/components/pages/Dashboard";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Appointment } from "@/types";

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  // Handle setPage for legacy support
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
