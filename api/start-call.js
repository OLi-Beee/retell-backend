export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const response = await fetch("https://api.retellai.com/v2/create-web-call", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RETELL_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ agent_id: process.env.RETELL_AGENT_ID })
  });

  const data = await response.json();
  res.json({ access_token: data.access_token });
}
