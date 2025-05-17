const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, '../client')));

io.on('connection', (socket) => {
  console.log('user connected:', socket.id);

  socket.on('join-room', (roomCode, playerName) => {
    socket.join(roomCode);
    console.log(`${playerName} joined room ${roomCode}`);
    io.to(roomCode).emit('player-joined', { id: socket.id, name: playerName });
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
