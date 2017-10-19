/**
 * Created by anton on 10/13/2017.
 */
const express = require('express');
const app = express();
const server = app.listen(8080);
const io = require('socket.io').listen(server);
const fs = require("fs");

var players = {};

app.use(express.static(__dirname + '/static/'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/static/index.html");
    res.end();
});

io.on('connection', (socket) => {
    console.log("User has connected. Id: " + socket.id);
    newPlayer(socket.id);


    let id = socket.id;
    io.to(socket.id).emit("new player info", {
        playerId:   id,
        score:      players.id.score,
        level:      players.id.level,
        question:   getQuestionString(id),
        startTime:  players.id.startTime,
    });

    io.to(socket.id).emit("highscores", getHighScores());


    socket.on("answer", (json) => {
        let id = json.playerId;
        console.log(players.id.numbers[0]);
        if (checkAnswer(json.playerId, json.answer))
            rightAnswer(id);
        // else
            wrongAnswer(id);
    });
});

function getHighScores() {
    let filename = "highscores.json";
    createIfNotExists(filename);
    readFile(filename);
}

function readFile(filename) {

}

function createIfNotExists(filename) {
    let path = __dirname + "/" + filename;

   if(!fs.existsSync(path)) {
       let w = fs.createWriteStream(path, {flags:"w"});
       fs.closeSync(w);
   }
}

function wrongAnswer(id) {
    let player = newPlayer(id);
    let newply = [false, {
        playerId:   id,
        score:      player.score,
        level:      player.level,
        question:   getQuestionString(id),
        startTime:  Date.now()
    }];
    io.to(id).emit("answer", newply);
    players.id = player;
}

function rightAnswer(id) {
    let player = players.id;
    player.score++;
    if (player.score > 10) {
        player.score = 0;
        player.level++;
        if (player.level === 5) {
            won(id);
            return;
        }
    }

    player.numbers = generateNumbers();
    players.id = player;
    let newply = [true, {
        playerId:   id,
        score:      player.score,
        level:      player.level,
        question:   getQuestionString(id),
        startTime:  players.id.startTime
    }];
    io.to(id).emit("answer", newply);
}

function won(id) {
    io.to(id).emit("won", Date.now() - players.id.startTime);
}

function checkAnswer(id, answer) {

    let numbers = players.id.numbers;
    switch (players.id.level) {
        default:
            return (answer === (numbers[0] * numbers[1]));
        case 2:
            return answer === numbers[1];
        case 3:
            return answer === (numbers[0] + numbers[1] * numbers[2]);
        case 4:
            return answer === (numbers[2]);
    }
}

function getQuestionString(id) {
    let numbers = players.id.numbers;
    let level = players.id.level;

    switch (level) {
        default:
            return numbers[0] + "*" + numbers[1];
        case 2:
            return numbers[0] + " * ... = " + (numbers[0] * numbers[1]);
        case 3:
            return numbers[0] + "+" + numbers[1] + "*" + numbers[2];
            break;
        case 4:
            return numbers[0] + "+" + numbers[1] + "* ... =" + (numbers[0] + numbers[1] * numbers[2]);
    }
}

function newPlayer(id) { // initializes a new player.
    players.id = {
        score:      0,
        level:      1,
        numbers:    generateNumbers(),
        startTime: Date.now()
    };
    return players.id
}

function generateNumbers() {
    return [getNumber(), getNumber(), getNumber()]
}

function getNumber() {
    return Math.floor(Math.random() * 10 + 1)
}