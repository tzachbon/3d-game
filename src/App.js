import { useEffect, useState } from 'react';
import { Game } from './components/game';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import { isMobile } from 'react-device-detect';

function App() {
  const [isLandscape, setIsLandscape] = useState(checkIsLandscapeOrientation());
  const handle = useFullScreenHandle();

  useEffect(() => {
    window.matchMedia('(orientation: landscape)').addEventListener('change', () => {
      setIsLandscape(checkIsLandscapeOrientation());
    });
  }, []);

  return isLandscape ? (
    <div className='game-container'>
      {navigator.userAgent.match(new RegExp('iphone', 'gi')) ? (
        <Game showScreenControllers={isMobile} />
      ) : (
        <>
          <button onClick={handle.enter}>Click to start</button>
          <div style={{ display: handle.active ? 'block' : 'none' }}>
            <FullScreen handle={handle}>
              <Game showScreenControllers={isMobile} />
            </FullScreen>
          </div>
        </>
      )}
    </div>
  ) : (
    <span className='orientation-container'>Make it landscape; ROTATE!</span>
  );
}

export default App;

function checkIsLandscapeOrientation() {
  return window.matchMedia('(orientation: landscape)').matches;
}
