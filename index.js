const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const LavalinkManager = require('./src/LavalinkManager');
const config = require('./config.json');
const commands = require('./src/commands');

class MusicBot {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildMessages
            ]
        });

        this.lavalinkManager = new LavalinkManager(this.client);
        this.setupEventHandlers();
        this.registerCommands();
    }

    setupEventHandlers() {
        this.client.once('ready', () => {
            console.log(`🎵 ${this.client.user.tag} is now online and ready to play music!`);
            this.client.user.setActivity('🎵 High Quality Music with Lavalink', { type: 'LISTENING' });
            this.lavalinkManager.init();
        });

        this.client.on('raw', (d) => {
            this.lavalinkManager.manager.updateVoiceState(d);
        });

        this.client.on('interactionCreate', async (interaction) => {
            if (!interaction.isChatInputCommand()) return;

            const command = commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction, this.lavalinkManager.manager);
            } catch (error) {
                console.error('Command execution error:', error);
                const errorMessage = 'There was an error executing this command!';
                
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: errorMessage, ephemeral: true });
                } else {
                    await interaction.reply({ content: errorMessage, ephemeral: true });
                }
            }
        });
    }

    async registerCommands() {
        const rest = new REST({ version: '10' }).setToken(config.token);
        
        try {
            console.log('🔄 Refreshing application (/) commands...');
            await rest.put(
                Routes.applicationCommands(config.clientId),
                { body: Array.from(commands.values()).map(cmd => cmd.data.toJSON()) }
            );
            console.log('✅ Successfully registered application (/) commands.');
        } catch (error) {
            console.error('❌ Error registering commands:', error);
        }
    }

    start() {
        this.client.login(config.token);
    }
}

// Start the bot
const bot = new MusicBot();
bot.start();