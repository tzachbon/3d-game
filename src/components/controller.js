import EventListener from 'react-event-listener';

export function Controller({ onAttack, onMoveChanged, onSpeedChanged } = {}) {
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
        const movementMap = {
          w: 'forward',
          s: 'backward',
          a: 'left',
          d: 'right',
        };
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
