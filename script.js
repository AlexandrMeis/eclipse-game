const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Конфигурация
const CONFIG = {
    SCALE: 1.8,
    PLAYER_WIDTH: 80,
    PLAYER_HEIGHT: 120,
    ENEMY_SIZE: 100,
    PLATFORM_HEIGHT: 60,
    GRAVITY: 0.85,
    JUMP_FORCE: -25,
    SPAWN_INTERVAL: 2000,
    INVINCIBILITY_TIME: 5000
};

// Состояние игры
let gameState = {
    player: null,
    enemies: [],
    platforms: [],
    lastSpawn: 0,
    isGameActive: false,
    isInvincible: true
};

// Ресурсы
const assets = {
    images: {
        knightIdle: new Image(),
        knightAttack: new Image(),
        knightJump: new Image(),
        fudder: new Image(),
        sybil: new Image(),
        farmer: new Image(),
        stone: new Image(),
        heart: new Image()
    },
    audio: {
        attack: document.getElementById('attackSound'),
        jump: document.getElementById('jumpSound')
    }
};

// Инициализация
function init() {
    // Размеры
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Игрок
    gameState.player = {
        x: canvas.width/2 - (CONFIG.PLAYER_WIDTH * CONFIG.SCALE)/2,
        y: canvas.height - 300,
        width: CONFIG.PLAYER_WIDTH * CONFIG.SCALE,
        height: CONFIG.PLAYER_HEIGHT * CONFIG.SCALE,
        health: 3,
        score: 0,
        yVelocity: 0,
        isAttacking: false,
        isJumping: false
    };

    // Платформы
    gameState.platforms = [{
        x: 0,
        y: canvas.height - CONFIG.PLATFORM_HEIGHT * CONFIG.SCALE,
        width: canvas.width,
        height: CONFIG.PLATFORM_HEIGHT * CONFIG.SCALE
    }];

    // Сброс состояний
    gameState.enemies = [];
    gameState.lastSpawn = 0;
    gameState.isGameActive = true;
    gameState.isInvincible = true;
    
    // Включить неуязвимость на старте
    setTimeout(() => gameState.isInvincible = false, CONFIG.INVINCIBILITY_TIME);
}

// Загрузка ресурсов
async function loadAssets() {
    const images = Object.values(assets.images);
    assets.images.knightIdle.src = 'assets/characters/knight_idle.png';
    assets.images.knightAttack.src = 'assets/characters/knight_attack.png';
    assets.images.knightJump.src = 'assets/characters/knight_jump.png';
    assets.images.fudder.src = 'assets/characters/fudder_enemy.png';
    assets.images.sybil.src = 'assets/characters/sybil_enemy.png';
    assets.images.farmer.src = 'assets/characters/farmer_enemy.png';
    assets.images.stone.src = 'assets/objects/stone_platform.png';
    assets.images.heart.src = 'assets/ui/heart_icon.png';

    await Promise.all([
        ...images.map(img => new Promise(resolve => {
            img.onload = resolve;
            img.onerror = () => console.error(`Ошибка загрузки: ${img.src}`);
        })),
        new Promise(resolve => {
            assets.audio.attack.onloadeddata = resolve;
            assets.audio.jump.onloadeddata = resolve;
        })
    ]);
}

// Обратный отсчет
async function countdown(seconds) {
    return new Promise(resolve => {
        let count = seconds;
        const interval = setInterval(() => {
            document.getElementById('countdown').textContent = count--;
            if (count < 0) {
                clearInterval(interval);
                resolve();
            }
        }, 1000);
    });
}

// Игровой цикл
function gameLoop() {
    if (!gameState.isGameActive) return;

    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Логика обновления
function update() {
    // Движение
    if (keys.a) gameState.player.x -= 5;
    if (keys.d) gameState.player.x += 5;
    gameState.player.x = Math.max(0, Math.min(
        canvas.width - gameState.player.width, 
        gameState.player.x
    ));

    // Прыжок
    if (keys.w && isGrounded()) {
        gameState.player.yVelocity = CONFIG.JUMP_FORCE * CONFIG.SCALE;
        assets.audio.jump.play();
    }

    // Гравитация
    gameState.player.y += gameState.player.yVelocity;
    gameState.player.yVelocity += CONFIG.GRAVITY;

    // Спавн врагов
    if (Date.now() - gameState.lastSpawn > CONFIG.SPAWN_INTERVAL) {
        spawnEnemy();
        gameState.lastSpawn = Date.now();
    }

    // Коллизии
    checkCollisions();
}

// Отрисовка
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Платформы
    gameState.platforms.forEach(plat => {
        ctx.drawImage(
            assets.images.stone,
            plat.x,
            plat.y,
            plat.width,
            plat.height
        );
    });

    // Игрок
    let img;
    if (gameState.player.isJumping) img = assets.images.knightJump;
    else if (gameState.player.isAttacking) img = assets.images.knightAttack;
    else img = assets.images.knightIdle;
    
    ctx.drawImage(
        img,
        gameState.player.x,
        gameState.player.y,
        gameState.player.width,
        gameState.player.height
    );

    // Враги
    gameState.enemies.forEach(enemy => {
        ctx.drawImage(
            assets.images[enemy.type],
            enemy.x,
            enemy.y,
            enemy.width,
            enemy.height
        );
    });
}

