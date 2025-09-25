import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import NeonCube from './NeonCube';

const NeonCubeScene: React.FC = () => {
  const cubeConfigs = [
    {
      position: [0, 0, 0] as [number, number, number],
      rotationSpeed: 0.01,
      orbitRadius: 8,
      orbitSpeed: 0.5,
      color: '#58a6ff',
      size: 0.8,
    },
    {
      position: [0, 0, 0] as [number, number, number],
      rotationSpeed: -0.008,
      orbitRadius: 12,
      orbitSpeed: -0.3,
      color: '#7c3aed',
      size: 0.6,
    },
    {
      position: [0, 0, 0] as [number, number, number],
      rotationSpeed: 0.012,
      orbitRadius: 16,
      orbitSpeed: 0.4,
      color: '#4ec9b0',
      size: 0.7,
    },
    {
      position: [0, 0, 0] as [number, number, number],
      rotationSpeed: -0.015,
      orbitRadius: 20,
      orbitSpeed: -0.2,
      color: '#ffcc02',
      size: 0.5,
    },
  ];

  return (
    <Canvas
      camera={{ position: [0, 0, 25], fov: 75 }}
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    >
      {/* Enhanced Lighting */}
      <ambientLight intensity={0.1} />
      <pointLight position={[15, 15, 15]} intensity={0.8} color="#58a6ff" />
      <pointLight position={[-15, -15, -15]} intensity={0.6} color="#7c3aed" />
      <pointLight position={[0, 20, 0]} intensity={0.4} color="#4ec9b0" />
      <spotLight 
        position={[0, 10, 0]} 
        angle={0.3} 
        penumbra={1} 
        intensity={0.5} 
        color="#ffcc02"
      />
      
      {/* Environment */}
      <Environment preset="night" />
      
      {/* Neon Cubes */}
      {cubeConfigs.map((config, index) => (
        <NeonCube
          key={index}
          position={config.position}
          rotationSpeed={config.rotationSpeed}
          orbitRadius={config.orbitRadius}
          orbitSpeed={config.orbitSpeed}
          color={config.color}
          size={config.size}
        />
      ))}
      
      {/* Disable orbit controls for background effect */}
      <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
    </Canvas>
  );
};

export default NeonCubeScene;
