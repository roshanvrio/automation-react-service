import { useRef } from 'react';
import { Line } from '@react-three/drei';

function OrbitRing({ radius, color = '#888888', ellipticalRatio = 0.6 }) {
  const points = [];
  const segments = 128;

  // Create elliptical orbit path
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push([
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius * ellipticalRatio
    ]);
  }

  return (
    <Line
      points={points}
      color={color}
      lineWidth={1.5}  // Between 1 and 2
      dashed
      dashScale={50}
      dashSize={0.5}
      gapSize={0.3}
      transparent
      opacity={0.6}  // Between 0.4 and 0.8 - balanced
    />
  );
}

export default OrbitRing;