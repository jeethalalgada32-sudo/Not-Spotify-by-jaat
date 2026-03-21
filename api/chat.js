export default async function handler(req, res) {
  // Only POST allowed
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Only POST allowed" });
  }

  try {
    const { message, history } = req.body;

    // Check API key
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ reply: "❌ API key missing" });
    }

    // Prompt
    const prompt = `
User message: ${message}

Recent songs:
${history?.map(h => h.title).join(", ")}

Analyze user music taste.
Suggest songs.
Reply in cool Hinglish style 😎
`;

    // ✅ LATEST WORKING GEMINI MODEL
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log("Gemini RAW:", JSON.stringify(data));

    let reply = "😢 No response";

    // Handle success
    if (data.candidates && data.candidates.length > 0) {
      reply =
        data.candidates[0]?.content?.parts?.[0]?.text ||
        "😢 Empty reply";
    }

    // Handle error
    if (data.error) {
      reply = "❌ Gemini Error: " + data.error.message;
    }

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ reply: "💥 Server crashed" });
  }
      }
