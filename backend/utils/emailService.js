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
      pass: process.env.EMAIL_APP_PASSWORD      // Gmail App Password
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
    console.log(`🎯 Purpose: ${purpose}`);
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
            .footer { }
            .brand { color: #667eea; font-weight: bold; font-size: 24px; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="brand">🏔️ Nepal Travel</div>
            <div class="content">
              <h2>Your Verification Code</h2>
              <p>Hello! Here's your one-time password (OTP) to ${
                purpose === 'login' ? 'log in to' : purpose === 'registration' ? 'complete your registration for' : 'verify your email for'
              } Nepal Travel:</p>
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

    console.log('📨 Sending email via Gmail...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully:', info.messageId);
    console.log('='.repeat(60));
    return;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    console.log('='.repeat(60));
    console.log('⚠️  FALLING BACK TO CONSOLE LOGGING');
    console.log('📋 Copy this OTP for testing:', otp);
    console.log('='.repeat(60));
    // Fallback: still return success but log the OTP
    return;
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
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return;
  }
};

// ─────────────────────────────────────────────────────────────
// SHARED HELPERS
// ─────────────────────────────────────────────────────────────

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
};

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'N/A';
  return `NPR ${Number(amount).toLocaleString('en-NP')}`;
};

// Shared email wrapper styles
const emailWrapper = (bodyContent) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Booking Confirmation – Nepal Travel</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f0f4f8; color: #333; }
    .wrapper { max-width: 620px; margin: 30px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.10); }
    .header { background: linear-gradient(135deg, #1a3c5e 0%, #2d6a4f 100%); padding: 36px 30px; text-align: center; }
    .header-logo { font-size: 28px; font-weight: 800; color: #fff; letter-spacing: 1px; }
    .header-logo span { color: #f4c430; }
    .header-tagline { color: #c8e6d8; font-size: 13px; margin-top: 6px; }
    .confirm-badge { display: inline-block; background: #f4c430; color: #1a3c5e; font-weight: 700; font-size: 13px; border-radius: 20px; padding: 6px 18px; margin-top: 16px; letter-spacing: 1px; text-transform: uppercase; }
    .body { padding: 32px 30px; }
    .greeting { font-size: 22px; font-weight: 700; color: #1a3c5e; margin-bottom: 8px; }
    .subtext { color: #666; font-size: 14px; margin-bottom: 24px; line-height: 1.6; }
    .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #2d6a4f; margin-bottom: 12px; border-left: 3px solid #f4c430; padding-left: 10px; }
    .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px 20px; margin-bottom: 20px; }
    .info-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 8px 0; border-bottom: 1px solid #edf2f7; }
    .info-row:last-child { border-bottom: none; padding-bottom: 0; }
    .info-label { font-size: 13px; color: #718096; font-weight: 500; min-width: 140px; }
    .info-value { font-size: 13px; color: #2d3748; font-weight: 600; text-align: right; }
    .total-row { background: linear-gradient(135deg, #1a3c5e, #2d6a4f); border-radius: 8px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .total-label { color: #c8e6d8; font-size: 14px; font-weight: 600; }
    .total-value { color: #f4c430; font-size: 22px; font-weight: 800; }
    .status-pending { background: #fff8e6; border: 1px solid #f4c430; border-radius: 8px; padding: 14px 20px; margin-bottom: 20px; font-size: 13px; color: #856404; line-height: 1.6; }
    .status-pending strong { color: #533f03; }
    .divider { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
    .note-box { background: #e8f5e9; border-left: 4px solid #2d6a4f; border-radius: 0 8px 8px 0; padding: 14px 18px; margin-bottom: 20px; font-size: 13px; color: #1b5e20; line-height: 1.7; }
    .footer { background: #1a3c5e; padding: 24px 30px; text-align: center; }
    .footer p { color: #90afc5; font-size: 12px; line-height: 1.8; }
    .footer a { color: #f4c430; text-decoration: none; }
    .booking-id { font-family: monospace; background: #edf2f7; padding: 2px 8px; border-radius: 4px; font-size: 12px; color: #4a5568; }
  </style>
</head>
<body>
  <div class="wrapper">
    ${bodyContent}
  </div>
</body>
</html>
`;

const sharedFooter = `
<div class="footer">
  <p>This is an automated confirmation from <strong style="color:#f4c430;">Nepal Travel</strong>.<br/>
  Please do not reply to this email.<br/>
  For support, contact us at <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a></p>
</div>
`;

// ─────────────────────────────────────────────────────────────
// 1. HOTEL BOOKING CONFIRMATION
// ─────────────────────────────────────────────────────────────

const sendHotelBookingConfirmation = async (booking) => {
  try {
    const userEmail = booking.contactInfo?.email || booking.user?.email;
    const userName  = booking.contactInfo?.name  || booking.user?.username || 'Valued Guest';
    if (!userEmail) return;

    const hotelName     = booking.hotel?.name     || 'Hotel';
    const hotelLocation = booking.hotel?.location || '';
    const nights        = booking.checkInDate && booking.checkOutDate
      ? Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 3600 * 24))
      : 'N/A';

    const html = emailWrapper(`
      <div class="header">
        <div class="header-logo">🏔️ Nepal <span>Travel</span></div>
        <div class="header-tagline">Your Gateway to the Himalayas</div>
        <div class="confirm-badge">📋 Complete Payment to Confirm</div>
      </div>

      <div class="body">
        <div class="greeting">Hello, ${userName}! 👋</div>
        <p class="subtext">
          Thank you for choosing Nepal Travel. Your hotel booking has been <strong>reserved</strong> —
          please complete your eSewa payment to fully confirm it. Below are your booking details.
        </p>

        <div class="section-title">🏨 Hotel Details</div>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">Hotel Name</span>
            <span class="info-value">${hotelName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Location</span>
            <span class="info-value">${hotelLocation}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Booking ID</span>
            <span class="info-value"><span class="booking-id">${booking._id}</span></span>
          </div>
        </div>

        <div class="section-title">📅 Stay Details</div>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">Check-In</span>
            <span class="info-value">${formatDate(booking.checkInDate)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Check-Out</span>
            <span class="info-value">${formatDate(booking.checkOutDate)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Duration</span>
            <span class="info-value">${nights} Night${nights !== 1 ? 's' : ''}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Guests</span>
            <span class="info-value">${booking.numberOfGuests}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Rooms</span>
            <span class="info-value">${booking.numberOfRooms}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Price / Night</span>
            <span class="info-value">${formatCurrency(booking.pricePerNight)}</span>
          </div>
          ${booking.specialRequests ? `
          <div class="info-row">
            <span class="info-label">Special Requests</span>
            <span class="info-value">${booking.specialRequests}</span>
          </div>` : ''}
        </div>

        <div class="total-row">
          <span class="total-label">💳 Total Amount</span>
          <span class="total-value">${formatCurrency(booking.totalPrice)}</span>
        </div>

        <div class="status-pending">
          <strong>⏳ Payment Pending</strong><br/>
          Your booking is confirmed once payment is completed via eSewa.
          Please complete your payment to secure the reservation.
        </div>

        <div class="note-box">
          📌 <strong>What's next?</strong><br/>
          1. Complete your eSewa payment to confirm the booking.<br/>
          2. You will receive a final confirmation email once payment is verified.<br/>
          3. Please carry a copy of this email when you check in.
        </div>
      </div>

      ${sharedFooter}
    `);

    await sendEmail({
      to: userEmail,
      subject: `🏨 Hotel Booking Received – ${hotelName} | Nepal Travel`,
      html
    });

    console.log(`✅ Hotel booking confirmation email sent to ${userEmail}`);
  } catch (err) {
    console.error('❌ Failed to send hotel booking confirmation email:', err.message);
  }
};

// ─────────────────────────────────────────────────────────────
// 2. PACKAGE BOOKING CONFIRMATION
// ─────────────────────────────────────────────────────────────

const sendPackageBookingConfirmation = async (booking) => {
  try {
    const userEmail   = booking.contactInfo?.email || booking.user?.email;
    const userName    = booking.contactInfo?.name  || booking.user?.username || 'Valued Guest';
    if (!userEmail) return;

    const packageName = booking.package?.name     || 'Travel Package';
    const duration    = booking.package?.duration  || 'N/A';

    const html = emailWrapper(`
      <div class="header">
        <div class="header-logo">🏔️ Nepal <span>Travel</span></div>
        <div class="header-tagline">Your Gateway to the Himalayas</div>
        <div class="confirm-badge">📋 Complete Payment to Confirm</div>
      </div>

      <div class="body">
        <div class="greeting">Hello, ${userName}! 🎒</div>
        <p class="subtext">
          Exciting times ahead! Your travel package has been <strong>reserved</strong> —
          please complete your eSewa payment to fully confirm your adventure.
        </p>

        <div class="section-title">📦 Package Details</div>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">Package Name</span>
            <span class="info-value">${packageName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Duration</span>
            <span class="info-value">${duration} Day${Number(duration) !== 1 ? 's' : ''}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Booking ID</span>
            <span class="info-value"><span class="booking-id">${booking._id}</span></span>
          </div>
        </div>

        <div class="section-title">📅 Trip Details</div>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">Start Date</span>
            <span class="info-value">${formatDate(booking.startDate)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">End Date</span>
            <span class="info-value">${formatDate(booking.endDate)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Number of Guests</span>
            <span class="info-value">${booking.numberOfGuests}</span>
          </div>
          ${booking.specialRequests ? `
          <div class="info-row">
            <span class="info-label">Special Requests</span>
            <span class="info-value">${booking.specialRequests}</span>
          </div>` : ''}
        </div>

        <div class="total-row">
          <span class="total-label">💳 Total Amount</span>
          <span class="total-value">${formatCurrency(booking.totalPrice)}</span>
        </div>

        <div class="status-pending">
          <strong>⏳ Payment Pending</strong><br/>
          Your package slot is reserved pending payment via eSewa.
          Please complete your payment to confirm your adventure.
        </div>

        <div class="note-box">
          📌 <strong>What's next?</strong><br/>
          1. Complete your eSewa payment to confirm the booking.<br/>
          2. A final confirmation with itinerary details will be sent after payment.<br/>
          3. Our team will reach out with further instructions before the trip.
        </div>
      </div>

      ${sharedFooter}
    `);

    await sendEmail({
      to: userEmail,
      subject: `🎒 Package Booking Received – ${packageName} | Nepal Travel`,
      html
    });

    console.log(`✅ Package booking confirmation email sent to ${userEmail}`);
  } catch (err) {
    console.error('❌ Failed to send package booking confirmation email:', err.message);
  }
};

// ─────────────────────────────────────────────────────────────
// 3. TREK BOOKING CONFIRMATION
// ─────────────────────────────────────────────────────────────

const sendTrekBookingConfirmation = async (booking) => {
  try {
    const userEmail = booking.contactInfo?.email || booking.user?.email;
    const userName  = booking.contactInfo?.name  || booking.user?.username || 'Valued Guest';
    if (!userEmail) return;

    const trekName = booking.trek?.name     || 'Trek';
    const duration = booking.trek?.duration || 'N/A';

    const html = emailWrapper(`
      <div class="header">
        <div class="header-logo">🏔️ Nepal <span>Travel</span></div>
        <div class="header-tagline">Your Gateway to the Himalayas</div>
        <div class="confirm-badge">📋 Complete Payment to Confirm</div>
      </div>

      <div class="body">
        <div class="greeting">Hello, ${userName}! 🥾</div>
        <p class="subtext">
          The mountains are calling! Your trek has been <strong>reserved</strong> —
          please complete your eSewa payment to fully confirm your spot.
        </p>

        <div class="section-title">🥾 Trek Details</div>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">Trek Name</span>
            <span class="info-value">${trekName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Duration</span>
            <span class="info-value">${duration} Day${Number(duration) !== 1 ? 's' : ''}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Booking ID</span>
            <span class="info-value"><span class="booking-id">${booking._id}</span></span>
          </div>
        </div>

        <div class="section-title">📅 Trek Schedule</div>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">Start Date</span>
            <span class="info-value">${formatDate(booking.startDate)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Number of Guests</span>
            <span class="info-value">${booking.numberOfGuests}</span>
          </div>
          ${booking.specialRequests ? `
          <div class="info-row">
            <span class="info-label">Special Requests</span>
            <span class="info-value">${booking.specialRequests}</span>
          </div>` : ''}
        </div>

        <div class="total-row">
          <span class="total-label">💳 Total Amount</span>
          <span class="total-value">${formatCurrency(booking.totalPrice)}</span>
        </div>

        <div class="status-pending">
          <strong>⏳ Payment Pending</strong><br/>
          Your trek spot is reserved pending payment via eSewa.
          Please complete your payment to lock in your spot.
        </div>

        <div class="note-box">
          📌 <strong>What's next?</strong><br/>
          1. Complete your eSewa payment to confirm the booking.<br/>
          2. You'll receive a detailed itinerary and packing list once confirmed.<br/>
          3. Ensure you have appropriate gear and travel insurance for the trek.
        </div>
      </div>

      ${sharedFooter}
    `);

    await sendEmail({
      to: userEmail,
      subject: `🥾 Trek Booking Received – ${trekName} | Nepal Travel`,
      html
    });

    console.log(`✅ Trek booking confirmation email sent to ${userEmail}`);
  } catch (err) {
    console.error('❌ Failed to send trek booking confirmation email:', err.message);
  }
};

// ─────────────────────────────────────────────────────────────
// 4. GUIDE BOOKING CONFIRMATION
// ─────────────────────────────────────────────────────────────

const sendGuideBookingConfirmation = async (booking) => {
  try {
    const userEmail = booking.user?.email;
    const userName  = booking.user?.username || 'Valued Guest';
    if (!userEmail) return;

    const guideName       = booking.guide?.username    || 'Your Guide';
    const guideEmail      = booking.guide?.email       || '';
    const guidePhone      = booking.guide?.phone       || 'N/A';
    const destinationName = booking.destination?.name  || 'N/A';
    const tourType        = booking.tourType            || 'N/A';
    const durationLabel   = booking.durationType === 'hourly'
      ? `${booking.duration} Hour${booking.duration !== 1 ? 's' : ''}`
      : `${booking.duration} Day${booking.duration !== 1 ? 's' : ''}`;

    const html = emailWrapper(`
      <div class="header">
        <div class="header-logo">🏔️ Nepal <span>Travel</span></div>
        <div class="header-tagline">Your Gateway to the Himalayas</div>
        <div class="confirm-badge">✓ Guide Request Sent</div>
      </div>

      <div class="body">
        <div class="greeting">Hello, ${userName}! 🧭</div>
        <p class="subtext">
          Your guide booking request has been submitted successfully. The guide will review your
          request and confirm shortly. Here's a summary of your request.
        </p>

        <div class="section-title">🧭 Guide Details</div>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">Guide Name</span>
            <span class="info-value">${guideName}</span>
          </div>
          ${guideEmail ? `
          <div class="info-row">
            <span class="info-label">Guide Email</span>
            <span class="info-value">${guideEmail}</span>
          </div>` : ''}
          <div class="info-row">
            <span class="info-label">Guide Phone</span>
            <span class="info-value">${guidePhone}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Booking ID</span>
            <span class="info-value"><span class="booking-id">${booking._id}</span></span>
          </div>
        </div>

        <div class="section-title">📅 Tour Details</div>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">Destination</span>
            <span class="info-value">${destinationName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Tour Type</span>
            <span class="info-value">${tourType}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Start Date</span>
            <span class="info-value">${formatDate(booking.startDate)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">End Date</span>
            <span class="info-value">${formatDate(booking.endDate)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Duration</span>
            <span class="info-value">${durationLabel}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Number of People</span>
            <span class="info-value">${booking.numberOfPeople}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Rate</span>
            <span class="info-value">${formatCurrency(booking.pricePerUnit)} / ${booking.durationType === 'hourly' ? 'hour' : 'day'}</span>
          </div>
          ${booking.specialRequests ? `
          <div class="info-row">
            <span class="info-label">Special Requests</span>
            <span class="info-value">${booking.specialRequests}</span>
          </div>` : ''}
        </div>

        <div class="total-row">
          <span class="total-label">💳 Estimated Total</span>
          <span class="total-value">${formatCurrency(booking.totalPrice)}</span>
        </div>

        <div class="status-pending">
          <strong>⏳ Awaiting Guide Confirmation</strong><br/>
          Your request has been sent to <strong>${guideName}</strong>. You will receive another
          email once the guide accepts or responds to your request.
        </div>

        <div class="note-box">
          📌 <strong>What's next?</strong><br/>
          1. The guide will review and accept your request.<br/>
          2. You'll receive a confirmation email once accepted.<br/>
          3. Payment details will be shared after guide confirmation.
        </div>
      </div>

      ${sharedFooter}
    `);

    await sendEmail({
      to: userEmail,
      subject: `🧭 Guide Request Sent – ${guideName} | Nepal Travel`,
      html
    });

    console.log(`✅ Guide booking confirmation email sent to ${userEmail}`);
  } catch (err) {
    console.error('❌ Failed to send guide booking confirmation email:', err.message);
  }
};

// ─────────────────────────────────────────────────────────────
// PAYMENT CONFIRMED EMAILS (fired from esewaController.verifyPayment)
// ─────────────────────────────────────────────────────────────

const sendHotelPaymentConfirmed = async (booking, transaction = {}) => {
  try {
    const userEmail = booking.contactInfo?.email || booking.user?.email;
    const userName  = booking.contactInfo?.name  || booking.user?.username || 'Valued Guest';
    if (!userEmail) return;

    const hotelName     = booking.hotel?.name     || 'Hotel';
    const hotelLocation = booking.hotel?.location || '';
    const nights        = booking.checkInDate && booking.checkOutDate
      ? Math.ceil((new Date(booking.checkOutDate) - new Date(booking.checkInDate)) / (1000 * 3600 * 24))
      : 'N/A';

    const html = emailWrapper(`
      <div class="header">
        <div class="header-logo">🏔️ Nepal <span>Travel</span></div>
        <div class="header-tagline">Your Gateway to the Himalayas</div>
        <div class="confirm-badge" style="background:#2d6a4f;color:#fff;">✅ Booking Confirmed & Paid</div>
      </div>

      <div class="body">
        <div class="greeting">You're all set, ${userName}! 🎉</div>
        <p class="subtext">
          Your payment was successful and your hotel booking is now <strong>confirmed</strong>.
          We look forward to welcoming you. Here are your confirmed booking details.
        </p>

        <div class="section-title">🏨 Hotel Details</div>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">Hotel Name</span>
            <span class="info-value">${hotelName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Location</span>
            <span class="info-value">${hotelLocation}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Booking ID</span>
            <span class="info-value"><span class="booking-id">${booking._id}</span></span>
          </div>
        </div>

        <div class="section-title">📅 Stay Details</div>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">Check-In</span>
            <span class="info-value">${formatDate(booking.checkInDate)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Check-Out</span>
            <span class="info-value">${formatDate(booking.checkOutDate)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Duration</span>
            <span class="info-value">${nights} Night${nights !== 1 ? 's' : ''}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Guests</span>
            <span class="info-value">${booking.numberOfGuests}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Rooms</span>
            <span class="info-value">${booking.numberOfRooms}</span>
          </div>
          ${booking.specialRequests ? `
          <div class="info-row">
            <span class="info-label">Special Requests</span>
            <span class="info-value">${booking.specialRequests}</span>
          </div>` : ''}
        </div>

        <div class="section-title">💳 Payment Details</div>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">Amount Paid</span>
            <span class="info-value" style="color:#2d6a4f;font-size:15px;">${formatCurrency(booking.totalPrice)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Payment Method</span>
            <span class="info-value">eSewa</span>
          </div>
          <div class="info-row">
            <span class="info-label">Transaction Code</span>
            <span class="info-value"><span class="booking-id">${transaction.code || booking.esewaRefId || 'N/A'}</span></span>
          </div>
          <div class="info-row">
            <span class="info-label">Paid On</span>
            <span class="info-value">${formatDate(booking.paidAt || new Date())}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status</span>
            <span class="info-value" style="color:#2d6a4f;">✅ Confirmed</span>
          </div>
        </div>

        <div class="note-box">
          📌 <strong>Before you arrive:</strong><br/>
          1. Please carry a copy of this confirmation email at check-in.<br/>
          2. Check-in time is typically 2:00 PM — early check-in subject to availability.<br/>
          3. Contact the hotel directly for any special arrangements.
        </div>
      </div>

      ${sharedFooter}
    `);

    await sendEmail({
      to: userEmail,
      subject: `✅ Booking Confirmed – ${hotelName} | Nepal Travel`,
      html
    });

    console.log(`✅ Hotel payment confirmed email sent to ${userEmail}`);
  } catch (err) {
    console.error('❌ Failed to send hotel payment confirmed email:', err.message);
  }
};

const sendPackagePaymentConfirmed = async (booking, transaction = {}) => {
  try {
    const userEmail   = booking.contactInfo?.email || booking.user?.email;
    const userName    = booking.contactInfo?.name  || booking.user?.username || 'Valued Guest';
    if (!userEmail) return;

    const packageName = booking.package?.name     || 'Travel Package';
    const duration    = booking.package?.duration  || 'N/A';

    const html = emailWrapper(`
      <div class="header">
        <div class="header-logo">🏔️ Nepal <span>Travel</span></div>
        <div class="header-tagline">Your Gateway to the Himalayas</div>
        <div class="confirm-badge" style="background:#2d6a4f;color:#fff;">✅ Package Confirmed & Paid</div>
      </div>

      <div class="body">
        <div class="greeting">Adventure awaits, ${userName}! 🎉</div>
        <p class="subtext">
          Your payment was successful and your travel package is now <strong>confirmed</strong>.
          Get ready for an unforgettable experience in Nepal!
        </p>

        <div class="section-title">📦 Package Details</div>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">Package Name</span>
            <span class="info-value">${packageName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Duration</span>
            <span class="info-value">${duration} Day${Number(duration) !== 1 ? 's' : ''}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Booking ID</span>
            <span class="info-value"><span class="booking-id">${booking._id}</span></span>
          </div>
        </div>

        <div class="section-title">📅 Trip Details</div>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">Start Date</span>
            <span class="info-value">${formatDate(booking.startDate)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">End Date</span>
            <span class="info-value">${formatDate(booking.endDate)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Guests</span>
            <span class="info-value">${booking.numberOfGuests}</span>
          </div>
        </div>

        <div class="section-title">💳 Payment Details</div>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">Amount Paid</span>
            <span class="info-value" style="color:#2d6a4f;font-size:15px;">${formatCurrency(booking.totalPrice)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Payment Method</span>
            <span class="info-value">eSewa</span>
          </div>
          <div class="info-row">
            <span class="info-label">Transaction Code</span>
            <span class="info-value"><span class="booking-id">${transaction.code || booking.esewaRefId || 'N/A'}</span></span>
          </div>
          <div class="info-row">
            <span class="info-label">Paid On</span>
            <span class="info-value">${formatDate(booking.paidAt || new Date())}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status</span>
            <span class="info-value" style="color:#2d6a4f;">✅ Confirmed</span>
          </div>
        </div>

        <div class="note-box">
          📌 <strong>What's next?</strong><br/>
          1. Our team will contact you with detailed itinerary and meeting point.<br/>
          2. Please carry this confirmation email on your trip.<br/>
          3. Ensure you have valid travel documents and appropriate gear.
        </div>
      </div>

      ${sharedFooter}
    `);

    await sendEmail({
      to: userEmail,
      subject: `✅ Package Confirmed – ${packageName} | Nepal Travel`,
      html
    });

    console.log(`✅ Package payment confirmed email sent to ${userEmail}`);
  } catch (err) {
    console.error('❌ Failed to send package payment confirmed email:', err.message);
  }
};

const sendTrekPaymentConfirmed = async (booking, transaction = {}) => {
  try {
    const userEmail = booking.contactInfo?.email || booking.user?.email;
    const userName  = booking.contactInfo?.name  || booking.user?.username || 'Valued Guest';
    if (!userEmail) return;

    const trekName = booking.trek?.name     || 'Trek';
    const duration = booking.trek?.duration || 'N/A';

    const html = emailWrapper(`
      <div class="header">
        <div class="header-logo">🏔️ Nepal <span>Travel</span></div>
        <div class="header-tagline">Your Gateway to the Himalayas</div>
        <div class="confirm-badge" style="background:#2d6a4f;color:#fff;">✅ Trek Confirmed & Paid</div>
      </div>

      <div class="body">
        <div class="greeting">The summit awaits, ${userName}! 🎉</div>
        <p class="subtext">
          Your payment was successful and your trek is now <strong>confirmed</strong>.
          Time to lace up those boots — Nepal is ready for you!
        </p>

        <div class="section-title">🥾 Trek Details</div>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">Trek Name</span>
            <span class="info-value">${trekName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Duration</span>
            <span class="info-value">${duration} Day${Number(duration) !== 1 ? 's' : ''}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Booking ID</span>
            <span class="info-value"><span class="booking-id">${booking._id}</span></span>
          </div>
        </div>

        <div class="section-title">📅 Trek Schedule</div>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">Start Date</span>
            <span class="info-value">${formatDate(booking.startDate)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Guests</span>
            <span class="info-value">${booking.numberOfGuests}</span>
          </div>
          ${booking.specialRequests ? `
          <div class="info-row">
            <span class="info-label">Special Requests</span>
            <span class="info-value">${booking.specialRequests}</span>
          </div>` : ''}
        </div>

        <div class="section-title">💳 Payment Details</div>
        <div class="info-card">
          <div class="info-row">
            <span class="info-label">Amount Paid</span>
            <span class="info-value" style="color:#2d6a4f;font-size:15px;">${formatCurrency(booking.totalPrice)}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Payment Method</span>
            <span class="info-value">eSewa</span>
          </div>
          <div class="info-row">
            <span class="info-label">Transaction Code</span>
            <span class="info-value"><span class="booking-id">${transaction.code || booking.esewaRefId || 'N/A'}</span></span>
          </div>
          <div class="info-row">
            <span class="info-label">Paid On</span>
            <span class="info-value">${formatDate(booking.paidAt || new Date())}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Status</span>
            <span class="info-value" style="color:#2d6a4f;">✅ Confirmed</span>
          </div>
        </div>

        <div class="note-box">
          📌 <strong>Before you trek:</strong><br/>
          1. Our team will share a detailed packing list and meeting point shortly.<br/>
          2. Ensure you have travel insurance covering high-altitude trekking.<br/>
          3. Please carry this confirmation on the day of your trek.
        </div>
      </div>

      ${sharedFooter}
    `);

    await sendEmail({
      to: userEmail,
      subject: `✅ Trek Confirmed – ${trekName} | Nepal Travel`,
      html
    });

    console.log(`✅ Trek payment confirmed email sent to ${userEmail}`);
  } catch (err) {
    console.error('❌ Failed to send trek payment confirmed email:', err.message);
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  sendEmail,
  sendHotelBookingConfirmation,
  sendPackageBookingConfirmation,
  sendTrekBookingConfirmation,
  sendGuideBookingConfirmation,
  sendHotelPaymentConfirmed,
  sendPackagePaymentConfirmed,
  sendTrekPaymentConfirmed,
};