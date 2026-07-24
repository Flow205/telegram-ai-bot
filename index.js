require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const Replicate = require('replicate');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, "Welcome! Send any text to generate an AI image.");
});

bot.on('message', async (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;

  const chatId = msg.chat.id;
  await bot.sendMessage(chatId, "Generating image... Please wait.");

  try {
    const output = await replicate.run("black-forest-labs/flux-schnell", {
      input: { prompt: msg.text }
    });
    await bot.sendPhoto(chatId, output[0]);
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "Sorry, there was an error generating the image.");
  }
});

console.log("Bot is running...");
