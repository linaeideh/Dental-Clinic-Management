import dynamic from "next/dynamic";
import { sanityFetch } from "@/lib/sanity";
import { Doctor, Procedure } from "@/types";
import { DOCTORS, PROCEDURES } from "@/services/mockData";

const BookingContent = dynamic(() => import("@/components/pages/BookingContent"), {
  loading: () => <div className="min-h-screen bg-white animate-pulse" />,
});

export default async function BookingPage() {
  const [doctors, procedures] = await Promise.all([
    sanityFetch<Doctor[]>({
      query: `*[_type == "doctor"]{
        "id": _id,
        name,
        specialty,
        "imageUrl": coalesce(image.asset->url, imageUrl.asset->url)
      }`,
      tags: ["doctor"],
    }),
    sanityFetch<Procedure[]>({
      query: `*[_type == "procedure"]{
        "id": _id,
        title,
        description,
        category,
        duration,
        painLevel,
        "imageUrl": coalesce(image.asset->url, imageUrl.asset->url),
        "steps": coalesce(steps, []),
        "postCare": coalesce(postCare, [])
      }`,
      tags: ["procedure"],
    }),
  ]);

  const displayDoctors = doctors && doctors.length > 0 ? doctors : DOCTORS;
  const displayProcedures = procedures && procedures.length > 0 ? procedures : PROCEDURES;

  return <BookingContent initialDoctors={displayDoctors} initialProcedures={displayProcedures} />;
}
