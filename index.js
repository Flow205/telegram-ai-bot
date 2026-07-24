require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Welcome! Send any text to generate an AI image.");
});

bot.on('message', async (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;

  const chatId = msg.chat.id;
  await bot.sendMessage(chatId, "Generating image... Please wait.");

  try {
    // Free image generation using Pollinations.ai (no API key needed)
    const prompt = encodeURIComponent(msg.text);
    const imageUrl = `https://image.pollinations.ai/prompt/${prompt}?width=1024&height=1024&nologo=true`;

    await bot.sendPhoto(chatId, imageUrl);
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "Sorry, there was an error generating the image.");
  }
});

console.log("Bot is running...");
