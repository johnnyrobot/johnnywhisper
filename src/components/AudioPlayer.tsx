import { useEffect, useRef } from "react";

export default function AudioPlayer(props: {
    audioUrl: string | undefined;
    mimeType: string | undefined;
}) {
    console.log("AudioPlayer props:", props);
    const audioPlayer = useRef<HTMLAudioElement>(null);
    const audioSource = useRef<HTMLSourceElement>(null);

    // Updates src when url changes
    useEffect(() => {
        if (audioPlayer.current && audioSource.current && props.audioUrl) {
            audioSource.current.src = props.audioUrl;
            audioSource.current.type = props.mimeType || 'audio/wav';
            audioPlayer.current.load();
        }
    }, [props.audioUrl, props.mimeType]);

    if (!props.audioUrl) return null;

    return (
        <div className='flex relative z-10 p-4 w-full'>
            <audio
                ref={audioPlayer}
                controls
                className='w-full h-14 rounded-lg bg-white shadow-xl shadow-black/5 ring-1 ring-slate-700/10'
            >
                <source ref={audioSource} />
            </audio>
        </div>
    );
}
