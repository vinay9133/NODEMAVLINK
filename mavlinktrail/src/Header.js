
import React from 'react';

const Header = ({ isConnected }) => (
  <div className="header">
    <h1>Drone Control</h1>
    <div className={`status ${isConnected ? 'connected' : 'disconnected'}`}>
      {isConnected ? 'Connected' : 'Disconnected'}
    </div>
  </div>
);

export default Header;
