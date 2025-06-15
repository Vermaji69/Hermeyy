const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pause the current song'),

    async execute(interaction, manager) {
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({ content: '❌ You need to be in a voice channel to use this command!', ephemeral: true });
        }

        const player = manager.get(interaction.guildId);
        if (!player) {
            return interaction.reply({ content: '❌ Nothing is currently playing!', ephemeral: true });
        }

        if (!player.playing) {
            return interaction.reply({ content: '❌ Nothing is currently playing!', ephemeral: true });
        }

        if (player.paused) {
            return interaction.reply({ content: '❌ The music is already paused!', ephemeral: true });
        }

        player.pause(true);

        const embed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('⏸️ Music Paused')
            .setDescription('Use `/resume` to continue playing.')
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    }
};