export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Only POST allowed" });
  }

  try {
    const { message, history } = req.body;

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ reply: "⚠️ API key missing. Please contact admin." });
    }

    const conversationMessages = [];

    const systemPrompt = `You are VibeBot 🎧 — an AI music companion and DJ.
You speak in a cool, friendly, and professional tone with a mix of English and casual Hinglish.
Your job is to understand the user's mood and suggest perfect songs accordingly.
When suggesting songs, always use this format:
🎵 Song Name - Artist Name
Suggest 2-4 songs per response with a short vibe check commentary.
Keep it natural, fun, and never robotic.`;

    if (history && history.length > 0) {
      history.slice(-6).forEach(h => {
        if (h.role === "user") {
          conversationMessages.push({ role: "user", content: h.content });
        } else if (h.role === "assistant") {
          conversationMessages.push({ role: "assistant", content: h.content });
        }
      });
    }

    conversationMessages.push({ role: "user", content: message });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://your-site.vercel.app",
        "X-Title": "VibeBot DJ"
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationMessages
        ],
        temperature: 0.85,
        max_tokens: 500
      })
    });

    // Log full error from OpenRouter
    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter Error:", response.status, errText);
      return res.status(500).json({ 
        reply: `❌ API Error ${response.status}: ${errText}` 
      });
    }

    const data = await response.json();
    console.log("AI RAW:", JSON.stringify(data));

    let reply = "Hmm, couldn't get a response. Please try again! 😅";

    if (data.choices && data.choices.length > 0) {
      reply = data.choices[0]?.message?.content || "No text found 😢";
    } else if (data.error) {
      reply = "❌ API Error: " + data.error.message;
    }

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ reply: "⚠️ Server error. Please try again later." });
  }
}
