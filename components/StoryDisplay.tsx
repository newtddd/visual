import React, { useEffect, useRef } from 'react';
import { LoadingState } from '../types';
import { IconVolumeUp, IconStop, IconSparkles } from './Icons';

interface StoryDisplayProps {
  storyText: string | null;
  loadingState: LoadingState;
  onGenerate: () => void;
  onPlayAudio: () => void;
  onStopAudio: () => void;
  canGenerate: boolean;
}

const StoryDisplay: React.FC<StoryDisplayProps> = ({
  storyText,
  loadingState,
  onGenerate,
  onPlayAudio,
  onStopAudio,
  canGenerate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (storyText && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [storyText]);

  const isGeneratingStory = loadingState === LoadingState.ANALYZING;
  const isGeneratingAudio = loadingState === LoadingState.GENERATING_AUDIO;
  const isPlayingAudio = loadingState === LoadingState.PLAYING_AUDIO;

  if (!storyText && !isGeneratingStory) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center border border-gray-800 rounded-2xl bg-gray-900/50">
        <IconSparkles className="w-16 h-16 text-gray-700 mb-4" />
        <h3 className="text-xl font-semibold text-gray-300 mb-2">Ready to be Inspired</h3>
        <p className="text-gray-500 max-w-sm">
          Upload an image and let the AI analyze the scene to write a unique story opening for you.
        </p>
        <button
          onClick={onGenerate}
          disabled={!canGenerate}
          className={`mt-8 flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg shadow-lg shadow-primary-500/20 transition-all duration-300
            ${canGenerate 
              ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white hover:scale-105 hover:shadow-primary-500/40' 
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
        >
          <IconSparkles className="w-6 h-6" />
          Generate Story
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-6 h-full">
      {/* Loading State for Story */}
      {isGeneratingStory && (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 font-mono">Analyzing scene mood & lighting...</p>
        </div>
      )}

      {/* Story Content */}
      {storyText && !isGeneratingStory && (
        <div className="animate-fade-in-up">
           <div className="prose prose-invert prose-lg max-w-none">
             <div className="bg-gray-800/40 p-8 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-sm relative overflow-hidden">
               {/* Decorative quote marks */}
               <span className="absolute top-4 left-4 text-6xl text-primary-500/10 font-serif leading-none">“</span>
               
               <p className="text-gray-200 font-serif leading-relaxed text-xl relative z-10 first-letter:text-5xl first-letter:font-bold first-letter:text-primary-400 first-letter:mr-2 first-letter:float-left">
                 {storyText}
               </p>

                <div className="mt-8 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-mono">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    AI Generated
                  </div>

                  {isPlayingAudio ? (
                    <button
                      onClick={onStopAudio}
                      className="flex items-center gap-2 px-6 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 rounded-full transition-colors font-medium"
                    >
                      <IconStop className="w-5 h-5" />
                      Stop Reading
                    </button>
                  ) : (
                    <button
                      onClick={onPlayAudio}
                      disabled={isGeneratingAudio}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all duration-300 border
                        ${isGeneratingAudio 
                          ? 'bg-gray-800 text-gray-500 border-transparent cursor-wait' 
                          : 'bg-primary-600/10 text-primary-400 border-primary-500/30 hover:bg-primary-600/20 hover:border-primary-500/50'}`}
                    >
                      {isGeneratingAudio ? (
                        <>
                          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                          Generating Audio...
                        </>
                      ) : (
                        <>
                          <IconVolumeUp className="w-5 h-5" />
                          Read Aloud
                        </>
                      )}
                    </button>
                  )}
                </div>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default StoryDisplay;
