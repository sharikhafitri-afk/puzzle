const puzzle = document.getElementById("puzzle");

const photoInput = document.getElementById("photoInput");
const photoName = document.getElementById("photoName");

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


/* ========================================
   KONFIGURASI
======================================== */

const GRID_SIZE = 3;
const TOTAL_TILES = GRID_SIZE * GRID_SIZE;


/* ========================================
   DATA GAME
======================================== */

let tiles = [];

let moves = 0;

let seconds = 0;

let timerInterval = null;

let gameStarted = false;

let draggedIndex = null;

let selectedTile = null;


/*
   Gambar yang digunakan puzzle.
   Akan diisi dari foto galeri.
*/
let selectedImage = null;


/* ========================================
   PILIH FOTO
======================================== */

photoInput.addEventListener("change", function(event) {

    const file = event.target.files[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {

        alert("File yang dipilih harus berupa gambar.");

        return;
    }

    photoName.textContent = file.name;

    const reader = new FileReader();

    reader.onload = function(e) {

        selectedImage = e.target.result;

        createNewPuzzle();

    };

    reader.readAsDataURL(file);

});


/* ========================================
   BUAT PUZZLE BARU
======================================== */

function createNewPuzzle() {

    stopTimer();

    moves = 0;

    seconds = 0;

    gameStarted = false;

    selectedTile = null;

    winMessage.classList.remove("show");

    tiles = [];

    for (let i = 0; i < TOTAL_TILES; i++) {

        tiles.push(i);

    }

    shufflePuzzle();

    updateInfo();

}


/* ========================================
   RENDER PUZZLE
======================================== */

function renderPuzzle() {

    puzzle.innerHTML = "";

    tiles.forEach((tileNumber, position) => {

        const tile = document.createElement("div");

        tile.classList.add("tile");

        tile.draggable = true;

        /*
           Kalau belum memilih foto,
           gunakan warna default.
        */

        if (selectedImage) {

            tile.style.backgroundImage =
                `url("${selectedImage}")`;

        }

        /*
           Posisi gambar.

           0 = kiri atas
           1 = tengah atas
           2 = kanan atas
           3 = kiri tengah
           dst.
        */

        const row =
            Math.floor(tileNumber / GRID_SIZE);

        const column =
            tileNumber % GRID_SIZE;

        tile.style.backgroundPosition =
            `${column * 50}% ${row * 50}%`;

        tile.dataset.position = position;

        tile.dataset.number = tileNumber;


        /* DRAG */

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


        /* KLIK */

        tile.addEventListener(
            "click",
            handleTileClick
        );


        puzzle.appendChild(tile);

    });

}


/* ========================================
   DRAG START
======================================== */

function handleDragStart(event) {

    draggedIndex =
        Number(event.currentTarget.dataset.position);

    event.currentTarget.classList.add("dragging");

}


/* ========================================
   DRAG OVER
======================================== */

function handleDragOver(event) {

    event.preventDefault();

}


/* ========================================
   DROP
======================================== */

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


/* ========================================
   DRAG END
======================================== */

function handleDragEnd(event) {

    event.currentTarget.classList.remove(
        "dragging"
    );

}


/* ========================================
   KLIK DUA TILE
======================================== */

function handleTileClick(event) {

    const position =
        Number(
            event.currentTarget.dataset.position
        );


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


/* ========================================
   TUKAR TILE
======================================== */

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


/* ========================================
   ACAK PUZZLE
======================================== */

function shufflePuzzle() {

    /*
       Fisher-Yates Shuffle
    */

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


    /*
       Jangan sampai puzzle langsung selesai
    */

    if (isSolved()) {

        shufflePuzzle();

        return;

    }

    renderPuzzle();

}


/* ========================================
   CEK PUZZLE SELESAI
======================================== */

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


/* ========================================
   CEK MENANG
======================================== */

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


/* ========================================
   SKOR
======================================== */

function calculateScore() {

    let score = 1000;

    score -= moves * 5;

    score -= Math.floor(seconds / 5);


    if (score < 100) {

        score = 100;

    }

    return score;

}


/* ========================================
   TIMER
======================================== */

function startGame() {

    if (gameStarted) {

        return;

    }

    gameStarted = true;

    timerInterval =
        setInterval(function() {

            seconds++;

            timerElement.textContent =
                formatTime(seconds);

            scoreElement.textContent =
                calculateScore();

        }, 1000);

}


function stopTimer() {

    if (timerInterval) {

        clearInterval(timerInterval);

        timerInterval = null;

    }

}


function formatTime(totalSeconds) {

    const minutes =
        Math.floor(totalSeconds / 60);

    const remainingSeconds =
        totalSeconds % 60;


    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(remainingSeconds).padStart(2, "0")
    );

}


/* ========================================
   UPDATE INFORMASI
======================================== */

function updateInfo() {

    movesElement.textContent =
        moves;

    timerElement.textContent =
        formatTime(seconds);

    scoreElement.textContent =
        calculateScore();

}


/* ========================================
   MULAI ULANG
======================================== */

function restartGame() {

    if (!selectedImage) {

        alert(
            "Silakan pilih foto dari galeri terlebih dahulu."
        );

        return;

    }

    createNewPuzzle();

}


/* ========================================
   BUTTON
======================================== */

shuffleBtn.addEventListener(
    "click",
    function() {

        if (!selectedImage) {

            alert(
                "Silakan pilih foto dari galeri terlebih dahulu."
            );

            return;

        }

        stopTimer();

        moves = 0;

        seconds = 0;

        gameStarted = false;

        selectedTile = null;

        shufflePuzzle();

        updateInfo();

    }
);


restartBtn.addEventListener(
    "click",
    restartGame
);


playAgainBtn.addEventListener(
    "click",
    function() {

        winMessage.classList.remove("show");

        createNewPuzzle();

    }
);


/* ========================================
   KONDISI AWAL
======================================== */

puzzle.innerHTML = `
    <div class="empty-puzzle">
        📷<br>
        Pilih foto dari galeri
    </div>
`;
