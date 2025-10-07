// test.js
import fetch from "node-fetch"; // Si usas Node 18+ puedes quitar esta línea

const API_KEY = "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"; // coloca tu clave aquí

async function testDeepSeek() {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-chat", // modelo gratuito
      messages: [
        { role: "system", content: "Eres un asistente útil y profesional." },
        { role: "user", content: "Hola DeepSeek, responde con un chiste corto." }
      ]
    })
  });

  const data = await response.json();
  console.log("✅ Respuesta de DeepSeek:\n");
  console.log(data.choices[0].message.content);
}

testDeepSeek().catch(console.error);
