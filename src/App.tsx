/**
 * TDJ NEXUS - Living Digital Universe 3D Live Wallpaper
 * Free, local, Windows wallpaper compatible interactive 3D WebGL engine.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { NexusScene } from './engine/NexusScene';
import { DEFAULT_CONFIG, NexusConfig, SystemStats, THEME_PRESETS } from './engine/types';
import { TopNav } from './components/TopNav';
import { ControlDeck } from './components/ControlDeck';
import { WindowsGuideModal } from './components/WindowsGuideModal';
import { WallpaperOverlay } from './components/WallpaperOverlay';

export default function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<NexusScene | null>(null);

  const [config, setConfig] = useState<NexusConfig>(DEFAULT_CONFIG);
  const [stats, setStats] = useState<SystemStats>({
    fps: 60,
    frameTime: 16.6,
    particleCount: DEFAULT_CONFIG.particleCount,
    drawCalls: 0,
    triangles: 0
  });

  const [isDeckOpen, setIsDeckOpen] = useState<boolean>(false);
  const [deckTab, setDeckTab] = useState<string>('themes');
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new NexusScene(containerRef.current, config, (newStats) => {
      setStats(newStats);
    });
    sceneRef.current = scene;

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Update scene when config changes
  const handleUpdateConfig = useCallback((newConfig: Partial<NexusConfig>) => {
    setConfig(prev => {
      const updated = { ...prev, ...newConfig };
      if (sceneRef.current) {
        sceneRef.current.updateConfig(newConfig);
      }
      return updated;
    });
  }, []);

  // Trigger Shockwave
  const handleTriggerShockwave = useCallback(() => {
    if (sceneRef.current) {
      sceneRef.current.triggerShockwave(undefined, config.shockwaveIntensity);
    }
  }, [config.shockwaveIntensity]);

  // Open Control Deck at specific tab
  const handleOpenDeck = useCallback((tab: string = 'themes') => {
    setDeckTab(tab);
    setIsDeckOpen(true);
  }, []);

  // Keyboard shortcut listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid hotkeys if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleTriggerShockwave();
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        handleUpdateConfig({ wallpaperMode: !config.wallpaperMode });
      } else if (e.key === 'f' || e.key === 'F') {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      } else if (e.key === 'm' || e.key === 'M') {
        handleUpdateConfig({ soundEnabled: !config.soundEnabled });
      } else if (e.key === '1') {
        handleUpdateConfig({ themeId: 'obsidian_cyan' });
      } else if (e.key === '2') {
        handleUpdateConfig({ themeId: 'solar_flare' });
      } else if (e.key === '3') {
        handleUpdateConfig({ themeId: 'cyber_amethyst' });
      } else if (e.key === '4') {
        handleUpdateConfig({ themeId: 'emerald_matrix' });
      } else if (e.key === '5') {
        handleUpdateConfig({ themeId: 'hyperdrive_monochrome' });
      } else if (e.key === '6') {
        handleUpdateConfig({ themeId: 'crimson_protocol' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config.wallpaperMode, config.soundEnabled, handleTriggerShockwave, handleUpdateConfig]);

  const currentTheme = THEME_PRESETS[config.themeId] || THEME_PRESETS.obsidian_cyan;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* 3D WebGL Canvas Viewport */}
      <div 
        ref={containerRef} 
        className="absolute inset-0 w-full h-full cursor-crosshair z-0"
      />

      {/* Top Bar Navigation (Hidden in Wallpaper Mode) */}
      {!config.wallpaperMode && (
        <TopNav
          config={config}
          onUpdateConfig={handleUpdateConfig}
          onTriggerShockwave={handleTriggerShockwave}
          onOpenDeck={handleOpenDeck}
          onOpenGuide={() => setIsGuideOpen(true)}
          stats={stats}
          isDeckOpen={isDeckOpen}
          onToggleDeck={() => setIsDeckOpen(!isDeckOpen)}
        />
      )}

      {/* Interactive Control Deck Drawer */}
      <ControlDeck
        isOpen={isDeckOpen && !config.wallpaperMode}
        onClose={() => setIsDeckOpen(false)}
        config={config}
        onUpdateConfig={handleUpdateConfig}
        onTriggerShockwave={handleTriggerShockwave}
        stats={stats}
        initialTab={deckTab}
      />

      {/* Windows Wallpaper Setup Guide Modal */}
      <WindowsGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Wallpaper HUD & Shortcut Overlay */}
      <WallpaperOverlay
        isWallpaperMode={config.wallpaperMode}
        onExitWallpaperMode={() => handleUpdateConfig({ wallpaperMode: false })}
        onTriggerShockwave={handleTriggerShockwave}
        theme={currentTheme}
      />
    </div>
  );
}
