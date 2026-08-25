import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";
import { getConfig } from "@/lib/config";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { priceId, tier, interval, guildId } = await req.json();

    if (!guildId) {
      return NextResponse.json({ error: "Missing guildId" }, { status: 400 });
    }

    const config = getConfig();
    let effectivePriceId = priceId;

    if (!effectivePriceId && tier !== undefined) {
      const products = config.stripe_config?.products || {};
      const targetInterval = interval || 'mo';
      effectivePriceId = Object.keys(products).find((pid) => {
        const p = products[pid];
        return Number(p.tier) === Number(tier) && p.interval === targetInterval;
      });
    }

    if (!effectivePriceId) {
      return NextResponse.json({ error: "Invalid plan or price not found" }, { status: 400 });
    }

    // Load URLs from config
    let successUrl = `${req.nextUrl.origin}/dashboard/${guildId}?success=true`;
    let cancelUrl = `${req.nextUrl.origin}/dashboard/${guildId}/billing?canceled=true`;

    if (config.stripe_config?.success_url) {
      successUrl = config.stripe_config.success_url.replace("?payment=success", `?guild=${guildId}&success=true`);
    }
    if (config.stripe_config?.cancel_url) {
      cancelUrl = config.stripe_config.cancel_url.includes("?") 
        ? `${config.stripe_config.cancel_url}&guild=${guildId}&canceled=true`
        : `${config.stripe_config.cancel_url}?guild=${guildId}&canceled=true`;
    }

    // Create Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card", "revolut_pay"],
      line_items: [
        {
          price: effectivePriceId,
          quantity: 1,
        },
      ],
      client_reference_id: String(guildId),
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        guildId: String(guildId),
        userId: (session.user as any)?.id
      },
      subscription_data: {
        metadata: {
          guildId: String(guildId)
        }
      }
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("[Stripe Checkout] Error:", error);
    return NextResponse.json({ error: error?.message || "Checkout creation failed" }, { status: 500 });
  }
}
