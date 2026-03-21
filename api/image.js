export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { prompt } = req.body;
  const HF_KEY = "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";

  console.log("Starting image generation for:", prompt);

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2-1",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_KEY}`,
          "Content-Type": "application/json",
          "x-wait-for-model": "true"
        },
        body: JSON.stringify({ inputs: prompt })
      }
    );

    console.log("HF Response status:", response.status);

    if (!response.ok) {
      const err = await response.text();
      console.error("HF Error:", err);
      return res.status(500).json({ error: err });
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    console.log("Image generated successfully!");
    return res.status(200).json({ image: `data:image/jpeg;base64,${base64}` });

  } catch(e) {
    console.error("Catch error:", e.message);
    return res.status(500).json({ error: e.message });
  }
}
