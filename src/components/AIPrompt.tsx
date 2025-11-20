
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { cn } from '@/lib/utils';
import { generateMermaidDiagram } from '@/utils/api';
import { toast } from "@/components/ui/use-toast";


interface AIPromptProps {
  prompt: string;
  onDiagramGenerated: (diagram: string) => void;
  className?: string;
}

const AIPrompt: React.FC<AIPromptProps> = ({ prompt, onDiagramGenerated, className }) => {
  const [loading, setLoading] = useState(false);
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
    <div className={cn("flex flex-col space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-md bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-medium text-foreground">AI Assistant</h3>
        </div>

      </div>

      <div className="flex items-center space-x-3">
        <Button
          onClick={() => handleGenerate()}
          disabled={loading || !prompt.trim()}
          className="flex-1 bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 text-white shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Diagram...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Diagram
            </>
          )}
        </Button>
      </div>

      {/* Error and Retry UI */}
      {error && (
        <div className="flex flex-col space-y-2 p-4 bg-red-50/50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/50 rounded-lg animate-fade-in">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">Generation Failed</p>
              <p className="text-xs text-red-600 dark:text-red-300 leading-relaxed">{error}</p>
            </div>
          </div>

          {isRetryable && (
            <div className="flex items-center justify-end space-x-2 pt-2">
              {retryCountdown !== null ? (
                <div className="flex items-center space-x-3 text-sm text-red-600 dark:text-red-400 bg-red-100/50 dark:bg-red-900/20 px-3 py-1.5 rounded-md">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span className="font-medium">Retrying in {retryCountdown}s...</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cancelRetry}
                    className="h-6 px-2 text-xs hover:bg-red-200/50 dark:hover:bg-red-800/50"
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
                    className="h-8 px-3 text-xs border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-700 dark:text-red-300"
                  >
                    <RefreshCw className="mr-1.5 h-3 w-3" />
                    Retry Now
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={startAutoRetry}
                    disabled={loading}
                    className="h-8 px-3 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
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
