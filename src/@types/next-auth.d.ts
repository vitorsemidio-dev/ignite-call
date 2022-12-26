import NextAuth from "next-auth/next";

declare module "next-auth" {
  interface User {
    avatar_url: string;
  }
}
