'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar as CalendarIcon, Clock, Check, FileText, AlertCircle, CalendarX } from 'lucide-react'
import { appointmentService } from '@/services/appointmentService'
import { DEFAULT_TIME_SLOTS } from '@/services/mockData'
import { Schedule, Appointment, Procedure, Doctor } from '@/types'

interface BookingContentProps {
  initialDoctors: Doctor[]
  initialProcedures: Procedure[]
}

const BookingContent: React.FC<BookingContentProps> = ({ initialDoctors, initialProcedures }) => {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(initialDoctors.length === 1 ? initialDoctors[0].id : null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  
  // Data State
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Patient & Service Details
  const [patientName, setPatientName] = useState('')
  const [patientPhone, setPatientPhone] = useState('')
  const [selectedProcedure, setSelectedProcedure] = useState<string>('')
  const [notes, setNotes] = useState('') 
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Error UI State
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showErrorModal, setShowErrorModal] = useState(false)

  // Fetch Appointments and Schedules using Service (with Mock Fallback)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true)
        const [fetchedApts, fetchedSchs] = await Promise.all([
          appointmentService.fetchAppointments(),
          selectedDoctor ? appointmentService.fetchSchedules(selectedDoctor) : Promise.resolve([])
        ])

        setAppointments(fetchedApts)
        setSchedules(fetchedSchs)
      } catch (err) {
        console.error("Error fetching booking data:", err)
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchData()
  }, [selectedDoctor]) // Refetch schedules when doctor changes

  const getNextDays = () => {
    const dates = []
    const today = new Date()
    for (let i = 1; i <= 14; i++) {
        const d = new Date(today)
        d.setDate(today.getDate() + i)
        dates.push(d)
    }
    return dates 
  }

  const isDayClosed = (date: Date, doctorId: string | null) => {
      if (!doctorId) return false
      const dateStr = date.toISOString().split('T')[0]
      const isFriday = date.getDay() === 5
      
      const schedule = schedules.find(s => s.date === dateStr && s.doctorId === doctorId)
      if (schedule) return schedule.isDayOff
      return isFriday
  }

  const availableTimeSlots = useMemo(() => {
    if (!selectedDate || !selectedDoctor) return []

    const dateStr = selectedDate.split('T')[0]
    const dateObj = new Date(selectedDate)
    
    if (isDayClosed(dateObj, selectedDoctor)) return []

    const schedule = schedules.find(s => s.date === dateStr && s.doctorId === selectedDoctor)
    const baseSlots = schedule && schedule.availableSlots.length > 0
        ? schedule.availableSlots 
        : DEFAULT_TIME_SLOTS

    const takenSlots = appointments
        .filter(apt => 
            apt.doctorId === selectedDoctor && 
            apt.date.startsWith(dateStr)
        )
        .map(apt => apt.time)

    return baseSlots.filter(slot => !takenSlots.includes(slot))
  }, [selectedDate, selectedDoctor, schedules, appointments])

  const handleConfirm = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) return
    
    setIsSubmitting(true)
    try {
      // 1. Double check availability
      const isAvailable = await appointmentService.checkAvailability(selectedDoctor, selectedDate, selectedTime)

      if (!isAvailable) {
        setErrorMessage('عذراً، يبدو أن هذا الموعد قد تم حجزه للتو. يرجى اختيار موعد آخر.')
        setShowErrorModal(true)
        setIsSubmitting(false)
        return
      }

      // 2. Submit booking
      const success = await appointmentService.createAppointment({
        patientName,
        patientPhone,
        doctorId: selectedDoctor,
        procedureId: selectedProcedure || 'other',
        date: selectedDate,
        time: selectedTime,
        notes: notes,
        status: 'Confirmed'
      })

      if (!success) throw new Error("Booking failed")

      setStep(3)
    } catch (err: any) {
      console.error("Booking failed:", err)
      const msg = err?.message || "حدث خطأ غير متوقع."
      setErrorMessage(`حدث خطأ أثناء الحجز. يرجى المحاولة لاحقاً.\n(${msg})`)
      setShowErrorModal(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatDate = (isoDate: string) => {
    const d = new Date(isoDate)
    return d.toLocaleDateString('en-GB') 
  }

  const isValidPhone = (phone: string) => /^07[789]\d{7}$/.test(phone)

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '') 
    if (val.length <= 10) setPatientPhone(val)
  }

  const isOtherProcedure = selectedProcedure === 'other'
  const currentDoctor = initialDoctors.find(d => d.id === selectedDoctor)

  if (isLoadingData) {
    return <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
    </div>
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in relative">
      
      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center relative animate-slide-up">
            <button 
                onClick={() => setShowErrorModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
            >
                <AlertCircle size={24} />
            </button>
            
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CalendarX size={40} className="text-red-500" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">عذراً، حدث خطأ</h3>
            <p className="text-gray-600 mb-8 whitespace-pre-line leading-relaxed text-sm">
                {errorMessage}
            </p>
            
            <button 
                onClick={() => setShowErrorModal(false)}
                className="w-full bg-red-50 text-red-600 border border-red-100 py-3 rounded-xl font-bold hover:bg-red-100 transition"
            >
                إغلاق
            </button>
          </div>
        </div>
      )}

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
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in border border-gray-100">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <CalendarIcon size={20} className="text-teal-600" /> الطبيب المسؤول
            </h3>
            <div className="grid grid-cols-1 mb-10 gap-4">
                {initialDoctors.map(doc => (
                    <div  
                        key={doc.id}
                        onClick={() => setSelectedDoctor(doc.id)}
                        className={`cursor-pointer border rounded-2xl p-6 flex flex-row items-center gap-6 transition-all duration-300 ${selectedDoctor === doc.id ? 'border-teal-500 bg-teal-50 shadow-lg ring-1 ring-teal-500' : 'border-gray-100 hover:border-teal-200 hover:bg-gray-50'}`}
                    >
                        <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md">
                          <Image src={doc.imageUrl} alt={doc.name} fill className="object-cover" />
                        </div>
                        <div>
                           <div className="font-bold text-gray-900 text-xl">{doc.name}</div>
                           <div className="text-sm text-teal-600 font-medium">{doc.specialty}</div>
                        </div>
                        <div className="mr-auto">
                            {selectedDoctor === doc.id && <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white"><Check size={18} /></div>}
                        </div>
                    </div>
                ))}
            </div>

            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Clock size={20} className="text-teal-600" /> اختر التاريخ والوقت
            </h3>
            <div className="mb-8">
                <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide -mx-2 px-2">
                    {getNextDays().map((date, idx) => {
                        const isClosed = isDayClosed(date, selectedDoctor)
                        const isSelected = selectedDate === date.toISOString()
                        return (
                            <button
                                key={idx}
                                disabled={isClosed}
                                onClick={() => { setSelectedDate(date.toISOString()); setSelectedTime(null); }}
                                className={`flex-shrink-0 px-6 py-4 rounded-2xl border text-center min-w-[120px] transition-all duration-300 relative ${
                                    isSelected 
                                        ? 'bg-teal-600 text-white border-teal-600 shadow-xl' 
                                        : isClosed 
                                            ? 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed opacity-60' 
                                            : 'bg-white border-gray-100 hover:border-teal-300 hover:bg-teal-50'
                                }`}
                            >
                                {isClosed && (
                                    <div className="absolute top-2 right-2">
                                        <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-bold border border-red-100">مغلق</span>
                                    </div>
                                )}
                                <div className={`text-xs font-bold mb-1 ${isSelected ? 'text-teal-100' : 'text-gray-400'}`}>{date.toLocaleDateString('ar-EG', { weekday: 'long' })}</div>
                                <div className="font-extrabold text-xl dir-ltr">{date.toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric' })}</div>
                            </button>
                        )
                    })}
                </div>
            </div>

            {selectedDate && (
                <div className="mb-10">
                    {availableTimeSlots.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
                            {availableTimeSlots.map(time => (
                                <button
                                    key={time}
                                    onClick={() => setSelectedTime(time)}
                                    className={`py-3 px-2 rounded-xl border font-bold text-sm transition-all duration-300 ${
                                        selectedTime === time 
                                        ? 'bg-teal-50 text-teal-700 border-teal-600 shadow-sm' 
                                        : 'border-gray-100 hover:border-teal-300 text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-orange-50 border border-orange-100 p-8 rounded-2xl text-center text-orange-700 flex flex-col items-center gap-4 animate-fade-in">
                            <CalendarX size={48} className="opacity-30"/>
                            <div>
                                <div className="font-bold text-lg">جميع المواعيد محجوزة</div>
                                <div className="text-sm opacity-80 mt-1">يرجى اختيار يوم آخر أو طبيب آخر</div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <button 
                disabled={!selectedDoctor || !selectedDate || !selectedTime}
                onClick={() => setStep(2)}
                className="w-full bg-teal-600 text-white py-4 rounded-2xl font-bold disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed hover:bg-teal-700 transition shadow-lg shadow-teal-600/20 text-lg"
            >
                متابعة البيانات
            </button>
        </div>
      )}

      {step === 2 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in border border-gray-100">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                <FileText size={20} className="text-teal-600" /> بيانات المريض والخدمة
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">الاسم الكامل</label>
                      <input 
                        type="text" 
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-teal-500 outline-none transition"
                        placeholder="أدخل اسمك هنا"
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">رقم الجوال</label>
                      <input 
                        type="tel"
                        value={patientPhone}
                        onChange={handlePhoneChange}
                        className={`w-full border rounded-xl p-4 focus:ring-2 outline-none transition ${
                            patientPhone && !isValidPhone(patientPhone) 
                            ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                            : 'border-gray-200 focus:ring-teal-500'
                        }`}
                        placeholder="07xxxxxxxx"
                      />
                      {patientPhone && !isValidPhone(patientPhone) && (
                          <p className="text-red-500 text-xs mt-2 font-medium">
                              الرقم يجب أن يبدأ بـ 079, 078, أو 077 ويتكون من 10 أرقام
                          </p>
                      )}
                  </div>
              </div>

              <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">نوع الخدمة / الإجراء</label>
                  <select 
                      value={selectedProcedure}
                      onChange={(e) => setSelectedProcedure(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-teal-500 outline-none bg-white appearance-none transition"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236B7280\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'left 1rem center', backgroundSize: '1.5em' }}
                  >
                      <option value="">اختر الخدمة المطلوبة</option>
                      {initialProcedures.map(proc => (
                          <option key={proc.id} value={proc.id}>{proc.title}</option>
                      ))}
                      <option value="other" className="font-bold text-teal-800 bg-teal-50">أخرى / استشارة عامة</option>
                  </select>
              </div>

              <div className="mb-8">
                  <label className={`block text-sm font-bold mb-2 transition-colors ${isOtherProcedure ? 'text-teal-700' : 'text-gray-700'}`}>
                      {isOtherProcedure ? 'يرجى توضيح سبب الزيارة أو تفاصيل الخدمة المطلوبة *' : 'وصف الحالة / الأعراض (اختياري)'}
                  </label>
                  <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className={`w-full border rounded-xl p-4 focus:ring-2 focus:ring-teal-500 outline-none h-32 resize-none transition-all ${
                        isOtherProcedure ? 'border-teal-300 bg-teal-50 shadow-inner' : 'border-gray-200'
                    }`}
                    placeholder={isOtherProcedure ? "يرجى كتابة تفاصيل حول ما تشعر به أو الخدمة التي ترغب بها..." : "هل تشعر بألم؟ صف مكان الألم أو أي أعراض أخرى..."}
                  ></textarea>
              </div>
                  
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-8">
                  <h4 className="font-bold text-gray-800 mb-4 border-b border-gray-200 pb-3 flex items-center gap-2">
                      <FileText size={16} className="text-teal-600" /> ملخص الحجز
                  </h4>
                  <div className="text-sm text-gray-600 flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                          <span className="opacity-70">الطبيب:</span>
                          <span className="font-bold text-gray-900">{currentDoctor?.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="opacity-70">التاريخ والوقت:</span>
                          <span className="font-bold text-gray-900 dir-ltr">{selectedTime} - {selectedDate ? formatDate(selectedDate) : ''}</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="opacity-70">الخدمة:</span>
                          <span className="font-bold text-gray-900">{isOtherProcedure ? 'أخرى / استشارة عامة' : initialProcedures.find(p => p.id === selectedProcedure)?.title || 'غير محدد'}</span>
                      </div>
                  </div>
              </div>

              <div className="flex gap-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-2xl font-bold hover:bg-gray-200 transition"
                  >
                      رجوع
                  </button>
                  <button 
                    onClick={handleConfirm}
                    disabled={!patientName || !isValidPhone(patientPhone) || !selectedProcedure || isSubmitting || (isOtherProcedure && !notes.trim())}
                    className="flex-1 bg-teal-600 text-white py-4 rounded-2xl font-bold hover:bg-teal-700 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-600/20 text-lg"
                  >
                      {isSubmitting ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div> : 'تأكيد وحجز'}
                  </button>
              </div>
          </div>
      )}

      {step === 3 && (
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center animate-fade-in border border-gray-100">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <Check size={48} className="text-green-600" />
              </div>
              <h3 className="text-3xl font-extrabold text-gray-900 mb-4">تم الحجز بنجاح!</h3>
              <p className="text-gray-600 mb-10 text-lg leading-relaxed">
                شكراً لك <span className="font-bold text-teal-700">{patientName}</span>. <br/>
                تم تأكيد موعدك مع {currentDoctor?.name} <br/>
                يوم <span className="font-bold bg-gray-100 px-2 py-1 rounded" dir="ltr">{selectedDate ? formatDate(selectedDate) : ''}</span> الساعة <span className="font-bold bg-gray-100 px-2 py-1 rounded">{selectedTime}</span>.
              </p>
              <div className="flex flex-col gap-4">
                  <Link 
                    href="/dashboard"
                    className="w-full bg-teal-600 text-white py-4 rounded-2xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition text-lg"
                  >
                      مشاهدة مواعيدي
                  </Link>
                  <Link 
                    href="/"
                    className="w-full text-teal-600 py-3 font-bold hover:bg-teal-50 rounded-2xl transition"
                  >
                      العودة للرئيسية
                  </Link>
              </div>
          </div>
      )}
    </div>
  )
}

export default BookingContent

