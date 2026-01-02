import { google } from "googleapis";
import { classifyEmail } from "@/lib/classifier";
import connectDB from "@/lib/db";
import Application from "@/models/Application";
import { NextResponse } from "next/server";

export async function POST() {
  // 1. Validate all required keys are present
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return NextResponse.json({ 
      error: "Missing credentials in .env", 
      details: "Ensure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN are set."
    }, { status: 500 });
  }

  await connectDB();

  // 2. Setup Google Client with YOUR specific ID and Secret
  const authClient = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "https://developers.google.com/oauthplayground" // Redirect URI (must match what you used to get the token)
  );

  // 3. Set the Refresh Token
  authClient.setCredentials({ refresh_token: refreshToken });

  const gmail = google.gmail({ version: 'v1', auth: authClient });

  try {
    // 4. List messages
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'subject:(application OR interview OR job) after:2024-01-01',
      maxResults: 20,
    });

    const messages = response.data.messages || [];
    let addedCount = 0;

    for (const msg of messages) {
      const details = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
        format: 'full',
      });

      const result = classifyEmail(details.data as any);
      
      if (result) {
        await Application.findOneAndUpdate(
          { threadId: result.threadId },
          { 
            userEmail: "me@local",
            company: result.company,
            role: result.role,
            status: result.status,
            subject: result.subject,
            snippet: result.snippet,
            emailDate: result.date
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        addedCount++;
      }
    }
    
    // Redirect back to dashboard after sync
    return NextResponse.redirect(new URL('/', 'http://localhost:3000'));
    
  } catch (error: any) {
    console.error("Sync Error:", error);
    return NextResponse.json({ 
      error: "Failed to sync.", 
      message: error.message,
      // specific helpful error for auth issues
      hint: error.code === 401 ? "Check if your Refresh Token belongs to the Client ID in .env" : undefined
    }, { status: 500 });
  }
}