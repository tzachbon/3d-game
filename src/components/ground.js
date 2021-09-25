import { usePlane } from '@react-three/cannon';
import { Reflector, useProgress, useTexture } from '@react-three/drei';

export function Ground() {
  const [floor, normal] = useTexture([
    '/assets/textures/ground-texture-skin.jpg',
    '/assets/textures/ground-texture-color.jpg',
  ]);

  const [ref] = usePlane(() => ({
    position: [0, -0.01, 0],
    rotation: [-Math.PI / 2, 0, 0],
  }));

  return (
    <Reflector
      resolution={512}
      ref={ref}
      args={[100, 100, 4, 4]}
      mirror={0.4}
      mixBlur={8}
      mixStrength={1}
      rotation={[-Math.PI / 2, 0, Math.PI / 2]}
      blur={[400, 100]}
    >
      {(Material, props) => (
        <Material
          color='#797979'
          metalness={0.4}
          roughnessMap={floor}
          normalMap={normal}
          normalScale={[1, 1]}
          {...props}
        />
      )}
    </Reflector>
  );
}
