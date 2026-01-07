'use client'

import React, { useState } from "react";
import {
  Phone,
  LogIn,
  AlertCircle,
  Lock,
  Stethoscope,
  User,
  ShieldCheck,
  UserPlus
} from "lucide-react";
import { appointmentService } from "@/services/appointmentService";

interface LoginProps {
  onPatientLogin: (phone: string, name?: string) => void;
  onDoctorLogin: () => void;
  error: string;
}

// ============================================
// إعدادات الدخول
// ============================================
const DOCTOR_ACCESS_CODE = "12345";
// ============================================

const Login: React.FC<LoginProps> = ({
  onPatientLogin,
  onDoctorLogin,
  error,
}) => {
  const [activeTab, setActiveTab] = useState<"patient" | "doctor">("patient");

  // Patient State
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "name">("phone");
  const [name, setName] = useState("");
  const [checking, setChecking] = useState(false);

  // Doctor State
  const [doctorPass, setDoctorPass] = useState("");
  const [localError, setLocalError] = useState("");

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    setChecking(true);

    // 1. Strict Validation
    const jordanPhoneRegex = /^07[789]\d{7}$/;
    if (!jordanPhoneRegex.test(phone)) {
      setLocalError("يرجى إدخال رقم هاتف أردني صحيح (يبدأ بـ 079, 078, 077 ويتكون من 10 أرقام)");
      setChecking(false);
      return;
    }

    try {
      // 2. Lookup Patient
      const existingName = await appointmentService.findPatientByPhone(phone);
      
      if (existingName) {
        // Found -> Auto Login
        onPatientLogin(phone, existingName);
      } else {
        // Not Found -> Ask for Name
        setStep("name");
      }
    } catch (err) {
      console.error(err);
      setLocalError("حدث خطأ أثناء التحقق، يرجى المحاولة مرة أخرى");
    } finally {
      setChecking(false);
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setLocalError("يرجى إدخال الاسم");
      return;
    }
    // New User Login
    onPatientLogin(phone, name);
  };

  const handleDoctorLoginAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (doctorPass === DOCTOR_ACCESS_CODE) {
      onDoctorLogin();
    } else {
      setLocalError("رمز الدخول غير صحيح");
    }
  };

  return (
    <div className='flex items-center justify-center min-h-[70vh] px-4 bg-slate-50'>
      <div className='w-full max-w-md animate-fade-in'>
        {/* Tabs Header */}
        <div className='bg-white rounded-t-2xl shadow-sm border-b border-gray-100 flex overflow-hidden'>
          <button
            onClick={() => {
              setActiveTab("patient");
              setLocalError("");
              setStep("phone");
            }}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === "patient"
                ? "bg-teal-50 text-teal-700 border-b-2 border-teal-500"
                : "text-gray-400 hover:bg-gray-50"
            }`}
          >
            <User size={18} />
            بوابة المرضى
          </button>
          <button
            onClick={() => {
              setActiveTab("doctor");
              setLocalError("");
            }}
            className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === "doctor"
                ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500"
                : "text-gray-400 hover:bg-gray-50"
            }`}
          >
            <Stethoscope size={18} />
            بوابة الأطباء
          </button>
        </div>

        {/* Card Body */}
        <div className='bg-white p-8 rounded-b-2xl shadow-lg border border-gray-100 border-t-0'>
          {/* Header Content based on Tab */}
          <div className='text-center mb-8'>
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                activeTab === "patient"
                  ? "bg-teal-100 text-teal-600"
                  : "bg-indigo-100 text-indigo-600"
              }`}
            >
              {activeTab === "patient" ? (
                <Phone size={32} />
              ) : (
                <ShieldCheck size={32} />
              )}
            </div>
            <h2 className='text-2xl font-bold text-gray-800'>
              {activeTab === "patient" ? "مرحباً بك" : "دخول الكادر الطبي"}
            </h2>
            <p className='text-gray-500 text-sm mt-2'>
              {activeTab === "patient"
                ? "أدخل رقم هاتفك للوصول لملفك ومواعيدك"
                : "منطقة محظورة: مخصصة للأطباء والمساعدين فقط"}
            </p>
          </div>

          {/* Error Display */}
          {(error || localError) && (
            <div className='mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-100 animate-slide-up'>
              <AlertCircle size={16} />
              {localError || error}
            </div>
          )}

          {/* Forms */}
          {activeTab === "patient" ? (
            step === "phone" ? (
              <form onSubmit={handlePhoneSubmit} className='space-y-4 animate-fade-in'>
                <div>
                  <label className='block text-sm font-bold text-gray-700 mb-1'>
                    رقم الهاتف
                  </label>
                  <div className='relative'>
                    <input
                      type='tel'
                      placeholder='079xxxxxxx'
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      className='w-full border border-gray-300 rounded-xl p-3 pl-10 focus:ring-2 focus:ring-teal-500 outline-none dir-ltr text-right transition font-mono tracking-wider'
                      autoFocus
                      maxLength={10}
                    />
                    <Phone
                      className='absolute left-3 top-3.5 text-gray-400'
                      size={18}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">يجب أن يبدأ بـ 079, 078, أو 077</p>
                </div>

                <button
                  type='submit'
                  disabled={checking}
                  className='w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition shadow-md hover:shadow-lg flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed'
                >
                  {checking ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <LogIn size={18} /> متابعة
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleNameSubmit} className='space-y-4 animate-fade-in'>
                 <div className="bg-teal-50 p-3 rounded-lg text-teal-800 text-sm mb-4 border border-teal-100">
                    رقم الهاتف: <span className="font-mono font-bold dir-ltr inline-block">{phone}</span>
                    <button type="button" onClick={() => setStep("phone")} className="mr-2 text-teal-600 underline text-xs">تغيير</button>
                 </div>
                 
                 <div>
                  <label className='block text-sm font-bold text-gray-700 mb-1'>
                    الاسم الكامل
                  </label>
                  <div className='relative'>
                    <input
                      type='text'
                      placeholder='أدخل اسمك هنا'
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className='w-full border border-gray-300 rounded-xl p-3 pl-10 focus:ring-2 focus:ring-teal-500 outline-none transition'
                      autoFocus
                    />
                    <User
                      className='absolute left-3 top-3.5 text-gray-400'
                      size={18}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">هذه زيارتك الأولى، يرجى تسجيل اسمك.</p>
                </div>

                <button
                  type='submit'
                  className='w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition shadow-md hover:shadow-lg flex justify-center items-center gap-2'
                >
                  <UserPlus size={18} /> إنشاء ملف ودخول
                </button>
              </form>
            )
          ) : (
            <form onSubmit={handleDoctorLoginAttempt} className='space-y-4 animate-fade-in'>
              <div>
                <label className='block text-sm font-bold text-gray-700 mb-1'>
                  رمز الدخول (Access Code)
                </label>
                <div className='relative'>
                  <input
                    type='password'
                    placeholder='•••••'
                    value={doctorPass}
                    onChange={(e) => setDoctorPass(e.target.value)}
                    className='w-full border border-gray-300 rounded-xl p-3 pl-10 focus:ring-2 focus:ring-indigo-500 outline-none text-center tracking-widest text-lg transition'
                    autoFocus
                  />
                  <Lock
                    className='absolute left-3 top-3.5 text-gray-400'
                    size={18}
                  />
                </div>
              </div>

              <button
                type='submit'
                className='w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-md hover:shadow-lg flex justify-center items-center gap-2'
              >
                <ShieldCheck size={18} /> تحقق ودخول
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
export default Login;
