import { OrbitControls, useAnimations, useFBX } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { lerp } from 'three/src/math/MathUtils';
import { ASSETS_PATH, MAX_POLAR_ANGLE } from '../helpers';
import { Controller } from './controller';

const loopAnimations = ['idle', 'walk', 'run'];
const attackAnimations = ['small-slash', 'kick', 'spin-slash'];
const blendDuration = 0.5;

export function Player({ ...props }) {
  const orbitRef = useRef();
  const player = useRef({
    walkClock: new THREE.Clock(),
    comboResetTimer: null,
    movements: [],
    isRunning: false,
    isWalking: false,
    attack: { combo: 0, isAttackInProgress: false },
    cordsToMove: null,
  });

  const [selectedAction, setSelectedAction] = useState();
  const model = useFBX(`${ASSETS_PATH}/models/player.fbx`);
  const { actions, mixer } = usePlayerAnimations(model);

  useEffect(() => {
    const size = 0.02;
    if (model.scale.x > size) {
      model.scale.multiplyScalar(size);
    }

    // orbitRef.current.dampingFactor = 0.5; // friction
    orbitRef.current.rotateSpeed = 0.3; // mouse sensitivity
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const selected = selectedAction || 'idle';
    const animation = actions[selected];

    mixer.addEventListener('finished', (event) => {
      if (attackAnimations.some((name) => actions[name] === event.action)) {
        setSelectedAction('idle');
      }
    });
    animation
      ?.reset()
      .fadeIn(loopAnimations.includes(selected) ? blendDuration : 0.1)
      .setLoop(loopAnimations.includes(selected) ? THREE.LoopRepeat : THREE.LoopOnce)
      .setEffectiveTimeScale(attackAnimations.includes(selected) ? 1.4 : 1)
      .play();

    animation.clampWhenFinished = true;

    return () => {
      animation?.fadeOut(blendDuration);
    };
  }, [selectedAction, actions, mixer]);

  useFrame(() => {
    orbitRef.current.target = model.position.clone().setY(2.5);
    // WALK
    if (player.current.isWalking && !player.current.attack.isAttackInProgress) {
      setSelectedAction(player.current.isRunning ? 'run' : 'walk');
    } else if (!player.current.isWalking && !player.current.attack.isAttackInProgress) {
      setSelectedAction('idle');
    }

    const positions = new THREE.Vector3();
    const verticalSpeed = lerp(
      0,
      player.current.isRunning ? 0.15 : 0.08,
      Math.min(player.current.walkClock.getElapsedTime(), 1),
    );
    const horizontalSpeed = 0.02;

    if (!player.current.attack.isAttackInProgress) {
      if (player.current.cordsToMove) {
        const [x, y] = player.current.cordsToMove;
        positions.x = (x / 100) * verticalSpeed;
        positions.z = (-y / 100) * verticalSpeed;
      } else {
        for (const movement of player.current.movements) {
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
      }
    }

    const isStanding = positions.toArray().every((pos) => pos === 0);

    positions.applyAxisAngle(new THREE.Vector3(0, 1, 0), orbitRef.current.getAzimuthalAngle());
    model.position.add(positions);

    if (!isStanding) {
      const targetAngel = orbitRef.current.getAzimuthalAngle() + Math.PI;

      model.rotation.y = lerp(
        model.rotation.y,
        targetAngel,
        Math.min(player.current.walkClock.getElapsedTime(), 1),
      );
    }

    // ATTACK
    const time = actions[selectedAction]?.time;
    const duration = actions[selectedAction]?.getClip().duration;

    if (
      !selectedAction ||
      loopAnimations.includes(selectedAction) ||
      time > duration - duration * 0.01
    ) {
      player.current.attack.isAttackInProgress = false;
    }
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
        onSpeedChanged={({ type, selected }) => {
          if (type === 'run' && player.current.isWalking) {
            player.current.isRunning = selected;
            setSelectedAction(selected ? 'run' : null);
          }
        }}
        onMoveChanged={({ type, direction, cords }) => {
          const directions = new Set(player.current.movements);
          const startSize = directions.size;

          if (!player.current.walkClock.running) {
            player.current.walkClock.start();
          }

          if (type === 'end') {
            directions.delete(direction);
          } else if (type === 'start') {
            directions.add(direction);
          }

          if (startSize !== directions.size) {
            setTimeout(() => {
              player.current.walkClock.stop();
            }, 100);
          }

          player.current.movements = [...directions.values()];
          player.current.cordsToMove = cords;
          player.current.isWalking = Boolean(
            player.current.movements.length || player.current.cordsToMove,
          );
        }}
        onAttack={() => {
          if (player.current.comboResetTimer) {
            clearTimeout(player.current.comboResetTimer);
          }

          player.current.comboResetTimer = setTimeout(() => {
            player.current.attack.combo = 0;
          }, 1000);

          if (player.current.attack.isAttackInProgress) return;

          let current = player.current.attack.combo;
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
          player.current.attack.combo = current >= 2 ? 0 : current + 1;
          player.current.attack.isAttackInProgress = true;
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
  const run = useAnimationLoader('run');

  return useAnimations(
    [
      ...run.animations,
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
  const animation = useFBX(`${ASSETS_PATH}/models/animations/${name}.fbx`);
  animation.animations[0].name = name;

  return animation;
}
