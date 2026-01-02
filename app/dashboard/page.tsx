import connectDB from "@/lib/db";
import Application from "@/models/Application";
import DashboardClient from "@/components/DashboardClient";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  await connectDB();
  
  // 1. Check Authentication
  const session = await auth();
  
  if (!session || !session.user?.email) {
    redirect("/api/auth/signin?callbackUrl=/dashboard"); // ✅ Force Login
  }

  // 2. Fetch Data ONLY for this user
  // ✅ Filter by userEmail: session.user.email
  const rawApps = await Application.find({ userEmail: session.user.email })
                                   .sort({ emailDate: -1 })
                                   .lean();
  
  // 3. Serialize Data
  const apps = rawApps.map((app: any) => ({
    _id: app._id.toString(),
    company: app.company,
    role: app.role,
    status: app.status,
    emailDate: app.emailDate.toISOString(),
    threadId: app.threadId,
    snippet: app.snippet || "",
    notes: app.notes || ""
  }));

  // 4. Render Client Component
  return <DashboardClient initialApps={apps} />;
}