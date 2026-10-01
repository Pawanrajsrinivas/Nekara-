import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AccountOrderDetailRedirect({ params }: PageProps) {
  const { id } = await params;
  redirect(`/orders/${id}`);
}
