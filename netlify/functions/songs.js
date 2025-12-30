const { neon } = require('@neondatabase/serverless');

exports.handler = async (event, context) => {
  const sql = neon(process.env.NETLIFY_DATABASE_URL);
  try {
    await sql`CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        video_id TEXT NOT NULL,
        thumbnail TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body);
      await sql`INSERT INTO favorites (title, video_id, thumbnail) VALUES (${data.title}, ${data.videoId}, ${data.thumbnail})`;
      return { statusCode: 200, body: JSON.stringify({ message: "Song Saved!" }) };
    }

    const rows = await sql`SELECT * FROM favorites ORDER BY created_at DESC LIMIT 20`;
    return { statusCode: 200, body: JSON.stringify(rows) };
  } catch (error) {
    return { statusCode: 500, body: String(error) };
  }
};
