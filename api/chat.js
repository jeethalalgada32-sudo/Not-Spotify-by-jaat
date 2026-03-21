export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Only POST allowed" });
  }

  try {
    const { message, history } = req.body;

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ reply: "API key missing 😢" });
    }

    // Build proper conversation history for context
    const conversationMessages = [];

    // System prompt — DJ AI personality
    const systemPrompt = `Tu ek cool AI DJ hai jiska naam "VibeBot" hai 🎧
Tu Hinglish mein baat karta hai — Hindi + English mix.
Tu user ka mood samajhta hai aur unke vibe ke hisaab se songs suggest karta hai.
Tu fun, energetic aur friendly hai — jaise ek best friend jo music ka expert ho.
Jab songs suggest kare toh format yeh ho:
🎵 Song Name - Artist Name
Har response mein 2-4 songs suggest kar aur thoda emotional/fun commentary bhi de.
Kabhi bhi robotic mat lagana — natural aur chill reh.`;

    // Add chat history as proper conversation
    if (history && history.length > 0) {
      history.slice(-6).forEach(h => {
        if (h.role === "user") {
          conversationMessages.push({ role: "user", content: h.content });
        } else if (h.role === "assistant") {
          conversationMessages.push({ role: "assistant", content: h.content });
        }
      });
    }

    // Add current user message
    conversationMessages.push({ role: "user", content: message });

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://your-site.vercel.app", // apna URL daal
        "X-Title": "VibeBot DJ"
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3.1-8b-instruct:free", // better free model
        messages: [
          { role: "system", content: systemPrompt },
          ...conversationMessages
        ],
        temperature: 0.85,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("API HTTP Error:", response.status, errText);
      return res.status(500).json({ reply: `API Error ${response.status} 😢` });
    }

    const data = await response.json();
    console.log("AI RAW:", JSON.stringify(data));

    let reply = "Kuch samajh nahi aaya, dobara try kar yaar 😅";

    if (data.choices && data.choices.length > 0) {
      reply = data.choices[0]?.message?.content || "No text found 😢";
    } else if (data.error) {
      reply = "❌ API Error: " + data.error.message;
    }

    return res.status(200).json({ reply });

  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ reply: "Server crash ho gaya 💥 Dobara try kar!" });
  }
}
