const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Resume the paused song'),

    async execute(interaction, musicPlayer) {
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({ content: '❌ You need to be in a voice channel to use this command!', ephemeral: true });
        }

        if (!musicPlayer.isPaused) {
            return interaction.reply({ content: '❌ The music is not paused!', ephemeral: true });
        }

        const resumed = musicPlayer.resume();
        if (resumed) {
            const embed = new EmbedBuilder()
                .setColor('#00FF00')
                .setTitle('▶️ Music Resumed')
                .setDescription('Continuing playback...');
            
            await interaction.reply({ embeds: [embed] });
        } else {
            await interaction.reply({ content: '❌ Failed to resume the music!', ephemeral: true });
        }
    }
};