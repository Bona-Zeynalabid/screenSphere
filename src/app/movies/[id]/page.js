import DetailView from "@/components/DetailView";

export default async function MovieDetailPage({ params }) {
  const { id } = await params;
  return <DetailView id={id} type="movie" />;
}