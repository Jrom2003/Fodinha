const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, '../client')));

io.on('connection', (socket) => {
  console.log('user connected:', socket.id);
  socket.on('join-room', (room, name) => {
    socket.join(room);
    io.to(room).emit('player-joined', { name });
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));