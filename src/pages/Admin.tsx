"use client";

import AdminLogin from "@/components/AdminLogin";
import AuthLayout from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { cn } from "@/lib/utils";
import { CheckIcon, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false);
  console.log("🚀 ~ Admin ~ loggedIn:", loggedIn)
  const [submissions, setSubmissions] = useState<any[]>([]);
  console.log("🚀 ~ Admin ~ submissions:", submissions)
  const [loading, setLoading] = useState(false);

  // 🔹 Fetch registrations after login
  useEffect(() => {
    if (loggedIn) fetchSubmissions();
  }, [loggedIn]);

  // 🔹 Fetch all registrations from Supabase
  async function fetchSubmissions() {
    setLoading(true);
    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching submissions:", error.message);
    } else {
      console.log("✅ Submissions fetched:", data);
      setSubmissions(data || []);
    }
    setLoading(false);
  }

  // 🔹 Update payment_status (Approve / Reject)
  async function updateStatus(id: string, status: string) {
    console.log("🚀 ~ updateStatus ~ status:", status)
    const { error } = await supabase
      .from("registrations")
      .update({ payment_status: status })
      .eq("id", id);

    if (error) {
      console.error("❌ Error updating status:", error.message);
      alert("Failed to update status. Check console for details.");
    } else {
      fetchSubmissions();
    }
  }

  // 🔹 Render Login first if not logged in
  if (!loggedIn) {
    return (
      <AuthLayout>
        <AdminLogin onLogin={() => setLoggedIn(true)} />
      </AuthLayout>
    );
  }

  // 🔹 Main Admin Dashboard
  return (
    <AuthLayout>
      <Card className="w-full sm:max-w-[1440px] mx-auto">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Registrations</CardTitle>
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
                            "flex items-center p-1 rounded-md text-xs",
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
                        <Button
                          className=" bg-green-600 hover:bg-green-600/50"
                          size="icon"
                          disabled={loading}
                          onClick={() => updateStatus(s.id, "approved")}>
                          <CheckIcon className="size-4  " />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => updateStatus(s.id, "rejected")}>
                          <X className="size-4" />
                        </Button>
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