// Обработчики событий
const keys = { a: false, d: false, w: false };

document.addEventListener('keydown', e => {
    if (!gameState.isGameActive) return;
    keys[e.key.toLowerCase()] = true;
});

document.addEventListener('keyup', e => {
    if (!gameState.isGameActive) return;
    keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener('click', () => {
    if (!gameState.isGameActive || gameState.player.isAttacking) return;
    gameState.player.isAttacking = true;
    assets.audio.attack.play();
    setTimeout(() => gameState.player.isAttacking = false, 300);
});

// Запуск игры
document.getElementById('startGame').addEventListener('click', async () => {
    const name = document.getElementById('playerName').value.trim();
    if (!name) return alert('Введите ник!');

    // Блокировка кнопки
    document.getElementById('startGame').style.pointerEvents = 'none';

    // Загрузка ресурсов
    document.getElementById('preloader').classList.remove('hidden');
    await loadAssets();
    
    // Обратный отсчет
    await countdown(5);
    
    // Инициализация и запуск
    document.getElementById('preloader').classList.add('hidden');
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    init();
    updateHearts();
    gameLoop();
});

// Остальные функции
function isGrounded() {
    return gameState.player.y >= 
        canvas.height - 
        CONFIG.PLATFORM_HEIGHT * CONFIG.SCALE - 
        gameState.player.height;
}

function spawnEnemy() {
    const types = ['fudder', 'sybil', 'farmer'];
    const side = Math.random() > 0.5 ? 'left' : 'right';
    
    gameState.enemies.push({
        x: side === 'left' ? -CONFIG.ENEMY_SIZE * CONFIG.SCALE : canvas.width,
        y: canvas.height - (CONFIG.PLATFORM_HEIGHT + CONFIG.ENEMY_SIZE) * CONFIG.SCALE,
        type: types[Math.floor(Math.random() * 3)],
        speed: side === 'left' ? 3 : -3,
        width: CONFIG.ENEMY_SIZE * CONFIG.SCALE,
        height: CONFIG.ENEMY_SIZE * CONFIG.SCALE
    });
}

function checkCollisions() {
    // Враги
    gameState.enemies.forEach((enemy, index) => {
        if (checkCollision(gameState.player, enemy)) {
            if (gameState.player.isAttacking) {
                gameState.enemies.splice(index, 1);
                gameState.player.score++;
                document.getElementById('score').textContent = `Убито: ${gameState.player.score}`;
            } else if (!gameState.isInvincible) {
                gameState.player.health--;
                updateHearts();
                if (gameState.player.health <= 0) gameOver();
            }
        }
    });
}

function checkCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

function updateHearts() {
    document.getElementById('health').innerHTML = '';
    for (let i = 0; i < gameState.player.health; i++) {
        const img = new Image();
        img.src = assets.images.heart.src;
        img.className = 'heart-icon';
        document.getElementById('health').appendChild(img);
    }
}

function gameOver() {
    gameState.isGameActive = false;
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('deathScreen').classList.remove('hidden');
    document.getElementById('finalName').textContent = 
        document.getElementById('playerName').value;
    document.getElementById('finalScore').textContent = gameState.player.score;
}

document.getElementById('newGame').addEventListener('click', () => {
    document.getElementById('deathScreen').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
    document.getElementById('startGame').style.pointerEvents = 'auto';
});

document.getElementById('skipIntro').addEventListener('click', () => {
    document.getElementById('introScreen').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
});

// Автозапуск
window.addEventListener('load', () => {
    document.getElementById('introVideo').play().catch(() => {
        document.getElementById('introScreen').classList.add('hidden');
        document.getElementById('mainMenu').classList.remove('hidden');
    });
});