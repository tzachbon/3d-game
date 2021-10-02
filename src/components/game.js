import { Physics, useBox } from '@react-three/cannon';
import { ContactShadows, Loader } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Background } from './background';
import { Ground } from './ground';
import { ScreenControllerProvider } from './screen-controller';
import { Player } from './player';

function Cube(props) {
  const [ref] = useBox(() => ({ mass: 1, position: [0.5, 15, 0], ...props }));
  return (
    <mesh ref={ref}>
      <boxBufferGeometry />
    </mesh>
  );
}

export function Game({ showScreenControllers }) {
  return (
    <ScreenControllerProvider show={showScreenControllers}>
      <Suspense fallback={null}>
        <Canvas
          className='main-canvas'
          mode='concurrent'
          linear
          dpr={[1, 1.5]}
          camera={{
            position: [0, 0, 10],
            near: 0.01,
            far: 10000,
            fov: 70,
          }}
        >
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 55, 10]} angle={1} />
          <ContactShadows
            position={[0, 0, 0]}
            width={100}
            height={20}
            far={20}
            rotation={[Math.PI / 2, 0, 0]}
          />

          <Physics>
            <Cube />
            <Ground />
            <Background />
            <Player />
          </Physics>
        </Canvas>
        <Loader />
      </Suspense>
    </ScreenControllerProvider>
  );
}
