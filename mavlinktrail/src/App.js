// src/App.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Header from './Header';
import ControlPanel from './ControlPanel';
import './App.css';

const socket = io('http://localhost:4000');

const App = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [mavlinkData, setMavlinkData] = useState({});

  useEffect(() => {
    socket.on('status', (status) => {
      console.log(`Received status: ${status}`);
      setIsConnected(status === 'Connected');
    });

    socket.on('mavlinkData', (data) => {
      console.log('Received MAVLink data:', data);
      setMavlinkData(data);
    });

    return () => {
      socket.off('status');
      socket.off('mavlinkData');
    };
  }, []);

  return (
    <div className="app">
      <Header isConnected={isConnected} />
      {isConnected && <ControlPanel socket={socket} />}
      <div className="mavlink-data">
        <p>Pitch: {mavlinkData.pitch}</p>
        <p>Yaw: {mavlinkData.yaw}</p>
        <p>Roll: {mavlinkData.roll}</p>
        <p>Satellites: {mavlinkData.satellites}</p>
        <p>Airspeed: {mavlinkData.airspeed}</p>
        <p>Ground Speed: {mavlinkData.groundSpeed}</p>
        <p>Battery Current: {mavlinkData.batteryCurrent}</p>
        <p>Battery Voltage: {mavlinkData.batteryVoltage}</p>
      </div>
    </div>
  );
};

export default App;
