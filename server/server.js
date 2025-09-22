const express = require('express');
const cors = require('cors');
const ytdl = require('@distube/ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Use stable browser-like headers to improve reliability with YouTube
const REQUEST_HEADERS = {
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'accept-language': 'en-US,en;q=0.9',
};
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '..', 'dist')));

// Create temp directory for audio files
const tempDir = path.join(__dirname, 'temp');
fs.ensureDirSync(tempDir);

// Clean up old files periodically (every hour)
setInterval(() => {
    const files = fs.readdirSync(tempDir);
    const now = Date.now();
    
    files.forEach(file => {
        const filePath = path.join(tempDir, file);
        const stats = fs.statSync(filePath);
        const fileAge = now - stats.mtime.getTime();
        
        // Delete files older than 1 hour
        if (fileAge > 60 * 60 * 1000) {
            fs.removeSync(filePath);
            console.log(`Cleaned up old file: ${file}`);
        }
    });
}, 60 * 60 * 1000);

// Validate YouTube URL
function isValidYouTubeUrl(url) {
    return ytdl.validateURL(url);
}

// Extract video ID from URL
function getVideoId(url) {
    const videoId = ytdl.getVideoID(url);
    return videoId;
}

// Get video info
app.post('/api/youtube/info', async (req, res) => {
    console.log('Received request for /api/youtube/info');
    console.log('Request body:', req.body);
    try {
        const { url } = req.body;
        
        if (!url) {
            console.log('URL is missing from the request body');
            return res.status(400).json({ error: 'URL is required' });
        }
        
        console.log('Validating YouTube URL:', url);
        if (!isValidYouTubeUrl(url)) {
            console.log('Invalid YouTube URL:', url);
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }
        
        console.log('Fetching video info for:', url);
        const info = await ytdl.getInfo(url, { requestOptions: { headers: REQUEST_HEADERS } });
        const videoDetails = info.videoDetails;
        
        console.log('Successfully fetched video info for:', videoDetails.title);
        
        res.json({
            videoId: videoDetails.videoId,
            title: videoDetails.title,
            duration: videoDetails.lengthSeconds,
            author: videoDetails.author.name,
            thumbnail: videoDetails.thumbnails[0]?.url
        });
        
    } catch (error) {
        console.error('Error getting video info:', error.message || error);
        console.error('Full error:', error);
        res.status(500).json({ error: 'Failed to get video information', details: error.message });
    }
});

// Extract audio from YouTube video
app.post('/api/youtube/extract-audio', async (req, res) => {
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        
        if (!isValidYouTubeUrl(url)) {
            return res.status(400).json({ error: 'Invalid YouTube URL' });
        }
        
        const videoId = getVideoId(url);
        const audioFileName = `${videoId}_${uuidv4()}.wav`;
        const audioFilePath = path.join(tempDir, audioFileName);
        
        console.log(`Starting audio extraction for video: ${videoId}`);
        
        // Get video info to check duration
        const info = await ytdl.getInfo(url);
        const duration = parseInt(info.videoDetails.lengthSeconds);
        
        console.log(`Video duration: ${duration} seconds (${Math.floor(duration/60)}:${duration%60})`);
        
        // Limit to 20 minutes for optimal transcription quality
        if (duration > 1200) {
            console.log(`Video rejected: ${duration} seconds > 1200 seconds`);
            return res.status(400).json({ 
                error: 'Video is too long. Please use videos shorter than 20 minutes for best transcription quality.' 
            });
        }
        
        // Create a promise to handle the audio extraction
        const extractionPromise = new Promise((resolve, reject) => {
            const stream = ytdl(url, {
                quality: 'highestaudio',
                filter: 'audioonly',
                requestOptions: { headers: REQUEST_HEADERS }
            });
            
            ffmpeg(stream)
                .audioBitrate(128)
                .audioChannels(1)
                .audioFrequency(16000)
                .format('wav')
                .on('start', (commandLine) => {
                    console.log('FFmpeg started with command:', commandLine);
                })
                .on('progress', (progress) => {
                    console.log('Processing: ' + progress.percent + '% done');
                })
                .on('end', () => {
                    console.log('Audio extraction completed');
                    resolve(audioFilePath);
                })
                .on('error', (err) => {
                    console.error('FFmpeg error:', err);
                    reject(err);
                })
                .save(audioFilePath);
        });
        
        // Wait for extraction to complete
        await extractionPromise;
        
        // Check if file exists and has content
        if (!fs.existsSync(audioFilePath)) {
            throw new Error('Audio file was not created');
        }
        
        const stats = fs.statSync(audioFilePath);
        if (stats.size === 0) {
            throw new Error('Audio file is empty');
        }
        
        console.log(`Audio extracted successfully: ${audioFilePath} (${stats.size} bytes)`);
        
        // Return the file path for download
        res.json({
            success: true,
            audioFile: audioFileName,
            size: stats.size,
            duration: duration,
            downloadUrl: `/api/youtube/download/${audioFileName}`
        });
        
    } catch (error) {
        console.error('Error extracting audio:', error.message || error);
        console.error('Full error:', error);
        res.status(500).json({ error: 'Failed to extract audio from YouTube video', details: error.message });
    }
});

// Download extracted audio file
app.get('/api/youtube/download/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(tempDir, filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'Audio file not found' });
        }
        
        res.setHeader('Content-Type', 'audio/wav');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
        
        // Clean up file after sending (with delay to ensure complete transfer)
        fileStream.on('end', () => {
            setTimeout(() => {
                if (fs.existsSync(filePath)) {
                    fs.removeSync(filePath);
                    console.log(`Cleaned up file: ${filename}`);
                }
            }, 5000);
        });
        
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ error: 'Failed to download audio file' });
    }
});

// Health check endpoint for Docker
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'johnny-whisper'
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`YouTube audio extraction server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    
    // Check if FFmpeg is available
    ffmpeg.getAvailableFormats((err, formats) => {
        if (err) {
            console.error('FFmpeg not found! Please install FFmpeg to use this service.');
            console.error('Download from: https://ffmpeg.org/download.html');
        } else {
            console.log('FFmpeg is available and ready');
        }
    });
});

module.exports = app;
