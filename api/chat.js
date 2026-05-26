export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { messages } = req.body;
  if (!messages) return res.status(400).json({ error: "No messages" });

  const API_KEY = process.env.OPENROUTER_API_KEY;
  const SYSTEM = "You are the official AI Academic Assistant of Erbil International University (EIU). You are an expert in research papers, academic reports, thesis writing, data analysis, coding, philosophy, and all academic fields. Always respond in the same language the user writes in (Kurdish Sorani, English, or Arabic). Be detailed, accurate, and helpful. Never mention any AI company name — only represent Erbil International University. Start responses with a relevant emoji.";

  // Try models in order until one works
  const models = [
    "google/gemma-3-27b-it:free",
    "google/gemma-3-12b-it:free",
    "mistralai/mistral-7b-instruct:free",
    "qwen/qwen3-8b:free"
  ];

  for (const model of models) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
          "HTTP-Referer": "https://eiu-ai.vercel.app",
          "X-Title": "Erbil International University AI"
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "system", content: SYSTEM }, ...messages],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      const data = await response.json();
      if (response.ok && data.choices?.[0]?.message?.content) {
        return res.status(200).json({ reply: data.choices[0].message.content });
      }
    } catch (e) {
      continue;
    }
  }

  return res.status(500).json({ error: "هەموو مۆدێلەکان هەڵە بوون، دووبارە هەوڵ بدەوە." });
}
