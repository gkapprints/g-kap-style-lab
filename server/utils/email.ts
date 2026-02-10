import fetch from "node-fetch";

// Uses Resend (https://resend.com/) for transactional email
// Set RESEND_API_KEY and NOTIFY_EMAIL_FROM in your environment variables
export async function sendOrderNotification({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFY_EMAIL_FROM;
  if (!apiKey || !from) {
    throw new Error("Missing RESEND_API_KEY or NOTIFY_EMAIL_FROM env var");
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("❌ Email send failed:", text);
    throw new Error(`Resend API error: ${text}`);
  }
  const data = await res.json();
  console.log("✅ Email sent via Resend:", data.id);
}
