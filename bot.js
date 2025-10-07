import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

import qrcode from "qrcode-terminal";

const client = new Client({
  authStrategy: new LocalAuth({ clientId: "bot-ia" }),
});

client.on("qr", qr => {
  console.log("📲 Escanea este QR con tu WhatsApp:");

  // QR grande y nítido en la terminal
  qrcode.generate(qr, { small: false }); // false -> QR grande y legible
});

client.on("ready", () => {
  console.log("✅ Bot conectado a WhatsApp y listo!");
});

client.initialize();
