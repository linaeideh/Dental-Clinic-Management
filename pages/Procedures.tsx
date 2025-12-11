import React, { useEffect } from 'react';
import { PROCEDURES } from '../services/mockData';
import { PageView, Procedure } from '../types';
import { Clock, Activity, ChevronLeft, ArrowRight } from 'lucide-react';

interface ProceduresProps {
  setPage: (page: PageView) => void;
  setSelectedProcedure: (proc: Procedure) => void;
}

const Procedures: React.FC<ProceduresProps> = ({ setPage, setSelectedProcedure }) => {
  
  // Scroll to top when page opens
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSelect = (proc: Procedure) => {
    setSelectedProcedure(proc);
    setPage(PageView.PROCEDURE_DETAIL);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-6">دليل الإجراءات والعلاجات</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
            نقدم مجموعة شاملة من الخدمات العلاجية والتجميلية. تصفح الإجراءات لمعرفة الخطوات، المدة الزمنية، وماذا تتوقع.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PROCEDURES.map((proc, index) => (
            <div 
                key={proc.id} 
                className="group bg-white rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 flex flex-col h-full hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60 group-hover:opacity-40 transition duration-500"></div>
                  <img src={proc.imageUrl} alt={proc.title} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" />
                  <div className="absolute bottom-4 right-4 z-20">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-md border border-white/20 text-white ${
                          proc.category === 'Surgery' ? 'bg-red-500/80' :
                          proc.category === 'Cosmetic' ? 'bg-purple-500/80' :
                          'bg-teal-500/80'
                      }`}>
                          {proc.category === 'Surgery' ? 'جراحة' : proc.category === 'Cosmetic' ? 'تجميل' : 'علاج عام'}
                      </span>
                  </div>
              </div>
              
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-teal-600 transition">{proc.title}</h3>
                
                <div className="flex flex-wrap gap-3 mb-6">
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                        <Clock size={14} className="text-teal-500" /> 
                        <span className="text-xs font-bold text-gray-600">{proc.duration}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                         <Activity size={14} className={proc.painLevel === 'High' ? 'text-red-500' : proc.painLevel === 'Medium' ? 'text-orange-400' : 'text-green-500'} />
                         <span className={`text-xs font-bold ${proc.painLevel === 'High' ? 'text-red-500' : proc.painLevel === 'Medium' ? 'text-orange-500' : 'text-green-600'}`}>
                             {proc.painLevel === 'High' ? 'ألم محتمل' : proc.painLevel === 'Medium' ? 'ألم متوسط' : 'ألم خفيف'}
                         </span>
                    </div>
                </div>

                <p className="text-gray-500 text-sm mb-8 line-clamp-3 leading-relaxed flex-1">{proc.description}</p>
                
                <button 
                  onClick={() => handleSelect(proc)}
                  className="w-full py-4 rounded-xl bg-gray-50 text-gray-800 font-bold hover:bg-teal-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg"
                >
                  التفاصيل والخطوات <ChevronLeft size={18} className="rtl:rotate-180 transition-transform group-hover:-translate-x-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Procedures;