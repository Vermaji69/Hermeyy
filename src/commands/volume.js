const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('Adjust the music volume')
        .addIntegerOption(option =>
            option.setName('level')
                .setDescription('Volume level (0-100)')
                .setRequired(true)
                .setMinValue(0)
                .setMaxValue(100)),

    async execute(interaction, manager) {
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({ content: '❌ You need to be in a voice channel to use this command!', ephemeral: true });
        }

        const player = manager.get(interaction.guildId);
        if (!player) {
            return interaction.reply({ content: '❌ Nothing is currently playing!', ephemeral: true });
        }

        const volume = interaction.options.getInteger('level');
        player.setVolume(volume);
        
        const embed = new EmbedBuilder()
            .setColor('#00BFFF')
            .setTitle('🔊 Volume Adjusted')
            .setDescription(`Volume set to **${volume}%**`)
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    }
};