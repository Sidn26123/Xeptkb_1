const nodemailer = require('nodemailer');

// Create transporter from env vars. If some required env var missing, transporter will use a fallback (ethereal) for testing.
async function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    const secure = SMTP_SECURE === 'true' || SMTP_PORT === '465';
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT, 10) || (secure ? 465 : 587),
      secure: secure,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  // Fallback: create ethereal test account (useful for local tests without real SMTP creds)
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

async function sendMail({ to, subject, text, html, from }) {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: from || process.env.MAIL_FROM || `"No Reply" <no-reply@localhost>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    // If using ethereal, include preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    return { info, previewUrl };
  } catch (err) {
    // Re-throw for controller to handle
    throw err;
  }
}

module.exports = { sendMail };
