/**
 * TDJ NEXUS - Minimalist Wallpaper HUD Overlay & Interaction Indicator
 */

import React from 'react';
import { Eye, Zap } from 'lucide-react';
import { ThemeConfig } from '../engine/types';

interface WallpaperOverlayProps {
  isWallpaperMode: boolean;
  onExitWallpaperMode: () => void;
  onTriggerShockwave: () => void;
  theme: ThemeConfig;
}

export const WallpaperOverlay: React.FC<WallpaperOverlayProps> = ({
  isWallpaperMode,
  onExitWallpaperMode,
  onTriggerShockwave,
  theme
}) => {
  return (
    <div className="fixed bottom-4 left-6 right-6 z-20 pointer-events-none flex items-center justify-between select-none">
      {/* Left side: Minimal Branding / Coordinates */}
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
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">V1 LIVE</span>
        </div>
      </div>

      {/* Right side: Quick Shortcut / Wallpaper Mode Pill */}
      <div className="pointer-events-auto flex items-center gap-2">
        {isWallpaperMode ? (
          <button
            onClick={onExitWallpaperMode}
            className="px-3 py-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Show HUD (H)</span>
          </button>
        ) : (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl text-[11px] text-slate-400 font-mono">
            <span><strong className="text-slate-300">Space / Click</strong> Shockwave</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span><strong className="text-slate-300">H</strong> Toggle HUD</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span><strong className="text-slate-300">1-6</strong> Themes</span>
          </div>
        )}
      </div>
    </div>
  );
};
