const { createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, joinVoiceChannel } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const ytsr = require('ytsr');

class MusicPlayer {
    constructor() {
        this.queue = [];
        this.isPlaying = false;
        this.isPaused = false;
        this.currentSong = null;
        this.voiceConnection = null;
        this.audioPlayer = null;
        this.volume = 0.5;
        this.textChannel = null;
    }

    async connect(voiceChannel, textChannel) {
        this.textChannel = textChannel;
        
        try {
            this.voiceConnection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
                selfMute: false,
                selfDeaf: true
            });

            this.audioPlayer = createAudioPlayer();
            this.voiceConnection.subscribe(this.audioPlayer);

            this.setupAudioPlayerEvents();
            this.setupVoiceConnectionEvents();

            return true;
        } catch (error) {
            console.error('Failed to connect to voice channel:', error);
            return false;
        }
    }

    setupAudioPlayerEvents() {
        this.audioPlayer.on(AudioPlayerStatus.Playing, () => {
            this.isPlaying = true;
            this.isPaused = false;
        });

        this.audioPlayer.on(AudioPlayerStatus.Paused, () => {
            this.isPaused = true;
        });

        this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
            this.isPlaying = false;
            this.isPaused = false;
            this.currentSong = null;
            this.playNext();
        });

        this.audioPlayer.on('error', (error) => {
            console.error('Audio player error:', error);
            this.playNext();
        });
    }

    setupVoiceConnectionEvents() {
        this.voiceConnection.on(VoiceConnectionStatus.Disconnected, async () => {
            try {
                await this.voiceConnection.reconnect();
            } catch {
                this.cleanup();
            }
        });

        this.voiceConnection.on('error', (error) => {
            console.error('Voice connection error:', error);
        });
    }

    async searchYouTube(query) {
        try {
            const searchResults = await ytsr(query, { limit: 1 });
            if (searchResults.items.length === 0) {
                return null;
            }
            return searchResults.items[0];
        } catch (error) {
            console.error('YouTube search error:', error);
            return null;
        }
    }

    async addToQueue(query, requestedBy) {
        let songInfo;
        
        if (ytdl.validateURL(query)) {
            songInfo = await ytdl.getInfo(query);
            songInfo = {
                title: songInfo.videoDetails.title,
                url: songInfo.videoDetails.video_url,
                duration: songInfo.videoDetails.lengthSeconds,
                thumbnail: songInfo.videoDetails.thumbnails[0]?.url,
                author: songInfo.videoDetails.author.name
            };
        } else {
            const searchResult = await this.searchYouTube(query);
            if (!searchResult) {
                throw new Error('No results found for your search.');
            }
            songInfo = {
                title: searchResult.title,
                url: searchResult.url,
                duration: searchResult.duration,
                thumbnail: searchResult.bestThumbnail?.url,
                author: searchResult.author?.name || 'Unknown'
            };
        }

        const song = {
            ...songInfo,
            requestedBy: requestedBy
        };

        this.queue.push(song);
        return song;
    }

    async play() {
        if (this.queue.length === 0) {
            return false;
        }

        if (this.isPlaying) {
            return true;
        }

        this.currentSong = this.queue.shift();
        
        try {
            const stream = ytdl(this.currentSong.url, {
                filter: 'audioonly',
                highWaterMark: 1 << 25,
                quality: 'highestaudio'
            });

            const audioResource = createAudioResource(stream, {
                inlineVolume: true
            });

            audioResource.volume.setVolume(this.volume);
            this.audioPlayer.play(audioResource);

            return true;
        } catch (error) {
            console.error('Error playing song:', error);
            this.playNext();
            return false;
        }
    }

    async playNext() {
        if (this.queue.length > 0) {
            await this.play();
        } else {
            this.isPlaying = false;
            this.currentSong = null;
        }
    }

    pause() {
        if (this.audioPlayer && this.isPlaying) {
            this.audioPlayer.pause();
            return true;
        }
        return false;
    }

    resume() {
        if (this.audioPlayer && this.isPaused) {
            this.audioPlayer.unpause();
            return true;
        }
        return false;
    }

    skip() {
        if (this.audioPlayer && this.isPlaying) {
            this.audioPlayer.stop();
            return true;
        }
        return false;
    }

    stop() {
        this.queue = [];
        if (this.audioPlayer) {
            this.audioPlayer.stop();
        }
        this.isPlaying = false;
        this.currentSong = null;
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.audioPlayer && this.audioPlayer.state.resource) {
            this.audioPlayer.state.resource.volume.setVolume(this.volume);
        }
    }

    shuffle() {
        for (let i = this.queue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
        }
    }

    clearQueue() {
        this.queue = [];
    }

    getQueue() {
        return {
            current: this.currentSong,
            upcoming: this.queue.slice(0, 10), // Show next 10 songs
            total: this.queue.length
        };
    }

    cleanup() {
        this.stop();
        if (this.voiceConnection) {
            this.voiceConnection.destroy();
            this.voiceConnection = null;
        }
        if (this.audioPlayer) {
            this.audioPlayer.stop();
            this.audioPlayer = null;
        }
    }

    formatDuration(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
}

module.exports = MusicPlayer;