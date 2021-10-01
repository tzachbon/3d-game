import { useTrimesh } from '@react-three/cannon';
import { OrbitControls, useAnimations, useFBX } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
import EventListener from 'react-event-listener';
import * as THREE from 'three';
import { lerp } from 'three/src/math/MathUtils';
import { ASSETS_PATH, MAX_POLAR_ANGLE } from '../helpers';

export function Player({ ...props }) {
  const orbitRef = useRef();
  const walkClock = useRef(new THREE.Clock());
  const blendDuration = 0.5;
  const [selectedAction, setSelectedAction] = useState();
  const movements = useRef([]);
  const [combo, setCombo] = useState(0);
  const model = useFBX(`${ASSETS_PATH}/player.fbx`);
  console.log(model);
  const { actions, mixer } = usePlayerAnimations(model);

  useEffect(() => {
    const size = 0.02;
    if (model.scale.x > size) {
      model.scale.multiplyScalar(size);
    }

    // orbitRef.current.dampingFactor = 0.5; // friction
    orbitRef.current.rotateSpeed = 0.3; // mouse sensitivity
  }, []);

  useEffect(() => {
    const selected = selectedAction || 'idle';
    const animation = actions[selected];
    const isIdle = selected === 'idle';
    const loopAnimations = ['idle', 'walk'];

    if (!isIdle) {
      mixer.addEventListener('finished', (event) => {
        setSelectedAction(null);
      });
    }

    animation
      ?.reset()
      .fadeIn(blendDuration)
      .setLoop(loopAnimations.includes(selected) ? THREE.LoopRepeat : THREE.LoopOnce)
      .play();

    animation.clampWhenFinished = true;

    return () => {
      animation?.fadeOut(blendDuration);
    };
  }, [selectedAction, actions, mixer]);

  useFrame(() => {
    orbitRef.current.target = model.position.clone().setY(2.5);

    if (movements.current.length && selectedAction !== 'idle') {
      setSelectedAction('walk');
    } else if (!movements.current.length && selectedAction === 'walk') {
      setSelectedAction(null);
    }

    const positions = new THREE.Vector3();
    const verticalSpeed = lerp(0, 0.08, Math.min(walkClock.current.getElapsedTime(), 1));
    const horizontalSpeed = 0.02;

    for (const movement of movements.current) {
      switch (movement) {
        case 'backward':
          positions.z += verticalSpeed;
          break;
        case 'forward':
          positions.z += -verticalSpeed;
          break;
        case 'right':
          positions.x += horizontalSpeed;
          break;
        case 'left':
          positions.x += -horizontalSpeed;
          break;

        default:
          break;
      }
    }

    positions.applyAxisAngle(new THREE.Vector3(0, 1, 0), orbitRef.current.getAzimuthalAngle());
    model.rotation.y = orbitRef.current.getAzimuthalAngle() + Math.PI;
    model.position.add(positions);
  });

  return (
    <>
      <primitive object={model} dispose={null} />
      <OrbitControls
        ref={orbitRef}
        maxPolarAngle={MAX_POLAR_ANGLE}
        maxDistance={5}
        enableDamping={false}
        enablePan={false}
      />
      <Controller
        onMoveChanged={({ type, direction }) => {
          const directions = new Set(movements.current);
          const startSize = directions.size;

          if (!walkClock.current.running) {
            walkClock.current.start();
          }

          if (type === 'end') {
            directions.delete(direction);
          } else if (type === 'start') {
            directions.add(direction);
          }

          if (startSize !== directions.size) {
            setTimeout(() => {
              walkClock.current.stop();
            }, 100);
          }

          movements.current = [...directions.values()];
        }}
        onAttack={() => {
          setCombo((current) => {
            switch (current) {
              case 0:
                setSelectedAction('small-slash');
                break;
              case 1:
                setSelectedAction('kick');
                break;
              case 2:
                setSelectedAction('spin-slash');
                break;

              default:
                break;
            }

            return current > 2 ? 0 : ++current;
          });
        }}
      />
    </>
  );
}

function usePlayerAnimations(model) {
  const idle = useAnimationLoader('idle');
  const kick = useAnimationLoader('kick');
  const smallSlash = useAnimationLoader('small-slash');
  const snipSlash = useAnimationLoader('spin-slash');
  const walk = useAnimationLoader('walk');

  return useAnimations(
    [
      ...idle.animations,
      ...kick.animations,
      ...smallSlash.animations,
      ...snipSlash.animations,
      ...walk.animations,
    ],
    model,
  );
}

function useAnimationLoader(name) {
  const animation = useFBX(`${ASSETS_PATH}/animations/${name}.fbx`);
  animation.animations[0].name = name;

  return animation;
}

function Controller({ onAttack, onMoveChanged } = {}) {
  const onKeyDown = (event) => {
    event.preventDefault();

    switch (event.key) {
      case 'w':
      case 'a':
      case 's':
      case 'd':
        const movementMap = {
          w: 'forward',
          s: 'backward',
          a: 'left',
          d: 'right',
        };
        onMoveChanged?.({ type: 'start', direction: movementMap[event.key] });
        break;

      default:
        break;
    }
  };

  const onKeyUp = (event) => {
    event.preventDefault();

    switch (event.key) {
      case 'w':
      case 'a':
      case 's':
      case 'd':
        const movementMap = {
          w: 'forward',
          s: 'backward',
          a: 'left',
          d: 'right',
        };
        onMoveChanged?.({ type: 'end', direction: movementMap[event.key] });
        break;

      default:
        break;
    }
  };

  function onClick(event) {
    event.preventDefault();
    onAttack();
  }

  return (
    <>
      <EventListener target='window' onKeyDown={onKeyDown} onKeyUp={onKeyUp} />
      <EventListener target={document.querySelector('.main-canvas')} onClick={onClick} />
    </>
  );
}
