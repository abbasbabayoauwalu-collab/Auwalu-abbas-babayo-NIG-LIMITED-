import { GoogleGenAI } from "@google/genai";
import { GenerationSettings } from "../types";

// Removed conflicting global declaration for Window.aistudio to avoid TypeScript errors.
// Accessing window.aistudio via (window as any) to ensure compatibility.

/**
 * Checks if the user has selected an API key.
 */
export const checkApiKey = async (): Promise<boolean> => {
  const aistudio = (window as any).aistudio;
  if (aistudio && aistudio.hasSelectedApiKey) {
    return await aistudio.hasSelectedApiKey();
  }
  return true; // Fallback if not in the specific environment, though instructions imply we should be strict.
};

/**
 * Prompts the user to select an API key.
 */
export const promptApiKeySelection = async (): Promise<void> => {
  const aistudio = (window as any).aistudio;
  if (aistudio && aistudio.openSelectKey) {
    await aistudio.openSelectKey();
  } else {
    console.warn("AI Studio key selection interface not found.");
  }
};

/**
 * Generates a single image wallpaper using Gemini 3 Pro Image Preview.
 */
export const generateSingleWallpaper = async (
  prompt: string,
  settings: GenerationSettings,
  referenceImageBase64?: string
): Promise<string> => {
  // Always create a new instance to get the latest key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const parts: any[] = [];
  
  // Construct a richer prompt based on settings
  let finalPrompt = prompt;
  if (settings.artStyle !== 'Default') finalPrompt += `, in ${settings.artStyle} style`;
  if (settings.colorPalette !== 'Default') finalPrompt += `, using a ${settings.colorPalette} color palette`;
  if (settings.detailLevel !== 'Default') finalPrompt += `, ${settings.detailLevel} level of detail`;

  // If remixing, add the reference image first
  if (referenceImageBase64) {
    // Strip header if present to get raw base64
    const base64Data = referenceImageBase64.split(',')[1] || referenceImageBase64;
    parts.push({
      inlineData: {
        mimeType: 'image/png', // Assuming PNG for simplicity, usually safe for data URLs
        data: base64Data,
      },
    });
    parts.push({
      text: `Create a new variation of this image with the following vibe: ${finalPrompt}. Maintain the composition but evolve the style.`,
    });
  } else {
    parts.push({ text: finalPrompt });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: parts,
      },
      config: {
        imageConfig: {
          aspectRatio: settings.aspectRatio,
          imageSize: settings.resolution,
        },
      },
    });

    let imageUrl = "";
    
    // Parse response for image data
    if (response.candidates && response.candidates[0].content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          // We can assume PNG usually, but checking mimeType is better if provided
          const mimeType = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mimeType};base64,${base64EncodeString}`;
          break;
        }
      }
    }

    if (!imageUrl) {
      throw new Error("No image data found in response.");
    }

    return imageUrl;

  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    // If it's the specific "Requested entity was not found" error, it might be an API key issue
    if (error.message && error.message.includes("Requested entity was not found")) {
      throw new Error("API_KEY_ERROR");
    }
    throw error;
  }
};

/**
 * Helper to generate 4 variations in parallel.
 */
export const generateWallpaperBatch = async (
  prompt: string,
  settings: GenerationSettings,
  referenceImageBase64?: string
): Promise<string[]> => {
  
  // Run 4 requests in parallel
  const promises = Array(4).fill(null).map(() => 
    generateSingleWallpaper(prompt, settings, referenceImageBase64)
  );

  const results = await Promise.all(promises);
  return results;
};
