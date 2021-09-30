import { OrbitControls, useAnimations, useFBX } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
import EventListener from 'react-event-listener';
import * as THREE from 'three';
import { ASSETS_PATH, MAX_POLAR_ANGLE } from '../helpers';

export function Player({ ...props }) {
  const orbitRef = useRef();
  const blendDuration = 0.5;
  const [selectedAction, setSelectedAction] = useState();
  const movements = useRef([]);
  const [combo, setCombo] = useState(0);
  const model = useFBX(`${ASSETS_PATH}/player.fbx`);
  const { actions, mixer } = usePlayerAnimations(model);

  useEffect(() => {
    const size = 0.02;
    if (model.scale.x > size) {
      model.scale.multiplyScalar(size);
    }
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
    const positions = model.position;
    const speed = 0.05;

    if (movements.current.length && selectedAction !== 'idle') {
      setSelectedAction('walk');
    } else if (!movements.current.length && selectedAction === 'walk') {
      setSelectedAction(null);
    }

    for (const movement of movements.current) {
      switch (movement) {
        case 'backward':
          positions.z += -speed;
          break;
        case 'right':
          positions.x += -speed;
          break;
        case 'left':
          positions.x += speed;
          break;
        case 'forward':
          positions.z += speed;
          break;
        default:
          break;
      }
    }
    orbitRef.current.target = positions;
  });

  return (
    <>
      <primitive object={model} dispose={null} />
      <OrbitControls
        ref={orbitRef}
        maxPolarAngle={MAX_POLAR_ANGLE}
        maxDistance={22}
        enableDamping={false}
        enablePan={false}
      />
      <Controller
        onMoveChanged={({ type, direction }) => {
          console.log(direction);
          const set = new Set(movements.current);

          if (type === 'end') {
            set.delete(direction);
          } else if (type === 'start') {
            set.add(direction);
          }

          movements.current = [...set.values()];
        }}
        onAttack={() => {
          setCombo((current) => {
            // actions.idle.stop();

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

            // actions.idle.fadeIn(blendDuration).play();

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
