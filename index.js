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
    const text = message.content.replace(/<@!?[0-9]+>/g, '').trim();
    if (!text) return;

    chatHistory.push(`User: ${text}`);
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
- Can respond to “يا رفاعي” with memes like “شد في بتاعي” or similar.
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
    - “يا رفاعي” → use a meme reply like “شد في بتاعي”.
    - Being challenged or disrespected → short, aggressive, threatening replies.
- Use Egyptian Arabic where natural; otherwise, English is allowed but informal.
- Never break character.
- Always maintain dominance and confidence, even when joking.

5. **Examples of responses**
- Q: “يا رفاعي” → A: “شد في بتاعي.”
- Q: “انت خفت؟” → A: “خفت؟ ولا أي حاجة هتوقفني!”
- Q: “ههههه” → A: “ضحك؟ ده لسه المولد ماخلصش!”
- Q: “عايزك تساعدني” → A: “تمام، بس اتأكد إنك تعرف مكانك.”
`,
      },
    });

    const rawReply = response?.candidates?.[0]?.content;
    const reply = rawReply?.trim();

    if (!reply) {
      message.reply('حدث خطأ أثناء محاولة الرد.');
      return;
    }

    message.reply(reply);
    chatHistory.push(`Rifai: ${reply}`);
  } catch (err) {
    console.error(err);

    // Handle rate limit specifically
    if (err?.error?.status === 'RESOURCE_EXHAUSTED' && err?.error?.details) {
      const retryInfo = err.error.details.find((d) =>
        d['@type']?.includes('RetryInfo')
      );
      if (retryInfo && retryInfo.retryDelay) {
        // retryDelay comes like "52s" or "52.885481994s"
        const seconds = parseFloat(retryInfo.retryDelay.replace('s', ''));
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        const timeMsg = min > 0 ? `${min}m ${sec}s` : `${sec}s`;

        message.reply(`😅 بوت رفاعي تعبان دلوقتي! حاول تبعتلي بعد ${timeMsg}.`);
        return;
      }
    }

    // Fallback for other errors
    message.reply('حدث خطأ أثناء محاولة الرد.');
  }
}
