import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
// import { Resend } from "resend";
// import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 🧩 Environment
const PORT = process.env.PORT || 5000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

// for nodemailer
// const EMAIL_USER = process.env.EMAIL_USER!;
// const EMAIL_PASS = process.env.EMAIL_PASS!;

// for resend
// const resend = new Resend(process.env.RESEND_API_KEY);

// for sendgrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
const SENDGRID_EMAIL = process.env.SENDGRID_EMAIL!;
console.log(
  "🚀 ~ process.env.SENDGRID_API_KEY!:",
  process.env.SENDGRID_API_KEY!
);

// 🧰 Nodemailer Transporter Setup
// const transporter = nodemailer.createTransport({
//   // service: "gmail", // or "smtp" for custom servers
//   host: "smtp.gmail.com",
//   secure: false,
//   requireTLS: true,
//   port: 587,
//   logger: true,
//   debug: true,
//   auth: {
//     user: EMAIL_USER,
//     pass: EMAIL_PASS,
//   },
// });

// ✅ Test email configuration
// transporter.verify((error) => {
//   if (error) console.error("❌ Email transporter error:", error);
//   else console.log("✅ Email transporter ready!");
// });

// 🧱 Supabase client (using service role key)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 🧱 Verify Admin Password
app.post("/api/admin/login", async (req, res) => {
  const { password } = req.body;
  console.log("🚀 ~ password:", password);
  if (password === ADMIN_PASSWORD) return res.json({ success: true });
  res.status(401).json({ error: true, message: "Invalid password" });
});

// ✅ Get all submissions
app.get("/api/admin/submissions", async (_req, res) => {
  const { data, error } = await supabase.from("registrations").select("*");
  if (error)
    return res.status(500).json({ error: true, message: error.message });
  res.json(data);
});

// 📨 Approve / Reject Submission
app.post("/api/admin/update-status", async (req, res) => {
  const { id, status } = req.body;
  if (!id || !status)
    return res.status(400).json({ error: true, message: "Missing fields" });

  // 1️⃣ Update record in Supabase
  const { error: updateError } = await supabase
    .from("registrations")
    .update({ payment_status: status })
    .eq("id", id);

  if (updateError) {
    console.error("❌ Failed to update Supabase:", updateError.message);
    return res
      .status(500)
      .json({ error: true, message: "Failed to update record" });
  }

  // 2️⃣ Fetch recipient email
  const { data: userData, error: fetchError } = await supabase
    .from("registrations")
    .select("email, full_name")
    .eq("id", id)
    .single();

  if (fetchError || !userData?.email) {
    console.error("❌ Could not find user email:", fetchError?.message);
    return res.status(400).json({ error: true, message: "Email not found" });
  }

  const { email, full_name } = userData;
  console.log("🚀 ~  email, full_name:", email, full_name);

  // 3️⃣ Build Email Template
  const link =
    status === "approved"
      ? "https://chat.whatsapp.com/FVo7P4vHpphEHHAUBqVD0H"
      : null;

  const subject =
    status === "approved"
      ? "Your Registration is Approved 🎉"
      : "Your Registration Could Not Be Verified";

  const html =
    status === "approved"
      ? `
        <div style="font-family: sans-serif; padding: 10px;">
          <h2>Hi ${full_name || "there"},</h2>
          <p>Your payment has been verified. Welcome!</p>
          <p>Join our WhatsApp group here: <a href="${link}">${link}</a></p>
          <p>See you soon!<br/>All Saints Anglican Church Ebute.</p>
        </div>`
      : `
        <div style="font-family: sans-serif; padding: 10px;">
          <h2>Hi ${full_name || "there"},</h2>
          <p>Unfortunately, your payment receipt could not be verified.</p>
          <p>Please contact the registration team for assistance.</p>
        </div>`;
  //  Send Email SENDGRID
  try {
    await sgMail.send({
      from: `ASACE Youth Team <${SENDGRID_EMAIL}>`,
      to: email,
      subject,
      html,
    });

    console.log("✅ Email sent successfully");
    res.json({ success: true });
  } catch (err: unknown) {
    console.error("❌ Failed to send email:", err);

    const error = err as {
      response?: { body?: { errors?: Array<{ message: string }> } };
      message?: string;
    };
    const errorDetails = error.response?.body;
    const errorMessage =
      error.response?.body?.errors?.[0]?.message ||
      error.message ||
      "Email send failed";

    console.error("Error details:", errorDetails);

    res.status(500).json({
      error: true,
      message: errorMessage, // Use SendGrid's actual error message
    
    });
  }

  // 3️⃣ Send email RESEND

  // try {
  //   const { data, error } = await resend.emails.send({
  //     from: "ASACE Youth <onboarding@resend.dev>", // ✅ Use this or your verified domain?
  //     // from: "ASACE <chisomokereke1999@gmail.com>", // ✅ Use this or your verified domain?
  //     to: [email],
  //     // from: "Acme <onboarding@resend.dev>",
  //     // to: ["delivered@resend.dev"],
  //     subject: subject,
  //     html: html,
  //   });
  //   console.log("🚀 ~ error:", error);
  //   console.log("🚀 ~ data:", data);

  //   if (error) {
  //     console.error("❌ Resend API error:", error);
  //     return res.status(500).json({ error: "Email failed to send" });
  //   }

  //   console.log("✅ Email sent successfully:", data?.id);
  //   res.json({ success: true });
  // } catch (err) {
  //   console.error("❌ Unexpected error sending email:", err);
  //   res.status(500).json({ error: "Unexpected email send error" });
  // }

  // 4️⃣ Send Email NODEMAILER
  // try {
  //   const info = await transporter.sendMail({
  //     from: `"ASACE Team" <${EMAIL_USER}>`,
  //     to: email,
  //     subject,
  //     html,
  //   });

  //   console.log("✅ Email sent:", info.messageId);
  //   res.json({ success: true });
  // } catch (err) {
  //   console.error("❌ Failed to send email:", err);
  //   res.status(500).json({ error: true, message: "Email send failed" });
  // }
});
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
