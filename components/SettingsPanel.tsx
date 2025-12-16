import React from 'react';
import { AspectRatio, ImageResolution, GenerationSettings, ColorPalette, ArtStyle, DetailLevel } from '../types';
import { Smartphone, Monitor, Square, Columns, Palette, Paintbrush, Zap } from 'lucide-react';

interface SettingsPanelProps {
  settings: GenerationSettings;
  onChange: (settings: GenerationSettings) => void;
}

const ASPECT_RATIOS: AspectRatio[] = ['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'];
const RESOLUTIONS: ImageResolution[] = ['1K', '2K', '4K'];
const COLOR_PALETTES: ColorPalette[] = ['Default', 'Warm', 'Cool', 'Monochromatic', 'Pastel', 'Neon', 'Dark', 'Vibrant'];
const ART_STYLES: ArtStyle[] = ['Default', 'Photorealistic', 'Minimalist', 'Abstract', 'Cyberpunk', 'Watercolor', 'Oil Painting', 'Anime', 'Retro', '3D Render'];
const DETAIL_LEVELS: DetailLevel[] = ['Default', 'Simple', 'Balanced', 'Intricate'];

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onChange }) => {
  
  const updateSetting = <K extends keyof GenerationSettings>(key: K, value: GenerationSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  const renderSection = <T extends string>(title: string, icon: React.ReactNode, options: T[], current: T, key: keyof GenerationSettings) => (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          {title}
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => updateSetting(key, option as any)}
            className={`text-xs py-1.5 px-3 rounded-lg border transition-all ${
              current === option
                ? 'bg-zinc-100 text-black border-zinc-100 font-bold shadow-md shadow-white/10'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-zinc-200'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-zinc-900/90 backdrop-blur-md rounded-2xl p-5 border border-zinc-800 space-y-5 shadow-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
           {renderSection('Aspect Ratio', <Smartphone className="w-3 h-3 text-zinc-500" />, ASPECT_RATIOS, settings.aspectRatio, 'aspectRatio')}
           {renderSection('Resolution', <Monitor className="w-3 h-3 text-zinc-500" />, RESOLUTIONS, settings.resolution, 'resolution')}
        </div>
        
        <div className="space-y-4">
           {renderSection('Art Style', <Paintbrush className="w-3 h-3 text-zinc-500" />, ART_STYLES, settings.artStyle, 'artStyle')}
           {renderSection('Color Palette', <Palette className="w-3 h-3 text-zinc-500" />, COLOR_PALETTES, settings.colorPalette, 'colorPalette')}
           {renderSection('Detail Level', <Zap className="w-3 h-3 text-zinc-500" />, DETAIL_LEVELS, settings.detailLevel, 'detailLevel')}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
