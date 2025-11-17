
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Settings } from "lucide-react";
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

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a description of the diagram you want to create",
        variant: "destructive",
      });
      return;
    }

    // Check if API key is set
    const hasApiKey = localStorage.getItem('openai_api_key');
    if (!hasApiKey) {
      setApiKeyPopoverOpen(true);
      toast({
        title: "API Key Required",
        description: "Please add your OpenAI API key first",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const diagram = await generateMermaidDiagram(prompt);
      onDiagramGenerated(diagram);
      toast({
        title: "Diagram generated",
        description: "Your diagram has been generated successfully",
      });
    } catch (error) {
      console.error('Error generating diagram:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate diagram",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <Button 
        onClick={handleGenerate} 
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
        Using GPT-4o-mini
      </p>
    </div>
  );
};

export default AIPrompt;
