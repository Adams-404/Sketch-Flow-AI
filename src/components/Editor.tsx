import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { toast } from "@/components/ui/use-toast";

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  promptValue: string;
  onPromptChange: (value: string) => void;
}

const Editor: React.FC<EditorProps> = ({
  value,
  onChange,
  className,
  promptValue,
  onPromptChange
}) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editorRef.current) {
      // Auto-resize code textarea
      editorRef.current.style.height = 'auto';
      editorRef.current.style.height = `${editorRef.current.scrollHeight}px`;
    }
  }, [value]);

  useEffect(() => {
    if (promptRef.current) {
      // Auto-resize prompt textarea
      promptRef.current.style.height = 'auto';
      promptRef.current.style.height = `${promptRef.current.scrollHeight}px`;
    }
  }, [promptValue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);

      // Set cursor position after tab
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.selectionStart = editorRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast({
      title: "Copied to clipboard",
      description: "Mermaid code copied to clipboard",
    });
  };

  return (
    <div className={cn("flex flex-col min-h-[300px]", className)}>
      <Tabs defaultValue="code" className="flex flex-col flex-1">
        <TabsList className="w-full justify-start bg-transparent border-b border-border/50 rounded-none px-0">
          <TabsTrigger
            value="code"
            className="rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary transition-all duration-300"
          >
            Mermaid Code
          </TabsTrigger>
          <TabsTrigger
            value="prompt"
            className="rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary transition-all duration-300"
          >
            AI Prompt
          </TabsTrigger>
        </TabsList>

        <TabsContent value="code" className="flex-1 mt-0 flex flex-col">
          <div className="relative group flex flex-col">
            <textarea
              ref={editorRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your mermaid code here..."
              className="editor-container w-full resize-none font-mono animate-fade-in min-h-[200px]"
              spellCheck="false"
            />
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 p-2 rounded-md bg-white/10 hover:bg-white/20 text-muted-foreground hover:text-foreground transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm border border-white/10"
              title="Copy code"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
            </button>
          </div>
        </TabsContent>

        <TabsContent value="prompt" className="flex-1 mt-0 flex flex-col">
          <div className="flex flex-col">
            <textarea
              ref={promptRef}
              value={promptValue}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder="Describe the diagram you want to create..."
              className="editor-container w-full resize-none animate-fade-in min-h-[200px]"
              spellCheck="false"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Editor;
