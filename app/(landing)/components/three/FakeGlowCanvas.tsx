'use client';
/* eslint-disable react/no-unknown-property */

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stars } from '@react-three/drei';
import Meshes from '../../Meshes';

interface Props {
  centerText?: string;
  centerSize?: number;
}

const FakeGlowCanvas: React.FC<Props> = ({ centerText, centerSize }) => {
  const shaderControls = {
    // 더 입체적으로 보이도록 글로우 파라미터 조정
    falloff: 0.6,
    glowSharpness: 2.2,
    glowColor: '#7af8ff',
    glowInternalRadius: 2.2,
    opacity: 1.0,
    depthTest: false,
    depthWrite: false,
  };

  return (
    <div className='fixed inset-0 w-screen h-screen bg-black'>
      <Canvas camera={{ near: 0.1, position: [2, 0.5, 25], fov: 65 }} className='w-full h-full'>
        <OrbitControls makeDefault maxDistance={45} minDistance={25} target={[2, -2, 0]} />
        <directionalLight position={[100, 100, 60]} intensity={2} />
        <ambientLight intensity={1.5} />
        <Environment preset='city' />
        <Meshes shaderControls={shaderControls} centerText={centerText} centerSize={centerSize} />
        <Stars speed={0.6} />
      </Canvas>
    </div>
  );
};

export default FakeGlowCanvas;
