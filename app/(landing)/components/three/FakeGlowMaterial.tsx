'use client';

import React, { useMemo } from 'react';
import { shaderMaterial } from '@react-three/drei';
import { Color, AdditiveBlending, DoubleSide, FrontSide, BackSide } from 'three';

const GlowMaterial = shaderMaterial(
  {
    falloffAmount: 1.4,
    glowInternalRadius: 3.7,
    glowColor: new Color('#a058c1'),
    glowSharpness: 0.0,
    opacity: 1.0,
  },
  `
  varying vec3 vPosition;
  varying vec3 vNormal;
  void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewMatrix * modelPosition;
    vec4 modelNormal = modelMatrix * vec4(normal, 0.0);
    vPosition = modelPosition.xyz;
    vNormal = modelNormal.xyz;
  }`,
  `
  uniform vec3 glowColor;
  uniform float falloffAmount;
  uniform float glowSharpness;
  uniform float glowInternalRadius;
  uniform float opacity;

  varying vec3 vPosition;
  varying vec3 vNormal;

  void main() {
    vec3 normal = normalize(vNormal);
    if(!gl_FrontFacing) normal *= -1.0;
    vec3 viewDirection = normalize(cameraPosition - vPosition);
    float fresnel = dot(viewDirection, normal);
    fresnel = pow(fresnel, glowInternalRadius + 0.1);
    float falloff = smoothstep(0., falloffAmount, fresnel);
    float fakeGlow = fresnel + fresnel * glowSharpness;
    fakeGlow *= falloff;
    gl_FragColor = vec4(clamp(glowColor * fresnel, 0., 1.0), clamp(fakeGlow, 0., opacity));
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`
);

export interface FakeGlowMaterialProps {
  falloff?: number;
  glowInternalRadius?: number;
  glowColor?: string;
  glowSharpness?: number;
  opacity?: number;
  depthTest?: boolean;
  depthWrite?: boolean;
  side?: 'THREE.FrontSide' | 'THREE.BackSide' | 'THREE.DoubleSide';
}

const FakeGlowMaterial: React.FC<FakeGlowMaterialProps> = ({
  falloff = 1.4,
  glowInternalRadius = 3.7,
  glowColor = '#a058c1',
  glowSharpness = 0.0,
  opacity = 1.0,
  depthTest = true,
  depthWrite = false,
  side = 'THREE.FrontSide',
}) => {
  const sideValue = useMemo(() => {
    if (side === 'THREE.BackSide') return BackSide;
    if (side === 'THREE.DoubleSide') return DoubleSide;
    return FrontSide;
  }, [side]);

  const material = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const MaterialCtor = GlowMaterial as unknown as new () => any;
    const m = new MaterialCtor();
    if (m.uniforms) {
      m.uniforms.falloffAmount.value = falloff;
      m.uniforms.glowInternalRadius.value = glowInternalRadius;
      m.uniforms.glowColor.value = new Color(glowColor);
      m.uniforms.glowSharpness.value = glowSharpness;
      m.uniforms.opacity.value = opacity;
    }
    m.transparent = true;
    m.blending = AdditiveBlending;
    m.depthTest = depthTest;
    m.depthWrite = depthWrite;
    m.side = sideValue;
    return m;
  }, [
    falloff,
    glowInternalRadius,
    glowColor,
    glowSharpness,
    opacity,
    depthTest,
    depthWrite,
    sideValue,
  ]);

  // eslint-disable-next-line react/no-unknown-property
  return <primitive object={material} attach='material' />;
};

export default FakeGlowMaterial;
