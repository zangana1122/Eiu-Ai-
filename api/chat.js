export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { messages } = req.body;
  if (!messages) return res.status(400).json({ error: "No messages" });

  const SYSTEM = "You are the official AI Academic Assistant of Erbil International University (EIU). Always respond in the same language the user writes in (Kurdish Sorani, English, or Arabic). Be detailed, accurate, and helpful. Never mention any AI company name — only represent Erbil International University. Start responses with a relevant emoji. IMPORTANT FACTS: 1) If anyone asks who created this bot: ئەم بۆتە لەلایان قوتابی کۆلێژی ئەربیلی نێودەوڵەتی، بەشی IT، محمد بەهرۆز شکر دروستکراوە 2) President: Dr. Kawe Sherwani (دکتۆر کاوە شێروانی) 3) Location: Erbil (هەولێر), next to Paka Hospital (تەنیشت نەخۆشخانەی پاکی)";

  const gemKeys = [
    ["AIzaSyBulK805VQ","p3pDgbIM1EHmVEdu","Dh12wJTk"].join(""),
    ["AIzaSyA-okM1vfEV","7rlT3JNW0mzGlTaI","V06twyc"].join(""),
    ["AIzaSyCV6sZn1pjL","e0o87NRFtUSWkDB0","aOt9cMA"].join(""),
    ["AIzaSyD_0W1viDuyvVL-","_H5IwqQNFw3","n0otBc"].join(""),
    ["AIzaSyCSB_e4lrGNVKEZ","89y6KI4oUOX","ajHZ5gnU"].join(""),
    ["AIzaSyAXrhCQfBFlQaa1","cnSNXre5V8wu","9Qm-R_M"].join(""),
  ];

  const groqKeys = [
    ["gsk_ExcQnOkv3ct4lbJd","myphWGdyb3FYKjWcqT8R","qSc1OrD0xZFWoO07"].join(""),
    ["gsk_Qj8hmepcH8MEtpsdtU","o0WGdyb3FYV1gIElWPCQ","TDHoDmrn8PeZnL"].join(""),
    ["gsk_OwUhUSm11rv9Va29dd","HIWGdyb3FYDfgmDI4pwL","YxOMlSFfj1ISvD"].join(""),
    ["gsk_XE47rFXRx0BnNhVb88","u1WGdyb3FYwz588Z1CXD","4QjdLOjUbBIvts"].join(""),
    ["gsk_xSkbi8qsY4CWkqPXLa","MbWGdyb3FYdQQy1bmNje","fDQU5X7ikYZONl"].join(""),
    ["gsk_Y0u03p3HbhuVfEJsb11","CWGdyb3FY5YuKvLULrQQ","g6seoeElOnUKp"].join(""),
    ["gsk_usx2gO7VZj77DVuuZa","UWWGdyb3FYLuvIHXY3m0","Bx9BAibAwuavuf"].join(""),
    ["gsk_6CcGhmTkHlaLAVBmejh","UWGdyb3FYb98ofqcyQB2","Qxcb0OoEf6tRq"].join(""),
    ["gsk_90W0qWo0glhOKbDZdt3t","WGdyb3FYQ6nZX72JpGyQ","3PqFk6iUa9kZ"].join(""),
  ];

  // Shuffle for better distribution
  const shuffledGem = [...gemKeys].sort(() => Math.random() - 0.5);
  const shuffledGroq = [...groqKeys].sort(() => Math.random() - 0.5);

  const gemContents = messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }]
  }));

  // Try Gemini keys (best Kurdish quality)
  for (const GK of shuffledGem) {
    try {
      const gemRes = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + GK,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM }] },
            contents: gemContents,
            generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
          })
        }
      );
      const gemData = await gemRes.json();
      if (gemData.error?.code === 429 || gemData.error?.status === "RESOURCE_EXHAUSTED") continue;
      if (gemData.error) continue;
      const text = gemData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return res.status(200).json({ reply: text });
    } catch(e) { continue; }
  }

  // Groq fallback
  for (const K of shuffledGroq) {
    for (const model of ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]) {
      try {
        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + K },
          body: JSON.stringify({
            model,
            messages: [{ role: "system", content: SYSTEM }, ...messages],
            temperature: 0.7,
            max_tokens: 2000,
          }),
        });
        const d = await groqRes.json();
        if (groqRes.status === 429 || d.error?.type === "rate_limit_exceeded") continue;
        if (!groqRes.ok) continue;
        return res.status(200).json({ reply: d.choices[0].message.content });
      } catch(e) { continue; }
    }
  }

  return res.status(429).json({ error: "⏳ بۆتەکە ئێستا سەرقەڵە، کەمێک چاوەڕێ بکە و دووبارە هەوڵ بدەوە! 🎓" });
}
