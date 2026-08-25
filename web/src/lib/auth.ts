import { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import fs from "fs";
import path from "path";
import JSONBigFactory from "json-bigint";

const JSONbig = JSONBigFactory({ storeAsString: true });

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
      authorization: { params: { scope: 'identify email guilds' } },
    }),
  ],
  pages: {
    error: '/',
    signIn: '/',
  },
  callbacks: {
    async jwt({ token, profile, account }: any) {
      if (account) {
        token.accessToken = account.access_token;
      }
      if (profile) {
        token.id = profile.id;
        try {
          const configPath = path.join(process.cwd(), '../config.json');
          const rawData = fs.readFileSync(configPath, 'utf8');
          const config = JSONbig.parse(rawData);
          
          if (config.master_user_ids && config.master_user_ids.includes(String(profile.id))) {
            token.role = "master";
          } else {
            token.role = "user";
          }
        } catch (error) {
          console.error("Failed to read config.json:", error);
          token.role = "user";
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.accessToken = token.accessToken;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl) || url.startsWith("/")) {
        if (url.includes("/api/auth") || url === baseUrl || url === baseUrl + "/") {
          return `${baseUrl}/servers`;
        }
        if (url.startsWith("/")) return `${baseUrl}${url}`;
        return url;
      }
      return `${baseUrl}/servers`;
    },
  },
};

export interface GuildDashboardAuthResult {
  session: any;
  guildId: string;
  isMaster: boolean;
}

export async function requireGuildDashboardAuth(
  paramsPromise: Promise<{ guildId: string }> | { guildId: string }
): Promise<GuildDashboardAuthResult> {
  const { getServerSession } = await import("next-auth");
  const { redirect } = await import("next/navigation");

  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  const { guildId } = await paramsPromise;

  if (!guildId) {
    redirect("/servers");
  }

  const isMaster = (session?.user as any)?.role === "master";

  return {
    session,
    guildId,
    isMaster,
  };
}
