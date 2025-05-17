const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(express.static(path.join(__dirname, '../client')));

const suits = ['♠', '♥', '♣', '♦'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function shuffleDeck() {
  const deck = [];
  suits.forEach(suit => ranks.forEach(rank => deck.push(rank + suit)));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

let rooms = {};

io.on('connection', (socket) => {
  console.log('user connected:', socket.id);

  socket.on('join-room', (room, name) => {
    socket.join(room);
    if (!rooms[room]) rooms[room] = { players: [], deck: [], round: 1 };
    rooms[room].players.push({ id: socket.id, name, lives: 3, tricks: 0 });
    startRound(room);
  });

  socket.on('play-card', (selection) => {
    for (const room in rooms) {
      const player = rooms[room].players.find(p => p.id === socket.id);
      if (!player || player.cardPlayed) continue;
      const card = Array.isArray(player.hand) ? player.hand[selection] : selection;
      player.playedCard = card;
      player.cardPlayed = true;
      resolveTrick(room);
    }
  });

  socket.on('disconnect', () => {
    for (const room in rooms) {
      rooms[room].players = rooms[room].players.filter(p => p.id !== socket.id);
    }
  });
});

function startRound(room) {
  const roomData = rooms[room];
  roomData.deck = shuffleDeck();
  const round = roomData.round;

  roomData.players.forEach(p => {
    p.hand = [roomData.deck.pop()];
    p.cardPlayed = false;
    p.tricks = 0;

    let cardsToShow;
    if (round === 1 && roomData.players.length > 1) {
      cardsToShow = roomData.players.map(o => o.id === p.id ? "???" : o.hand[0]);
    } else {
      cardsToShow = p.hand;
    }

    io.to(p.id).emit("deal-cards", { cards: cardsToShow, round });
    io.to(p.id).emit("update-info", { lives: p.lives, tricks: p.tricks });
  });
}

function resolveTrick(room) {
  const roomData = rooms[room];
  const winner = roomData.players[0]; // always win in solo mode
  winner.tricks++;
  roomData.players.forEach(p => {
    p.cardPlayed = false;
    p.playedCard = null;
    io.to(p.id).emit("update-info", { lives: p.lives, tricks: p.tricks });
    io.to(p.id).emit("game-message", `You won the trick!`);
  });
  setTimeout(() => startRound(room), 2000);
}

server.listen(process.env.PORT || 3000, () => {
  console.log('Server running...');
});