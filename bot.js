import pkg from "whatsapp-web.js";
import qrcode from "qrcode";
import fetch from "node-fetch";
const { Client, LocalAuth } = pkg;

// Inicializamos el cliente de WhatsApp
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  }
});

// Evento al generar el QR
client.on("qr", async (qr) => {
  console.log("📲 Generando QR...");

  try {
    // Generamos una imagen base64 del QR
    const qrImage = await qrcode.toDataURL(qr);

    // Enviamos el QR a tu webhook de n8n
    await fetch("https://bootrod.app.n8n.cloud/webhook-test/whatsapp-qr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ qr: qrImage })
    });

    console.log("✅ QR enviado correctamente a n8n.");
  } catch (error) {
    console.error("❌ Error enviando QR a n8n:", error);
  }
});

// Evento cuando el bot está listo
client.on("ready", () => {
  console.log("✅ Bot conectado a WhatsApp y listo!");
});

// Iniciamos el cliente
client.initialize();
