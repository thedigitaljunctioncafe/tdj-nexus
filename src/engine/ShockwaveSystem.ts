/**
 * TDJ NEXUS - Advanced Toroidal Energy Shockwave System (V1.1)
 * Object-pooled dynamic expanding refractive shockwaves with chromatic energy dissipation.
 */

import * as THREE from 'three';
import { EnergyRippleShader } from './shaders';
import { ThemeConfig } from './types';

interface ShockwaveInstance {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  outerRing: THREE.Mesh;
  outerMat: THREE.MeshBasicMaterial;
  progress: number; // 0 to 1
  speed: number;
  maxScale: number;
  active: boolean;
}

export class ShockwaveSystem {
  public group: THREE.Group;
  private pool: ShockwaveInstance[] = [];
  private poolSize: number = 8;
  private theme: ThemeConfig;
  private planeGeo: THREE.PlaneGeometry;
  private ringGeo: THREE.RingGeometry;

  constructor(theme: ThemeConfig) {
    this.group = new THREE.Group();
    this.theme = theme;
    this.planeGeo = new THREE.PlaneGeometry(1, 1);
    this.ringGeo = new THREE.RingGeometry(0.88, 1.0, 64);

    // Initialize object pool to avoid runtime allocations
    this.initPool();
  }

  private initPool() {
    for (let i = 0; i < this.poolSize; i++) {
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
      mesh.rotation.x = -Math.PI / 2;
      mesh.visible = false;

      const outerMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(this.theme.primaryColor),
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      const outerRing = new THREE.Mesh(this.ringGeo, outerMat);
      outerRing.rotation.x = -Math.PI / 2;
      outerRing.visible = false;

      this.group.add(mesh);
      this.group.add(outerRing);

      this.pool.push({
        mesh,
        material: shaderMat,
        outerRing,
        outerMat,
        progress: 1.0,
        speed: 1.0,
        maxScale: 38.0,
        active: false
      });
    }
  }

  public spawnShockwave(position: THREE.Vector3, intensity: number = 1.0) {
    // Find first inactive or oldest instance from pool
    let instance = this.pool.find(item => !item.active);
    if (!instance) {
      // Recycle the oldest active instance
      instance = this.pool[0];
    }

    instance.mesh.position.copy(position);
    instance.outerRing.position.copy(position);
    instance.progress = 0.0;
    instance.speed = 0.85 / Math.max(0.6, intensity);
    instance.maxScale = 40.0 * Math.max(0.7, intensity);
    instance.active = true;

    instance.mesh.scale.set(0.1, 0.1, 0.1);
    instance.outerRing.scale.set(0.1, 0.1, 0.1);
    instance.mesh.visible = true;
    instance.outerRing.visible = true;

    instance.material.uniforms.uProgress.value = 0.0;
    instance.material.uniforms.uColor.value.set(this.theme.accentColor);
    instance.outerMat.color.set(this.theme.primaryColor);
    instance.outerMat.opacity = 0.85;
  }

  public update(delta: number) {
    for (let i = 0; i < this.pool.length; i++) {
      const instance = this.pool[i];
      if (!instance.active) continue;

      instance.progress += delta * instance.speed;

      if (instance.progress >= 1.0) {
        instance.active = false;
        instance.mesh.visible = false;
        instance.outerRing.visible = false;
        continue;
      }

      // Smooth cubic expansion
      const ease = 1.0 - Math.pow(1.0 - instance.progress, 3);
      const currentScale = Math.max(0.1, ease * instance.maxScale);

      instance.mesh.scale.set(currentScale, currentScale, currentScale);
      instance.outerRing.scale.set(currentScale, currentScale, currentScale);

      instance.material.uniforms.uProgress.value = instance.progress;
      instance.outerMat.opacity = Math.pow(1.0 - instance.progress, 1.3) * 0.8;
    }
  }

  public applyTheme(theme: ThemeConfig) {
    this.theme = theme;
    const accent = new THREE.Color(theme.accentColor);
    const primary = new THREE.Color(theme.primaryColor);

    this.pool.forEach(inst => {
      inst.material.uniforms.uColor.value.copy(accent);
      inst.outerMat.color.copy(primary);
    });
  }

  public dispose() {
    this.planeGeo.dispose();
    this.ringGeo.dispose();
    this.pool.forEach(inst => {
      inst.material.dispose();
      inst.outerMat.dispose();
    });
    this.pool = [];
  }
}
