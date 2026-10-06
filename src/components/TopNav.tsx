/**
 * TDJ NEXUS - Top Bar Navigation
 * Adheres strictly to the 3-Zone Top Bar Contract.
 */

import React from 'react';
import { Sparkles, Sliders, Volume2, VolumeX, Monitor, Zap, Eye, EyeOff, Maximize2 } from 'lucide-react';
import { NexusConfig, SystemStats, THEME_PRESETS } from '../engine/types';

interface TopNavProps {
  config: NexusConfig;
  onUpdateConfig: (newConfig: Partial<NexusConfig>) => void;
  onTriggerShockwave: () => void;
  onOpenDeck: (tab?: string) => void;
  onOpenGuide: () => void;
  stats: SystemStats;
  isDeckOpen: boolean;
  onToggleDeck: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  config,
  onUpdateConfig,
  onTriggerShockwave,
  onOpenDeck,
  onOpenGuide,
  stats,
  isDeckOpen,
  onToggleDeck
}) => {
  const currentTheme = THEME_PRESETS[config.themeId] || THEME_PRESETS.obsidian_cyan;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-3 border-b border-white/10 bg-black/40 backdrop-blur-md select-none transition-all duration-300">
      {/* Zone 1: Wordmark Single Text Element */}
      <div className="flex items-center gap-3">
        <a 
          href="#nexus" 
          onClick={(e) => { e.preventDefault(); onTriggerShockwave(); }}
          className="text-lg font-bold tracking-wider text-white font-display flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: currentTheme.primaryColor }} />
          <span>TDJ NEXUS</span>
        </a>
      </div>

      {/* Zone 2: 4-6 Clean Text Links / Control Affordances */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
        <button
          onClick={() => { onOpenDeck('themes'); }}
          className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" style={{ color: currentTheme.primaryColor }} />
          <span>Themes ({currentTheme.name})</span>
        </button>

        <button
          onClick={() => { onOpenDeck('physics'); }}
          className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Core & Swarm</span>
        </button>

        <button
          onClick={() => {
            onUpdateConfig({ soundEnabled: !config.soundEnabled });
          }}
          className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
        >
          {config.soundEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Audio Synthesis</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
              <span>Audio Muted</span>
            </>
          )}
        </button>

        <button
          onClick={onOpenGuide}
          className="hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5 text-slate-300"
        >
          <Monitor className="w-3.5 h-3.5 text-cyan-400" />
          <span>Windows Wallpaper Setup</span>
        </button>
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2.5">
        {/* Real telemetry badge (unboxed clean text) */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-400 tabular-nums px-2">
          <span>{stats.fps} FPS</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>{stats.particleCount.toLocaleString()} P</span>
        </div>

        <button
          onClick={onTriggerShockwave}
          className="px-3 py-1.5 text-xs font-medium text-white rounded-lg transition-all cursor-pointer flex items-center gap-1.5 border border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10"
          title="Trigger Energy Shockwave (Spacebar)"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Pulse</span>
        </button>

        <button
          onClick={() => onUpdateConfig({ wallpaperMode: !config.wallpaperMode })}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
            config.wallpaperMode
              ? 'bg-cyan-500 text-black font-semibold'
              : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'
          }`}
          title="Toggle Wallpaper Clean Mode (H)"
        >
          {config.wallpaperMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span>{config.wallpaperMode ? 'Clean' : 'Wallpaper'}</span>
        </button>

        <button
          onClick={onToggleDeck}
          className={`p-1.5 text-xs rounded-lg transition-all cursor-pointer border ${
            isDeckOpen 
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
              : 'text-slate-300 bg-white/5 hover:bg-white/10 border-white/10'
          }`}
          title="Toggle Control Deck"
        >
          <Sliders className="w-4 h-4" />
        </button>

        <button
          onClick={toggleFullscreen}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer hidden sm:block"
          title="Toggle Fullscreen (F11)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
