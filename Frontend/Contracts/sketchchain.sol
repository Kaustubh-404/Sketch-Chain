// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Web3DrawingGame is Ownable, ReentrancyGuard {
    // Game room structure
    struct GameRoom {
        address roomCreator;
        uint256 wagerAmount;
        uint256 maxPlayers;
        uint256 currentPlayerCount;
        bool isActive;
        address[] players;
        mapping(address => PlayerInfo) playerInfos;
        address winner;
        uint256 totalPot;
        uint256 roundStartTime;
        uint256 currentRound;
        uint256 totalRounds;
    }

    // Player information structure
    struct PlayerInfo {
        string name;
        uint256 points;
        bool isDrawing;
        bool hasGuessed;
    }

    // Mapping to store game rooms
    mapping(string => GameRoom) public gameRooms;

    // Minimum and maximum wager amounts
    uint256 public constant MIN_WAGER = 1 * 10**18; // 1 USD equivalent in native token
    uint256 public constant MAX_WAGER = 100 * 10**18; // 100 USD equivalent

    // Game configuration
    uint256 public constant ROUND_TIME = 90 seconds; // Combined draw and guess time
    uint256 public constant MAX_ROUNDS = 3; // Total rounds in a game

    // Events
    event RoomCreated(string roomCode, address creator, uint256 wagerAmount, uint256 maxPlayers);
    event PlayerJoined(string roomCode, address player, string playerName);
    event GameStarted(string roomCode);
    event RoundStarted(string roomCode, address currentDrawer, uint256 roundNumber);
    event PlayerDrawn(string roomCode, address player, string word);
    event WordGuessed(string roomCode, address guesser, uint256 points);
    event GameEnded(string roomCode, address winner, uint256 totalPot);
    event RoomClosed(string roomCode);

    // Constructor - pass the initial owner (msg.sender in this case)
    constructor() Ownable(msg.sender) {}

    // Function to create a game room
    function createRoom(
        string memory roomCode,
        uint256 wagerAmount,
        uint256 maxPlayers
    ) external payable nonReentrant {
        require(gameRooms[roomCode].roomCreator == address(0), "Room already exists");
        require(maxPlayers > 1, "At least 2 players required");
        require(wagerAmount >= MIN_WAGER && wagerAmount <= MAX_WAGER, "Invalid wager amount");
        require(msg.value == wagerAmount, "Incorrect wager amount sent");

        GameRoom storage newRoom = gameRooms[roomCode];
        newRoom.roomCreator = msg.sender;
        newRoom.wagerAmount = wagerAmount;
        newRoom.maxPlayers = maxPlayers;
        newRoom.isActive = true;
        newRoom.players.push(msg.sender);
        newRoom.currentPlayerCount = 1;
        newRoom.totalPot = wagerAmount;

        emit RoomCreated(roomCode, msg.sender, wagerAmount, maxPlayers);
    }

    // Function for players to join a game room
    function joinRoom(string memory roomCode, string memory playerName) external payable nonReentrant {
        GameRoom storage room = gameRooms[roomCode];
        require(room.isActive, "Room is not active");
        require(room.currentPlayerCount < room.maxPlayers, "Room is full");
        require(msg.value == room.wagerAmount, "Incorrect wager amount");

        room.players.push(msg.sender);
        room.playerInfos[msg.sender] = PlayerInfo(playerName, 0, false, false);
        room.currentPlayerCount++;
        room.totalPot += msg.value;

        emit PlayerJoined(roomCode, msg.sender, playerName);
    }

    // Function to start the game
    function startGame(string memory roomCode) external onlyOwner {
        GameRoom storage room = gameRooms[roomCode];
        require(room.isActive, "Room is not active");
        require(room.currentPlayerCount > 1, "Not enough players to start");

        room.currentRound = 1;
        room.totalRounds = MAX_ROUNDS;

        emit GameStarted(roomCode);
        startRound(roomCode);
    }

    // Function to start a round
    function startRound(string memory roomCode) internal {
        GameRoom storage room = gameRooms[roomCode];
        require(room.isActive, "Room is not active");

        uint256 drawerIndex = (room.currentRound - 1) % room.currentPlayerCount;
        address currentDrawer = room.players[drawerIndex];
        room.roundStartTime = block.timestamp;

        emit RoundStarted(roomCode, currentDrawer, room.currentRound);
    }

    // Function to handle the end of the game
    function endGame(string memory roomCode) external onlyOwner {
        GameRoom storage room = gameRooms[roomCode];
        require(room.isActive, "Room is not active");

        room.isActive = false;
        address winner = determineWinner(roomCode);
        room.winner = winner;

        payable(winner).transfer(room.totalPot);
        emit GameEnded(roomCode, winner, room.totalPot);
    }

    // Helper function to determine the winner
    function determineWinner(string memory roomCode) internal view returns (address) {
        GameRoom storage room = gameRooms[roomCode];
        address winner;
        uint256 highestPoints = 0;

        for (uint256 i = 0; i < room.players.length; i++) {
            address player = room.players[i];
            uint256 points = room.playerInfos[player].points;

            if (points > highestPoints) {
                highestPoints = points;
                winner = player;
            }
        }

        return winner;
    }

    // Function to close a room
    function closeRoom(string memory roomCode) external onlyOwner {
        GameRoom storage room = gameRooms[roomCode];
        require(room.isActive, "Room is not active");

        room.isActive = false;
        emit RoomClosed(roomCode);
    }
}
