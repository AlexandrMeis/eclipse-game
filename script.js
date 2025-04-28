const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Загружаем картинки юнитов
const knightImage = new Image();
knightImage.src = 'assets/knights/knight_sword.png';

const fudlingImage = new Image();
fudlingImage.src = 'assets/fudlings/fudling_small.png';

let imagesLoaded = 0;
const totalImages = 2;

// Массивы для юнитов
const knights = [];
const fudlings = [];

// Позиции тестовых юнитов
knights.push({ x: 200, y: 300, img: knightImage });
fudlings.push({ x: 800, y: 300, img: fudlingImage });

// Функция, которая проверяет, что все изображения загрузились
function checkImagesLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        gameLoop(); // Начинаем игру, когда все изображения загружены
    }
}

knightImage.onload = checkImagesLoaded;
fudlingImage.onload = checkImagesLoaded;

// Основной игровой цикл
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, can
