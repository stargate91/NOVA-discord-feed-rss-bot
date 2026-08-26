import { redirect } from "next/navigation";
import { getGuildDashboardRoute } from "@/utils/navigation";

export default async function GuildPremiumRedirect({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  redirect(getGuildDashboardRoute(guildId, 'billing'));
}
