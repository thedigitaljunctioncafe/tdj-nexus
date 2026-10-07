/**
 * TDJ NEXUS - Master 3D Scene Orchestrator (V1.1 Production Patch)
 * Connects NexusCore, ParticleSystem, ShockwaveSystem, Shader-based Nebula, Adaptive Performance, and Cinematic Camera.
 */

import * as THREE from 'three';
import { NexusCore } from './NexusCore';
import { ParticleSystem } from './ParticleSystem';
import { ShockwaveSystem } from './ShockwaveSystem';
import { DeepGridShader, CosmicNebulaShader } from './shaders';
import { audioSynth } from './audioSynth';
import { 
  NexusConfig, 
  SystemStats, 
  THEME_PRESETS, 
  ThemeConfig, 
  QualityLevel, 
  QUALITY_PRESETS 
} from './types';

export class NexusScene {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  
  // Subsystems
  public core: NexusCore;
  public particles: ParticleSystem;
  public shockwaves: ShockwaveSystem;

  // Environment & Shaders
  private spatialGridTop: THREE.Mesh;
  private spatialGridBottom: THREE.Mesh;
  private gridMaterial: THREE.ShaderMaterial;
  private gridGeo: THREE.PlaneGeometry;

  private nebulaDome: THREE.Mesh;
  private nebulaMaterial: THREE.ShaderMaterial;
  private nebulaGeo: THREE.SphereGeometry;

  private ambientLight: THREE.AmbientLight;
  private corePointLight: THREE.PointLight;
  private rimLight: THREE.DirectionalLight;

  // Configuration & State
  private config: NexusConfig;
  private theme: ThemeConfig;
  private animationFrameId: number | null = null;
  private clock: THREE.Clock;

  // Pre-allocated math objects (TRUE ZERO-ALLOCATION RENDER LOOP & INTERACTION)
  private mouseNorm: THREE.Vector2 = new THREE.Vector2(0, 0);
  private targetMouseNorm: THREE.Vector2 = new THREE.Vector2(0, 0);
  private cursor3D: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private planeZ: THREE.Plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  private camLookTarget: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private tempPointerVec2: THREE.Vector2 = new THREE.Vector2(0, 0);
  private tempIntersectVec3: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private defaultShockwaveOrigin: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private baseCamDistance: number = 22.0;

  // Adaptive Performance Monitoring
  private frameCount: number = 0;
  private lastFpsUpdate: number = 0;
  private lowFpsCounter: number = 0;
  private highFpsCounter: number = 0;
  private currentAutoTier: number = 2; // 0: low, 1: balanced, 2: high, 3: ultra
  private currentDpr: number = 1.0;
  private stats: SystemStats = {
    fps: 60,
    frameTime: 16.6,
    particleCount: 12000,
    drawCalls: 0,
    triangles: 0,
    effectiveQuality: 'high',
    gpuDpr: 1.0
  };
  private onStatsUpdate?: (stats: SystemStats) => void;

