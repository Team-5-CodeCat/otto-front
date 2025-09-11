'use client';

import React from 'react';
import { Sphere, TorusKnot, Sparkles, useGLTF, Text } from '@react-three/drei';
import FakeGlowMaterial from './components/three/FakeGlowMaterial';

interface MeshesProps {
  shaderControls?: {
    falloff?: number;
    glowSharpness?: number;
    glowColor?: string;
    glowInternalRadius?: number;
    opacity?: number;
    depthTest?: boolean;
    depthWrite?: boolean;
  };
  // 가운데 심볼 설정
  centerType?: 'sphere' | 'torus' | 'knot' | 'gltf' | 'text' | 'none';
  gltfUrl?: string; // centerType === 'gltf'일 때 사용
  centerScale?: number;
  centerText?: string; // centerType === 'text'일 때 사용
  centerFont?: string; // 웹폰트 URL (선택)
  centerSize?: number; // fontSize
  showSideObjects?: boolean; // 양옆 보조 오브젝트 표시 여부
}

const Meshes: React.FC<MeshesProps> = ({
  shaderControls,
  centerType = 'sphere',
  gltfUrl,
  centerScale = 1,
  centerText = 'Otto',
  centerFont,
  centerSize = 6,
  showSideObjects = false,
}) => {
  const gltf = gltfUrl && centerType === 'gltf' ? useGLTF(gltfUrl) : undefined;

  return (
    <group dispose={null}>
      {/* 중앙 심볼 */}
      {centerType === 'sphere' && (
        <Sphere args={[8, 64, 64]} position={[0, 0, 0]}>
          <FakeGlowMaterial {...(shaderControls || {})} />
        </Sphere>
      )}
      {centerType === 'torus' && (
        <TorusKnot args={[4, 1.2, 256, 64]} position={[0, 0, 0]}>
          <FakeGlowMaterial {...(shaderControls || {})} />
        </TorusKnot>
      )}
      {centerType === 'knot' && (
        <TorusKnot args={[4, 3.0, 256, 128]} position={[0, 0, 0]}>
          <FakeGlowMaterial {...(shaderControls || {})} />
        </TorusKnot>
      )}
      {centerType === 'gltf' && gltf && (
        // eslint-disable-next-line react/no-unknown-property
        <primitive object={gltf.scene} position={[0, 0, 0]} scale={centerScale} />
      )}
      {centerType === 'text' && (
        <Text
          position={[0, 0, 0]}
          anchorX='center'
          anchorY='middle'
          font={centerFont}
          fontSize={centerSize}
          letterSpacing={0.02}
          depthOffset={-1}
        >
          {centerText}
          <FakeGlowMaterial {...(shaderControls || {})} />
        </Text>
      )}

      {/* 보조 오브젝트들 (양옆) */}
      {showSideObjects && (
        <>
          <TorusKnot args={[4, 3.8, 128, 128]} position={[-4, 0, 0]}>
            <FakeGlowMaterial {...(shaderControls || {})} />
          </TorusKnot>

          <TorusKnot args={[4, 0.5, 128, 128]} position={[-4, 0, 0]}>
            <meshPhysicalMaterial color='blue' roughness={0.2} />
            <Sparkles count={100} scale={20} size={25} speed={1.5} opacity={0.3} color='#43d9ff' />
          </TorusKnot>

          <Sphere args={[16, 64, 64]} position={[8, 0, 0]}>
            <FakeGlowMaterial {...(shaderControls || {})} />
          </Sphere>

          <Sphere args={[6, 64, 64]} position={[8, 0, 0]}>
            <meshPhysicalMaterial color='blue' roughness={0.2} />
          </Sphere>
        </>
      )}
    </group>
  );
};

export default Meshes;
