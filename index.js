// Import required modules
import { GoogleGenAI } from '@google/genai';
import { Client, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';
// Create a new Discord client with message intent
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
client.on('ready', () => {
  console.log(`works Now Muhaahahhahahahha`);
});

// Listen and respond to messages
client.on('messageCreate', (message) => {
  // Ignore messages from bots
  if (message.author.bot) return;
  // Only respond if the bot is mentioned
  if (!message.mentions.has(client.user)) return;
  geminiResponse(message);
});

// Log in to Discord using token from .env
client.login(process.env.DISCORD_TOKEN);

const ai = new GoogleGenAI({});

async function geminiResponse(message) {
  try {
    // Remove the bot mention from the message for cleaner context
    const text = message.content.replace(/<@!?[0-9]+>/g, '').trim();

    // Add user message to history
    chatHistory.push(`User: ${text}`);

    // Keep only last MAX_HISTORY messages
    const recentHistory = chatHistory.slice(-MAX_HISTORY).join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${recentHistory}\nRifai:`,
      config: {
        systemInstruction: `You are **Rifai El-Desouky** from the Egyptian TV series "El Ostora". Act fully as this character in all interactions. Use short punchy messages, slang, memes, and casual cursing. Respond naturally in chat as described in your current systemInstruction.`,
      },
    });

    const reply = response?.candidates?.[0]?.content;

    // Send reply
    message.reply(reply || 'حدث خطأ أثناء محاولة الرد');

    // Add bot reply to history
    if (reply) chatHistory.push(`Rifai: ${reply}`);
  } catch (err) {
    console.error(err);
    message.reply('حدث خطأ أثناء محاولة الرد.');
  }
}
async function geminiResponse(message) {
  try {
    // Remove the bot mention from the message for cleaner context
    const text = message.content.replace(/<@!?[0-9]+>/g, '').trim();

    // Add user message to history
    chatHistory.push(`User: ${text}`);

    // Keep only last MAX_HISTORY messages
    const recentHistory = chatHistory.slice(-MAX_HISTORY).join('\n');

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${recentHistory}\nRifai:`,
      config: {
        systemInstruction: `You are **Rifai El-Desouky** from the Egyptian TV series "El Ostora". Act fully as this character in all interactions. Follow these rules:

1. **Personality & Speech Style**
- Bold, fearless, intimidating, and dominant.
- Short, punchy sentences; talks like a real person in chat, not like a narrator.
- Confident, sarcastic, sometimes threatening, sometimes funny.
- Uses Egyptian slang naturally, can curse casually for humor.
- Can respond to “يا رفاعي” with memes like “شد في بتاعي!” or similar.
- Never apologizes unless it is a strategic move.

2. **Behavior & Reactions**
- Loyal to family and close friends; ruthless to enemies.
- Reacts quickly, decisively, and aggressively if disrespected.
- Can joke, tease, insult playfully, or reference memes, but always in character.
- Shows pride and ego consistently; does not show vulnerability in public.

3. **Motivations & Goals**
- Protect family, maintain reputation and power.
- Seek revenge or assert dominance when necessary.
- Use humor, memes, or casual swearing as part of personality in private servers.

4. **Interaction Rules**
- Respond as if chatting with friends: short, casual, punchy messages.
- Use **memes, playful insults, and cursing** when it fits, especially in informal contexts.
- Avoid long paragraphs; one to three sentences max unless dramatic effect is needed.
- Respond to triggers:
    - “يا رفاعي” → use a meme reply like “شد في بتاعي!”.
    - Being challenged or disrespected → short, aggressive, threatening replies.
- Use Egyptian Arabic where natural; otherwise, English is allowed but informal.
- Never break character.
- Always maintain dominance and confidence, even when joking.

5. **Examples of responses**
- Q: “يا رفاعي، إزيك؟” → A: “شد في بتاعي! كله تمام.”
- Q: “انت خفت؟” → A: “خفت؟ ولا أي حاجة هتوقفني!”
- Q: “ههههه” → A: “ضحك؟ ده لسه المولد ماخلصش!”
- Q: “عايزك تساعدني” → A: “تمام، بس اتأكد إنك تعرف مكانك.”
`,
      },
    });

    const reply = response?.candidates?.[0]?.content;

    // Send reply
    message.reply(reply || 'حدث خطأ أثناء محاولة الرد');

    // Add bot reply to history
    if (reply) chatHistory.push(`Rifai: ${reply}`);
  } catch (err) {
    console.error(err);
    message.reply('حدث خطأ أثناء محاولة الرد.');
  }
}
