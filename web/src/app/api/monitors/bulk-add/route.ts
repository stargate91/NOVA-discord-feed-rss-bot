import { NextRequest, NextResponse } from "next/server";
import { notifyBotOfChange } from "@/lib/bot_sync";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { query } from "@/lib/db";
import { resolveSource } from "@/lib/source_resolver";
import { isMasterGuild } from "@/lib/config";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { guildId, type, sources, targetChannels, targetRoles, embedColor, customImage, sendInitialAlert, use_native_player } = await req.json();

    if (!guildId || !type || !sources || !targetChannels || targetChannels.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check premium status and tier
    const guildRes = await query("SELECT tier, premium_until FROM guild_settings WHERE guild_id = $1::bigint", [guildId]);
    const guild = guildRes.rows[0];
    const isPremium = (guild?.premium_until && new Date(guild.premium_until) > new Date()) || guild?.tier >= 1;
    const tier = guild?.tier || 0;

    // Check if master guild
    const isMaster = isMasterGuild(guildId);

    if (!isMaster && (!isPremium || tier < 2)) {
      return NextResponse.json({ error: 'Professional tier required for Bulk Import.' }, { status: 403 });
    }

    // Build channel/role arrays as strings
    const channelIds: string[] = targetChannels.map((id: any) => String(id));
    const roleIds: string[] = (targetRoles || []).map((id: any) => String(id));

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (let source of sources) {
      try {
        const resolved = resolveSource(source, type);
        const name = resolved.name;
        const apiUrl = resolved.apiUrl;

        // Construct extra_settings JSON
        const extraSettings: Record<string, any> = {
          api_url: apiUrl,
          target_channels: channelIds,
          target_roles: roleIds,
          embed_color: embedColor || (type === 'youtube' ? null : '#3d3f45'),
          send_initial_alert: sendInitialAlert ?? false,
          custom_image: customImage && (isMaster || isPremium || tier >= 1) ? customImage : undefined,
          ...resolved.extra,
        };

        if (type === 'youtube' && use_native_player !== undefined) {
          extraSettings.use_native_player = use_native_player;
        }

        // Check for duplicates in this guild
        const dupCheck = await query(
          "SELECT id FROM monitors WHERE guild_id = $1::bigint AND type = $2 AND (extra_settings LIKE $3 OR name = $4)",
          [guildId, type, `%${apiUrl}%`, name]
        );

        if (dupCheck.rows.length > 0) {
          errorCount++;
          errors.push(`Skipped duplicate: ${name}`);
          continue;
        }

        // Insert into database
        await query(
          `INSERT INTO monitors (guild_id, type, name, enabled, extra_settings, discord_channel_id, ping_role_id)
           VALUES ($1::bigint, $2, $3, true, $4, $5::bigint, $6::bigint)`,
          [
            String(guildId), 
            type, 
            name,
            JSON.stringify(extraSettings),
            channelIds[0] ? String(channelIds[0]) : "0",
            roleIds[0] ? String(roleIds[0]) : "0"
          ]
        );
        successCount++;

      } catch (e: any) {
        errorCount++;
        errors.push(`Error adding ${source}: ${e?.message}`);
      }
    }

    // Notify bot to sync new monitors
    await notifyBotOfChange();

    return NextResponse.json({
      success: true,
      successCount,
      errorCount,
      errors
    });

  } catch (err) {
    console.error("Bulk add API error:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
