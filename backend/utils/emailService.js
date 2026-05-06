const nodemailer = require('nodemailer');

// ─── Create transporter ───────────────────────────────────────────────────────
// Uses any SMTP provider configured via environment variables.
// Recommended for production on Render: Brevo (smtp-relay.brevo.com:587)
// Gmail SMTP is blocked on Render free tier (cloud IP firewall).
const createTransporter = () => {
  return nodemailer.createTransport({
    host:   process.env.EMAIL_HOST,
    port:   Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: { rejectUnauthorized: false },
    connectionTimeout: 15000,
    greetingTimeout:   10000,
    socketTimeout:     20000,
  });
};

// ─── Verify on server start ───────────────────────────────────────────────────
const verifyEmailConfig = async () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  Email not configured — password reset emails will not send.');
    return;
  }
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log(`✅ Email service ready (${process.env.EMAIL_HOST} / ${process.env.EMAIL_USER})`);
  } catch (err) {
    console.error(`❌ Email config error: ${err.message}`);
    console.error(`   Host: ${process.env.EMAIL_HOST}  Port: ${process.env.EMAIL_PORT}`);
  }
};

// ─── Send password reset OTP ──────────────────────────────────────────────────
const sendPasswordResetCode = async ({ to, name, code }) => {
  const transporter = createTransporter();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

        <tr><td align="center" style="padding-bottom:24px;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="background:#4f46e5;border-radius:16px;padding:14px 20px;">
              <span style="color:#fff;font-size:20px;font-weight:800;">💧 SoftDrink Distribution</span>
            </td>
          </tr></table>
        </td></tr>

        <tr><td style="background:#fff;border-radius:20px;padding:40px 36px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#0f172a;">Password Reset Code</h1>
          <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">
            Hi <strong style="color:#0f172a;">${name}</strong>, use the code below to reset your password.
            It expires in <strong style="color:#4f46e5;">15 minutes</strong>.
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr><td align="center" style="background:#eef2ff;border:2px dashed #a5b4fc;border-radius:16px;padding:28px 20px;">
              <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#6366f1;letter-spacing:3px;text-transform:uppercase;">Your Reset Code</p>
              <p style="margin:0;font-size:48px;font-weight:900;color:#4f46e5;letter-spacing:12px;font-family:'Courier New',monospace;">${code}</p>
            </td></tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr><td style="background:#fff7ed;border-left:4px solid #f97316;border-radius:0 8px 8px 0;padding:14px 18px;">
              <p style="margin:0;font-size:13px;color:#9a3412;">⚠️ If you didn't request this, you can safely ignore this email.</p>
            </td></tr>
          </table>

          <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;">This code expires in 15 minutes and can only be used once.</p>
        </td></tr>

        <tr><td align="center" style="padding-top:24px;">
          <p style="margin:0;font-size:12px;color:#94a3b8;">© ${new Date().getFullYear()} SoftDrink Distribution</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

  return transporter.sendMail({
    from:    process.env.EMAIL_FROM || '"SoftDrink Distribution" <noreply@softdrink.com>',
    to,
    subject: `${code} is your SoftDrink password reset code`,
    text:    `Hi ${name},\n\nYour password reset code is: ${code}\n\nIt expires in 15 minutes.\n\nIf you didn't request this, ignore this email.`,
    html,
  });
};

module.exports = { sendPasswordResetCode, verifyEmailConfig };
