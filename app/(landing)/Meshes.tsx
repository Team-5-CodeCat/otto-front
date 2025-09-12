'use client';

import React from 'react';
import { Text } from '@react-three/drei';
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
  centerText?: string; // centerType === 'text'일 때 사용
  centerFont?: string; // 웹폰트 URL (선택)
  centerSize?: number; // fontSize
}

const Meshes: React.FC<MeshesProps> = ({
  shaderControls,

  centerText = 'Otto',
  centerFont,
  centerSize = 6,
}) => {
  return (
    <group>
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
    </group>
  );
};

export default Meshes;
