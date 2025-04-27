const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Настройки размеров
const SCALE = 2; // Измените это значение для масштабирования
let isGameActive = false;

// Размеры объектов
const config = {
    player: { width: 80*SCALE, height: 120*SCALE },
    enemy: { width: 100*SCALE, height: 100*SCALE },
    platform: { height: 60*SCALE }
};

// Инициализация размеров
function initGameSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    gameState.platforms[0] = {
        x: 0,
        y: canvas.height - config.platform.height,
        width: canvas.width,
        height: config.platform.height,
        type: 'stone'
    };
}

initGameSize();
window.addEventListener('resize', initGameSize);

// Состояние игры
let gameState = {
    player: {
        x: canvas.width/2 - config.player.width/2,
        y: canvas.height - 200,
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
        gravity: 0.8,
        jumpForce: -20*SCALE,
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
const totalResources = Object.keys(images).length + 2;

function updateProgress() {
    loadedResources++;
    const progress = (loadedResources / totalResources) * 100;
    document.querySelector('#loadingBar::after').style.width = `${progress}%`;
}

// Пути к файлам
images.knightIdle.src = 'assets/characters/knight_idle.png';
images.knightAttack.src = 'assets/characters/knight_attack.png';
images.knightJump.src = 'assets/characters/knight_jump.png';
images.fudder.src = 'assets/characters/fudder_enemy.png';
images.sybil.src = 'assets/characters/sybil_enemy.png';
images.farmer.src = 'assets/characters/farmer_enemy.png';
images.stone.src = 'assets/objects/stone_platform.png';
images.heart.src = 'assets/ui/heart_icon.png';

Object.values(images).forEach(img => {
    img.onload = updateProgress;
    img.onerror = () => console.error('Ошибка загрузки:', img.src);
});

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

function gameOver() {
    isGameActive = false;
    document.getElementById('gameScreen').classList.add('hidden');
    document.getElementById('deathScreen').classList.remove('hidden');
    document.getElementById('finalName').textContent = 
        document.getElementById('playerName').value;
    document.getElementById('finalScore').textContent = gameState.player.score;
}

function startGame() {
    isGameActive = true;
    gameState = {
        player: {
            x: canvas.width/2 - config.player.width/2,
            y: canvas.height - 200,
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
            gravity: 0.8,
            jumpForce: -20*SCALE,
            isGrounded: false
        }
    };
    updateHearts();
    gameLoop();
}

// Остальной код остаётся аналогичным предыдущей версии
// (коллизии, спавн врагов, отрисовка и т.д.)

// Инициализация
document.getElementById('startGame').addEventListener('click', () => {
    const name = document.getElementById('playerName').value;
    if (!name) return alert('Введите ник!');
    
    document.getElementById('preloader').classList.remove('hidden');
    const checkReady = setInterval(() => {
        if(loadedResources >= totalResources) {
            clearInterval(checkReady);
            let count = 5;
            const countdown = setInterval(() => {
                document.getElementById('countdown').textContent = count--;
                if(count < 0) {
                    clearInterval(countdown);
                    document.getElementById('preloader').classList.add('hidden');
                    startGame();
                }
            }, 1000);
        }
    }, 100);
});

// Остальные обработчики событий...