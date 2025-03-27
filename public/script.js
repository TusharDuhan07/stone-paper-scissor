const socket = io();
let playerChoice = null;

socket.on("waiting", (message) => {
    document.getElementById("status").innerText = message;
});

socket.on("gameStart", () => {
    document.getElementById("status").innerText = "Game started! Choose your move.";
    document.getElementById("game").style.display = "block";
});

function makeChoice(choice) {
    playerChoice = choice;
    socket.emit("playerChoice", choice);
}

socket.on("result", (message) => {
    document.getElementById("result").innerText = message;
});
