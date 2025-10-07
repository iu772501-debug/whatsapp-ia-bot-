// bot.js

import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

import fetch from "node-fetch";
import QRCode from "qrcode";
import fs from "fs";

const API_KEY = process.env.DEEPSEEK_API_KEY;
const MY_NUMBER = "59176997283@c.us";

const client = new Client({
  authStrategy: new LocalAuth({ clientId: "bot-ia" }),
});

let clientReady = false;

// Evento cuando el cliente está listo
client.on("ready", () => {
  console.log("✅ Bot conectado a WhatsApp y listo!");
  clientReady = true;
});

client.on("qr", async qr => {
  try {
    // Guardar QR como imagen nítida
    await QRCode.toFile('qrcode.png', qr, { width: 300 });
    console.log("✅ QR guardado como qrcode.png");

    // Espera a que el cliente esté listo antes de enviar
    const waitForReady = () =>
      new Promise(resolve => {
        if (clientReady) return resolve();
        client.on("ready", () => resolve());
      });

    await waitForReady();

    // Envía QR a tu WhatsApp
    await client.sendMessage(MY_NUMBER, fs.readFileSync("qrcode.png"), { caption: "📲 Tu QR para iniciar sesión" });
    console.log("✅ QR enviado a tu WhatsApp");
  } catch (err) {
    console.error("❌ Error generando o enviando QR:", err);
  }
});

let lastMessageTime = 0;
const COOLDOWN = 1000; // 1 segundo entre mensajes

client.on("message", async message => {
  if (Date.now() - lastMessageTime < COOLDOWN) return;
  lastMessageTime = Date.now();

  console.log(`💬 Mensaje recibido: ${message.body}`);

  try {
    // Llamada a DeepSeek
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

// Inicializa el bot
client.initialize();

