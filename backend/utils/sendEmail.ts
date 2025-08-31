const nodemailer = require("nodemailer");

export async function sendEmail(to: string, subject: string, body: string) {
    let transporter = nodemailer.createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.BREVO_SMTP_USER,
            pass: process.env.BREVO_SMTP_KEY,
        },
    });

    let mailOptions = {
        from: process.env.FROM_EMAIL!,
        to: to,
        subject: subject,
        html: body,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("✔ Email sent successfully:", info.messageId);
    } catch (error) {
        console.error("❌ Email sending failed:", error);
    }
}