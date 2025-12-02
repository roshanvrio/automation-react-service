import { Text, Billboard } from '@react-three/drei';

function BotLabel({ text, position, status }) {
  const bgColor = status === 'ready' ? '#2d5a3d' : '#5a3d2d';
  
  return (
    <Billboard position={position}>
      <group>
        {/* Background bubble */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[text.length * 0.15, 0.4]} />
          <meshBasicMaterial 
            color={bgColor} 
            transparent 
            opacity={0.8}
          />
        </mesh>
        
        {/* Text */}
        <Text
          position={[0, 0, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#000000"
        >
          {text}
        </Text>
      </group>
    </Billboard>
  );
}

export default BotLabel;