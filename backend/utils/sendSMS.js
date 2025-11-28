const venom = require('venom-bot');

let client; // store client globally

const initClient = async () => {
  if (!client) {
    client = await venom.create({
      session: 'budget-alert',
      multidevice: true,
      headless: true,
      cacheEnabled: true,
    });
    console.log("WhatsApp client initialized");
  }
  return client;
};

const sendSMS = async (to, message) => {
  try {
    const client = await initClient(); // reuse client
    await client.sendText(`${to}@c.us`, message);
    console.log(`WhatsApp message sent to ${to}: ${message}`);
  } catch (err) {
    console.error('Error sending WhatsApp message:', err);
  }
};

module.exports = sendSMS;
