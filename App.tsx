import React, { useState, useEffect } from 'react';
import { Analytics } from "@vercel/analytics/react";
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Procedures from './pages/Procedures';
import ProcedureDetail from './pages/ProcedureDetail';
import Booking from './pages/Booking';
import Dashboard from './pages/Dashboard';
import AIDiagnosis from './pages/AIDiagnosis';
import Login from './pages/Login';
import { PageView, Procedure, User, Appointment, Testimonial, Schedule } from './types';
import { supabase } from './services/supabaseClient';
import { MOCK_APPOINTMENTS, TESTIMONIALS as INITIAL_TESTIMONIALS } from './services/mockData';



function App() {
  const [currentPage, setCurrentPage] = useState<PageView>(PageView.HOME);
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);
  
  // User State
  const [user, setUser] = useState<User | null>(null);
  
  // Login State
  const [loginError, setLoginError] = useState('');

  // Data State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]); // Doctor Availability Schedules

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false); // Track if backend is unavailable

  // --- Supabase Operations ---

  // 1. Fetch Appointments
  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: true }); // Order by date
      
      if (error) throw error;
      
      if (data) {
        setIsOffline(false);
        // Map Supabase (snake_case) to Frontend (camelCase)
        const mappedAppointments: Appointment[] = data.map((item: any) => ({
          id: item.id,
          patientName: item.patient_name,
          patientPhone: item.patient_phone,
          doctorId: item.doctor_id,
          date: item.date,
          time: item.time,
          procedureId: item.procedure_id,
          notes: item.notes,
          status: item.status,
          reminderSent: item.reminder_sent // Map DB column to type
        }));
        setAppointments(mappedAppointments);
      }
    } catch (err: any) {
      // Check for "Table not found" or connection errors
      if (err.code === 'PGRST205' || err.message?.includes('fetch')) {
         console.warn('Backend table not found or offline. Switching to Demo Mode.');
         setIsOffline(true);
      } else {
         console.warn('Supabase fetch warning:', err.message || err);
      }
      
      // Fallback logic: If we have no appointments yet, load mock data
      if (appointments.length === 0) {
        setAppointments(MOCK_APPOINTMENTS);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Fetch Testimonials
  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('date', { ascending: false }); // Newest first

      if (error) throw error;

      if (data && data.length > 0) {
        const mappedTestimonials: Testimonial[] = data.map((item: any) => ({
          id: item.id,
          patientName: item.patient_name,
          rating: item.rating,
          comment: item.comment,
          date: item.date
        }));
        setTestimonials(mappedTestimonials);
      } else {
        // If table exists but empty, or just fallback
         if (testimonials.length === 0) {
            setTestimonials(INITIAL_TESTIMONIALS);
         }
      }
    } catch (err: any) {
      console.warn('Could not fetch testimonials from DB, using mock data:', err.message);
      setTestimonials(INITIAL_TESTIMONIALS);
    }
  };

  // 3. Fetch Schedules
  const fetchSchedules = async () => {
      try {
          const { data, error } = await supabase.from('schedules').select('*');
          if (error) throw error;
          if (data) {
              const mappedSchedules: Schedule[] = data.map((item: any) => ({
                  id: item.id,
                  doctorId: item.doctor_id,
                  date: item.date,
                  availableSlots: item.available_slots || [],
                  isDayOff: item.is_day_off
              }));
              setSchedules(mappedSchedules);
          }
      } catch (err) {
          console.warn('Schedules fetch error (feature might not be set up in DB):', err);
      }
  };

  // Load data on mount
  useEffect(() => {
    fetchAppointments();
    fetchTestimonials();
    fetchSchedules();
  }, []);

  // 4. Add Appointment
  const addAppointment = async (apt: Appointment) => {
    
    // Step 0: Check Availability (Concurrency Check)
    if (!isOffline) {
        try {
            const { data: conflicts } = await supabase
                .from('appointments')
                .select('id')
                .eq('doctor_id', apt.doctorId)
                .eq('date', apt.date)
                .eq('time', apt.time)
                .neq('status', 'Cancelled'); // Ignore cancelled appointments

            if (conflicts && conflicts.length > 0) {
                alert('عذراً، يبدو أن هذا الموعد قد تم حجزه للتو من قبل مريض آخر. يرجى تحديث الصفحة واختيار موعد آخر.');
                fetchAppointments(); // Refresh to show taken slots
                return;
            }
        } catch (checkErr) {
            console.error("Error checking availability:", checkErr);
        }
    }

    // Optimistic Update: Update UI immediately with temporary ID
    const tempId = apt.id;
    setAppointments(prev => [...prev, apt]);

    try {
      const payload: any = {
        patient_name: apt.patientName,
        patient_phone: apt.patientPhone,
        doctor_id: apt.doctorId,
        date: apt.date,
        time: apt.time,
        procedure_id: apt.procedureId,
        notes: apt.notes,
        status: apt.status,
        reminder_sent: false
      };

      // Attempt to insert and retrieve the real ID generated by DB
      let { data, error } = await supabase.from('appointments').insert([payload]).select();

      // Fallback: If column 'reminder_sent' is missing, retry without it
      if (error && error.message && (error.message.includes('reminder_sent') || error.message.includes('column'))) {
          delete payload.reminder_sent;
          const retry = await supabase.from('appointments').insert([payload]).select();
          data = retry.data;
          error = retry.error;
      }

      if (error) {
        if (error.code === 'PGRST205') {
            setIsOffline(true);
        }
        throw error;
      }

      // If successful, update local state with Real UUID
      if (data && data.length > 0) {
          const realId = data[0].id;
          setAppointments(prev => prev.map(a => a.id === tempId ? { ...a, id: realId } : a));
          setIsOffline(false);
      }
    } catch (err: any) {
      console.error('Supabase insert failed, data saved locally only:', err.message || err);
    }

    // Auto-login logic if not logged in
    if (!user) {
      setUser({
          id: 'u_' + apt.patientPhone,
          name: apt.patientName,
          role: 'patient',
          email: ''
      });
    }
  };

  // 5. Update Status
  const updateAppointmentStatus = async (id: string, status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled') => {
    // Optimistic Update
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      setIsOffline(false);
    } catch (err) {
      console.error('Unexpected error updating status:', err);
    }
  };

  // 6. Edit Appointment Details
  const editAppointment = async (updatedApt: Appointment) => {
    // Optimistic Update
    setAppointments(prev => prev.map(a => a.id === updatedApt.id ? updatedApt : a));

    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          patient_name: updatedApt.patientName,
          patient_phone: updatedApt.patientPhone,
          date: updatedApt.date,
          time: updatedApt.time,
          notes: updatedApt.notes,
          status: updatedApt.status
        })
        .eq('id', updatedApt.id);

      if (error) {
        console.error('Error editing appointment in DB:', error.message);
      } else {
        setIsOffline(false);
      }
    } catch (err) {
      console.error('Unexpected error editing appointment:', err);
    }
  };

  // 7. Delete Appointment
  const deleteAppointment = async (id: string) => {
    // Optimistic Update
    setAppointments(prev => prev.filter(a => a.id !== id));

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting appointment in DB:', error.message);
      } else {
        setIsOffline(false);
      }
    } catch (err) {
      console.error('Unexpected error deleting appointment:', err);
    }
  };

  // 8. Mark Reminder as Sent
  const markReminderAsSent = async (id: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, reminderSent: true } : a));
    if (isOffline) return;
    try {
      await supabase.from('appointments').update({ reminder_sent: true }).eq('id', id);
    } catch (err) { console.error(err); }
  };

  // 9. Add Testimonial
  const addTestimonial = async (newTestimonial: Testimonial) => {
    setTestimonials(prev => [newTestimonial, ...prev]);
    try {
        await supabase.from('testimonials').insert([{
            patient_name: newTestimonial.patientName,
            rating: newTestimonial.rating,
            comment: newTestimonial.comment,
            date: newTestimonial.date
        }]);
    } catch (err) { console.error(err); }
  };

  // 10. Update Schedule (For Doctor)
  const saveSchedule = async (schedule: Schedule) => {
      // Optimistic update
      const existingIndex = schedules.findIndex(s => s.date === schedule.date && s.doctorId === schedule.doctorId);
      let newSchedules = [...schedules];
      if (existingIndex >= 0) {
          newSchedules[existingIndex] = schedule;
      } else {
          newSchedules.push(schedule);
      }
      setSchedules(newSchedules);

      try {
          // Upsert works if we have a unique constraint on (doctor_id, date) in SQL
          const { error } = await supabase.from('schedules').upsert({
              doctor_id: schedule.doctorId,
              date: schedule.date,
              available_slots: schedule.availableSlots,
              is_day_off: schedule.isDayOff
          }, { onConflict: 'doctor_id, date' });
          
          if (error) throw error;
      } catch (err: any) {
          console.error("Error saving schedule:", err.message);
      }
  };

  // --- Authentication Logic ---

  // Check if phone exists in DB
  const handlePatientLogin = async (phone: string) => {
    if (!phone) {
        setLoginError('يرجى إدخال رقم الهاتف');
        return;
    }
    setLoginError('');

    try {
      // First, try to find in current local state (which might be mock data)
      const localUser = appointments.find(a => a.patientPhone === phone);
      
      if (localUser) {
           setUser({
              id: 'u_' + phone,
              name: localUser.patientName,
              role: 'patient',
              email: ''
          });
          setCurrentPage(PageView.DASHBOARD);
          return;
      }

      // If we are definitely offline (table missing), fallback
      if (isOffline) {
          if (phone === '0791234567') { // Allow default demo user
             setUser({ id: 'u_demo', name: 'زائر تجريبي', role: 'patient', email: '' });
             setCurrentPage(PageView.DASHBOARD);
          } else {
             setLoginError('عذراً، لم نعثر على ملف بهذا الرقم. يرجى حجز موعد جديد.');
          }
          return;
      }

      // If online, try Supabase
      const { data, error } = await supabase
        .from('appointments')
        .select('patient_name, patient_phone')
        .eq('patient_phone', phone)
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
          const patientData = data[0];
          setUser({
              id: 'u_' + phone,
              name: patientData.patient_name,
              role: 'patient',
              email: ''
          });
          setCurrentPage(PageView.DASHBOARD);
          // Refresh data to get user's appointments
          fetchAppointments(); 
      } else {
          setLoginError('عذراً، لم نعثر على ملف بهذا الرقم. يرجى حجز موعد جديد.');
      }
    } catch (err: any) {
      // Handle "Table not found" specifically
      if (err.code === 'PGRST205' || err.message?.includes('Could not find the table')) {
          console.warn('Backend table missing. Switching to offline mode.');
          setIsOffline(true);
          // Retry logic locally if needed, or just tell user:
          if (phone === '0791234567') {
             setUser({ id: 'u_demo', name: 'زائر تجريبي', role: 'patient', email: '' });
             setCurrentPage(PageView.DASHBOARD);
          } else {
             setLoginError('عذراً، لم نعثر على ملف بهذا الرقم (وضع العرض التجريبي). يرجى حجز موعد جديد.');
          }
      } else {
          console.error('Login Error:', err.message || err);
          setLoginError('حدث خطأ في الاتصال. يرجى المحاولة لاحقاً.');
      }
    }
  };

  // Simple Mock Login for Doctor
  const handleDoctorLogin = () => {
      setUser({
          id: 'd1',
          name: 'د. محمد',
          role: 'doctor',
          email: 'dr.mohammed@clinic.com'
      });
      setCurrentPage(PageView.DASHBOARD);
      fetchAppointments();
      fetchSchedules();
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage(PageView.HOME);
    setLoginError('');
  };

  // --- Rendering ---

  const renderPage = () => {
    switch (currentPage) {
      case PageView.HOME:
        return <Home setPage={setCurrentPage} testimonials={testimonials} />;
      case PageView.PROCEDURES:
        return <Procedures setPage={setCurrentPage} setSelectedProcedure={setSelectedProcedure} />;
      case PageView.PROCEDURE_DETAIL:
        return <ProcedureDetail procedure={selectedProcedure} setPage={setCurrentPage} />;
      case PageView.BOOKING:
        return <Booking 
                  setPage={setCurrentPage} 
                  addAppointment={addAppointment} 
                  schedules={schedules}
                  existingAppointments={appointments}
               />;
      case PageView.DASHBOARD:
        return user ? 
            <Dashboard 
                user={user} 
                appointments={appointments} 
                setPage={setCurrentPage} 
                updateAppointmentStatus={updateAppointmentStatus}
                editAppointment={editAppointment}
                deleteAppointment={deleteAppointment}
                markReminderAsSent={markReminderAsSent}
                addTestimonial={addTestimonial}
                saveSchedule={saveSchedule} // Pass schedule saver
                schedules={schedules} // Pass schedules data
            /> : 
            <div className="text-center py-20 animate-fade-in">يرجى تسجيل الدخول</div>;
      case PageView.AI_DIAGNOSIS:
        return <AIDiagnosis />;
      case PageView.LOGIN:
        return (
          <Login 
            onPatientLogin={handlePatientLogin} 
            onDoctorLogin={handleDoctorLogin} 
            error={loginError} 
          />
        );
      default:
        return <Home setPage={setCurrentPage} testimonials={testimonials} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-gray-800">
      <Navbar 
        setPage={setCurrentPage} 
        currentPage={currentPage} 
        user={user} 
        onLogout={handleLogout}
      />
      {/* Increased padding-top to pt-28 to prevent navbar overlap */}
      <main className="flex-grow pt-28">
        {renderPage()}
      </main>
      <Footer />
      <Analytics />
    </div>
  );
}

export default App;