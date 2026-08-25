import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { canManageGuild } from "@/lib/permissions";
import { isMasterGuild, resolveGuildFeatures } from "@/lib/config";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const guildId = String(id).trim();

  const allowed = await canManageGuild(session, guildId);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const isMaster = isMasterGuild(guildId);

    let res: any = { rows: [] };
    try {
      res = await pool.query(
        "SELECT tier, premium_until, is_master FROM guild_settings WHERE guild_id = $1::bigint",
        [guildId]
      );
    } catch (dbErr: any) {
      console.warn("[Features API GET] DB query failed, using defaults:", dbErr?.message);
    }

    let tier = 0;
    let premiumUntil: string | null = null;
    let effectiveIsMaster = isMaster;

    if (res.rows.length > 0) {
      const row = res.rows[0];
      tier = row.tier || 0;
      premiumUntil = row.premium_until;
      effectiveIsMaster = isMaster || !!row.is_master;
    }

    const features = resolveGuildFeatures(guildId, tier, effectiveIsMaster, premiumUntil);
    return NextResponse.json(features);
  } catch (error) {
    console.error("[Features API GET] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
