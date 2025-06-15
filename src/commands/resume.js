const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume the paused song'),

    async execute(interaction, manager) {
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({ content: '❌ You need to be in a voice channel to use this command!', ephemeral: true });
        }

        const player = manager.get(interaction.guildId);
        if (!player) {
            return interaction.reply({ content: '❌ Nothing is currently playing!', ephemeral: true });
        }

        if (!player.paused) {
            return interaction.reply({ content: '❌ The music is not paused!', ephemeral: true });
        }

        player.pause(false);

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('▶️ Music Resumed')
            .setDescription('Continuing playback...')
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    }
};