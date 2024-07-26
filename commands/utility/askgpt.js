const { SlashCommandBuilder } = require('discord.js');
const OpenAI = require("openai");
const { openAIApiKey } = require('../../config.json');


console.log('OPENAI_API_KEY: ', openAIApiKey);

const openai = new OpenAI(
  {
    apiKey: openAIApiKey,
  }
);

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('askgpt')
		.setDescription('Provide a prompt to gpt')
    .addStringOption(option =>
      option.setName('prompt')
        .setDescription('The prompt to send to GPT')
        .setRequired(true)
    ),
	async execute(interaction) {
    await interaction.deferReply();

    const chatCompletion = await openai.chat.completions.create(
        {
            model: "gpt-3.5-turbo",
            messages: [{ role: "system", content: interaction.options.getString('prompt') }],
        }
    )
		console.log(chatCompletion.choices[0].message.content);

		await interaction.editReply(chatCompletion.choices[0].message.content) ;
	},
};