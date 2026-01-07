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
  const [schedules, setSchedules] = useState<any[]>([]); // Use 'any' temporarily or import Schedule
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        // We'll import these dynamically or at top level if possible, 
        // but for now let's assume standard imports are added.
        // Doing dynamic import for service to ensure client-side execution safety if needed,
        // though standard import is usually fine in 'use client' components.
        
        const { appointmentService } = await import('@/services/appointmentService');
        
        // Fetch appointments
        // If doctor, fetch for their ID. If patient, ideally we fetch by patient, 
        // but the service currently filters by DoctorId. 
        // For now let's just fetch all and filter in memory or update service.
        // Actually, let's just fetch all for now to verify.
        // Fetch appointments
        // Pass doctorId if doctor (first arg), patientPhone if patient (second arg)
        const doctorId = user.role === 'doctor' ? user.id : undefined;
        const patientPhone = user.role === 'patient' ? user.id : undefined;

        const pertinentApts = await appointmentService.fetchAppointments(doctorId, patientPhone);

        setAppointments(pertinentApts);

        // Fetch schedules
        let uniqueDoctorIds: string[] = [];
        
        if (user.role === 'doctor') {
            uniqueDoctorIds = [user.id];
        } else {
            // For patients, get unique doctors from their appointments to show relevant slots
            uniqueDoctorIds = Array.from(new Set(pertinentApts.map(a => a.doctorId).filter(Boolean)));
        }

        if (uniqueDoctorIds.length > 0) {
            // Fetch schedules for all relevant doctors
            // Note: Ideally we'd have a bulk fetch, but for now map promises
            const schedulesPromises = uniqueDoctorIds.map(id => appointmentService.fetchSchedules(id));
            const schedulesArrays = await Promise.all(schedulesPromises);
            const allSchedules = schedulesArrays.flat();
            setSchedules(allSchedules);
        }

      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, router]);

  if (!user) return null;

  // Handle setPage 
  const handleSetPage = (page: string) => {
    router.push(`/${page.toLowerCase()}`);
  };
  
  const handleUpdateStatus = async (id: string, status: any) => {
     const { appointmentService } = await import('@/services/appointmentService');
     const success = await appointmentService.updateAppointmentStatus(id, status);
     if (success) {
         setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
     }
  };

  const handleEditAppointment = async (apt: Appointment) => {
      const { appointmentService } = await import('@/services/appointmentService');
      const success = await appointmentService.updateAppointment(apt);
      
      if (success) {
        setAppointments(prev => prev.map(a => a.id === apt.id ? apt : a));
      }
  };

  const handleSaveSchedule = async (schedule: any) => {
      const { appointmentService } = await import('@/services/appointmentService');
      const success = await appointmentService.saveSchedule(schedule);
      if (success) {
          setSchedules(prev => {
              const exists = prev.find(s => s.date === schedule.date && s.doctorId === schedule.doctorId);
              if (exists) {
                  return prev.map(s => (s.date === schedule.date && s.doctorId === schedule.doctorId) ? schedule : s);
              }
              return [...prev, schedule];
          });
      }
  };

  if (loading) {
      return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-teal-600">جار التحميل...</div>;
  }

  return (
    <div className="pt-8">
      <Dashboard 
        user={user} 
        appointments={appointments} 
        setPage={handleSetPage}
        updateAppointmentStatus={handleUpdateStatus}
        editAppointment={handleEditAppointment} // Pass this if you want to support full editing
        saveSchedule={handleSaveSchedule}
        schedules={schedules}
      />
    </div>
  );
}
