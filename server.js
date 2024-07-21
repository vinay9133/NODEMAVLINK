const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { SerialPort } = require('serialport');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mavlink = require('mavlink');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT_NAME = 'COM12';
const BAUD_RATE = 57600;

let connected = false;
let port;
let lastDataReceived = Date.now();

const mavlinkParser = new mavlink();
const xmlFilePath = path.join(__dirname, 'ardupilotmega.xml');

fs.readFile(xmlFilePath, 'utf8', (err, xmlData) => {
  if (err) {
    console.error('Error reading XML file:', err.message);
    return;
  }
  mavlinkParser.parse(xmlData);
  console.log('MAVLink XML file parsed successfully');
});

const openSerialPort = () => {
  port = new SerialPort({ path: PORT_NAME, baudRate: BAUD_RATE });

  port.on('open', () => {
    console.log('Port open');
    connected = true;
    io.emit('status', 'Connected');
    console.log('Status emitted: Connected');
  });

  port.on('error', (err) => {
    console.error('Error: ', err.message);
    connected = false;
    io.emit('status', 'Disconnected');
    console.log('Status emitted: Disconnected (error)');
  });

  port.on('close', () => {
    console.log('Port closed');
    connected = false;
    io.emit('status', 'Disconnected');
    console.log('Status emitted: Disconnected (close)');
    setTimeout(openSerialPort, 2000);
  });

  port.on('data', (data) => {
    lastDataReceived = Date.now();
    try {
      mavlinkParser.parse(data); // Assuming parse can handle the raw data buffer
    } catch (error) {
      console.error('Error parsing MAVLink data:', error.message);
    }
  });

  mavlinkParser.on('message', (message) => {
    const dataToSend = {
      pitch: message.pitch || 0,
      yaw: message.yaw || 0,
      roll: message.roll || 0,
      satellites: message.satellites_visible || 0,
      airspeed: message.airspeed || 0,
      groundSpeed: message.groundspeed || 0,
      batteryCurrent: message.current_battery || 0,
      batteryVoltage: message.voltage_battery || 0
    };

    io.emit('mavlinkData', dataToSend);
  });

  setInterval(() => {
    const now = Date.now();
    if (now - lastDataReceived > 5000) { // 5 seconds threshold for no data
      connected = false;
      io.emit('status', 'Disconnected');
      console.log('Status emitted: Disconnected (timeout)');
    } else {
      connected = true;
      io.emit('status', 'Connected');
      console.log('Status emitted: Connected (data received)');
    }
  }, 2000); // Check every 2 seconds
};

openSerialPort();

io.on('connection', (socket) => {
  console.log('New client connected');
  socket.emit('status', connected ? 'Connected' : 'Disconnected');

  socket.on('arm', () => {
    if (connected) {
      armDrone();
    }
  });

  socket.on('disarm', () => {
    if (connected) {
      disarmDrone();
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.use(cors());
app.use(express.static('public'));

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
