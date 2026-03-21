export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Only POST allowed" });
  }

  try {
    const { message, history } = req.body;

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ reply: "API key missing 😢" });
    }

    const prompt = `
User message: ${message}

Recent songs:
${history?.map(h => h.title).join(", ")}

Analyze user vibe, suggest songs, and talk like a cool AI DJ in Hinglish 😎
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        // 🔥 FIXED MODEL (WORKING FREE)
        model: "openchat/openchat-3.5",
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    console.log("AI RAW:", JSON.stringify(data));

    let reply = "No response 😢";

    // ✅ SAFE RESPONSE PARSE
    if (data.choices && data.choices.length > 0) {
      reply =
        data.choices[0]?.message?.content ||
        data.choices[0]?.text ||
        "No text found 😢";
    } else if (data.error) {
      reply = "❌ API Error: " + data.error.message;
    } else {
      reply = "⚠️ Unknown response: " + JSON.stringify(data);
    }

    return res.status(200).json({ reply });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ reply: "Server crash 💥" });
  }
}
