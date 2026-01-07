import React, { useState } from 'react';
import { Appointment, User, PageView, Testimonial, Schedule } from '@/types';
import { PROCEDURES, DEFAULT_TIME_SLOTS } from '@/services/mockData';
import { sendAppointmentReminder } from '@/services/notificationService';
import { 
    Calendar, Clock, FileText, AlertCircle, Phone, User as UserIcon, CheckCircle, 
    XCircle, Trash2, Edit, Save, X, Bell, Send, Lock, Star, MessageCircle, 
    Settings, Coffee, ChevronLeft, ChevronRight, LogOut, Filter, Users, CalendarCheck, Clock3 
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

interface DashboardProps {
  user: User;
  appointments: Appointment[];
  setPage: (page: PageView) => void;
  updateAppointmentStatus?: (id: string, status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled') => void;
  editAppointment?: (apt: Appointment) => void;
  deleteAppointment?: (id: string) => void;
  markReminderAsSent?: (id: string) => void;
  addTestimonial?: (testimonial: Testimonial) => void;
  saveSchedule?: (schedule: Schedule) => void;
  schedules?: Schedule[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, appointments, setPage, updateAppointmentStatus, editAppointment, deleteAppointment, markReminderAsSent, addTestimonial, saveSchedule, schedules = [] }) => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'appointments' | 'schedule'>('appointments');
  const [editingApt, setEditingApt] = useState<Appointment | null>(null);
  const [sendingReminderId, setSendingReminderId] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled'>('All');
  const [cancelModalId, setCancelModalId] = useState<string | null>(null);

  // Check Connection on Mount
  React.useEffect(() => {
      const check = async () => {
          const { appointmentService } = await import('@/services/appointmentService');
          const status = await appointmentService.checkConnection();
          setIsConnected(status);
      };
      check();
  }, []);


  // Schedule State - Timeline
  const [selectedDateForSchedule, setSelectedDateForSchedule] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const formatDate = (isoDate: string) => {
      const d = new Date(isoDate);
      return d.toLocaleDateString('en-GB'); // DD/MM/YYYY
  };

  const getProcedureName = (id: string) => {
      if (id === 'other') return 'استشارة عامة / أخرى';
      // Try to find in mock data
      const proc = PROCEDURES.find(p => p.id === id);
      if (proc) return proc.title;
      
      // If not found and looks like a UUID or Sanity ID
      if (id.length > 10) return 'إجراء طبي'; 
      
      return id;
  };

  const handleDelete = (id: string) => {
      if (window.confirm('هل أنت متأكد من رغبتك في حذف هذا السجل نهائياً؟')) {
          deleteAppointment?.(id);
      }
  };

  const handlePatientCancel = (id: string) => {
      setCancelModalId(id);
  };

  const confirmCancel = (reason: string) => {
      if (!cancelModalId) return;
      const id = cancelModalId;
      
      const apt = appointments.find(a => a.id === id);
      if (editAppointment && apt) {
          const timestamp = new Date().toLocaleDateString('en-GB');
          const reasonText = reason.trim() ? `: ${reason}` : '';
          const noteEntry = `\n[إلغاء ${timestamp}${reasonText}]`;
          editAppointment({ ...apt, status: 'Cancelled', notes: (apt.notes || '') + noteEntry });
      } else if (updateAppointmentStatus) {
          updateAppointmentStatus(id, 'Cancelled');
      } else {
          deleteAppointment?.(id);
      }
      setCancelModalId(null);
  };

  const handleSaveEdit = (updatedApt: Appointment) => {
      if (editAppointment) {
          editAppointment(updatedApt);
          setEditingApt(null);
      }
  };

  const handleSendReminder = async (apt: Appointment) => {
      setSendingReminderId(apt.id);
      const res = await sendAppointmentReminder(apt);
      if (res.success) {
          alert(res.message);
          markReminderAsSent?.(apt.id);
      }
      setSendingReminderId(null);
  };

  const handleSubmitReview = (rating: number, comment: string) => {
    if (addTestimonial) {
        addTestimonial({
            id: 't_' + Math.random().toString(36).substr(2, 9),
            patientName: user.name,
            rating,
            comment,
            date: new Date().toISOString().split('T')[0]
        });
    }
    setShowReviewModal(false);
  };

  // --- Schedule Logic ---
  const defaultSlots = DEFAULT_TIME_SLOTS;

  // Generate next 14 days
  const getTimelineDays = () => {
      const days = [];
      const today = new Date();
      for (let i = 0; i < 14; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          days.push(d);
      }
      return days;
  };
  
  const timelineDays = getTimelineDays();

  const getScheduleForDate = (date: string) => {
      // Check if it's a Friday
      const dayOfWeek = new Date(date).getDay();
      const isFriday = dayOfWeek === 5;
      
      const existing = schedules.find(s => s.date === date && s.doctorId === user.id);
      
      if (existing) return existing;

      // Default logic: Friday is off, others are open with default slots
      return {
          doctorId: user.id,
          date: date,
          availableSlots: isFriday ? [] : defaultSlots,
          isDayOff: isFriday
      };
  };

  const currentSchedule = getScheduleForDate(selectedDateForSchedule);

  const triggerSave = (newSchedule: Schedule) => {
      saveSchedule?.(newSchedule);
      setLastSaved(Date.now());
      setTimeout(() => setLastSaved(null), 2000);
  };

  const toggleSlot = (slot: string) => {
      if (currentSchedule.isDayOff) return;
      const newSlots = currentSchedule.availableSlots.includes(slot)
          ? currentSchedule.availableSlots.filter(s => s !== slot)
          : [...currentSchedule.availableSlots, slot];
      
      triggerSave({ ...currentSchedule, availableSlots: newSlots });
  };

  const toggleDayOff = () => {
      triggerSave({ 
          ...currentSchedule, 
          isDayOff: !currentSchedule.isDayOff,
          availableSlots: !currentSchedule.isDayOff ? [] : defaultSlots // Reset slots if turning off day off
      });
  };

  const isTomorrow = (dateString: string) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const target = new Date(dateString);
    return target.toDateString() === tomorrow.toDateString();
  };

  const getStatusBadgeClass = (status: string) => {
      switch (status) {
          case 'Confirmed': return 'bg-blue-100 text-blue-700 border-blue-200';
          case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
          case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
          default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      }
  };

  const getStatusLabel = (status: string) => {
      switch (status) {
          case 'Confirmed': return 'مؤكد';
          case 'Completed': return 'منجز';
          case 'Cancelled': return 'ملغي';
          default: return 'انتظار';
      }
  };

  // --- DOCTOR VIEW ---
  if (user.role === 'doctor') {
      let filteredAppointments = [...appointments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // Filter Logic
      if (filterStatus !== 'All') {
          filteredAppointments = filteredAppointments.filter(a => a.status === filterStatus);
      }

      const dueReminders = appointments.filter(a => isTomorrow(a.date) && a.status !== 'Cancelled' && a.status !== 'Completed' && !a.reminderSent);
      
      const stats = {
          today: appointments.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length,
          pending: appointments.filter(a => a.status === 'Pending').length,
          total: appointments.length
      };

      return (
          <div className="max-w-7xl mx-auto px-4 py-8 relative animate-fade-in">
             {/* Header with Logout */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-xl">
                          {user.name.charAt(0)}
                      </div>
                      <div>
                          <h1 className="text-2xl font-bold text-gray-900">أهلاً دكتور {user.name}</h1>
                          <div className="flex items-center gap-2 mt-1">
                                {isConnected !== null && (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border flex items-center gap-1 ${isConnected ? 'bg-green-50 text-green-700 border-green-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-orange-500 animate-pulse'}`}></div>
                                        {isConnected ? 'متصل' : 'غير متصل'}
                                    </span>
                                )}
                                <span className="text-xs text-gray-400">|</span>
                                <span className="text-xs text-gray-500">{new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                      </div>
                  </div>
                  <div className="flex gap-3">
                       <button 
                        onClick={() => setActiveTab('schedule')}
                        className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 ${activeTab === 'schedule' ? 'bg-teal-600 text-white shadow-lg' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                      >
                          <Settings size={18} /> دوام العيادة
                      </button>
                      <button 
                        onClick={() => setActiveTab('appointments')}
                        className={`px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 ${activeTab === 'appointments' ? 'bg-teal-600 text-white shadow-lg' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                      >
                          <CalendarCheck size={18} /> الحجوزات
                      </button>
                      <button 
                        onClick={logout}
                        className="px-4 py-2.5 rounded-xl font-bold text-red-500 bg-red-50 hover:bg-red-100 transition flex items-center gap-2"
                      >
                          <LogOut size={18} /> خروج
                      </button>
                  </div>
              </div>

              {activeTab === 'appointments' ? (
                <>
                   {/* Top Section: Reminders & Stats */}
                   <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                       {/* Stats Cards */}
                       <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-4">
                           <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                               <div>
                                   <div className="text-gray-500 text-xs font-bold mb-1">مواعيد اليوم</div>
                                   <div className="text-2xl font-bold text-gray-900">{stats.today}</div>
                               </div>
                               <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center"><Clock3 size={20}/></div>
                           </div>
                           <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                               <div>
                                   <div className="text-gray-500 text-xs font-bold mb-1">طلبات جديدة</div>
                                   <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
                               </div>
                               <div className="w-10 h-10 rounded-full bg-yellow-50 text-yellow-500 flex items-center justify-center"><AlertCircle size={20}/></div>
                           </div>
                           <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
                               <div>
                                   <div className="text-gray-500 text-xs font-bold mb-1">إجمالي الحجوزات</div>
                                   <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                               </div>
                               <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-500 flex items-center justify-center"><Users size={20}/></div>
                           </div>
                       </div>

                       {/* Due Reminders */}
                       <div className="lg:col-span-3 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                           <h2 className="text-lg font-bold text-orange-800 mb-4 flex items-center gap-2">
                              <Bell size={20} className={dueReminders.length > 0 ? "animate-pulse" : ""}/> تذكيرات الغد
                              {dueReminders.length > 0 && <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full">{dueReminders.length}</span>}
                           </h2>
                           {dueReminders.length === 0 ? (
                               <div className="text-center py-6 text-gray-400 text-sm bg-gray-50 rounded-xl border-dashed border-2 border-gray-200">
                                   لا توجد تذكيرات مطلوبة ليوم غد
                               </div>
                           ) : (
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                   {dueReminders.map(apt => (
                                     <div key={apt.id} className="bg-orange-50 p-3 rounded-xl border border-orange-100 flex items-center justify-between">
                                          <div>
                                              <div className="font-bold text-gray-800 text-sm">{apt.patientName}</div>
                                              <div className="text-xs text-gray-500" dir="ltr">{apt.time}</div>
                                          </div>
                                          <button onClick={() => handleSendReminder(apt)} disabled={sendingReminderId === apt.id} className="bg-white text-orange-700 w-8 h-8 rounded-full shadow-sm flex items-center justify-center hover:bg-orange-100 transition">
                                              {sendingReminderId === apt.id ? '...' : <Send size={14}/>}
                                          </button>
                                     </div>
                                   ))}
                               </div>
                           )}
                       </div>
                   </div>

                  {/* Filters */}
                   <div className="flex flex-wrap gap-2 mb-6">
                       <button onClick={() => setFilterStatus('All')} className={`px-4 py-2 rounded-full text-sm font-bold transition border ${filterStatus === 'All' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>الكل</button>
                       <button onClick={() => setFilterStatus('Confirmed')} className={`px-4 py-2 rounded-full text-sm font-bold transition border ${filterStatus === 'Confirmed' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>مؤكدة</button>
                       <button onClick={() => setFilterStatus('Pending')} className={`px-4 py-2 rounded-full text-sm font-bold transition border ${filterStatus === 'Pending' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>الانتظار</button>
                       <button onClick={() => setFilterStatus('Completed')} className={`px-4 py-2 rounded-full text-sm font-bold transition border ${filterStatus === 'Completed' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>منجزة</button>
                       <button onClick={() => setFilterStatus('Cancelled')} className={`px-4 py-2 rounded-full text-sm font-bold transition border ${filterStatus === 'Cancelled' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>ملغاة</button>
                   </div>

                  {/* Mobile Appointment Cards */}
                  <div className="md:hidden space-y-4">
                      {filteredAppointments.length === 0 ? (
                          <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border-dashed border-2 border-gray-200">
                             لا توجد حجوزات تطابق الفلتر المختار
                          </div>
                      ) : (
                          filteredAppointments.map(apt => (
                              <div key={apt.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
                                  <div className="flex justify-between items-start">
                                      <div>
                                          <div className="font-bold text-gray-900 text-lg">{apt.patientName}</div>
                                          {apt.patientPhone && <div className="text-sm text-gray-500 font-mono dir-ltr mt-1">{apt.patientPhone}</div>}
                                      </div>
                                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(apt.status)}`}>{getStatusLabel(apt.status)}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                      <div className="flex items-center gap-2">
                                          <Calendar size={16} className="text-teal-500"/>
                                          <span dir="ltr">{formatDate(apt.date)}</span>
                                      </div>
                                      <div className="w-px h-4 bg-gray-300"></div>
                                      <div className="flex items-center gap-2">
                                          <Clock size={16} className="text-teal-500"/>
                                          <span dir="ltr">{apt.time}</span>
                                      </div>
                                  </div>

                                  <div>
                                      <div className="text-xs font-bold text-gray-500 mb-1">الخدمة:</div>
                                      <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-bold border border-teal-100 inline-block">{getProcedureName(apt.procedureId)}</span>
                                  </div>

                                  {(apt.notes || apt.reminderSent) && (
                                     <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 text-sm">
                                         {apt.notes && <p className="text-gray-700 mb-2">{apt.notes}</p>}
                                         {apt.reminderSent && <span className="text-green-600 text-[10px] flex items-center gap-1 font-bold"><CheckCircle size={10} /> تم إرسال تذكير</span>}
                                     </div>
                                  )}

                                  <div className="flex justify-end gap-2 border-t pt-4 mt-1 border-gray-100">
                                      <button onClick={() => setEditingApt(apt)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-bold hover:bg-gray-200 transition flex items-center justify-center gap-2"><Edit size={16} /> تعديل</button>
                                      {apt.status !== 'Completed' && apt.status !== 'Cancelled' && updateAppointmentStatus && (
                                          <button onClick={() => updateAppointmentStatus(apt.id, 'Completed')} className="flex-1 bg-green-100 text-green-700 py-2 rounded-lg font-bold hover:bg-green-200 transition flex items-center justify-center gap-2"><CheckCircle size={16} /> إنجاز</button>
                                      )}
                                      <button onClick={() => handleDelete(apt.id)} className="w-10 bg-red-50 text-red-600 rounded-lg font-bold hover:bg-red-100 transition flex items-center justify-center"><Trash2 size={18} /></button>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden md:block bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                      <div className="overflow-x-auto">
                          <table className="w-full text-right">
                              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 text-sm">
                                  <tr>
                                      <th className="p-5 font-bold">المريض</th>
                                      <th className="p-5 font-bold">التوقيت</th>
                                      <th className="p-5 font-bold">الخدمة</th>
                                      <th className="p-5 font-bold w-1/4">الملاحظات</th>
                                      <th className="p-5 font-bold">الحالة</th>
                                      <th className="p-5 font-bold text-center">تحكم</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100 text-sm">
                                  {filteredAppointments.length === 0 ? (
                                      <tr><td colSpan={6} className="p-12 text-center text-gray-400">لا توجد حجوزات تطابق الفلتر المختار</td></tr>
                                  ) : (
                                      filteredAppointments.map(apt => (
                                          <tr key={apt.id} className="hover:bg-gray-50 transition group">
                                              <td className="p-5">
                                                  <div className="flex flex-col">
                                                      <span className="font-bold text-gray-900 text-base">{apt.patientName}</span>
                                                      {apt.patientPhone && <span className="text-xs text-gray-400 font-mono dir-ltr mt-1">{apt.patientPhone}</span>}
                                                  </div>
                                              </td>
                                              <td className="p-5">
                                                  <div className="font-medium text-gray-700" dir="ltr">{formatDate(apt.date)}</div>
                                                  <div className="text-gray-400 text-xs mt-1">{apt.time}</div>
                                              </td>
                                              <td className="p-5"><span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold border border-gray-200">{getProcedureName(apt.procedureId)}</span></td>
                                              <td className="p-5">
                                                  {apt.notes ? <p className="text-gray-600 line-clamp-2">{apt.notes}</p> : <span className="text-gray-300 italic">-</span>}
                                                  {apt.reminderSent && <span className="text-green-600 text-[10px] flex items-center gap-1 mt-1"><CheckCircle size={10} /> تم التذكير</span>}
                                              </td>
                                              <td className="p-5"><span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(apt.status)}`}>{getStatusLabel(apt.status)}</span></td>
                                              <td className="p-5">
                                                  <div className="flex justify-center gap-2 opacity-50 group-hover:opacity-100 transition">
                                                      <button onClick={() => setEditingApt(apt)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition"><Edit size={16} /></button>
                                                      {apt.status !== 'Completed' && apt.status !== 'Cancelled' && updateAppointmentStatus && (
                                                          <button onClick={() => updateAppointmentStatus(apt.id, 'Completed')} className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition"><CheckCircle size={16} /></button>
                                                      )}
                                                      <button onClick={() => handleDelete(apt.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"><Trash2 size={16} /></button>
                                                  </div>
                                              </td>
                                          </tr>
                                      ))
                                  )}
                              </tbody>
                          </table>
                      </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 animate-fade-in relative">
                    {/* Save Indicator */}
                    {lastSaved && (
                        <div className="absolute top-8 left-8 bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-fade-in z-20">
                            <CheckCircle size={12} /> تم الحفظ
                        </div>
                    )}
                    
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Calendar size={24} className="text-teal-500" /> إدارة أيام العمل والساعات
                    </h2>

                    {/* Timeline Strip */}
                    <div className="mb-8 overflow-x-auto pb-4">
                        <div className="flex gap-3 min-w-max px-1">
                            {timelineDays.map((d, i) => {
                                const isoDate = d.toISOString().split('T')[0];
                                const isSelected = selectedDateForSchedule === isoDate;
                                const sched = getScheduleForDate(isoDate);
                                const isOff = sched.isDayOff;
                                const isFriday = d.getDay() === 5;
                                
                                return (
                                    <button 
                                        key={i}
                                        onClick={() => setSelectedDateForSchedule(isoDate)}
                                        className={`
                                            relative flex flex-col items-center justify-center p-4 rounded-2xl min-w-[80px] border-2 transition-all duration-200
                                            ${isSelected 
                                                ? 'border-teal-500 bg-teal-50 scale-105 shadow-md z-10' 
                                                : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'
                                            }
                                        `}
                                    >
                                        <span className={`text-xs font-bold mb-1 ${isFriday ? 'text-red-500' : 'text-gray-500'}`}>
                                            {d.toLocaleDateString('ar-EG', { weekday: 'short' })}
                                        </span>
                                        <span className={`text-lg font-bold mb-1 ${isSelected ? 'text-teal-800' : 'text-gray-800'}`}>
                                            {d.getDate()}
                                        </span>
                                        {/* Status Dot */}
                                        <div className={`w-2 h-2 rounded-full ${isOff ? 'bg-red-400' : 'bg-green-400'}`}></div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-10 border-t pt-8 border-gray-100">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-800">حالة اليوم المحدد: <span className="text-teal-600 dir-ltr">{new Date(selectedDateForSchedule).toLocaleDateString('en-GB')}</span></h3>
                            </div>
                            
                            <div className={`p-6 rounded-2xl border transition-colors duration-300 ${currentSchedule.isDayOff ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentSchedule.isDayOff ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                            {currentSchedule.isDayOff ? <Coffee size={20}/> : <CheckCircle size={20}/>}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900">{currentSchedule.isDayOff ? 'إجازة / مغلق' : 'متاح للحجز'}</div>
                                            <div className="text-xs text-gray-500">{new Date(selectedDateForSchedule).getDay() === 5 ? 'يوم الجمعة (عطلة رسمية)' : 'يوم عمل عادي'}</div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={toggleDayOff}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition shadow-sm ${currentSchedule.isDayOff ? 'bg-white text-red-600 border border-red-200 hover:bg-red-50' : 'bg-white text-green-600 border border-green-200 hover:bg-green-50'}`}
                                    >
                                        {currentSchedule.isDayOff ? 'فتح الحجز' : 'تعطيل اليوم'}
                                    </button>
                                </div>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {currentSchedule.isDayOff 
                                        ? "هذا اليوم مغلق حالياً. لن يتمكن المرضى من حجز مواعيد."
                                        : "العيادة مفتوحة. يمكنك تخصيص الساعات المتاحة من القائمة."}
                                </p>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-4">
                                <label className="block text-sm font-bold text-gray-700">الساعات المتاحة</label>
                                {!currentSchedule.isDayOff && (
                                    <span className="text-xs text-teal-600 bg-teal-50 px-2 py-1 rounded">
                                        {currentSchedule.availableSlots.length} ساعات نشطة
                                    </span>
                                )}
                            </div>
                            
                            <div className={`grid grid-cols-2 gap-3 transition-all duration-300 ${currentSchedule.isDayOff ? 'opacity-40 pointer-events-none grayscale' : 'opacity-100'}`}>
                                {defaultSlots.map(slot => (
                                    <button
                                        key={slot}
                                        onClick={() => toggleSlot(slot)}
                                        className={`py-3 px-4 rounded-xl text-sm font-bold transition border-2 flex justify-between items-center ${
                                            currentSchedule.availableSlots.includes(slot)
                                                ? 'bg-teal-50 border-teal-500 text-teal-700 shadow-sm'
                                                : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'
                                        }`}
                                    >
                                        <span dir="ltr">{slot}</span>
                                        {currentSchedule.availableSlots.includes(slot) && <CheckCircle size={16} className="text-teal-500" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
              )}
              
              {editingApt && (
                <EditModal editingApt={editingApt} setEditingApt={setEditingApt} onSave={handleSaveEdit} isDoctor={true} schedules={schedules} />
              )}
          </div>
      );
  }

  // --- PATIENT VIEW ---
  const patientAppointments = appointments.filter(apt => apt.patientName === user.name || user.id === 'u_guest');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-900">مرحباً، {user.name} 👋</h1>
            <p className="text-slate-500 mt-1">نتمنى لك دوام الصحة والعافية</p>
        </div>
        <button onClick={() => setPage(PageView.BOOKING)} className="bg-teal-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-teal-700 shadow-lg shadow-teal-500/20 transition transform hover:-translate-y-1">
            + حجز موعد جديد
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8">
                  <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2"><Calendar className="text-teal-500" /> مواعيدك القادمة</h2>
                  {patientAppointments.length === 0 ? (
                      <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                          <p className="text-gray-400 mb-4">لا توجد مواعيد نشطة حالياً</p>
                          <button onClick={() => setPage(PageView.BOOKING)} className="text-teal-600 font-bold hover:underline">احجز الآن</button>
                      </div>
                  ) : (
                      <div className="space-y-4">
                          {patientAppointments.map(apt => (
                              <div key={apt.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition group relative overflow-hidden">
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 rounded-l-full"></div>
                                  <div className="pl-4">
                                      <div className="font-bold text-slate-900 text-lg mb-1">{getProcedureName(apt.procedureId)}</div>
                                      <div className="text-sm text-slate-500 flex items-center gap-3">
                                          <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600" dir="ltr">{formatDate(apt.date)}</span>
                                          <span className="flex items-center gap-1"><Clock size={14} className="text-teal-500" /> {apt.time}</span>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-4 mt-4 md:mt-0">
                                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(apt.status)}`}>{getStatusLabel(apt.status)}</span>
                                      {apt.status !== 'Completed' && apt.status !== 'Cancelled' && (
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => setEditingApt(apt)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit size={18} /></button>
                                            <button onClick={() => handlePatientCancel(apt.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><XCircle size={18} /></button>
                                        </div>
                                      )}
                                  </div>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
          </div>
          <div className="space-y-6">
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-[2rem] shadow-xl shadow-orange-500/20 p-8 text-white text-center transform hover:scale-[1.02] transition duration-300">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"><MessageCircle size={28} className="text-white" /></div>
                  <h3 className="font-bold text-xl mb-2">شاركنا رأيك</h3>
                  <button onClick={() => setShowReviewModal(true)} className="w-full bg-white text-orange-600 py-3 rounded-xl font-bold hover:bg-orange-50 transition flex items-center justify-center gap-2 mt-4"><Star size={18} /> أضف تقييمك</button>
              </div>
          </div>
      </div>
      {editingApt && <EditModal editingApt={editingApt} setEditingApt={setEditingApt} onSave={handleSaveEdit} isDoctor={false} schedules={schedules} />}
      {showReviewModal && <ReviewModal onClose={() => setShowReviewModal(false)} onSubmit={handleSubmitReview} />}
      {cancelModalId && <CancelModal onClose={() => setCancelModalId(null)} onConfirm={confirmCancel} />}
    </div>
  );
};

// Updated EditModal
const EditModal = ({ editingApt, setEditingApt, onSave, isDoctor, schedules = [] }: { editingApt: Appointment, setEditingApt: (apt: Appointment | null) => void, onSave: (apt: Appointment) => void, isDoctor: boolean, schedules?: Schedule[] }) => {
    const [error, setError] = useState('');
    const [changeReason, setChangeReason] = useState('');

    const dateInput = editingApt.date.split('T')[0];

    // Get available slots for the selected date
    const availableSlots = React.useMemo(() => {
        const schedule = schedules.find(s => s.date === dateInput && s.doctorId === editingApt.doctorId);
        let slots = schedule && schedule.availableSlots.length > 0 ? schedule.availableSlots : DEFAULT_TIME_SLOTS;
        
        // Always include the current time of the appointment so it doesn't disappear if re-selected
        if (!slots.includes(editingApt.time)) {
            slots = [...slots, editingApt.time].sort(); // simple sort, strictly might need time sort
        }
        return slots;
    }, [dateInput, editingApt.doctorId, editingApt.time, schedules]);

    const validateAndSave = (e: React.FormEvent) => {
        e.preventDefault();
        const dateObj = new Date(dateInput);
        if (dateObj.getDay() === 5) { setError('عذراً، العيادة مغلقة أيام الجمعة.'); return; }
        
        // Basic slot validation
        if (!availableSlots.includes(editingApt.time)) {
             setError('هذا الوقت غير متاح في جدول الطبيب لهذا اليوم.');
             return;
        }

        setError('');
        let finalApt = { ...editingApt };
        if (changeReason.trim()) {
            const timestamp = new Date().toLocaleDateString('en-GB');
            finalApt.notes = (finalApt.notes || '') + `\n[تعديل ${timestamp}: ${changeReason}]`;
        }
        onSave(finalApt);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
                <div className="bg-gray-50 px-8 py-6 flex justify-between items-center border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Edit size={20} className="text-teal-600"/> تعديل الموعد</h3>
                    <button onClick={() => setEditingApt(null)} className="text-gray-400 hover:text-gray-600 transition"><X size={24}/></button>
                </div>
                <form onSubmit={validateAndSave} className="p-8 space-y-5">
                     {isDoctor && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">اسم المريض</label>
                            <input type="text" value={editingApt.patientName} onChange={e => setEditingApt({...editingApt, patientName: e.target.value})} className="w-full border-gray-200 bg-gray-50 rounded-xl p-3 focus:ring-2 focus:ring-teal-500 outline-none" />
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">التاريخ</label>
                            <input type="date" value={editingApt.date.split('T')[0]} onChange={e => { setEditingApt({...editingApt, date: new Date(e.target.value).toISOString()}); setError(''); }} className={`w-full border-gray-200 bg-gray-50 rounded-xl p-3 outline-none ${error ? 'border-red-500 bg-red-50' : ''}`} />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">الوقت</label>
                            <select 
                                value={editingApt.time} 
                                onChange={e => setEditingApt({...editingApt, time: e.target.value})} 
                                className="w-full border-gray-200 bg-gray-50 rounded-xl p-3 outline-none appearance-none"
                            >
                                {availableSlots.map(slot => (
                                    <option key={slot} value={slot}>{slot}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                     {isDoctor && (
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">الحالة</label>
                            <select value={editingApt.status} onChange={e => setEditingApt({...editingApt, status: e.target.value as any})} className="w-full border-gray-200 bg-gray-50 rounded-xl p-3 outline-none">
                                <option value="Confirmed">مؤكد</option>
                                <option value="Pending">قيد الانتظار</option>
                                <option value="Completed">منجز</option>
                                <option value="Cancelled">ملغي</option>
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">ملاحظات طبية / أعراض</label>
                        <textarea value={editingApt.notes || ''} onChange={e => setEditingApt({...editingApt, notes: e.target.value})} className="w-full border-gray-200 bg-gray-50 rounded-xl p-3 h-20 resize-none outline-none"></textarea>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100">
                        <label className="block text-sm font-bold text-yellow-800 mb-1">سبب التعديل (اختياري)</label>
                        <input type="text" value={changeReason} onChange={e => setChangeReason(e.target.value)} placeholder="مثال: ظرف طارئ، تغيير وقت العمل..." className="w-full border-transparent bg-white rounded-lg p-2 text-sm focus:ring-2 focus:ring-yellow-400 outline-none" />
                    </div>
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    <div className="flex gap-3 pt-2">
                        <button type="submit" className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition">حفظ التغييرات</button>
                        <button type="button" onClick={() => setEditingApt(null)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ReviewModal = ({ onClose, onSubmit }: { onClose: () => void, onSubmit: (rating: number, comment: string) => void }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-slide-up relative p-10 text-center">
                <button onClick={onClose} className="absolute top-6 left-6 text-gray-400 hover:text-gray-600"><X size={24} /></button>
                <Star size={40} className="text-amber-400 fill-amber-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-800 mb-2">كيف كانت تجربتك؟</h3>
                <div className="flex justify-center gap-3 mb-8">{[1, 2, 3, 4, 5].map((star) => (<button key={star} onClick={() => setRating(star)}><Star size={36} className={`${rating >= star ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} /></button>))}</div>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="اكتب تعليقك هنا..." className="w-full bg-gray-50 rounded-2xl p-4 mb-6 h-32"></textarea>
                <button onClick={() => rating > 0 && onSubmit(rating, comment)} className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold">إرسال التقييم</button>
            </div>
        </div>
    );
};

const CancelModal = ({ onClose, onConfirm }: { onClose: () => void, onConfirm: (reason: string) => void }) => {
    const [reason, setReason] = useState('');
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
                <div className="bg-red-50 px-8 py-6 flex justify-between items-center border-b border-red-100">
                    <h3 className="text-xl font-bold text-red-800 flex items-center gap-2"><AlertCircle size={20}/> تأكيد الإلغاء</h3>
                    <button onClick={onClose} className="text-red-300 hover:text-red-500 transition"><X size={24}/></button>
                </div>
                <div className="p-8 space-y-4">
                    <p className="text-gray-600 font-bold">هل أنت متأكد من رغبتك في إلغاء هذا الموعد؟</p>
                    <p className="text-sm text-gray-500">يمكنك ذكر السبب (اختياري) لمساعدتنا في تحسين الخدمة:</p>
                    <textarea 
                        value={reason} 
                        onChange={(e) => setReason(e.target.value)} 
                        placeholder="سبب الإلغاء..." 
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 h-24 outline-none focus:ring-2 focus:ring-red-200"
                    ></textarea>
                    
                    <div className="flex gap-3 pt-2">
                        <button onClick={() => onConfirm(reason)} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition">تأكيد الإلغاء</button>
                        <button onClick={onClose} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition">تراجع</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;