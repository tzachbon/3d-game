import { useEffect } from 'react';
import EventListener from 'react-event-listener';
import { useScreenController } from './screen-controller';

const movementMap = {
  w: 'forward',
  s: 'backward',
  a: 'left',
  d: 'right',
};

export function Controller({ onAttack, onMoveChanged, onSpeedChanged } = {}) {
  const { movement } = useScreenController();

  useEffect(() => {
    const toRemove = [];

    toRemove.push(
      movement.addEventListener('move', (event) => {
        onMoveChanged?.({
          type: 'start',
          cords: [event.x, event.y],
        });
      }),
    );

    toRemove.push(
      movement.addEventListener('stop', (event) => {
        onMoveChanged?.({ type: 'end' });
      }),
    );

    return () => {
      toRemove.forEach((c) => c.remove());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movement]);

  const onKeyDown = (event) => {
    event.preventDefault();

    switch (event.key) {
      case 'w':
      case 'a':
      case 's':
      case 'd':
        onMoveChanged?.({ type: 'start', direction: movementMap[event.key] });
        break;
      case 'Shift':
        onSpeedChanged?.({ type: 'run', selected: true });
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
        onMoveChanged?.({ type: 'end', direction: movementMap[event.key] });
        break;
      case 'Shift':
        onSpeedChanged?.({ type: 'run', selected: false });
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
