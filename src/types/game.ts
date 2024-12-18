// // // src/types/game.ts
// // export interface Player {
// //     address: string;
// //     name: string;
// //   }
  
// //   export interface GameState {
// //     currentDrawer: string;
// //     currentWord: string;
// //     players: Player[];
// //     points: Record<string, number>;
// //     timeLeft: number;
// //     isActive: boolean;
// //   }
  
// //   export interface Message {
// //     player: string;
// //     text: string;
// //     type: 'chat' | 'system' | 'guess';
// //   }
  
// //   export interface DrawLine {
// //     start: Point;
// //     end: Point;
// //   }
  
// //   export interface Point {
// //     x: number;
// //     y: number;
// //   }
  
// //   export interface GameHistory {
// //     gameCode: string;
// //     winner: string;
// //     prizeAmount: bigint;
// //     timestamp: number;
// //   }
  
// //   export interface RoomDetails {
// //     owner: string;
// //     wagerAmount: bigint;
// //     maxPlayers: number;
// //     players: string[];
// //     isActive: boolean;
// //     isCompleted: boolean;
// //     winner: string;
// //   }
  
// //   export interface DrawingSettings {
// //     color: string;
// //     size: number;
// //   }


// // src/types/game.ts
// export interface Player {
//   address: string;
//   name: string;
// }

// export interface GameState {
//   currentDrawer: string;
//   currentWord: string;
//   players: Player[];
//   points: Record<string, number>;
//   timeLeft: number;
//   isActive: boolean;
//   isGameStarted: boolean;
//   roundActive: boolean;
//   owner?: string;
// }

// export interface Message {
//   player: string;
//   text: string;
//   type: 'chat' | 'system' | 'guess';
// }

// export interface DrawLine {
//   start: Point;
//   end: Point;
// }

// export interface Point {
//   x: number;
//   y: number;
// }

// export interface GameHistory {
//   gameCode: string;
//   winner: string;
//   prizeAmount: bigint;
//   timestamp: number;
// }

// export interface RoomDetails {
//   owner: string;
//   wagerAmount: bigint;
//   maxPlayers: number;
//   players: string[];
//   isActive: boolean;
//   isCompleted: boolean;
//   winner: string;
// }

// export interface DrawingSettings {
//   color: string;
//   size: number;
// }

// export interface GameStartEvent {
//   drawer: string;
//   word: string;
//   timeLeft: number;
// }

// export interface RoundStartEvent {
//   drawer: string;
//   word: string;
//   timeLeft: number;
// }

// export interface RoundEndEvent {
//   scores: Record<string, number>;
// }

// export interface CorrectGuessEvent {
//   player: string;
//   points: number;
// }

// export interface GameStateUpdate {
//   currentDrawer: string;
//   currentWord: string;
//   timeLeft: number;
//   players: Player[];
//   points: Record<string, number>;
//   isActive: boolean;
//   isGameStarted: boolean;
//   roundActive: boolean;
//   owner?: string;
// }

// export interface DrawUpdate {
//   lines: DrawLine[];
// }

// export interface ServerToClientEvents {
//   gameState: (state: GameState) => void;
//   gameStarted: (data: GameStartEvent) => void;
//   roundStart: (data: RoundStartEvent) => void;
//   roundEnd: (data: RoundEndEvent) => void;
//   correctGuess: (data: CorrectGuessEvent) => void;
//   drawUpdate: (data: DrawUpdate) => void;
//   timeUpdate: (timeLeft: number) => void;
//   error: (error: { message: string }) => void;
// }

// export interface ClientToServerEvents {
//   startGame: () => void;
//   draw: (data: DrawUpdate) => void;
//   guess: (guess: string) => void;
//   chat: (message: string) => void;
// }





// src/types/game.ts
import { Address } from 'viem';

export interface Player {
  address: string;
  name: string;
}

export interface GameState {
  currentWord: string;
  currentDrawer: string;
  players: Player[];
  points: Record<string, number>;
  timeLeft: number;
  isActive: boolean;
  isGameStarted: boolean;
  roundActive: boolean;
  playersWhoDrawn: string[];
  correctGuessers: string[];
}

export interface Message {
  player: string;
  text: string;
  type: 'chat' | 'system' | 'guess';
}

export interface DrawLine {
  start: Point;
  end: Point;
}

export interface Point {
  x: number;
  y: number;
}

export interface GameHistory {
  gameCode: string;
  winner: string;
  prizeAmount: bigint;
  timestamp: number;
  transactionHash?: string;
}

export interface RoomDetails {
  owner: string;
  wagerAmount: bigint;
  maxPlayers: number;
  players: string[];
  isActive: boolean;
  isCompleted: boolean;
  winner: string;
}

export interface DrawingSettings {
  color: string;
  size: number;
}

export interface ServerToClientEvents {
  gameState: (state: GameState) => void;
  roundStart: (data: { drawer: string; word: string; timeLeft: number }) => void;
  roundEnd: (data: { scores: Record<string, number>; nextDrawer: string; word: string }) => void;
  gameEnd: (data: { winner: string; points: Record<string, number>; totalPrize: bigint }) => void;
  timeUpdate: (time: number) => void;
  correctGuess: (data: { player: string; points: number }) => void;
  wrongGuess: (data: { guess: string }) => void;
  chatMessage: Message;
  drawUpdate: { lines: DrawLine[] };
}

export interface ClientToServerEvents {
  guess: (guess: string) => void;
  draw: (data: { lines: DrawLine[] }) => void;
  startGame: () => void;
  chatMessage: (message: string) => void;
}