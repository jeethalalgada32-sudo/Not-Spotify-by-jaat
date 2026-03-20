export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Only POST allowed" });
    }

    try {
        const { message, history } = req.body;

        const prompt = `
User message: ${message}

Recent songs:
${history?.map(h => h.title).join(", ")}

Analyze:
- user music taste
- suggest songs
- describe vibe

Keep it short and smart.
`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        const data = await response.json();

        const reply =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "No response";

        res.status(200).json({ reply });

    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
}
