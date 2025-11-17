
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key, Check, X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const ApiKeyInput = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setIsSaved(true);
    }
  }, []);

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter a valid OpenAI API key",
        variant: "destructive",
      });
      return;
    }

    // Simple validation - OpenAI keys typically start with "sk-"
    if (!apiKey.startsWith('sk-')) {
      toast({
        title: "Invalid API Key",
        description: "OpenAI API keys typically start with 'sk-'",
        variant: "destructive",
      });
      return;
    }

    localStorage.setItem('openai_api_key', apiKey);
    setIsSaved(true);
    setIsVisible(false);
    toast({
      title: "API Key Saved",
      description: "Your OpenAI API key has been saved locally",
    });
  };

  const handleRemoveKey = () => {
    localStorage.removeItem('openai_api_key');
    setApiKey('');
    setIsSaved(false);
    toast({
      title: "API Key Removed",
      description: "Your OpenAI API key has been removed",
    });
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Key className="h-4 w-4 mr-2 text-slate-500" />
          <span className="text-sm font-medium">OpenAI API Key</span>
        </div>
        {isSaved && (
          <div className="flex items-center text-xs text-green-600 dark:text-green-400">
            <Check className="h-3 w-3 mr-1" />
            Saved
          </div>
        )}
      </div>

      {isVisible ? (
        <div className="space-y-2">
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="text-sm"
          />
          <div className="flex space-x-2">
            <Button size="sm" onClick={handleSaveKey}>Save Key</Button>
            <Button size="sm" variant="outline" onClick={() => setIsVisible(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex space-x-2">
          {isSaved ? (
            <>
              <Button size="sm" variant="outline" onClick={() => setIsVisible(true)}>
                Update Key
              </Button>
              <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600" onClick={handleRemoveKey}>
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => setIsVisible(true)}>
              Add API Key
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ApiKeyInput;
