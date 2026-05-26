export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { messages } = req.body;
  if (!messages) return res.status(400).json({ error: "No messages" });

  const SYSTEM = `You are the official AI Academic Assistant of Erbil International University (EIU).

LANGUAGE: Always respond in the SAME language the user writes in:
- Kurdish text → respond in Kurdish Sorani (سۆرانی) only, use proper Sorani words
- English text → respond in English only  
- Arabic text → respond in Arabic only

RESPONSE QUALITY:
- For reports, essays, research: write LONG, DETAILED, COMPREHENSIVE responses with proper structure (introduction, main sections, conclusion, references)
- For code: write complete working code with explanations
- For questions: give thorough, well-explained answers
- NEVER give short or incomplete responses when detailed content is requested
- Use proper headings, bullet points, and structure

IMPORTANT FACTS:
1) Bot creator: ئەم بۆتە لەلایان قوتابی کۆلێژی ئەربیلی نێودەوڵەتی، بەشی IT، محمد بەهرۆز شکر دروستکراوە
2) University president: دکتۆر کاوە شێروانی  
3) Location: هەولێر، تەنیشت نەخۆشخانەی پاکی`;
  const dec = (s) => s.split(',').map(n => String.fromCharCode(parseInt(n)^42)).join('');

  const gemKeys = ["107,99,80,75,121,83,104,95,70,97,18,26,31,124,123,90,25,90,110,77,72,99,103,27,111,98,71,124,111,78,95,110,66,27,24,93,96,126,65",
    "107,99,80,75,121,83,107,7,69,65,103,27,92,76,111,124,29,88,70,126,25,96,100,125,26,71,80,109,70,126,75,99,124,26,28,94,93,83,73",
    "107,99,80,75,121,83,105,124,28,89,112,68,27,90,64,102,79,26,69,18,29,100,120,108,94,127,121,125,65,110,104,26,75,101,94,19,73,103,107",
    "107,99,80,75,121,83,110,117,26,125,27,92,67,110,95,83,92,124,102,7,7,117,117,98,31,99,93,91,123,100,108,93,25,68,26,69,94,104,73",
    "107,99,80,75,121,83,105,121,104,117,79,30,70,88,109,100,124,97,111,112,18,19,83,28,97,99,30,69,127,101,114,75,64,98,112,31,77,68,127",
    "107,99,80,75,121,83,107,114,88,66,105,123,76,104,108,70,123,75,75,27,73,68,121,100,114,88,79,31,124,18,93,95,19,123,71,7,120,117,103"].map(dec).sort(()=>Math.random()-0.5);
  const groqKeys = ["77,89,65,117,111,82,73,123,68,101,65,92,25,73,94,30,70,72,96,78,71,83,90,66,125,109,78,83,72,25,108,115,97,64,125,73,91,126,18,120,91,121,73,27,101,88,110,26,82,112,108,125,69,101,26,29",
    "77,89,65,117,123,64,18,66,71,79,90,73,98,18,103,111,94,90,89,78,94,127,69,26,125,109,78,83,72,25,108,115,124,27,77,99,111,70,125,122,105,123,126,110,98,69,110,71,88,68,18,122,79,112,68,102",
    "77,89,65,117,101,93,127,66,127,121,71,27,27,88,92,19,124,75,24,19,78,78,98,99,125,109,78,83,72,25,108,115,110,76,77,71,110,99,30,90,93,102,115,82,101,103,70,121,108,76,64,27,99,121,92,110",
    "77,89,65,117,114,111,30,29,88,108,114,120,82,26,104,68,100,66,124,72,18,18,95,27,125,109,78,83,72,25,108,115,93,80,31,18,18,112,27,105,114,110,30,123,64,78,102,101,64,127,72,104,99,92,94,89",
    "77,89,65,117,82,121,65,72,67,18,91,89,115,30,105,125,65,91,122,114,102,75,103,72,125,109,78,83,72,25,108,115,78,123,123,83,27,72,71,100,64,79,76,110,123,127,31,114,29,67,65,115,112,101,100,70",
    "77,89,65,117,115,26,95,26,25,90,25,98,72,66,95,124,76,111,96,89,72,27,27,105,125,109,78,83,72,25,108,115,31,115,95,97,92,102,127,102,88,123,123,77,28,89,79,69,79,111,70,101,68,127,97,90",
    "77,89,65,117,95,89,82,24,77,101,29,124,112,64,29,29,110,124,95,95,112,75,127,125,125,109,78,83,72,25,108,115,102,95,92,99,98,114,115,25,71,26,104,82,19,104,107,67,72,107,93,95,75,92,95,76",
    "77,89,65,117,28,105,73,109,66,71,126,65,98,70,75,102,107,124,104,71,79,64,66,127,125,109,78,83,72,25,108,115,72,19,18,69,76,91,73,83,123,104,24,123,82,73,72,26,101,69,111,76,28,94,120,91",
    "77,89,65,117,19,26,125,26,91,125,69,26,77,70,66,101,97,72,110,112,78,94,25,94,125,109,78,83,72,25,108,115,123,28,68,112,114,29,24,96,90,109,83,123,25,122,91,108,65,28,67,127,75,19,65,112"].map(dec).sort(()=>Math.random()-0.5);

  // 1. Cloudflare Workers AI (TEST - first)
  try {
    const cfRes = await fetch(
      "https://api.cloudflare.com/client/v4/accounts/" + dec("73,27,72,26,72,78,19,30,76,31,29,78,78,18,76,19,28,76,24,25,73,31,75,18,27,76,30,75,31,28,29,26") + "/ai/run/@cf/meta/llama-3.1-70b-instruct",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + dec("73,76,75,94,117,77,93,121,25,83,107,91,80,112,108,126,29,92,101,77,96,112,72,26,26,28,24,27,109,107,115,77,105,79,26,30,67,110,25,98,31,89,115,126,115,30,24,18,72,73,18,73,79"),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ messages: [{role:"system",content:SYSTEM},...messages], max_tokens: 4096 })
      }
    );
    const cfData = await cfRes.json();
    const cfText = cfData.result?.response;
    if (cfText) return res.status(200).json({ reply: "🔵 " + cfText });
  } catch(e) {}

  // 2. Gemini Flash
  const gemContents = messages.map(m => ({role: m.role==="assistant"?"model":"user", parts:[{text:m.content}]}));
  for (const GK of gemKeys) {
    try {
      const gr = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key="+GK,
        {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({system_instruction:{parts:[{text:SYSTEM}]},contents:gemContents,generationConfig:{temperature:0.7,maxOutputTokens:8000}})}
      );
      const gd = await gr.json();
      if (gd.error?.code===429||gd.error?.status==="RESOURCE_EXHAUSTED") continue;
      if (gd.error) continue;
      const t = gd.candidates?.[0]?.content?.parts?.[0]?.text;
      if (t) return res.status(200).json({ reply: t });
    } catch(e) { continue; }
  }

  // 3. Groq
  for (const K of groqKeys) {
    for (const model of ["llama-3.3-70b-versatile","llama-3.1-8b-instant"]) {
      try {
        const r2 = await fetch("https://api.groq.com/openai/v1/chat/completions",
          {method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+K},body:JSON.stringify({model,messages:[{role:"system",content:SYSTEM},...messages],temperature:0.7,max_tokens:4000})}
        );
        const d2 = await r2.json();
        if (r2.status===429||d2.error?.type==="rate_limit_exceeded") continue;
        if (!r2.ok) continue;
        return res.status(200).json({ reply: d2.choices[0].message.content });
      } catch(e) { continue; }
    }
  }

  return res.status(429).json({ error: "⏳ بۆتەکە ئێستا سەرقەڵە، کەمێک چاوەڕێ بکە و دووبارە هەوڵ بدەوە! 🎓" });
}
