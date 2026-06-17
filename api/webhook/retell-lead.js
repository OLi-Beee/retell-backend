// api/webhook/retell-lead.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { call_id, transcript, name, phone, notes } = req.body;

    // Extract lead info from conversation
    const leadName = name || extractName(transcript);
    const leadPhone = phone || extractPhone(transcript);
    const leadNotes = notes || extractNotes(transcript);

    if (!leadName || !leadPhone) {
      return res.status(400).json({ 
        error: 'Missing name or phone number',
        message: 'Sarah needs to collect both name and phone'
      });
    }

    // 1. Save to Google Sheet
    await saveToGoogleSheet(leadName, leadPhone, leadNotes, call_id);

    // 2. Send email notification
    await sendEmailNotification(leadName, leadPhone, leadNotes, call_id);

    // 3. Create contact in GoHighLevel
    await createGHLContact(leadName, leadPhone, leadNotes);

    return res.status(200).json({ 
      success: true,
      lead: { name: leadName, phone: leadPhone }
    });

  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Helper: Extract name from transcript
function extractName(transcript) {
  if (!transcript) return null;
  const match = transcript.match(/my name is ([A-Za-z\s]+)/i);
  return match ? match[1].trim() : null;
}

// Helper: Extract phone from transcript
function extractPhone(transcript) {
  if (!transcript) return null;
  const match = transcript.match(/\b(\d{3}[-.]?\d{3}[-.]?\d{4})\b/);
  return match ? match[1] : null;
}

// Helper: Extract additional notes
function extractNotes(transcript) {
  if (!transcript) return null;
  const match = transcript.match(/notes?:\s*(.+)/i);
  return match ? match[1].trim() : null;
}

// Save to Google Sheet
async function saveToGoogleSheet(name, phone, notes, callId) {
  const { GoogleSpreadsheet } = require('google-spreadsheet');
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
  
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  });

  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  
  await sheet.addRow({
    Date: new Date().toISOString(),
    Name: name,
    Phone: phone,
    Source: 'Retell AI Demo',
    Notes: notes || '',
    CallID: callId || ''
  });
}

// Send email notification
async function sendEmailNotification(name, phone, notes, callId) {
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to: 'info@mastervoiceautomation.com',
    from: 'leads@mastervoiceautomation.com',
    subject: '🆕 New Lead from AI Voice Demo!',
    html: `
      <h2>New Lead Captured by Sarah</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Notes:</strong> ${notes || 'None'}</p>
      <p><strong>Call ID:</strong> ${callId || 'N/A'}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <hr>
      <p><a href="https://app.retellai.com/calls/${callId}">View call recording</a></p>
    `
  };

  await sgMail.send(msg);
}

// Create contact in GoHighLevel
async function createGHLContact(name, phone, notes) {
  const response = await fetch('https://rest.gohighlevel.com/v1/contacts/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: name,
      phone: phone,
      customField: {
        source: 'Retell AI Demo',
        notes: notes || 'Captured via AI voice agent'
      },
      tags: ['ai-demo', 'retell-lead']
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GHL API error: ${error}`);
  }

  return await response.json();
}
