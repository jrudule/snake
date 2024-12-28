const canvas = document.getElementById('gameCanvas');
const grid = canvas.getContext('2d');

const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const howToPlayButton = document.getElementById('howToPlayButton');
const widthButtons = document.querySelectorAll('.width-button');
const restartButton = document.getElementById('restartButton');

const scoreDisplay = document.getElementById('scoreDisplay');
const scoreElement = document.getElementById('score');
const gameOverScreen = document.getElementById('gameOverScreen');
const overlay = document.getElementById('overlay');
const finalScoreElement = document.getElementById('finalScore');
const rules = document.querySelector('.rules');
const x = document.querySelector('.x');

let box = 20; // Size of each grid unit
let snake;
let direction;
let food;
let score;
let game;
let selectedWidth = 400; // Default canvas width

// To load the apple image
const appleImg = new Image();
appleImg.src = 'apple.png';

// Variables to track the start position of the swipe
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

// To detect the start of the touch (when the user touches the screen)
canvas.addEventListener('touchstart', function (event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
}, false);

// To detect the movement of the touch
canvas.addEventListener('touchmove', function (event) {
    touchEndX = event.touches[0].clientX;
    touchEndY = event.touches[0].clientY;
}, false);

// To detect the end of the touch and calculate swipe direction
canvas.addEventListener('touchend', function () {
    handleSwipe();
}, false);

// To handle swipe and change snake direction
function handleSwipe() {
  let swipeX = touchEndX - touchStartX;
  let swipeY = touchEndY - touchStartY;

  if (Math.abs(swipeX) > Math.abs(swipeY)) {
      // Horizontal swipe
      if (swipeX > 0 && direction !== 'LEFT') {
          direction = 'RIGHT';
      } else if (swipeX < 0 && direction !== 'RIGHT') {
          direction = 'LEFT';
      }
  } else {
      // Vertical swipe
      if (swipeY > 0 && direction !== 'UP') {
          direction = 'DOWN';
      } else if (swipeY < 0 && direction !== 'DOWN') {
          direction = 'UP';
      }
  }
}

// To check if the device supports touch
if ('ontouchstart' in window) {
  canvas.addEventListener('touchstart', function (event) {
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
  }, false);

  canvas.addEventListener('touchmove', function (event) {
      touchEndX = event.touches[0].clientX;
      touchEndY = event.touches[0].clientY;
  }, false);

  canvas.addEventListener('touchend', function () {
      handleSwipe();
  }, false);
}

// To control snake direction
document.addEventListener('keydown', changeDirection);

function changeDirection(event) {
  const key = event.keyCode;
  if ((key === 37 || key === 65) && direction !== 'RIGHT') direction = 'LEFT';
  else if ((key === 38 || key === 87) && direction !== 'DOWN') direction = 'UP';
  else if ((key === 39 || key === 68) && direction !== 'LEFT') direction = 'RIGHT';
  else if ((key === 40 || key === 83) && direction !== 'UP') direction = 'DOWN';
}

widthButtons.forEach(button => {
  button.addEventListener('click', () => {
    selectedWidth = parseInt(button.getAttribute('data-width'));
  });
});

startButton.addEventListener('click', startGame);

howToPlayButton.addEventListener('click', () => {
  rules.style.display = 'block';
  overlay.style.display = 'block';
});

x.addEventListener('click', () => {
  rules.style.display = 'none';
  overlay.style.display = 'none';
});

restartButton.addEventListener('click', restartGame);

function startGame() {
  // To set canvas dimensions based on the selected width
  if (window.innerWidth > 1210) {
    canvas.width = selectedWidth;
    canvas.height = 600;

  } else if (window.innerWidth < 1210) {
    canvas.width = selectedWidth;
    canvas.height = 500;
  }

  if (selectedWidth === 300) {
    box = Math.floor(canvas.width / 20); // To adjust grid size
    canvas.height = 420;
  }

  // To initialize the game state
  snake = [{ x: 9 * box, y: 10 * box }];
  direction = 'RIGHT';
  score = 0;
  food = {
    x: Math.floor(Math.random() * (canvas.width / box)) * box,
    y: Math.floor(Math.random() * (canvas.height / box)) * box,
  };

  startScreen.style.display = 'none';
  canvas.style.display = 'block'; 
  scoreDisplay.style.display = 'block';
  gameOverScreen.style.display = 'none';
  scoreElement.textContent = score;

  clearInterval(game);
  game = setInterval(draw, 100);
}

function drawGrid() {
  grid.strokeStyle = 'white';
  grid.lineWidth = 1;
  
  // Vertical grid lines
  for (let x = 0; x <= canvas.width; x += box) {
    grid.beginPath();
    grid.moveTo(x, 0);
    grid.lineTo(x, canvas.height);
    grid.stroke();
  }

  // Horizontal grid lines
  for (let y = 0; y <= canvas.height; y += box) {
    grid.beginPath();
    grid.moveTo(0, y);
    grid.lineTo(canvas.width, y);
    grid.stroke();
  }
}

// To put everything on the canvas
function draw() {
    grid.clearRect(0, 0, canvas.width, canvas.height);

    drawGrid();
  
    // To draw the snake as green circles
    for (let i = 0; i < snake.length; i++) {
      grid.beginPath();
      grid.arc(
        snake[i].x + box / 2, // x-coordinate (center of the circle)
        snake[i].y + box / 2, // y-coordinate (center of the circle)
        box / 2,              // radius of the circle
        0,                    // start angle (0 degrees)
        Math.PI * 2           // end angle (360 degrees)
      );
      grid.fillStyle = i === 0 ? 'green' : 'lightgreen'; // So head is green, but the rest is light green
      grid.fill();
      grid.strokeStyle = 'darkgreen';
      grid.stroke();
    }

  grid.drawImage(appleImg, food.x, food.y, box, box);

  // Snake movement
  let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  if (direction === 'LEFT') snakeX -= box;
  if (direction === 'UP') snakeY -= box;
  if (direction === 'RIGHT') snakeX += box;
  if (direction === 'DOWN') snakeY += box;

  // Check if snake eats the food
  if (snakeX === food.x && snakeY === food.y) {
    score++;
    scoreElement.textContent = score;
    food = {
      x: Math.floor(Math.random() * (canvas.width / box)) * box,
      y: Math.floor(Math.random() * (canvas.height / box)) * box,
    };
  } else {
    // Remove the tail
    snake.pop();
  }

  // Add new head
  let newHead = { x: snakeX, y: snakeY };

  if (
    snakeX < 0 ||
    snakeY < 0 ||
    snakeX >= canvas.width ||
    snakeY >= canvas.height ||
    collision(newHead, snake)
  ) {
    clearInterval(game); // To stop the game
    gameOver();
    return;
  }

  snake.unshift(newHead);
}

// Check collision with itself
function collision(head, array) {
  for (let i = 0; i < array.length; i++) {
    if (head.x === array[i].x && head.y === array[i].y) {
      return true;
    }
  }
  return false;
}

function gameOver() {
  scoreDisplay.style.display = 'none';
  gameOverScreen.style.display = 'block';
  overlay.style.display = 'block';
  finalScoreElement.textContent = score;
}

function restartGame() {
  startScreen.style.display = 'flex';
  canvas.style.display = 'none';
  scoreDisplay.style.display = 'none';
  gameOverScreen.style.display = 'none';
  overlay.style.display = 'none';
}
