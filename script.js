// Инициализация переменных
let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

let knight = {
    x: 100,
    y: canvas.height - 150,
    width: 50,
    height: 100,
    speed: 5,
    lives: 3,
    isJumping: false,
    isAttacking: false,
    img: new Image()
};

knight.img.src = "assets/characters/knight_idle.png";

// Управление
let keys = {};

document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

// Функция для обновления экрана
function updateGameArea() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Отображаем рыцаря
    ctx.drawImage(knight.img, knight.x, knight.y, knight.width, knight.height);
    
    // Управление движением
    if (keys["a"]) {
        knight.x -= knight.speed;
    }
    if (keys["d"]) {
        knight.x += knight.speed;
    }
    if (keys["w"] && !knight.isJumping) {
        knight.isJumping = true;
        knight.y -= 100;
    }
    if (keys[" "]) {
        knight.isAttacking = true;
    }

    // Проверка столкновений с врагами и т.д.
    // Тут добавишь свою логику

    // Переход к следующему кадру
    requestAnimationFrame(updateGameArea);
}

// Запуск игры
function startGame() {
    document.getElementById("intro-screen").classList.add("hidden");
    document.getElementById("game-screen").classList.remove("hidden");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    updateGameArea();
}

function endGame() {
    document.getElementById('leaderboard').style.display = 'block';
    document.getElementById('scoreDisplay').innerText = "Ты убил " + killCount + " врагов!";
}

document.getElementById('restartButton').addEventListener('click', function() {
    window.location.reload(); // перезагрузка страницы для новой игры
});

/ Показываем кнопку старт на начальной заставке
const startScreen = document.getElementById("start-screen");
const startBtn = document.getElementById("start-btn");

// При нажатии на кнопку старт скрываем стартовый экран и начинаем игру
startBtn.addEventListener("click", function() {
    startScreen.style.display = "none"; // Скрываем экран старта
    startGame(); // Запускаем игру
});

// Показываем кнопку "Заново" после смерти игрока
const restartBtn = document.getElementById("restart-btn");

function endGame() {
    // Логика окончания игры
    // Показываем кнопку "Заново"
    restartBtn.style.display = "block"; 
}

// Логика для кнопки "Заново", чтобы начать игру заново
restartBtn.addEventListener("click", function() {
    restartGame(); // Начинаем новую игру
});

// Начать игру
document.getElementById("start-btn").onclick = startGame;