import nodemailer from "nodemailer";

function createTransport() {
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT ?? 587);
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  // If host is the default template placeholder or missing, return null to log to console
  if (!host || host.includes("example.com") || !user || user.includes("example.com")) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    }
  });
}

const transport = createTransport();
const from = process.env.EMAIL_FROM ?? "LearnAI <learnai@example.com>";

async function sendEmailViaResend(to: string, subject: string, html: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to,
      subject,
      html
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Resend API error:", errText);
    return false;
  }
  return true;
}

export async function sendVerificationEmail(email: string, otp: string) {
  const subject = "Verify your LearnAI account";
  const html = `
    <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; rounded-lg;">
      <h2 style="color: #2563eb;">Welcome to LearnAI!</h2>
      <p>Thank you for signing up. Please verify your email address by using the 6-digit verification code below:</p>
      <div style="background-color: #f8fafc; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 4px; border-radius: 6px; margin: 20px 0; color: #1e293b;">
        ${otp}
      </div>
      <p>This code is valid for 1 hour. If you did not request this, please ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #64748b;">LearnAI - Upload. Learn. Practice. Master.</p>
    </div>
  `;

  if (process.env.RESEND_API_KEY) {
    try {
      const sent = await sendEmailViaResend(email, subject, html);
      if (sent) return;
    } catch (e) {
      console.error("Failed to send verification email via Resend, falling back:", e);
    }
  }

  if (!transport) {
    console.log("\n==================================================");
    console.log(`[EMAIL FALLBACK] Sending Verification Email to ${email}`);
    console.log(`Verification Code: ${otp}`);
    console.log("==================================================\n");
    return;
  }

  try {
    await transport.sendMail({
      from,
      to: email,
      subject,
      html
    });
  } catch (error) {
    console.error("Failed to send verification email:", error);
    // Fallback log so developer still gets the code
    console.log("\n==================================================");
    console.log(`[EMAIL FALLBACK] Sending Verification Email to ${email}`);
    console.log(`Verification Code: ${otp}`);
    console.log("==================================================\n");
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const clientUrl = process.env.CLIENT_URL ?? "http://localhost:5173";
  const resetLink = `${clientUrl}/auth?token=${token}`;
  
  const subject = "Reset your LearnAI Password";
  const html = `
    <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; rounded-lg;">
      <h2 style="color: #2563eb;">Reset Password Request</h2>
      <p>We received a request to reset your password. Click the button below to set a new password:</p>
      <div style="text-align: center; margin: 25px 0;">
        <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>Alternatively, copy and paste this link in your browser:</p>
      <p style="word-break: break-all; color: #64748b; font-size: 14px;">${resetLink}</p>
      <p>This link is valid for 1 hour. If you did not request a password reset, please ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #64748b;">LearnAI - Upload. Learn. Practice. Master.</p>
    </div>
  `;

  if (process.env.RESEND_API_KEY) {
    try {
      const sent = await sendEmailViaResend(email, subject, html);
      if (sent) return;
    } catch (e) {
      console.error("Failed to send password reset email via Resend, falling back:", e);
    }
  }

  if (!transport) {
    console.log("\n==================================================");
    console.log(`[EMAIL FALLBACK] Sending Password Reset Email to ${email}`);
    console.log(`Reset Link: ${resetLink}`);
    console.log("==================================================\n");
    return;
  }

  try {
    await transport.sendMail({
      from,
      to: email,
      subject,
      html
    });
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    // Fallback log so developer still gets the link
    console.log("\n==================================================");
    console.log(`[EMAIL FALLBACK] Sending Password Reset Email to ${email}`);
    console.log(`Reset Link: ${resetLink}`);
    console.log("==================================================\n");
  }
}
