const nodemailer = require('nodemailer');

/**
 * Email transport strategy — tries multiple approaches in order:
 *
 * 1. Gmail OAuth2  (if GMAIL_CLIENT_ID + GMAIL_CLIENT_SECRET + GMAIL_REFRESH_TOKEN are set)
 *    → Works from any IP including Render/cloud. No port blocking.
 *
 * 2. Generic SMTP  (if EMAIL_HOST + EMAIL_USER + EMAIL_PASS are set)
 *    → Works locally and on paid cloud tiers that allow outbound SMTP.
 *
 * 3. Ethereal      (fallback in development — catches email in a test inbox)
 *    → Never sends real email, just logs a preview URL.
 */

// ─── Strategy 1: Gmail OAuth2 ─────────────────────────────────────────────────
const createOAuth2Transporter = () => {
  if (
    !process.env.GMAIL_CLIENT_ID ||
    !process.env.GMAIL_CLIENT_SECRET ||
    !process.env.GMAIL_REFRESH_TOKEN
  ) return null;

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type:         'OAuth2',
      user:         process.env.EMAIL_USER,
      clientId:     process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    },
  });
};

// ─── Strategy 2: Generic SMTP ─────────────────────────────────────────────────
const createSmtpTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;

  return nodemailer.createTransport({
    host:   process.env.EMAIL_HOST || 'smtp.gmail.com',
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

// ─── Strategy 3: Ethereal (dev fallback) ──────────────────────────────────────
const createEtherealTransporter = async () => {
  const testAccount = await nodemailer.createTestAccount();
  console.log('📧 Using Ethereal test email account:', testAccount.user);
  return nodemailer.createTransport({
    host:   'smtp.ethereal.email',
    port:   587,
    secure: false,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
};

// ─── Get the best available transporter ───────────────────────────────────────
const getTransporter = async () => {
  const oauth2 = createOAuth2Transporter();
  if (oauth2) return { transporter: oauth2, strategy: 'OAuth2' };

  const smtp = createSmtpTransporter();
  if (smtp) return { transporter: smtp, strategy: 'SMTP' };

  const ethereal = await createEtherealTransporter();
  return { transporter: ethereal, strategy: 'Ethereal' };
};

// ─── Verify on server start ───────────────────────────────────────────────────
const verifyEmailConfig = async () => {
  try {
    const { transporter, strategy } = await getTransporter();
    await transporter.verify();
    console.log(`✅ Email service ready — strategy: ${strategy} (${process.env.EMAIL_USER || 'ethereal'})`);
  } catch (err) {
    console.error(`❌ Email config error: ${err.message}`);
    if (process.env.GMAIL_CLIENT_ID) {
      console.error('   → OAuth2 mode: check GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN');
    } else {
      console.error('   → SMTP mode: check EMAIL_USER, EMAIL_PASS, EMAIL_HOST, EMAIL_PORT');
      console.error('   → Gmail SMTP is blocked on Render free tier — use OAuth2 instead');
      console.error('   → See: https://github.com/MadisoMelese/Soft-Drink-#email-setup');
    }
  }
};

// ─── Build the HTML email ─────────────────────────────────────────────────────
const buildResetEmail = (name, code) => ({
  subject: `${code} is your SoftDrink password reset code`,
  text: `Hi ${name},\n\nYour password reset code is: ${code}\n\nIt expires in 15 minutes.\n\nIf you didn't request this, ignore this email.`,
  html: `
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
</html>`.trim(),
});

// ─── Send password reset OTP ──────────────────────────────────────────────────
const sendPasswordResetCode = async ({ to, name, code }) => {
  const { transporter, strategy } = await getTransporter();
  const { subject, text, html }   = buildResetEmail(name, code);

  const info = await transporter.sendMail({
    from:    process.env.EMAIL_FROM || '"SoftDrink Distribution" <noreply@softdrink.com>',
    to,
    subject,
    text,
    html,
  });

  // If using Ethereal, log the preview URL so you can see the email
  if (strategy === 'Ethereal') {
    console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(info));
  }

  return info;
};

module.exports = { sendPasswordResetCode, verifyEmailConfig };
