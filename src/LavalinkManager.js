const { Manager } = require('erela.js');
const { EmbedBuilder } = require('discord.js');

class LavalinkManager {
    constructor(client) {
        this.client = client;
        this.manager = new Manager({
            nodes: [
                {
                    host: 'localhost',
                    port: 2333,
                    password: 'youshallnotpass',
                    secure: false,
                    retryAmount: 5,
                    retryDelay: 30000,
                }
            ],
            clientName: 'DiscordMusicBot',
            clientVersion: '1.0.0',
            autoPlay: true,
            send: (id, payload) => {
                const guild = this.client.guilds.cache.get(id);
                if (guild) guild.shard.send(payload);
            }
        });

        this.setupEvents();
    }

    setupEvents() {
        this.manager
            .on('nodeConnect', (node) => {
                console.log(`🔗 Lavalink node "${node.options.identifier}" connected.`);
            })
            .on('nodeError', (node, error) => {
                console.error(`❌ Lavalink node "${node.options.identifier}" encountered an error:`, error.message);
            })
            .on('nodeDisconnect', (node, reason) => {
                console.log(`🔌 Lavalink node "${node.options.identifier}" disconnected:`, reason);
            })
            .on('nodeReconnect', (node) => {
                console.log(`🔄 Lavalink node "${node.options.identifier}" reconnecting...`);
            })
            .on('trackStart', (player, track) => {
                const channel = this.client.channels.cache.get(player.textChannel);
                if (!channel) return;

                const embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('🎵 Now Playing')
                    .setDescription(`**[${track.title}](${track.uri})**`)
                    .addFields(
                        { name: 'Author', value: track.author, inline: true },
                        { name: 'Duration', value: this.formatDuration(track.duration), inline: true },
                        { name: 'Requested by', value: `<@${track.requester.id}>`, inline: true }
                    )
                    .setThumbnail(track.thumbnail)
                    .setTimestamp();

                channel.send({ embeds: [embed] });
            })
            .on('trackEnd', (player, track) => {
                // Auto-disconnect if queue is empty and no one is listening
                if (player.queue.size === 0) {
                    setTimeout(() => {
                        const voiceChannel = this.client.channels.cache.get(player.voiceChannel);
                        if (voiceChannel && voiceChannel.members.filter(m => !m.user.bot).size === 0) {
                            player.destroy();
                        }
                    }, 30000); // 30 seconds delay
                }
            })
            .on('trackStuck', (player, track, payload) => {
                console.error(`Track stuck: ${track.title}`, payload);
                const channel = this.client.channels.cache.get(player.textChannel);
                if (channel) {
                    const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('⚠️ Track Stuck')
                        .setDescription(`**${track.title}** got stuck and will be skipped.`);
                    channel.send({ embeds: [embed] });
                }
            })
            .on('trackError', (player, track, payload) => {
                console.error(`Track error: ${track.title}`, payload);
                const channel = this.client.channels.cache.get(player.textChannel);
                if (channel) {
                    const embed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('❌ Track Error')
                        .setDescription(`An error occurred while playing **${track.title}**.`);
                    channel.send({ embeds: [embed] });
                }
            })
            .on('queueEnd', (player) => {
                const channel = this.client.channels.cache.get(player.textChannel);
                if (channel) {
                    const embed = new EmbedBuilder()
                        .setColor('#FFA500')
                        .setTitle('🎵 Queue Ended')
                        .setDescription('The music queue has ended. Add more songs to continue listening!');
                    channel.send({ embeds: [embed] });
                }
                
                // Auto-disconnect after queue ends
                setTimeout(() => {
                    if (player.queue.size === 0) {
                        player.destroy();
                    }
                }, 60000); // 1 minute delay
            })
            .on('playerMove', (player, oldChannel, newChannel) => {
                if (!newChannel) {
                    player.destroy();
                } else {
                    player.voiceChannel = newChannel;
                }
            });
    }

    init() {
        this.manager.init(this.client.user.id);
    }

    formatDuration(duration) {
        const hours = Math.floor(duration / 3600000);
        const minutes = Math.floor((duration % 3600000) / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

module.exports = LavalinkManager;