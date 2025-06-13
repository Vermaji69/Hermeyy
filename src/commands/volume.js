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

    async execute(interaction, musicPlayer) {
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({ content: '❌ You need to be in a voice channel to use this command!', ephemeral: true });
        }

        const volume = interaction.options.getInteger('level');
        const volumeDecimal = volume / 100;
        
        musicPlayer.setVolume(volumeDecimal);
        
        const embed = new EmbedBuilder()
            .setColor('#00BFFF')
            .setTitle('🔊 Volume Adjusted')
            .setDescription(`Volume set to **${volume}%**`);
        
        await interaction.reply({ embeds: [embed] });
    }
};