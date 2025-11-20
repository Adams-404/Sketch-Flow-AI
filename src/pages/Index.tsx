
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Editor from '@/components/Editor';
import Preview from '@/components/Preview';
import AIPrompt from '@/components/AIPrompt';
import { toast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { saveAs } from 'file-saver';

const DEFAULT_DIAGRAM = `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action]
    B -->|No| D[Alternative Action]
    C --> E[Result]
    D --> E`;

const Index = () => {
  const [code, setCode] = useState<string>(DEFAULT_DIAGRAM);
  const [prompt, setPrompt] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Initialize theme on component mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Re-render the diagram with the new theme
    // This forces the Mermaid renderer to use the new theme
    const currentCode = code;
    setCode('');
    setTimeout(() => setCode(currentCode), 10);
  };

  const handleExport = () => {
    try {
      const svgElement = document.querySelector('.diagram-container svg');
      if (!svgElement) {
        toast({
          title: "Export failed",
          description: "No diagram to export",
          variant: "destructive",
        });
        return;
      }

      // Get SVG content
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });

      // Generate filename from first line of diagram or use default
      let filename = 'mermaid-diagram.svg';
      const firstLine = code.split('\n')[0];
      if (firstLine) {
        const cleanName = firstLine
          .replace(/[^\w\s]/gi, '')
          .trim()
          .replace(/\s+/g, '-')
          .toLowerCase();
        if (cleanName) {
          filename = `${cleanName}.svg`;
        }
      }

      saveAs(svgBlob, filename);

      toast({
        title: "Export successful",
        description: `Saved as ${filename}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "Failed to export diagram",
        variant: "destructive",
      });
    }
  };

  const handleDiagramGenerated = (generatedCode: string) => {
    setCode(generatedCode);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-black selection:bg-primary/20 overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full bg-violet-500/5 blur-[100px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header
          onExport={handleExport}
          toggleTheme={toggleTheme}
          isDarkMode={isDarkMode}
        />

        <main className="flex-1 container py-8 flex flex-col gap-8 max-w-[1600px]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 items-start">
            <div className="flex flex-col gap-6">
              <div className="glass-panel p-6 flex flex-col gap-6 animate-slide-in">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground/80 flex items-center gap-2">
                    <span className="w-2 h-8 rounded-full bg-primary/50"></span>
                    Editor
                  </h2>

                </div>
                <Editor
                  value={code}
                  onChange={setCode}
                  className="flex-1 min-h-[300px]"
                  promptValue={prompt}
                  onPromptChange={setPrompt}
                />
                <Separator className="bg-border/50" />
                <AIPrompt
                  prompt={prompt}
                  onDiagramGenerated={handleDiagramGenerated}
                />
              </div>
            </div>

            <div className="flex flex-col gap-6 h-full">
              <div className="glass-panel p-6 flex flex-col h-full animate-slide-in" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-foreground/80 flex items-center gap-2">
                    <span className="w-2 h-8 rounded-full bg-blue-500/50"></span>
                    Preview
                  </h2>
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500/20"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500/20"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500/20"></div>
                  </div>
                </div>
                <Preview code={code} className="flex-1 min-h-[300px]" />
              </div>
            </div>
          </div>


        </main>
      </div>
    </div>
  );
};

export default Index;
