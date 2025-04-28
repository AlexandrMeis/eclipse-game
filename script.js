// Получаем элемент canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Загружаем фон
const background = new Image();
background.src = 'assets/backgrounds/castle_background.jpg'; // путь к фону

// Загружаем рыцаря
const knight = new Image();
knight.src = 'assets/knights/knight_idle.png'; // путь к изображению рыцаря

// Загружаем врага
const enemy = new Image();
enemy.src = 'assets/characters/farmer_enemy.png'; // путь к изображению врага

// Когда все изображения загружены, рисуем их
background.onload = function () {
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height); // рисуем фон

    knight.onload = function () {
        ctx.drawImage(knight, 100, canvas.height - 150, 100, 150); // рисуем рыцаря
    };

    enemy.onload = function () {
        ctx.drawImage(enemy, canvas.width - 200, canvas.height - 150, 100, 150); // рисуем врага
    };
};
