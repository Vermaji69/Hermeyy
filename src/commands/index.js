const { Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = new Collection();

// Load all command files
const commandFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.js') && file !== 'index.js');

for (const file of commandFiles) {
    const command = require(path.join(__dirname, file));
    commands.set(command.data.name, command);
}

module.exports = commands;