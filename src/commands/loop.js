const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Toggle loop mode for the current song or queue')
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Loop mode')
                .setRequired(false)
                .addChoices(
                    { name: 'Off', value: 'none' },
                    { name: 'Track', value: 'track' },
                    { name: 'Queue', value: 'queue' }
                )),

    async execute(interaction, manager) {
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({ content: '❌ You need to be in a voice channel to use this command!', ephemeral: true });
        }

        const player = manager.get(interaction.guildId);
        if (!player) {
            return interaction.reply({ content: '❌ No player found!', ephemeral: true });
        }

        const mode = interaction.options.getString('mode');
        let loopMode;
        let description;

        if (mode) {
            switch (mode) {
                case 'none':
                    loopMode = 'none';
                    description = 'Loop disabled';
                    break;
                case 'track':
                    loopMode = 'track';
                    description = 'Looping current track';
                    break;
                case 'queue':
                    loopMode = 'queue';
                    description = 'Looping entire queue';
                    break;
            }
        } else {
            // Toggle through modes
            switch (player.repeatMode) {
                case 0: // none
                    loopMode = 'track';
                    description = 'Looping current track';
                    break;
                case 1: // track
                    loopMode = 'queue';
                    description = 'Looping entire queue';
                    break;
                case 2: // queue
                    loopMode = 'none';
                    description = 'Loop disabled';
                    break;
                default:
                    loopMode = 'track';
                    description = 'Looping current track';
            }
        }

        // Set the repeat mode
        switch (loopMode) {
            case 'none':
                player.setRepeatMode(0);
                break;
            case 'track':
                player.setRepeatMode(1);
                break;
            case 'queue':
                player.setRepeatMode(2);
                break;
        }

        const embed = new EmbedBuilder()
            .setColor('#9932CC')
            .setTitle('🔁 Loop Mode Changed')
            .setDescription(description)
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    }
};