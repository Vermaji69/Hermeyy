const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription('Shuffle the current queue'),

    async execute(interaction, musicPlayer) {
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({ content: '❌ You need to be in a voice channel to use this command!', ephemeral: true });
        }

        if (musicPlayer.queue.length < 2) {
            return interaction.reply({ content: '❌ Need at least 2 songs in the queue to shuffle!', ephemeral: true });
        }

        musicPlayer.shuffle();
        
        const embed = new EmbedBuilder()
            .setColor('#9932CC')
            .setTitle('🔀 Queue Shuffled')
            .setDescription(`Shuffled **${musicPlayer.queue.length}** songs in the queue.`);
        
        await interaction.reply({ embeds: [embed] });
    }
};