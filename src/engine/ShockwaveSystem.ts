/**
 * TDJ NEXUS - Toroidal Energy Shockwave System
 * Spawns dynamic expanding refractive shockwaves with chromatic energy dissipation.
 */

import * as THREE from 'three';
import { EnergyRippleShader } from './shaders';
import { ThemeConfig } from './types';

interface ActiveShockwave {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  outerRing: THREE.Mesh;
  outerMat: THREE.MeshBasicMaterial;
  progress: number; // 0 to 1
  speed: number;
  maxScale: number;
  origin: THREE.Vector3;
}

export class ShockwaveSystem {
  public group: THREE.Group;
  private activeWaves: ActiveShockwave[] = [];
  private theme: ThemeConfig;
  private planeGeo: THREE.PlaneGeometry;
  private ringGeo: THREE.RingGeometry;

  constructor(theme: ThemeConfig) {
    this.group = new THREE.Group();
    this.theme = theme;
    this.planeGeo = new THREE.PlaneGeometry(1, 1);
    this.ringGeo = new THREE.RingGeometry(0.9, 1.0, 64);
  }

  public spawnShockwave(position: THREE.Vector3, intensity: number = 1.0) {
    const shaderMat = new THREE.ShaderMaterial({
      vertexShader: EnergyRippleShader.vertexShader,
      fragmentShader: EnergyRippleShader.fragmentShader,
      uniforms: THREE.UniformsUtils.clone(EnergyRippleShader.uniforms),
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    shaderMat.uniforms.uColor.value = new THREE.Color(this.theme.accentColor);

    const mesh = new THREE.Mesh(this.planeGeo, shaderMat);
    mesh.position.copy(position);
    mesh.rotation.x = -Math.PI / 2; // Flat on XZ plane

    const outerMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(this.theme.primaryColor),
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const outerRing = new THREE.Mesh(this.ringGeo, outerMat);
    outerRing.position.copy(position);
    outerRing.rotation.x = -Math.PI / 2;

    this.group.add(mesh);
    this.group.add(outerRing);

    this.activeWaves.push({
      mesh,
      material: shaderMat,
      outerRing,
      outerMat,
      progress: 0.0,
      speed: 0.8 / Math.max(0.6, intensity),
      maxScale: 38.0 * intensity,
      origin: position.clone()
    });
  }

  public update(delta: number) {
    for (let i = this.activeWaves.length - 1; i >= 0; i--) {
      const wave = this.activeWaves[i];
      wave.progress += delta * wave.speed;

      if (wave.progress >= 1.0) {
        // Cleanup completed wave
        this.group.remove(wave.mesh);
        this.group.remove(wave.outerRing);
        wave.material.dispose();
        wave.outerMat.dispose();
        this.activeWaves.splice(i, 1);
        continue;
      }

      // Eased expansion curve (starts fast, expands gracefully)
      const ease = 1.0 - Math.pow(1.0 - wave.progress, 3);
      const currentScale = Math.max(0.1, ease * wave.maxScale);

      wave.mesh.scale.set(currentScale, currentScale, currentScale);
      wave.outerRing.scale.set(currentScale, currentScale, currentScale);

      wave.material.uniforms.uProgress.value = wave.progress;
      wave.outerMat.opacity = (1.0 - wave.progress) * 0.75;
    }
  }

  public applyTheme(theme: ThemeConfig) {
    this.theme = theme;
    this.activeWaves.forEach(w => {
      w.material.uniforms.uColor.value.copy(new THREE.Color(theme.accentColor));
      w.outerMat.color.copy(new THREE.Color(theme.primaryColor));
    });
  }
}
