export type AspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9';
export type ImageResolution = '1K' | '2K' | '4K';

export type ColorPalette = 'Default' | 'Warm' | 'Cool' | 'Monochromatic' | 'Pastel' | 'Neon' | 'Dark' | 'Vibrant';
export type ArtStyle = 'Default' | 'Photorealistic' | 'Minimalist' | 'Abstract' | 'Cyberpunk' | 'Watercolor' | 'Oil Painting' | 'Anime' | 'Retro' | '3D Render';
export type DetailLevel = 'Default' | 'Simple' | 'Balanced' | 'Intricate';

export interface GenerationSettings {
  aspectRatio: AspectRatio;
  resolution: ImageResolution;
  colorPalette: ColorPalette;
  artStyle: ArtStyle;
  detailLevel: DetailLevel;
}

export interface Wallpaper {
  id: string;
  url: string; // Base64 data URL
  prompt: string;
  timestamp: number;
}

export interface GeneratedImageResponse {
  base64: string;
  mimeType: string;
}
