/**
 * TDJ NEXUS - Windows Live Wallpaper Integration Guide
 * Complete instructions for setting up TDJ NEXUS as an interactive Windows Live Wallpaper.
 */

import React, { useState } from 'react';
import { X, Monitor, Cpu, Sparkles, Copy, Check, Terminal, ExternalLink } from 'lucide-react';

interface WindowsGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WindowsGuideModal: React.FC<WindowsGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'lively' | 'wallpaper_engine' | 'browser_kiosk' | 'shortcuts'>('lively');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'http://localhost:3000';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-[#080b12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Monitor className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-100 font-tech tracking-wide">
                Windows Live Wallpaper Setup Guide
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>TDJ NEXUS Engine</span>
                <span aria-hidden="true">·</span>
                <span>100% Free & Local Compatible</span>
                <span aria-hidden="true">·</span>
                <span>Zero Subscription</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 pb-2 border-b border-white/10 bg-black/40 overflow-x-auto">
          <button
            onClick={() => setActiveTab('lively')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'lively'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Method 1: Lively Wallpaper (Free)
          </button>
          <button
            onClick={() => setActiveTab('wallpaper_engine')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'wallpaper_engine'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Method 2: Wallpaper Engine
          </button>
          <button
            onClick={() => setActiveTab('browser_kiosk')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'browser_kiosk'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Method 3: Standalone Fullscreen
          </button>
          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'shortcuts'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            Hotkeys & Controls
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-300">
          {activeTab === 'lively' && (
            <div className="space-y-4">
              <div className="p-4 bg-cyan-950/20 border border-cyan-500/20 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-cyan-300 font-medium">
                  <Sparkles className="w-4 h-4" />
                  <span>Recommended: Free & Open-Source on Windows 10 & 11</span>
                </div>
                <p className="text-xs text-slate-400">
                  Lively Wallpaper by rocksdanister is completely free, open-source, and supports hardware-accelerated interactive WebGL webpages as desktop live wallpapers with full mouse interaction.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-white font-tech">Step-by-Step Instructions:</h4>
                <ol className="space-y-3 text-xs text-slate-300 list-decimal list-inside pl-1 leading-relaxed">
                  <li>
                    <strong className="text-white">Download Lively Wallpaper:</strong> Get it from Microsoft Store or GitHub releases (<code className="px-1.5 py-0.5 bg-black/60 rounded text-cyan-400 font-mono">rocksdanister/lively</code>).
                  </li>
                  <li>
                    <strong className="text-white">Add TDJ NEXUS URL or Local Build:</strong>
                    <div className="mt-2 pl-4 space-y-2">
                      <p>Option A (Web URL): In Lively, click <strong className="text-cyan-300">+ Add Wallpaper</strong> → Enter Web URL:</p>
                      <div className="flex items-center gap-2 bg-black/60 p-2 rounded-lg border border-white/10">
                        <code className="text-cyan-400 font-mono text-xs flex-1 truncate">{currentUrl}</code>
                        <button
                          onClick={() => handleCopy(currentUrl, 'url')}
                          className="px-2.5 py-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded flex items-center gap-1 transition-colors"
                        >
                          {copiedText === 'url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedText === 'url' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <p>Option B (Local HTML): Build with <code className="px-1.5 py-0.5 bg-black/60 rounded text-cyan-400 font-mono">npm run build</code> and drag the <code className="px-1.5 py-0.5 bg-black/60 rounded text-cyan-400 font-mono">dist</code> folder directly into Lively.</p>
                    </div>
                  </li>
                  <li>
                    <strong className="text-white">Enable Mouse Input:</strong> Open Lively Settings → Wallpaper → Interaction → Set Input to <strong className="text-cyan-300">Mouse</strong> so the parallax, particle reactions, and click ripples respond behind your desktop icons.
                  </li>
                  <li>
                    <strong className="text-white">Turn on Wallpaper Mode:</strong> Press <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-white font-mono">H</kbd> in TDJ NEXUS to hide the HUD for a clean desktop background.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'wallpaper_engine' && (
            <div className="space-y-4">
              <div className="p-4 bg-purple-950/20 border border-purple-500/20 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-purple-300 font-medium">
                  <Cpu className="w-4 h-4" />
                  <span>Wallpaper Engine (Steam) Support</span>
                </div>
                <p className="text-xs text-slate-400">
                  TDJ NEXUS is standard HTML5/WebGL and runs smoothly inside Wallpaper Engine’s Web Wallpaper Chromium runtime.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-white font-tech">Setup Steps:</h4>
                <ol className="space-y-3 text-xs text-slate-300 list-decimal list-inside pl-1 leading-relaxed">
                  <li>Open <strong className="text-white">Wallpaper Engine</strong> → Click <strong className="text-white">Wallpaper Editor</strong>.</li>
                  <li>Select <strong className="text-white">Create Wallpaper</strong> → Choose <strong className="text-white">Web Wallpaper</strong>.</li>
                  <li>
                    Point to the build folder or enter URL. It immediately runs at 60+ FPS with hardware GPU acceleration.
                  </li>
                  <li>
                    Under Web Settings, ensure <strong className="text-cyan-300">Allow Mouse Input</strong> is checked for interactive particle shockwaves.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'browser_kiosk' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-white font-tech">Zero-Install Standalone Browser Kiosk Mode</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  You can launch TDJ NEXUS instantly in dedicated, borderless full-screen app mode on any Windows machine using Chrome or Edge command line:
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300">Windows Run Command (Win + R):</span>
                <div className="flex items-center gap-2 bg-black/60 p-2.5 rounded-lg border border-white/10">
                  <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
                  <code className="text-cyan-300 font-mono text-xs flex-1 truncate">
                    chrome.exe --kiosk --app={currentUrl}
                  </code>
                  <button
                    onClick={() => handleCopy(`chrome.exe --kiosk --app=${currentUrl}`, 'cmd')}
                    className="px-2.5 py-1 text-xs bg-white/10 hover:bg-white/20 text-white rounded flex items-center gap-1 transition-colors"
                  >
                    {copiedText === 'cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedText === 'cmd' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg text-xs text-slate-400 space-y-1">
                <div className="text-slate-200 font-medium">Tips for Multi-Monitor & OLED Screens:</div>
                <p>• Press <kbd className="px-1 bg-slate-800 rounded font-mono">F11</kbd> to enter full borderless fullscreen on any monitor.</p>
                <p>• TDJ NEXUS automatically calibrates to 4K, 1440p, Ultrawide (21:9, 32:9) and vertical displays.</p>
              </div>
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="space-y-4">
              <h4 className="font-semibold text-white font-tech">Keyboard Shortcuts & Live Gestures</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/10 rounded-lg">
                  <span className="text-slate-300">Trigger Energy Shockwave</span>
                  <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-cyan-300 font-mono">Space / Click</kbd>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/10 rounded-lg">
                  <span className="text-slate-300">Toggle HUD / Wallpaper Mode</span>
                  <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-cyan-300 font-mono">H</kbd>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/10 rounded-lg">
                  <span className="text-slate-300">Toggle Fullscreen Mode</span>
                  <div className="flex items-center gap-1.5 font-mono text-cyan-300 text-xs">
                    <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded">F (App)</kbd>
                    <span className="text-slate-500">/</span>
                    <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded">F11 (Browser)</kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/10 rounded-lg">
                  <span className="text-slate-300">Switch Theme Presets</span>
                  <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-cyan-300 font-mono">1 · 2 · 3 · 4 · 5 · 6</kbd>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/10 rounded-lg">
                  <span className="text-slate-300">Toggle Audio Drone / Mute</span>
                  <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-cyan-300 font-mono">M</kbd>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/10 rounded-lg">
                  <span className="text-slate-300">Mouse 3D Parallax Tilt</span>
                  <span className="text-cyan-400 font-mono">Cursor Move</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-white/10 bg-white/[0.02]">
          <div className="text-xs text-slate-500 font-mono">
            Local Build · WebGL 2.0 · 60+ FPS Ready
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-black bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
