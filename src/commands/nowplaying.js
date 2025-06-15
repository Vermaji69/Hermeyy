const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Show information about the currently playing song'),

    async execute(interaction, manager) {
        const player = manager.get(interaction.guildId);
        
        if (!player || !player.queue.current) {
            return interaction.reply({ content: '❌ Nothing is currently playing!', ephemeral: true });
        }

        const track = player.queue.current;
        const position = player.position;
        const duration = track.duration;
        
        // Create progress bar
        const progressBarLength = 20;
        const progress = Math.round((position / duration) * progressBarLength);
        const progressBar = '▓'.repeat(progress) + '░'.repeat(progressBarLength - progress);

        const embed = new EmbedBuilder()
            .setColor('#FF6B6B')
            .setTitle('🎵 Now Playing')
            .setDescription(`**[${track.title}](${track.uri})**`)
            .addFields(
                { name: 'Author', value: track.author, inline: true },
                { name: 'Duration', value: this.formatDuration(duration), inline: true },
                { name: 'Requested by', value: `<@${track.requester.id}>`, inline: true },
                { name: 'Progress', value: `${this.formatDuration(position)} / ${this.formatDuration(duration)}\n${progressBar}`, inline: false }
            )
            .setThumbnail(track.thumbnail)
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },

    formatDuration(duration) {
        const hours = Math.floor(duration / 3600000);
        const minutes = Math.floor((duration % 3600000) / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
};