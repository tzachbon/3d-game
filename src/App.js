import { Physics, useBox } from '@react-three/cannon';
import { ContactShadows, Loader } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Background } from './components/background';
import { Ground } from './components/ground';
import { Player } from './components/player';

function Cube(props) {
  const [ref] = useBox(() => ({ mass: 1, position: [0.5, 15, 0], ...props }));
  return (
    <mesh ref={ref}>
      <boxBufferGeometry />
    </mesh>
  );
}
function App() {
  return (
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
  );
}

export default App;
