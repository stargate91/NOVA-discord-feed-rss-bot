import { DefaultSession } from "next-auth";

export type UserRole = "user" | "master" | string;

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: UserRole;
      accessToken?: string;
    } & DefaultSession["user"];
    accessToken?: string;
  }

  interface User {
    id: string;
    role?: UserRole;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    accessToken?: string;
  }
}

