import React from 'react';
import { PageView, Testimonial } from '../types';
import { ArrowLeft, Clock, ShieldCheck, Users, Sparkles, Star, Quote, ChevronRight, Zap, Smile, Gem } from 'lucide-react';

interface HomeProps {
  setPage: (page: PageView) => void;
  testimonials?: Testimonial[];
}

const Home: React.FC<HomeProps> = ({ setPage, testimonials = [] }) => {
  // Only show the last 3 testimonials
  const displayTestimonials = testimonials.slice(0, 3);

  return (
    // Added -mt-28 to pull the Hero section up behind the fixed navbar, eliminating the white gap
    <div className="flex flex-col animate-fade-in -mt-28">
      {/* Hero Section */}
      <div className="relative min-h-[750px] flex items-center overflow-hidden bg-slate-900 rounded-b-[3rem] shadow-2xl mb-10">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
            {/* Updated image to a Dental Office / Clinic interior */}
            <img 
                src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=2000" 
                alt="عيادة د. محمد" 
                className="w-full h-full object-cover opacity-80" 
            />
            {/* Lighter gradient to ensure image is visible but text is still readable */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent"></div>
        </div>

        {/* Added padding-top to compensate for the negative margin and navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full pt-32 md:pt-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl animate-slide-up">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/20 text-teal-200 border border-teal-500/30 text-sm font-bold mb-6 backdrop-blur-md">
                    <Sparkles size={14} className="text-yellow-400" /> ابتسامة هوليوود في انتظارك
                </span>
                <h1 className="text-4xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
                  اكتشف سر <br/> 
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-300">
                      الثقة الدائمة
                  </span>
                </h1>
                <p className="text-lg text-gray-200 mb-8 leading-relaxed max-w-lg font-medium drop-shadow-md">
                  نصمم ابتسامتك بأحدث التقنيات الرقمية. رعاية طبية فائقة، بدون ألم، ونتائج تفوق توقعاتك.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => setPage(PageView.BOOKING)}
                    className="bg-teal-500 hover:bg-teal-400 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-teal-500/20 transition transform hover:-translate-y-1 flex items-center justify-center gap-3 group"
                  >
                    احجز استشارتك الآن <ArrowLeft size={20} className="group-hover:-translate-x-1 transition" />
                  </button>
                  <button 
                    onClick={() => setPage(PageView.PROCEDURES)}
                    className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full font-bold hover:bg-white/20 transition flex items-center justify-center"
                  >
                    خدماتنا المميزة
                  </button>
                </div>
                
                <div className="mt-12 flex items-center gap-8">
                    <div className="flex -space-x-4 space-x-reverse">
                         {[1,2,3,4].map(i => (
                             <div key={i} className="w-12 h-12 rounded-full border-2 border-slate-900 overflow-hidden">
                                 <img src={`https://i.pravatar.cc/150?img=${i + 10}`} alt="client" />
                             </div>
                         ))}
                         <div className="w-12 h-12 rounded-full border-2 border-slate-900 bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                             +500
                         </div>
                    </div>
                    <div>
                        <div className="text-white font-bold drop-shadow-sm">انضم لعملائنا السعداء</div>
                        <div className="text-teal-300 text-sm">نتائج مضمونة وموثقة</div>
                    </div>
                </div>
            </div>
            
            {/* Hero Image / Visual - Eye Catching Smile */}
            <div className="hidden md:block relative animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-teal-900/50 border border-white/10 group transform hover:scale-[1.02] transition duration-700">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10"></div>
                    {/* New Eye-Catching Image: Smiling confident woman */}
                    <img src="https://images.unsplash.com/photo-1616391182219-e080b4d1043a?auto=format&fit=crop&q=80&w=800" alt="Perfect Smile" className="w-full h-auto object-cover" />
                    
                    <div className="absolute bottom-8 right-8 left-8 z-20">
                         <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 hover:bg-white/20 transition">
                             <div className="flex items-center gap-4 mb-2">
                                 <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white shadow-lg">
                                     <Sparkles size={24} />
                                 </div>
                                 <div>
                                     <div className="font-bold text-white text-lg">تحول جذري</div>
                                     <div className="text-teal-200 text-sm">ابتسامة هوليوود</div>
                                 </div>
                             </div>
                         </div>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-500/20 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Highlight */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-extrabold text-slate-900 mb-4">خدمات شاملة لصحة فمك</h2>
                <p className="text-slate-500 max-w-2xl mx-auto">نغطي كافة احتياجاتك الطبية من العلاجات الأساسية إلى التجميلية المتقدمة.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 {[
                     { title: 'زراعة الأسنان', icon: <Gem size={40} strokeWidth={1.5} />, desc: 'حلول دائمة لتعويض الأسنان المفقودة.' },
                     { title: 'تجميل وابتسامة', icon: <Sparkles size={40} strokeWidth={1.5} />, desc: 'فينير، تبييض، وتصميم الابتسامة.' },
                     { title: 'علاج الجذور', icon: <Zap size={40} strokeWidth={1.5} />, desc: 'أحدث تقنيات سحب العصب بدون ألم.' },
                     { title: 'تقويم الأسنان', icon: <Smile size={40} strokeWidth={1.5} />, desc: 'تقويم شفاف ومعدني لجميع الأعمار.' },
                 ].map((service, i) => (
                     <div key={i} className="group p-8 bg-slate-50 rounded-3xl hover:bg-teal-500 transition duration-300 hover:shadow-xl cursor-pointer border border-slate-100 hover:border-teal-400" onClick={() => setPage(PageView.PROCEDURES)}>
                         <div className="mb-6 text-teal-600 group-hover:text-white transition-transform duration-300 group-hover:scale-110 origin-right inline-block">
                             {service.icon}
                         </div>
                         <h3 className="text-xl font-bold text-slate-900 group-hover:text-white mb-2">{service.title}</h3>
                         <p className="text-slate-500 group-hover:text-teal-100 text-sm leading-relaxed">{service.desc}</p>
                     </div>
                 ))}
            </div>
            
            <div className="mt-12 text-center">
                <button onClick={() => setPage(PageView.PROCEDURES)} className="inline-flex items-center gap-2 text-teal-600 font-bold hover:text-teal-700 transition border-b-2 border-teal-600 pb-1">
                    عرض جميع الخدمات <ChevronRight size={18} className="rtl:rotate-180" />
                </button>
            </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white rounded-3xl shadow-sm hover:shadow-md transition duration-300">
              <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mb-6">
                <Clock size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">بدون انتظار</h3>
              <p className="text-gray-600 leading-relaxed">نظام مواعيد دقيق يضمن دخولك في الوقت المحدد. وقتك ثمين عندنا.</p>
            </div>
            <div className="p-8 bg-white rounded-3xl shadow-sm hover:shadow-md transition duration-300">
              <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">تعقيم مثالي</h3>
              <p className="text-gray-600 leading-relaxed">نطبق أعلى معايير التعقيم العالمية (CDC) لضمان بيئة آمنة تماماً.</p>
            </div>
            <div className="p-8 bg-white rounded-3xl shadow-sm hover:shadow-md transition duration-300">
              <div className="w-14 h-14 bg-teal-100 text-teal-600 rounded-2xl flex items-center justify-center mb-6">
                <Users size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">رعاية شخصية</h3>
              <p className="text-gray-600 leading-relaxed">خطة علاجية مصممة خصيصاً لك، مع شرح مفصل لكل خطوة قبل البدء.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                <div>
                    <span className="text-teal-600 font-bold tracking-wider text-sm">قصص نجاح</span>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-2">ماذا يقول مرضانا</h2>
                </div>
                {/* Removed the rating badge div as requested */}
            </div>
            
            {displayTestimonials.length === 0 ? (
                <div className="text-center bg-slate-50 rounded-3xl p-12 border border-dashed border-slate-200">
                    <p className="text-gray-400">لا توجد تقييمات بعد. كن أول من يشاركنا تجربته!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {displayTestimonials.map((testimonial) => (
                        <div key={testimonial.id} className="bg-slate-50 p-8 rounded-[2rem] hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-slate-100 group">
                            <div className="mb-6">
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star 
                                        key={i} 
                                        size={18} 
                                        className={i < testimonial.rating ? "fill-amber-400 text-amber-400" : "text-gray-200 group-hover:text-gray-100"} 
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="text-slate-600 mb-8 leading-relaxed font-medium">"{testimonial.comment}"</p>
                            <div className="flex items-center gap-4 border-t border-slate-200/50 pt-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                                    {testimonial.patientName.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900">{testimonial.patientName}</div>
                                    <div className="text-xs text-slate-400" dir="ltr">{testimonial.date}</div>
                                </div>
                                <Quote className="mr-auto text-slate-200 group-hover:text-teal-100 transition" size={32} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </section>

      {/* AI Teaser - Modernized */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-600/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2">
                <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800" alt="AI Tech" className="rounded-3xl shadow-2xl border border-white/10" />
            </div>
            <div className="md:w-1/2 text-right">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-6 border border-purple-500/30">
                    <Sparkles size={12} /> تكنولوجيا حصرية
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">شخّص حالتك <br/> بالذكاء الاصطناعي</h2>
                <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                    لا داعي للحيرة. التقط صورة لأسنانك ودع خوارزمياتنا المتقدمة تحلل الحالة وتقدم لك تقريراً مبدئياً فورياً، مجاناً ومن منزلك.
                </p>
                <button 
                  onClick={() => setPage(PageView.AI_DIAGNOSIS)}
                  className="bg-white text-slate-900 px-8 py-4 rounded-full font-bold hover:bg-purple-50 transition shadow-xl shadow-purple-900/20 flex items-center gap-2"
                >
                     جرب الآن مجاناً <ArrowLeft size={18} />
                </button>
            </div>
        </div>
      </section>
    </div>
  );
};

export default Home;