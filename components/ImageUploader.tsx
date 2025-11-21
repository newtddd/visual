import React, { useRef } from 'react';
import { ImageFileData } from '../types';
import { IconPhoto, IconUpload } from './Icons';

interface ImageUploaderProps {
  onImageSelected: (data: ImageFileData) => void;
  selectedImage: ImageFileData | null;
  disabled: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, selectedImage, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // Only process images
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64Content = result.split(',')[1];
      
      onImageSelected({
        file,
        previewUrl: result,
        base64: base64Content,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
        disabled={disabled}
      />
      
      {selectedImage ? (
        <div className="relative group rounded-2xl overflow-hidden shadow-2xl border border-gray-700 bg-gray-800 aspect-[4/3] w-full">
            <img 
              src={selectedImage.previewUrl} 
              alt="Selected" 
              className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-75"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
               <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full font-medium border border-white/20 hover:bg-black/80 transition-colors"
                  disabled={disabled}
               >
                 Change Image
               </button>
            </div>
        </div>
      ) : (
        <div
          onClick={() => !disabled && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`aspect-[4/3] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300
            ${disabled ? 'opacity-50 cursor-not-allowed border-gray-700' : 'border-gray-600 hover:border-primary-500 hover:bg-gray-800/50 bg-gray-800/20'}`}
        >
          <div className="bg-gray-800 p-4 rounded-full mb-4 shadow-lg ring-1 ring-white/10">
             <IconPhoto className="w-8 h-8 text-primary-500" />
          </div>
          <p className="text-gray-300 font-medium text-lg">Upload an Image</p>
          <p className="text-gray-500 text-sm mt-1">Click or drag & drop</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
