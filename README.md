# Johnny Whisper

AI-powered speech recognition directly in your browser!

This application allows you to transcribe audio from your microphone, local files, and YouTube videos using OpenAI's Whisper model running entirely in your browser.

## Features

- **Microphone Recording**: Real-time audio transcription
- **File Upload**: Transcribe local audio files
- **YouTube Integration**: Extract and transcribe audio from YouTube videos
- **Browser-based**: No data leaves your device for privacy
- **Fast Processing**: Powered by Transformers.js

## System Requirements

- **Node.js**: v18.0.0 or later
- **FFmpeg**: Required for YouTube audio extraction
- **Modern Browser**: Chrome, Firefox, Safari, or Edge (latest versions)
- **RAM**: At least 4GB recommended for optimal performance
- **Storage**: ~500MB for dependencies and models

## Installation Instructions

### Windows Installation

#### Step 1: Install Node.js
1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Choose the LTS version (recommended)
3. Run the installer and follow the setup wizard
4. Verify installation by opening Command Prompt or PowerShell and running:
   ```cmd
   node --version
   npm --version
   ```

#### Step 2: Install FFmpeg
Choose one of the following methods:

**Method A: Using winget (Recommended)**
```cmd
winget install Gyan.FFmpeg.Full
```

**Method B: Manual Installation**
1. Download FFmpeg from [ffmpeg.org](https://ffmpeg.org/download.html#build-windows)
2. Extract the archive to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to your system PATH:
   - Press `Win + R`, type `sysdm.cpl`, press Enter
   - Click "Environment Variables"
   - Under "System Variables", find and select "Path", click "Edit"
   - Click "New" and add `C:\ffmpeg\bin`
   - Click "OK" on all dialogs
4. Verify installation:
   ```cmd
   ffmpeg -version
   ```

#### Step 3: Install Project Dependencies
1. Open Command Prompt or PowerShell as Administrator
2. Navigate to the project directory:
   ```cmd
   cd path\to\johnnywhisper
   ```
3. Install frontend dependencies:
   ```cmd
   npm install
   ```
4. Navigate to the server directory and install backend dependencies:
   ```cmd
   cd server
   npm install
   cd ..
   ```

### macOS Installation

#### Step 1: Install Node.js
Choose one of the following methods:

**Method A: Using Homebrew (Recommended)**
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node
```

**Method B: Direct Download**
1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Choose the LTS version for macOS
3. Run the installer package
4. Verify installation:
   ```bash
   node --version
   npm --version
   ```

#### Step 2: Install FFmpeg
```bash
# Using Homebrew
brew install ffmpeg

# Verify installation
ffmpeg -version
```

#### Step 3: Install Project Dependencies
1. Open Terminal
2. Navigate to the project directory:
   ```bash
   cd path/to/johnnywhisper
   ```
3. Install frontend dependencies:
   ```bash
   npm install
   ```
4. Navigate to the server directory and install backend dependencies:
   ```bash
   cd server
   npm install
   cd ..
   ```

## Running the Application

Johnny Whisper consists of two components that must both be running:
1. **Backend Server**: Handles YouTube audio extraction
2. **Frontend Application**: The main web interface

### Starting the Application

#### Option 1: Quick Start (Recommended)
From the project root directory:

**Windows:**
```cmd
# Start both frontend and backend in one command
npm start
```

**macOS:**
```bash
# Start both frontend and backend in one command
npm start
```

This will:
- Build the frontend application
- Start the backend server on `http://localhost:3001`
- The built frontend will be served by the backend

#### Option 2: Development Mode (For Development)
If you want to run in development mode with hot reloading:

**Terminal 1 - Start Backend Server:**
```bash
cd server
npm start
```
The server will run on `http://localhost:3001`

**Terminal 2 - Start Frontend Development Server:**
```bash
# From project root
npm run dev
```
The frontend will run on `http://localhost:5173`

### Accessing the Application

1. **Production Mode**: Open your browser to `http://localhost:3001`
2. **Development Mode**: Open your browser to `http://localhost:5173`

## Usage Guide

### Microphone Transcription
1. Click the "Record" button
2. Allow microphone permissions when prompted
3. Speak clearly into your microphone
4. Click "Stop" to end recording and start transcription

### File Upload Transcription
1. Click "Upload File"
2. Select an audio file (MP3, WAV, M4A, etc.)
3. Wait for the file to process and transcribe

### YouTube Video Transcription
1. Paste a YouTube URL into the input field
2. Click "Transcribe YouTube"
3. The system will extract audio and transcribe it

## Troubleshooting

### Common Issues

#### "FFmpeg not found" Error
- **Windows**: Ensure FFmpeg is in your PATH. Restart Command Prompt after installation.
- **macOS**: Try reinstalling with `brew reinstall ffmpeg`

#### Port Already in Use
If you see "Port 3001 already in use":
```bash
# Find and kill the process using the port
# Windows:
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F

# macOS:
lsof -ti:3001 | xargs kill -9
```

#### Memory Issues
If the browser becomes unresponsive:
- Close other browser tabs
- Ensure you have at least 4GB RAM available
- Try using a smaller audio file

#### YouTube Download Fails
- Check your internet connection
- Verify the YouTube URL is correct and the video is publicly accessible
- Some videos may be region-restricted or have download protection

### Performance Tips

1. **Use Chrome or Edge** for best performance with WebAssembly
2. **Close unnecessary browser tabs** to free up memory
3. **Use shorter audio clips** (under 10 minutes) for faster processing
4. **Ensure stable internet** for YouTube transcription

## Development

### Available Scripts

**Frontend (Root Directory):**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

**Backend (Server Directory):**
- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload

### Project Structure
```
johnnywhisper/
├── src/                 # Frontend React application
├── server/              # Backend Express server
│   ├── server.js       # Main server file
│   └── package.json    # Backend dependencies
├── public/             # Static assets
├── dist/               # Built frontend (generated)
└── package.json        # Frontend dependencies
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Ensure all prerequisites are properly installed
3. Verify both frontend and backend servers are running
4. Check browser console for error messages

For additional help, please refer to the project documentation or create an issue in the project repository.
