/**
 * TDJ NEXUS - Procedural Nexus Core Architecture (V1.1 Polished)
 * Multi-layer kinetic cyber-geometric core with gyro rings, crystal shards, and plasma singularity.
 */

import * as THREE from 'three';
import { CorePulseShader } from './shaders';
import { ThemeConfig } from './types';

export class NexusCore {
  public group: THREE.Group;
  
  // Core sub-components
  private singularityMesh: THREE.Mesh;
  private singularityWireframe: THREE.LineSegments;
  private coreShaderMaterial: THREE.ShaderMaterial;
  private innerNucleus: THREE.Mesh;

  private gyroRings: THREE.Group[] = [];
  private gyroMaterials: THREE.MeshStandardMaterial[] = [];
  
  private shieldShardsGroup: THREE.Group;
  private shieldShards: THREE.Mesh[] = [];
  private shardBasePositions: THREE.Vector3[] = [];
  private shardBaseRotations: THREE.Euler[] = [];

  private latticeCage: THREE.LineSegments;
  private polarJetsGroup: THREE.Group;
  private polarJetMeshes: THREE.Mesh[] = [];

  // Kinetic state & pre-allocated math objects (0 allocations per frame)
  private pulseEnergy: number = 0.0;
  private shockwaveTimer: number = 0.0;
  private coreRotationSpeed: number = 1.0;
  private tempVec: THREE.Vector3 = new THREE.Vector3();

  constructor(theme: ThemeConfig) {
    this.group = new THREE.Group();

    // 1. Singularity Core (Procedural Dual Icosahedron with Plasma Shader)
    const singularityGeo = new THREE.IcosahedronGeometry(2.4, 4);
    this.coreShaderMaterial = new THREE.ShaderMaterial({
      vertexShader: CorePulseShader.vertexShader,
      fragmentShader: CorePulseShader.fragmentShader,
      uniforms: THREE.UniformsUtils.clone(CorePulseShader.uniforms),
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    this.singularityMesh = new THREE.Mesh(singularityGeo, this.coreShaderMaterial);
    this.group.add(this.singularityMesh);

    // Inner wireframe nucleus
    const nucleusGeo = new THREE.OctahedronGeometry(1.6, 2);
    const nucleusWireGeo = new THREE.WireframeGeometry(nucleusGeo);
    const wireMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(theme.accentColor),
      transparent: true,
      opacity: 0.88,
      blending: THREE.AdditiveBlending
    });
    this.singularityWireframe = new THREE.LineSegments(nucleusWireGeo, wireMat);
    this.group.add(this.singularityWireframe);

    // High-density core nucleus orb
    const nucleusCoreGeo = new THREE.SphereGeometry(0.9, 32, 32);
    const nucleusCoreMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(theme.primaryColor),
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    this.innerNucleus = new THREE.Mesh(nucleusCoreGeo, nucleusCoreMat);
    this.group.add(this.innerNucleus);

    // 2. Gyroscopic Quantum Rings
    this.createGyroRings(theme);

    // 3. Floating Crystalline Tectonic Shield Shards
    this.shieldShardsGroup = new THREE.Group();
    this.createShieldShards(theme);
    this.group.add(this.shieldShardsGroup);

    // 4. Outer Geodesic Tech Lattice Cage
    const latticeGeo = new THREE.IcosahedronGeometry(6.4, 1);
    const latticeWireGeo = new THREE.WireframeGeometry(latticeGeo);
    const latticeMat = new THREE.LineBasicMaterial({
      color: new THREE.Color(theme.primaryColor),
      transparent: true,
      opacity: 0.28,
      blending: THREE.AdditiveBlending
    });
    this.latticeCage = new THREE.LineSegments(latticeWireGeo, latticeMat);
    this.group.add(this.latticeCage);

    // 5. Polar Energy Jets
    this.polarJetsGroup = new THREE.Group();
    this.createPolarJets(theme);
    this.group.add(this.polarJetsGroup);

    this.applyTheme(theme);
  }

