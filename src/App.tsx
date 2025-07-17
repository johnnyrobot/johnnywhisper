import { AudioManager } from "./components/AudioManager";
import Transcript from "./components/Transcript";
import { useTranscriber } from "./hooks/useTranscriber";

function App() {
    const transcriber = useTranscriber();

    return (
        <div className='flex justify-center items-center min-h-screen'>
            <div className='container flex flex-col justify-center items-center'>
                <div className='flex flex-col items-center mb-8'>
                    <img 
                        src='/Robot 550x700.png' 
                        alt='Johnny Whisper Robot' 
                        className='w-96 h-[30rem] mb-4 object-contain'
                    />
                    <h1 className='text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl text-center font-roboto'>
                        Johnny Whisper
                    </h1>
                    <h2 className='mt-3 mb-5 px-4 text-center text-1xl font-semibold tracking-tight text-slate-900 sm:text-2xl font-roboto'>
                        AI-powered speech recognition directly in your browser
                    </h2>
                </div>
                <AudioManager transcriber={transcriber} />
                <Transcript transcribedData={transcriber.output} />
            </div>


        </div>
    );
}

export default App;
