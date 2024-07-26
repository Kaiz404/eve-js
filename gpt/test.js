const OpenAI = require("openai");
const dotenv = require('dotenv');

dotenv.config();

console.log('OPENAI_API_KEY: ', process.env.OPENAI_API_KEY);

const openai = new OpenAI(
  {
    apiKey: process.env.OPENAI_API_KEY,
  }
);

// message roles include 'user', 'assistant', and 'system'

async function main() {
  const stream = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: "Translate the first chapter of the bible to russian" }],
    stream: true,
});
for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || "");
}

}
main();
