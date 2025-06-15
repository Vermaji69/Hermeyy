const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play music from various sources')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Song name, URL, or search query')
                .setRequired(true)),

    async execute(interaction, manager) {
        await interaction.deferReply();

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.editReply('❌ You need to be in a voice channel to play music!');
        }

        const permissions = voiceChannel.permissionsFor(interaction.client.user);
        if (!permissions.has(['Connect', 'Speak'])) {
            return interaction.editReply('❌ I need permissions to join and speak in your voice channel!');
        }

        const query = interaction.options.getString('query');

        try {
            // Create or get existing player
            const player = manager.create({
                guild: interaction.guildId,
                voiceChannel: voiceChannel.id,
                textChannel: interaction.channelId,
                selfDeafen: true,
                volume: 80,
            });

            // Connect to voice channel if not connected
            if (player.state !== 'CONNECTED') {
                player.connect();
            }

            // Search for tracks
            const searchResult = await manager.search(query, interaction.user);
            
            if (!searchResult || !searchResult.tracks.length) {
                return interaction.editReply('❌ No results found for your search!');
            }

            let embed;

            if (searchResult.loadType === 'PLAYLIST_LOADED') {
                // Handle playlist
                player.queue.add(searchResult.tracks);
                
                embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('📋 Playlist Added to Queue')
                    .setDescription(`**${searchResult.playlist.name}**`)
                    .addFields(
                        { name: 'Tracks', value: `${searchResult.tracks.length}`, inline: true },
                        { name: 'Duration', value: this.formatPlaylistDuration(searchResult.tracks), inline: true },
                        { name: 'Requested by', value: `<@${interaction.user.id}>`, inline: true }
                    );
            } else {
                // Handle single track
                const track = searchResult.tracks[0];
                player.queue.add(track);
                
                embed = new EmbedBuilder()
                    .setColor('#00FF00')
                    .setTitle('🎵 Added to Queue')
                    .setDescription(`**[${track.title}](${track.uri})**`)
                    .addFields(
                        { name: 'Author', value: track.author, inline: true },
                        { name: 'Duration', value: this.formatDuration(track.duration), inline: true },
                        { name: 'Position', value: `${player.queue.size}`, inline: true }
                    )
                    .setThumbnail(track.thumbnail);
            }

            // Start playing if not already playing
            if (!player.playing && !player.paused && player.queue.totalSize === searchResult.tracks.length) {
                player.play();
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Play command error:', error);
            await interaction.editReply(`❌ Error: ${error.message}`);
        }
    },

    formatDuration(duration) {
        const hours = Math.floor(duration / 3600000);
        const minutes = Math.floor((duration % 3600000) / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    },

    formatPlaylistDuration(tracks) {
        const totalDuration = tracks.reduce((acc, track) => acc + track.duration, 0);
        return this.formatDuration(totalDuration);
    }
};