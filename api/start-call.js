export default async function handler(req, res) {
  // 1. Handle CORS Preflight
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // 2. Enforce POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    // 3. Forward request to Retell AI
    const response = await fetch("https://api.retellai.com/v2/create-web-call", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RETELL_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        agent_id: process.env.RETELL_AGENT_ID
      })
    });

    const data = await response.json();

    // 4. Check if Retell returned an API error
    if (!response.ok) {
      console.error("Retell API Error Payload:", data);
      return res.status(response.status).json({ 
        error: "Retell API failed to generate session", 
        details: data 
      });
    }

    // 5. Send back the clean token to Framer
    return res.status(200).json({ access_token: data.access_token });

  } catch (error) {
    console.error("Serverless Function Crash:", error);
    return res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
}
