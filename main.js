import io from "https://cdn.socket.io/4.5.4/socket.io.esm.min.js";
const socket = io();

const nameInput = document.getElementById("nameInput");
const roomInput = document.getElementById("roomInput");
const joinBtn = document.getElementById("joinBtn");

const lobby = document.getElementById("lobby");
const gameArea = document.getElementById("gameArea");
const playersDiv = document.getElementById("players");
const handDiv = document.getElementById("hand");
const statusDiv = document.getElementById("status");
const playCardBtn = document.getElementById("playCardBtn");

let currentPlayer = null;
let room = null;

joinBtn.onclick = () => {
  const name = nameInput.value.trim();
  const code = roomInput.value.trim();
  if (!name || !code) return alert("Enter name and room");
  currentPlayer = name;
  room = code;
  socket.emit("join-room", room, name);
  lobby.classList.add("hidden");
  gameArea.classList.remove("hidden");
  statusDiv.innerText = `Joined room: ${room}`;
};

socket.on("player-joined", (data) => {
  const entry = document.createElement("div");
  entry.innerText = `${data.name} joined`;
  playersDiv.appendChild(entry);
});
