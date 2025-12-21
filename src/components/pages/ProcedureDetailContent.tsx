'use client'

import React from 'react'
import Image from 'next/image'
import { ArrowRight, CheckCircle, PlayCircle, AlertCircle } from 'lucide-react'
import { Procedure } from '@/types'
import Link from 'next/link'

interface ProcedureDetailContentProps {
  procedure: Procedure
}

const ProcedureDetailContent: React.FC<ProcedureDetailContentProps> = ({ procedure }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <Link 
        href="/procedures"
        className="flex items-center text-gray-500 hover:text-teal-600 mb-6 transition"
      >
        <ArrowRight size={20} className="ml-2" /> العودة للقائمة
      </Link>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header Image/Video Placeholder */}
        <div className="relative h-64 md:h-96 bg-gray-200">
             <Image 
              src={procedure.imageUrl} 
              alt={procedure.title} 
              fill
              className="object-cover" 
             />
             <div className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer group">
                 <div className="bg-white/20 backdrop-blur-md p-4 rounded-full group-hover:bg-white/30 transition">
                     <PlayCircle size={64} className="text-white" />
                 </div>
                 <span className="absolute bottom-6 text-white font-medium">مشاهدة الفيديو التوضيحي</span>
             </div>
        </div>

        <div className="p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">{procedure.title}</h1>
                <span className="mt-2 md:mt-0 px-4 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold">
                    مدة الإجراء: {procedure.duration}
                </span>
            </div>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {procedure.description}
            </p>

            <div className="grid md:grid-cols-2 gap-12">
                {/* Steps */}
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</span>
                        خطوات العلاج
                    </h3>
                    <ul className="space-y-4">
                        {procedure.steps.map((step, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <div className="mt-1 min-w-[6px] h-[6px] rounded-full bg-blue-400" />
                                <span className="text-gray-700">{step}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Post Care */}
                <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                    <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
                        <CheckCircle size={24} />
                        تعليمات ما بعد العلاج
                    </h3>
                    <ul className="space-y-3">
                        {procedure.postCare.map((tip, index) => (
                            <li key={index} className="flex items-start gap-3 text-green-900">
                                <CheckCircle size={16} className="mt-1 text-green-600 flex-shrink-0" />
                                <span>{tip}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="mt-10 p-4 bg-orange-50 border-r-4 border-orange-400 rounded flex items-start gap-4">
                <AlertCircle className="text-orange-500 flex-shrink-0" />
                <div>
                    <h4 className="font-bold text-orange-800">تنبيه هام</h4>
                    <p className="text-sm text-orange-700 mt-1">
                        إذا شعرت بألم حاد مستمر، نزيف لا يتوقف، أو ارتفاع في درجة الحرارة بعد الإجراء، يرجى الاتصال بالطوارئ فوراً أو زيارة العيادة.
                    </p>
                </div>
            </div>

            <div className="mt-10 flex justify-center">
                <Link 
                    href="/booking"
                    className="bg-teal-600 text-white px-10 py-4 rounded-lg font-bold text-lg hover:bg-teal-700 transition shadow-lg w-full md:w-auto text-center"
                >
                    حجز موعد لهذا الإجراء
                </Link>
            </div>
        </div>
      </div>
    </div>
  )
}

export default ProcedureDetailContent
