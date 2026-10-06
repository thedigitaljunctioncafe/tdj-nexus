/**
 * TDJ NEXUS - Master 3D Scene Orchestrator
 * Connects NexusCore, ParticleSystem, ShockwaveSystem, and Interactive Parallax.
 */

import * as THREE from 'three';
import { NexusCore } from './NexusCore';
import { ParticleSystem } from './ParticleSystem';
import { ShockwaveSystem } from './ShockwaveSystem';
import { DeepGridShader } from './shaders';
import { audioSynth } from './audioSynth';
import { NexusConfig, SystemStats, THEME_PRESETS, ThemeConfig } from './types';

export class NexusScene {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  
  // Subsystems
  public core: NexusCore;
  public particles: ParticleSystem;
  public shockwaves: ShockwaveSystem;

  // Background environment
  private spatialGridTop: THREE.Mesh;
  private spatialGridBottom: THREE.Mesh;
  private gridMaterial: THREE.ShaderMaterial;
  private nebulaGroup: THREE.Group;
  private ambientLight: THREE.AmbientLight;
  private corePointLight: THREE.PointLight;
  private rimLight: THREE.DirectionalLight;

  // Configuration & State
  private config: NexusConfig;
  private theme: ThemeConfig;
  private animationFrameId: number | null = null;
  private clock: THREE.Clock;

  // Interaction coordinates
  private mouseNorm: THREE.Vector2 = new THREE.Vector2(0, 0);
  private targetMouseNorm: THREE.Vector2 = new THREE.Vector2(0, 0);
  private cursor3D: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private planeZ: THREE.Plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

  // Performance telemetry
  private frameCount: number = 0;
  private lastFpsUpdate: number = 0;
  private stats: SystemStats = {
    fps: 60,
    frameTime: 16.6,
    particleCount: 12000,
    drawCalls: 0,
    triangles: 0
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

    // 2. Camera
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(this.config.fov, width / height, 0.1, 300);
    this.camera.position.set(0, 0, 22);

    // 3. High-Performance WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: false,
      stencil: false,
      depth: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.container.appendChild(this.renderer.domElement);

    // 4. Initialize Lighting
    this.ambientLight = new THREE.AmbientLight(0x1a2035, 1.2);
    this.scene.add(this.ambientLight);

    this.corePointLight = new THREE.PointLight(this.theme.primaryColor, 3.5, 30, 1.5);
    this.corePointLight.position.set(0, 0, 0);
    this.scene.add(this.corePointLight);

    this.rimLight = new THREE.DirectionalLight(this.theme.secondaryColor, 1.8);
    this.rimLight.position.set(5, 10, 8);
    this.scene.add(this.rimLight);

    // 5. Build Subsystems
    this.core = new NexusCore(this.theme);
    this.scene.add(this.core.group);

    this.particles = new ParticleSystem(this.config.particleCount, this.theme);
    this.scene.add(this.particles.points);

    this.shockwaves = new ShockwaveSystem(this.theme);
    this.scene.add(this.shockwaves.group);

    // 6. Build Environment Grid Matrix & Cosmic Clouds
    this.gridMaterial = new THREE.ShaderMaterial({
      vertexShader: DeepGridShader.vertexShader,
      fragmentShader: DeepGridShader.fragmentShader,
      uniforms: THREE.UniformsUtils.clone(DeepGridShader.uniforms),
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.gridMaterial.uniforms.uGridColor.value = new THREE.Color(this.theme.gridColor);

    const gridGeo = new THREE.PlaneGeometry(160, 160);
    this.spatialGridBottom = new THREE.Mesh(gridGeo, this.gridMaterial);
    this.spatialGridBottom.position.y = -10;
    this.spatialGridBottom.rotation.x = -Math.PI / 2;
    this.scene.add(this.spatialGridBottom);

    this.spatialGridTop = new THREE.Mesh(gridGeo, this.gridMaterial);
    this.spatialGridTop.position.y = 10;
    this.spatialGridTop.rotation.x = Math.PI / 2;
    this.scene.add(this.spatialGridTop);

    // Nebula volumetric clouds
    this.nebulaGroup = new THREE.Group();
    this.createCosmicNebula();
    this.scene.add(this.nebulaGroup);

    // 7. Event Handlers
    this.setupEventListeners();

    // 8. Start Render Loop
    this.animate = this.animate.bind(this);
    this.animate();
  }

  private createCosmicNebula() {
    const cloudCount = 6;
    const cloudGeo = new THREE.SphereGeometry(18, 16, 16);
    
    for (let i = 0; i < cloudCount; i++) {
      const cloudMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(this.theme.secondaryColor),
        transparent: true,
        opacity: 0.04,
        blending: THREE.AdditiveBlending,
        wireframe: true,
        side: THREE.BackSide
      });
      const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
      cloudMesh.position.set(
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 30 - 15
      );
      cloudMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      cloudMesh.scale.set(
        1.0 + Math.random() * 0.8,
        0.6 + Math.random() * 0.5,
        1.0 + Math.random() * 0.8
      );
      this.nebulaGroup.add(cloudMesh);
    }
  }

