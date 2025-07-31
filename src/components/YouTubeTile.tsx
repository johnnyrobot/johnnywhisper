import React, { useState } from "react";
import { YouTubeExtractor } from "../utils/YouTubeExtractor";
import { YouTubeVideoInfo } from "../types";

interface YouTubeTileProps {
    icon: React.ReactNode;
    text: string;
    onVideoSelect: (videoInfo: YouTubeVideoInfo) => void;
    disabled?: boolean;
}

export function YouTubeTile({ icon, text, onVideoSelect, disabled = false }: YouTubeTileProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            if (!YouTubeExtractor.isYouTubeUrl(url)) {
                throw new Error("Please enter a valid YouTube URL");
            }

            const videoInfo = await YouTubeExtractor.getVideoInfo(url);
            if (!videoInfo) {
                throw new Error("Failed to extract video information");
            }

            onVideoSelect(videoInfo);
            setIsModalOpen(false);
            setUrl("");
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setUrl("");
        setError(null);
    };

    return (
        <>
            <button
                onClick={() => setIsModalOpen(true)}
                disabled={disabled}
                className={`flex items-center justify-center rounded-lg p-2 bg-blue text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 ${
                    disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
                <div className="w-7 h-7">{icon}</div>
                {text && (
                    <div className="ml-2 break-text text-center text-md w-30">
                        {text}
                    </div>
                )}
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold mb-4">Enter YouTube URL</h3>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <input
                                    type="url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                    disabled={isLoading}
                                />
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-red-600 text-sm">{error}</p>
                                </div>
                            )}

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={isLoading}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading || !url.trim()}
                                    className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoading ? "Loading..." : "Extract Audio"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

// YouTube icon component
export function YouTubeIcon() {
    return (
        <svg
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="currentColor"
        >
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
    );
}
