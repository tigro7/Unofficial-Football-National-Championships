import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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
      ],
      secret: process.env.NEXTAUTH_SECRET,
}