import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { resolveSource, detectPlatformFromRawInput } from "@/lib/source_resolver";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { input, type } = await req.json();
    if (!input || typeof input !== 'string') {
      return NextResponse.json({ error: "Input is required" }, { status: 400 });
    }

    const detected = detectPlatformFromRawInput(input);
    const resolved = resolveSource(input, type || detected?.type);

    return NextResponse.json(resolved);
  } catch (error: any) {
    console.error("[API Resolve] Error:", error);
    return NextResponse.json({ error: "Failed to resolve source" }, { status: 500 });
  }
}
