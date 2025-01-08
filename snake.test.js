const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const { expect, test, beforeEach } = require("@jest/globals");

const html = fs.readFileSync(path.resolve(__dirname, "index.html"), "utf8");
const js = fs.readFileSync(path.resolve(__dirname, "script.js"), "utf8");

let dom;
let document;
let window;

beforeEach(() => {
    dom = new JSDOM(html, { runScripts: "dangerously", resources: "usable" });
    document = dom.window.document;
    window = dom.window;

    const scriptEl = document.createElement("script");
    scriptEl.textContent = js;
    document.body.appendChild(scriptEl);

    // Set up a mock for the canvas element
    document.body.innerHTML = `<canvas id="gameCanvas"></canvas>`;
    
    const canvas = document.getElementById('gameCanvas');
    
    // Mock the getContext method
    const mockContext = {
        clearRect: jest.fn(),
        beginPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
        stroke: jest.fn(),
    };
    
    canvas.getContext = jest.fn().mockReturnValue(mockContext);
});

test("T_C-1: Select desired canvas size", () => {
    document.addEventListener('DOMContentLoaded', function () {
        const widthButtons = document.querySelectorAll(".width-button");
        widthButtons[0].click();

        const selectedWidth = parseInt(widthButtons[0].getAttribute("data-width"));
        expect(window.selectedWidth).toBe(selectedWidth);
        expect(widthButtons[0].classList.contains("selected")).toBe(true);
    });
});

test("T_C-2: Start game", () => {
    document.addEventListener('DOMContentLoaded', function () {
        const startButton = document.getElementById("startButton");
        const startScreen = document.getElementById("startScreen");
        const canvas = document.getElementById("gameCanvas");
        const scoreDisplay = document.getElementById("scoreDisplay");

        startButton.click();

        expect(startScreen.style.display).toBe("none");
        expect(canvas.style.display).toBe("block");
        expect(scoreDisplay.style.display).toBe("block");
    });
});

test("T_C-3: Change snake direction", () => {
    document.addEventListener('DOMContentLoaded', function () {
        // Right arrow
        const keydownEvent = new dom.window.KeyboardEvent("keydown", { keyCode: 39 }); 

        document.dispatchEvent(keydownEvent);
        expect(window.direction).toBe("RIGHT");

        // Left arrow (opposite)
        const invalidEvent = new dom.window.KeyboardEvent("keydown", { keyCode: 37 }); 
        document.dispatchEvent(invalidEvent);

        // Should remain unchanged
        expect(window.direction).toBe("RIGHT"); 
    });
});

test("T_C-4: Earn a point and grow snake", () => {
    document.addEventListener('DOMContentLoaded', function () {
        const initialScore = window.score;
        const initialLength = window.snake.length;

        // Simulate eating food
        window.snake[0].x = window.food.x;
        window.snake[0].y = window.food.y;
        window.draw();

        expect(window.score).toBe(initialScore + 1);
        expect(window.snake.length).toBe(initialLength + 1);
    });
});

test("T_C-5.1: End game when snake hits wall", () => {
    document.addEventListener('DOMContentLoaded', function () {
        const canvas = document.getElementById("gameCanvas");

        // Simulate snake hitting the right wall
        window.snake[0].x = canvas.width;
        window.draw();

        expect(window.gameOverScreen.style.display).toBe("block");
        expect(window.overlay.style.display).toBe("block");
    });
});

test("T_C-5.2: End game when snake hits its tail", () => {
    document.addEventListener('DOMContentLoaded', function () {
        const canvas = document.getElementById("gameCanvas");

        // Initialize the snake's body with at least two segments
        window.snake = [
            { x: 10, y: 10 },
            { x: 20, y: 10 }
        ];

        // Simulate snake moving into its own tail
        window.snake[0].x = window.snake[1].x;
        window.snake[0].y = window.snake[1].y;

        // Trigger the draw function to check the game-over condition
        window.draw();

        // Expect the game over screen to be displayed
        expect(window.gameOverScreen.style.display).toBe("block");
        expect(window.overlay.style.display).toBe("block");
    });
});

test("T_C-6: Restart game", () => {
    document.addEventListener('DOMContentLoaded', function () {
        const restartButton = document.getElementById("restartButton");
        const startScreen = document.getElementById("startScreen");
        const canvas = document.getElementById("gameCanvas");
        const scoreDisplay = document.getElementById("scoreDisplay");

        restartButton.click();

        expect(startScreen.style.display).toBe("flex");
        expect(canvas.style.display).toBe("none");
        expect(scoreDisplay.style.display).toBe("none");
    });
});

test("T_C-7: View game rules", () => {
    document.addEventListener('DOMContentLoaded', function () {
        const howToPlayButton = document.getElementById("howToPlayButton");
        const rules = document.querySelector(".rules");
        const overlay = document.getElementById("overlay");

        howToPlayButton.click();

        expect(rules.style.display).toBe("block");
        expect(overlay.style.display).toBe("block");
    });
});

test("T_C-8: Hide game rules", () => {
    document.addEventListener('DOMContentLoaded', function () {
        const xButton = document.querySelector(".x");
        const rules = document.querySelector(".rules");
        const overlay = document.getElementById("overlay");

        xButton.click();

        expect(rules.style.display).toBe("none");
        expect(overlay.style.display).toBe("none");
    });
});
