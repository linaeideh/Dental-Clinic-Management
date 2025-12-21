import React from 'react';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';
import Logo from '../Logo';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-white p-1 rounded-full text-slate-900">
                    <Logo className="h-8 w-8" />
                </div>
                <h3 className="text-white text-lg font-bold">عيادة سما لطب الأسنان</h3>
            </div>
            <p className="text-sm leading-relaxed">
              نقدم رعاية أسنان متكاملة باستخدام أحدث التقنيات. فريقنا الطبي مكرس لراحتك وابتسامتك الصحية في قلب عمان.
            </p>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-4">تواصل معنا</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-teal-500" />
                <span dir="ltr">078 552 2478</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-teal-500" />
                <span>info@sama-clinic.jo</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-teal-500" />
                <span>الأردن، عمان</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-lg font-bold mb-4">ساعات العمل</h3>
            <ul className="space-y-1 text-sm">
              <li>السبت - الخميس: 10:00 ص - 6:00 م</li>
              <li>الجمعة: مغلق</li>
            </ul>
            <div className="flex gap-4 mt-4">
              <Facebook className="hover:text-teal-500 cursor-pointer" />
              <Twitter className="hover:text-teal-500 cursor-pointer" />
              <Instagram className="hover:text-teal-500 cursor-pointer" />
            </div>
          </div>
        </div>
        <div className="border-t border-slate-700 mt-8 pt-6 text-center text-xs">
          &copy; {new Date().getFullYear()} عيادة سما لطب الأسنان. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
