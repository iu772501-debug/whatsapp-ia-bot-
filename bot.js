// bot.js

import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

import fetch from "node-fetch";
import qrcode from "qrcode-terminal";

const API_KEY = process.env.DEEPSEEK_API_KEY;

// Inicializa el cliente de WhatsApp
const client = new Client({
  authStrategy: new LocalAuth({ clientId: "bot-ia" }), // mantiene sesión separada
});

client.on("qr", qr => {
  console.log("📲 Escanea este QR con tu WhatsApp:");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("✅ Bot conectado a WhatsApp y listo!");
});

let lastMessageTime = 0;
const COOLDOWN = 1000; // 1 segundo entre mensajes

client.on("message", async message => {
  if (Date.now() - lastMessageTime < COOLDOWN) return;
  lastMessageTime = Date.now();

  console.log(`💬 Mensaje recibido: ${message.body}`);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [
          {
            role: "system",
            content: "Eres el asistente con inteligencia artificial de Rodrigo. Representas a TechArt y respondes siempre en tono profesional, claro y útil."
          },
          {
            role: "user",
            content: message.body
          }
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Lo siento, no pude generar una respuesta.";

    await message.reply(reply);
    console.log("🤖 Respondí:", reply);

  } catch (error) {
    console.error("❌ Error al procesar el mensaje:", error);
    await message.reply("Lo siento, hubo un error al procesar tu mensaje.");
  }
});

client.initialize();

