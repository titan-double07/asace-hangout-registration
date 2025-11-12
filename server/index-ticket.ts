import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import sgMail from "@sendgrid/mail";
import QRCode from "qrcode";
import sharp from "sharp";
import path from "path";
import fs from "fs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
const SENDGRID_EMAIL = process.env.SENDGRID_EMAIL!;

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 🎫 Generate QR Code as Buffer
async function generateQRCodeBuffer(data: string): Promise<Buffer> {
  try {
    return await QRCode.toBuffer(data, {
      width: 300,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
  } catch (err) {
    console.error("Failed to generate QR code:", err);
    throw err;
  }
}

// 🎨 Create personalized ticket with QR code
async function createPersonalizedTicket(
  userName: string,
  ticketId: string,
  qrData: string
): Promise<Buffer> {
  try {
    // Path to your Canva ticket template
    const templatePath = path.join(__dirname, "assets", "ticket-template.jpg");

    // Check if template exists
    if (!fs.existsSync(templatePath)) {
      throw new Error(
        "Ticket template not found. Please add ticket-template.jpg to assets folder"
      );
    }

    // Generate QR code
    const qrBuffer = await generateQRCodeBuffer(qrData);

    // Composite: overlay QR on ticket
    // Adjust x, y coordinates based on where you want QR on your design
    const ticketWithQR = await sharp(templatePath)
      .composite([
        {
          input: qrBuffer,
          top: 400, // ⚠️ ADJUST: vertical position (pixels from top)
          left: 450, // ⚠️ ADJUST: horizontal position (pixels from left)
        },
      ])
      // Optionally add text overlay for name/ID
      // .composite([
      //   {
      //     input: Buffer.from(`<svg><text x="50" y="50" font-size="24" fill="black">${userName}</text></svg>`),
      //     top: 100,
      //     left: 50,
      //   }
      // ])
      .toBuffer();

    return ticketWithQR;
  } catch (err) {
    console.error("Failed to create personalized ticket:", err);
    throw err;
  }
}

app.post("/api/admin/login", async (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) return res.json({ success: true });
  res.status(401).json({ error: true, message: "Invalid password" });
});

app.get("/api/admin/submissions", async (_req, res) => {
  const { data, error } = await supabase.from("registrations").select("*");
  if (error)
    return res.status(500).json({ error: true, message: error.message });
  res.json(data);
});

app.post("/api/admin/update-status", async (req, res) => {
  const { id, status } = req.body;
  if (!id || !status)
    return res.status(400).json({ error: true, message: "Missing fields" });

  // Update Supabase
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

  // Fetch user data
  const { data: userData, error: fetchError } = await supabase
    .from("registrations")
    .select("email, full_name, id")
    .eq("id", id)
    .single();

  if (fetchError || !userData?.email) {
    console.error("❌ Could not find user email:", fetchError?.message);
    return res.status(400).json({ error: true, message: "Email not found" });
  }

  const { email, full_name } = userData;
  console.log("🚀 Sending to:", email, full_name);

  const link = "https://chat.whatsapp.com/FVo7P4vHpphEHHAUBqVD0H";

  if (status === "approved") {
    try {
      // 🎫 Generate personalized ticket with QR
      const qrData = `ASACE-TICKET-${id}`;
      const ticketBuffer = await createPersonalizedTicket(
        full_name,
        id,
        qrData
      );
      const ticketBase64 = ticketBuffer.toString("base64");

      const subject =
        "Your Registration is Approved 🎉 - Event Ticket Attached";
      const html = `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px;">
          <h2>Hi ${full_name || "there"},</h2>
          <p>Your payment has been verified. Welcome to the ASACE Hangout!</p>
          
          <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <h3 style="margin-top: 0;">🎟️ Your Event Ticket</h3>
            <p><strong>Name:</strong> ${full_name}</p>
            <p><strong>Ticket ID:</strong> ${id}</p>
            <p style="color: #666; font-size: 14px;">
              Your personalized ticket with QR code is attached below. 
              Please download and save it to your phone.
            </p>
          </div>

          <div style="text-align: center; margin: 20px 0;">
            <img src="cid:ticket_image" alt="Your Ticket" style="max-width: 100%; border: 2px solid #ddd; border-radius: 8px;"/>
          </div>

          <p><strong>📱 Join our WhatsApp group:</strong> <a href="${link}">${link}</a></p>
          
          <p style="font-size: 12px; color: #666; margin-top: 30px;">
            Present this ticket (or the QR code) at the event entrance. 
            Screenshot or download the image for easy access.
          </p>
          
          <p>See you soon!<br/>All Saints Anglican Church Ebute Youth.</p>
        </div>
      `;

      // Send email with personalized ticket
      await sgMail.send({
        from: `ASACE Youth Team <${SENDGRID_EMAIL}>`,
        to: email,
        subject,
        html,
        attachments: [
          {
            content: ticketBase64,
            filename: `asace-ticket-${full_name.replace(/\s+/g, "-")}.png`,
            type: "image/png",
            disposition: "inline",
            contentId: "ticket_image", // For inline display in email
          },
          {
            content: ticketBase64,
            filename: `asace-ticket-${full_name.replace(/\s+/g, "-")}.png`,
            type: "image/png",
            disposition: "attachment", // Also as downloadable attachment
          },
        ],
      });

      console.log("✅ Email with personalized ticket sent successfully");
      res.json({ success: true });
    } catch (err: unknown) {
      console.error("❌ Failed to send email:", err);

      const error = err as {
        response?: { body?: { errors?: Array<{ message: string }> } };
        message?: string;
      };
      const errorMessage =
        error.response?.body?.errors?.[0]?.message ||
        error.message ||
        "Email send failed";

      console.error("Error details:", error.response?.body);

      res.status(500).json({
        error: true,
        message: errorMessage,
      });
    }
  } else {
    // Rejection email (no ticket)
    const subject = "Your Registration Could Not Be Verified";
    const html = `
      <div style="font-family: sans-serif; padding: 10px;">
        <h2>Hi ${full_name || "there"},</h2>
        <p>Unfortunately, your payment receipt could not be verified.</p>
        <p>Please contact the registration team for assistance.</p>
      </div>
    `;

    try {
      await sgMail.send({
        from: `ASACE Youth Team <${SENDGRID_EMAIL}>`,
        to: email,
        subject,
        html,
      });

      console.log("✅ Rejection email sent");
      res.json({ success: true });
    } catch (err: unknown) {
      console.error("❌ Failed to send email:", err);
      res.status(500).json({ error: true, message: "Email send failed" });
    }
  }
});

// 🔍 Endpoint to verify QR codes at the event
app.post("/api/verify-ticket", async (req, res) => {
  const { ticketData } = req.body;

  // Parse QR data (e.g., "ASACE-TICKET-123")
  const ticketId = ticketData.replace("ASACE-TICKET-", "");

  const { data, error } = await supabase
    .from("registrations")
    .select("full_name, email, payment_status")
    .eq("id", ticketId)
    .single();

  if (error || !data) {
    return res.status(404).json({ valid: false, message: "Ticket not found" });
  }

  if (data.payment_status !== "approved") {
    return res
      .status(403)
      .json({ valid: false, message: "Ticket not approved" });
  }

  res.json({
    valid: true,
    attendee: {
      name: data.full_name,
      email: data.email,
    },
  });
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
