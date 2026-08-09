const nodemailer = require("nodemailer");
require("dotenv").config();

function isEmailConfigured() {
  return (
    process.env.EMAIL_HOST &&
    process.env.EMAIL_PORT &&
    process.env.EMAIL_USER &&
    process.env.EMAIL_PASS
  );
}

function createTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

async function sendEmail({ to, subject, text, html }) {
  if (!isEmailConfigured()) {
    return {
      sent: false,
      provider: "nodemailer",
      errorMessage: "Missing email environment variables",
    };
  }

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    });

    return {
      sent: true,
      provider: "nodemailer",
      messageId: info.messageId,
    };
  } catch (error) {
    return {
      sent: false,
      provider: "nodemailer",
      errorCode: error.code,
      errorMessage: error.message,
    };
  }
}

async function sendStudentInviteEmail({ to, name, phone }) {
  return sendEmail({
    to,
    subject: "Welcome to Classroom Management",
    text: `Hello ${name}, your student profile has been created. Your phone number is ${phone}.`,
    html: `<p>Hello ${name},</p><p>Your student profile has been created.</p><p>Phone: ${phone}</p>`,
  });
}

async function sendStudentAccessCodeEmail({ to, accessCode }) {
  return sendEmail({
    to,
    subject: "Your Classroom Management access code",
    text: `Your Classroom Management access code is ${accessCode}.`,
    html: `<p>Your Classroom Management access code is <strong>${accessCode}</strong>.</p>`,
  });
}

module.exports = {
  sendStudentInviteEmail,
  sendStudentAccessCodeEmail,
};
