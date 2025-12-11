import React, { useState, useEffect } from 'react';
import { PageView, User } from '../types';
import { Menu, X, Stethoscope, Calendar, User as UserIcon, Activity, Sparkles } from 'lucide-react';
import Logo from './Logo';

interface NavbarProps {
  setPage: (page: PageView) => void;
  currentPage: PageView;
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ setPage, currentPage, user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
        setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: PageView.HOME, label: 'الرئيسية', icon: <Activity size={18} /> },
    { id: PageView.PROCEDURES, label: 'الإجراءات', icon: <Stethoscope size={18} /> },
    { id: PageView.BOOKING, label: 'حجز موعد', icon: <Calendar size={18} /> },
    { id: PageView.AI_DIAGNOSIS, label: 'التشخيص الذكي', icon: <Sparkles size={18} className="text-yellow-400" /> },
  ];

  const handleNav = (page: PageView) => {
    setPage(page);
    setIsOpen(false);
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-teal-900/90 backdrop-blur-md shadow-lg py-3' : 'bg-teal-900 py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          <div className="flex items-center cursor-pointer gap-3" onClick={() => handleNav(PageView.HOME)}>
            <div className="flex-shrink-0 bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/10">
              <Logo className="h-8 w-8" />
            </div>
            <div>
                 <div className="font-bold text-xl text-white tracking-wide">عيادة سما</div>
                 <div className="text-xs text-teal-200">لطب وجراحة الأسنان</div>
            </div>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-2 space-x-reverse bg-white/5 p-1 rounded-full backdrop-blur-sm border border-white/10">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                    currentPage === item.id 
                    ? 'bg-white text-teal-900 shadow-md' 
                    : 'text-teal-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:block">
            {user ? (
               <div className="flex items-center gap-3 pl-2">
                 <button 
                    onClick={() => setPage(PageView.DASHBOARD)} 
                    className="flex items-center gap-2 text-sm text-white bg-teal-800/50 px-4 py-2 rounded-full hover:bg-teal-800 transition border border-teal-600/50"
                 >
                    <UserIcon size={16} />
                    {user.name}
                 </button>
                 <button onClick={onLogout} className="bg-red-500/80 hover:bg-red-600 text-white px-4 py-2 rounded-full text-xs font-bold transition">
                   خروج
                 </button>
               </div>
            ) : (
              <button 
                onClick={() => setPage(PageView.LOGIN)} 
                className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:shadow-lg hover:shadow-teal-500/30 text-white px-6 py-2.5 rounded-full text-sm font-bold transition transform hover:-translate-y-0.5 border border-white/10"
              >
                دخول المرضى
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-teal-100 hover:text-white hover:bg-teal-800 focus:outline-none"
            >
              {isOpen ? <X className="block h-7 w-7" /> : <Menu className="block h-7 w-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-teal-900 border-t border-teal-800 absolute w-full shadow-xl">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`flex items-center gap-3 w-full text-right px-4 py-3 rounded-xl text-base font-bold ${
                  currentPage === item.id ? 'bg-white/10 text-white' : 'text-teal-100 hover:bg-teal-800'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            <div className="border-t border-teal-800 my-4 pt-4">
                 {user ? (
                   <div className="space-y-3">
                       <button onClick={() => handleNav(PageView.DASHBOARD)} className="flex items-center gap-2 w-full text-right px-4 py-3 text-teal-100 font-bold hover:bg-teal-800 rounded-xl">
                            <UserIcon size={18}/> لوحة التحكم ({user.name})
                       </button>
                       <button onClick={onLogout} className="block w-full text-center bg-red-500/90 text-white py-3 rounded-xl font-bold">
                           تسجيل الخروج
                       </button>
                   </div>
                 ) : (
                  <button onClick={() => handleNav(PageView.LOGIN)} className="block w-full text-center bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-3 rounded-xl font-bold shadow-md">
                    تسجيل الدخول
                  </button>
                 )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;