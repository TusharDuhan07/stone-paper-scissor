// server.js
const WebSocket = require('ws');
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Stone Paper Scissors Game Server');
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

let players = []; // Store connected players
let gameState = 'waiting'; // Track the state of the game


wss.on('connection', ws => {
  console.log('New player connected!');
  
  // Add the player to the list
  players.push(ws);

  // Send a welcome message to the connected player
  ws.send(JSON.stringify({ message: 'You are connected!' }));

  // Once two players are connected, start the game
  if (players.length === 2 && gameState === 'waiting') {
    gameState = 'started'; // Update game state
    players.forEach(player => {
      player.send(JSON.stringify({ message: 'Game starting!' }));
    });
  }

  // Handle incoming messages from the players
  ws.on('message', message => {
    console.log(`Received: ${message}`);
    // Handle the game logic here (e.g., player choices)
  });

  // Handle disconnection of a player
  ws.on('close', () => {
    console.log('Player






