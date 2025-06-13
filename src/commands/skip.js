const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current song'),

    async execute(interaction, musicPlayer) {
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({ content: '❌ You need to be in a voice channel to use this command!', ephemeral: true });
        }

        if (!musicPlayer.isPlaying) {
            return interaction.reply({ content: '❌ Nothing is currently playing!', ephemeral: true });
        }

        const skipped = musicPlayer.skip();
        if (skipped) {
            const embed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle('⏭️ Song Skipped')
                .setDescription('Moving to the next song...');
            
            await interaction.reply({ embeds: [embed] });
        } else {
            await interaction.reply({ content: '❌ Failed to skip the song!', ephemeral: true });
        }
    }
};