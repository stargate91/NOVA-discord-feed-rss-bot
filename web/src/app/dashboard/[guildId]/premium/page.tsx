import { redirect } from "next/navigation";

export default async function GuildPremiumRedirect({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  redirect(`/dashboard/${guildId}/billing`);
}
