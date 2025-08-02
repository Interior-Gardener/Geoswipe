// server/index.js
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

io.on('connection', (socket) => {
  console.log("Frontend connected.");

  socket.on('gesture', (data) => {
    console.log("Gesture from Python:", data);
    io.emit('gesture-from-server', data); // Forward to frontend
  });

  socket.on('disconnect', () => {
    console.log("Frontend disconnected");
  });
});

http.listen(3000, () => console.log("Server running on http://localhost:3000"));
