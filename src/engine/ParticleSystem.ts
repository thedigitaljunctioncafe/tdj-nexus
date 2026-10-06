/**
 * TDJ NEXUS - High-Performance Particle Swarm System (V1.1)
 * GPU-accelerated volumetric particle field with interactive cursor deflection and shockwaves.
 */

import * as THREE from 'three';
import { ParticleFieldShader } from './shaders';
import { ThemeConfig } from './types';

export class ParticleSystem {
  public points: THREE.Points;
  private geometry: THREE.BufferGeometry;
  private shaderMaterial: THREE.ShaderMaterial;
  private maxCount: number = 26000;
  private activeCount: number = 12000;

  // CPU buffer references
  private positions: Float32Array;
  private sizes: Float32Array;
  private phases: Float32Array;
  private speeds: Float32Array;
  private velocities: Float32Array;
  private orbitRadii: Float32Array;

  // Kinetic shockwave animation state
  private shockwaveOrigin: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private shockwaveProgress: number = -1.0;
  private shockwaveRadius: number = 0.0;
  private shockwaveMaxRadius: number = 48.0;

  constructor(count: number, theme: ThemeConfig) {
    this.activeCount = Math.min(count, this.maxCount);

    this.positions = new Float32Array(this.maxCount * 3);
    this.sizes = new Float32Array(this.maxCount);
    this.phases = new Float32Array(this.maxCount);
    this.speeds = new Float32Array(this.maxCount);
    this.velocities = new Float32Array(this.maxCount * 3);
    this.orbitRadii = new Float32Array(this.maxCount);

    this.initParticleData();

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('aSize', new THREE.BufferAttribute(this.sizes, 1));
    this.geometry.setAttribute('aPhase', new THREE.BufferAttribute(this.phases, 1));
    this.geometry.setAttribute('aSpeed', new THREE.BufferAttribute(this.speeds, 1));
    this.geometry.setAttribute('aVelocity', new THREE.BufferAttribute(this.velocities, 3));
    this.geometry.setAttribute('aOrbitRadius', new THREE.BufferAttribute(this.orbitRadii, 1));

    this.geometry.setDrawRange(0, this.activeCount);

    this.shaderMaterial = new THREE.ShaderMaterial({
      vertexShader: ParticleFieldShader.vertexShader,
      fragmentShader: ParticleFieldShader.fragmentShader,
      uniforms: THREE.UniformsUtils.clone(ParticleFieldShader.uniforms),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.points = new THREE.Points(this.geometry, this.shaderMaterial);
    this.applyTheme(theme);
  }

  private initParticleData() {
    for (let i = 0; i < this.maxCount; i++) {
      const i3 = i * 3;

      const isCoreCluster = Math.random() < 0.45;
      const radius = isCoreCluster
        ? 3.0 + Math.pow(Math.random(), 1.5) * 12.0
        : 12.0 + Math.pow(Math.random(), 1.8) * 38.0;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      const flattenY = 0.65;
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.cos(phi) * flattenY;
      const z = radius * Math.sin(phi) * Math.sin(theta);

      this.positions[i3] = x;
      this.positions[i3 + 1] = y;
      this.positions[i3 + 2] = z;

      this.sizes[i] = Math.random() * 1.8 + 0.6;
      this.phases[i] = Math.random() * Math.PI * 2;
      this.speeds[i] = (Math.random() * 0.8 + 0.2) * (Math.random() < 0.5 ? 1 : -1);
      this.orbitRadii[i] = radius;

      const speed = Math.random() * 0.5 + 0.1;
      this.velocities[i3] = -Math.sin(theta) * speed;
      this.velocities[i3 + 1] = (Math.random() - 0.5) * 0.2;
      this.velocities[i3 + 2] = Math.cos(theta) * speed;
    }
  }

  public setParticleCount(count: number) {
    this.activeCount = Math.max(1000, Math.min(count, this.maxCount));
    this.geometry.setDrawRange(0, this.activeCount);
  }

  public setParticleSize(multiplier: number) {
    this.shaderMaterial.uniforms.uBaseSize.value = 16.0 * multiplier;
  }

  public triggerShockwave(origin: THREE.Vector3, intensity: number = 1.0) {
    this.shockwaveOrigin.copy(origin);
    this.shockwaveProgress = 0.0;
    this.shockwaveRadius = 0.0;
    this.shockwaveMaxRadius = 48.0 * Math.max(0.6, intensity);
  }

  public update(
    delta: number,
    time: number,
    cursor3D: THREE.Vector3,
    cursorForce: number,
    speedMultiplier: number
  ) {
    this.shaderMaterial.uniforms.uTime.value = time * speedMultiplier;
    this.shaderMaterial.uniforms.uCursorPos.value.copy(cursor3D);
    this.shaderMaterial.uniforms.uCursorForce.value = cursorForce;

    if (this.shockwaveProgress >= 0.0) {
      this.shockwaveProgress += delta * 0.95;
      this.shockwaveRadius = this.shockwaveProgress * this.shockwaveMaxRadius;

      if (this.shockwaveProgress > 1.0) {
        this.shockwaveProgress = -1.0;
      }

      this.shaderMaterial.uniforms.uShockwaveOrigin.value.copy(this.shockwaveOrigin);
      this.shaderMaterial.uniforms.uShockwaveProgress.value = this.shockwaveProgress;
      this.shaderMaterial.uniforms.uShockwaveRadius.value = this.shockwaveRadius;
    } else {
      this.shaderMaterial.uniforms.uShockwaveProgress.value = -1.0;
    }

    this.points.rotation.y = time * 0.04 * speedMultiplier;
  }

  public applyTheme(theme: ThemeConfig) {
    this.shaderMaterial.uniforms.uColorPrimary.value.copy(new THREE.Color(theme.primaryColor));
    this.shaderMaterial.uniforms.uColorSecondary.value.copy(new THREE.Color(theme.secondaryColor));
  }

  public setPixelRatio(dpr: number) {
    this.shaderMaterial.uniforms.uPixelRatio.value = dpr;
  }

  public dispose() {
    this.geometry.dispose();
    this.shaderMaterial.dispose();
  }
}
