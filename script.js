const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 1920;
canvas.height = 1080;

// Состояние игры
let gameState = {
    player: {
        x: 400,
        y: 500,
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
        {x: 0, y: 600, width: 200, height: 20, type: 'stone'},
        {x: 300, y: 500, width: 200, height: 20, type: 'stone'},
        {x: 600, y: 400, width: 200, height: 20, type: 'jump'}
    ],
    physics: {
        gravity: 0.8,
        jumpForce: -15,
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
    background: new Image(),
    stone: new Image(),
    jump: new Image()
};

images.knightIdle.src = 'assets/characters/knight_idle.png';
images.knightAttack.src = 'assets/characters/knight_attack.png';
images.knightJump.src = 'assets/characters/knight_jump.png';
images.fudder.src = 'assets/characters/fudder_enemy.png';
images.sybil.src = 'assets/characters/sybil_enemy.png';
images.farmer.src = 'assets/characters/farmer_enemy.png';
images.background.src = 'assets/backgrounds/game_background.jpg';
images.stone.src = 'assets/objects/stone_platform.png';
images.jump.src = 'assets/objects/jump_platform.png';

// Управление
const keys = { a: false, d: false, w: false };

// Обработчики клавиш
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

// Прыжок
function jump() {
    if (gameState.physics.isGrounded) {
        document.getElementById('jumpSound').play();
        gameState.player.yVelocity = gameState.physics.jumpForce;
        gameState.physics.isGrounded = false;
        gameState.player.isJumping = true;
        setTimeout(() => gameState.player.isJumping = false, 500);
    }
}

// Коллизии
function collision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Проверка столкновений
function checkCollisions() {
    gameState.physics.isGrounded = false;
    gameState.platforms.forEach(plat => {
        if (collision({...gameState.player, height: gameState.player.height + 5}, plat)) {
            gameState.physics.isGrounded = true;
            gameState.player.yVelocity = 0;
            gameState.player.y = plat.y - gameState.player.height;
        }
    });

    gameState.enemies.forEach((enemy, index) => {
        if (collision(enemy, gameState.player)) {
            if (gameState.player.isAttacking) {
                gameState.enemies.splice(index, 1);
                gameState.player.score++;
                document.getElementById('score').textContent = `Убито: ${gameState.player.score}`;
            } else {
                gameState.player.health--;
                document.getElementById('health').children[gameState.player.health].style.opacity = 0.3;
                if (gameState.player.health <= 0) gameOver();
            }
        }
    });
}

// Спавн врагов
function spawnEnemy() {
    const types = ['fudder', 'sybil', 'farmer'];
    const side = Math.random() > 0.5 ? 'left' : 'right';
    
    gameState.enemies.push({
        x: side === 'left' ? -50 : canvas.width + 50,
        y: 500,
        type: types[Math.floor(Math.random() * 3)],
        speed: side === 'left' ? 2 : -2,
        width: 50,
        height: 50
    });
}

// Конец игры
function gameOver() {
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('deathScreen').classList.remove('hidden');
    document.getElementById('finalName').textContent = document.getElementById('playerName').value;
    document.getElementById('finalScore').textContent = gameState.player.score;
}

// Обновление игры
function update() {
    if (keys.w) jump();
    if (keys.a) gameState.player.x -= 5;
    if (keys.d) gameState.player.x += 5;

    gameState.player.y += gameState.player.yVelocity;
    gameState.player.yVelocity += gameState.physics.gravity;
    gameState.player.x = Math.max(0, Math.min(canvas.width - gameState.player.width, gameState.player.x));

    if (Date.now() - gameState.lastSpawn > 3000) {
        spawnEnemy();
        gameState.lastSpawn = Date.now();
    }

    gameState.enemies.forEach(enemy => enemy.x += enemy.speed);
    checkCollisions();
}

// Отрисовка
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(images.background, 0, 0, canvas.width, canvas.height);

    // Платформы
    gameState.platforms.forEach(plat => {
        ctx.drawImage(
            images[plat.type],
            plat.x, 
            plat.y, 
            plat.width, 
            plat.height
        );
    });

    // Игрок
    let img;
    if (gameState.player.isJumping) img = images.knightJump;
    else if (gameState.player.isAttacking) img = images.knightAttack;
    else img = images.knightIdle;
    ctx.drawImage(img, gameState.player.x, gameState.player.y, gameState.player.width, gameState.player.height);

    // Враги
    gameState.enemies.forEach(enemy => {
        ctx.drawImage(images[enemy.type], enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

// Игровой цикл
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Обработчики кнопок
document.getElementById('startGame').addEventListener('click', () => {
    const name = document.getElementById('playerName').value;
    if (!name) return alert('Введите ник!');
    
    gameState.player.health = 3;
    gameState.player.score = 0;
    gameState.enemies = [];
    Array.from(document.getElementsByClassName('heart')).forEach(h => h.style.opacity = 1);
    
    document.getElementById('mainMenu').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    gameLoop();
});

document.getElementById('newGame').addEventListener('click', () => {
    document.getElementById('deathScreen').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
});

document.getElementById('skipIntro').addEventListener('click', () => {
    document.getElementById('introScreen').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
});

// Автозапуск видео
document.getElementById('introVideo').play().catch(() => {
    document.getElementById('introScreen').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
});

document.getElementById('introVideo').addEventListener('ended', () => {
    document.getElementById('introScreen').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
});