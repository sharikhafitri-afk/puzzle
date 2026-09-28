const puzzle = document.getElementById("puzzle");

const timerElement = document.getElementById("timer");
const movesElement = document.getElementById("moves");
const scoreElement = document.getElementById("score");

const shuffleBtn = document.getElementById("shuffleBtn");
const restartBtn = document.getElementById("restartBtn");

const winMessage = document.getElementById("winMessage");

const finalTime = document.getElementById("finalTime");
const finalMoves = document.getElementById("finalMoves");
const finalScore = document.getElementById("finalScore");

const playAgainBtn = document.getElementById("playAgainBtn");


// ========================================
// KONFIGURASI
// ========================================

const GRID_SIZE = 3;

const TOTAL_TILES = GRID_SIZE * GRID_SIZE;


// ========================================
// DATA GAME
// ========================================

let tiles = [];

let moves = 0;

let seconds = 0;

let timerInterval = null;

let gameStarted = false;

let draggedIndex = null;


// ========================================
// MEMBUAT PUZZLE
// ========================================

function createPuzzle() {

    tiles = [];

    for (let i = 0; i < TOTAL_TILES; i++) {

        tiles.push(i);

    }

    renderPuzzle();

}


// ========================================
// MENAMPILKAN PUZZLE
// ========================================

function renderPuzzle() {

    puzzle.innerHTML = "";

    tiles.forEach((tileNumber, position) => {

        const tile = document.createElement("div");

        tile.classList.add("tile");

        tile.draggable = true;

        const row = Math.floor(tileNumber / GRID_SIZE);

        const column = tileNumber % GRID_SIZE;

        tile.style.backgroundPosition =
            `${column * 50}% ${row * 50}%`;

        tile.dataset.position = position;

        tile.dataset.number = tileNumber;


        // Drag Events

        tile.addEventListener(
            "dragstart",
            handleDragStart
        );

        tile.addEventListener(
            "dragover",
            handleDragOver
        );

        tile.addEventListener(
            "drop",
            handleDrop
        );

        tile.addEventListener(
            "dragend",
            handleDragEnd
        );


        // Touch / Mobile

        tile.addEventListener(
            "click",
            handleTileClick
        );


        puzzle.appendChild(tile);

    });

}


// ========================================
// DRAG START
// ========================================

function handleDragStart(event) {

    draggedIndex =
        Number(event.currentTarget.dataset.position);

    event.currentTarget.classList.add("dragging");

}


// ========================================
// DRAG OVER
// ========================================

function handleDragOver(event) {

    event.preventDefault();

}


// ========================================
// DROP
// ========================================

function handleDrop(event) {

    event.preventDefault();

    const targetIndex =
        Number(event.currentTarget.dataset.position);

    if (
        draggedIndex === null ||
        draggedIndex === targetIndex
    ) {
        return;
    }

    swapTiles(
        draggedIndex,
        targetIndex
    );

    draggedIndex = null;

}


// ========================================
// DRAG END
// ========================================

function handleDragEnd(event) {

    event.currentTarget.classList.remove(
        "dragging"
    );

}


// ========================================
// SWAP TILE
// ========================================

function swapTiles(index1, index2) {

    const temp = tiles[index1];

    tiles[index1] = tiles[index2];

    tiles[index2] = temp;

    moves++;

    startGame();

    updateInfo();

    renderPuzzle();

    checkWin();

}


// ========================================
// KLIK TILE
// ========================================

let selectedTile = null;

function handleTileClick(event) {

    const position =
        Number(event.currentTarget.dataset.position);


    if (selectedTile === null) {

        selectedTile = position;

        event.currentTarget.classList.add(
            "selected"
        );

        return;
    }


    if (selectedTile === position) {

        selectedTile = null;

        event.currentTarget.classList.remove(
            "selected"
        );

        return;
    }


    swapTiles(
        selectedTile,
        position
    );

    selectedTile = null;

}


// ========================================
// ACAK PUZZLE
// ========================================

function shufflePuzzle() {

    stopTimer();

    moves = 0;

    seconds = 0;

    gameStarted = false;

    selectedTile = null;


    // Fisher-Yates Shuffle

    for (
        let i = tiles.length - 1;
        i > 0;
        i--
    ) {

        const random =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            tiles[i],
            tiles[random]
        ] = [
            tiles[random],
            tiles[i]
        ];

    }


    // Pastikan tidak langsung selesai

    if (isSolved()) {

        shufflePuzzle();

        return;

    }


    updateInfo();

    renderPuzzle();

}


// ========================================
// CEK SELESAI
// ========================================

function isSolved() {

    for (
        let i = 0;
        i < TOTAL_TILES;
        i++
    ) {

        if (tiles[i] !== i) {

            return false;

        }

    }

    return true;

}


function checkWin() {

    if (!isSolved()) {

        return;

    }

    stopTimer();

    gameStarted = false;


    const score =
        calculateScore();


    finalTime.textContent =
        formatTime(seconds);

    finalMoves.textContent =
        moves;

    finalScore.textContent =
        score;


    scoreElement.textContent =
        score;


    winMessage.classList.add("show");

}


// ========================================
// SKOR
// ========================================

function calculateScore() {

    let score = 1000;

    // Kurangi skor berdasarkan langkah

    score -= moves * 5;

    // Kurangi skor berdasarkan waktu

    score -= Math.floor(seconds / 5);

    // Skor minimal 100

    if (score < 100) {

        score = 100;

    }

    return score;

}


// ========================================
// TIMER
// ========================================

function startGame() {

    if (gameStarted) {

        return;

    }

    gameStarted = true;

    timerInterval =
        setInterval(() => {

            seconds++;

            timerElement.textContent =
                formatTime(seconds);

        }, 1000);

}


function stopTimer() {

    clearInterval(timerInterval);

    timerInterval = null;

}


function formatTime(totalSeconds) {

    const minutes =
        Math.floor(totalSeconds / 60);

    const secondsLeft =
        totalSeconds % 60;


    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(secondsLeft).padStart(2, "0")
    );

}


// ========================================
// UPDATE INFO
// ========================================

function updateInfo() {

    movesElement.textContent =
        moves;

    timerElement.textContent =
        formatTime(seconds);

    scoreElement.textContent =
        calculateScore();

}


// ========================================
// MULAI ULANG
// ========================================

function restartGame() {

    stopTimer();

    moves = 0;

    seconds = 0;

    gameStarted = false;

    selectedTile = null;

    winMessage.classList.remove("show");

    createPuzzle();

    shufflePuzzle();

    updateInfo();

}


// ========================================
// EVENT BUTTON
// ========================================

shuffleBtn.addEventListener(
    "click",
    () => {

        shufflePuzzle();

    }
);


restartBtn.addEventListener(
    "click",
    () => {

        restartGame();

    }
);


playAgainBtn.addEventListener(
    "click",
    () => {

        restartGame();

    }
);


// ========================================
// START GAME
// ========================================

createPuzzle();

shufflePuzzle();

updateInfo();
