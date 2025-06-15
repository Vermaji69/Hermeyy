const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Shuffle the current queue'),

    async execute(interaction, manager) {
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({ content: '❌ You need to be in a voice channel to use this command!', ephemeral: true });
        }

        const player = manager.get(interaction.guildId);
        if (!player) {
            return interaction.reply({ content: '❌ No player found!', ephemeral: true });
        }

        if (player.queue.size < 2) {
            return interaction.reply({ content: '❌ Need at least 2 songs in the queue to shuffle!', ephemeral: true });
        }

        player.queue.shuffle();
        
        const embed = new EmbedBuilder()
            .setColor('#9932CC')
            .setTitle('🔀 Queue Shuffled')
            .setDescription(`Shuffled **${player.queue.size}** songs in the queue.`)
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    }
};