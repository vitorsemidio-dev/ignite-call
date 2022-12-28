import NextAuth from "next-auth/next";

declare module "next-auth" {
  interface User {
    avatar_url: string;
    username: string;
    name: string;
    bio?: string;
    email?: string;
  }

  interface Session {
    user: User;
  }
}
