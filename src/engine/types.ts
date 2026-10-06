/**
 * TDJ NEXUS - Type Definitions and Configuration Schemas
 */

export interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  primaryColor: string;    // Core highlights & primary particles (hex)
  secondaryColor: string;  // Gyro rings & secondary particle stream
  accentColor: string;     // Inner singularity / shockwave blast color
  coreGlowColor: string;   // Volumetric core glow
  gridColor: string;       // Spatial matrix grid color
  backgroundColor: string; // Deep void background
  fogColor: string;        // Atmospheric depth fog
}

export interface NexusConfig {
  themeId: string;
  particleCount: number;
  particleSpeed: number;
  particleSize: number;
  particleInteractiveForce: number;
  coreRotationSpeed: number;
  coreScale: number;
  parallaxStrength: number;
  shockwaveIntensity: number;
  showSpatialGrid: boolean;
  showNebula: boolean;
  showPolarJets: boolean;
  showGyroRings: boolean;
  showShieldShards: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  ambientDrone: boolean;
  bloomGlow: number;
  fov: number;
  wallpaperMode: boolean; // Auto-hide UI for clean desktop wallpaper
}

export interface SystemStats {
  fps: number;
  frameTime: number;
  particleCount: number;
  drawCalls: number;
  triangles: number;
}

export const THEME_PRESETS: Record<string, ThemeConfig> = {
  obsidian_cyan: {
    id: 'obsidian_cyan',
    name: 'Obsidian Void',
    description: 'Deep titanium obsidian abyss with hyper-electric cyan & neon azure pulses',
    primaryColor: '#00f0ff',
    secondaryColor: '#0ea5e9',
    accentColor: '#38bdf8',
    coreGlowColor: '#00d2ff',
    gridColor: '#0284c7',
    backgroundColor: '#02040a',
    fogColor: '#030712'
  },
  solar_flare: {
    id: 'solar_flare',
    name: 'Solar Singularity',
    description: 'High-energy stellar plasma with radiant gold, incandescent amber & crimson corona',
    primaryColor: '#ffb700',
    secondaryColor: '#ff5500',
    accentColor: '#ffe600',
    coreGlowColor: '#ff7700',
    gridColor: '#b45309',
    backgroundColor: '#080302',
    fogColor: '#120502'
  },
  cyber_amethyst: {
    id: 'cyber_amethyst',
    name: 'Quantum Amethyst',
    description: 'Dimensional rift energized with deep celestial violet and hyper-magenta frequencies',
    primaryColor: '#c084fc',
    secondaryColor: '#ec4899',
    accentColor: '#a855f7',
    coreGlowColor: '#d946ef',
    gridColor: '#7e22ce',
    backgroundColor: '#07020d',
    fogColor: '#0e031a'
  },
  emerald_matrix: {
    id: 'emerald_matrix',
    name: 'Bioluminescent Jade',
    description: 'Hyper-advanced emerald cyber-stream with luminous mint and tactical viridian nodes',
    primaryColor: '#10b981',
    secondaryColor: '#06b6d4',
    accentColor: '#34d399',
    coreGlowColor: '#059669',
    gridColor: '#047857',
    backgroundColor: '#010906',
    fogColor: '#02130e'
  },
  hyperdrive_monochrome: {
    id: 'hyperdrive_monochrome',
    name: 'Titanium Platinum',
    description: 'Pure high-contrast luxury monochrome with diamond-white luminance and dark obsidian shadow',
    primaryColor: '#f8fafc',
    secondaryColor: '#94a3b8',
    accentColor: '#ffffff',
    coreGlowColor: '#cbd5e1',
    gridColor: '#475569',
    backgroundColor: '#030305',
    fogColor: '#09090b'
  },
  crimson_protocol: {
    id: 'crimson_protocol',
    name: 'Crimson Protocol',
    description: 'Tactical deep scarlet core with aggressive thermal arcs and crimson plasma streams',
    primaryColor: '#ef4444',
    secondaryColor: '#f97316',
    accentColor: '#ff2a2a',
    coreGlowColor: '#dc2626',
    gridColor: '#991b1b',
    backgroundColor: '#080102',
    fogColor: '#140305'
  }
};

export const DEFAULT_CONFIG: NexusConfig = {
  themeId: 'obsidian_cyan',
  particleCount: 12000,
  particleSpeed: 1.0,
  particleSize: 1.2,
  particleInteractiveForce: 1.0,
  coreRotationSpeed: 1.0,
  coreScale: 1.0,
  parallaxStrength: 1.0,
  shockwaveIntensity: 1.2,
  showSpatialGrid: true,
  showNebula: true,
  showPolarJets: true,
  showGyroRings: true,
  showShieldShards: true,
  soundEnabled: true,
  soundVolume: 0.6,
  ambientDrone: false,
  bloomGlow: 1.0,
  fov: 60,
  wallpaperMode: false
};
