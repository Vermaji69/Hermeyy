const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Display the current music queue'),

    async execute(interaction, manager) {
        const player = manager.get(interaction.guildId);
        
        if (!player || (!player.queue.current && player.queue.size === 0)) {
            return interaction.reply({ content: '❌ The queue is empty!', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor('#4169E1')
            .setTitle('🎵 Music Queue')
            .setTimestamp();

        if (player.queue.current) {
            const current = player.queue.current;
            embed.addFields({
                name: '🎵 Now Playing',
                value: `**[${current.title}](${current.uri})**\n` +
                       `Author: ${current.author}\n` +
                       `Duration: ${this.formatDuration(current.duration)}\n` +
                       `Requested by: <@${current.requester.id}>`,
                inline: false
            });
        }

        if (player.queue.size > 0) {
            const upcoming = player.queue.slice(0, 10).map((track, index) => 
                `**${index + 1}.** [${track.title}](${track.uri}) - <@${track.requester.id}>`
            ).join('\n');

            embed.addFields({
                name: `⏭️ Up Next (${player.queue.size} total)`,
                value: upcoming.substring(0, 1024), // Discord embed field limit
                inline: false
            });
        }

        if (player.queue.size > 0) {
            const totalDuration = player.queue.reduce((acc, track) => acc + track.duration, 0);
            embed.addFields({
                name: '📊 Queue Stats',
                value: `Total Duration: ${this.formatDuration(totalDuration)}\n` +
                       `Total Tracks: ${player.queue.size}`,
                inline: true
            });
        }

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