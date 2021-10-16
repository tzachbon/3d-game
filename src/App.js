import { useEffect, useState } from 'react';
import { Game } from './components/game';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import { isMobile } from 'react-device-detect';

function App() {
  const [isLandscape, setIsLandscape] = useState(checkIsLandscapeOrientation());
  const fullscreenHandler = useFullScreenHandle();

  function toggleFullscreen() {
    if (fullscreenHandler.active) {
      fullscreenHandler.exit();
    } else {
      fullscreenHandler.enter();
    }
  }

  useEffect(() => {
    window.matchMedia('(orientation: landscape)').addEventListener('change', () => {
      setIsLandscape(checkIsLandscapeOrientation());
    });
  }, []);

  return isLandscape ? (
    <div className='game-container'>
      <FullScreen handle={fullscreenHandler}>
        <button className='button-controller fullscreen-button' onClick={toggleFullscreen}>
          {fullscreenHandler.active ? 'Minimize' : 'Fullscreen'}
        </button>
        <Game showScreenControllers={isMobile} />
      </FullScreen>
    </div>
  ) : (
    <span className='orientation-container'>Make it landscape; ROTATE!</span>
  );
}

export default App;

function checkIsLandscapeOrientation() {
  return window.matchMedia('(orientation: landscape)').matches;
}
