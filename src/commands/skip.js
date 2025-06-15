const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the current song'),

    async execute(interaction, manager) {
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({ content: '❌ You need to be in a voice channel to use this command!', ephemeral: true });
        }

        const player = manager.get(interaction.guildId);
        if (!player) {
            return interaction.reply({ content: '❌ Nothing is currently playing!', ephemeral: true });
        }

        if (!player.queue.current) {
            return interaction.reply({ content: '❌ Nothing is currently playing!', ephemeral: true });
        }

        const currentTrack = player.queue.current;
        player.stop();

        const embed = new EmbedBuilder()
            .setColor('#FFA500')
            .setTitle('⏭️ Song Skipped')
            .setDescription(`Skipped **${currentTrack.title}**`)
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    }
};