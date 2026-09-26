import DetailView from "@/components/DetailView";

export default async function TVDetailPage({ params }) {
  const { id } = await params;
  return <DetailView id={id} type="tv" />;
}