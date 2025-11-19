
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Settings, RefreshCw, AlertTriangle } from "lucide-react";
import { cn } from '@/lib/utils';
import { generateMermaidDiagram } from '@/utils/api';
import { toast } from "@/components/ui/use-toast";
import ApiKeyInput from './ApiKeyInput';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface AIPromptProps {
  prompt: string;
  onDiagramGenerated: (diagram: string) => void;
  className?: string;
}

const AIPrompt: React.FC<AIPromptProps> = ({ prompt, onDiagramGenerated, className }) => {
  const [loading, setLoading] = useState(false);
  const [apiKeyPopoverOpen, setApiKeyPopoverOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCountdown, setRetryCountdown] = useState<number | null>(null);
  const [isRetryable, setIsRetryable] = useState(false);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up countdown on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  // Auto-retry countdown
  useEffect(() => {
    if (retryCountdown !== null && retryCountdown > 0) {
      countdownRef.current = setTimeout(() => {
        setRetryCountdown(retryCountdown - 1);
      }, 1000);
    } else if (retryCountdown === 0) {
      // Auto-retry when countdown reaches 0
      setRetryCountdown(null);
      handleGenerate(true); // Pass true to indicate this is an auto-retry
    }
  }, [retryCountdown]);

  const checkIfRetryable = (errorMessage: string): boolean => {
    return errorMessage.includes('overloaded') || 
           errorMessage.includes('temporarily unavailable') ||
           errorMessage.includes('503') ||
           errorMessage.includes('Service Unavailable');
  };

  const startAutoRetry = () => {
    // Start countdown from 3-5 seconds
    const countdownSeconds = Math.floor(Math.random() * 3) + 3; // 3-5 seconds
    setRetryCountdown(countdownSeconds);
  };

  const handleGenerate = async (isAutoRetry = false) => {
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a description of the diagram you want to create",
        variant: "destructive",
      });
      return;
    }

    // Check if API key is set
    const hasApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!hasApiKey) {
      setApiKeyPopoverOpen(true);
      toast({
        title: "API Key Required",
        description: "Please add your Gemini API key first",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setRetryCountdown(null);
      setIsRetryable(false);
      
      const diagram = await generateMermaidDiagram(prompt);
      onDiagramGenerated(diagram);
      toast({
        title: "Diagram generated",
        description: "Your diagram has been generated successfully",
      });
    } catch (error) {
      console.error('Error generating diagram:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate diagram";
      setError(errorMessage);
      
      const retryable = checkIfRetryable(errorMessage);
      setIsRetryable(retryable);
      
      // Show toast with user-friendly message
      toast({
        title: "Generation failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      // Start auto-retry if it's a retryable error and not already an auto-retry
      if (retryable && !isAutoRetry) {
        startAutoRetry();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManualRetry = () => {
    handleGenerate();
  };

  const cancelRetry = () => {
    setRetryCountdown(null);
    setIsRetryable(false);
  };

  return (
    <div className={cn("flex flex-col space-y-3", className)}>
      <div className="flex items-center space-x-3">
        <Button 
          onClick={() => handleGenerate()} 
          disabled={loading || !prompt.trim()} 
          className="min-w-32 bg-primary/90 hover:bg-primary transition-all duration-300"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate
            </>
          )}
        </Button>
        
        <Popover open={apiKeyPopoverOpen} onOpenChange={setApiKeyPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Settings className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0">
            <ApiKeyInput />
          </PopoverContent>
        </Popover>
        
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Using Gemini 2.5 Flash
        </p>
      </div>

      {/* Error and Retry UI */}
      {error && (
        <div className="flex flex-col space-y-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
          
          {isRetryable && (
            <div className="flex items-center space-x-2">
              {retryCountdown !== null ? (
                <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Auto-retrying in {retryCountdown}s...</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={cancelRetry}
                    className="h-6 px-2 text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleManualRetry}
                    disabled={loading}
                    className="h-8 px-3 text-sm"
                  >
                    <RefreshCw className="mr-1 h-3 w-3" />
                    Retry Now
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={startAutoRetry}
                    disabled={loading}
                    className="h-8 px-3 text-sm"
                  >
                    Auto-Retry
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIPrompt;
