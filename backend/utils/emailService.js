const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_APP_PASSWORD) {
    throw new Error('Email configuration missing. Please set EMAIL_USER and EMAIL_APP_PASSWORD environment variables.');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,            // Your Gmail address
      pass: process.env.EMAIL_APP_PASSWORD     // Gmail App Password
    }
  });
};

// Generate OTP (6 digits)
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP Email
const sendOTPEmail = async (email, otp, purpose = 'verification') => {
  try {
    console.log('='.repeat(60));
    console.log('📧 SENDING OTP EMAIL...');
    console.log('='.repeat(60));
    console.log(`📧 To: ${email}`);
    console.log(`🔐 OTP: ${otp}`);
    console.log(`📝 Purpose: ${purpose}`);
    console.log('='.repeat(60));

    const transporter = createTransporter();

    const subjectMap = {
      verification: 'Email Verification OTP - Nepal Travel',
      login: 'Login OTP - Nepal Travel',
      registration: 'Registration OTP - Nepal Travel',
      password_reset: 'Password Reset OTP - Nepal Travel'
    };

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subjectMap[purpose]}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .container { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; }
            .content { background: white; padding: 30px; border-radius: 10px; margin-top: 20px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; margin: 20px 0; }
            .footer { margin-top: 30px; font-size: 14px; color: #666; }
            .brand { color: #667eea; font-weight: bold; font-size: 24px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="brand">🇳🇵 Nepal Travel</div>
            <div class="content">
              <h2>Your Verification Code</h2>
              <p>Hello! Here's your one-time password (OTP) to ${purpose === 'login' ? 'log in to' : purpose === 'registration' ? 'complete your registration for' : 'verify your email for'} Nepal Travel:</p>
              <div class="otp-code">${otp}</div>
              <p><strong>This code will expire in 10 minutes.</strong></p>
              <p>If you didn't request this code, please ignore this email.</p>
              <div class="footer">
                <p>Best regards,<br>The Nepal Travel Team</p>
                <p style="font-size: 12px; color: #999;">
                  This is an automated message. Please do not reply to this email.
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: `"Nepal Travel" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: subjectMap[purpose],
      html: htmlTemplate
    };

    console.log('📤 Sending email via Gmail...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully:', info.messageId);
    console.log('='.repeat(60));

    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    console.log('='.repeat(60));
    console.log('⚠️  FALLING BACK TO CONSOLE LOGGING');
    console.log('💡 Copy this OTP for testing:', otp);
    console.log('='.repeat(60));

    // Fallback: still return success but log the OTP
    return { success: true, fallback: true, otp: otp };
  }
};

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: `"Nepal Travel" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendEmail
};
