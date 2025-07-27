export async function callGemini(messages: { role: string; content: string }[]) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "X-goog-api-key": process.env.GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: messages.map(m => m.content).join("\n")
          }]
        }]
      }),
    }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const json = await res.json();
  
  if (!json.candidates?.[0]?.content?.parts?.[0]?.text) {
    console.error("Unexpected Gemini response format:", json);
    throw new Error("Invalid response format from Gemini API");
  }

  return json.candidates[0].content.parts[0].text;
}
  