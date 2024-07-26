const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
const { token, openAIApiKey } = require('./config.json');
const toolDefinitions = require('./gpt/functions/toolDefinitions.js');
const OpenAI = require("openai");
const { get } = require('node:http');

const openai = new OpenAI(
  {
    apiKey: openAIApiKey,
  }
);

console.log("Starting bot...")

const client = new Client({
	 intents: [
		GatewayIntentBits.Guilds, 
		GatewayIntentBits.GuildMessages, 
		GatewayIntentBits.GuildMessageTyping,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.MessageContent,
	] 
	});

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.on(Events.Raw, raw => {
	console.log("\x1b[43m\x1b[30m----------", raw.t, "----------\x1b[0m");
	console.log(raw.d);
})

client.on(Events.MessageCreate, async (message) => {
	const bot_testing_channel = '865913265313153054';
	if (message.channelId == bot_testing_channel && message.author.id != client.user.id) {
		const channel = client.channels.cache.get(bot_testing_channel);

		const prompts = [
			{ role: "system", content: "You are a discord bot, hooked up to the OpenAI API. You are to use function calls if applicable."},
			{ role: "user", content: message.content },
		  ];

		const tools = toolDefinitions;

		var response = await openai.chat.completions.create({
		  model: "gpt-4o",
		  messages: prompts,
		  tools: tools,
		});
		console.log("\x1b[43m\x1b[30m----------RESPONSE----------\x1b[0m");
		console.log(response);
		const responseMessage = response.choices[0].message;
		console.log("\x1b[43m\x1b[30m-----RESPONSE MESSAGE-----\x1b[0m");
		console.log(responseMessage);
		
		if (responseMessage.tool_calls) {
			response = await runFunctionCalls(message, responseMessage, prompts);
		}
		console.log("\x1b[43m\x1b[30m-----FINAL RESPONSE-----\x1b[0m");
		console.log(response);

		channel.send(response.choices[0].message.content);
	}
})

  
const runFunctionCalls = async (message, responseMessage, prompts) => {
	const toolCalls = responseMessage.tool_calls
	const availableFunctions = {
		get_name: require('./gpt/functions/getName.js'),
		square_number: require('./gpt/functions/square.js'),
		get_user_info: require('./gpt/functions/getUserInfo.js'),
		};

	const discordFunctions = ['get_name', 'get_user_info']; // functions that require a discord message object as an argument

	prompts.push(responseMessage); // extend conversation with assistant's reply

	for (const toolCall of toolCalls) {
	console.log("\x1b[43m\x1b[30m-----TOOL CALL-----\x1b[0m");
	console.log(toolCall);
	const functionName = toolCall.function.name;
	const functionToCall = availableFunctions[functionName];
	var functionResponse = null;

	const functionArgs = Object.values(JSON.parse(toolCall.function.arguments));

	
	console.log("\x1b[43m\x1b[30m-----FUNCTION ARGS-----\x1b[0m");
	console.log(functionArgs);

	if (discordFunctions.includes(functionName)) {
		functionResponse = functionToCall(message);
	}

	else {
		functionResponse = functionToCall(...functionArgs);
	}

	
	console.log("\x1b[43m\x1b[30m-----FINISHED FUNCTION CALLING-----\x1b[0m");

	prompts.push({
		tool_call_id: toolCall.id,
		role: "tool",
		name: functionName,
		content: functionResponse,
	}); // extend conversation with function response
	}

	const secondResponse = await openai.chat.completions.create({
	model: "gpt-4o",
	messages: prompts,
	});
	return secondResponse;
	};

client.login(token);
