const express = require('express');
const router = express.Router();
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY
});

// Send email endpoint
router.post('/send', async (req, res) => {
  try {
    const { to, subject, text, html, from } = req.body;

    const data = {
      from: from || 'HiSuru <noreply@mg.hisuru.com>',
      to: to,
      subject: subject,
      text: text,
      html: html
    };

    const result = await mg.messages.create(process.env.MAILGUN_DOMAIN, data);
    
    res.json({ success: true, messageId: result.id });
  } catch (error) {
    console.error('Mailgun error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send verification email
router.post('/send-verification', async (req, res) => {
  try {
    const { email, verificationUrl } = req.body;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Verify Your Email</h2>
        <p>Click the link below to verify your email address:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">
          Verify Email
        </a>
        <p>Or copy this link: ${verificationUrl}</p>
      </div>
    `;

    const result = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: 'HiSuru <noreply@mg.hisuru.com>',
      to: email,
      subject: 'Verify Your Email - HiSuru',
      text: `Verify your email: ${verificationUrl}`,
      html: html
    });

    res.json({ success: true, messageId: result.id });
  } catch (error) {
    console.error('Verification email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Send team invitation
router.post('/send-invitation', async (req, res) => {
  try {
    const { email, inviterName, inviterEmail, teamName, role, permissions, inviteToken } = req.body;

    const invitationLink = `${process.env.FRONTEND_URL}/join-team?token=${inviteToken}&email=${encodeURIComponent(email)}`;
    const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString();

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 32px; border-radius: 12px 12px 0 0; text-align: center;">
          <div style="display: inline-block; background: rgba(255, 255, 255, 0.2); padding: 16px; border-radius: 50%; margin-bottom: 16px;">
            <span style="font-size: 24px; color: white;">👥</span>
          </div>
          <h1 style="font-size: 24px; font-weight: bold; color: white; margin: 0;">Team Invitation</h1>
          <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0;">Join ${teamName || 'the team'} on HiSuru</p>
        </div>

        <!-- Content -->
        <div style="background-color: white; padding: 32px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 16px;">
            You're invited to collaborate!
          </h2>
          
          <p style="color: #4b5563; line-height: 1.6; margin-bottom: 24px;">
            <strong>${inviterName}</strong> (${inviterEmail}) has invited you to join 
            <strong>${teamName || 'their team'}</strong> on HiSuru.
          </p>

          <!-- Invitation Details -->
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
            <h3 style="font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 12px;">Invitation Details:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; width: 120px;">Role:</td>
                <td style="padding: 8px 0; font-weight: 500; color: #1f2937;">
                  <span style="display: inline-block; padding: 4px 12px; background-color: #e0e7ff; color: #3730a3; border-radius: 4px; font-size: 14px;">
                    ${role}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Permissions:</td>
                <td style="padding: 8px 0; color: #1f2937;">
                  ${permissions?.map(p => `<span style="display: inline-block; padding: 2px 8px; background-color: #d1fae5; color: #065f46; border-radius: 4px; font-size: 12px; margin-right: 4px;">${p}</span>`).join('')}
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Expires:</td>
                <td style="padding: 8px 0; color: #1f2937;">${expiryDate}</td>
              </tr>
            </table>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 32px 0;">
            <a href="${invitationLink}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; text-decoration: none; font-weight: 600; font-size: 16px; padding: 16px 40px; border-radius: 8px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
              Accept Invitation
            </a>
          </div>

          <!-- Alternative Link -->
          <div style="background-color: #fef3c7; padding: 16px; border-radius: 6px; margin-top: 24px;">
            <p style="color: #92400e; font-size: 14px; margin: 0 0 8px 0; font-weight: 500;">
              🔗 Or copy this link:
            </p>
            <p style="background-color: white; padding: 12px; border-radius: 4px; font-family: monospace; font-size: 12px; color: #1f2937; word-break: break-all; margin: 0;">
              ${invitationLink}
            </p>
          </div>

          <!-- What's Next -->
          <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
            <h4 style="font-size: 16px; font-weight: 600; color: #1f2937; margin-bottom: 12px;">What happens next?</h4>
            <ul style="color: #4b5563; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Create your HiSuru account (if new)</li>
              <li style="margin-bottom: 8px;">Access shared tasks, meetings, and files</li>
              <li style="margin-bottom: 8px;">Collaborate with team members in real-time</li>
              <li>Get started with AI-powered productivity tools</li>
            </ul>
          </div>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding: 24px 0; color: #9ca3af; font-size: 12px;">
          <p style="margin: 0 0 8px 0;">This invitation expires in 7 days.</p>
          <p style="margin: 0;">© ${new Date().getFullYear()} HiSuru. All rights reserved.</p>
          <p style="margin: 8px 0 0 0; font-size: 11px;">
            <a href="${process.env.FRONTEND_URL}/privacy" style="color: #6b7280; text-decoration: underline;">Privacy Policy</a> • 
            <a href="mailto:support@hisuru.com" style="color: #6b7280; text-decoration: underline;">Contact Support</a>
          </p>
        </div>
      </div>
    `;

    const text = `
TEAM INVITATION - HiSuru

${inviterName} (${inviterEmail}) has invited you to join ${teamName || 'their team'} on HiSuru.

Invitation Details:
• Role: ${role}
• Permissions: ${permissions?.join(', ')}
• Expires: ${expiryDate}

Accept your invitation here:
${invitationLink}

What happens next?
1. Create your HiSuru account (if new)
2. Access shared tasks, meetings, and files
3. Collaborate with team members in real-time
4. Get started with AI-powered productivity tools

This invitation expires in 7 days.

---
HiSuru - All-in-one productivity platform
${process.env.FRONTEND_URL}
`;

    const result = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: `"${inviterName} via HiSuru" <invites@${process.env.MAILGUN_DOMAIN}>`,
      to: email,
      'h:Reply-To': inviterEmail,
      subject: `🎯 Invitation to join ${teamName || 'the team'} on HiSuru`,
      text: text,
      html: html,
      'o:tag': ['team-invitation', 'invite'],
      'o:tracking': true,
      'o:tracking-clicks': true,
      'o:tracking-opens': true
    });

    // Log the invitation in your database
    await saveInvitationToDatabase({
      email,
      inviterId: req.user?.id,
      inviterName,
      inviterEmail,
      teamName,
      role,
      permissions,
      inviteToken,
      invitationLink,
      mailgunMessageId: result.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.json({ 
      success: true, 
      messageId: result.id,
      invitationLink,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  } catch (error) {
    console.error('Invitation email error:', error);
    
    // Specific error handling
    if (error.message.includes('domain not found')) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email domain not verified. Please verify your domain in Mailgun.' 
      });
    }
    
    if (error.message.includes('Forbidden')) {
      return res.status(403).json({ 
        success: false, 
        error: 'Mailgun API key invalid or insufficient permissions.' 
      });
    }

    res.status(500).json({ 
      success: false, 
      error: 'Failed to send invitation email',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// // Helper function to save invitation to database
// async function saveInvitationToDatabase(invitationData) {
//   // Implement your database save logic here
//   // Example for Supabase:
//   /*
//   const { data, error } = await supabase
//     .from('team_invitations')
//     .insert([{
//       email: invitationData.email,
//       inviter_id: invitationData.inviterId,
//       team_name: invitationData.teamName,
//       role: invitationData.role,
//       permissions: invitationData.permissions,
//       invite_token: invitationData.inviteToken,
//       invitation_link: invitationData.invitationLink,
//       mailgun_message_id: invitationData.mailgunMessageId,
//       expires_at: invitationData.expiresAt,
//       status: 'sent'
//     }]);
//   */
// }

module.exports = router;