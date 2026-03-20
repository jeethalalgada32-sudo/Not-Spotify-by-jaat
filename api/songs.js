export default async function handler(req, res) {
  const { neon } = require('@neondatabase/serverless');
  const sql = neon(process.env.NETLIFY_DATABASE_URL);

  try {
    await sql`CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        video_id TEXT NOT NULL,
        thumbnail TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    if (req.method === "POST") {
      const data = req.body;

      await sql`
        INSERT INTO favorites (title, video_id, thumbnail)
        VALUES (${data.title}, ${data.videoId}, ${data.thumbnail})
      `;

      return res.status(200).json({ message: "Song Saved!" });
    }

    const rows = await sql`
      SELECT * FROM favorites
      ORDER BY created_at DESC
      LIMIT 20
    `;

    return res.status(200).json(rows);

  } catch (error) {
    return res.status(500).json({ error: String(error) });
  }
}
