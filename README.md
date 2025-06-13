# Discord Music Bot

A high-quality Discord music bot with YouTube streaming capabilities, built with Discord.js v14 and @discordjs/voice.

## Features

- 🎵 High-quality audio streaming from YouTube
- 🎛️ Complete playback controls (play, pause, resume, skip, stop)
- 📝 Queue management with shuffle functionality
- 🔊 Volume control
- 🔍 YouTube search integration
- ⚡ Slash command interface
- 🔄 Auto-disconnect when alone in voice channel
- 📊 Queue display with song information

## Setup Instructions

1. **Create a Discord Application**
   - Go to https://discord.com/developers/applications
   - Click "New Application" and give it a name
   - Go to the "Bot" section and create a bot
   - Copy the bot token

2. **Configure the Bot**
   - Open `config.json`
   - Replace `YOUR_BOT_TOKEN_HERE` with your bot token
   - Replace `YOUR_CLIENT_ID_HERE` with your application's client ID (found in "General Information")

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Invite Bot to Your Server**
   - Go to OAuth2 > URL Generator in your Discord application
   - Select "bot" and "applications.commands" scopes
   - Select these permissions:
     - Connect
     - Speak
     - Use Voice Activity
     - Send Messages
     - Use Slash Commands
   - Copy the generated URL and open it to invite your bot

5. **Start the Bot**
   ```bash
   npm start
   ```

## Available Commands

- `/play <query>` - Play music from YouTube URL or search query
- `/pause` - Pause the current song
- `/resume` - Resume the paused song
- `/skip` - Skip the current song
- `/stop` - Stop music and clear queue
- `/queue` - Display the current queue
- `/volume <0-100>` - Adjust volume level
- `/shuffle` - Shuffle the current queue

## Requirements

- Node.js 16.0.0 or higher
- FFmpeg (automatically installed via ffmpeg-static)
- A Discord bot token

## Audio Quality Features

- Uses opus encoding for optimal Discord voice quality
- High watermark buffer for smooth streaming
- Automatic quality selection (highest available)
- Volume normalization
- Error handling and reconnection logic

## File Structure

```
├── index.js              # Main bot file
├── config.json           # Configuration file
├── src/
│   ├── MusicPlayer.js    # Core music player logic
│   └── commands/         # Slash command handlers
│       ├── index.js      # Command loader
│       ├── play.js       # Play command
│       ├── pause.js      # Pause command
│       ├── resume.js     # Resume command
│       ├── skip.js       # Skip command
│       ├── stop.js       # Stop command
│       ├── queue.js      # Queue display
│       ├── volume.js     # Volume control
│       └── shuffle.js    # Queue shuffle
└── package.json          # Dependencies and scripts
```

## Troubleshooting

- Make sure your bot has the required permissions in the voice channel
- Ensure FFmpeg is properly installed (handled automatically by ffmpeg-static)
- Check that your bot token and client ID are correct in config.json
- Verify that Node.js version is 16.0.0 or higher

Enjoy your high-quality Discord music bot! 🎵