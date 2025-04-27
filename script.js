const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
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
        yVelocity: 0,
        isAttacking: false,
        isJumping: false
    },
    enemies: [],
    platforms: [
        {x: 0, y: 600, width: 200, height: 20},
        {x: 300, y: 500, width: 200, height: 20},
        {x: 600, y: 400, width: 200, height: 20}
    ],
    physics: {
        gravity: 0.8,
        jumpForce: -15,
        isGrounded: false
    }
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

// Обработчики ошибок для изображений
Object.values(images).forEach(img => {
    img.onerror = () => console.error('Ошибка загрузки:', img.src);
});

images.knightIdle.src = 'assets/characters/knight_idle.png';
images.knightAttack.src = 'assets/characters/knight_attack.png';
images.knightJump.src = 'assets/characters/knight_jump.png';
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

canvas.addEventListener('click', () => {
    if (!gameState.player.isAttacking) {
        gameState.player.isAttacking = true;
        setTimeout(() => gameState.player.isAttacking = false, 300);
    }
});

function jump() {
    if (gameState.physics.isGrounded) {
        gameState.player.yVelocity = gameState.physics.jumpForce;
        gameState.physics.isGrounded = false;
        gameState.player.isJumping = true;
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
    gameState.physics.isGrounded = false;
    gameState.platforms.forEach(plat => {
        if (collision({...gameState.player, height: gameState.player.height + 5}, plat)) {
            gameState.physics.isGrounded = true;
            gameState.player.yVelocity = 0;
            gameState.player.y = plat.y - gameState.player.height;
        }
    });
}

function spawnEnemy() {
    const side = Math.random() > 0.5 ? 'left' : 'right';
    const types = ['fudder', 'sybil', 'farmer'];
    gameState.enemies.push({
        x: side === 'left' ? -50 : canvas.width + 50,
        y: 500,
        type: types[Math.floor(Math.random() * 3)],
        speed: side === 'left' ? 2 : -2,
        width: 50,
        height: 50
    });
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

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let img;
    if (gameState.player.isJumping) img = images.knightJump;
    else if (gameState.player.isAttacking) img = images.knightAttack;
    else img = images.knightIdle;
    
    ctx.drawImage(img, gameState.player.x, gameState.player.y, 60, 90);
    
    gameState.enemies.forEach(enemy => {
        ctx.drawImage(images[enemy.type], enemy.x, enemy.y, 50, 50);
    });

    ctx.fillStyle = '#654321';
    gameState.platforms.forEach(plat => {
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
    });
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

document.getElementById('startGame').addEventListener('click', () => {
    const name = document.getElementById('playerName').value;
    if (!name) return alert('Введите ник!');
    
    gameState.player.health = 3;
    gameState.player.score = 0;
    gameState.enemies = [];
    
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