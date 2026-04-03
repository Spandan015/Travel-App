# Email Setup Guide for OTP Functionality

## Problem
You're getting "Failed to send OTP" error because email credentials are not configured.

## Solution
Configure Gmail SMTP for sending OTP emails.

## Step 1: Enable 2-Factor Authentication
1. Go to your Gmail account settings
2. Enable 2-Factor Authentication (2FA)

## Step 2: Generate App Password
1. Go to Google Account settings: https://myaccount.google.com/
2. Security → 2-Step Verification → App passwords
3. Generate a new app password for "Mail"
4. Copy the 16-character password

## Step 3: Configure Environment Variables
Create or update your `.env` file in the backend directory:

```env
# Email Configuration (REQUIRED)
EMAIL_USER=your-gmail@gmail.com
EMAIL_APP_PASSWORD=your-16-character-app-password
```

## Step 4: Restart Backend Server
```bash
cd backend
npm run dev
```

## Step 5: Test OTP Sending
Try registering again - you should now receive OTP emails!

## Important Notes
- Use your Gmail address (not Google Workspace)
- The app password is 16 characters (ignore spaces)
- Keep the app password secure
- For production, consider using services like SendGrid or AWS SES

## Troubleshooting
- Make sure 2FA is enabled on your Gmail account
- Verify the app password is correct (16 characters)
- Check spam/junk folder for OTP emails
- Restart the backend server after changing .env

## Alternative (For Development Only)
If you can't set up Gmail, you can temporarily modify the email service to log OTPs to console instead of sending emails.









