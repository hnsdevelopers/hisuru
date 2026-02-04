// server.js
const express = require('express');
const cors = require('cors');
const formData = require('form-data');
const Mailgun = require('mailgun.js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize Mailgun
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || 'f9f8ce3b32a00473f4aa2ffb538b0e16-f39109fe-7c2373f6',
});

// Test email endpoint
app.post('/api/test-email', async (req, res) => {
  try {
    const { to, from, subject, text, apiKey, domain } = req.body;

    // Use provided API key or default
    const mgClient = apiKey 
      ? mailgun.client({ username: 'api', key: apiKey })
      : mg;

    const data = await mgClient.messages.create(domain || 'sandbox21f7222ac05844f9b2e8a7990a4de00c.mailgun.org', {
      from: from || 'HiSuru Test <noreply@sandbox21f7222ac05844f9b2e8a7990a4de00c.mailgun.org>',
      to: [to],
      subject: subject || 'HiSuru Email Configuration Test',
      text: text || 'This is a test email to verify your Mailgun configuration is working correctly.',
    });

    console.log('Email sent successfully:', data.id);
    res.json({ 
      success: true, 
      message: 'Test email sent successfully!',
      id: data.id 
    });
  } catch (error) {
    console.error('Mailgun error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: 'Check your API key, domain, and from email address'
    });
  }
});

// Send invitation email endpoint
app.post('/api/send-invitation', async (req, res) => {
  try {
    const { to, name, role, inviterName, company, apiKey, domain, fromEmail, fromName } = req.body;

    const mgClient = mailgun.client({ 
      username: 'api', 
      key: apiKey || process.env.MAILGUN_API_KEY 
    });

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>You're invited to join HiSuru! 🚀</h2>
        <p>Hello ${name || 'there'},</p>
        <p>${inviterName || 'A team member'} has invited you to join ${company || 'their team'} on HiSuru as a <strong>${role}</strong>.</p>
        <p>HiSuru is an all-in-one productivity platform for task management, scheduling, and team collaboration.</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="https://your-app-url.com/auth?mode=signup&invite=true" 
             style="background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Accept Invitation
          </a>
        </div>
        <p>If you have any questions, contact ${inviterName || 'your team administrator'}.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #6b7280; font-size: 12px;">
          This invitation was sent by ${inviterName || 'a HiSuru user'}.
          If you didn't expect this invitation, you can ignore this email.
        </p>
      </div>
    `;

    const data = await mgClient.messages.create(domain || 'sandbox21f7222ac05844f9b2e8a7990a4de00c.mailgun.org', {
      from: `${fromName || 'HiSuru Team'} <${fromEmail || 'noreply@sandbox21f7222ac05844f9b2e8a7990a4de00c.mailgun.org'}>`,
      to: [to],
      subject: `You're invited to join ${company || 'HiSuru'}!`,
      html: html,
      text: `You've been invited to join ${company || 'HiSuru'} by ${inviterName || 'a team member'} as a ${role}. Sign up at https://your-app-url.com/auth?mode=signup&invite=true`,
    });

    console.log('Invitation sent to:', to);
    res.json({ 
      success: true, 
      message: 'Invitation sent successfully',
      id: data.id 
    });
  } catch (error) {
    console.error('Invitation email error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log(`Test email endpoint: POST http://localhost:${PORT}/api/test-email`);
});