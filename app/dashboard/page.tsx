import connectDB from "@/lib/db";
import Application from "@/models/Application";
import DashboardClient from "@/components/DasboardClient"; // Imports the client component

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  await connectDB();

  // 1. Fetch Data
  const rawApps = await Application.find({}).sort({ emailDate: -1 }).lean();
  
  // 2. Serialize Data
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

  // 3. Render Client Component
  return <DashboardClient initialApps={apps} />;
}