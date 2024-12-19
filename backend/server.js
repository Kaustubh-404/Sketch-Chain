// backend/server.js
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  credentials: true
}));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Word categories
const WORD_CATEGORIES = {
  animals: ['dog', 'cat', 'elephant', 'giraffe', 'lion', 'tiger', 'penguin'],
  objects: ['chair', 'table', 'lamp', 'phone', 'computer', 'book', 'pencil'],
  food: ['pizza', 'burger', 'sushi', 'pasta', 'sandwich', 'taco', 'cookie']
};

const games = new Map();
const drawings = new Map();
const timers = new Map();

function getRandomWord() {
  const categories = Object.keys(WORD_CATEGORIES);
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  const words = WORD_CATEGORIES[randomCategory];
  return words[Math.floor(Math.random() * words.length)];
}

function checkGameEnd(gameCode) {
  const gameState = games.get(gameCode);
  if (!gameState) return false;

  // Check if all players have drawn
  const allPlayersHaveDrawn = gameState.players.every(player => 
    gameState.playersWhoDrawn.includes(player.address)
  );

  if (allPlayersHaveDrawn) {
    endGame(gameCode);
    return true;
  }
  return false;
}

function startNewRound(gameCode) {
  const gameState = games.get(gameCode);
  if (!gameState || !gameState.isGameStarted) return;

  // Clear existing timer
  if (timers.has(gameCode)) {
    clearInterval(timers.get(gameCode));
  }

  gameState.currentWord = getRandomWord();
  gameState.timeLeft = 90;
  gameState.roundActive = true;
  gameState.correctGuessers = [];
  games.set(gameCode, gameState);

  drawings.set(gameCode, []);

  io.to(gameCode).emit('roundStart', {
    drawer: gameState.currentDrawer,
    word: gameState.currentWord,
    timeLeft: gameState.timeLeft
  });

  const timer = setInterval(() => {
    const currentState = games.get(gameCode);
    if (!currentState || !currentState.roundActive) {
      clearInterval(timer);
      timers.delete(gameCode);
      return;
    }

    currentState.timeLeft--;
    games.set(gameCode, currentState);
    io.to(gameCode).emit('timeUpdate', currentState.timeLeft);

    if (currentState.timeLeft <= 0) {
      clearInterval(timer);
      timers.delete(gameCode);
      endRound(gameCode);
    }
  }, 1000);

  timers.set(gameCode, timer);
}

function endRound(gameCode) {
  const gameState = games.get(gameCode);
  if (!gameState) return;

  if (timers.has(gameCode)) {
    clearInterval(timers.get(gameCode));
    timers.delete(gameCode);
  }

  gameState.roundActive = false;
  gameState.playersWhoDrawn.push(gameState.currentDrawer);
  
  const currentDrawerIndex = gameState.players.findIndex(p => p.address === gameState.currentDrawer);
  const nextDrawerIndex = (currentDrawerIndex + 1) % gameState.players.length;
  gameState.currentDrawer = gameState.players[nextDrawerIndex].address;

  games.set(gameCode, gameState);

  io.to(gameCode).emit('roundEnd', {
    scores: gameState.points,
    nextDrawer: gameState.currentDrawer,
    word: gameState.currentWord // Send the word that was being drawn
  });

  // Check if game should end
  if (!checkGameEnd(gameCode)) {
    setTimeout(() => {
      if (games.has(gameCode)) {
        startNewRound(gameCode);
      }
    }, 3000);
  }
}

function endGame(gameCode) {
  const gameState = games.get(gameCode);
  if (!gameState) return;

  // Find winner
  const winner = Object.entries(gameState.points)
    .reduce((a, b) => (b[1] > a[1] ? b : a));

  io.to(gameCode).emit('gameEnd', {
    winner: winner[0],
    points: gameState.points,
    totalPrize: gameState.wagerAmount * gameState.players.length
  });

  // Cleanup
  games.delete(gameCode);
  drawings.delete(gameCode);
  if (timers.has(gameCode)) {
    clearInterval(timers.get(gameCode));
    timers.delete(gameCode);
  }
}

io.on('connection', (socket) => {
  const { gameCode, address, name } = socket.handshake.query;
  
  if (!gameCode || !address) {
    socket.disconnect();
    return;
  }

  socket.join(gameCode);
  
  if (!games.has(gameCode)) {
    games.set(gameCode, {
      currentDrawer: address,
      currentWord: '',
      players: [{ address, name }],
      points: {},
      timeLeft: 90,
      isActive: false,
      isGameStarted: false,
      roundActive: false,
      playersWhoDrawn: [],
      correctGuessers: [],
      wagerAmount: 0
    });
  } else {
    const gameState = games.get(gameCode);
    if (!gameState.players.find(p => p.address === address)) {
      gameState.players.push({ address, name });
      games.set(gameCode, gameState);
    }
  }

  const gameState = games.get(gameCode);
  io.to(gameCode).emit('gameState', gameState);

  socket.on('startGame', () => {
    const gameState = games.get(gameCode);
    if (!gameState || gameState.isGameStarted) return;

    if (gameState.players.length < 2) {
      socket.emit('error', { message: 'Not enough players' });
      return;
    }

    gameState.isGameStarted = true;
    gameState.isActive = true;
    games.set(gameCode, gameState);

    io.to(gameCode).emit('gameStarted', {
      drawer: gameState.currentDrawer,
      timeLeft: gameState.timeLeft
    });

    startNewRound(gameCode);
  });

  socket.on('guess', (guess) => {
    const gameState = games.get(gameCode);
    if (!gameState?.roundActive || gameState.currentDrawer === address) return;

    // Emit the guess to all players for chat
    io.to(gameCode).emit('chatMessage', {
      player: address,
      text: guess,
      type: 'guess'
    });

    if (guess.toLowerCase() === gameState.currentWord.toLowerCase()) {
      if (!gameState.correctGuessers.includes(address)) {
        const points = Math.ceil((gameState.timeLeft / 90) * 100);
        gameState.points[address] = (gameState.points[address] || 0) + points;
        gameState.correctGuessers.push(address);
        
        io.to(gameCode).emit('correctGuess', {
          player: address,
          points: gameState.points[address]
        });

        // End round if all players have guessed correctly
        if (gameState.correctGuessers.length >= gameState.players.length - 1) {
          endRound(gameCode);
        }
      }
    } else {
      socket.emit('wrongGuess', { guess });
    }
  });

  socket.on('draw', (drawData) => {
    const gameState = games.get(gameCode);
    if (!gameState?.roundActive || gameState.currentDrawer !== address) return;
    socket.to(gameCode).emit('drawUpdate', drawData);
  });

  socket.on('disconnect', () => {
    const gameState = games.get(gameCode);
    if (!gameState) return;

    gameState.players = gameState.players.filter(p => p.address !== address);
    
    if (gameState.players.length === 0) {
      games.delete(gameCode);
      drawings.delete(gameCode);
      if (timers.has(gameCode)) {
        clearInterval(timers.get(gameCode));
        timers.delete(gameCode);
      }
    } else {
      if (gameState.currentDrawer === address) {
        gameState.currentDrawer = gameState.players[0].address;
        if (gameState.roundActive) {
          endRound(gameCode);
        }
      }
      games.set(gameCode, gameState);
      io.to(gameCode).emit('gameState', gameState);
    }
  });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));