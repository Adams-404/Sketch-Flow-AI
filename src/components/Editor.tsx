
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  useEffect(() => {
    if (editorRef.current) {
      // Auto-resize textarea
      editorRef.current.style.height = 'auto';
      editorRef.current.style.height = `${editorRef.current.scrollHeight}px`;
    }
  }, [value]);

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

  return (
    <div className={cn("h-full flex flex-col", className)}>
      <Tabs defaultValue="code" className="h-full flex flex-col">
        <TabsList className="w-full justify-start bg-transparent border-b border-slate-200/80 dark:border-slate-800/80 rounded-none px-0">
          <TabsTrigger 
            value="code" 
            className="rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Mermaid Code
          </TabsTrigger>
          <TabsTrigger 
            value="prompt" 
            className="rounded-t-lg rounded-b-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            AI Prompt
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="code" className="flex-1 mt-0 h-full">
          <div className="h-full">
            <textarea
              ref={editorRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your mermaid code here..."
              className="editor-container h-full resize-none font-mono animate-fade-in"
              spellCheck="false"
            />
          </div>
        </TabsContent>
        
        <TabsContent value="prompt" className="flex-1 mt-0 h-full">
          <div className="h-full">
            <textarea
              value={promptValue}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder="Describe the diagram you want to create..."
              className="editor-container h-full resize-none animate-fade-in"
              spellCheck="false"
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Editor;
