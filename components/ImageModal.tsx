import React from 'react';
import { Download, RefreshCw, X, Sparkles } from 'lucide-react';
import { Wallpaper } from '../types';

interface ImageModalProps {
  wallpaper: Wallpaper | null;
  onClose: () => void;
  onRemix: (wallpaper: Wallpaper) => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ wallpaper, onClose, onRemix }) => {
  if (!wallpaper) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = wallpaper.url;
    link.download = `vibescape-${wallpaper.id}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 sm:p-8 animate-in fade-in duration-200">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-zinc-800/50 hover:bg-zinc-700 text-white rounded-full transition-colors z-50"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="relative w-full max-w-5xl h-full flex flex-col md:flex-row gap-6 items-center justify-center">
        {/* Image Container */}
        <div className="relative flex-1 h-full w-full flex items-center justify-center overflow-hidden">
          <img 
            src={wallpaper.url} 
            alt={wallpaper.prompt} 
            className="max-h-full max-w-full object-contain rounded-lg shadow-2xl shadow-black"
          />
        </div>

        {/* Controls */}
        <div className="w-full md:w-80 flex flex-col gap-4 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800/50 backdrop-blur-md">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Generated Vibe</h3>
            <p className="text-sm text-zinc-400 italic line-clamp-3">"{wallpaper.prompt}"</p>
          </div>

          <div className="flex flex-col gap-3 mt-auto">
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-zinc-100 hover:bg-zinc-200 text-black font-semibold rounded-xl transition-all active:scale-95"
            >
              <Download className="w-5 h-5" />
              Download Full Res
            </button>
            
            <button
              onClick={() => onRemix(wallpaper)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-900/20"
            >
              <RefreshCw className="w-5 h-5" />
              Remix This Vibe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
