import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Helper function to refresh the access token
async function refreshAccessToken(token: any) {
  try {
    const url =
      "https://oauth2.googleapis.com/token?" +
      new URLSearchParams({
        client_id: process.env.AUTH_GOOGLE_ID!,
        client_secret: process.env.AUTH_GOOGLE_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      });

    const response = await fetch(url, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      method: "POST",
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000, 
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fallback to old refresh token if new one not sent
    };
  } catch (error) {
    console.log("RefreshAccessTokenError", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid profile email https://www.googleapis.com/auth/gmail.readonly",
        },
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        // @ts-ignore
        session.accessToken = token.accessToken;
        // @ts-ignore
        session.refreshToken = token.refreshToken;
        // @ts-ignore
        session.error = token.error; // Pass error state to the client
        
        session.user.email = (token.email as string) || ""; 
      }
      return session;
    },
    async jwt({ token, account, user }) {
      // 1. Initial Sign In
      if (account && user) {
        return {
          ...token,
          accessToken: account.access_token,
          accessTokenExpires: Date.now() + (account.expires_in as number * 1000), // Save expiry time
          refreshToken: account.refresh_token,
          user,
          email: user.email || ""
        };
      }

      // 2. Return previous token if it has not expired yet
      // @ts-ignore
      if (Date.now() < token.accessTokenExpires) {
        return token;
      }

      // 3. Access token has expired, try to update it
      return refreshAccessToken(token);
    },
  },
});