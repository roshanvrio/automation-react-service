import { useRef, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import BotLabel from './BotLabel';

function Bot({ data, orbitRadius, ellipticalRatio = 0.6 }) {
  const meshRef = useRef();
  const labelRef = useRef();
  const [hovered, setHovered] = useState(false);
  const timeOffset = Math.random() * Math.PI * 2; // Random starting position
  const texture = useLoader(TextureLoader, '/images/BOT_MOV.png');

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime() * data.speed + timeOffset;
      
      // Calculate position on elliptical orbit
      const x = Math.cos(t) * orbitRadius;
      const z = Math.sin(t) * orbitRadius * ellipticalRatio;
      
      meshRef.current.position.x = x;
      meshRef.current.position.z = z;
      
      // Update label position (slightly above bot)
      if (labelRef.current) {
        labelRef.current.position.x = x;
        labelRef.current.position.y = 1.5;
        labelRef.current.position.z = z;
      }

      // Gentle bobbing animation
      meshRef.current.position.y = Math.sin(t * 2) * 0.1;
    }
  });

  return (
    <>
      {/* Bot mesh */}
      <group
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {/* Bot image as sprite */}
        <sprite scale={[0.8, 0.8, 1]}>
          <spriteMaterial
            map={texture}
            transparent={true}
            opacity={hovered ? 1 : 0.9}
          />
        </sprite>

        {/* Glow effect */}
        <pointLight
          color={data.color}
          intensity={hovered ? 2 : 1}
          distance={2}
        />
      </group>

      {/* Label */}
      <group ref={labelRef}>
        <BotLabel
          text={hovered ? data.message : data.name}
          position={[0, 0, 0]}
          status={data.status}
        />
      </group>
    </>
  );
}

export default Bot;