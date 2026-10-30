import { TopicsPage } from "@/components/topic/topic-page";

export default async function NewTopicsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
console.log("paramssssss", id)
  return <TopicsPage key="nova" subjectId={id} />;
}

