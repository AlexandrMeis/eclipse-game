const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let gameLoopID = null;

// Настройки
const CONFIG = {
    PLAYER_WIDTH: 80,
    PLAYER_HEIGHT: 120,
    ENEMY_SIZE: 60,
    PLATFORM_HEIGHT: 40,
    GRAVITY: 0.8,
    JUMP_FORCE: -20,
    SPAWN_INTERVAL: 1500,
    ENEMY_SPEED: 3
};

// Состояние игры
let gameState = {
    player: null,
    enemies: [],
    platform: null,
    lastSpawn: 0
};

// Инициализация размеров
function initGameSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Большая платформа во весь экран
    gameState.platform = {
        x: 0,
        y: canvas.height - CONFIG.PLATFORM_HEIGHT,
        width: canvas.width,
        height: CONFIG.PLATFORM_HEIGHT
    };
    
    // Игрок по центру
    gameState.player = {
        x: canvas.width/2 - CONFIG.PLAYER_WIDTH/2,
        y: canvas.height - CONFIG.PLATFORM_HEIGHT - CONFIG.PLAYER_HEIGHT,
        width: CONFIG.PLAYER_WIDTH,
        height: CONFIG.PLAYER_HEIGHT,
        health: 3,
        score: 0,
        yVelocity: 0,
        isAttacking: false
    };
}

// Загрузка ресурсов
const images = {
    knightIdle: new Image(),
    knightAttack: new Image(),
    fudder: new Image(),
    sybil: new Image(),
    farmer: new Image(),
    platform: new Image()
};

images.knightIdle.src = 'assets/characters/knight_idle.png';
images.knightAttack.src = 'assets/characters/knight_attack.png';
images.fudder.src = 'assets/characters/fudder_enemy.png';
images.sybil.src = 'assets/characters/sybil_enemy.png';
images.farmer.src = 'assets/characters/farmer_enemy.png';
images.platform.src = 'assets/objects/stone_platform.png';

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
    // Движение игрока
    if (keys.a) gameState.player.x -= 5;
    if (keys.d) gameState.player.x += 5;
    gameState.player.x = Math.max(0, Math.min(
        canvas.width - CONFIG.PLAYER_WIDTH, 
        gameState.player.x
    ));

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

    // Движение врагов
    gameState.enemies.forEach(enemy => {
        const dx = gameState.player.x - enemy.x;
        const dy = gameState.player.y - enemy.y;
        const distance = Math.sqrt(dx*dx + dy*dy);
        
        enemy.x += (dx/distance) * CONFIG.ENEMY_SPEED;
        enemy.y += (dy/distance) * CONFIG.ENEMY_SPEED;
    });

    checkCollisions();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Платформа
    ctx.drawImage(
        images.platform,
        gameState.platform.x,
        gameState.platform.y,
        gameState.platform.width,
        gameState.platform.height
    );

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
        ctx.drawImage(
            images[enemy.type],
            enemy.x,
            enemy.y,
            CONFIG.ENEMY_SIZE,
            CONFIG.ENEMY_SIZE
        );
    });
}

// Вспомогательные функции
function spawnEnemy() {
    const types = ['fudder', 'sybil', 'farmer'];
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.max(canvas.width, canvas.height) * 0.6;
    
    gameState.enemies.push({
        x: gameState.player.x + Math.cos(angle) * radius,
        y: gameState.player.y + Math.sin(angle) * radius,
        type: types[Math.floor(Math.random() * 3)]
    });
}

function isGrounded() {
    return gameState.player.y + CONFIG.PLAYER_HEIGHT >= 
        gameState.platform.y - 5;
}

function checkCollisions() {
    gameState.enemies = gameState.enemies.filter(enemy => {
        const collision = (
            enemy.x < gameState.player.x + CONFIG.PLAYER_WIDTH &&
            enemy.x + CONFIG.ENEMY_SIZE > gameState.player.x &&
            enemy.y < gameState.player.y + CONFIG.PLAYER_HEIGHT &&
            enemy.y + CONFIG.ENEMY_SIZE > gameState.player.y
        );
        
        if (collision) {
            if (gameState.player.isAttacking) {
                gameState.player.score++;
                document.getElementById('score').textContent = `Убито: ${gameState.player.score}`;
                document.getElementById('attackSound').play();
                return false; // Удаляем врага
            } else {
                gameState.player.health--;
                updateHearts();
                if (gameState.player.health <= 0) gameOver();
            }
        }
        return true;
    });
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
    
    initGameSize();
    updateHearts();
    
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
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
initGameSize();
window.addEventListener('resize', initGameSize);

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