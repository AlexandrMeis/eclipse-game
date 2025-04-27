const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let gameLoopID = null;

// Настройки
const CONFIG = {
    PLAYER_WIDTH: 60,
    PLAYER_HEIGHT: 90,
    ENEMY_SIZE: 50,
    GRAVITY: 0.8,
    JUMP_FORCE: -15,
    SPAWN_INTERVAL: 2000
};

// Состояние игры
let gameState = {
    player: {
        x: 400,
        y: 500,
        health: 3,
        score: 0,
        yVelocity: 0,
        isAttacking: false,
        isJumping: false
    },
    enemies: [],
    platforms: [
        {x: 0, y: 600, width: 200, height: 50}
    ],
    lastSpawn: 0
};

// Загрузка ресурсов
const images = {
    knightIdle: new Image(),
    knightAttack: new Image(),
    fudder: new Image(),
    sybil: new Image(),
    farmer: new Image()
};

images.knightIdle.src = 'assets/characters/knight_idle.png';
images.knightAttack.src = 'assets/characters/knight_attack.png';
images.fudder.src = 'assets/characters/fudder_enemy.png';
images.sybil.src = 'assets/characters/sybil_enemy.png';
images.farmer.src = 'assets/characters/farmer_enemy.png';

// Управление
const keys = { a: false, d: false, w: false };

document.addEventListener('keydown', (e) => {
    if (e.key === 'a') keys.a = true;
    if (e.key === 'd') keys.d = true;
    if (e.key === 'w' || e.key === ' ') keys.w = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'a') keys.a = false;
    if (e.key === 'd') keys.d = false;
    if (e.key === 'w' || e.key === ' ') keys.w = false;
});

// Основная логика
function update() {
    // Движение
    if (keys.a) gameState.player.x -= 5;
    if (keys.d) gameState.player.x += 5;
    gameState.player.x = Math.max(0, Math.min(canvas.width - 60, gameState.player.x));

    // Прыжок
    if (keys.w && isGrounded()) {
        gameState.player.yVelocity = CONFIG.JUMP_FORCE;
        document.getElementById('jumpSound').play();
    }

    // Гравитация
    gameState.player.y += gameState.player.yVelocity;
    gameState.player.yVelocity += CONFIG.GRAVITY;

    // Спавн врагов
    if (Date.now() - gameState.lastSpawn > CONFIG.SPAWN_INTERVAL) {
        spawnEnemy();
        gameState.lastSpawn = Date.now();
    }

    checkCollisions();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Платформы
    ctx.fillStyle = '#654321';
    gameState.platforms.forEach(plat => {
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
    });

    // Игрок
    ctx.drawImage(
        gameState.player.isAttacking ? images.knightAttack : images.knightIdle,
        gameState.player.x,
        gameState.player.y,
        CONFIG.PLAYER_WIDTH,
        CONFIG.PLAYER_HEIGHT
    );

    // Враги
    gameState.enemies.forEach(enemy => {
        ctx.drawImage(images[enemy.type], enemy.x, enemy.y, CONFIG.ENEMY_SIZE, CONFIG.ENEMY_SIZE);
    });
}

// Вспомогательные функции
function spawnEnemy() {
    const types = ['fudder', 'sybil', 'farmer'];
    const side = Math.random() > 0.5 ? 'left' : 'right';
    
    gameState.enemies.push({
        x: side === 'left' ? -50 : canvas.width + 50,
        y: 500,
        type: types[Math.floor(Math.random() * 3)],
        speed: side === 'left' ? 2 : -2
    });
}

function checkCollisions() {
    gameState.enemies.forEach((enemy, index) => {
        if (isColliding(gameState.player, enemy)) {
            if (gameState.player.isAttacking) {
                gameState.enemies.splice(index, 1);
                gameState.player.score++;
                document.getElementById('score').textContent = `Убито: ${gameState.player.score}`;
                document.getElementById('attackSound').play();
            } else {
                gameState.player.health--;
                updateHearts();
                if (gameState.player.health <= 0) gameOver();
            }
        }
    });
}

function isColliding(a, b) {
    return a.x < b.x + CONFIG.ENEMY_SIZE &&
           a.x + CONFIG.PLAYER_WIDTH > b.x &&
           a.y < b.y + CONFIG.ENEMY_SIZE &&
           a.y + CONFIG.PLAYER_HEIGHT > b.y;
}

function isGrounded() {
    return gameState.player.y + CONFIG.PLAYER_HEIGHT >= 600;
}

function updateHearts() {
    const healthDiv = document.getElementById('health');
    healthDiv.innerHTML = '';
    for (let i = 0; i < gameState.player.health; i++) {
        const img = new Image();
        img.src = 'assets/ui/heart_icon.png';
        img.className = 'heart-icon';
        healthDiv.appendChild(img);
    }
}

function gameOver() {
    cancelAnimationFrame(gameLoopID);
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('deathScreen').classList.remove('hidden');
    document.getElementById('finalName').textContent = 
        document.getElementById('playerName').value.trim();
    document.getElementById('finalScore').textContent = gameState.player.score;
}

// Обработчики событий
document.getElementById('startGame').addEventListener('click', () => {
    const name = document.getElementById('playerName').value.trim();
    if (name.length < 3) return alert('Ник должен быть от 3 символов!');
    
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    gameState.player.health = 3;
    gameState.player.score = 0;
    gameState.enemies = [];
    updateHearts();
    gameLoopID = requestAnimationFrame(gameLoop);
});

document.getElementById('newGame').addEventListener('click', () => {
    document.getElementById('deathScreen').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
});

document.getElementById('skipIntro').addEventListener('click', () => {
    document.getElementById('introScreen').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
});

// Инициализация
canvas.width = 1024;
canvas.height = 768;

// Автозапуск
document.getElementById('introVideo').play().catch(() => {
    document.getElementById('introScreen').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
});

function gameLoop() {
    update();
    draw();
    gameLoopID = requestAnimationFrame(gameLoop);
}