  private createGyroRings(theme: ThemeConfig) {
    const ringRadii = [3.6, 4.5, 5.4];
    const ringThickness = [0.08, 0.06, 0.05];

    ringRadii.forEach((radius, i) => {
      const ringGroup = new THREE.Group();
      
      const torusGeo = new THREE.TorusGeometry(radius, ringThickness[i], 16, 80);
      const ringMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(theme.secondaryColor),
        emissive: new THREE.Color(theme.primaryColor),
        emissiveIntensity: 0.65,
        roughness: 0.2,
        metalness: 0.92,
        wireframe: i === 1
      });
      this.gyroMaterials.push(ringMat);

      const torusMesh = new THREE.Mesh(torusGeo, ringMat);
      ringGroup.add(torusMesh);

      const nodeCount = 4 + i * 2;
      const nodeGeo = new THREE.BoxGeometry(0.2, 0.2, 0.35);
      const nodeMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(theme.accentColor),
        blending: THREE.AdditiveBlending
      });

      for (let n = 0; n < nodeCount; n++) {
        const angle = (n / nodeCount) * Math.PI * 2;
        const node = new THREE.Mesh(nodeGeo, nodeMat);
        node.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
        node.rotation.z = angle;
        ringGroup.add(node);
      }

      if (i === 0) ringGroup.rotation.x = Math.PI / 4;
      if (i === 1) ringGroup.rotation.y = Math.PI / 3;
      if (i === 2) ringGroup.rotation.z = Math.PI / 6;

      this.gyroRings.push(ringGroup);
      this.group.add(ringGroup);
    });
  }

  private createShieldShards(theme: ThemeConfig) {
    const shardCount = 14;
    const shardMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      emissive: new THREE.Color(theme.secondaryColor),
      emissiveIntensity: 0.35,
      roughness: 0.15,
      metalness: 0.95,
      flatShading: true,
      side: THREE.DoubleSide
    });

    for (let i = 0; i < shardCount; i++) {
      const shardGeo = new THREE.ConeGeometry(0.7, 2.2, 4);
      const shard = new THREE.Mesh(shardGeo, shardMat.clone());

      const phi = Math.acos(-1 + (2 * i) / shardCount);
      const theta = Math.sqrt(shardCount * Math.PI) * phi;
      const radius = 4.2;

      const pos = new THREE.Vector3(
        radius * Math.cos(theta) * Math.sin(phi),
        radius * Math.sin(theta) * Math.sin(phi),
        radius * Math.cos(phi)
      );

      shard.position.copy(pos);
      shard.lookAt(0, 0, 0);
      shard.rotateX(Math.PI / 2);

      this.shardBasePositions.push(pos.clone());
      this.shardBaseRotations.push(shard.rotation.clone());
      this.shieldShards.push(shard);
      this.shieldShardsGroup.add(shard);
    }
  }

  private createPolarJets(theme: ThemeConfig) {
    [-1, 1].forEach((dir) => {
      const jetGeo = new THREE.CylinderGeometry(0.02, 0.42, 9.5, 16, 1, true);
      jetGeo.translate(0, 4.75 * dir, 0);
      const jetMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(theme.accentColor),
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      const jetMesh = new THREE.Mesh(jetGeo, jetMat);
      if (dir === -1) jetMesh.rotation.x = Math.PI;
      this.polarJetMeshes.push(jetMesh);
      this.polarJetsGroup.add(jetMesh);
    });
  }

  public triggerShockwave(intensity: number = 1.0) {
    this.pulseEnergy = Math.min(2.8, this.pulseEnergy + 1.8 * intensity);
    this.shockwaveTimer = 1.0;
  }

  public update(delta: number, time: number, rotationMultiplier: number = 1.0) {
    const rotSpeed = this.coreRotationSpeed * rotationMultiplier;

    // 1. Decay kinetic shockwave pulse
    if (this.pulseEnergy > 0.001) {
      this.pulseEnergy *= Math.pow(0.91, delta * 60);
    } else {
      this.pulseEnergy = 0.0;
    }

    if (this.shockwaveTimer > 0) {
      this.shockwaveTimer -= delta * 1.5;
    }

    // 2. Update Singularity Shader Uniforms
    this.coreShaderMaterial.uniforms.uTime.value = time;
    this.coreShaderMaterial.uniforms.uPulse.value = this.pulseEnergy;

    // Continuous core counter-rotation
    this.singularityMesh.rotation.y += delta * 0.42 * rotSpeed;
    this.singularityMesh.rotation.x += delta * 0.26 * rotSpeed;

    this.singularityWireframe.rotation.y -= delta * 0.85 * rotSpeed;
    this.singularityWireframe.rotation.z += delta * 0.52 * rotSpeed;

    const scale = 1.0 + Math.sin(time * 3.0) * 0.045 + this.pulseEnergy * 0.28;
    this.singularityMesh.scale.set(scale, scale, scale);

    const nucleusPulse = 1.0 + Math.sin(time * 6.0) * 0.12 + this.pulseEnergy * 0.55;
    this.innerNucleus.scale.set(nucleusPulse, nucleusPulse, nucleusPulse);

    // 3. Gyroscopic Ring Rotation Dynamics
    if (this.gyroRings.length >= 3) {
      this.gyroRings[0].rotation.z += delta * 0.68 * rotSpeed;
      this.gyroRings[0].rotation.x += delta * 0.32 * rotSpeed;

      this.gyroRings[1].rotation.x -= delta * 0.88 * rotSpeed;
      this.gyroRings[1].rotation.y += delta * 0.46 * rotSpeed;

      this.gyroRings[2].rotation.y += delta * 0.52 * rotSpeed;
      this.gyroRings[2].rotation.z -= delta * 0.62 * rotSpeed;
    }

    // 4. Crystalline Shards Breathing & Kinetic Articulation
    const breath = Math.sin(time * 2.0) * 0.26;
    const blastOffset = this.pulseEnergy * 1.35;

    for (let i = 0; i < this.shieldShards.length; i++) {
      const shard = this.shieldShards[i];
      const basePos = this.shardBasePositions[i];
      this.tempVec.copy(basePos).normalize();
      const currentRadius = basePos.length() + breath + blastOffset + Math.sin(time * 3.0 + i) * 0.12;
      
      shard.position.copy(this.tempVec.multiplyScalar(currentRadius));
      shard.rotation.z += delta * 0.22 * (i % 2 === 0 ? 1 : -1);
    }

    this.shieldShardsGroup.rotation.y += delta * 0.16 * rotSpeed;
    this.shieldShardsGroup.rotation.x = Math.sin(time * 0.5) * 0.16;

    // 5. Geodesic Cage Rotation
    this.latticeCage.rotation.y += delta * 0.11 * rotSpeed;
    this.latticeCage.rotation.x += delta * 0.06 * rotSpeed;

    // 6. Polar Jet Animation
    const jetScaleY = 1.0 + Math.sin(time * 8.0) * 0.22 + this.pulseEnergy * 0.65;
    this.polarJetsGroup.scale.set(1.0, jetScaleY, 1.0);
    this.polarJetsGroup.rotation.y += delta * 1.25;
  }

  public applyTheme(theme: ThemeConfig) {
    const primary = new THREE.Color(theme.primaryColor);
    const secondary = new THREE.Color(theme.secondaryColor);
    const accent = new THREE.Color(theme.accentColor);
    const coreGlow = new THREE.Color(theme.coreGlowColor);

    // Singularity shader uniforms
    this.coreShaderMaterial.uniforms.uColorPrimary.value.copy(primary);
    this.coreShaderMaterial.uniforms.uColorAccent.value.copy(accent);
    this.coreShaderMaterial.uniforms.uColorCoreGlow.value.copy(coreGlow);

    // Wireframe & nucleus
    (this.singularityWireframe.material as THREE.LineBasicMaterial).color.copy(accent);
    (this.innerNucleus.material as THREE.MeshBasicMaterial).color.copy(primary);

    // Gyro rings
    this.gyroMaterials.forEach(mat => {
      mat.color.copy(secondary);
      mat.emissive.copy(primary);
    });

    // Shield shards
    this.shieldShards.forEach(shard => {
      const mat = shard.material as THREE.MeshStandardMaterial;
      mat.emissive.copy(secondary);
    });

    // Lattice cage
    (this.latticeCage.material as THREE.LineBasicMaterial).color.copy(primary);

    // Polar jets
    this.polarJetMeshes.forEach(mesh => {
      (mesh.material as THREE.MeshBasicMaterial).color.copy(accent);
    });
  }

  public setVisibility(options: {
    gyroRings?: boolean;
    shieldShards?: boolean;
    polarJets?: boolean;
  }) {
    if (options.gyroRings !== undefined) {
      this.gyroRings.forEach(r => (r.visible = options.gyroRings!));
    }
    if (options.shieldShards !== undefined) {
      this.shieldShardsGroup.visible = options.shieldShards!;
    }
    if (options.polarJets !== undefined) {
      this.polarJetsGroup.visible = options.polarJets!;
    }
  }

  public dispose() {
    this.singularityMesh.geometry.dispose();
    this.coreShaderMaterial.dispose();
    this.singularityWireframe.geometry.dispose();
    (this.singularityWireframe.material as THREE.Material).dispose();
    this.innerNucleus.geometry.dispose();
    (this.innerNucleus.material as THREE.Material).dispose();

    this.gyroMaterials.forEach(m => m.dispose());
    this.shieldShards.forEach(s => {
      s.geometry.dispose();
      (s.material as THREE.Material).dispose();
    });
    this.latticeCage.geometry.dispose();
    (this.latticeCage.material as THREE.Material).dispose();
    this.polarJetMeshes.forEach(j => {
      j.geometry.dispose();
      (j.material as THREE.Material).dispose();
    });
  }
}
