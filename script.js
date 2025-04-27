const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Размеры холста
canvas.width = 1024;
canvas.height = 768;

// Состояние игры
let gameState = {
    player: {
        x: 400,
        y: 500,
        width: 60,
        height: 90,
        health: 3,
        score: 0,
        isAttacking: false
    },
    enemies: [],
    platforms: [
        {x: 0, y: 600, width: 200, height: 50},
        {x: 300, y: 500, width: 200, height: 50},
        {x: 600, y: 400, width: 200, height: 50}
    ]
};

// Загрузка изображений
const images = {
    knightIdle: new Image(),
    knightAttack: new Image(),
    knightJump: new Image(),
    fudder: new Image(),
    sybil: new Image(),
    farmer: new Image()
};

images.knightIdle.src = 'assets/characters/knight_idle.png';
images.knightAttack.src = 'assets/characters/knight_attack.png';
images.knightJump.src = 'assets/characters/knight_jump.png';
images.fudder.src = 'assets/characters/fudder_enemy.png';
images.sybil.src = 'assets/characters/sybil_enemy.png';
images.farmer.src = 'assets/characters/farmer_enemy.png';

// Управление
const keys = {
    a: false,
    d: false,
    w: false
};

// Обработчики событий
document.addEventListener('keydown', (e) => {
    if (e.key === 'a') keys.a = true;
    if (e.key === 'd') keys.d = true;
    if (e.key === 'w') keys.w = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'a') keys.a = false;
    if (e.key === 'd') keys.d = false;
    if (e.key === 'w') keys.w = false;
});

canvas.addEventListener('click', () => {
    if (!gameState.player.isAttacking) {
        gameState.player.isAttacking = true;
        setTimeout(() => gameState.player.isAttacking = false, 300);
    }
});

// Основной игровой цикл
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    // Движение игрока
    if (keys.a) gameState.player.x -= 5;
    if (keys.d) gameState.player.x += 5;
    
    // Ограничение границ
    gameState.player.x = Math.max(0, Math.min(canvas.width - gameState.player.width, gameState.player.x));
    
    // Обновление врагов
    gameState.enemies.forEach(enemy => {
        enemy.x += enemy.speed;
        // Простая логика преследования
        if (enemy.x < gameState.player.x) enemy.speed = 1;
        else enemy.speed = -1;
    });
}

function draw() {
    // Очистка холста
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Рисование игрока
    let img = gameState.player.isAttacking ? images.knightAttack : images.knightIdle;
    ctx.drawImage(img, gameState.player.x, gameState.player.y, 60, 90);
    
    // Рисование врагов
    gameState.enemies.forEach(enemy => {
        ctx.drawImage(images[enemy.type], enemy.x, enemy.y, 50, 50);
    });
    
    // Рисование платформ
    ctx.fillStyle = '#654321';
    gameState.platforms.forEach(plat => {
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
    });
}

// Инициализация игры
function initGame() {
    // Спавн врагов
    gameState.enemies = [
        {x: 100, y: 550, type: 'fudder', speed: 1},
        {x: 700, y: 450, type: 'sybil', speed: -1},
        {x: 400, y: 350, type: 'farmer', speed: 1}
    ];
    
    gameState.player.health = 3;
    gameState.player.score = 0;
    
    document.getElementById('health').textContent = '❤️'.repeat(3);
    document.getElementById('score').textContent = `Убито: 0`;
}

// Обработчики UI
document.getElementById('startGame').addEventListener('click', () => {
    const playerName = document.getElementById('playerName').value;
    if (!playerName) return alert('Введите ник!');
    
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    initGame();
    gameLoop();
});

document.getElementById('newGame').addEventListener('click', () => {
    document.getElementById('deathScreen').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
});

// Запуск интро
document.getElementById('skipIntro').addEventListener('click', () => {
    document.getElementById('introScreen').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
});

document.getElementById('introVideo').addEventListener('ended', () => {
    document.getElementById('introScreen').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
});