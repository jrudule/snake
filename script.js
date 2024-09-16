// Select the canvas and set up context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const body = document.querySelector('body');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const widthButtons = document.querySelectorAll('.width-button');
const scoreDisplay = document.getElementById('scoreDisplay');
const scoreElement = document.getElementById('score');
const gameOverScreen = document.getElementById('gameOverScreen');
const overlay = document.getElementById('overlay');
const finalScoreElement = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');


// Game variables
let box = 20; // Size of each grid unit
let snake;
let direction;
let food;
let score;
let game; // To store the game interval
let selectedWidth = 400; // Default canvas width

// Load the apple image
const appleImg = new Image();
appleImg.src = 'apple.png'; // Path to your apple image

// Variables to track the start position of the swipe
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

// Detect the start of the touch (when the user touches the screen)
canvas.addEventListener('touchstart', function (event) {
    touchStartX = event.touches[0].clientX;
    touchStartY = event.touches[0].clientY;
}, false);

// Detect the movement of the touch
canvas.addEventListener('touchmove', function (event) {
    touchEndX = event.touches[0].clientX;
    touchEndY = event.touches[0].clientY;
}, false);

// Detect the end of the touch and calculate swipe direction
canvas.addEventListener('touchend', function () {
    handleSwipe();
}, false);

// Function to handle swipe and change snake direction
function handleSwipe() {
    let swipeX = touchEndX - touchStartX;
    let swipeY = touchEndY - touchStartY;

    if (Math.abs(swipeX) > Math.abs(swipeY)) {
        // Horizontal swipe
        if (swipeX > 0 && direction !== 'LEFT') {
            direction = 'RIGHT'; // Right swipe
        } else if (swipeX < 0 && direction !== 'RIGHT') {
            direction = 'LEFT'; // Left swipe
        }
    } else {
        // Vertical swipe
        if (swipeY > 0 && direction !== 'UP') {
            direction = 'DOWN'; // Down swipe
        } else if (swipeY < 0 && direction !== 'DOWN') {
            direction = 'UP'; // Up swipe
        }
    }
}

// Check if the device supports touch
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


// Control snake direction
document.addEventListener('keydown', changeDirection);

function changeDirection(event) {
  const key = event.keyCode;
  if ((key === 37 || key === 65) && direction !== 'RIGHT') direction = 'LEFT';
  else if ((key === 38 || key === 87) && direction !== 'DOWN') direction = 'UP';
  else if ((key === 39 || key === 68) && direction !== 'LEFT') direction = 'RIGHT';
  else if ((key === 40 || key === 83) && direction !== 'UP') direction = 'DOWN';
}

// Add event listeners to the width selection buttons
widthButtons.forEach(button => {
  button.addEventListener('click', () => {
    selectedWidth = parseInt(button.getAttribute('data-width'));
  });
});

// Start the game when the "Start Game" button is clicked
startButton.addEventListener('click', startGame);

// Restart the game after game over
restartButton.addEventListener('click', restartGame);



function startGame() {

    // Set canvas dimensions based on the selected width
    if (window.innerWidth > 1210) {
      // Landscape mode or desktop: use default or specified size
      canvas.width = selectedWidth; // This comes from your button selection logic
      canvas.height = 600; // Fixed height, as you specified

    } else if (window.innerWidth < 1210) {
      canvas.width = selectedWidth;
      canvas.height = 500;
    }

    if (selectedWidth === 300) {
      box = Math.floor(canvas.width / 20); // Adjust grid size
      canvas.height = 420;
    }

    // Initialize the game state
    snake = [{ x: 9 * box, y: 10 * box }]; // Reset snake position
    direction = 'RIGHT'; // Reset direction
    score = 0; // Reset score
    food = {
      x: Math.floor(Math.random() * (canvas.width / box)) * box,
      y: Math.floor(Math.random() * (canvas.height / box)) * box,
    };

    // Display elements
    body.height = '-webkit-fill-available';
    startScreen.style.display = 'none'; // Hide the start screen
    canvas.style.display = 'block'; // Show the game canvas
    scoreDisplay.style.display = 'block'; // Show the score display
    gameOverScreen.style.display = 'none';

    scoreElement.textContent = score;
  
    // Clear any existing game intervals and start a new one
    clearInterval(game);
    game = setInterval(draw, 100); // Start the game loop
}

// Function to draw the grid
function drawGrid() {
    ctx.strokeStyle = 'white'; // Light color for the grid
    ctx.lineWidth = 1;
  
    // Vertical grid lines
    for (let x = 0; x <= canvas.width; x += box) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
  
    // Horizontal grid lines
    for (let y = 0; y <= canvas.height; y += box) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }
  

// Draw everything on the canvas
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the grid
    drawGrid();
  
    // Draw the snake as green circles
    for (let i = 0; i < snake.length; i++) {
      ctx.beginPath();
      ctx.arc(
        snake[i].x + box / 2, // x-coordinate (center of the circle)
        snake[i].y + box / 2, // y-coordinate (center of the circle)
        box / 2,              // radius of the circle
        0,                    // start angle (0 degrees)
        Math.PI * 2           // end angle (360 degrees)
      );
      ctx.fillStyle = i === 0 ? 'green' : 'lightgreen'; // Head is green, rest is light green
      ctx.fill();
      ctx.strokeStyle = 'darkgreen';
      ctx.stroke();
    }

  // Draw the food as an apple image
  ctx.drawImage(appleImg, food.x, food.y, box, box);

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
    scoreElement.textContent = score; // Update the score outside of the canvas
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
    clearInterval(game); // Stop the game
    gameOver(); // Call game over function
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

// Function to handle game over
function gameOver() {
    // Hide the game canvas and score display, show game over screen
    scoreDisplay.style.display = 'none';
    gameOverScreen.style.display = 'block';
    overlay.style.display = 'block';
  
    // Display the final score
    finalScoreElement.textContent = score;
}

function restartGame() {
    body.height = '100vh';
    startScreen.style.display = 'flex';
    canvas.style.display = 'none';
    scoreDisplay.style.display = 'none';
    gameOverScreen.style.display = 'none';
    overlay.style.display = 'none';
}
