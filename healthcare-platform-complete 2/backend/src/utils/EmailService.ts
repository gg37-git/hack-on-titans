import nodemailer from 'nodemailer';

// These should be in .env, but using placeholders for "our gmail" as requested
const SMTP_USER = process.env.SMTP_USER || 'curalink.alerts@gmail.com';
const SMTP_PASS = process.env.SMTP_PASS || 'your-app-password'; 
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'curalink.clinical@gmail.com';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

export const sendClinicalAlert = async (subject: string, html: string) => {
  try {
    // If SMTP_PASS is still placeholder, we log instead of failing
    if (SMTP_PASS === 'your-app-password') {
      console.log('--- Clinical Alert (Email Simulation) ---');
      console.log(`Subject: ${subject}`);
      console.log(`To: ${ADMIN_EMAIL}`);
      console.log('Body:', html);
      console.log('-----------------------------------------');
      return { success: true, simulated: true };
    }

    const info = await transporter.sendMail({
      from: `"CuraLink System" <${SMTP_USER}>`,
      to: ADMIN_EMAIL,
      subject: `[URGENT CLINICAL ALERT] ${subject}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #e11d48;">Urgent Health Notification</h2>
          <hr />
          ${html}
          <hr />
          <p style="font-size: 12px; color: #666;">This is an automated clinical notification from the CuraLink AI Health Platform.</p>
        </div>
      `,
    });
    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending clinical alert:', error);
    return { success: false, error };
  }
};
