import WatchView from "@/components/WatchView";

export default async function WatchPage({ params }) {
  const { type, id } = await params;
  return <WatchView type={type} id={id} />;
}