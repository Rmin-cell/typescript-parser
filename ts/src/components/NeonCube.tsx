import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

interface NeonCubeProps {
  position: [number, number, number];
  rotationSpeed: number;
  orbitRadius: number;
  orbitSpeed: number;
  color: string;
  size: number;
}

const NeonCube: React.FC<NeonCubeProps> = ({ 
  position, 
  rotationSpeed, 
  orbitRadius, 
  orbitSpeed, 
  color, 
  size 
}) => {
  const meshRef = useRef<Mesh>(null);
  const wireframeRef = useRef<Mesh>(null);
  const orbitRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Rotate the cube itself
      meshRef.current.rotation.x += rotationSpeed;
      meshRef.current.rotation.y += rotationSpeed;
      meshRef.current.rotation.z += rotationSpeed * 0.5;
    }

    if (wireframeRef.current) {
      // Sync wireframe rotation with main mesh
      wireframeRef.current.rotation.x += rotationSpeed;
      wireframeRef.current.rotation.y += rotationSpeed;
      wireframeRef.current.rotation.z += rotationSpeed * 0.5;
    }

    if (orbitRef.current) {
      // Orbit around the center
      const time = state.clock.getElapsedTime();
      orbitRef.current.position.x = Math.cos(time * orbitSpeed) * orbitRadius;
      orbitRef.current.position.z = Math.sin(time * orbitSpeed) * orbitRadius;
      orbitRef.current.position.y = Math.sin(time * orbitSpeed * 0.7) * 2; // Vertical bobbing
    }
  });

  return (
    <group ref={orbitRef} position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[size, size, size]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          metalness={0.9}
          roughness={0.1}
          transparent={true}
          opacity={0.8}
        />
      </mesh>
      {/* Wireframe edges for futuristic look */}
      <mesh ref={wireframeRef}>
        <boxGeometry args={[size, size, size]} />
        <meshBasicMaterial
          color={color}
          wireframe={true}
          transparent={true}
          opacity={0.3}
        />
      </mesh>
    </group>
  );
};

export default NeonCube;
