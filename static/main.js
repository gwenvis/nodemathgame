/**
 * Created by anton on 9/18/2017.
 */
const socket = io.connect();
const elements = {
    problem: document.getElementById("problem").firstElementChild,
    answer: document.getElementById("answer").firstElementChild,
    feedback: document.getElementById("feedback").firstElementChild,
    score: document.getElementById("score").firstElementChild,
    level: document.getElementById("level").firstElementChild,
    time: document.getElementById("time"),
    highscoreButton: document.getElementById("highscoresbutton"),
};

socket.on('new player info', (data) => newPlayer(data));
socket.on('answer', (data) => receiveAnswer(data));
socket.on('won', (time)=>won(time));
socket.on('highscores', (highscores)=>addhighscores(highscores));

var hDis = false;
elements.highscoreButton.onclick = () => {
    let element = document.getElementById("highscoreswrapper");
    if(hDis)
        element.style = "animation-name: in;";
    else
        element.style = "animation-name: out;";
    hDis = !hDis;
};

const answers = {
    correct: ["Correct!", "Yep!", "Nice!", "Awesome!", "Cool!", "Wicked!",
        "Wow!", "Dat klopt!", "Boom!"],
    wrong: ["Nope!", "RIP jou maatje", "Fout!", "Correct! Geintje.", "Opnieuw!"]
};

elements.answer.addEventListener("keyup", submit_solution);

var player;

function won(time) {

}

function addhighscores(highscores) {

}

function newPlayer(data) {
    player = data;
    elements.problem.innerHTML = data.question;
    setScore(0);
    setLevel(1);
}

function receiveAnswer(data) {
    if (data[0] == true)
        correct(data);
    else
        wrong(data);
}

function wrong(data) {
    newPlayer(data[1]);
    answer(false);
    elements.problem.innerHTML = data[1].question;
}

function correct(data) {
    answer(true);
    setScore(data[1].score);
    setLevel(data[1].level);
    elements.problem.innerHTML = data[1].question;
}

function setScore(score) {
    elements.score.innerHTML = "Score<br>" + score;
}

function setLevel(level) {
    elements.level.innerHTML = "Level<br>" + level;
}

function submit_solution(ev) {
    if (ev.keyCode == 13) {
        socket.emit('answer', {
            playerId: player.playerId,
            answer: elements.answer.firstElementChild.value
        });
        elements.answer.firstElementChild.value = "";
    }
}

function answer(correct) {

    if (correct) {
        let c = answers.correct[Math.floor(Math.random() * answers.correct.length)];
        elements.feedback.innerHTML = '<span class="answer correct">' + c + '</span>';
    }
    else {
        let c = answers.wrong[Math.floor(Math.random() * answers.wrong.length)];
        elements.feedback.innerHTML = '<span class="answer wrong">' + c + '</span>';
    }
    window.setTimeout(function () {
        elements.feedback.innerHTML = "";
    }, 800);
}

window.setInterval(() => {
    elements.time.innerHTML =
        Math.floor((Date.now() - player.startTime) / 1000);
}, 500);

elements.answer.firstElementChild.focus();