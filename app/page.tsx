import connectDB from "@/lib/db";
import Application from "@/models/Application";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

// 1. Define the Type for your Application data
interface AppData {
  _id: any; // Allow _id to be any type (ObjectId or string) to prevent errors
  company: string;
  role: string;
  status: string;
  emailDate: Date;
  threadId: string;
  snippet?: string;
}

export const dynamic = 'force-dynamic';

export default async function Home() {
  await connectDB();

  // 2. Fetch and Force-Cast the data to your Type
  const rawApps = await Application.find({}).sort({ emailDate: -1 }).lean();
  const apps = rawApps as unknown as AppData[]; 

  const stats = {
    total: apps.length,
    interview: apps.filter((a) => a.status === 'INTERVIEW').length,
    rejected: apps.filter((a) => a.status === 'REJECTED').length,
    applied: apps.filter((a) => a.status === 'APPLIED').length,
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8 space-y-8 font-sans">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Job Applications</h1>
        <form action="/api/sync" method="POST">
             <button type="submit" className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 text-sm font-medium transition-colors">
               Sync Emails
             </button>
        </form>
      </div>
      
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <KPICard title="Total" value={stats.total} />
        <KPICard title="Interviews" value={stats.interview} className="text-blue-600" />
        <KPICard title="Rejected" value={stats.rejected} className="text-red-600" />
        <KPICard title="Waiting" value={stats.applied} className="text-gray-600" />
      </div>

      {/* List */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/50 border-b text-gray-500 uppercase text-xs tracking-wider">
            <tr>
              <th className="p-4 font-medium">Company</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {apps.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-500">
                  No applications found. Click <strong>Sync Emails</strong> to start.
                </td>
              </tr>
            ) : (
              // 3. Now 'app' is typed, so app._id is valid
              apps.map((app) => (
                <tr key={String(app._id)} className="border-b last:border-0 hover:bg-gray-50/80 transition-colors group">
                  <td className="p-4 font-medium text-gray-900">{app.company}</td>
                  <td className="p-4 text-gray-600">{app.role}</td>
                  <td className="p-4">
                    <StatusBadge status={app.status} />
                  </td>
                  <td className="p-4 text-gray-500">
                    {new Date(app.emailDate).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <Link 
                      href={`https://mail.google.com/mail/u/0/#inbox/${app.threadId}`} 
                      target="_blank" 
                      className="text-blue-600 hover:text-blue-800 font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    REJECTED: "bg-red-50 text-red-700 ring-1 ring-red-600/10",
    INTERVIEW: "bg-blue-50 text-blue-700 ring-1 ring-blue-700/10",
    OFFER: "bg-green-50 text-green-700 ring-1 ring-green-600/20",
    APPLIED: "bg-gray-100 text-gray-600 ring-1 ring-gray-500/10",
  };

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${styles[status] || styles.APPLIED}`}>
      {status}
    </span>
  );
}

function KPICard({ title, value, className }: any) {
  return (
    <Card className="shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${className}`}>{value}</div>
      </CardContent>
    </Card>
  );
}