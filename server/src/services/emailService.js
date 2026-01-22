const nodemailer = require('nodemailer');
require('colors'); // For colored console logs

// Initialize Transporter
// Ensure environment variables are loaded before this file is imported
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

/**
 * Sends a transactional welcome email with temporary credentials.
 * Designed to be non-blocking (fire and forget pattern).
 */
const sendWelcomeEmail = async (toEmail, userName, tempPassword) => {
    // Skip if no credentials configured (Dev Mode Safety)
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('[EMAIL] SMTP Credentials missing. Skipping email send.'.yellow);
        console.log(`[MOCK EMAIL] To: ${toEmail}, Pass: ${tempPassword}`.gray);
        return false;
    }

    try {
        const mailOptions = {
            from: '"Credia Security Team" <security@credia.system>',
            to: toEmail,
            subject: 'Account Approved - Action Required',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #2563eb; margin: 0;">Welcome to Credia</h2>
                        <p style="color: #6b7280; margin-top: 5px;">Enterprise Financial Solutions</p>
                    </div>
                    
                    <p style="color: #374151; font-size: 16px;">Dear <strong>${userName}</strong>,</p>
                    <p style="color: #374151; line-height: 1.5;">Your account registration has been reviewed and <strong>APPROVED</strong> by our Administration Team.</p>
                    <p style="color: #374151; line-height: 1.5;">Please use the temporary credentials below to access your dashboard. You will be prompted to set a secure password upon your first login.</p>
                    
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center; border: 1px dashed #d1d5db;">
                        <p style="margin: 0; font-size: 12px; text-transform: uppercase; color: #6b7280; letter-spacing: 1px;">Temporary Access Key</p>
                        <p style="margin: 10px 0 0 0; font-size: 24px; font-weight: 700; font-family: 'Courier New', monospace; color: #111827; letter-spacing: 2px;">
                            ${tempPassword}
                        </p>
                    </div>

                    <p style="color: #374151; font-size: 14px;"><strong>Security Notice:</strong> Do not share this email. If you did not request this account, please contact support immediately.</p>
                    
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                    
                    <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                        &copy; ${new Date().getFullYear()} Credia System. All rights reserved.<br>
                        This is an automated system message. Please do not reply.
                    </p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] Sent to ${toEmail} | ID: ${info.messageId}`.green);
        return true;

    } catch (error) {
        console.error(`[EMAIL ERROR] Failed to send to ${toEmail}: ${error.message}`.red);
        // We catch error here to prevent crashing the main thread flow
        return false;
    }
};

module.exports = { sendWelcomeEmail };