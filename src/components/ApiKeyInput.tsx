
import React from 'react';
import { Key, Info } from "lucide-react";

const ApiKeyInput = () => {
  const hasApiKey = import.meta.env.VITE_GEMINI_API_KEY;

  return (
    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Key className="h-4 w-4 mr-2 text-slate-500" />
          <span className="text-sm font-medium">Gemini API Key</span>
        </div>
        {hasApiKey ? (
          <div className="flex items-center text-xs text-green-600 dark:text-green-400">
            <Info className="h-3 w-3 mr-1" />
            Configured
          </div>
        ) : (
          <div className="flex items-center text-xs text-yellow-600 dark:text-yellow-400">
            <Info className="h-3 w-3 mr-1" />
            Not Configured
          </div>
        )}
      </div>

      <div className="text-xs text-slate-600 dark:text-slate-400">
        {hasApiKey ? (
          <p>API key is configured via environment variables. AI features are enabled.</p>
        ) : (
          <p>
            To enable AI features, add your Gemini API key to the <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">.env</code> file:
            <br />
            <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded mt-1 block">
              VITE_GEMINI_API_KEY=your_api_key_here
            </code>
            <br />
            Get your API key from{' '}
            <a 
              href="https://makersuite.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Google AI Studio
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default ApiKeyInput;
