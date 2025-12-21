import dynamic from "next/dynamic";
import { sanityFetch } from "@/lib/sanity";
import { Testimonial } from "@/types";
import { TESTIMONIALS } from "@/services/mockData";
import { supabase } from "@/services/supabaseClient";

const HomeContent = dynamic(() => import("@/components/pages/HomeContent"), {
  loading: () => <div className="min-h-screen bg-slate-900 animate-pulse" />,
});

export default async function HomePage() {
  // Try fetching from Supabase first as requested by the user
  let supabaseTestimonials: Testimonial[] = [];
  try {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6);
    
    if (data && !error) {
      supabaseTestimonials = data.map((item: any) => ({
        id: item.id,
        patientName: item.patient_name,
        rating: item.rating,
        comment: item.comment,
        date: item.date || new Date(item.created_at).toLocaleDateString('en-GB')
      }));
    }
  } catch (err) {
    console.error("Supabase testimonials fetch error:", err);
  }

  // Fallback to Sanity or Mock
  let finalTestimonials = supabaseTestimonials;
  
  if (finalTestimonials.length === 0) {
    // Try Sanity as secondary source
    try {
      const sanityData = await sanityFetch<Testimonial[]>({
        query: `*[_type == "testimonial"] | order(date desc) [0...6]`,
        tags: ["testimonial"],
      });
      if (sanityData && sanityData.length > 0) {
          finalTestimonials = sanityData;
      }
    } catch (err) {
      console.error("Sanity testimonials fetch error:", err);
    }
  }

  // Final fallback to mock data
  if (finalTestimonials.length === 0) {
    finalTestimonials = TESTIMONIALS;
  }

  return <HomeContent testimonials={finalTestimonials} />;
}
