import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import Bot from './Bot';
import OrbitRing from './OrbitRing';
import { botsData, orbits } from '../../data/botsData';

function OrbitalScene() {
  const ellipticalRatio = 0.6;

  return (
    <div style={{ width: '100%', height: '100%', background: '#0a0a0a' }}>
      <Canvas>
        {/* Camera setup */}
        <PerspectiveCamera
          makeDefault
          position={[0, 9, 15]}
          fov={60}
        />

        {/* Controls */}
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          minDistance={10}
          maxDistance={30}
          maxPolarAngle={Math.PI / 2}
          target={[0, -2, 0]}
        />

        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4a9eff" />
        <spotLight
          position={[0, 15, 0]}
          angle={0.5}
          penumbra={1}
          intensity={1}
          castShadow
        />

        {/* Background stars - REDUCED BY 61% */}
        <Stars
          radius={150}
          depth={100}
          count={3136}  // Reduced from 8000
          factor={6}
          saturation={0}
          fade
          speed={0.5}
        />

        {/* Additional star layer closer */}
        <Stars
          radius={80}
          depth={50}
          count={1568}  // Reduced from 4000
          factor={4}
          saturation={0}
          fade
          speed={0.8}
        />

        {/* Dense star field in the background */}
        <Stars
          radius={200}
          depth={150}
          count={4704}  // Reduced from 12000
          factor={8}
          saturation={0}
          fade={false}
          speed={0.3}
        />

        {/* Central hub/core */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial
            color="#1a1a2e"
            emissive="#4a9eff"
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Orbit rings */}
        {orbits.map((orbit, index) => (
          <OrbitRing
            key={index}
            radius={orbit.radius}
            color={orbit.color}
            ellipticalRatio={ellipticalRatio}
          />
        ))}

        {/* Bots */}
        {botsData.map((bot) => (
          <Bot
            key={bot.id}
            data={bot}
            orbitRadius={orbits[bot.orbitIndex].radius}
            ellipticalRatio={ellipticalRatio}
          />
        ))}

        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial
            color="#0a0a0a"
            transparent
            opacity={0.1}
          />
        </mesh>
      </Canvas>

      

    
    </div>
  );
}

export default OrbitalScene;