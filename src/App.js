import { Canvas } from '@react-three/fiber';
import { Physics, usePlane, useBox } from '@react-three/cannon';
import { Loader, OrbitControls, Reflector, Sky, useTexture } from '@react-three/drei';
import { Suspense } from 'react';

function Cube(props) {
  const [ref] = useBox(() => ({ mass: 2, position: [0, 5, 0], ...props }));
  return (
    <mesh ref={ref}>
      <boxBufferGeometry />
    </mesh>
  );
}

function Background() {
  return (
    <Sky
      distance={3000}
      turbidity={8}
      rayleigh={6}
      mieCoefficient={0.005}
      mieDirectionalG={0.8}
      inclination={0.49}
      azimuth={0.25}
    />
  );
}

function Ground() {
  const [floor, normal] = useTexture([
    '/SurfaceImperfections003_1K_var1.jpg',
    '/SurfaceImperfections003_1K_Normal.jpg',
  ]);

  const [ref] = usePlane(() => ({
    position: [0, -0.01, 0],
    rotation: [-Math.PI / 2, 0, 0],
  }));

  return (
    <>
      {/* <Plane rotation-x={Math.PI / 2} args={[100, 100, 4, 4]} /> */}

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
    </>
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
        <OrbitControls
          maxPolarAngle={Math.PI / 2 - 0.1}
          maxDistance={10}
          enableDamping={false}
          enablePan={false}
        />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 55, 10]} angle={1} />
        <Physics>
          <Background />
          <Cube />
          <Ground />
        </Physics>
      </Canvas>
      <Loader />
    </Suspense>
  );
}

export default App;
