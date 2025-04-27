const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Настройка размеров
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// Состояние игры
let gameState = {
    player: {
        x: canvas.width/2 - 30,
        y: canvas.height - 200,
        width: 60,
        height: 90,
        health: 3,
        score: 0,
        yVelocity: 0,
        isAttacking: false,
        isJumping: false
    },
    enemies: [],
    platforms: [
        {
            x: 0,
            y: canvas.height - 50,
            width: canvas.width,
            height: 50,
            type: 'stone'
        }
    ],
    physics: {
        gravity: 0.8,
        jumpForce: -20,
        isGrounded: false
    },
    lastSpawn: Date.now()
};

// Загрузка изображений
const images = {
    knightIdle: new Image(),
    knightAttack: new Image(),
    knightJump: new Image(),
    fudder: new Image(),
    sybil: new Image(),
    farmer: new Image(),
    stone: new Image(),
    heart: new Image()
};

// Обработчики ошибок
Object.values(images).forEach(img => {
    img.onerror = () => console.error('Error loading:', img.src);
});

// Пути к изображениям
images.knightIdle.src = 'assets/characters/knight_idle.png';
images.knightAttack.src = 'assets/characters/knight_attack.png';
images.knightJump.src = 'assets/characters/knight_jump.png';
images.fudder.src = 'assets/characters/fudder_enemy.png';
images.sybil.src = 'assets/characters/sybil_enemy.png';
images.farmer.src = 'assets/characters/farmer_enemy.png';
images.stone.src = 'assets/objects/stone_platform.png';
images.heart.src = 'assets/ui/heart_icon.png';

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

canvas.addEventListener('click', attack);

function attack() {
    if (!gameState.player.isAttacking) {
        gameState.player.isAttacking = true;
        document.getElementById('attackSound').play();
        setTimeout(() => gameState.player.isAttacking = false, 300);
    }
}

function jump() {
    if (gameState.physics.isGrounded) {
        gameState.player.yVelocity = gameState.physics.jumpForce;
        gameState.physics.isGrounded = false;
        gameState.player.isJumping = true;
        document.getElementById('jumpSound').play();
        setTimeout(() => gameState.player.isJumping = false, 500);
    }
}

function collision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function checkCollisions() {
    // Проверка платформ
    gameState.physics.isGrounded = false;
    gameState.platforms.forEach(plat => {
        if (collision({...gameState.player, height: gameState.player.height + 5}, plat)) {
            gameState.physics.isGrounded = true;
            gameState.player.yVelocity = 0;
            gameState.player.y = plat.y - gameState.player.height;
        }
    });

    // Проверка падения
    if (gameState.player.y > canvas.height) {
        gameOver();
    }

    // Проверка врагов
    gameState.enemies.forEach((enemy, index) => {
        if (collision(enemy, gameState.player)) {
            if (gameState.player.isAttacking) {
                gameState.enemies.splice(index, 1);
                gameState.player.score++;
                document.getElementById('score').textContent = `Убито: ${gameState.player.score}`;
            } else {
                gameState.player.health--;
                updateHearts();
                if (gameState.player.health <= 0) gameOver();
            }
        }
    });
}

function spawnEnemy() {
    const types = ['fudder', 'sybil', 'farmer'];
    const side = Math.random() > 0.5 ? 'left' : 'right';
    
    gameState.enemies.push({
        x: side === 'left' ? -100 : canvas.width + 100,
        y: canvas.height - 150,
        type: types[Math.floor(Math.random() * 3)],
        speed: side === 'left' ? 3 : -3,
        width: 80,
        height: 80
    });
}

function updateHearts() {
    const healthDiv = document.getElementById('health');
    healthDiv.innerHTML = '';
    for (let i = 0; i < gameState.player.health; i++) {
        const img = document.createElement('img');
        img.src = images.heart.src;
        img.className = 'heart-icon';
        healthDiv.appendChild(img);
    }
}

function gameOver() {
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('deathScreen').classList.remove('hidden');
    document.getElementById('finalName').textContent = document.getElementById('playerName').value;
    document.getElementById('finalScore').textContent = gameState.player.score;
}

function update() {
    if (keys.w) jump();
    if (keys.a) gameState.player.x -= 5;
    if (keys.d) gameState.player.x += 5;

    // Физика
    gameState.player.y += gameState.player.yVelocity;
    gameState.player.yVelocity += gameState.physics.gravity;

    // Границы экрана
    gameState.player.x = Math.max(0, Math.min(canvas.width - gameState.player.width, gameState.player.x));

    // Спавн врагов
    if (Date.now() - gameState.lastSpawn > 2000) {
        spawnEnemy();
        gameState.lastSpawn = Date.now();
    }

    // Движение врагов
    gameState.enemies.forEach(enemy => enemy.x += enemy.speed);

    checkCollisions();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Платформы
    gameState.platforms.forEach(plat => {
        ctx.drawImage(images.stone, plat.x, plat.y, plat.width, plat.height);
    });

    // Игрок
    let img;
    if (gameState.player.isJumping) img = images.knightJump;
    else if (gameState.player.isAttacking) img = images.knightAttack;
    else img = images.knightIdle;
    
    ctx.drawImage(img, gameState.player.x, gameState.player.y, 60, 90);

    // Враги
    gameState.enemies.forEach(enemy => {
        ctx.drawImage(images[enemy.type], enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Инициализация игры
document.getElementById('startGame').addEventListener('click', () => {
    const name = document.getElementById('playerName').value;
    if (!name) return alert('Введите ник!');
    
    gameState = {
        ...gameState,
        player: {
            ...gameState.player,
            health: 3,
            score: 0,
            x: canvas.width/2 - 30,
            y: canvas.height - 200
        },
        enemies: []
    };
    
    updateHearts();
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    gameLoop();
});

document.getElementById('newGame').addEventListener('click', () => {
    document.getElementById('deathScreen').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
});

// Видео интро
document.getElementById('skipIntro').addEventListener('click', () => {
    document.getElementById('introScreen').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
});

document.getElementById('introVideo').addEventListener('ended', () => {
    document.getElementById('introScreen').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
});

// Автозапуск видео
document.getElementById('introVideo').play().catch(error => {
    console.log('Автовоспроизведение запрещено');
    document.getElementById('introScreen').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
});

// Инициализация сердец
updateHearts();