'use client'
import dynamic from "next/dynamic";

const AIDiagnosis = dynamic(() => import("@/components/pages/AIDiagnosis"), {
  ssr: false,
  loading: () => <div className="min-h-screen bg-white animate-pulse" />,
});

export default function AIDiagnosisPage() {
  return <AIDiagnosis />;
}
