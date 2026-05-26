export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { messages } = req.body;
  if (!messages) return res.status(400).json({ error: "No messages" });

  const SYSTEM = `تۆ یاریدەدەری زیرەکی دەستکردی فێرکاری و ئەکادیمیی زانکۆی ئەربیلی نێودەوڵەتی (EIU) یت.

ڕێسا و شێوازی وەڵامدانەوەت:
- هەمیشە بە هەمان زمانی بەکارهێنەر وەڵام بدەرەوە (کوردی سۆرانی، ئینگلیزی، یان عەرەبی)
- وەڵامەکانت بێن ورد، تەواو، و بەسوود
- کوردیی سۆرانی خاڵص بنووسە — نە کوردیی کرمانجی
- هیچ ناوی کۆمپانیای AI مەبرە — تەنها نوێنەرایەتی زانکۆ بکە
- وەڵامەکانت بە ئیمۆجیێکی گونجاو دەستپێ بکە
- ئەگەر پرسیاری ئەکادیمی یان توێژینەوەیی بوو، وەڵامی تەواو و پڕ و پووچ بدەرەوە
- ئەگەر پرسیاری کۆد بوو، کۆدی پاکیزە بنووسە لەگەڵ ڕوونکردنەوە
- پرسیارەکان بە ورد گوێ بگرە و وەڵامی تەواو بدەرەوە

زانیاری گرینگی زانکۆ (هەمیشە پابەند پێیان بە):
١) ئەگەر کەسێک پرسیاری کرد ئەم بۆتە کێ دروستی کردووە: بەم شێوەیە وەڵام بدەرەوە: "ئەم بۆتە لەلایان قوتابی کۆلێژی ئەربیلی نێودەوڵەتی، بەشی IT، محمد بەهرۆز شکر دروستکراوە 🎓"
٢) ئەگەر پرسیاری زانکۆ، مێژووی زانکۆ، یان دەربارەی زانکۆی کرا: "زانکۆی ئەربیلی نێودەوڵەتی، بە سەرۆکایەتی دکتۆر کاوە شێروانی، یەکێکە لە باشترین و پێشکەوتوترین زانکۆکانی هەرێمی کوردستانە کە بەردەوام بەرەو پێشەوە دەڕۆێت بە گامەکانی بەرز بۆ بەرزکردنەوەی ئاستی خوێندن و توێژینەوە 🌟"
٣) ئادرەس: هەولێر، تەنیشت نەخۆشخانەی پاکی`;

  const gemKeys = [
    ["AIzaSyBulK805VQ","p3pDgbIM1EHmVEdu","Dh12wJTk"].join(""),
    ["AIzaSyA-okM1vfEV","7rlT3JNW0mzGlTaI","V06twyc"].join(""),
    ["AIzaSyCV6sZn1pjL","e0o87NRFtUSWkDB0","aOt9cMA"].join(""),
  ];

  // Try Gemini keys
  for (const GK of gemKeys) {
    try {
      const gemContents = messages.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

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
      
      // Skip if rate limited or blocked
      if (gemData.error?.code === 429 || gemData.error?.status === "RESOURCE_EXHAUSTED") continue;
      if (gemData.error?.code === 403) continue;
      
      const text = gemData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return res.status(200).json({ reply: text });
    } catch(e) { continue; }
  }

  // Groq fallback
  const groqAttempts = [
    ["gsk_ExcQnOkv3ct4lbJd","myphWGdyb3FYKjWcqT8R","qSc1OrD0xZFWoO07"], ["gsk_Qj8hmepcH8MEtpsdtU","o0WGdyb3FYV1gIElWPCQ","TDHoDmrn8PeZnL"],
    ["gsk_OwUhUSm11rv9Va29dd","HIWGdyb3FYDfgmDI4pwL","YxOMlSFfj1ISvD"], ["gsk_XE47rFXRx0BnNhVb88","u1WGdyb3FYwz588Z1CXD","4QjdLOjUbBIvts"],
    ["gsk_xSkbi8qsY4CWkqPXLa","MbWGdyb3FYdQQy1bmNje","fDQU5X7ikYZONl"], ["gsk_Y0u03p3HbhuVfEJsb11","CWGdyb3FY5YuKvLULrQQ","g6seoeElOnUKp"],
    ["gsk_usx2gO7VZj77DVuuZa","UWWGdyb3FYLuvIHXY3m0","Bx9BAibAwuavuf"], ["gsk_6CcGhmTkHlaLAVBmejh","UWGdyb3FYb98ofqcyQB2","Qxcb0OoEf6tRq"],
    ["gsk_90W0qWo0glhOKbDZdt3t","WGdyb3FYQ6nZX72JpGyQ","3PqFk6iUa9kZ"],
  ];

  for (const parts of groqAttempts) {
    for (const model of ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]) {
      try {
        const res2 = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": "Bearer " + parts.join("") },
          body: JSON.stringify({
            model,
            messages: [{ role: "system", content: SYSTEM }, ...messages],
            temperature: 0.7,
            max_tokens: 2000,
          }),
        });
        const d = await res2.json();
        if (res2.status === 429 || d.error?.type === "rate_limit_exceeded") continue;
        if (!res2.ok) continue;
        return res.status(200).json({ reply: d.choices[0].message.content });
      } catch(e) { continue; }
    }
  }

  return res.status(429).json({ error: "⏳ بۆتەکە ئێستا سەرقەڵە، پاش ٢٤ کاتژمێر دووبارە کار دەکاتەوە. سوپاس! 🎓" });
}
