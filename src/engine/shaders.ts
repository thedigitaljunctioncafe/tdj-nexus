/**
 * TDJ NEXUS - Custom WebGL Shaders (V1.1 Production Upgrade)
 * High-performance GPU shaders for procedural glow, particle dynamics, cosmic nebula, and energy shockwaves.
 */

import * as THREE from 'three';

// 1. Central Singularity & Core Plasma Glow Shader
export const CorePulseShader = {
  uniforms: {
    uTime: { value: 0 },
    uColorPrimary: { value: new THREE.Color('#00f0ff') },
    uColorAccent: { value: new THREE.Color('#38bdf8') },
    uColorCoreGlow: { value: new THREE.Color('#00d2ff') },
    uPulse: { value: 0.0 },
    uIntensity: { value: 1.0 }
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    uniform float uTime;
    uniform float uPulse;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      
      // Procedural surface harmonic displacement
      vec3 pos = position;
      float wave = sin(pos.x * 4.5 + uTime * 3.2) * cos(pos.y * 4.5 - uTime * 2.8) * 0.08;
      float wave2 = sin(pos.z * 5.0 + uTime * 4.0) * 0.04;
      pos += normal * (wave + wave2 + uPulse * 0.22);

      vPosition = pos;
      vec4 worldPos = modelMatrix * vec4(pos, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    uniform float uTime;
    uniform vec3 uColorPrimary;
    uniform vec3 uColorAccent;
    uniform vec3 uColorCoreGlow;
    uniform float uPulse;
    uniform float uIntensity;

    void main() {
      // High-definition Fresnel calculation with chromatic dispersion rim
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      float normalDot = max(dot(viewDir, vNormal), 0.0);
      float fresnel = pow(1.0 - normalDot, 2.4);
      float fresnelInner = pow(1.0 - normalDot, 4.0);

      // Procedural multi-frequency energy core plasma
      float p1 = sin(vPosition.x * 6.5 + uTime * 3.8);
      float p2 = sin(vPosition.y * 6.5 - uTime * 3.2);
      float p3 = sin(vPosition.z * 6.5 + uTime * 2.6);
      float plasma = smoothstep(-0.4, 0.9, p1 * p2 * p3);

      // Dual-gradient chromatic blending
      vec3 col = mix(uColorPrimary, uColorAccent, fresnel * 0.8 + plasma * 0.4);
      col = mix(col, uColorCoreGlow, fresnelInner);
      col += uColorAccent * (uPulse * 2.0 + fresnel * 1.2);

      float alpha = clamp(fresnel * 1.5 + plasma * 0.45 + uPulse * 0.6, 0.0, 1.0) * uIntensity;
      gl_FragColor = vec4(col, alpha);
    }
  `
};

// 2. High-Performance GPU Particle Shader
export const ParticleFieldShader = {
  uniforms: {
    uTime: { value: 0 },
    uColorPrimary: { value: new THREE.Color('#00f0ff') },
    uColorSecondary: { value: new THREE.Color('#0ea5e9') },
    uCursorPos: { value: new THREE.Vector3(0, 0, 0) },
    uCursorForce: { value: 1.0 },
    uShockwaveOrigin: { value: new THREE.Vector3(0, 0, 0) },
    uShockwaveProgress: { value: -1.0 },
    uShockwaveRadius: { value: 0.0 },
    uPixelRatio: { value: 1.0 },
    uBaseSize: { value: 16.0 }
  },
  vertexShader: `
    attribute float aSize;
    attribute float aPhase;
    attribute float aSpeed;
    attribute vec3 aVelocity;
    attribute float aOrbitRadius;

    varying vec3 vColor;
    varying float vAlpha;

    uniform float uTime;
    uniform vec3 uColorPrimary;
    uniform vec3 uColorSecondary;
    uniform vec3 uCursorPos;
    uniform float uCursorForce;
    uniform vec3 uShockwaveOrigin;
    uniform float uShockwaveProgress;
    uniform float uShockwaveRadius;
    uniform float uPixelRatio;
    uniform float uBaseSize;

    void main() {
      vec3 pos = position;

      // 1. Orbital continuous flow
      float angle = uTime * aSpeed * 0.4 + aPhase;
      
      // 2. 3D Harmonic Curl & Micro-Vortex drift
      pos.x += sin(pos.y * 0.06 + uTime * 0.5 + aPhase) * 0.85;
      pos.y += cos(pos.z * 0.06 + uTime * 0.6 + aPhase) * 0.85;
      pos.z += sin(pos.x * 0.06 + uTime * 0.4 + aPhase) * 0.85;

      // 3. Cursor proximity interactive repulsion / swirl
      vec3 toCursor = pos - uCursorPos;
      float cursorDist = length(toCursor);
      if (cursorDist < 14.0) {
        float factor = (1.0 - cursorDist / 14.0) * uCursorForce;
        vec3 push = normalize(toCursor) * factor * 4.5;
        vec3 swirl = cross(normalize(toCursor), vec3(0.0, 1.0, 0.0)) * factor * 5.5;
        pos += push + swirl;
      }

      // 4. Kinetic Shockwave ring displacement
      if (uShockwaveProgress >= 0.0 && uShockwaveProgress <= 1.0) {
        float distToShockwave = length(pos - uShockwaveOrigin);
        float waveDist = abs(distToShockwave - uShockwaveRadius);
        if (waveDist < 7.0) {
          float wavePower = (1.0 - waveDist / 7.0) * (1.0 - uShockwaveProgress);
          vec3 shockDir = normalize(pos - uShockwaveOrigin);
          pos += shockDir * wavePower * 10.0;
        }
      }

      // View matrix transformation
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      // Dynamic attenuation point size with pixel ratio
      float distToCamera = -mvPosition.z;
      gl_PointSize = (aSize * uBaseSize * uPixelRatio) / max(distToCamera * 0.09, 1.0);
      gl_PointSize = clamp(gl_PointSize, 1.0, 56.0);

      // Color variation based on depth & speed
      float colorMix = sin(aPhase + uTime * 0.35) * 0.5 + 0.5;
      vColor = mix(uColorPrimary, uColorSecondary, colorMix);

      // Fade out particles near camera or extreme distance
      float depthFade = smoothstep(130.0, 45.0, distToCamera) * smoothstep(1.0, 5.0, distToCamera);
      vAlpha = depthFade * (0.35 + 0.65 * sin(uTime * 2.2 + aPhase));
    }
  `,
  fragmentShader: `
    varying vec3 vColor;
    varying float vAlpha;

    void main() {
      // Circular soft glowing particle sprite
      vec2 coord = gl_PointCoord - vec2(0.5);
      float dist = length(coord);
      if (dist > 0.5) discard;

      // Soft anti-aliased radial glow
      float glow = 1.0 - smoothstep(0.0, 0.5, dist);
      glow = pow(glow, 1.6);

      gl_FragColor = vec4(vColor, vAlpha * glow);
    }
  `
};

// 3. Advanced Shader-Based Cosmic Atmospheric Nebula
export const CosmicNebulaShader = {
  uniforms: {
    uTime: { value: 0 },
    uColorPrimary: { value: new THREE.Color('#00f0ff') },
    uColorSecondary: { value: new THREE.Color('#0ea5e9') },
    uColorDeep: { value: new THREE.Color('#02040a') },
    uDensity: { value: 1.0 }
  },
  vertexShader: `
    varying vec3 vWorldPosition;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: `
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    uniform float uTime;
    uniform vec3 uColorPrimary;
    uniform vec3 uColorSecondary;
    uniform vec3 uColorDeep;
    uniform float uDensity;

    // Fast trigonometric procedural noise (0 external textures, pure WebGL)
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      vec2 shift = vec2(100.0);
      mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
      for (int i = 0; i < 3; ++i) {
        v += a * noise(p);
        p = rot * p * 2.0 + shift;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec3 dir = normalize(vWorldPosition);
      vec2 uvCoord = vec2(atan(dir.z, dir.x) / 3.14159265, dir.y) * 2.0;

      // Moving atmospheric turbulence drift
      float t = uTime * 0.025;
      float q1 = fbm(uvCoord * 2.5 + vec2(t * 0.8, -t * 0.5));
      float q2 = fbm(uvCoord * 4.0 + vec2(-t * 0.6, t * 0.7) + q1 * 1.5);
      
      float cloud = smoothstep(0.35, 0.85, q2);

      // Dual-gradient chromatic color mapping
      vec3 cloudCol = mix(uColorDeep, uColorSecondary, cloud);
      cloudCol = mix(cloudCol, uColorPrimary, pow(cloud, 2.2));

      float alpha = cloud * 0.18 * uDensity;
      if (alpha < 0.005) discard;

      gl_FragColor = vec4(cloudCol, alpha);
    }
  `
};

// 4. Toroidal Shockwave Energy Ripple Shader
export const EnergyRippleShader = {
  uniforms: {
    uProgress: { value: 0.0 }, // 0.0 -> 1.0
    uColor: { value: new THREE.Color('#00f0ff') },
    uThickness: { value: 0.16 }
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;
    uniform float uProgress;
    uniform vec3 uColor;
    uniform float uThickness;

    void main() {
      // Radial ring pattern on quad
      float dist = length(vUv - vec2(0.5)) * 2.0;
      float ring = 1.0 - smoothstep(0.0, uThickness, abs(dist - 0.88));

      // Exponential fade out
      float fade = pow(1.0 - uProgress, 1.4);
      float alpha = ring * fade * 0.92;

      if (alpha < 0.005) discard;

      // Inner chromatic refraction highlight
      vec3 col = uColor + vec3(0.4, 0.4, 0.4) * ring;
      gl_FragColor = vec4(col, alpha);
    }
  `
};

// 5. Infinite Deep Spatial Grid Matrix Shader
export const DeepGridShader = {
  uniforms: {
    uTime: { value: 0 },
    uGridColor: { value: new THREE.Color('#0284c7') },
    uFadeDistance: { value: 75.0 }
  },
  vertexShader: `
    varying vec3 vWorldPosition;
    varying vec2 vUv;

    void main() {
      vUv = uv;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: `
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    uniform float uTime;
    uniform vec3 uGridColor;
    uniform float uFadeDistance;

    void main() {
      vec2 coord = vWorldPosition.xz * 0.38;
      
      // Moving energy coordinates
      vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
      float line = min(grid.x, grid.y);
      float c = 1.0 - min(line, 1.0);

      // Distance radial falloff
      float dist = length(vWorldPosition.xz);
      float fade = smoothstep(uFadeDistance, 6.0, dist);

      // Pulse waves traveling through grid
      float wave = sin(dist * 0.22 - uTime * 2.2) * 0.5 + 0.5;
      vec3 col = uGridColor * (0.65 + wave * 0.65);

      float alpha = c * fade * 0.38;
      if (alpha < 0.005) discard;

      gl_FragColor = vec4(col, alpha);
    }
  `
};
