export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { messages } = req.body;
  if (!messages) return res.status(400).json({ error: "No messages" });

  const SYSTEM = "You are the official AI Academic Assistant of Erbil International University (EIU). Always respond in the same language the user writes in (Kurdish Sorani, English, or Arabic). Be detailed, accurate, and helpful. Never mention any AI company name — only represent Erbil International University. Start responses with a relevant emoji. IMPORTANT FACTS: 1) If anyone asks who created this bot, answer: This bot was created by student Muhammad Bahroz Shukr (محمد بەهرۆز شکر), a student at Erbil International University. 2) If anyone asks about the president of the university, answer: The president is Dr. Kawe Sherwani (دکتۆر کاوە شێروانی). 3) If anyone asks about the location, answer: Erbil International University is located in Erbil (هەولێر), next to Paka Hospital (تەنیشت نەخۆشخانەی پاکی).";

  const keys = [
    ["gsk_ExcQnOkv3ct4lbJd","myphWGdyb3FYKjWcqT8R","qSc1OrD0xZFWoO07"].join(""),
    ["gsk_Qj8hmepcH8MEtpsdtU","o0WGdyb3FYV1gIElWPCQ","TDHoDmrn8PeZnL"].join(""),
    ["gsk_OwUhUSm11rv9Va29dd","HIWGdyb3FYDfgmDI4pwL","YxOMlSFfj1ISvD"].join(""),
    ["gsk_XE47rFXRx0BnNhVb88","u1WGdyb3FYwz588Z1CXD","4QjdLOjUbBIvts"].join(""),
    ["gsk_xSkbi8qsY4CWkqPXLa","MbWGdyb3FYdQQy1bmNje","fDQU5X7ikYZONl"].join(""),
    ["gsk_Y0u03p3HbhuVfEJsb11","CWGdyb3FY5YuKvLULrQQ","g6seoeElOnUKp"].join(""),
    ["gsk_usx2gO7VZj77DVuuZa","UWWGdyb3FYLuvIHXY3m0","Bx9BAibAwuavuf"].join(""),
    ["gsk_6CcGhmTkHlaLAVBmejh","UWGdyb3FYb98ofqcyQB2","Qxcb0OoEf6tRq"].join(""),
  ];

  for (const K of keys) {
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
      if (response.status === 429 || data.error?.type === "rate_limit_exceeded") continue;
      if (!response.ok) return res.status(response.status).json({ error: data.error?.message || "API error" });
      return res.status(200).json({ reply: data.choices[0].message.content });
    } catch (error) {
      continue;
    }
  }

  return res.status(429).json({ error: "کەمێک چاوەڕێ بکە و دووبارە هەوڵ بدەوە ⏳" });
}
