require('dotenv').config();

const { Client, Intents } = require('discord.js');
const mongoose = require('mongoose');
const express = require('express');
const app = express();

const handleInteractionCreate = require('./utils/interactions/handleInteractionCreate');
const handleMenuInteraction = require('./utils/interactions/handleMenuInteraction');
const runCommands = require('./utils/runCommands');

const isInAllowedChannel = require('./utils/isInAllowedChannel');
const sendNotAllowedChannelMessage = require('./utils/sendNotAllowedChannelMessage');

// Load DB models
require('./models/Stats');

// Load Routets
require('./routes/databaseRoutes')(app);

// Connect to the DB
try {
  mongoose.connect(process.env.MONGO_URI);
} catch (error) {
  console.log(error);
}

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

client.once('ready', () => {
  console.log('bot ready');
  client.user.setPresence({
    activities: [{ name: 'Titano Stats', type: 'WATCHING' }],
    status: 'online',
  });
});

/**
 * @desc - Used for slash commands interaction
 */
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) {
    return;
  }
  handleInteractionCreate(interaction);
});

/**
 * @desc - Used for menu selections
 * From slash commands
 */
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isSelectMenu()) {
    return;
  }

  handleMenuInteraction(interaction);
});

/**
 * @desc - Read every message.
 * Also used for !! commands
 */
client.on('messageCreate', async (message) => {
  if (message.author.bot) {
    if (
      !isInAllowedChannel(message) &&
      message.interaction?.commandName === 'charts'
    ) {
      sendNotAllowedChannelMessage(message);
    }

    return;
  }
  runCommands(message);
});

client.login(process.env.DISCORD_TOKEN);

// Listen to incoming requests
app.listen(process.env.PORT);