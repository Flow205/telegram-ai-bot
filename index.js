require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const Groq = require('groq-sdk');
const Replicate = require('replicate');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 
`Welcome! 

• Just send me a message → I’ll reply like a helpful AI
• Send /image followed by a description → I’ll generate a high-quality AI image

Example:
/image a beautiful young woman wearing sunglasses on the beach`
  );
});

bot.on('message', async (msg) => {
  if (!msg.text || msg.text.startsWith('/start')) return;

  const chatId = msg.chat.id;
  const text = msg.text.trim();

  // Image generation with Replicate
  if (text.toLowerCase().startsWith('/image')) {
    const prompt = text.replace(/^\/image\s*/i, '').trim();

    if (!prompt) {
      return bot.sendMessage(chatId, "Please provide a description.\nExample: /image a beautiful girl on the beach");
    }

    await bot.sendMessage(chatId, "Generating high-quality image... Please wait.");

    try {
      const output = await replicate.run(
        "black-forest-labs/flux-schnell",
        {
          input: {
            prompt: prompt,
            num_outputs: 1,
            aspect_ratio: "1:1",
            output_format: "jpg",
            output_quality: 90
          }
        }
      );

      await bot.sendPhoto(chatId, output[0]);
    } catch (error) {
      console.error(error);
      bot.sendMessage(chatId, "Sorry, there was an error generating the image. Please try again.");
    }
    return;
  }

  // Text AI
  try {
    await bot.sendChatAction(chatId, 'typing');

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are a helpful, clear, and slightly witty AI assistant built by xAI. 
Reply in a natural, friendly, and direct way — similar to Grok. 
Be honest, useful, and avoid being overly formal or robotic. 
Keep answers concise unless the user asks for more detail.`
        },
        {
          role: "user",
          content: text
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024
    });

    const reply = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a reply.";
    await bot.sendMessage(chatId, reply);
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "Sorry, I had trouble thinking of a reply. Please try again.");
  }
});

console.log("Bot is running...");
