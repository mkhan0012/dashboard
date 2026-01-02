import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          // Request access to read emails and get user profile
          scope: "openid email profile https://www.googleapis.com/auth/gmail.readonly",
          access_type: "offline", // Essential for getting a refresh token
          prompt: "consent",      // Force consent screen to ensure refresh token is returned
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Initial sign in
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        // token.expiresAt = account.expires_at; // Optional: handle token rotation later if needed
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token from a provider.
      // @ts-ignore
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  session: {
    strategy: "jwt", // Use JWT (default) instead of database sessions for simplicity
  },
  secret: process.env.AUTH_SECRET,
})