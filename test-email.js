const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'localhost',
  port: 25,
  secure: false,
  tls: { rejectUnauthorized: false }
});

transporter.sendMail({
  from: 'Carphatian AI Marketplace <noreply@chat.carphatian.ro>',
  to: 'msrusu87@gmail.com',
  subject: 'Test Email - Carphatian AI Marketplace',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0;">Carphatian AI Marketplace</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb; border: 1px solid #e5e7eb;">
        <h2 style="color: #10b981;">Email Configuration Working</h2>
        <p style="color: #4b5563;">Your email system is properly configured and working.</p>
        <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #6b7280;"><strong>Server:</strong> chat.carphatian.ro</p>
          <p style="margin: 5px 0 0; color: #6b7280;"><strong>Time:</strong> ${new Date().toISOString()}</p>
        </div>
        <p style="color: #4b5563;">You can now receive email notifications for:</p>
        <ul style="color: #4b5563;">
          <li>Email verification</li>
          <li>Password resets</li>
          <li>Account notifications</li>
          <li>Platform updates</li>
        </ul>
      </div>
      <div style="background: #1f2937; padding: 20px; text-align: center; border-radius: 0 0 8px 8px;">
        <p style="color: #9ca3af; margin: 0; font-size: 12px;">
          Carphatian AI Marketplace - chat.carphatian.ro
        </p>
      </div>
    </div>
  `,
  text: 'Email Configuration Working - Your email system is properly configured. Server: chat.carphatian.ro'
})
.then(info => {
  console.log('Email sent successfully');
  console.log('Message ID:', info.messageId);
  console.log('Response:', info.response);
  process.exit(0);
})
.catch(err => {
  console.error('Failed to send:', err.message);
  process.exit(1);
});
