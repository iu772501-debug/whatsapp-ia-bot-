import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import QRCode from "qrcode";
import fetch from "node-fetch";

// Tu API Key de DeepSeek desde variable de entorno
const API_KEY = process.env.DEEPSEEK_API_KEY;

const client = new Client({
  authStrategy: new LocalAuth({ clientId: "bot-ia" }), // sesión persistente
});

client.on("qr", async qr => {
  try {
    // Genera QR nítido en consola y en PNG
    console.log("📲 Escanea este QR con tu WhatsApp:");
    QRCode.toString(qr, { type: 'terminal', small: false }, (err, url) => {
      if (err) console.error("❌ Error QR consola:", err);
      else console.log(url);
    });
    await QRCode.toFile('qrcode.png', qr, { width: 300 });
    console.log("✅ QR también generado en qrcode.png");
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
            content: "Eres el asistente con IA de Rodrigo. Representas a TechArt y respondes siempre en tono profesional, claro y útil."
          },
          { role: "user", content: message.body }
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Lo siento, no pude generar una respuesta.";

    await message.reply(reply);
    console.log("🤖 Respondí:", reply);

  } catch (error) {
    console.error("❌ Error al procesar mensaje:", error);
    await message.reply("Lo siento, hubo un error al procesar tu mensaje.");
  }
});

client.initialize();
