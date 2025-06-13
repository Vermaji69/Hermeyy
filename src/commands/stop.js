const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop the music and clear the queue'),

    async execute(interaction, musicPlayer) {
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({ content: '❌ You need to be in a voice channel to use this command!', ephemeral: true });
        }

        if (!musicPlayer.isPlaying && musicPlayer.queue.length === 0) {
            return interaction.reply({ content: '❌ Nothing is currently playing!', ephemeral: true });
        }

        musicPlayer.stop();
        
        const embed = new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('⏹️ Music Stopped')
            .setDescription('Queue cleared and playback stopped.');
        
        await interaction.reply({ embeds: [embed] });
    }
};