  private setupEventListeners() {
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('pointermove', this.handlePointerMove);
    this.container.addEventListener('pointerdown', this.handlePointerDown);

    // Context lost recovery
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
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.particles.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };

  private handlePointerMove = (e: MouseEvent | PointerEvent) => {
    // Normalized device coordinates (-1 to +1)
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    this.targetMouseNorm.set(x, y);

    // Unproject to 3D world plane at Z=0 for interactive particle physics
    this.raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);
    const intersect = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(this.planeZ, intersect);
    if (intersect) {
      this.cursor3D.copy(intersect);
    }
  };

  private handlePointerDown = (e: MouseEvent | PointerEvent) => {
    // Only trigger if click was inside container
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    
    this.raycaster.setFromCamera(new THREE.Vector2(x, y), this.camera);
    const intersect = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(this.planeZ, intersect);

    const spawnPos = intersect || new THREE.Vector3(0, 0, 0);
    this.triggerShockwave(spawnPos, this.config.shockwaveIntensity);

    if (this.config.soundEnabled) {
      audioSynth.playShockwave(this.config.shockwaveIntensity);
    }
  };

  public triggerShockwave(origin: THREE.Vector3 = new THREE.Vector3(0, 0, 0), intensity: number = 1.0) {
    this.core.triggerShockwave(intensity);
    this.particles.triggerShockwave(origin, intensity);
    this.shockwaves.spawnShockwave(origin, intensity);
  }

  private animate() {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const time = this.clock.getElapsedTime();

    // 1. Smooth Camera Parallax Lerp
    this.mouseNorm.lerp(this.targetMouseNorm, delta * 4.5);
    
    const parallax = this.config.parallaxStrength;
    const targetCamX = this.mouseNorm.x * 4.0 * parallax;
    const targetCamY = this.mouseNorm.y * 2.5 * parallax;

    this.camera.position.x += (targetCamX - this.camera.position.x) * (delta * 3.0);
    this.camera.position.y += (targetCamY - this.camera.position.y) * (delta * 3.0);
    this.camera.lookAt(0, 0, 0);

    // Slight dynamic FOV breathing
    this.camera.fov = this.config.fov + Math.sin(time * 0.8) * 0.5;
    this.camera.updateProjectionMatrix();

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
    this.nebulaGroup.rotation.y = time * 0.02;
    this.nebulaGroup.rotation.z = Math.sin(time * 0.05) * 0.1;

    // 4. Render Frame
    this.renderer.render(this.scene, this.camera);

    // 5. Performance Telemetry Calculation
    this.frameCount++;
    if (time - this.lastFpsUpdate >= 0.5) {
      const fps = Math.round(this.frameCount / (time - this.lastFpsUpdate));
      const info = this.renderer.info;
      this.stats = {
        fps: Math.min(fps, 144),
        frameTime: parseFloat((delta * 1000).toFixed(1)),
        particleCount: this.config.particleCount,
        drawCalls: info.render.calls,
        triangles: info.render.triangles
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

    if (newConfig.particleCount !== undefined) {
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
      this.nebulaGroup.visible = newConfig.showNebula;
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
    this.scene.background = new THREE.Color(theme.backgroundColor);
    (this.scene.fog as THREE.FogExp2).color = new THREE.Color(theme.fogColor);

    this.corePointLight.color.copy(new THREE.Color(theme.primaryColor));
    this.rimLight.color.copy(new THREE.Color(theme.secondaryColor));
    this.gridMaterial.uniforms.uGridColor.value.copy(new THREE.Color(theme.gridColor));

    this.core.applyTheme(theme);
    this.particles.applyTheme(theme);
    this.shockwaves.applyTheme(theme);

    // Update nebula cloud colors
    this.nebulaGroup.children.forEach(child => {
      if (child instanceof THREE.Mesh) {
        (child.material as THREE.MeshBasicMaterial).color.copy(new THREE.Color(theme.secondaryColor));
      }
    });
  }

  public dispose() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('pointermove', this.handlePointerMove);
    this.container.removeEventListener('pointerdown', this.handlePointerDown);

    audioSynth.stopAmbientDrone();

    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}
