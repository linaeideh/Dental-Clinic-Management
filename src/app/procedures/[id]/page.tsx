import { sanityFetch } from "@/lib/sanity";
import { Procedure } from "@/types";
import ProcedureDetailContent from "@/components/pages/ProcedureDetailContent";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const procedures = await sanityFetch<{ id: string }[]>({
    query: `*[_type == "procedure"]{ "id": _id }`,
  });

  return procedures.map((proc) => ({
    id: proc.id,
  }));
}

export default async function ProcedurePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const procedure = await sanityFetch<Procedure | null>({
    query: `*[_type == "procedure" && _id == $id][0]{
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
    params: { id },
    tags: [`procedure:${id}`],
  });

  if (!procedure) {
    notFound();
  }

  return <ProcedureDetailContent procedure={procedure} />;
}
