const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Display the current music queue'),

    async execute(interaction, musicPlayer) {
        const queue = musicPlayer.getQueue();
        
        if (!queue.current && queue.upcoming.length === 0) {
            return interaction.reply({ content: '❌ The queue is empty!', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setColor('#4169E1')
            .setTitle('🎵 Music Queue')
            .setTimestamp();

        if (queue.current) {
            embed.addFields({
                name: '🎵 Now Playing',
                value: `**${queue.current.title}**\nRequested by: <@${queue.current.requestedBy.id}>`,
                inline: false
            });
        }

        if (queue.upcoming.length > 0) {
            const upcomingList = queue.upcoming.map((song, index) => 
                `**${index + 1}.** ${song.title} - <@${song.requestedBy.id}>`
            ).join('\n');

            embed.addFields({
                name: `⏭️ Up Next (${queue.total} total)`,
                value: upcomingList.substring(0, 1024), // Discord embed field limit
                inline: false
            });
        }

        await interaction.reply({ embeds: [embed] });
    }
};