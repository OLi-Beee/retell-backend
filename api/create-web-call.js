// api/create-web-call.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { agent_id } = req.body;

    if (!agent_id) {
      return res.status(400).json({ error: 'agent_id is required' });
    }

    // Create a web call using Retell API
    const response = await fetch('https://api.retellai.com/create-web-call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id: agent_id,
        // Optional: add any custom parameters here
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Retell API error: ${error}`);
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Error creating web call:', error);
    return res.status(500).json({ error: error.message });
  }
}
