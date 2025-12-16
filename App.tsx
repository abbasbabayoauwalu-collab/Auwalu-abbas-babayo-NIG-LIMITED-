import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, Image as ImageIcon, Loader2, Settings2, SlidersHorizontal, Wand2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid'; // Actually we don't have uuid package, use simple random
import { Wallpaper, GenerationSettings } from './types';
import { checkApiKey, generateWallpaperBatch } from './services/geminiService';
import ApiKeyBanner from './components/ApiKeyBanner';
import SettingsPanel from './components/SettingsPanel';
import ImageModal from './components/ImageModal';

const App: React.FC = () => {
  const [hasKey, setHasKey] = useState<boolean>(true); // Default true to prevent flash, checked on mount
  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [selectedWallpaper, setSelectedWallpaper] = useState<Wallpaper | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  
  const [settings, setSettings] = useState<GenerationSettings>({
    aspectRatio: '9:16',
    resolution: '1K',
    colorPalette: 'Default',
    artStyle: 'Default',
    detailLevel: 'Default',
  });

  const [error, setError] = useState<string | null>(null);
  const [remixSource, setRemixSource] = useState<Wallpaper | null>(null);

  useEffect(() => {
    const verifyKey = async () => {
      try {
        const keyExists = await checkApiKey();
        setHasKey(keyExists);
      } catch (e) {
        console.error("Failed to check API key status", e);
        setHasKey(false);
      }
    };
    verifyKey();
  }, []);

  const handleGenerate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim()) return;
    if (!hasKey) {
      setError("Please select an API key to continue.");
      return;
    }

    setLoading(true);
    setError(null);
    setShowSettings(false); // Auto close settings on generate

    try {
      const generatedImages = await generateWallpaperBatch(
        prompt,
        settings,
        remixSource?.url
      );

      const newWallpapers: Wallpaper[] = generatedImages.map(url => ({
        id: Math.random().toString(36).substring(7),
        url,
        prompt: prompt,
        timestamp: Date.now(),
      }));

      // Prepend new wallpapers
      setWallpapers(prev => [...newWallpapers, ...prev]);
      
      // Clear remix source after successful generation
      if (remixSource) {
        setRemixSource(null);
      }
    } catch (err: any) {
      console.error(err);
      if (err.message === "API_KEY_ERROR") {
        setHasKey(false);
        setError("API Key authentication failed. Please select a valid key.");
      } else {
        setError("Failed to generate wallpapers. The model might be busy or the prompt blocked.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemix = (wallpaper: Wallpaper) => {
    setSelectedWallpaper(null); // Close modal
    setRemixSource(wallpaper);
    setPrompt(wallpaper.prompt); // Keep old prompt
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearRemix = () => {
    setRemixSource(null);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-20">
      
      {!hasKey && (
        <ApiKeyBanner onKeySelected={() => setHasKey(true)} />
      )}

      <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 rounded-lg">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              VibeScape
            </h1>
          </div>
          {/* Mobile indicator for remix state if scrolled down */}
          {remixSource && (
            <div className="hidden sm:flex items-center gap-2 text-xs bg-indigo-900/30 px-3 py-1 rounded-full border border-indigo-500/30 text-indigo-300">
              <Sparkles className="w-3 h-3" />
              Remix Mode Active
            </div>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-6">
        
        {/* Input Section */}
        <section className="mb-8">
          <form onSubmit={handleGenerate} className="relative z-10">
            
            {remixSource && (
              <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 border-b-0 rounded-t-2xl p-3 px-4 animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-3">
                  <img src={remixSource.url} alt="Reference" className="w-8 h-12 object-cover rounded border border-zinc-700" />
                  <div>
                    <p className="text-xs text-indigo-400 font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Remixing Reference
                    </p>
                    <p className="text-xs text-zinc-500 truncate max-w-[150px]">{remixSource.prompt}</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={clearRemix}
                  className="text-xs text-zinc-400 hover:text-white px-2 py-1 hover:bg-zinc-800 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className={`relative bg-zinc-900 border ${remixSource ? 'rounded-b-2xl rounded-tr-2xl border-indigo-500/50' : 'rounded-2xl border-zinc-800'} shadow-xl transition-all focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500`}>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your vibe (e.g., neon rainy cyberpunk city, lo-fi aesthetic)..."
                className="w-full bg-transparent text-lg p-4 pb-16 min-h-[120px] resize-none focus:outline-none placeholder:text-zinc-600 rounded-2xl"
              />
              
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                 <button
                  type="button"
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-2 rounded-xl transition-colors flex items-center gap-2 text-xs font-medium ${showSettings ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}
                  title="Settings"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  <span className="hidden sm:inline">Settings</span>
                </button>

                <button
                  type="submit"
                  disabled={loading || !prompt.trim()}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-semibold transition-all active:scale-95"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-5 h-5" />
                      Generate
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Settings Expandable Panel */}
          {showSettings && (
            <div className="mt-4 animate-in slide-in-from-top-4 fade-in duration-200">
               <SettingsPanel settings={settings} onChange={setSettings} />
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-900/20 border border-red-800/50 rounded-xl text-red-200 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              {error}
            </div>
          )}
        </section>

        {/* Gallery Grid */}
        <section className="space-y-6">
          {wallpapers.length === 0 && !loading && (
            <div className="text-center py-20 opacity-50">
              <div className="w-20 h-20 bg-zinc-900 rounded-3xl mx-auto mb-4 flex items-center justify-center border border-zinc-800">
                <ImageIcon className="w-10 h-10 text-zinc-600" />
              </div>
              <p className="text-zinc-400">No vibes generated yet.</p>
              <p className="text-zinc-600 text-sm">Enter a prompt above to get started.</p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {loading && (
              // Skeleton Loading State
              Array(4).fill(null).map((_, i) => (
                <div key={`skel-${i}`} className="aspect-[9/16] bg-zinc-900 rounded-xl animate-pulse border border-zinc-800 flex items-center justify-center overflow-hidden relative">
                   <div className="absolute inset-0 bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-900 animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
                </div>
              ))
            )}

            {wallpapers.map((wallpaper) => (
              <button
                key={wallpaper.id}
                onClick={() => setSelectedWallpaper(wallpaper)}
                className="group relative aspect-[9/16] rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 transition-transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <img
                  src={wallpaper.url}
                  alt={wallpaper.prompt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                   <p className="text-xs text-white line-clamp-2 text-left">{wallpaper.prompt}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

      </main>
      
      {/* Full Screen Modal */}
      <ImageModal 
        wallpaper={selectedWallpaper} 
        onClose={() => setSelectedWallpaper(null)} 
        onRemix={handleRemix}
      />
    </div>
  );
};

export default App;
