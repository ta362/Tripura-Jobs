import nodemailer from 'nodemailer';

const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
const port = parseInt(process.env.EMAIL_PORT || '465', 10);
const user = process.env.EMAIL_USER || '';
const pass = process.env.EMAIL_PASS || '';

export async function sendOtpEmail(toEmail: string, otp: string): Promise<{ success: boolean; message: string }> {
  if (!user || !pass) {
    console.warn('[MAILER] Email sender user or password not configured in environment variables.');
    return {
      success: false,
      message: 'Email credentials not configured on server.',
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user,
        pass,
      },
    });

    const mailOptions = {
      from: `"Tripura Govt Jobs Portal" <${user}>`,
      to: toEmail,
      subject: `Your OTP for Tripura Govt Jobs Portal - ${otp}`,
      text: `Hello Candidate,\n\nYour 6-digit verification code for Tripura Govt Jobs Portal is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nBest Regards,\nTripura Recruitment Portal Support`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #f8fafc;">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="display: inline-block; padding: 12px; border-radius: 16px; background-color: #047857; color: white; font-weight: bold; font-size: 18px;">
              Tripura Govt Jobs Scanner
            </div>
          </div>
          <h2 style="color: #0f172a; text-align: center; margin-bottom: 24px;">Verification OTP Code</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.5;">Dear Candidate,</p>
          <p style="color: #475569; font-size: 14px; line-height: 1.5;">Use the following security code to complete your login and registration process on the official Tripura Govt Jobs Portal. Do not share this code with anyone.</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <div style="display: inline-block; padding: 16px 36px; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #047857; background-color: #ecfdf5; border: 2px dashed #059669; border-radius: 12px; font-family: monospace;">
              ${otp}
            </div>
            <p style="color: #64748b; font-size: 12px; margin-top: 8px;">Valid for 10 minutes (Expires soon)</p>
          </div>
          
          <p style="color: #475569; font-size: 14px; line-height: 1.5;">If you did not request this OTP, please ignore this email.</p>
          
          <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 32px 0 16px 0;" />
          <p style="color: #94a3b8; font-size: 11px; text-align: center; line-height: 1.4;">
            This is an automated security notification from the Tripura Recruitment Portal.<br />
            Agartala, Tripura, India.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[MAILER] OTP email successfully dispatched to: ${toEmail}`);
    return { success: true, message: 'OTP email sent successfully.' };
  } catch (error: any) {
    console.error('[MAILER] Failed to dispatch OTP email:', error);
    return {
      success: false,
      message: error.message || 'SMTP connection failed to send mail.',
    };
  }
}
