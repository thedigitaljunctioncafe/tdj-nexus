/**
 * TDJ NEXUS - Interactive Control Deck (V1.1 Production Upgrade)
 * Real-time physics, procedural geometry, visual themes, quality levels, and audio controls.
 */

import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Sliders, 
  Layers, 
  Volume2, 
  RotateCcw, 
  Zap, 
  Activity,
  Radio,
  Grid,
  Shield,
  Disc,
  Gauge
} from 'lucide-react';
import { 
  DEFAULT_CONFIG, 
  NexusConfig, 
  QualityLevel, 
  SystemStats, 
  THEME_PRESETS, 
  ThemeConfig 
} from '../engine/types';

interface ControlDeckProps {
  isOpen: boolean;
  onClose: () => void;
  config: NexusConfig;
  onUpdateConfig: (newConfig: Partial<NexusConfig>) => void;
  onTriggerShockwave: () => void;
  stats: SystemStats;
  initialTab?: string;
}

export const ControlDeck: React.FC<ControlDeckProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onTriggerShockwave,
  stats,
  initialTab = 'themes'
}) => {
  const [activeTab, setActiveTab] = useState<'themes' | 'quality' | 'physics' | 'geometry' | 'audio' | 'telemetry'>(
    (initialTab as any) || 'themes'
  );

  if (!isOpen) return null;

  const currentTheme = THEME_PRESETS[config.themeId] || THEME_PRESETS.obsidian_cyan;

  const handleReset = () => {
    onUpdateConfig(DEFAULT_CONFIG);
  };

  const qualityOptions: { id: QualityLevel; label: string; desc: string }[] = [
    { id: 'auto', label: 'AUTO (Dynamic)', desc: 'Monitors frame rate and dynamically optimizes GPU workload to sustain 60 FPS' },
    { id: 'low', label: 'LOW (Battery / iGPU)', desc: '4,000 particles · 1.0 DPR · Optimized for older laptops & low-power GPUs' },
    { id: 'balanced', label: 'BALANCED', desc: '9,000 particles · 1.25 DPR · Smooth performance on standard machines' },
    { id: 'high', label: 'HIGH (Dedicated GPU)', desc: '15,000 particles · 1.5 DPR · High-fidelity visual density & bloom' },
    { id: 'ultra', label: 'ULTRA (Enthusiast)', desc: '24,000 particles · Native 2.0 DPR · Maximum volumetric density' }
  ];

  return (
    <aside className="fixed top-14 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-96 max-h-[calc(100vh-4.5rem)] flex flex-col bg-[#070a10]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden select-none transition-all animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Deck Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <div 
            className="w-2.5 h-2.5 rounded-full animate-pulse" 
            style={{ backgroundColor: currentTheme.primaryColor }}
          />
          <h3 className="text-sm font-semibold text-white font-tech tracking-wide">
            NEXUS CONTROL MATRIX
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleReset}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors text-xs flex items-center gap-1 cursor-pointer"
            title="Reset to Defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Segmented Tab Controls */}
      <div className="flex items-center gap-1 p-2 border-b border-white/10 bg-black/40 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('themes')}
          className={`px-2.5 py-1.5 font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'themes'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Themes</span>
        </button>

        <button
          onClick={() => setActiveTab('quality')}
          className={`px-2.5 py-1.5 font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'quality'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Gauge className="w-3.5 h-3.5" />
          <span>Quality</span>
        </button>

        <button
          onClick={() => setActiveTab('physics')}
          className={`px-2.5 py-1.5 font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'physics'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Swarm</span>
        </button>

        <button
          onClick={() => setActiveTab('geometry')}
          className={`px-2.5 py-1.5 font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'geometry'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Core</span>
        </button>

        <button
          onClick={() => setActiveTab('audio')}
          className={`px-2.5 py-1.5 font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'audio'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Audio</span>
        </button>

        <button
          onClick={() => setActiveTab('telemetry')}
          className={`px-2.5 py-1.5 font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'telemetry'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Stats</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs text-slate-300">
        {/* TAB 1: THEMES */}
        {activeTab === 'themes' && (
          <div className="space-y-3">
            <div className="text-[11px] text-slate-400">
              Select an atmospheric visual spectrum preset:
            </div>

            <div className="grid grid-cols-1 gap-2">
              {Object.values(THEME_PRESETS).map((preset: ThemeConfig) => {
                const isSelected = config.themeId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => onUpdateConfig({ themeId: preset.id })}
                    className={`flex items-start gap-3 p-3 rounded-xl text-left transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-white/10 border-cyan-400/60 shadow-lg shadow-cyan-500/10'
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.06] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mt-0.5 shrink-0">
                      <span 
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: preset.primaryColor }}
                      />
                      <span 
                        className="w-2.5 h-2.5 rounded-full border border-white/20"
                        style={{ backgroundColor: preset.secondaryColor }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold tracking-wide ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                          {preset.name}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] text-cyan-400 font-mono font-medium uppercase tracking-wider">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed line-clamp-2">
                        {preset.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: QUALITY & ADAPTIVE RENDERING */}
        {activeTab === 'quality' && (
          <div className="space-y-3.5">
            <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl space-y-1">
              <div className="font-semibold text-cyan-300 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5" />
                  <span>Adaptive GPU Engine</span>
                </div>
                {config.quality === 'auto' && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                    ACTIVE: {stats.effectiveQuality}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {config.quality === 'auto'
                  ? `Currently maintaining 60 FPS by rendering ${stats.particleCount.toLocaleString()} particles at ${stats.gpuDpr}x DPR (${stats.effectiveQuality.toUpperCase()} tier).`
                  : 'Dynamically throttles particle buffers and pixel ratio to prevent hardware stutter and maintain 60 FPS.'}
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Rendering Quality Profile
              </span>

              <div className="grid grid-cols-1 gap-2">
                {qualityOptions.map((opt) => {
                  const isSelected = config.quality === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => onUpdateConfig({ quality: opt.id })}
                      className={`p-3 rounded-xl text-left transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-500/15 border-cyan-400/60 text-white'
                          : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.06] hover:border-white/20 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold font-tech tracking-wide">{opt.label}</span>
                        {isSelected && (
                          <span className="text-[10px] text-cyan-400 font-mono font-bold">
                            {opt.id === 'auto' ? `AUTO (${stats.effectiveQuality.toUpperCase()})` : 'SELECTED'}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {opt.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PARTICLES & PHYSICS */}
        {activeTab === 'physics' && (
          <div className="space-y-4">
            {/* Particle Density */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-medium">Active Particle Density</span>
                <span className="font-mono text-cyan-400 tabular-nums font-semibold">
                  {stats.particleCount.toLocaleString()} {config.quality === 'auto' ? `(Auto - ${stats.effectiveQuality.toUpperCase()})` : 'P'}
                </span>
              </div>
              <input
                type="range"
                min={2000}
                max={25000}
                step={1000}
                value={stats.particleCount}
                onChange={(e) => onUpdateConfig({ particleCount: parseInt(e.target.value, 10), quality: 'balanced' })}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>2k (Saver)</span>
                <span>12k (Balanced)</span>
                <span>25k (Ultra)</span>
              </div>
              {config.quality === 'auto' && (
                <p className="text-[10px] text-cyan-400/80 font-mono mt-1">
                  * Particle count is managed dynamically by Auto Quality to sustain 60 FPS.
                </p>
              )}
            </div>

            {/* Particle Flow Speed */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-medium">Harmonic Flow Velocity</span>
                <span className="font-mono text-cyan-400 tabular-nums">
                  {config.particleSpeed.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min={0.2}
                max={3.0}
                step={0.1}
                value={config.particleSpeed}
                onChange={(e) => onUpdateConfig({ particleSpeed: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Interactive Cursor Force */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-medium">Cursor Vector Repulsion</span>
                <span className="font-mono text-cyan-400 tabular-nums">
                  {config.particleInteractiveForce.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min={0.0}
                max={2.5}
                step={0.1}
                value={config.particleInteractiveForce}
                onChange={(e) => onUpdateConfig({ particleInteractiveForce: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* 3D Parallax Sensitivity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-medium">3D Viewport Parallax</span>
                <span className="font-mono text-cyan-400 tabular-nums">
                  {config.parallaxStrength.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min={0.0}
                max={2.0}
                step={0.1}
                value={config.parallaxStrength}
                onChange={(e) => onUpdateConfig({ parallaxStrength: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Shockwave Intensity */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-medium">Shockwave Energy Amplitude</span>
                <span className="font-mono text-cyan-400 tabular-nums">
                  {config.shockwaveIntensity.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min={0.4}
                max={2.5}
                step={0.1}
                value={config.shockwaveIntensity}
                onChange={(e) => onUpdateConfig({ shockwaveIntensity: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            <button
              onClick={onTriggerShockwave}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 rounded-xl text-cyan-300 font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Discharge Energy Ripple</span>
            </button>
          </div>
        )}

        {/* TAB 4: NEXUS CORE GEOMETRY */}
        {activeTab === 'geometry' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-medium">Core Gyro Rotation</span>
                <span className="font-mono text-cyan-400 tabular-nums">
                  {config.coreRotationSpeed.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min={0.1}
                max={3.0}
                step={0.1}
                value={config.coreRotationSpeed}
                onChange={(e) => onUpdateConfig({ coreRotationSpeed: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-medium">Core Dimensional Scale</span>
                <span className="font-mono text-cyan-400 tabular-nums">
                  {config.coreScale.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={1.8}
                step={0.05}
                value={config.coreScale}
                onChange={(e) => onUpdateConfig({ coreScale: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            <div className="space-y-2.5 pt-2 border-t border-white/5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Procedural Sub-Systems
              </span>

              <label className="flex items-center justify-between p-2.5 bg-white/[0.02] border border-white/5 rounded-lg cursor-pointer hover:bg-white/[0.05]">
                <div className="flex items-center gap-2">
                  <Disc className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Concentric Gyro Rings</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.showGyroRings}
                  onChange={(e) => onUpdateConfig({ showGyroRings: e.target.checked })}
                  className="accent-cyan-400 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-white/[0.02] border border-white/5 rounded-lg cursor-pointer hover:bg-white/[0.05]">
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Crystalline Tectonic Shards</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.showShieldShards}
                  onChange={(e) => onUpdateConfig({ showShieldShards: e.target.checked })}
                  className="accent-cyan-400 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-white/[0.02] border border-white/5 rounded-lg cursor-pointer hover:bg-white/[0.05]">
                <div className="flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Polar Energy Light Jets</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.showPolarJets}
                  onChange={(e) => onUpdateConfig({ showPolarJets: e.target.checked })}
                  className="accent-cyan-400 w-4 h-4 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-white/[0.02] border border-white/5 rounded-lg cursor-pointer hover:bg-white/[0.05]">
                <div className="flex items-center gap-2">
                  <Grid className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Spatial Matrix Grid</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.showSpatialGrid}
                  onChange={(e) => onUpdateConfig({ showSpatialGrid: e.target.checked })}
                  className="accent-cyan-400 w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </div>
        )}

        {/* TAB 5: PROCEDURAL AUDIO */}
        {activeTab === 'audio' && (
          <div className="space-y-4">
            <div className="p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-xl space-y-1.5 text-xs text-slate-300">
              <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                <span>100% Offline Procedural Web Audio</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Zero external audio files. Real-time synthesized harmonics, kinetic shockwave impacts, and sub-bass drones.
              </p>
            </div>

            <label className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-lg cursor-pointer hover:bg-white/[0.05]">
              <div>
                <div className="font-medium text-slate-200">Interactive Sound Effects</div>
                <div className="text-[10px] text-slate-400">Kinetic shockwaves & crystal chimes</div>
              </div>
              <input
                type="checkbox"
                checked={config.soundEnabled}
                onChange={(e) => onUpdateConfig({ soundEnabled: e.target.checked })}
                className="accent-cyan-400 w-4 h-4 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-lg cursor-pointer hover:bg-white/[0.05]">
              <div>
                <div className="font-medium text-slate-200">Cosmic Ambient Drone</div>
                <div className="text-[10px] text-slate-400">Sub-bass harmonic resonance frequencies</div>
              </div>
              <input
                type="checkbox"
                checked={config.ambientDrone}
                onChange={(e) => onUpdateConfig({ ambientDrone: e.target.checked })}
                className="accent-cyan-400 w-4 h-4 cursor-pointer"
              />
            </label>

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-medium">Master Audio Volume</span>
                <span className="font-mono text-cyan-400 tabular-nums">
                  {Math.round(config.soundVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.0}
                max={1.0}
                step={0.05}
                value={config.soundVolume}
                onChange={(e) => onUpdateConfig({ soundVolume: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>
          </div>
        )}

        {/* TAB 6: REAL-TIME TELEMETRY */}
        {activeTab === 'telemetry' && (
          <div className="space-y-3 font-mono">
            <div className="p-3 bg-white/[0.02] border border-white/10 rounded-xl space-y-2">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-sans font-semibold">
                Engine Metrics
              </div>

              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Frame Rate</span>
                <span className="text-emerald-400 font-bold tabular-nums">{stats.fps} FPS</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Frame Time</span>
                <span className="text-cyan-400 tabular-nums">{stats.frameTime} ms</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Active Quality Tier</span>
                <span className="text-purple-400 font-bold uppercase">{stats.effectiveQuality}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">GPU Device Pixel Ratio</span>
                <span className="text-amber-400 tabular-nums">{stats.gpuDpr}x</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Active GPU Particles</span>
                <span className="text-slate-200 tabular-nums">{stats.particleCount.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-white/5">
                <span className="text-slate-400">Draw Calls</span>
                <span className="text-slate-200 tabular-nums">{stats.drawCalls}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Geometry Triangles</span>
                <span className="text-slate-200 tabular-nums">{stats.triangles.toLocaleString()}</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 font-sans leading-relaxed">
              * Pipeline rendered with ACES Filmic Tone Mapping, Shader-based Cosmic Nebula and Adaptive GPU Scaling.
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
