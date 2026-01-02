"use server";

import connectDB from "@/lib/db";
import Application from "@/models/Application";
import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "@/lib/auth"; // ✅ Ensure signIn is imported

export async function deleteApplication(id: string) {
  const session = await auth();
  if (!session?.user?.email) return;

  await connectDB();
  // Only delete if _id AND userEmail match (Security)
  await Application.findOneAndDelete({ _id: id, userEmail: session.user.email });
  revalidatePath("/dashboard");
}

export async function updateStatus(id: string, newStatus: string) {
  const session = await auth();
  if (!session?.user?.email) return;

  await connectDB();
  await Application.findOneAndUpdate(
    { _id: id, userEmail: session.user.email }, 
    { status: newStatus }
  );
  revalidatePath("/dashboard");
}

export async function saveNote(id: string, note: string) {
  const session = await auth();
  if (!session?.user?.email) return;

  await connectDB();
  await Application.findOneAndUpdate(
    { _id: id, userEmail: session.user.email }, 
    { notes: note }
  );
  revalidatePath("/dashboard");
}

// ✅ THIS IS THE MISSING FUNCTION
export async function login() {
    await signIn("google", { redirectTo: "/dashboard" });
  }
  
  // ✅ NEW: Logout Action
  export async function logout() {
    await signOut({ redirectTo: "/" });
  }
  
  // ✅ NEW: Helper to get session on client pages
  export async function getUserSession() {
    const session = await auth();
    return session?.user || null;
  }