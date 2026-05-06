const nodemailer = require('nodemailer');
const net        = require('net');

// ─── Create reusable transporter ─────────────────────────────────────────────
const createTransporter = () => {
  return nodemailer.createTransport({
    host:   process.env.EMAIL_HOST || 'smtp.gmail.com',
    port:   Number(process.env.EMAIL_PORT) || 465,
    secure: process.env.EMAIL_SECURE !== 'false', // true for 465 (SSL), false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // ── Force IPv4 — Render free tier does not support IPv6 outbound ──────────
    family: 4,
    tls: {
      rejectUnauthorized: false,
    },
    // Generous timeouts for cloud environments
    connectionTimeout: 10000,
    greetingTimeout:   10000,
    socketTimeout:     15000,
  });
};

// ─── Verify SMTP connection (call on server start) ────────────────────────────
const verifyEmailConfig = async () => {
  // Skip if email is not configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS ||
      process.env.EMAIL_USER.includes('your_gmail')) {
    console.warn('⚠️  Email not configured — password reset emails will not send.');
    return;
  }
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log(`✅ Email service ready (${process.env.EMAIL_USER})`);
  } catch (err) {
    console.error(`❌ Email config error: ${err.message}`);
    console.error('   → Check EMAIL_USER and EMAIL_PASS in .env');
    console.error('   → Gmail: use an App Password (no spaces), not your login password');
    console.error('   → Generate one at: https://myaccount.google.com/apppasswords');
  }
};

// ─── Send password reset OTP ──────────────────────────────────────────────────
const sendPasswordResetCode = async ({ to, name, code }) => {
  const transporter = createTransporter();

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Password Reset</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Header -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#4f46e5;border-radius:16px;padding:14px 20px;">
                    <span style="color:#fff;font-size:20px;font-weight:800;letter-spacing:-0.5px;">
                      💧 SoftDrink Distribution
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:20px;padding:40px 36px;
                       box-shadow:0 4px 24px rgba(0,0,0,0.08);">

              <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#0f172a;">
                Password Reset Code
              </h1>
              <p style="margin:0 0 28px;font-size:15px;color:#64748b;line-height:1.6;">
                Hi <strong style="color:#0f172a;">${name}</strong>, we received a request to reset
                your password. Use the code below — it expires in
                <strong style="color:#4f46e5;">15 minutes</strong>.
              </p>

              <!-- OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center"
                      style="background:#eef2ff;border:2px dashed #a5b4fc;border-radius:16px;padding:28px 20px;">
                    <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#6366f1;
                               letter-spacing:3px;text-transform:uppercase;">
                      Your Reset Code
                    </p>
                    <p style="margin:0;font-size:48px;font-weight:900;color:#4f46e5;
                               letter-spacing:12px;font-family:'Courier New',monospace;">
                      ${code}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Steps -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:#f8fafc;border-radius:12px;padding:20px 24px;">
                    <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#475569;
                               text-transform:uppercase;letter-spacing:1px;">
                      How to use
                    </p>
                    <ol style="margin:0;padding-left:20px;color:#64748b;font-size:14px;line-height:2;">
                      <li>Go back to the reset password page</li>
                      <li>Enter the 6-digit code above</li>
                      <li>Set your new password</li>
                    </ol>
                  </td>
                </tr>
              </table>

              <!-- Warning -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:#fff7ed;border-left:4px solid #f97316;
                             border-radius:0 8px 8px 0;padding:14px 18px;">
                    <p style="margin:0;font-size:13px;color:#9a3412;line-height:1.5;">
                      ⚠️ If you didn't request this, you can safely ignore this email.
                      Your password will not change.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#94a3b8;text-align:center;">
                This code expires in 15 minutes and can only be used once.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                © ${new Date().getFullYear()} SoftDrink Distribution · All rights reserved
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const info = await transporter.sendMail({
    from:    process.env.EMAIL_FROM || '"SoftDrink Distribution" <noreply@softdrink.com>',
    to,
    subject: `${code} is your SoftDrink password reset code`,
    text:    `Hi ${name},\n\nYour password reset code is: ${code}\n\nIt expires in 15 minutes.\n\nIf you didn't request this, ignore this email.`,
    html,
  });

  return info;
};

module.exports = { sendPasswordResetCode, verifyEmailConfig };
