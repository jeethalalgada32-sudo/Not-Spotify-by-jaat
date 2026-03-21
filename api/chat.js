export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Only POST allowed" });
  }

  try {
    const { message, history } = req.body;

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ reply: "API key missing." });
    }

    const conversationMessages = [];

    const systemPrompt = `You are VibeBot — an AI music assistant.
Understand the user's mood and suggest exactly 3 songs.
Response format — follow this exactly:

[One short line about their mood]

🎵 Song Name - Artist
🎵 Song Name - Artist
🎵 Song Name - Artist

Strict rules:
- No markdown — no **, no __, no # headers
- No citation numbers like [1][2][3]
- No "Vibe check:" labels
- No long paragraphs
- Short mood line only — max 10 words
- Real songs only`;

    if (history && history.length > 0) {
      history.slice(-6).forEach(h => {
        if (h.role === "user") conversationMessages.push({ role: "user", content: h.content });
        else if (h.role === "assistant") conversationMessages.push({ role: "assistant", content: h.content });
      });
    }

    conversationMessages.push({ role: "user", content: message });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://your-site.vercel.app",
        "X-Title": "VibeBot"
      },
      body: JSON.stringify({
        model: "openrouter/auto",
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationMessages
        ],
        temperature: 0.7,
        max_tokens: 200
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter Error:", response.status, errText);
      return res.status(500).json({ reply: `API Error ${response.status}` });
    }

    const data = await response.json();
    let reply = "Couldn't get a response. Try again!";

    if (data.choices && data.choices.length > 0) {
      reply = data.choices[0]?.message?.content || reply;
      // Remove any markdown server-side too
      reply = reply.replace(/\*\*/g, "").replace(/\*/g, "").replace(/\[(\d+)\]/g, "");
    } else if (data.error) {
      reply = "API Error: " + data.error.message;
    }

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ reply: "Server error. Please try again." });
  }
}
