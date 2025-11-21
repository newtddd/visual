export interface StoryData {
  text: string;
  timestamp: number;
}

export interface ImageFileData {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING', // Generating story
  GENERATING_AUDIO = 'GENERATING_AUDIO', // Generating TTS
  PLAYING_AUDIO = 'PLAYING_AUDIO',
}