  constructor(
    container: HTMLElement,
    initialConfig: NexusConfig,
    onStatsUpdate?: (stats: SystemStats) => void
  ) {
    this.container = container;
    this.config = initialConfig;
    this.theme = THEME_PRESETS[this.config.themeId] || THEME_PRESETS.obsidian_cyan;
    this.onStatsUpdate = onStatsUpdate;
    this.clock = new THREE.Clock();

    // 1. Scene & Depth Fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.theme.backgroundColor);
    this.scene.fog = new THREE.FogExp2(this.theme.fogColor, 0.015);

    // 2. Camera with Adaptive Aspect Ratio Framing
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    const aspect = width / height;

    this.camera = new THREE.PerspectiveCamera(this.config.fov, aspect, 0.1, 400);
    this.updateCameraFraming(aspect);

    // 3. High-Performance WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: false,
      stencil: false,
      depth: true
    });
    this.renderer.setSize(width, height);
    this.applyQualitySettings();
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting Setup
    this.ambientLight = new THREE.AmbientLight(0x141a2c, 1.2);
    this.scene.add(this.ambientLight);

    this.corePointLight = new THREE.PointLight(this.theme.primaryColor, 3.8, 35, 1.5);
    this.corePointLight.position.set(0, 0, 0);
    this.scene.add(this.corePointLight);

    this.rimLight = new THREE.DirectionalLight(this.theme.secondaryColor, 1.9);
    this.rimLight.position.set(5, 10, 8);
    this.scene.add(this.rimLight);

    // 5. Build Subsystems
    this.core = new NexusCore(this.theme);
    this.scene.add(this.core.group);

    this.particles = new ParticleSystem(this.config.particleCount, this.theme);
    this.scene.add(this.particles.points);

    this.shockwaves = new ShockwaveSystem(this.theme);
    this.scene.add(this.shockwaves.group);

    // 6. Build Spatial Grid Matrix
    this.gridMaterial = new THREE.ShaderMaterial({
      vertexShader: DeepGridShader.vertexShader,
      fragmentShader: DeepGridShader.fragmentShader,
      uniforms: THREE.UniformsUtils.clone(DeepGridShader.uniforms),
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.gridMaterial.uniforms.uGridColor.value.set(this.theme.gridColor);

    this.gridGeo = new THREE.PlaneGeometry(180, 180);
    this.spatialGridBottom = new THREE.Mesh(this.gridGeo, this.gridMaterial);
    this.spatialGridBottom.position.y = -10.5;
    this.spatialGridBottom.rotation.x = -Math.PI / 2;
    this.scene.add(this.spatialGridBottom);

    this.spatialGridTop = new THREE.Mesh(this.gridGeo, this.gridMaterial);
    this.spatialGridTop.position.y = 10.5;
    this.spatialGridTop.rotation.x = Math.PI / 2;
    this.scene.add(this.spatialGridTop);

    // 7. Advanced Shader-Based Cosmic Nebula
    this.nebulaMaterial = new THREE.ShaderMaterial({
      vertexShader: CosmicNebulaShader.vertexShader,
      fragmentShader: CosmicNebulaShader.fragmentShader,
      uniforms: THREE.UniformsUtils.clone(CosmicNebulaShader.uniforms),
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false
    });
    this.updateNebulaUniforms();

    this.nebulaGeo = new THREE.SphereGeometry(60, 32, 32);
    this.nebulaDome = new THREE.Mesh(this.nebulaGeo, this.nebulaMaterial);
    this.scene.add(this.nebulaDome);

    // 8. Event Listeners
    this.setupEventListeners();

    // 9. Start Render Loop
    this.animate = this.animate.bind(this);
    this.animate();
  }

  private updateCameraFraming(aspect: number) {
    if (aspect < 1.0) {
      this.baseCamDistance = 22.0 / aspect * 0.75;
      this.camera.fov = Math.min(75, this.config.fov * 1.15);
    } else if (aspect > 2.2) {
      this.baseCamDistance = 21.0;
      this.camera.fov = Math.max(45, this.config.fov * 0.9);
    } else {
      this.baseCamDistance = 22.0;
      this.camera.fov = this.config.fov;
    }
    this.camera.position.set(0, 0, this.baseCamDistance);
    this.camera.updateProjectionMatrix();
  }

  private updateNebulaUniforms() {
    this.nebulaMaterial.uniforms.uColorPrimary.value.set(this.theme.primaryColor);
    this.nebulaMaterial.uniforms.uColorSecondary.value.set(this.theme.secondaryColor);
    this.nebulaMaterial.uniforms.uColorDeep.value.set(this.theme.backgroundColor);
  }

  private applyQualitySettings() {
    let effectiveDpr = Math.min(window.devicePixelRatio, 2.0);
    let targetParticleCount = this.config.particleCount;
    let targetComplexity = 3.0;

    if (this.config.quality !== 'auto') {
      const preset = QUALITY_PRESETS[this.config.quality];
      effectiveDpr = Math.min(window.devicePixelRatio, preset.maxDpr);
      targetParticleCount = preset.particleCount;
      targetComplexity = preset.nebulaComplexity;
      if (this.particles) {
        this.particles.setParticleSize(preset.particleSize);
      }
    } else {
      const tiers: (keyof typeof QUALITY_PRESETS)[] = ['low', 'balanced', 'high', 'ultra'];
      const currentTierKey = tiers[this.currentAutoTier];
      const preset = QUALITY_PRESETS[currentTierKey];
      effectiveDpr = Math.min(window.devicePixelRatio, preset.maxDpr);
      targetParticleCount = preset.particleCount;
      targetComplexity = preset.nebulaComplexity;
      if (this.particles) {
        this.particles.setParticleSize(preset.particleSize);
      }
    }

    this.currentDpr = effectiveDpr;
    this.renderer.setPixelRatio(effectiveDpr);
    if (this.nebulaMaterial) {
      this.nebulaMaterial.uniforms.uComplexity.value = targetComplexity;
    }
    if (this.particles) {
      this.particles.setParticleCount(targetParticleCount);
      this.particles.setPixelRatio(effectiveDpr);
    }
  }

  private setupEventListeners() {
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('pointermove', this.handlePointerMove);
    this.container.addEventListener('pointerdown', this.handlePointerDown);

    this.renderer.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
    });

    this.renderer.domElement.addEventListener('webglcontextrestored', () => {
      this.animate();
    });
  }

  private handleResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    const aspect = width / height;

    this.camera.aspect = aspect;
    this.updateCameraFraming(aspect);
    this.renderer.setSize(width, height);
    this.applyQualitySettings();
  };

  private handlePointerMove = (e: MouseEvent | PointerEvent) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    this.targetMouseNorm.set(x, y);

    this.raycaster.setFromCamera(this.targetMouseNorm, this.camera);
    this.raycaster.ray.intersectPlane(this.planeZ, this.cursor3D);
  };

  private handlePointerDown = (e: MouseEvent | PointerEvent) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    
    this.tempPointerVec2.set(x, y);
    this.raycaster.setFromCamera(this.tempPointerVec2, this.camera);
    const hit = this.raycaster.ray.intersectPlane(this.planeZ, this.tempIntersectVec3);

    const spawnPos = hit ? this.tempIntersectVec3 : this.cursor3D;
    this.triggerShockwave(spawnPos, this.config.shockwaveIntensity, true);
  };

  /**
   * Triggers visual shockwave + core resonance pulse + synthesized audio in full sync
   */
  public triggerShockwave(origin?: THREE.Vector3, intensity: number = 1.0, playAudio: boolean = true) {
    const spawnOrigin = origin || this.defaultShockwaveOrigin;
    this.core.triggerShockwave(intensity);
    this.particles.triggerShockwave(spawnOrigin, intensity);
    this.shockwaves.spawnShockwave(spawnOrigin, intensity);

    if (playAudio && this.config.soundEnabled) {
      audioSynth.playShockwave(intensity);
    }
  }

  private animate() {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.getElapsedTime();

    // 1. Cinematic Camera: Smooth Parallax & Subtle Idle Harmonic Breathing (0 allocations)
    this.mouseNorm.lerp(this.targetMouseNorm, delta * 3.8);
    
    const parallax = this.config.parallaxStrength;
    const idleDriftX = Math.sin(time * 0.35) * 0.8;
    const idleDriftY = Math.cos(time * 0.28) * 0.5;

    const targetCamX = (this.mouseNorm.x * 4.2 + idleDriftX) * parallax;
    const targetCamY = (this.mouseNorm.y * 2.6 + idleDriftY) * parallax;

    this.camera.position.x += (targetCamX - this.camera.position.x) * (delta * 2.8);
    this.camera.position.y += (targetCamY - this.camera.position.y) * (delta * 2.8);
    this.camera.lookAt(this.camLookTarget);

    // 2. Update Subsystems
    this.core.update(delta, time, this.config.coreRotationSpeed);
    this.particles.update(
      delta,
      time,
      this.cursor3D,
      this.config.particleInteractiveForce,
      this.config.particleSpeed
    );
    this.shockwaves.update(delta);

    // 3. Update Environment Uniforms
    this.gridMaterial.uniforms.uTime.value = time;
    this.nebulaMaterial.uniforms.uTime.value = time;
    this.nebulaDome.rotation.y = time * 0.015;

    // 4. Render Frame
    this.renderer.render(this.scene, this.camera);

    // 5. Adaptive Performance Telemetry & Automatic Scaling
    this.frameCount++;
    if (time - this.lastFpsUpdate >= 0.5) {
      const elapsed = time - this.lastFpsUpdate;
      const currentFps = Math.round(this.frameCount / elapsed);
      const info = this.renderer.info;

      if (this.config.quality === 'auto') {
        if (currentFps < 45) {
          this.lowFpsCounter++;
          this.highFpsCounter = 0;
          if (this.lowFpsCounter >= 3 && this.currentAutoTier > 0) {
            this.currentAutoTier--;
            this.lowFpsCounter = 0;
            this.applyQualitySettings();
          }
        } else if (currentFps > 57) {
          this.highFpsCounter++;
          this.lowFpsCounter = 0;
          if (this.highFpsCounter >= 6 && this.currentAutoTier < 3) {
            this.currentAutoTier++;
            this.highFpsCounter = 0;
            this.applyQualitySettings();
          }
        }
      }

      const tiers: QualityLevel[] = ['low', 'balanced', 'high', 'ultra'];
      const effectiveQuality = this.config.quality === 'auto' ? tiers[this.currentAutoTier] : this.config.quality;

      this.stats = {
        fps: Math.min(currentFps, 144),
        frameTime: parseFloat((delta * 1000).toFixed(1)),
        particleCount: this.particles['activeCount'] || this.config.particleCount,
        drawCalls: info.render.calls,
        triangles: info.render.triangles,
        effectiveQuality,
        gpuDpr: parseFloat(this.currentDpr.toFixed(2))
      };

      if (this.onStatsUpdate) {
        this.onStatsUpdate(this.stats);
      }

      this.frameCount = 0;
      this.lastFpsUpdate = time;
    }
  }

  public updateConfig(newConfig: Partial<NexusConfig>) {
    this.config = { ...this.config, ...newConfig };

    if (newConfig.themeId && THEME_PRESETS[newConfig.themeId]) {
      this.setTheme(THEME_PRESETS[newConfig.themeId]);
    }

    if (newConfig.quality !== undefined) {
      this.applyQualitySettings();
    }

    if (newConfig.particleCount !== undefined && this.config.quality !== 'auto') {
      this.particles.setParticleCount(newConfig.particleCount);
    }

    if (newConfig.particleSize !== undefined) {
      this.particles.setParticleSize(newConfig.particleSize);
    }

    if (newConfig.showSpatialGrid !== undefined) {
      this.spatialGridTop.visible = newConfig.showSpatialGrid;
      this.spatialGridBottom.visible = newConfig.showSpatialGrid;
    }

    if (newConfig.showNebula !== undefined) {
      this.nebulaDome.visible = newConfig.showNebula;
    }

    if (newConfig.coreScale !== undefined) {
      this.core.group.scale.set(newConfig.coreScale, newConfig.coreScale, newConfig.coreScale);
    }

    this.core.setVisibility({
      gyroRings: this.config.showGyroRings,
      shieldShards: this.config.showShieldShards,
      polarJets: this.config.showPolarJets
    });

    if (newConfig.soundVolume !== undefined) {
      audioSynth.setVolume(newConfig.soundVolume);
    }

    if (newConfig.soundEnabled !== undefined) {
      audioSynth.setMuted(!newConfig.soundEnabled);
    }

    if (newConfig.ambientDrone !== undefined) {
      if (newConfig.ambientDrone && this.config.soundEnabled) {
        audioSynth.startAmbientDrone();
      } else {
        audioSynth.stopAmbientDrone();
      }
    }
  }

  public setTheme(theme: ThemeConfig) {
    this.theme = theme;
    (this.scene.background as THREE.Color).set(theme.backgroundColor);
    (this.scene.fog as THREE.FogExp2).color.set(theme.fogColor);

    this.corePointLight.color.set(theme.primaryColor);
    this.rimLight.color.set(theme.secondaryColor);
    this.gridMaterial.uniforms.uGridColor.value.set(theme.gridColor);

    this.core.applyTheme(theme);
    this.particles.applyTheme(theme);
    this.shockwaves.applyTheme(theme);
    this.updateNebulaUniforms();
  }

  public dispose() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('pointermove', this.handlePointerMove);
    this.container.removeEventListener('pointerdown', this.handlePointerDown);

    audioSynth.stopAmbientDrone();

    this.core.dispose();
    this.particles.dispose();
    this.shockwaves.dispose();

    this.gridGeo.dispose();
    this.gridMaterial.dispose();
    this.nebulaGeo.dispose();
    this.nebulaMaterial.dispose();

    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
