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
} from "lucide-react";

interface LoginProps {
  onPatientLogin: (phone: string) => void;
  onDoctorLogin: () => void;
  error: string;
}

// ============================================
// إعدادات الدخول
// يمكنك تغيير رمز دخول الطبيب من خلال تعديل القيمة في الأسفل
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

  // Doctor State
  const [doctorPass, setDoctorPass] = useState("");
  const [localError, setLocalError] = useState("");

  const handlePatientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (phone.length < 10) {
      setLocalError("يرجى إدخال رقم هاتف صحيح");
      return;
    }
    onPatientLogin(phone);
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
            <div className='mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-100'>
              <AlertCircle size={16} />
              {localError || error}
            </div>
          )}

          {/* Forms */}
          {activeTab === "patient" ? (
            <form onSubmit={handlePatientLogin} className='space-y-4'>
              <div>
                <label className='block text-sm font-bold text-gray-700 mb-1'>
                  رقم الهاتف
                </label>
                <div className='relative'>
                  <input
                    type='tel'
                    placeholder='079xxxxxxx'
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className='w-full border border-gray-300 rounded-xl p-3 pl-10 focus:ring-2 focus:ring-teal-500 outline-none dir-ltr text-right transition'
                    autoFocus
                  />
                  <Phone
                    className='absolute left-3 top-3.5 text-gray-400'
                    size={18}
                  />
                </div>
              </div>

              <button
                type='submit'
                className='w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition shadow-md hover:shadow-lg flex justify-center items-center gap-2'
              >
                <LogIn size={18} /> تسجيل الدخول
              </button>

              <p className='text-xs text-gray-400 text-center mt-4'>
                ليس لديك ملف؟ سيتم إنشاء ملف تلقائي عند الحجز.
              </p>
            </form>
          ) : (
            <form onSubmit={handleDoctorLoginAttempt} className='space-y-4'>
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
