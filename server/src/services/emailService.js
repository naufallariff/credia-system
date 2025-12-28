const nodemailer = require('nodemailer');

// Konfigurasi SMTP (Gunakan Environment Variables di Production)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER, // Email pengirim
        pass: process.env.SMTP_PASS  // App Password (bukan password email biasa)
    }
});

const sendWelcomeEmail = async (toEmail, userName, tempPassword) => {
    try {
        const mailOptions = {
            from: '"Credia Security Team" <security@credia.system>',
            to: toEmail,
            subject: 'Account Approved - Action Required',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #2563eb;">Welcome to Credia System</h2>
                    <p>Dear ${userName},</p>
                    <p>Your account registration has been <strong>APPROVED</strong> by our Administrator.</p>
                    <p>Please use the temporary credentials below to sign in. You will be required to set a new, secure password immediately upon login.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <p style="margin: 0; font-size: 12px; color: #6b7280;">Temporary Password:</p>
                        <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; font-family: monospace; color: #111827;">
                            ${tempPassword}
                        </p>
                    </div>

                    <p>For security reasons, do not share this email with anyone.</p>
                    <p style="margin-top: 30px; font-size: 12px; color: #9ca3af;">
                        This is an automated message. Please do not reply.
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] Welcome email sent to ${toEmail} | ID: ${info.messageId}`.green);
        return true;
    } catch (error) {
        console.error(`[EMAIL ERROR] Failed to send to ${toEmail}: ${error.message}`.red);
        // Jangan throw error agar tidak membatalkan proses approval database,
        // tapi catat log agar admin bisa kirim ulang manual jika perlu.
        return false;
    }
};

module.exports = { sendWelcomeEmail };