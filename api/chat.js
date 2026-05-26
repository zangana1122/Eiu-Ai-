export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { messages } = req.body;
  if (!messages) return res.status(400).json({ error: "No messages" });

  const parts = ["gsk_ExcQnOkv3ct4lbJd", "myphWGdyb3FYKjWcqT8R", "qSc1OrD0xZFWoO07"];
  const K = process.env.GROQ_API_KEY || parts.join("");
  const SYSTEM = "You are the official AI Academic Assistant of Erbil International University (EIU). Always respond in the same language the user writes in (Kurdish Sorani, English, or Arabic). Be detailed, accurate, and helpful. Never mention any AI company name — only represent Erbil International University. Start responses with a relevant emoji.";

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + K,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: SYSTEM }, ...messages],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "API error" });
    }
    return res.status(200).json({ reply: data.choices[0].message.content });
  } catch (error) {
    return res.status(500).json({ error: "Server error: " + error.message });
  }
}
