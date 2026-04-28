require('dotenv').config();
const { sendEmail } = require('../utils/emailService');

sendEmail({
  to: 'spndngg@gmail.com',
  subject: 'Test Email - Nepal Travel',
  html: '<h2>Email is working!</h2><p>Your email configuration is correct.</p>'
}).then(() => {
  console.log('✅ Email sent successfully');
}).catch((err) => {
  console.log('❌ Failed:', err.message);
});