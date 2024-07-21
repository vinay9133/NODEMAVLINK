
import React from 'react';
import disarmed from './assets/disarmed.mp3'
import armed from './assets/armed.mp3'
import './ControlPanel.css'

const ControlPanel = ({ socket }) => {
  // const handleArm = () => {
  //   socket.emit('arm');
  // };

  // const handleDisarm = () => {
  //   socket.emit('disarm').play( );
  // };


  function Disarm(){
    new Audio(disarmed).play();
  }

  function Arm(){
    new Audio(armed).play()
  }

  return (
    <div className="control-panel">
      <button className='connections' onClick={Disarm}>Disarmed</button>
      <button className='connections' onClick={Arm}>Armed</button>
    </div>
  );
};

export default ControlPanel;
