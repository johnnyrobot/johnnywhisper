# Johnny Whisper

AI-powered speech recognition directly in your browser!

This application allows you to transcribe audio from your microphone, local files, and YouTube videos.

## Requirements

- Node.js (v18.x or later recommended)
- FFmpeg

## Installation & Setup

These instructions assume you have already downloaded the application files.

### 1. Install FFmpeg

FFmpeg is required for the YouTube transcription feature. The easiest way to install it on Windows is with the `winget` command in your terminal:

```bash
winget install Gyan.FFmpeg.Full
```

Alternatively, you can download it from the official FFmpeg website and add its `bin` directory to your system's PATH.

### 2. Install Dependencies

This project has two parts: a frontend application and a backend server for YouTube processing. You need to install the dependencies for both.

- **For the Frontend:**
  Navigate to the root directory of the project and run:
  ```bash
  npm install
  ```

- **For the Backend:**
  Navigate to the `server` directory and run:
  ```bash
  npm install
  ```

## Running the Application

You must have both the frontend and backend servers running for the application to be fully functional.

- **To start the Backend Server:**
  In your terminal, from the `server` directory, run:
  ```bash
  npm start
  ```
  The server will be running on `http://localhost:3001`.

- **To start the Frontend Application:**
  In a separate terminal, from the project's root directory, run:
  ```bash
  npm run dev
  ```
  The application will be available at `http://localhost:5173` (or the next available port).

Once both are running, you can open your browser to the frontend URL to use the application.
