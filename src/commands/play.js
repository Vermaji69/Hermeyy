const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play music from YouTube')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('YouTube URL or search query')
                .setRequired(true)),

    async execute(interaction, musicPlayer) {
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
            // Connect to voice channel if not already connected
            if (!musicPlayer.voiceConnection) {
                const connected = await musicPlayer.connect(voiceChannel, interaction.channel);
                if (!connected) {
                    return interaction.editReply('❌ Failed to connect to the voice channel!');
                }
            }

            // Add song to queue
            const song = await musicPlayer.addToQueue(query, interaction.user);
            
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('🎵 Added to Queue')
                .setDescription(`**${song.title}**`)
                .addFields(
                    { name: 'Duration', value: musicPlayer.formatDuration(song.duration), inline: true },
                    { name: 'Requested by', value: `<@${song.requestedBy.id}>`, inline: true },
                    { name: 'Position in queue', value: `${musicPlayer.queue.length}`, inline: true }
                )
                .setThumbnail(song.thumbnail);

            // Start playing if not already playing
            if (!musicPlayer.isPlaying) {
                await musicPlayer.play();
                embed.setTitle('🎵 Now Playing')
                    .setColor('#FF6B6B');
            }

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Play command error:', error);
            await interaction.editReply(`❌ Error: ${error.message}`);
        }
    }
};