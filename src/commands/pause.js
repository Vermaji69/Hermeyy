const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause the current song'),

    async execute(interaction, musicPlayer) {
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({ content: '❌ You need to be in a voice channel to use this command!', ephemeral: true });
        }

        if (!musicPlayer.isPlaying) {
            return interaction.reply({ content: '❌ Nothing is currently playing!', ephemeral: true });
        }

        if (musicPlayer.isPaused) {
            return interaction.reply({ content: '❌ The music is already paused!', ephemeral: true });
        }

        const paused = musicPlayer.pause();
        if (paused) {
            const embed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('⏸️ Music Paused')
                .setDescription('Use `/resume` to continue playing.');
            
            await interaction.reply({ embeds: [embed] });
        } else {
            await interaction.reply({ content: '❌ Failed to pause the music!', ephemeral: true });
        }
    }
};