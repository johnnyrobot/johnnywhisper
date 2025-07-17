# WhisperWeb YouTube Audio Extraction Server

This backend service handles YouTube audio extraction for the WhisperWeb application using `ytdl-core` and FFmpeg.

## Prerequisites

1. **Node.js** (v16 or higher)
2. **FFmpeg** - Required for audio processing
   - Windows: Download from https://ffmpeg.org/download.html
   - Or install via chocolatey: `choco install ffmpeg`
   - Or install via winget: `winget install FFmpeg`

## Installation

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Verify FFmpeg installation:
   ```bash
   ffmpeg -version
   ```

## Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on port 3001 by default.

## API Endpoints

### GET /api/health
Health check endpoint to verify server status.

### POST /api/youtube/info
Get YouTube video information.
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

### POST /api/youtube/extract-audio
Extract audio from YouTube video.
```json
{
  "url": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

### GET /api/youtube/download/:filename
Download extracted audio file.

## Features

- Extracts audio from YouTube videos
- Converts to WAV format at 16kHz (optimal for Whisper)
- Automatic cleanup of temporary files
- CORS enabled for frontend integration
- Duration limit (10 minutes) for demo purposes
- Progress tracking during extraction

## Integration with WhisperWeb

The frontend will connect to this server to:
1. Validate YouTube URLs
2. Extract audio from videos
3. Download processed audio for transcription

## Troubleshooting

### FFmpeg Not Found
If you get FFmpeg errors, ensure it's properly installed and available in your system PATH.

### CORS Issues
The server includes CORS middleware to allow requests from the frontend.

### Port Conflicts
Change the port by setting the PORT environment variable:
```bash
PORT=3002 npm start
```
