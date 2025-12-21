import React, { useState, useEffect, useMemo } from 'react';
import { DOCTORS, PROCEDURES, DEFAULT_TIME_SLOTS } from '@/services/mockData';
import { PageView, Schedule, Appointment, Procedure, Doctor } from '@/types';
import { Calendar as CalendarIcon, Clock, Check, FileText, AlertCircle, CalendarX } from 'lucide-react';
import Image from 'next/image';
import { client as sanity } from '@/lib/sanity';

interface BookingProps {
  setPage: (page: PageView) => void;
  addAppointment: (apt: any) => void;
  schedules?: Schedule[];
  existingAppointments?: Appointment[];
}

const Booking: React.FC<BookingProps> = ({ setPage, addAppointment, schedules = [], existingAppointments = [] }) => {
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // Data State
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Patient & Service Details
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [selectedProcedure, setSelectedProcedure] = useState<string>('');
  const [notes, setNotes] = useState(''); 
  const [loading, setLoading] = useState(false);

  // Fetch Data (Doctors & Procedures)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        
        // Fetch Procedures
        const proceduresQuery = `*[_type == "procedure"]{
          "id": _id,
          title,
          description,
          category,
          duration,
          painLevel,
          "imageUrl": coalesce(image.asset->url, imageUrl.asset->url),
          steps,
          postCare
        }`;

        // Fetch Doctors
        const doctorsQuery = `*[_type == "doctor"]{
          "id": _id,
          name,
          specialty,
          "imageUrl": coalesce(image.asset->url, imageUrl.asset->url)
        }`;

        const [proceduresData, doctorsData] = await Promise.all([
          sanity.fetch(proceduresQuery),
          sanity.fetch(doctorsQuery)
        ]);

        setProcedures(proceduresData);
        setDoctors(doctorsData);

        // Auto-select doctor if only one exists
        if (doctorsData.length === 1) {
          setSelectedDoctor(doctorsData[0].id);
        }

      } catch (err) {
        console.error("Error fetching data:", err);
        setError("فشل في تحميل البيانات. يرجى المحاولة لاحقاً.");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const getNextDays = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 14; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        dates.push(d);
    }
    return dates; 
  };

  // Helper to check if a day is effectively closed (Friday default, or Schedule says off)
  const isDayClosed = (date: Date, doctorId: string | null) => {
      if (!doctorId) return false;
      const dateStr = date.toISOString().split('T')[0];
      const isFriday = date.getDay() === 5;
      
      const schedule = schedules.find(s => s.date === dateStr && s.doctorId === doctorId);
      
      if (schedule) {
          // Explicit schedule overrides default
          return schedule.isDayOff;
      }
      
      // Default: Friday is closed
      return isFriday;
  };

  // Calculate available time slots for the selected date and doctor
  const availableTimeSlots = useMemo(() => {
    if (!selectedDate || !selectedDoctor) return [];

    const dateObj = new Date(selectedDate);
    const dateStr = selectedDate.split('T')[0];
    
    // Check if day is closed
    if (isDayClosed(dateObj, selectedDoctor)) return [];

    // 1. Get Base Slots
    const schedule = schedules.find(s => s.date === dateStr && s.doctorId === selectedDoctor);
    const baseSlots = schedule && schedule.availableSlots.length > 0
        ? schedule.availableSlots 
        : DEFAULT_TIME_SLOTS;

    // 2. Filter out slots taken by existing Confirmed/Pending appointments
    const takenSlots = existingAppointments
        .filter(apt => 
            apt.doctorId === selectedDoctor && 
            apt.date.startsWith(dateStr) &&
            apt.status !== 'Cancelled'
        )
        .map(apt => apt.time);

    return baseSlots.filter(slot => !takenSlots.includes(slot));

  }, [selectedDate, selectedDoctor, schedules, existingAppointments]);

  const handleConfirm = () => {
      setLoading(true);
      setTimeout(() => {
          const newApt = {
              id: Math.random().toString(36).substr(2, 9),
              patientName,
              patientPhone, 
              doctorId: selectedDoctor,
              date: selectedDate,
              time: selectedTime,
              procedureId: selectedProcedure || 'other', 
              notes: notes,
              status: 'Confirmed'
          };
          addAppointment(newApt);
          setLoading(false);
          setStep(3); 
      }, 1500);
  };

  const formatDate = (isoDate: string) => {
      const d = new Date(isoDate);
      return d.toLocaleDateString('en-GB'); 
  };

  const getProcedureName = (id: string) => {
      if (id === 'other') return 'أخرى / استشارة عامة';
      const proc = procedures.find(p => p.id === id);
      return proc ? proc.title : 'غير محدد';
  };

  const isValidPhone = (phone: string) => {
    const regex = /^07[789]\d{7}$/;
    return regex.test(phone);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.replace(/\D/g, ''); 
      if (val.length <= 10) {
          setPatientPhone(val);
      }
  };

  const isOtherProcedure = selectedProcedure === 'other';

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 text-center">حجز موعد جديد</h2>
        <div className="flex items-center justify-center mt-6">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}>1</div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-teal-600' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}>2</div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-teal-600' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-teal-600 text-white' : 'bg-gray-200'}`}><Check size={16} /></div>
        </div>
      </div>

      {step === 1 && (
        <div className="bg-white rounded-xl shadow p-6 animate-fade-in">
            <h3 className="text-xl font-semibold mb-4">الطبيب المسؤول</h3>
            <div className="grid grid-cols-1 mb-8">
                {doctors.map(doc => (
                    <div  
                        key={doc.id}
                        onClick={() => setSelectedDoctor(doc.id)}
                        className={`cursor-pointer border rounded-xl p-4 flex flex-row items-center gap-4 transition ${selectedDoctor === doc.id ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-200' : 'border-gray-200 hover:border-teal-300'}`}
                    >
                        <Image 
                            src={doc.imageUrl} 
                            alt={doc.name} 
                            width={80}
                            height={80}
                            className="rounded-full object-cover" 
                        />
                        <div>
                           <div className="font-bold text-gray-800 text-lg">{doc.name}</div>
                           <div className="text-sm text-gray-500">{doc.specialty}</div>
                        </div>
                        <div className="mr-auto">
                            {selectedDoctor === doc.id && <Check className="text-teal-600" />}
                        </div>
                    </div>
                ))}
            </div>

            <h3 className="text-xl font-semibold mb-4">اختر التاريخ والوقت</h3>
            <div className="mb-6">
                <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                    {getNextDays().map((date, idx) => {
                        const isClosed = isDayClosed(date, selectedDoctor);
                        const isSelected = selectedDate === date.toISOString();
                        return (
                            <button
                                key={idx}
                                disabled={isClosed}
                                onClick={() => { setSelectedDate(date.toISOString()); setSelectedTime(null); }}
                                className={`flex-shrink-0 px-4 py-3 rounded-lg border text-center min-w-[100px] transition relative ${
                                    isSelected 
                                        ? 'bg-teal-600 text-white border-teal-600 shadow-md' 
                                        : isClosed 
                                            ? 'bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed opacity-70' 
                                            : 'bg-white border-gray-200 hover:bg-teal-50 hover:border-teal-300'
                                }`}
                            >
                                {isClosed && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50 rounded-lg">
                                        <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold border border-red-200">مغلق</span>
                                    </div>
                                )}
                                <div className="text-xs opacity-70 mb-1">{date.toLocaleDateString('ar-EG', { weekday: 'long' })}</div>
                                <div className="font-bold text-lg dir-ltr">{date.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric' })}</div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {selectedDate && (
                <div className="mb-8">
                    {availableTimeSlots.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in">
                            {availableTimeSlots.map(time => (
                                <button
                                    key={time}
                                    onClick={() => setSelectedTime(time)}
                                    className={`py-2 px-1 rounded border text-sm font-medium transition ${
                                        selectedTime === time ? 'bg-teal-100 text-teal-800 border-teal-300 ring-1 ring-teal-300' : 'border-gray-200 hover:border-gray-400'
                                    }`}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-orange-50 border border-orange-100 p-6 rounded-xl text-center text-orange-700 flex flex-col items-center gap-3 animate-fade-in">
                            <CalendarX size={32} className="opacity-50"/>
                            <div>
                                <div className="font-bold">جميع المواعيد محجوزة</div>
                                <div className="text-sm opacity-80 mt-1">يرجى اختيار يوم آخر</div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <button 
                disabled={!selectedDoctor || !selectedDate || !selectedTime}
                onClick={() => setStep(2)}
                className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-teal-700 transition"
            >
                متابعة
            </button>
        </div>
      )}

      {step === 2 && (
          <div className="bg-white rounded-xl shadow p-6 animate-fade-in">
              <h3 className="text-xl font-semibold mb-6">بيانات المريض والخدمة</h3>
              
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الكامل</label>
                      <input 
                        type="text" 
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 outline-none"
                        placeholder="أدخل اسمك هنا"
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">رقم الجوال</label>
                      <input 
                        type="tel"
                        value={patientPhone}
                        onChange={handlePhoneChange}
                        className={`w-full border rounded-lg p-3 focus:ring-2 outline-none ${
                            patientPhone && !isValidPhone(patientPhone) 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-teal-500'
                        }`}
                        placeholder="07xxxxxxxx"
                      />
                      {patientPhone && !isValidPhone(patientPhone) && (
                          <p className="text-red-500 text-xs mt-1">
                              الرقم يجب أن يبدأ بـ 079, 078, أو 077 ويتكون من 10 أرقام
                          </p>
                      )}
                  </div>
              </div>

              <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">نوع الخدمة / الإجراء</label>
                  <select 
                      value={selectedProcedure}
                      onChange={(e) => setSelectedProcedure(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-teal-500 outline-none bg-white"
                  >
                      <option value="">اختر الخدمة المطلوبة</option>
                      {loadingData && <option disabled>جاري التحميل...</option>}
                      {error && <option disabled>حدث خطأ في التحميل</option>}
                      {procedures.map(proc => (
                          <option key={proc.id} value={proc.id}>{proc.title}</option>
                      ))}
                      {/* Added 'Other' option explicitly */}
                      <option value="other" className="font-bold text-teal-800 bg-teal-50">أخرى / استشارة عامة</option>
                  </select>
              </div>

              <div className="mb-6">
                  {/* Label changes based on selection */}
                  <label className={`block text-sm font-medium mb-1 transition-colors ${isOtherProcedure ? 'text-teal-700 font-bold' : 'text-gray-700'}`}>
                      {isOtherProcedure ? 'يرجى توضيح سبب الزيارة أو تفاصيل الخدمة المطلوبة *' : 'وصف الحالة / الأعراض (اختياري)'}
                  </label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-teal-500 outline-none h-24 resize-none transition-all ${
                        isOtherProcedure ? 'border-teal-300 bg-teal-50 shadow-sm' : 'border-gray-300'
                    }`}
                    placeholder={isOtherProcedure ? "يرجى كتابة تفاصيل حول ما تشعر به أو الخدمة التي ترغب بها..." : "هل تشعر بألم؟ صف مكان الألم أو أي أعراض أخرى..."}
                  ></textarea>
              </div>
                  
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4 mb-6">
                  <h4 className="font-bold text-gray-800 mb-2 border-b pb-2 flex items-center gap-2">
                      <FileText size={16} /> ملخص الحجز
                  </h4>
                  <div className="text-sm text-gray-600 flex flex-col gap-2 pt-2">
                      <div className="flex justify-between">
                          <span>الطبيب:</span>
                          <span className="font-medium text-gray-900">{doctors.find(d => d.id === selectedDoctor)?.name}</span>
                      </div>
                      <div className="flex justify-between">
                          <span>التاريخ والوقت:</span>
                          <span className="font-medium text-gray-900" dir="ltr">{selectedTime} - {selectedDate ? formatDate(selectedDate) : ''}</span>
                      </div>
                      <div className="flex justify-between">
                          <span>الخدمة:</span>
                          <span className="font-medium text-gray-900">{getProcedureName(selectedProcedure)}</span>
                      </div>
                  </div>
              </div>

              <div className="flex gap-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200"
                  >
                      رجوع
                  </button>
                  <button 
                    onClick={handleConfirm}
                    // Validate that notes are present if 'other' is selected
                    disabled={!patientName || !isValidPhone(patientPhone) || !selectedProcedure || loading || (isOtherProcedure && !notes.trim())}
                    className="flex-1 bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'تأكيد الحجز'}
                  </button>
              </div>
          </div>
      )}

      {step === 3 && (
          <div className="bg-white rounded-xl shadow p-8 text-center animate-fade-in">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check size={40} className="text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">تم الحجز بنجاح!</h3>
              <p className="text-gray-600 mb-8">
                  شكراً لك {patientName}. تم تأكيد موعدك مع {doctors.find(d => d.id === selectedDoctor)?.name} يوم <span dir="ltr">{selectedDate ? formatDate(selectedDate) : ''}</span> الساعة {selectedTime}.
              </p>
              <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => setPage(PageView.DASHBOARD)}
                    className="w-full bg-teal-600 text-white py-3 rounded-lg font-bold hover:bg-teal-700"
                  >
                      الذهاب للوحة التحكم
                  </button>
                  <button 
                    onClick={() => setPage(PageView.HOME)}
                    className="w-full text-teal-600 py-2 hover:bg-teal-50 rounded-lg"
                  >
                      العودة للرئيسية
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};

export default Booking;