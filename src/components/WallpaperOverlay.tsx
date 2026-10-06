/**
 * TDJ NEXUS - Minimalist HUD Overlay & Interaction Indicator
 * Completely hides when Wallpaper Mode is active.
 */

import React from 'react';
import { Zap } from 'lucide-react';
import { ThemeConfig } from '../engine/types';

interface WallpaperOverlayProps {
  isWallpaperMode: boolean;
  onExitWallpaperMode: () => void;
  onTriggerShockwave: () => void;
  theme: ThemeConfig;
}

export const WallpaperOverlay: React.FC<WallpaperOverlayProps> = ({
  isWallpaperMode,
  onTriggerShockwave,
  theme
}) => {
  // Requirement 1: In TRUE CLEAN WALLPAPER MODE, hide ALL overlays, text, buttons and HUD.
  if (isWallpaperMode) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 sm:left-6 right-4 sm:right-6 z-20 pointer-events-none flex items-center justify-between select-none animate-in fade-in duration-300">
      {/* Left side: Minimal Branding */}
      <div className="pointer-events-auto flex items-center gap-3">
        <div 
          onClick={onTriggerShockwave}
          className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 hover:border-white/30 text-xs cursor-pointer transition-all"
        >
          <span 
            className="w-2 h-2 rounded-full transition-transform group-hover:scale-125"
            style={{ backgroundColor: theme.primaryColor }}
          />
          <span className="font-tech font-semibold text-slate-200 tracking-wider">TDJ NEXUS</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">V1.1 PRODUCTION</span>
        </div>
      </div>

      {/* Right side: Quick Keyboard Shortcut Hints */}
      <div className="pointer-events-auto flex items-center gap-2">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl text-[11px] text-slate-400 font-mono">
          <span><strong className="text-slate-300">Space / Click</strong> Shockwave</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span><strong className="text-slate-300">H</strong> Clean Wallpaper</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span><strong className="text-slate-300">1-6</strong> Themes</span>
        </div>
      </div>
    </div>
  );
};
