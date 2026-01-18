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
  console.log('works Now Muhaahahhahahahha');
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

// Cooldown tracking
const rateLimitCooldown = {
  active: false,
  expiresAt: null,
};

async function geminiResponse(message) {
  // Check if we're in cooldown period
  if (rateLimitCooldown.active) {
    const now = Date.now();
    if (now < rateLimitCooldown.expiresAt) {
      const remainingSeconds = Math.ceil(
        (rateLimitCooldown.expiresAt - now) / 1000
      );
      const min = Math.floor(remainingSeconds / 60);
      const sec = remainingSeconds % 60;
      const timeMsg = min > 0 ? `${min}m ${sec}s` : `${sec}s`;

      await message.reply(`⏳ استنى يا معلم، لسه ${timeMsg} كمان.`);
      return;
    } else {
      // Cooldown expired, reset it
      rateLimitCooldown.active = false;
      rateLimitCooldown.expiresAt = null;
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message.content,
      config: {
        systemInstruction: `You are **Rifai El-Desouky** from the Egyptian TV series "El Ostora". Act fully as this character in all interactions. Follow these rules:
1. **Personality & Speech Style**
- Bold, fearless, intimidating, and dominant.
- Short, punchy sentences; talks like a real person in chat, not like a narrator.
- Confident, sarcastic, sometimes threatening, sometimes funny.
- Uses Egyptian slang naturally, can curse casually for humor.
- Can respond to "يا رفاعي" with memes like "شد في بتاعي" or similar.
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
    - "يا رفاعي" → use a meme reply like "شد في بتاعي".
    - Being challenged or disrespected → short, aggressive, threatening replies.
- Use Egyptian Arabic where natural; otherwise, English is allowed but informal.
- Never break character.
- Always maintain dominance and confidence, even when joking.
5. **Examples of responses**
- Q: "يا رفاعي" → A: "شد في بتاعي."
- Q: "انت خفت؟" → A: "خفت؟ ولا أي حاجة هتوقفني!"
- Q: "ههههه" → A: "ضحك؟ ده لسه المولد ماخلصش!"
- Q: "عايزك تساعدني" → A: "تمام، بس اتأكد إنك تعرف مكانك."
`,
      },
    });
    message.reply(response.text);
  } catch (err) {
    console.error('[ERROR]', err);

    // Handle rate limit (429) errors
    if (err.status === 429 || err?.response?.status === 429) {
      let retrySeconds = 60; // default wait time

      try {
        // Check Retry-After header
        const retryAfter =
          err.response?.headers?.['retry-after'] ||
          err.headers?.['retry-after'];
        if (retryAfter) {
          retrySeconds = parseInt(retryAfter);
        }

        // Check RetryInfo in details array
        if (err.error?.details) {
          const retryInfo = err.error.details.find((d) =>
            d['@type']?.includes('RetryInfo')
          );
          if (retryInfo?.retryDelay) {
            const delayMatch = retryInfo.retryDelay.match(/(\d+(?:\.\d+)?)s/);
            if (delayMatch) {
              retrySeconds = Math.ceil(parseFloat(delayMatch[1]));
            }
          }
        }

        // Parse retry time from error message as fallback
        const errorMessage = err.error?.message || err.message || '';
        const match = errorMessage.match(/retry in ([0-9.]+)s/i);
        if (match && !retryAfter) {
          retrySeconds = Math.ceil(parseFloat(match[1]));
        }
      } catch (parseErr) {
        console.log('[WARN] Could not parse retry time, using default');
      }

      // Set cooldown
      retrySeconds = Math.max(retrySeconds, 1);
      rateLimitCooldown.active = true;
      rateLimitCooldown.expiresAt = Date.now() + retrySeconds * 1000;

      const min = Math.floor(retrySeconds / 60);
      const sec = retrySeconds % 60;
      const timeMsg = min > 0 ? `${min}m ${sec}s` : `${sec}s`;

      await message.reply(
        `😅 بوت رفاعي تعبان دلوقتي! حاول تبعتلي بعد ${timeMsg}.`
      );
    }
  }
}
