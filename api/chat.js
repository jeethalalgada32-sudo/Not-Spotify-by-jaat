export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Only POST allowed" });
    }

    try {
        const { message, history } = req.body;

        // 🔐 Check API Key
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ reply: "API key missing 😢" });
        }

        // 🧠 Smart Prompt
        const prompt = `
User message: ${message}

Recent songs:
${history?.map(h => h.title).join(", ")}

Do this:
- Analyze user's music taste
- Suggest 3 songs
- Describe vibe in Hinglish (cool style)

Keep answer short and clean.
`;

        // 🤖 Gemini API Call
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: prompt }]
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        console.log("Gemini RAW:", JSON.stringify(data));

        let reply = "No response 😢";

        if (data.candidates && data.candidates.length > 0) {
            reply =
                data.candidates[0]?.content?.parts?.[0]?.text || reply;
        } else if (data.error) {
            reply = "Gemini Error: " + data.error.message;
        }

        return res.status(200).json({ reply });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ reply: "Server crash 💥" });
    }
}
