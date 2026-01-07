import { supabase } from './supabaseClient';
import { Appointment, Schedule } from '@/types';
import { MOCK_APPOINTMENTS, DOCTORS } from './mockData';

const APPOINTMENTS_STORAGE_KEY = 'dental_app_appointments';
const SCHEDULES_STORAGE_KEY = 'dental_app_schedules';

// Helper to get local appointments
const getLocalAppointments = (): Appointment[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

// Helper to save local appointments
const saveLocalAppointments = (apts: Appointment[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(apts));
  }
};

export const appointmentService = {
  // --- Connection Check ---
  async checkConnection(): Promise<boolean> {
      try {
          const { error } = await supabase.from('appointments').select('count', { count: 'exact', head: true });
          return !error;
      } catch {
          return false;
      }
  },

  // --- Appointments ---
  
  async fetchAppointments(doctorId?: string, patientPhone?: string): Promise<Appointment[]> {
    try {
        // Try Supabase first
        let query = supabase.from('appointments').select('*');
        // If doctorId is 'd1' (default test user), fetch ALL appointments (effectively Admin view)
        // Otherwise, filter by specific doctor ID
        if (doctorId && doctorId !== 'd1') query = query.eq('doctor_id', doctorId);
        if (patientPhone) query = query.eq('patient_phone', patientPhone);
        
        const { data, error } = await query.order('date', { ascending: false });

        if (error || !data) throw new Error(error?.message || 'No data');

        return data.map((row: any) => ({
            id: row.id,
            patientName: row.patient_name,
            patientPhone: row.patient_phone,
            date: row.date,
            time: row.time,
            doctorId: row.doctor_id,
            procedureId: row.procedure_id,
            notes: row.notes,
            status: row.status as any,
            reminderSent: false,
        }));
    } catch (err) {
        console.warn("Supabase fetch failed, falling back to local/mock data:", err);
        
        // 1. Get Static Mocks
        let allAppointments = [...MOCK_APPOINTMENTS];

        // 2. Merge with LocalStorage (Client-side persistence)
        const localApts = getLocalAppointments();
        // Avoid duplicates if any
        const localIds = new Set(localApts.map(a => a.id));
        allAppointments = [...allAppointments.filter(a => !localIds.has(a.id)), ...localApts];

        // 3. Filter
        if (doctorId && doctorId !== 'd1') allAppointments = allAppointments.filter(a => a.doctorId === doctorId);
        if (patientPhone) allAppointments = allAppointments.filter(a => a.patientPhone === patientPhone);
        
        return allAppointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }
  },

  async checkAvailability(doctorId: string, date: string, time: string): Promise<boolean> {
      try {
        const { data: conflicts, error } = await supabase
            .from('appointments')
            .select('id')
            .eq('doctor_id', doctorId)
            .eq('date', date)
            .eq('time', time)
            .neq('status', 'Cancelled');
            
        if (error) throw error;
        return !(conflicts && conflicts.length > 0);
      } catch (err) {
          console.warn("Availability check failed, checking local mocks:", err);
          
          // Check against local data
          const localApts = [...MOCK_APPOINTMENTS, ...getLocalAppointments()];
          const conflict = localApts.find(a => 
            a.doctorId === doctorId && 
            a.date.startsWith(date) && 
            a.time === time &&
            a.status !== 'Cancelled'
          );

          return !conflict;
      }
  },

  async createAppointment(apt: Partial<Appointment>): Promise<boolean> {
    const dbRow = {
      patient_name: apt.patientName,
      patient_phone: apt.patientPhone,
      doctor_id: apt.doctorId,
      procedure_id: apt.procedureId,
      date: apt.date,
      time: apt.time,
      notes: apt.notes,
      status: apt.status || 'Pending'
    };

    try {
        const { error } = await supabase.from('appointments').insert([dbRow]);
        if (error) throw error;
        return true;
    } catch (err) {
        console.error('Supabase insert failed, saving locally (Mock):', err);
        
        // Save to LocalStorage
        const newApt: Appointment = {
            id: `local_${Date.now()}`,
            patientName: apt.patientName || 'Unknown',
            patientPhone: apt.patientPhone,
            doctorId: apt.doctorId!,
            procedureId: apt.procedureId!,
            date: apt.date!,
            time: apt.time!,
            notes: apt.notes,
            status: apt.status || 'Confirmed',
            reminderSent: false
        };

        const currentLocal = getLocalAppointments();
        saveLocalAppointments([...currentLocal, newApt]);
        
        return true;
    }
  },

  async updateAppointmentStatus(id: string, status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled', notes?: string): Promise<boolean> {
    const updateData: any = { status };
    if (notes) updateData.notes = notes;

    try {
        const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id);

        if (error) throw error;
        return true;
    } catch (err) {
         console.warn("Supabase update failed, updating locally:", err);
         const currentLocal = getLocalAppointments();
         const updated = currentLocal.map(a => a.id === id ? { ...a, ...updateData } : a);
         
         const wasStatic = MOCK_APPOINTMENTS.find(a => a.id === id);
         if (wasStatic && !currentLocal.find(a => a.id === id)) {
             updated.push({ ...wasStatic, ...updateData });
         }

         saveLocalAppointments(updated);
         return true;
    }
  },

  async updateAppointment(apt: Appointment): Promise<boolean> {
      const dbRow = {
          patient_name: apt.patientName,
          patient_phone: apt.patientPhone,
          doctor_id: apt.doctorId,
          procedure_id: apt.procedureId,
          date: apt.date,
          time: apt.time,
          notes: apt.notes,
          status: apt.status
      };

      try {
          const { error } = await supabase
            .from('appointments')
            .update(dbRow)
            .eq('id', apt.id);
          
          if (error) throw error;
          return true;
      } catch (err) {
          console.warn("Supabase full update failed, updating locally:", err);
          const currentLocal = getLocalAppointments();
          let updated = currentLocal.map(a => a.id === apt.id ? apt : a);

          // Copy-on-write regarding static mocks
          const wasStatic = MOCK_APPOINTMENTS.find(a => a.id === apt.id);
          const inLocal = currentLocal.find(a => a.id === apt.id);
          
          if (wasStatic && !inLocal) {
              updated.push(apt);
          }
           
          saveLocalAppointments(updated);
          return true;
      }
  },

  // --- Doctor Schedule ---

  async fetchSchedules(doctorId: string): Promise<Schedule[]> {
      try {
        const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('doctor_id', doctorId);
        
        if (error) throw error;
        
        return (data || []).map((row: any) => ({
            id: row.id,
            doctorId: row.doctor_id,
            date: row.date,
            availableSlots: row.available_slots || [],
            isDayOff: row.is_day_off
        }));
      } catch (err) {
           console.warn("Schedule fetch failed, falling back to mock schedules:", err);
           // Generate a mock schedule for the next 14 days
           const mocks: Schedule[] = [];
           const today = new Date();
           for(let i=0; i<14; i++) {
               const d = new Date(today);
               d.setDate(today.getDate() + i);
               mocks.push({
                   id: `mock_sch_${i}`,
                   doctorId: doctorId,
                   date: d.toISOString().split('T')[0],
                   availableSlots: ['10:00 صباحاً', '11:00 صباحاً', '12:00 مساءً', '04:00 مساءً'],
                   isDayOff: d.getDay() === 5 // Friday off
               });
           }
           return mocks;
      }
  },

  async saveSchedule(schedule: Schedule): Promise<boolean> {
      // Mock save schedule (not persisting implementation for simplicity unless requested)
      return true;
  },
  
  async findPatientByPhone(phone: string): Promise<string | null> {
      // Check Supabase first
      const { data, error } = await supabase
      .from('appointments')
      .select('patient_name')
      .eq('patient_phone', phone)
      .limit(1)
      .maybeSingle();

      if (!error && data) return data.patient_name;

      // Check Local Mock Data
      const localApts = [...MOCK_APPOINTMENTS, ...getLocalAppointments()];
      const found = localApts.find(a => a.patientPhone === phone);
      return found ? found.patientName : null;
  }
};
