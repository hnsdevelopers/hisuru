// src/pages/api/test-email.js (for Next.js) or similar backend endpoint
import fetch from 'node-fetch';
import FormData from 'form-data';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { to, from, subject, text, apiKey, domain } = req.body;

    const formData = new FormData();
    formData.append('from', `HiSuru <${from}>`);
    formData.append('to', to);
    formData.append('subject', subject);
    formData.append('text', text);

    const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`,
      },
      body: formData,
    });

    if (response.ok) {
      res.status(200).json({ success: true, message: `Test email sent successfully to ${to}` });
    } else {
      const error = await response.text();
      res.status(500).json({ success: false, error });
    }
  } catch (error) {
    console.error('Mailgun error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}