import { createContext, useContext } from 'react';
import { Joystick } from 'react-joystick-component';

class CustomEvent {
  callbacks = new Map();

  addEventListener(type, cb) {
    if (!this.callbacks.has(type)) {
      this.callbacks.set(type, new Set());
    }

    const set = this.callbacks.get(type);

    if (!set.has(cb)) {
      set.add(cb);
    }

    return {
      remove: () => {
        set.delete(cb);
      },
    };
  }

  dispatchEvent(type, event) {
    const callbacks = this.callbacks.get(type);

    if (callbacks?.size) {
      for (const callback of [...callbacks.values()]) {
        callback(event);
      }
    }
  }
}

const value = {
  movement: new CustomEvent(),
};

const ScreenControllerContext = createContext(value);

export function ScreenControllerProvider({ show, children }) {
  function handleMove(event) {
    value.movement.dispatchEvent('move', event);
  }

  function handleStop(event) {
    value.movement.dispatchEvent('stop', event);
  }

  return (
    <ScreenControllerContext.Provider value={value}>
      {show && (
        <div className='joystick'>
          <Joystick
            size={100}
            baseColor='rgba(100, 100, 100, 0.5)'
            stickColor='rgba(100, 100, 100, 0.8)'
            move={handleMove}
            stop={handleStop}
          />
        </div>
      )}
      {children}
    </ScreenControllerContext.Provider>
  );
}

export function useScreenController() {
  return useContext(ScreenControllerContext);
}
