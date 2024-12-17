import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

export const options: NextAuthOptions = {
    providers: [
        CredentialsProvider({
          name: "Credentials",
          credentials: {
            username: { label: "Username", type: "text" },
            password: { label: "Password", type: "password" },
          },
          authorize: async (credentials) => {
            // Verifica username e password (da database o hardcoded per test)
            if (
              credentials &&
              credentials.username === process.env.ADMIN_USER &&
              credentials.password === process.env.ADMIN_PASSWORD
            ) {
              return { id: "1", name: "Admin" };
            }
            return null;
          },
        }),
        GoogleProvider({
          clientId: process.env.GOOGLE_ID || "",
          clientSecret: process.env.GOOGLE_SECRET || "",
        }),
      ],
      secret: process.env.NEXTAUTH_SECRET,
      callbacks: {
        async signIn({ account, profile }) {
          if (account && account.provider === "google") {
            return (profile?.email === "alby.tiri@gmail.com" || profile?.email === "alberto.tiribelli@gmail.com");
          }
          return true // Do different verification for other providers that don't have `email_verified`
        },
      }
}