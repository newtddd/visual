import React, { useState, useRef, useEffect } from 'react';
import ImageUploader from './components/ImageUploader';
import StoryDisplay from './components/StoryDisplay';
import { generateStoryFromImage, generateSpeech } from './services/geminiService';
import { ImageFileData, LoadingState } from './types';

function App() {
  const [selectedImage, setSelectedImage] = useState<ImageFileData | null>(null);
  const [storyText, setStoryText] = useState<string | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Initialize Audio Context on user interaction to comply with browser autoplay policies
  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000
      });
    }
    // Resume if suspended
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const handleGenerateStory = async () => {
    if (!selectedImage) return;

    setLoadingState(LoadingState.ANALYZING);
    setStoryText(null);
    stopAudio();

    try {
      const text = await generateStoryFromImage(selectedImage.base64, selectedImage.mimeType);
      setStoryText(text);
    } catch (err) {
      console.error(err);
      alert('Failed to generate story. Please check your API key and try again.');
    } finally {
      setLoadingState(LoadingState.IDLE);
    }
  };

  const handlePlayAudio = async () => {
    if (!storyText) return;
    
    initAudioContext();
    stopAudio(); // Stop any currently playing audio

    setLoadingState(LoadingState.GENERATING_AUDIO);

    try {
      if (!audioContextRef.current) throw new Error("Audio Context not initialized");

      const buffer = await generateSpeech(storyText, audioContextRef.current);
      
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setLoadingState(LoadingState.IDLE);
      
      audioSourceRef.current = source;
      source.start();
      setLoadingState(LoadingState.PLAYING_AUDIO);

    } catch (err) {
      console.error(err);
      alert('Failed to generate speech. Please try again.');
      setLoadingState(LoadingState.IDLE);
    }
  };

  const stopAudio = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {
        // Ignore errors if already stopped
      }
      audioSourceRef.current = null;
    }
    setLoadingState((prev) => prev === LoadingState.PLAYING_AUDIO ? LoadingState.IDLE : prev);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-gradient-to-tr from-primary-600 to-blue-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                 <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8Z" opacity="0.5" />
                 <path d="M12 6a6 6 0 1 0 6 6 6 6 0 0 0-6-6Zm0 10a4 4 0 1 1 4-4 4 4 0 0 1-4 4Z" />
               </svg>
             </div>
             <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
               Visual Muse
             </h1>
          </div>
          <div className="text-xs font-mono text-gray-600 bg-gray-900 px-3 py-1 rounded-full border border-gray-800">
            Powered by Gemini 3.0 Pro & 2.5 Flash
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 h-full">
          
          {/* Left Column: Image Upload */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="sticky top-24">
              <h2 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-700">1</span>
                Upload Inspiration
              </h2>
              <ImageUploader 
                onImageSelected={setSelectedImage} 
                selectedImage={selectedImage}
                disabled={loadingState !== LoadingState.IDLE && loadingState !== LoadingState.PLAYING_AUDIO}
              />
              
              <div className="mt-6 p-4 rounded-xl bg-gray-900/50 border border-gray-800 text-sm text-gray-400">
                <h4 className="font-semibold text-gray-300 mb-1">How it works</h4>
                <p>Upload any photo—a landscape, a portrait, or abstract art. The AI will analyze the visual elements and write a custom story opening based on the mood.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Story & Controls */}
          <div className="lg:col-span-7 flex flex-col h-full min-h-[500px]">
            <h2 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
               <span className="w-6 h-6 rounded-full bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500 border border-gray-700">2</span>
               Generated Story
            </h2>
            <div className="flex-1">
              <StoryDisplay 
                storyText={storyText}
                loadingState={loadingState}
                onGenerate={handleGenerateStory}
                onPlayAudio={handlePlayAudio}
                onStopAudio={stopAudio}
                canGenerate={!!selectedImage}
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-800 py-6 text-center text-gray-600 text-sm mt-auto bg-gray-950">
        <p>Built with React, Tailwind & Google Gemini API</p>
      </footer>
    </div>
  );
}

export default App;
