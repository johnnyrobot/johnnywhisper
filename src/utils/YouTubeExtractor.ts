/**
 * YouTube Audio Extractor
 * Extracts audio from YouTube videos using a backend service with ytdl-core and FFmpeg
 */

import { YouTubeVideoInfo } from '../types';

export function getVideoId(url: string): string | null {
    if (!url) return null;
    try {
        const urlObj = new URL(url);
        if (urlObj.hostname === 'youtu.be') {
            return urlObj.pathname.slice(1);
        }
        if (urlObj.hostname.includes('youtube.com')) {
            return urlObj.searchParams.get('v');
        }
    } catch (e) {
        // Ignore invalid URLs
    }
    return null;
}

export class YouTubeExtractor {
    private static readonly BACKEND_BASE_URL = '/api/youtube';
    
    /**
     * Extract video ID from various YouTube URL formats
     */
    static extractVideoId(url: string): string | null {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/v\/([^&\n?#]+)/,
            /youtube\.com\/watch\?.*v=([^&\n?#]+)/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) {
                return match[1];
            }
        }
        return null;
    }

    /**
     * Validate if URL is a YouTube URL
     */
    static isYouTubeUrl(url: string): boolean {
        return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)/.test(url);
    }

    /**
     * Check if backend service is available
     */
    static async isBackendAvailable(): Promise<boolean> {
        try {
            const response = await fetch(`/api/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(5000) // 5 second timeout
            });
            return response.ok;
        } catch (error) {
            console.warn('Backend service not available:', error);
            return false;
        }
    }

    /**
     * Get video information from YouTube using backend service
     */
    static async getVideoInfo(url: string): Promise<YouTubeVideoInfo | null> {
        try {
            if (!this.isYouTubeUrl(url)) {
                throw new Error('Invalid YouTube URL');
            }

            // Check if backend is available
            const backendAvailable = await this.isBackendAvailable();
            if (!backendAvailable) {
                throw new Error('Backend service is not available. Please start the YouTube extraction server.');
            }

            // Get video info from backend
            const response = await fetch(`${this.BACKEND_BASE_URL}/info`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const videoData = await response.json();
            
            return {
                videoId: videoData.videoId,
                title: videoData.title,
                duration: videoData.duration ? `${Math.floor(videoData.duration / 60)}:${(videoData.duration % 60).toString().padStart(2, '0')}` : 'Unknown',
                author: videoData.author,
                thumbnail: videoData.thumbnail
            };
        } catch (error) {
            console.error('Error getting YouTube video info:', error);
            throw error;
        }
    }

    /**
     * Extract audio from YouTube video using backend service
     */
    static async extractAudio(url: string, onProgress?: (progress: number) => void): Promise<string> {
        try {
            if (!this.isYouTubeUrl(url)) {
                throw new Error('Invalid YouTube URL');
            }

            // Check if backend is available
            const backendAvailable = await this.isBackendAvailable();
            if (!backendAvailable) {
                throw new Error('Backend service is not available. Please start the YouTube extraction server.');
            }

            if (onProgress) {
                onProgress(0.1); // Starting extraction
            }

            // Request audio extraction from backend
            const response = await fetch(`${this.BACKEND_BASE_URL}/extract-audio`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const extractionResult = await response.json();
            
            if (onProgress) {
                onProgress(0.8); // Extraction complete, preparing download
            }

            if (!extractionResult.success || !extractionResult.downloadUrl) {
                throw new Error('Audio extraction failed');
            }

            // Return the download URL for the extracted audio
            return extractionResult.downloadUrl;
        } catch (error) {
            console.error('Error extracting YouTube audio:', error instanceof Error ? error.message : String(error));
            console.error('Full error details:', error);
            throw error;
        }
    }

    /**
     * Download audio from the backend service
     */
    static async downloadAudio(videoInfo: YouTubeVideoInfo, onProgress?: (progress: number) => void): Promise<{ buffer: ArrayBuffer, downloadUrl: string }> {
        try {
            // First extract the audio and get download URL
            const downloadUrl = await this.extractAudio(`https://www.youtube.com/watch?v=${videoInfo.videoId}`, (progress) => {
                if (onProgress) {
                    onProgress(progress * 0.7); // First 70% for extraction
                }
            });

            if (onProgress) {
                onProgress(0.7); // Starting download
            }

            // Download the extracted audio file
            const response = await fetch(downloadUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'audio/wav,audio/*,*/*;q=0.9'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to download audio: ${response.status} ${response.statusText}`);
            }

            const contentLength = response.headers.get('content-length');
            const total = contentLength ? parseInt(contentLength, 10) : 0;
            let loaded = 0;

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('Failed to get response reader');
            }

            const chunks: Uint8Array[] = [];

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                chunks.push(value);
                loaded += value.length;

                if (onProgress && total > 0) {
                    // Map download progress to 70-100% range
                    const downloadProgress = loaded / total;
                    onProgress(0.7 + (downloadProgress * 0.3));
                } else if (onProgress) {
                    // If we don't know the total size, show indeterminate progress
                    const estimatedProgress = Math.min(loaded / (1024 * 1024), 0.9);
                    onProgress(0.7 + (estimatedProgress * 0.3));
                }
            }

            // Combine chunks into single ArrayBuffer
            const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
            const result = new Uint8Array(totalLength);
            let offset = 0;
            
            for (const chunk of chunks) {
                result.set(chunk, offset);
                offset += chunk.length;
            }

            console.log(`Successfully downloaded ${totalLength} bytes of audio data`);
            
            if (onProgress) {
                onProgress(1.0); // Complete
            }

            return { buffer: result.buffer, downloadUrl };
        } catch (error) {
            console.error('Error downloading YouTube audio:', error instanceof Error ? error.message : String(error));
            console.error('Full error details:', error);
            throw error;
        }
    }
}
