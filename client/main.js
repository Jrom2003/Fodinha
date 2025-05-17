const socket = io();
let selectedCard = null;

const lobby = document.getElementById("lobby");
const game = document.getElementById("game");
const joinBtn = document.getElementById("join");
const nameInput = document.getElementById("name");
const roomInput = document.getElementById("room");
const roomDisplay = document.getElementById("roomDisplay");
const cardArea = document.getElementById("cardArea");
const playBtn = document.getElementById("playBtn");
const playerInfo = document.getElementById("playerInfo");

joinBtn.onclick = () => {
  const name = nameInput.value.trim();
  const room = roomInput.value.trim();
  if (!name || !room) return alert("Enter name and room");
  socket.emit("join-room", room, name);
  lobby.classList.add("hidden");
  game.classList.remove("hidden");
  roomDisplay.innerText = room;
};

socket.on("deal-cards", ({ cards, round }) => {
  cardArea.innerHTML = "";
  cards.forEach((card, idx) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerText = (round === 1) ? "???" : card;
    div.onclick = () => {
      document.querySelectorAll(".card").forEach(c => c.classList.remove("selected"));
      div.classList.add("selected");
      selectedCard = round === 1 ? idx : card;
      playBtn.classList.remove("hidden");
    };
    cardArea.appendChild(div);
  });
});

playBtn.onclick = () => {
  if (selectedCard != null) {
    socket.emit("play-card", selectedCard);
    playBtn.classList.add("hidden");
  }
};

socket.on("update-info", (info) => {
  playerInfo.innerText = `Lives: ${info.lives} | Tricks: ${info.tricks}`;
});

socket.on("game-message", (msg) => alert(msg));
