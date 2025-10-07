// bot.js

import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

import fetch from "node-fetch";
import QRCode from "qrcode"; // usamos qrcode para imagen
import fs from "fs";

const API_KEY = process.env.DEEPSEEK_API_KEY;

// Inicializa el cliente de WhatsApp
const client = new Client({
  authStrategy: new LocalAuth({ clientId: "bot-ia" }), // mantiene sesión separada
});

client.on("qr", async qr => {
  console.log("📲 Se generó un QR, guardando como qrcode.png ...");

  try {
    await QRCode.toFile('qrcode.png', qr, { width: 200 }); // tamaño cómodo
    console.log("✅ QR guardado en qrcode.png. Descárgalo y escanéalo con tu WhatsApp.");
  } catch (err) {
    console.error("❌ Error generando QR:", err);
  }
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
