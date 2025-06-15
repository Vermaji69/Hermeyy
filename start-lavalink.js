const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Lavalink server...');

// Start Lavalink using Docker Compose
const lavalink = spawn('docker-compose', ['up', '-d'], {
    cwd: __dirname,
    stdio: 'inherit'
});

lavalink.on('close', (code) => {
    if (code === 0) {
        console.log('✅ Lavalink server started successfully!');
        console.log('🔗 Lavalink is running on http://localhost:2333');
        console.log('🔑 Password: youshallnotpass');
        
        // Wait a moment for Lavalink to fully start, then start the bot
        setTimeout(() => {
            console.log('🎵 Starting Discord bot...');
            const bot = spawn('node', ['index.js'], {
                cwd: __dirname,
                stdio: 'inherit'
            });
            
            bot.on('close', (botCode) => {
                console.log(`Bot exited with code ${botCode}`);
            });
        }, 5000);
    } else {
        console.error(`❌ Lavalink failed to start with code ${code}`);
        console.log('💡 Make sure Docker and Docker Compose are installed and running');
    }
});

lavalink.on('error', (error) => {
    console.error('❌ Failed to start Lavalink:', error.message);
    console.log('💡 Falling back to starting bot without Lavalink...');
    
    // Fallback: start bot directly
    const bot = spawn('node', ['index.js'], {
        cwd: __dirname,
        stdio: 'inherit'
    });
});