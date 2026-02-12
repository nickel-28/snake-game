import { useEffect, useState } from "react";

const GRID_SIZE = 20;
const BONUS_DURATION = 10;

const INITIAL_SNAKE = [
  { x: 8, y: 8 },
  { x: 7, y: 8 },
];

export default function App() {
  const eatSound = new Audio("/eat.mp3");
  const bonusSound = new Audio("/bonus.mp3");
  const gameOverSound = new Audio("/gameOver.mp3");

  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState(generateRandomPosition());
  const [obstacles, setObstacles] = useState(generateObstacles());
  const [direction, setDirection] = useState("RIGHT");

  const [gameStatus, setGameStatus] = useState("START");
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(200);
  const [darkMode, setDarkMode] = useState(false);

  const [foodType, setFoodType] = useState("normal");
  const [foodCount, setFoodCount] = useState(0);
  const [bonusTimer, setBonusTimer] = useState(0);

  const [playerName, setPlayerName] = useState("");

  const [highScore, setHighScore] = useState(
    Number(localStorage.getItem("highScore")) || 0
  );

  function generateRandomPosition() {
    return {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  }

  function generateObstacles() {
    let obs = [];
    for (let i = 0; i < 10; i++) {
      obs.push(generateRandomPosition());
    }
    return obs;
  }

  // High score update
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("highScore", score);
    }
  }, [score, highScore]);

  // Bonus countdown
  useEffect(() => {
    if (foodType !== "bonus") return;

    if (bonusTimer <= 0) {
      setFoodType("normal");
      return;
    }

    const timer = setTimeout(() => {
      setBonusTimer((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [bonusTimer, foodType]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e) => {
      switch (e.key) {
        case "ArrowUp":
          if (direction !== "DOWN") setDirection("UP");
          break;
        case "ArrowDown":
          if (direction !== "UP") setDirection("DOWN");
          break;
        case "ArrowLeft":
          if (direction !== "RIGHT") setDirection("LEFT");
          break;
        case "ArrowRight":
          if (direction !== "LEFT") setDirection("RIGHT");
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [direction]);

  // Game loop
  useEffect(() => {
    if (gameStatus !== "PLAYING") return;

    const interval = setInterval(() => {
      moveSnake();
    }, speed);

    return () => clearInterval(interval);
  }, [snake, direction, speed, gameStatus]);

  const moveSnake = () => {
    const head = { ...snake[0] };

    if (direction === "UP") head.y -= 1;
    if (direction === "DOWN") head.y += 1;
    if (direction === "LEFT") head.x -= 1;
    if (direction === "RIGHT") head.x += 1;

    if (
      head.x < 0 ||
      head.y < 0 ||
      head.x >= GRID_SIZE ||
      head.y >= GRID_SIZE ||
      snake.some((s) => s.x === head.x && s.y === head.y) ||
      obstacles.some((o) => o.x === head.x && o.y === head.y)
    ) {
      gameOverSound.currentTime = 0;
      gameOverSound.play();
      setGameStatus("GAME_OVER");
      return;
    }

    const newSnake = [head, ...snake];

    if (head.x === food.x && head.y === food.y) {
      const newCount = foodCount + 1;
      setFoodCount(newCount);

      if (foodType === "bonus") {
        bonusSound.currentTime = 0;
        bonusSound.play();
        setScore((prev) => prev + 5);
        setFoodType("normal");
        setBonusTimer(0);
      } else {
          eatSound.currentTime = 0;
          eatSound.play();
          setScore((prev) => prev + 1);
      }

      if (newCount % 5 === 0) {
        setFoodType("bonus");
        setBonusTimer(BONUS_DURATION);
      } else {
        setFoodType("normal");
      }

      setFood(generateRandomPosition());
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  };

  const startGame = () => {
    if (!playerName.trim()) return;

    setSnake(INITIAL_SNAKE);
    setFood(generateRandomPosition());
    setObstacles(generateObstacles());
    setDirection("RIGHT");
    setScore(0);
    setSpeed(200);
    setFoodType("normal");
    setFoodCount(0);
    setBonusTimer(0);
    setGameStatus("PLAYING");
  };

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-black"
      }`}
    >
      <h1 className="text-4xl font-bold mb-6">🐍 Snake Game</h1>
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute top-5 right-5 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
      >
        {darkMode ? "Light Mode ☀️" : "Dark Mode 🌙"}
      </button>
      
      {gameStatus === "START" && (
        <div className="text-center">
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="px-4 py-2 border rounded mb-4 text-black"
          />
          <br />
          <button
            onClick={startGame}
            className="px-6 py-3 bg-green-500 text-white rounded-lg"
          >
            Play Game
          </button>
          <p className="mt-4">High Score: {highScore}</p>
        </div>
      )}

      {gameStatus === "PLAYING" && (
        <>
          <div className="flex gap-6 mb-4 text-lg">
            <span>Player: {playerName}</span>
            <span>Score: {score}</span>
            <span>High Score: {highScore}</span>
          </div>

          {foodType === "bonus" && (
            <div className="w-64 mb-4">
              <div className="text-blue-500 font-semibold text-center mb-1">
                Bonus ends in: {bonusTimer}s
              </div>
              <div className="w-full h-3 bg-gray-300 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-1000 ease-linear"
                  style={{
                    width: `${(bonusTimer / BONUS_DURATION) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, 20px)`,
            }}
          >
            {[...Array(GRID_SIZE)].map((_, row) =>
              [...Array(GRID_SIZE)].map((_, col) => {
                const isHead =
                  snake[0].x === col && snake[0].y === row;
                const isBody = snake
                  .slice(1)
                  .some((segment) => segment.x === col && segment.y === row);
                const isFood =
                  food.x === col && food.y === row;
                const isObstacle = obstacles.some(
                  (o) => o.x === col && o.y === row
                );

                return (
                  <div
                    key={`${row}-${col}`}
                    className={`relative w-5 h-5 border flex items-center justify-center transition-all duration-150 ${
                      isHead
                        ? "bg-green-700 rounded-md shadow-md"
                        : isBody
                        ? "bg-green-500 rounded-sm shadow-sm"
                        : isFood
                        ? foodType === "bonus"
                          ? "bg-blue-500 animate-pulse rounded-full"
                          : "bg-red-500 animate-pulse rounded-full"
                        : isObstacle
                        ? "bg-gray-500"
                        : darkMode
                        ? "bg-gray-800"
                        : "bg-white"
                    }`}
                  >
                    {isHead && (
                      <div
                        className={`absolute flex gap-0.5 ${
                          direction === "UP"
                            ? "-translate-y-1"
                            : direction === "DOWN"
                            ? "translate-y-1"
                            : direction === "LEFT"
                            ? "-translate-x-1"
                            : "translate-x-1"
                        }`}
                      >
                        <div className="w-1 h-1 bg-white rounded-full" />
                        <div className="w-1 h-1 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {gameStatus === "GAME_OVER" && (
        <div className="text-center">
          <h2 className="text-2xl text-red-500 mb-2">Game Over</h2>
          <p>Player: {playerName}</p>
          <p>Score: {score}</p>
          <p>High Score: {highScore}</p>
          <button
            onClick={() => setGameStatus("START")}
            className="mt-3 px-6 py-3 bg-green-500 text-white rounded-lg"
          >
            Back to Start
          </button>
        </div>
      )}
    </div>
  );
}
