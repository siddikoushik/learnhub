import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Build the transporter based on which env vars are available
const createTransporter = () => {
    const host = process.env.SMTP_HOST?.trim();
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_KEY?.trim();
    const port = parseInt(process.env.SMTP_PORT?.trim()) || 587;

    if (host && user && pass) {
        console.log(`📧 Configuring SMTP Transporter (Brevo)... Host: ${host}, Port: ${port}, User: ${user}`);
        return nodemailer.createTransport({
            host: host,
            port: port,
            secure: false, // Port 587 is STARTTLS
            auth: {
                user: user,
                pass: pass
            },
            tls: {
                rejectUnauthorized: false
            },
            logger: false, // Reduced noise
            debug: false
        });
    }

    const emailUser = process.env.EMAIL_USER?.trim();
    const emailPass = process.env.EMAIL_PASS?.trim();

    if (emailUser && emailPass) {
        console.log("📧 Configuring Gmail Transporter...");
        return nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE?.trim() || 'gmail',
            auth: {
                user: emailUser,
                pass: emailPass
            }
        });
    }

    console.warn("⚠️ No email credentials configured correctly in .env — emails will likely fail.");
    return null;
};

const transporter = createTransporter();

// Verify connection configuration
if (transporter) {
    transporter.verify(function (error, success) {
        if (error) {
            console.error("❌ Transporter Verification Failed:", error);
        } else {
            console.log("✅ Server is ready to take our messages");
        }
    });
}

export const sendEmail = async (to, subject, text, html) => {
    if (!transporter) {
        console.warn("⚠️ No transporter available — skipping email send.");
        return { success: false, error: "No email credentials configured" };
    }

    // Deliverability tip: For Brevo, if the 'from' email doesn't match a verified sender, 
    // it will be rejected or sent to spam. SMTP_USER is usually a verified login.
    let senderEmail = (process.env.SENDER_EMAIL || process.env.SMTP_USER || "").trim();
    
    // If SMTP_USER contains 'brevo.com' but our SENDER_EMAIL is a personal gmail, 
    // Brevo might reject the personal gmail if not verified.
    // Let's ensure we use a valid format.
    const mailOptions = {
        from: `LearnHub <${senderEmail}>`,
        to,
        subject,
        text,
        html,
        headers: {
            'X-Entity-Ref-ID': Date.now().toString(),
            'reply-to': process.env.SENDER_EMAIL || senderEmail
        }
    };

    try {
        console.log(`📤 Attempting to send email to: ${to}...`);
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email successful | MessageId:", info.messageId);
        return { success: true, info };
    } catch (error) {
        console.error("❌ Email Hand-off Failed:", error.message);
        return { success: false, error };
    }
};
