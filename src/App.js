import { Physics } from '@react-three/cannon';
import { Loader, OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Suspense } from 'react';
import { Background } from './components/background';
import { Ground } from './components/ground';
import { Player } from './components/player';

function App() {
  return (
    <Suspense fallback={null}>
      <Canvas
        className='main-canvas'
        mode='concurrent'
        linear
        dpr={[1, 1.5]}
        camera={{
          position: [-5, 2, 3],
          near: 0.01,
          far: 10000,
          fov: 70,
        }}
      >
        <OrbitControls
          maxPolarAngle={Math.PI / 2 - 0.1}
          maxDistance={10}
          enableDamping={false}
          enablePan={false}
        />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 55, 10]} angle={1} />
        <Physics>
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
