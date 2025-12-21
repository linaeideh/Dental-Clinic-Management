'use client'

import dynamic from "next/dynamic";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const Login = dynamic(() => import("@/components/pages/Login"), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-gray-50 animate-pulse" />,
});

export default function LoginPage() {
  const { user, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [user, router]);

  const handlePatientLogin = (phone: string) => {
    login({ id: phone, name: `مريض (${phone})`, role: 'patient' });
  };

  const handleDoctorLogin = () => {
    login({ id: 'admin', name: 'جراح أسنان', role: 'admin' });
  };

  return (
    <div className="py-12">
      <Login 
        onPatientLogin={handlePatientLogin} 
        onDoctorLogin={handleDoctorLogin} 
        error="" 
      />
    </div>
  );
}
