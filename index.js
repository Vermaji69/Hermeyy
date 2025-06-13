const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const MusicPlayer = require('./src/MusicPlayer');
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

        this.musicPlayers = new Collection();
        this.setupEventHandlers();
        this.registerCommands();
    }

    setupEventHandlers() {
        this.client.once('ready', () => {
            console.log(`🎵 ${this.client.user.tag} is now online and ready to play music!`);
            this.client.user.setActivity('🎵 High Quality Music', { type: 'LISTENING' });
        });

        this.client.on('interactionCreate', async (interaction) => {
            if (!interaction.isChatInputCommand()) return;

            const command = commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction, this.getMusicPlayer(interaction.guildId));
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

        this.client.on('voiceStateUpdate', (oldState, newState) => {
            const musicPlayer = this.musicPlayers.get(oldState.guild.id);
            if (!musicPlayer) return;

            // Check if the bot was disconnected
            if (oldState.member?.user.bot && oldState.channelId && !newState.channelId) {
                musicPlayer.cleanup();
                this.musicPlayers.delete(oldState.guild.id);
            }

            // Auto-disconnect if no one else is in the voice channel
            if (oldState.channelId && oldState.channel?.members.filter(member => !member.user.bot).size === 0) {
                setTimeout(() => {
                    const channel = oldState.channel;
                    if (channel && channel.members.filter(member => !member.user.bot).size === 0) {
                        musicPlayer.cleanup();
                        this.musicPlayers.delete(oldState.guild.id);
                    }
                }, 30000); // Wait 30 seconds before disconnecting
            }
        });
    }

    getMusicPlayer(guildId) {
        if (!this.musicPlayers.has(guildId)) {
            this.musicPlayers.set(guildId, new MusicPlayer());
        }
        return this.musicPlayers.get(guildId);
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