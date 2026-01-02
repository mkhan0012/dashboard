import { google } from "googleapis";
import connectDB from "@/lib/db";
import Application from "@/models/Application";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Simple Helper to extract Company Name from "From" header
// e.g., "Google Careers <noreply@google.com>" -> "Google Careers"
function extractCompany(fromHeader: string) {
  const match = fromHeader.match(/^"?(.*?)"? <.*>$/);
  return match ? match[1].trim().replace(/"/g, "") : fromHeader.split('@')[0];
}

// Simple Classifier Logic
function analyzeEmail(subject: string, snippet: string, from: string) {
  const text = (subject + " " + snippet).toLowerCase();
  
  // 1. Determine Status
  let status = "APPLIED";
  if (text.includes("interview") || text.includes("schedule")) status = "INTERVIEW";
  if (text.includes("offer") || text.includes("letter")) status = "OFFER";
  if (text.includes("reject") || text.includes("unfortunately")) status = "REJECTED";

  // 2. Extract Company
  // Fallback: Use the Sender Name if we can't find a better one
  const company = extractCompany(from);

  return { role: subject, company, status };
}

export async function POST() {
  try {
    const session = await auth();
    // @ts-ignore
    const token = session?.accessToken;

    if (!token) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const authClient = new google.auth.OAuth2();
    authClient.setCredentials({ access_token: token });
    const gmail = google.gmail({ version: 'v1', auth: authClient });

    // 1. SEARCH: More specific keywords to avoid spam
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: 'subject:(application OR interview OR offer OR "status of your job") -subject:"security alert" -subject:"verification" after:2024-01-01',
      maxResults: 20,
    });

    const messages = response.data.messages || [];
    await connectDB();
    let addedCount = 0;

    // 2. PROCESS
    for (const msg of messages) {
      try {
        const details = await gmail.users.messages.get({ userId: 'me', id: msg.id!, format: 'full' });
        const headers = details.data.payload?.headers;
        
        const subject = headers?.find(h => h.name === 'Subject')?.value || "No Subject";
        const from = headers?.find(h => h.name === 'From')?.value || "Unknown";
        const snippet = details.data.snippet || "";

        // Run Analysis
        const result = analyzeEmail(subject, snippet, from);
        
        // SAVE TO DB
        await Application.findOneAndUpdate(
          { threadId: details.data.threadId },
          { 
            userEmail: session?.user?.email, 
            company: result.company,
            role: result.role,     // Will be the Subject Line (User can edit later)
            status: result.status,
            subject: subject,
            snippet: snippet,
            emailDate: new Date(parseInt(details.data.internalDate!))
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        addedCount++;
        
      } catch (e) {
        console.error("Skipped email:", e);
      }
    }
    
    return NextResponse.json({ success: true, count: addedCount });
    
  } catch (error: any) {
    console.error("Sync Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}