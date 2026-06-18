export default async function handler(req, res) {
    // CORS headers — allow all origins
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")

    // Handle preflight
    if (req.method === "OPTIONS") {
        return res.status(200).end()
    }

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" })
    }

    try {
        const { agent_id } = req.body

        if (!agent_id) {
            return res.status(400).json({ error: "agent_id is required" })
        }

        const response = await fetch("https://api.retellai.com/v2/create-web-call", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.RETELL_API_KEY}`,
            },
            body: JSON.stringify({ agent_id }),
        })

        if (!response.ok) {
            const error = await response.text()
            console.error("Retell API error:", error)
            return res.status(response.status).json({ error })
        }

        const data = await response.json()
        return res.status(200).json(data)
    } catch (error) {
        console.error("Handler error:", error)
        return res.status(500).json({ error: error.message })
    }
}
