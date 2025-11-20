
import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreviewProps {
  code: string;
  className?: string;
}

const Preview: React.FC<PreviewProps> = ({ code, className }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize mermaid with custom config
    mermaid.initialize({
      startOnLoad: false,
      theme: document.documentElement.classList.contains('dark') ? 'dark' : 'default',
      securityLevel: 'loose',
      fontFamily: 'Inter, sans-serif',
    });
  }, []);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!code.trim()) {
        setSvg('');
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Add a small delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 300));

        const { svg } = await mermaid.render('mermaid-diagram', code);
        setSvg(svg);
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to render diagram';

        // Provide user-friendly error messages for common syntax issues
        let userFriendlyMessage = errorMessage;
        if (errorMessage.includes('Parse error') || errorMessage.includes('Expecting')) {
          userFriendlyMessage = '⚠️ The diagram syntax has an error. This usually happens when the AI generates invalid Mermaid syntax. Try generating again or manually fix the syntax in the editor.';
        } else if (errorMessage.includes('overloaded') || errorMessage.includes('temporarily unavailable')) {
          userFriendlyMessage = '⚠️ The AI service is temporarily unavailable. Please try again in a moment.';
        }

        setError(userFriendlyMessage);
        setSvg('');
      } finally {
        setLoading(false);
      }
    };

    renderDiagram();
  }, [code]);

  return (
    <div className={cn("h-full w-full overflow-hidden rounded-lg bg-white/50 dark:bg-black/20", className)}>
      <div ref={containerRef} className="h-full w-full overflow-auto p-4 flex items-center justify-center relative min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-sm animate-fade-in z-10">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-sm text-muted-foreground animate-pulse">Rendering diagram...</p>
          </div>
        )}

        {error && !loading && (
          <div className="w-full max-w-md p-6 bg-red-50/50 dark:bg-red-900/10 border border-red-200/50 dark:border-red-800/50 rounded-xl animate-fade-in text-center">
            <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-red-800 dark:text-red-200 font-medium mb-2">Rendering Error</h3>
            <p className="text-red-600 dark:text-red-300 text-sm leading-relaxed">{error}</p>
          </div>
        )}

        {!loading && !error && svg ? (
          <div
            className="animate-scale-in w-full h-full flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          !loading && !error && (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground animate-fade-in p-8">
              <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                <svg className="h-8 w-8 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="font-medium text-foreground/80">No Diagram to Display</p>
              <p className="text-sm mt-1 max-w-xs">Enter Mermaid code in the editor or use the AI assistant to generate one.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Preview;
