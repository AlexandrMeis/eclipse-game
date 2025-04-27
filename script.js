const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Настройки игры
const SCALE = 1.8; // Масштаб всех объектов
let isGameActive = false;
let gameLoopID = null;

// Размеры объектов
const config = {
    player: { width: 80*SCALE, height: 120*SCALE },
    enemy: { width: 100*SCALE, height: 100*SCALE },
    platform: { height: 60*SCALE },
    jumpForce: -25*SCALE,
    gravity: 0.9
};

// Инициализация размеров
function initGameSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

initGameSize();
window.addEventListener('resize', initGameSize);

// Состояние игры
let gameState = {
    player: {
        x: 0,
        y: 0,
        width: config.player.width,
        height: config.player.height,
        health: 3,
        score: 0,
        yVelocity: 0,
        isAttacking: false,
        isJumping: false
    },
    enemies: [],
    platforms: [],
    physics: {
        gravity: config.gravity,
        jumpForce: config.jumpForce,
        isGrounded: false
    }
};

// Загрузка ресурсов
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

let loadedResources = 0;
let totalResources = Object.keys(images).length + 2; // +2 аудио файла

// Пути к файлам
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
    if (!isGameActive) return;
    if (e.key === 'a') keys.a = true;
    if (e.key === 'd') keys.d = true;
    if (e.key === 'w' || e.key === ' ') keys.w = true;
});

document.addEventListener('keyup', (e) => {
    if (!isGameActive) return;
    if (e.key === 'a') keys.a = false;
    if (e.key === 'd') keys.d = false;
    if (e.key === 'w' || e.key === ' ') keys.w = false;
});

// Игровая логика
function initGame() {
    gameState = {
        player: {
            x: canvas.width/2 - config.player.width/2,
            y: canvas.height - 300,
            width: config.player.width,
            height: config.player.height,
            health: 3,
            score: 0,
            yVelocity: 0,
            isAttacking: false,
            isJumping: false
        },
        enemies: [],
        platforms: [{
            x: 0,
            y: canvas.height - config.platform.height,
            width: canvas.width,
            height: config.platform.height,
            type: 'stone'
        }],
        physics: {
            gravity: config.gravity,
            jumpForce: config.jumpForce,
            isGrounded: false
        }
    };
}

function updateHearts() {
    const healthDiv = document.getElementById('health');
    healthDiv.innerHTML = '';
    for (let i = 0; i < gameState.player.health; i++) {
        const img = new Image();
        img.src = images.heart.src;
        img.className = 'heart-icon';
        healthDiv.appendChild(img);
    }
}

function collision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function checkCollisions() {
    // Платформы
    gameState.physics.isGrounded = false;
    gameState.platforms.forEach(plat => {
        if (collision({...gameState.player, height: gameState.player.height + 5}, plat)) {
            gameState.physics.isGrounded = true;
            gameState.player.yVelocity = 0;
            gameState.player.y = plat.y - gameState.player.height;
        }
    });

    // Падение
    if (gameState.player.y > canvas.height) gameOver();

    // Враги
    gameState.enemies.forEach((enemy, index) => {
        if (collision(enemy, gameState.player)) {
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

function spawnEnemy() {
    const types = ['fudder', 'sybil', 'farmer'];
    const side = Math.random() > 0.5 ? 'left' : 'right';
    
    gameState.enemies.push({
        x: side === 'left' ? -config.enemy.width : canvas.width,
        y: canvas.height - config.platform.height - config.enemy.height,
        type: types[Math.floor(Math.random() * 3)],
        speed: side === 'left' ? 3 : -3,
        width: config.enemy.width,
        height: config.enemy.height
    });
}

function attack() {
    if (!gameState.player.isAttacking) {
        gameState.player.isAttacking = true;
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

function gameOver() {
    isGameActive = false;
    cancelAnimationFrame(gameLoopID);
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('deathScreen').classList.remove('hidden');
    document.getElementById('finalName').textContent = 
        document.getElementById('playerName').value;
    document.getElementById('finalScore').textContent = gameState.player.score;
}

function update() {
    if (keys.w) jump();
    if (keys.a) gameState.player.x -= 5;
    if (keys.d) gameState.player.x += 5;

    gameState.player.x = Math.max(0, Math.min(canvas.width - gameState.player.width, gameState.player.x));
    gameState.player.y += gameState.player.yVelocity;
    gameState.player.yVelocity += gameState.physics.gravity;

    if (Date.now() - (gameState.lastSpawn || 0) > 2000) {
        spawnEnemy();
        gameState.lastSpawn = Date.now();
    }

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
    
    ctx.drawImage(img, gameState.player.x, gameState.player.y, gameState.player.width, gameState.player.height);

    // Враги
    gameState.enemies.forEach(enemy => {
        ctx.drawImage(images[enemy.type], enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

function gameLoop() {
    update();
    draw();
    gameLoopID = requestAnimationFrame(gameLoop);
}

// Обработчики событий
document.getElementById('startGame').addEventListener('click', () => {
    const name = document.getElementById('playerName').value.trim();
    if (!name) return alert('Введите ник!');

    loadedResources = 0;
    document.getElementById('preloader').classList.remove('hidden');

    // Загрузка ресурсов
    const loadCheck = setInterval(() => {
        if (loadedResources >= totalResources) {
            clearInterval(loadCheck);
            
            // 5-секундный отсчет
            let count = 5;
            const countdownInterval = setInterval(() => {
                document.getElementById('countdown').textContent = count--;
                if (count < 0) {
                    clearInterval(countdownInterval);
                    document.getElementById('preloader').classList.add('hidden');
                    document.getElementById('mainMenu').classList.add('hidden');
                    document.getElementById('gameScreen').classList.remove('hidden');
                    initGame();
                    updateHearts();
                    isGameActive = true;
                    gameLoop();
                }
            }, 1000);
        }
    }, 100);
});

document.getElementById('newGame').addEventListener('click', () => {
    document.getElementById('deathScreen').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
});

document.getElementById('skipIntro').addEventListener('click', () => {
    document.getElementById('introScreen').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
    document.getElementById('introVideo').pause();
});

// Автозагрузка ресурсов
Object.values(images).forEach(img => {
    img.onload = () => {
        loadedResources++;
        document.querySelector('#loadingBar::after').style.width = 
            `${(loadedResources / totalResources) * 100}%`;
    };
    img.onerror = () => console.error('Ошибка загрузки:', img.src);
});

document.getElementById('attackSound').onloadeddata = 
document.getElementById('jumpSound').onloadeddata = () => {
    loadedResources++;
    document.querySelector('#loadingBar::after').style.width = 
        `${(loadedResources / totalResources) * 100}%`;
};

// Запуск видео
document.getElementById('introVideo').play().catch(() => {
    document.getElementById('introScreen').classList.add('hidden');
    document.getElementById('mainMenu').classList.remove('hidden');
});

canvas.addEventListener('click', attack);