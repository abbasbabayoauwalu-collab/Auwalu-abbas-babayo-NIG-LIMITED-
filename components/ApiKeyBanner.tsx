import React from 'react';
import { Key } from 'lucide-react';
import { promptApiKeySelection } from '../services/geminiService';

interface ApiKeyBannerProps {
  onKeySelected: () => void;
}

const ApiKeyBanner: React.FC<ApiKeyBannerProps> = ({ onKeySelected }) => {
  const handleSelectKey = async () => {
    await promptApiKeySelection();
    // In a real scenario, we might wait or listen for a change, 
    // but per instructions we assume success and trigger callback.
    onKeySelected();
  };

  return (
    <div className="bg-indigo-900/50 border-b border-indigo-500/30 p-4 text-center">
      <div className="flex flex-col items-center justify-center gap-2 max-w-md mx-auto">
        <Key className="w-6 h-6 text-indigo-400" />
        <p className="text-sm text-indigo-100">
          This app requires a paid Gemini API key for high-quality image generation.
        </p>
        <button
          onClick={handleSelectKey}
          className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-full transition-colors shadow-lg shadow-indigo-900/50"
        >
          Select API Key
        </button>
        <a 
          href="https://ai.google.dev/gemini-api/docs/billing" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-indigo-300 hover:text-white underline mt-1"
        >
          View Billing Documentation
        </a>
      </div>
    </div>
  );
};

export default ApiKeyBanner;
