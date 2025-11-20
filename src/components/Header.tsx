import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Github, Moon, Sun } from "lucide-react";
interface HeaderProps {
  onExport: () => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
}
const Header: React.FC<HeaderProps> = ({
  onExport,
  toggleTheme,
  isDarkMode
}) => {
  return (
    <header className="w-full py-4 px-6 border-b border-white/10 dark:border-white/5 backdrop-blur-md bg-white/30 dark:bg-black/20 sticky top-0 z-50 transition-all duration-300">
      <div className="container max-w-[1600px] flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-violet-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-primary/20">
            S
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              SketchFlow AI
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium uppercase tracking-wider">Beta</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
            onClick={toggleTheme}
          >
            {isDarkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-slate-700" />}
          </Button>

          <div className="h-6 w-px bg-border/50 mx-2" />

          <Button
            variant="outline"
            size="sm"
            className="glass-button border-primary/20 hover:border-primary/50 text-foreground/80"
            onClick={onExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Export SVG
          </Button>

          <Button
            variant="default"
            size="sm"
            className="bg-foreground text-background hover:bg-foreground/90 shadow-lg hover:shadow-xl transition-all duration-300"
            asChild
          >
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Github className="mr-2 h-4 w-4" />
              Star on GitHub
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
};
export default Header;