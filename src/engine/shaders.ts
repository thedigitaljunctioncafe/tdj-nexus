/**
 * TDJ NEXUS - Custom WebGL Shaders
 * High-performance GPU shaders for procedural glow, particle dynamics, and energy shockwaves.
 */

import * as THREE from 'three';

// 1. Central Singularity & Core Plasma Glow Shader
export const CorePulseShader = {
  uniforms: {
    uTime: { value: 0 },
    uColorPrimary: { value: new THREE.Color('#00f0ff') },
    uColorAccent: { value: new THREE.Color('#38bdf8') },
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
      
      // Procedural surface wave pulsation
      vec3 pos = position;
      float wave = sin(pos.x * 4.0 + uTime * 3.0) * cos(pos.y * 4.0 + uTime * 2.5) * 0.06;
      pos += normal * (wave + uPulse * 0.15);

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
    uniform float uPulse;
    uniform float uIntensity;

    void main() {
      // Fresnel rim glow calculation
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      float fresnel = 1.0 - max(dot(viewDir, vNormal), 0.0);
      fresnel = pow(fresnel, 2.2);

      // Energy core plasma pattern
      float plasma = sin(vPosition.x * 6.0 + uTime * 4.0) * sin(vPosition.y * 6.0 - uTime * 3.0) * sin(vPosition.z * 6.0 + uTime * 2.0);
      plasma = smoothstep(-0.5, 0.8, plasma);

      // Color blending
      vec3 col = mix(uColorPrimary, uColorAccent, fresnel + plasma * 0.5);
      col += uColorAccent * (uPulse * 1.5 + fresnel * 0.8);

      float alpha = clamp(fresnel * 1.4 + plasma * 0.4 + uPulse * 0.5, 0.0, 1.0) * uIntensity;
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
      float orbitTilt = sin(aPhase * 3.0) * 0.5;
      
      // 2. 3D Harmonic Curl/Vortex drift
      pos.x += sin(pos.y * 0.05 + uTime * 0.5 + aPhase) * 0.8;
      pos.y += cos(pos.z * 0.05 + uTime * 0.6 + aPhase) * 0.8;
      pos.z += sin(pos.x * 0.05 + uTime * 0.4 + aPhase) * 0.8;

      // 3. Cursor proximity interactive repulsion / swirl
      vec3 toCursor = pos - uCursorPos;
      float cursorDist = length(toCursor);
      if (cursorDist < 12.0) {
        float factor = (1.0 - cursorDist / 12.0) * uCursorForce;
        // Tangent swirl + outward repulsion
        vec3 push = normalize(toCursor) * factor * 4.0;
        vec3 swirl = cross(normalize(toCursor), vec3(0.0, 1.0, 0.0)) * factor * 5.0;
        pos += push + swirl;
      }

      // 4. Kinetic Shockwave ring displacement
      if (uShockwaveProgress >= 0.0 && uShockwaveProgress <= 1.0) {
        float distToShockwave = length(pos - uShockwaveOrigin);
        float waveDist = abs(distToShockwave - uShockwaveRadius);
        if (waveDist < 6.0) {
          float wavePower = (1.0 - waveDist / 6.0) * (1.0 - uShockwaveProgress);
          vec3 shockDir = normalize(pos - uShockwaveOrigin);
          pos += shockDir * wavePower * 8.0;
        }
      }

      // View matrix transformation
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;

      // Dynamic attenuation point size
      float distToCamera = -mvPosition.z;
      gl_PointSize = (aSize * uBaseSize * uPixelRatio) / max(distToCamera * 0.1, 1.0);
      gl_PointSize = clamp(gl_PointSize, 1.0, 48.0);

      // Color variation based on depth & speed
      float colorMix = sin(aPhase + uTime * 0.3) * 0.5 + 0.5;
      vColor = mix(uColorPrimary, uColorSecondary, colorMix);

      // Fade out particles near camera or extreme distance
      float depthFade = smoothstep(120.0, 40.0, distToCamera) * smoothstep(1.0, 6.0, distToCamera);
      vAlpha = depthFade * (0.4 + 0.6 * sin(uTime * 2.0 + aPhase));
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
      glow = pow(glow, 1.8);

      gl_FragColor = vec4(vColor, vAlpha * glow);
    }
  `
};

// 3. Toroidal Shockwave Ripple Shader
export const EnergyRippleShader = {
  uniforms: {
    uProgress: { value: 0.0 }, // 0.0 -> 1.0
    uColor: { value: new THREE.Color('#00f0ff') },
    uThickness: { value: 0.15 }
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
      // Radial ring pattern on quad or torus
      float dist = length(vUv - vec2(0.5)) * 2.0;
      float ring = 1.0 - smoothstep(0.0, uThickness, abs(dist - 0.85));

      float fade = 1.0 - uProgress;
      float alpha = ring * fade * 0.85;

      if (alpha < 0.01) discard;

      // Inner refraction highlight
      vec3 col = uColor + vec3(0.3, 0.3, 0.3) * ring;
      gl_FragColor = vec4(col, alpha);
    }
  `
};

// 4. Infinite Deep Spatial Grid Matrix Shader
export const DeepGridShader = {
  uniforms: {
    uTime: { value: 0 },
    uGridColor: { value: new THREE.Color('#0284c7') },
    uFadeDistance: { value: 70.0 }
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
      vec2 coord = vWorldPosition.xz * 0.4;
      
      // Moving energy coordinates
      vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
      float line = min(grid.x, grid.y);
      float c = 1.0 - min(line, 1.0);

      // Distance radial falloff
      float dist = length(vWorldPosition.xz);
      float fade = smoothstep(uFadeDistance, 5.0, dist);

      // Pulse waves traveling through grid
      float wave = sin(dist * 0.2 - uTime * 2.0) * 0.5 + 0.5;
      vec3 col = uGridColor * (0.6 + wave * 0.6);

      float alpha = c * fade * 0.35;
      if (alpha < 0.005) discard;

      gl_FragColor = vec4(col, alpha);
    }
  `
};
