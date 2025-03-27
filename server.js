const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000; // Use Railway's assigned port

app.use(cors());
app.use(express.static("public"));

let rooms = {}; // Store game rooms

io.on("connection", (socket) => {
    console.log(`✅ A user connected: ${socket.id}`);

    socket.on("createRoom", (roomCode) => {
        if (!rooms[roomCode]) {
            rooms[roomCode] = { players: [], choices: {} };
        }
        if (rooms[roomCode].players.length < 2) {
            rooms[roomCode].players.push(socket.id);
            socket.join(roomCode);
            console.log(`🏠 Player ${socket.id} joined room: ${roomCode}`);
            io.to(roomCode).emit("playerJoined", rooms[roomCode].players.length);
        }
        if (rooms[roomCode].players.length === 2) {
            io.to(roomCode).emit("gameStart");
        }
    });

    socket.on("makeChoice", ({ roomCode, choice }) => {
        if (rooms[roomCode]) {
            rooms[roomCode].choices[socket.id] = choice;
            if (Object.keys(rooms[roomCode].choices).length === 2) {
                determineWinner(roomCode);
            }
        }
    });

    function determineWinner(roomCode) {
        let players = rooms[roomCode].players;
        let choices = rooms[roomCode].choices;
        let player1 = players[0];
        let player2 = players[1];

        let result;
        if (choices[player1] === choices[player2]) {
            result = "draw";
        } else if (
            (choices[player1] === "rock" && choices[player2] === "scissors") ||
            (choices[player1] === "scissors" && choices[player2] === "paper") ||
            (choices[player1] === "paper" && choices[player2] === "rock")
        ) {
            result = player1;
        } else {
            result = player2;
        }

        io.to(roomCode).emit("gameResult", { winner: result, choices });
        rooms[roomCode].choices = {}; // Reset choices
    }

    socket.on("disconnect", () => {
        console.log(`❌ A user disconnected: ${socket.id}`);
        for (let room in rooms) {
            rooms[room].players = rooms[room].players.filter(id => id !== socket.id);
            if (rooms[room].players.length === 0) {
                delete rooms[room];
            }
        }
    });
});

// ✅ Use only `server.listen`, remove `app.listen`
server.listen(PORT, () => {
    console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
});
