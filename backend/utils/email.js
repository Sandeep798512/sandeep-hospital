const nodemailer = require('nodemailer');

/**
 * Creates Nodemailer transporter dynamically
 */
const createTransporter = () => {
  const isGmail = process.env.EMAIL_SERVICE === 'gmail' || (process.env.EMAIL_HOST && process.env.EMAIL_HOST.includes('gmail'));
  
  if (isGmail) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.EMAIL_PORT) || 2525,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER || 'dummy_user',
      pass: process.env.EMAIL_PASS || 'dummy_pass',
    },
  });
};

/**
 * Generic email dispatcher with HTML support and silent fallback logger
 */
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Sandeep Hospital" <noreply@sandeephospital.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html || `<div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">${options.text}</div>`,
      attachments: options.attachments || [],
    };

    await transporter.sendMail(mailOptions);
    console.log(`[Email Success] Dispatch sent to ${options.to}`);
    return true;
  } catch (error) {
    console.error(`[Nodemailer Error] ${error.message}`);
    console.log(`[FALLBACK EMAIL DISPATCH] To: ${options.to}\nSubject: ${options.subject}\nBody: ${options.text || 'HTML Template Content'}`);
    return false;
  }
};

/**
 * Pre-formatted Template Mailers
 */
const sendOtpEmail = async (to, otp, name = 'Valued Patient') => {
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 24px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">SANDEEP HOSPITAL</h1>
        <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Excellence in Healthcare & Diagnostics</p>
      </div>
      <div style="padding: 32px; color: #334155;">
        <h2 style="font-size: 18px; margin-top: 0;">Verification Code</h2>
        <p style="font-size: 14px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.6;">Your 6-digit One-Time Password (OTP) for account verification is:</p>
        <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #0284c7; border-radius: 12px; margin: 24px 0;">
          ${otp}
        </div>
        <p style="font-size: 12px; color: #64748b;">This OTP is valid for 10 minutes. Do not share this code with anyone for your security.</p>
      </div>
      <div style="background: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
        © 2026 Sandeep Hospital Management System. All rights reserved.
      </div>
    </div>
  `;
  return sendEmail({ to, subject: 'Your Verification OTP Code - Sandeep Hospital', text: `Your OTP is ${otp}`, html });
};

const sendForgotPasswordEmail = async (to, resetUrl, otp, name = 'User') => {
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: sans-serif; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: #0284c7; padding: 20px; text-align: center; color: white;">
        <h2 style="margin:0;">Sandeep Hospital</h2>
      </div>
      <div style="padding: 24px;">
        <h3>Reset Your Password</h3>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Use the verification code below:</p>
        <h1 style="color: #0284c7; font-size: 36px; letter-spacing: 6px; text-align: center;">${otp}</h1>
        <p>If you did not request a password reset, please ignore this email.</p>
      </div>
    </div>
  `;
  return sendEmail({ to, subject: 'Password Reset Code - Sandeep Hospital', text: `Your reset OTP is ${otp}`, html });
};

const sendAppointmentEmail = async (to, apptDetails, actionType = 'Confirmation') => {
  const html = `
    <div style="max-width: 600px; margin: 0 auto; font-family: sans-serif; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
      <div style="background: #0284c7; padding: 20px; text-align: center; color: white;">
        <h2 style="margin:0;">Appointment ${actionType}</h2>
      </div>
      <div style="padding: 24px; color: #334155;">
        <p>Dear Patient,</p>
        <p>Your appointment status has been updated to: <strong>${actionType}</strong>.</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Doctor:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">Dr. ${apptDetails.doctorName || 'Specialist'}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Department:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${apptDetails.department || 'General'}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Date:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${apptDetails.date}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Time Slot:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${apptDetails.timeSlot}</td></tr>
        </table>
        <p style="margin-top: 20px; font-size: 13px; color: #64748b;">Please arrive 15 minutes prior to your slot time.</p>
      </div>
    </div>
  `;
  return sendEmail({ to, subject: `Appointment ${actionType} - Sandeep Hospital`, text: `Appointment ${actionType} for ${apptDetails.date} at ${apptDetails.timeSlot}`, html });
};

// Export main function with attached helper properties for backwards compatibility
sendEmail.sendEmail = sendEmail;
sendEmail.sendOtpEmail = sendOtpEmail;
sendEmail.sendForgotPasswordEmail = sendForgotPasswordEmail;
sendEmail.sendAppointmentEmail = sendAppointmentEmail;

module.exports = sendEmail;
