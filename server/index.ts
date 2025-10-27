import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
// 🧩 Environment
const PORT = process.env.PORT || 5000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 🧱 Verify Admin Password
app.post("/api/admin/login", async (req, res) => {
  const { password } = req.body;
  console.log("🚀 ~ password:", password)
  if (password === ADMIN_PASSWORD) return res.json({ success: true });
  res.status(401).json({ error: "Invalid password" });
});

// ✅ Get all submissions
app.get("/api/admin/submissions", async (_req, res) => {
  const { data, error } = await supabase.from("registrations").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// 📨 Approve / Reject Submission
app.post("/api/admin/update-status", async (req, res) => {
  const { id, status } = req.body;
  if (!id || !status) return res.status(400).json({ error: "Missing fields" });

  // 1️⃣ Update record in Supabase
  const { error: updateError } = await supabase
    .from("registrations")
    .update({ payment_status: status })
    .eq("id", id);

  if (updateError) {
    console.error("❌ Failed to update Supabase:", updateError.message);
    return res.status(500).json({ error: "Failed to update record" });
  }

  // 2️⃣ Fetch recipient email
  const { data: userData, error: fetchError } = await supabase
    .from("registrations")
    .select("email")
    .eq("id", id)
    .single();

  if (fetchError || !userData?.email) {
    console.error("❌ Could not find user email:", fetchError?.message);
    return res.status(400).json({ error: "Email not found" });
  }

  const toEmail = userData.email;
  const link =
    status === "approved"
      ? "https://chat.whatsapp.com/FVo7P4vHpphEHHAUBqVD0H"
      : null;

  // 3️⃣ Send email
  try {
    const { data, error } = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>", // ✅ Use this or your verified domain?
      // from: "ASACE <chisomokereke1999@gmail.com>", // ✅ Use this or your verified domain?
      to: [toEmail],
      // from: "Acme <onboarding@resend.dev>",
      // to: ["delivered@resend.dev"],
      subject:
        status === "approved"
          ? "Your Registration is Approved 🎉"
          : "Your Registration Could Not Be Verified",
      html:
        status === "approved"
          ? `<p>Your payment has been verified. Welcome! Join our WhatsApp group here: <a href="${link}">${link}</a></p>`
          : `<p>Unfortunately, your payment receipt could not be verified.</p>`,
    });
    console.log("🚀 ~ error:", error)
    console.log("🚀 ~ data:", data)

    if (error) {
      console.error("❌ Resend API error:", error);
      return res.status(500).json({ error: "Email failed to send" });
    }

    console.log("✅ Email sent successfully:", data?.id);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Unexpected error sending email:", err);
    res.status(500).json({ error: "Unexpected email send error" });
  }
});
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
