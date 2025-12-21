import dynamic from "next/dynamic";
import { sanityFetch } from "@/lib/sanity";
import { Procedure } from "@/types";
import { PROCEDURES } from "@/services/mockData";

const ProceduresContent = dynamic(() => import("@/components/pages/ProceduresContent"), {
  loading: () => <div className="min-h-screen bg-slate-50 animate-pulse" />,
});

export default async function ProceduresPage() {
  const procedures = await sanityFetch<Procedure[]>({
    query: `*[_type == "procedure"]{
      "id": _id,
      title,
      description,
      category,
      duration,
      painLevel,
      "imageUrl": coalesce(image.asset->url, imageUrl.asset->url),
      videoUrl,
      "steps": coalesce(steps, []),
      "postCare": coalesce(postCare, [])
    }`,
    tags: ["procedure"],
  });

  const displayProcedures = procedures && procedures.length > 0 
    ? procedures 
    : PROCEDURES;

  return <ProceduresContent procedures={displayProcedures} />;
}
