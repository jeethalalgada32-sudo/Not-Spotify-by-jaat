export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { prompt } = req.body;
  const HF_KEY = process.env.HF_KEY;
  console.log("KEY EXISTS:", !!HF_KEY, "LENGTH:", HF_KEY?.length);
  console.log("PROMPT:", prompt);
  try {
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-dev",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ inputs: prompt })
      }
    );
    console.log("STATUS:", response.status);
    if (!response.ok) {
      const err = await response.text();
      console.error("ERROR:", err);
      return res.status(500).json({ error: err });
    }
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    return res.status(200).json({ image: `data:image/jpeg;base64,${base64}` });
  } catch(e) {
    console.error("CATCH:", e.message);
    return res.status(500).json({ error: e.message });
  }
        }
