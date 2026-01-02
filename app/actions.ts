"use server";

import connectDB from "@/lib/db";
import Application from "@/models/Application";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function syncEmails() {
  redirect("/api/sync"); 
}

export async function deleteApplication(id: string) {
  await connectDB();
  await Application.findByIdAndDelete(id);
  revalidatePath("/");
}

// NEW: Update Status
export async function updateStatus(id: string, newStatus: string) {
  await connectDB();
  await Application.findByIdAndUpdate(id, { status: newStatus });
  revalidatePath("/");
}

// NEW: Save Notes
export async function saveNote(id: string, note: string) {
  await connectDB();
  await Application.findByIdAndUpdate(id, { notes: note });
  revalidatePath("/");
}