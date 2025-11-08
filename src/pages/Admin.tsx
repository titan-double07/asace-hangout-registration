"use client";

import AdminLogin from "@/components/AdminLogin";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { API_URL } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import { CheckIcon, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Registration = {
  id: string;
  created_at: string;
  full_name: string;
  dob: string | null;
  gender: string | null;
  hobbies: string | null;
  payment_status: "pending" | "approved" | "rejected" | null;
  payment_proof_url: string | null;
  email: string;
};
export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [submissions, setSubmissions] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // 🔹 Fetch registrations after login
  useEffect(() => {
    if (loggedIn) fetchSubmissions();
  }, [loggedIn]);

  // 🔹 Fetch all registrations from Supabase
  async function fetchSubmissions() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/submissions`);
      const data = await res.json();
      if (res.ok) {
        setSubmissions(data);
      } else {
        console.error("❌ Fetch failed:", data.error);
      }
    } catch (err) {
      console.error("❌ Network error:", err);
    } finally {
      setLoading(false);
    }
  }
  // 🔹 Update payment_status (Approve / Reject)
  async function updateStatus(id: string, status: string) {
    setActionLoading(id); // Set loading state for the specific button
    try {
      const res = await fetch(`${API_URL}/admin/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to update status");
      } else {
        fetchSubmissions();
        toast.success(`Registration ${status}`);
      }
    } catch (err) {
      console.error("❌ Network error:", err);
      toast.error("Network error occurred", {
        description: (err as Error).message,
      });
    } finally {
      setActionLoading(null); // Clear loading state
    }
  }

  // 🔹 Render Login first if not logged in
  if (!loggedIn) {
    return (
      <AuthLayout>
        <AdminLogin
          onLogin={() => {
            setLoggedIn(true);
            toast.success("Admin logged in");
          }}
        />
      </AuthLayout>
    );
  }

  // 🔹 Main Admin Dashboard
  return (
    <AuthLayout>
      <Card className="w-full sm:max-w-[1440px] mx-auto">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            Registrations{" "}
            <span className="text-sm"> ({submissions.length})</span>
          </CardTitle>
          <CardDescription>
            <p className="text-muted-foreground text-sm">
              Proof of payment is only available for 7 days
            </p>
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-6">
              Loading submissions...
            </p>
          ) : submissions.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">
              No registrations found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-muted/30 text-left">
                    <th className="px-3 py-2 font-medium">Full Name</th>
                    <th className="px-3 py-2 font-medium">Email</th>
                    <th className="px-3 py-2 font-medium">DOB</th>
                    <th className="px-3 py-2 font-medium">Gender</th>
                    <th className="px-3 py-2 font-medium">Hobbies</th>
                    <th className="px-3 py-2 font-medium">Proof</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b hover:bg-muted/20 transition-colors [&_td]:whitespace-nowrap">
                      <td className="px-3 py-2">{s.full_name}</td>
                      <td className="px-3 py-2">{s.email}</td>
                      <td className="px-3 py-2">{s.dob}</td>
                      <td className="px-3 py-2 capitalize">{s.gender}</td>
                      <td className="px-3 py-2">{s.hobbies}</td>
                      <td className="px-3 py-2">
                        {s.payment_proof_url ? (
                          <a
                            href={s.payment_proof_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-500 hover:underline">
                            View Proof
                          </a>
                        ) : (
                          <span className="text-muted-foreground italic">
                            No file
                          </span>
                        )}
                      </td>
                      <td className={cn("px-3 py-2 capitalize font-medium")}>
                        <span
                          className={cn(
                            "flex items-center text-center justify-center p-1 rounded-md text-xs",
                            s.payment_status === "approved"
                              ? "bg-green-300/50 text-green-800"
                              : s.payment_status === "rejected"
                              ? "bg-red-300/50 text-red-800"
                              : "bg-yellow-300/50 text-yellow-800"
                          )}>
                          {s.payment_status || "Pending"}
                        </span>
                      </td>
                      <td className="px-3 py-2 space-x-2 flex items-center">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              className=" bg-green-600 hover:bg-green-600/50"
                              size="icon"
                              disabled={
                                actionLoading === s.id ||
                                s.payment_status !== "pending"
                              }>
                              {actionLoading === s.id ? (
                                <svg
                                  className="animate-spin h-5 w-5 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24">
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <CheckIcon className="size-4  " />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Approve Registration?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to approve this
                                registration? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => updateStatus(s.id, "approved")}>
                                Approve
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="icon"
                              disabled={
                                actionLoading === s.id ||
                                s.payment_status !== "pending"
                              }>
                              {actionLoading === s.id ? (
                                <svg
                                  className="animate-spin h-5 w-5 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24">
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <X className="size-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Reject Registration?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to reject this
                                registration? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => updateStatus(s.id, "rejected")}>
                                Reject
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
