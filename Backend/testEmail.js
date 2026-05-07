import { sendEmail } from './utils/sendEmail.js';
import dotenv from 'dotenv';
dotenv.config();

console.log("🚀 Starting Email Test...");
console.log("Config check:");
console.log("- SMTP_HOST:", process.env.SMTP_HOST);
console.log("- SMTP_PORT:", process.env.SMTP_PORT);
console.log("- SMTP_USER:", process.env.SMTP_USER);
console.log("- SENDER_EMAIL:", process.env.SENDER_EMAIL);
console.log("- SMTP_KEY length:", process.env.SMTP_KEY?.length);

const testEmail = "kurvasidhu2112@gmail.com"; // Testing with your own email

async function runTest() {
    console.log(`\n📧 Attempting to send test email to ${testEmail}...`);
    try {
        const result = await sendEmail(
            testEmail,
            "TEST - LearnHub OTP System",
            "If you receive this, your SMTP settings are CORRECT.",
            "<h1>SMTP SUCCESS</h1><p>LearnHub OTP delivery is now verified.</p>"
        );

        if (result.success) {
            console.log("✅ TEST SUCCESSFUL! Check your inbox (including Spam).");
        } else {
            console.error("❌ TEST FAILED.");
            console.error("Error Details:", result.error);
        }
    } catch (err) {
        console.error("💥 CRITICAL ERROR during test:", err);
    }
}

runTest();
