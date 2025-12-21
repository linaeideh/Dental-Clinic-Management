
export interface Procedure {
  id: string;
  title: string;
  description: string;
  category: 'General' | 'Surgery' | 'Cosmetic' | 'Orthodontics';
  duration: string;
  painLevel: 'Low' | 'Medium' | 'High';
  imageUrl: string;
  videoUrl?: string; // Placeholder for embedded video
  steps: string[];
  postCare: string[];
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  imageUrl: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  patientPhone?: string; // Added phone number
  date: string; // ISO date string
  time: string;
  doctorId: string;
  procedureId: string;
  notes?: string; // Added field for complaints/symptoms
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  reminderSent?: boolean; // Track if reminder was sent
}

export interface Testimonial {
  id: string;
  patientName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Schedule {
  id?: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  availableSlots: string[]; // Array of times ["10:00 صباحاً", ...]
  isDayOff: boolean;
}

export enum PageView {
  HOME = 'HOME',
  PROCEDURES = 'PROCEDURES',
  PROCEDURE_DETAIL = 'PROCEDURE_DETAIL',
  BOOKING = 'BOOKING',
  DASHBOARD = 'DASHBOARD',
  AI_DIAGNOSIS = 'AI_DIAGNOSIS',
  LOGIN = 'LOGIN'
}

export interface User {
  id: string;
  name: string;
  role: 'patient' | 'doctor' | 'admin';
  email?: string;
}