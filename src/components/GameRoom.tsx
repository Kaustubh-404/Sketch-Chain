// // // import { useEffect, useState } from 'react';
// // // import { useRouter } from 'next/router';
// // // import { useAccount } from 'wagmi';
// // // import { toast } from 'react-hot-toast';
// // // import { io, Socket } from 'socket.io-client';
// // // import { DrawingCanvas } from './DrawingCanvas';
// // // import { DrawingTools } from './DrawingTools';
// // // import { Chat } from './Chat';
// // // import { LoadingOverlay } from './LoadingOverlay';
// // // import { useScribbleContract } from '@/hooks/useScribbleContract';
// // // import { useGameStore } from '@/store/gameStore';
// // // import { GameState, Player, Message } from '@/types/game';

// // // interface CorrectGuessPayload {
// // //   player: string;
// // //   points: number;
// // // }

// // // interface GameEndPayload {
// // //   winner: string;
// // //   points: Record<string, number>;
// // // }

// // // interface RoundStartPayload {
// // //   drawer: string;
// // //   word: string;
// // // }

// // // export const GameRoom = () => {
// // //   const [socket, setSocket] = useState<Socket | null>(null);
// // //   const [isLoading, setIsLoading] = useState(true);
// // //   const router = useRouter();
// // //   const { address } = useAccount();
// // //   const { updatePoints: updateContractPoints, endGame } = useScribbleContract();
// // //   const {
// // //     currentWord,
// // //     currentDrawer,
// // //     timeLeft,
// // //     points,
// // //     players,
// // //     gameCode,
// // //     isDrawing,
// // //     setCurrentWord,
// // //     setCurrentDrawer,
// // //     setTimeLeft,
// // //     updatePoints,
// // //     setPlayers,
// // //     setGameCode,
// // //     setIsDrawing,
// // //     reset,
// // //   } = useGameStore();

// // //   useEffect(() => {
// // //     console.log('GameRoom Effect - GameCode:', gameCode);
// // //     console.log('GameRoom Effect - Address:', address);
// // //     if (!gameCode || !address) return;

// // //     const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
// // //       query: { gameCode, address },
// // //     });

// // //     socketInstance.on('connect', () => {
// // //       setIsLoading(false);
// // //     });

// // //     socketInstance.on('connect_error', (error) => {
// // //       console.error('Socket connection error:', error);
// // //       toast.error('Failed to connect to game server');
// // //       router.push('/');
// // //     });

// // //     socketInstance.on('gameState', (state: GameState) => {
// // //       setCurrentDrawer(state.currentDrawer);
// // //       setCurrentWord(state.currentWord);
// // //       setTimeLeft(state.timeLeft);
// // //       setPlayers(state.players);
// // //       setIsDrawing(state.currentDrawer === address);
// // //     });

// // //     socketInstance.on('roundStart', ({ drawer, word }: RoundStartPayload) => {
// // //       setCurrentDrawer(drawer);
// // //       if (drawer === address) {
// // //         setCurrentWord(word);
// // //       } else {
// // //         setCurrentWord('');
// // //       }
// // //       setIsDrawing(drawer === address);
// // //       toast.success(`Round started! ${drawer === address ? 'You are drawing!' : 'Start guessing!'}`);
// // //     });

// // //     socketInstance.on('correctGuess', async ({ player, points: newPoints }: CorrectGuessPayload) => {
// // //       try {
// // //         await updateContractPoints(gameCode, newPoints);
// // //         updatePoints(player, newPoints);
// // //         toast.success(`${player === address ? 'You' : 'A player'} guessed correctly!`);
// // //       } catch (error) {
// // //         console.error('Error updating points:', error);
// // //       }
// // //     });

// // //     socketInstance.on('gameEnd', async ({ winner, points: finalPoints }: GameEndPayload) => {
// // //       try {
// // //         await endGame(gameCode);
// // //         if (winner === address) {
// // //           toast.success('🎉 Congratulations! You won the game!');
// // //         } else {
// // //           toast.error('Game Over! Better luck next time!');
// // //         }
// // //         reset();
// // //         router.push('/');
// // //       } catch (error) {
// // //         console.error('Error ending game:', error);
// // //       }
// // //     });

// // //     setSocket(socketInstance);

// // //     return () => {
// // //       socketInstance.disconnect();
// // //     };
// // //   }, [gameCode, address]);

// // //   if (isLoading) {
// // //     return <LoadingOverlay message="Connecting to game..." />;
// // //   }

// // //   return (
// // //     <div className="flex flex-col h-screen">
// // //       <div className="flex justify-between items-center p-4 bg-white shadow">
// // //         <div className="flex items-center space-x-4">
// // //           <h2 className="text-xl font-bold">Game Code: {gameCode}</h2>
// // //           <span className="px-4 py-2 bg-blue-100 rounded">
// // //             Time Left: {timeLeft}s
// // //           </span>
// // //         </div>
// // //         {isDrawing && currentWord && (
// // //           <div className="px-4 py-2 bg-green-100 rounded">
// // //             Word to draw: {currentWord}
// // //           </div>
// // //         )}
// // //       </div>

// // //       <div className="flex flex-1 p-4 space-x-4">
// // //         <div className="w-3/4 flex flex-col space-y-4">
// // //           <DrawingCanvas socket={socket} />
// // //           {isDrawing && <DrawingTools socket={socket} />}
// // //         </div>

// // //         <div className="w-1/4 flex flex-col space-y-4">
// // //           <div className="bg-white rounded-lg shadow p-4">
// // //             <h3 className="text-lg font-semibold mb-4">Players</h3>
// // //             <div className="space-y-2">
// // //               {players.map((player: Player) => (
// // //                 <div
// // //                   key={player.address}
// // //                   className="flex justify-between items-center"
// // //                 >
// // //                   <span className="flex items-center">
// // //                     {player.address === currentDrawer && (
// // //                       <span className="mr-2">🎨</span>
// // //                     )}
// // //                     {player.name || `Player ${player.address.slice(0, 6)}...`}
// // //                   </span>
// // //                   <span className="font-bold">{points[player.address] || 0}</span>
// // //                 </div>
// // //               ))}
// // //             </div>
// // //           </div>
// // //           <Chat socket={socket} />
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // import { useEffect, useState } from 'react';
// // import { useRouter } from 'next/router';
// // import { useAccount } from 'wagmi';
// // import { toast } from 'react-hot-toast';
// // import { io, Socket } from 'socket.io-client';
// // import { DrawingCanvas } from './DrawingCanvas';
// // import { DrawingTools } from './DrawingTools';
// // import { Chat } from './Chat';
// // import { LoadingOverlay } from './LoadingOverlay';
// // import { useScribbleContract } from '@/hooks/useScribbleContract';
// // import { useGameStore } from '@/store/gameStore';
// // import { GameState, Player, Message } from '@/types/game';

// // interface CorrectGuessPayload {
// //   player: string;
// //   points: number;
// // }

// // interface GameEndPayload {
// //   winner: string;
// //   points: Record<string, number>;
// // }

// // interface RoundStartPayload {
// //   drawer: string;
// //   word: string;
// // }

// // export const GameRoom = () => {
// //   const [socket, setSocket] = useState<Socket | null>(null);
// //   const [isLoading, setIsLoading] = useState(true);
// //   const [connectionError, setConnectionError] = useState<string | null>(null);
// //   const router = useRouter();
// //   const { address } = useAccount();
// //   const { updatePoints: updateContractPoints, endGame } = useScribbleContract();
// //   const {
// //     currentWord,
// //     currentDrawer,
// //     timeLeft,
// //     points,
// //     players,
// //     gameCode,
// //     isDrawing,
// //     setCurrentWord,
// //     setCurrentDrawer,
// //     setTimeLeft,
// //     updatePoints,
// //     setPlayers,
// //     setIsDrawing,
// //     reset,
// //   } = useGameStore();

// //   useEffect(() => {
// //     console.log('🔍 GameRoom Effect Started');
// //     console.log('Game Code:', gameCode);
// //     console.log('Player Address:', address);

// //     // Validate connection parameters
// //     if (!gameCode || !address) {
// //       console.error('❌ Missing gameCode or address');
// //       toast.error('Game configuration incomplete');
// //       router.push('/');
// //       return;
// //     }

// //     // Determine socket URL with fallback
// //     const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
// //     console.log('🌐 Connecting to socket URL:', socketUrl);

// //     // Create socket instance with detailed connection parameters
// //     const socketInstance = io(socketUrl, {
// //       query: { 
// //         gameCode, 
// //         address, 
// //         name: `Player${address.slice(0,6)}` 
// //       },
// //       timeout: 10000,  // 10 second connection timeout
// //       reconnection: true,
// //       reconnectionAttempts: 5,
// //       reconnectionDelay: 1000
// //     });

// //     // Successful connection handler
// //     socketInstance.on('connect', () => {
// //       console.log('✅ Socket Connected Successfully');
// //       console.log('Socket ID:', socketInstance.id);
// //       setIsLoading(false);
// //       setConnectionError(null);
// //     });

// //     // Connection error handler
// //     socketInstance.on('connect_error', (error) => {
// //       console.error('❌ Socket Connection Error:', error);
// //       setConnectionError(error.message);
// //       setIsLoading(false);
// //       toast.error(`Connection Failed: ${error.message}`);
// //     });

// //     // Reconnection attempt logging
// //     socketInstance.on('reconnect', (attemptNumber) => {
// //       console.log(`🔄 Reconnected after ${attemptNumber} attempts`);
// //     });

// //     // Event logging for debugging
// //     socketInstance.onAny((eventName, ...args) => {
// //       console.log(`📡 Received event: ${eventName}`, args);
// //     });

// //     // Game state handler
// //     socketInstance.on('gameState', (state: GameState) => {
// //       console.log('📊 Game State Received:', state);
// //       setCurrentDrawer(state.currentDrawer);
// //       setCurrentWord(state.currentWord);
// //       setTimeLeft(state.timeLeft);
// //       setPlayers(state.players);
// //       setIsDrawing(state.currentDrawer === address);
// //     });

// //     // Round start handler
// //     socketInstance.on('roundStart', ({ drawer, word }: RoundStartPayload) => {
// //       console.log('🎲 Round Started', { drawer, word });
// //       setCurrentDrawer(drawer);
// //       if (drawer === address) {
// //         setCurrentWord(word);
// //       } else {
// //         setCurrentWord('');
// //       }
// //       setIsDrawing(drawer === address);
// //       toast.success(`Round started! ${drawer === address ? 'You are drawing!' : 'Start guessing!'}`);
// //     });

// //     // Correct guess handler
// //     socketInstance.on('correctGuess', async ({ player, points: newPoints }: CorrectGuessPayload) => {
// //       try {
// //         await updateContractPoints(gameCode, newPoints);
// //         updatePoints(player, newPoints);
// //         toast.success(`${player === address ? 'You' : 'A player'} guessed correctly!`);
// //       } catch (error) {
// //         console.error('Error updating points:', error);
// //       }
// //     });

// //     // Game end handler
// //     socketInstance.on('gameEnd', async ({ winner, points: finalPoints }: GameEndPayload) => {
// //       try {
// //         await endGame(gameCode);
// //         if (winner === address) {
// //           toast.success('🎉 Congratulations! You won the game!');
// //         } else {
// //           toast.error('Game Over! Better luck next time!');
// //         }
// //         reset();
// //         router.push('/');
// //       } catch (error) {
// //         console.error('Error ending game:', error);
// //       }
// //     });

// //     setSocket(socketInstance);

// //     // Cleanup on component unmount
// //     return () => {
// //       socketInstance.disconnect();
// //     };
// //   }, [gameCode, address]);

// //   // Loading state handler
// //   if (isLoading) {
// //     return <LoadingOverlay message="Connecting to game..." />;
// //   }

// //   // Connection error handler
// //   if (connectionError) {
// //     return (
// //       <div className="flex items-center justify-center h-screen bg-red-50">
// //         <div className="text-center">
// //           <h2 className="text-2xl font-bold text-red-600 mb-4">Connection Error</h2>
// //           <p className="text-red-500 mb-4">{connectionError}</p>
// //           <button 
// //             onClick={() => router.push('/')} 
// //             className="bg-red-500 text-white px-4 py-2 rounded"
// //           >
// //             Return to Home
// //           </button>
// //         </div>
// //       </div>
// //     );
// //   }

// //   // Main game room render
// //   return (
// //     <div className="flex flex-col h-screen">
// //       <div className="flex justify-between items-center p-4 bg-white shadow">
// //         <div className="flex items-center space-x-4">
// //           <h2 className="text-xl font-bold">Game Code: {gameCode}</h2>
// //           <span className="px-4 py-2 bg-blue-100 rounded">
// //             Time Left: {timeLeft}s
// //           </span>
// //         </div>
// //         {isDrawing && currentWord && (
// //           <div className="px-4 py-2 bg-green-100 rounded">
// //             Word to draw: {currentWord}
// //           </div>
// //         )}
// //       </div>

// //       <div className="flex flex-1 p-4 space-x-4">
// //         <div className="w-3/4 flex flex-col space-y-4">
// //           <DrawingCanvas socket={socket} />
// //           {isDrawing && <DrawingTools socket={socket} />}
// //         </div>

// //         <div className="w-1/4 flex flex-col space-y-4">
// //           <div className="bg-white rounded-lg shadow p-4">
// //             <h3 className="text-lg font-semibold mb-4">Players</h3>
// //             <div className="space-y-2">
// //               {players.map((player: Player) => (
// //                 <div
// //                   key={player.address}
// //                   className="flex justify-between items-center"
// //                 >
// //                   <span className="flex items-center">
// //                     {player.address === currentDrawer && (
// //                       <span className="mr-2">🎨</span>
// //                     )}
// //                     {player.name || `Player ${player.address.slice(0, 6)}...`}
// //                   </span>
// //                   <span className="font-bold">{points[player.address] || 0}</span>
// //                 </div>
// //               ))}
// //             </div>
// //           </div>
// //           <Chat socket={socket} />
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // // src/components/GameRoom.tsx
// // import { useEffect, useState } from 'react';
// // import { useRouter } from 'next/router';
// // import { useAccount } from 'wagmi';
// // import { toast } from 'react-hot-toast';
// // import { io, Socket } from 'socket.io-client';
// // import { DrawingCanvas } from './DrawingCanvas';
// // import { DrawingTools } from './DrawingTools';
// // import { Chat } from './Chat';
// // import { LoadingOverlay } from './LoadingOverlay';
// // import { useScribbleContract } from '@/hooks/useScribbleContract';
// // import { useGameStore } from '@/store/gameStore';

// // export const GameRoom = () => {
// //   const [socket, setSocket] = useState<Socket | null>(null);
// //   const [isConnecting, setIsConnecting] = useState(true);
// //   const [connectionError, setConnectionError] = useState<string | null>(null);
// //   const router = useRouter();
// //   const { gameCode } = router.query;
// //   const { address } = useAccount();
// //   const { updatePoints, endGame } = useScribbleContract();
// //   const gameStore = useGameStore();

// //   useEffect(() => {
// //     if (!gameCode || !address) return;

// //     const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
// //     console.log('Connecting to socket:', socketUrl);

// //     const socketInstance = io(socketUrl!, {
// //       query: { 
// //         gameCode, 
// //         address,
// //         name: localStorage.getItem('playerName') || `Player ${address.slice(0, 6)}`
// //       },
// //       transports: ['websocket', 'polling'],
// //       reconnectionAttempts: 3,
// //       timeout: 10000
// //     });

// //     socketInstance.on('connect', () => {
// //       console.log('Socket connected');
// //       setIsConnecting(false);
// //       setConnectionError(null);
// //     });

// //     socketInstance.on('connect_error', (error) => {
// //       console.error('Socket connection error:', error);
// //       setConnectionError('Failed to connect to game server');
// //       setIsConnecting(false);
// //       toast.error('Failed to connect to game server');
// //     });

// //     socketInstance.on('disconnect', () => {
// //       console.log('Socket disconnected');
// //       setConnectionError('Disconnected from game server');
// //     });

// //     socketInstance.on('gameState', (state) => {
// //       console.log('Received game state:', state);
// //       gameStore.setCurrentDrawer(state.currentDrawer);
// //       gameStore.setCurrentWord(state.currentWord);
// //       gameStore.setTimeLeft(state.timeLeft);
// //       gameStore.setPlayers(state.players);
// //       gameStore.setIsDrawing(state.currentDrawer === address);
// //     });

// //     socketInstance.on('roundStart', async ({ drawer, word }) => {
// //       console.log('Round started:', { drawer, word });
// //       if (drawer === address) {
// //         toast.success('Your turn to draw!');
// //       }
// //     });

// //     setSocket(socketInstance);

// //     return () => {
// //       console.log('Cleaning up socket connection');
// //       socketInstance.disconnect();
// //     };
// //   }, [gameCode, address]);

// //   if (isConnecting) {
// //     return <LoadingOverlay message="Connecting to game server..." />;
// //   }

// //   if (connectionError) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center">
// //         <div className="text-center">
// //           <h2 className="text-xl font-bold text-red-600 mb-4">{connectionError}</h2>
// //           <button
// //             onClick={() => router.push('/')}
// //             className="px-4 py-2 bg-blue-500 text-white rounded"
// //           >
// //             Return Home
// //           </button>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="flex flex-col h-screen">
// //       <div className="flex justify-between items-center p-4 bg-white shadow">
// //         <div className="flex items-center space-x-4">
// //           <h2 className="text-xl font-bold">Game Code: {gameCode}</h2>
// //           <span className="px-4 py-2 bg-blue-100 rounded">
// //             Time Left: {gameStore.timeLeft}s
// //           </span>
// //         </div>
// //         {gameStore.isDrawing && gameStore.currentWord && (
// //           <div className="px-4 py-2 bg-green-100 rounded">
// //             Word to draw: {gameStore.currentWord}
// //           </div>
// //         )}
// //       </div>

// //       <div className="flex flex-1 p-4 space-x-4">
// //         <div className="w-3/4 flex flex-col space-y-4">
// //           <DrawingCanvas socket={socket} />
// //           {gameStore.isDrawing && <DrawingTools socket={socket} />}
// //         </div>

// //         <div className="w-1/4 flex flex-col space-y-4">
// //           <div className="bg-white rounded-lg shadow p-4">
// //             <h3 className="text-lg font-semibold mb-4">Players</h3>
// //             <div className="space-y-2">
// //               {gameStore.players.map((player) => (
// //                 <div
// //                   key={player.address}
// //                   className="flex justify-between items-center"
// //                 >
// //                   <span className="flex items-center">
// //                     {player.address === gameStore.currentDrawer && (
// //                       <span className="mr-2">🎨</span>
// //                     )}
// //                     {player.name || `Player ${player.address.slice(0, 6)}...`}
// //                   </span>
// //                   <span className="font-bold">
// //                     {gameStore.points[player.address] || 0}
// //                   </span>
// //                 </div>
// //               ))}
// //             </div>
// //           </div>
// //           <Chat socket={socket} />
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };



// // src/components/GameRoom.tsx
// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/router';
// import { useAccount } from 'wagmi';
// import { toast } from 'react-hot-toast';
// import { io, Socket } from 'socket.io-client';
// import { DrawingCanvas } from './DrawingCanvas';
// import { DrawingTools } from './DrawingTools';
// import { Chat } from './Chat';
// import { LoadingOverlay } from './LoadingOverlay';
// import { useScribbleContract } from '@/hooks/useScribbleContract';
// import { useGameStore } from '@/store/gameStore';

// export const GameRoom = () => {
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [isConnecting, setIsConnecting] = useState(true);
//   const [connectionError, setConnectionError] = useState<string | null>(null);
//   const router = useRouter();
//   const { gameCode } = router.query;
//   const { address } = useAccount();
//   const { updatePoints, endGame } = useScribbleContract();
//   const gameStore = useGameStore();

//   useEffect(() => {
//     if (!gameCode || !address) return;

//     const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
//     console.log('Connecting to socket:', socketUrl);

//     const socketInstance = io(socketUrl!, {
//       query: { 
//         gameCode, 
//         address,
//         name: localStorage.getItem('playerName') || `Player ${address.slice(0, 6)}`
//       },
//       transports: ['websocket', 'polling'],
//       reconnectionAttempts: 3,
//       timeout: 10000
//     });

//     socketInstance.on('connect', () => {
//       console.log('Socket connected');
//       setIsConnecting(false);
//       setConnectionError(null);
//     });

//     socketInstance.on('connect_error', (error) => {
//       console.error('Socket connection error:', error);
//       setConnectionError('Failed to connect to game server');
//       setIsConnecting(false);
//       toast.error('Failed to connect to game server');
//     });

//     socketInstance.on('disconnect', () => {
//       console.log('Socket disconnected');
//       setConnectionError('Disconnected from game server');
//     });

//     socketInstance.on('gameState', (state) => {
//       console.log('Received game state:', state);
//       gameStore.setCurrentDrawer(state.currentDrawer);
//       gameStore.setCurrentWord(state.currentWord);
//       gameStore.setTimeLeft(state.timeLeft);
//       gameStore.setPlayers(state.players);
//       gameStore.setIsDrawing(state.currentDrawer === address);
//       gameStore.setIsGameStarted(state.isGameStarted);
//       gameStore.setRoundActive(state.roundActive);
//       // Set isOwner if this player created the room
//       if (state.players.length > 0) {
//         gameStore.setIsOwner(state.players[0].address === address);
//       }
//     });

//     socketInstance.on('gameStarted', (data) => {
//       console.log('Game started:', data);
//       gameStore.setIsGameStarted(true);
//       gameStore.setCurrentDrawer(data.drawer);
//       if (data.drawer === address) {
//         gameStore.setCurrentWord(data.word);
//         toast.success('Your turn to draw!');
//       }
//       gameStore.setTimeLeft(data.timeLeft);
//     });

//     socketInstance.on('roundStart', ({ drawer, word }) => {
//       console.log('Round started:', { drawer, word });
//       gameStore.setCurrentDrawer(drawer);
//       gameStore.setRoundActive(true);
//       if (drawer === address) {
//         gameStore.setCurrentWord(word);
//         toast.success('Your turn to draw!');
//       } else {
//         gameStore.setCurrentWord('');
//         toast.success('Time to guess!');
//       }
//     });

//     socketInstance.on('roundEnd', () => {
//       gameStore.setRoundActive(false);
//       toast('Round ended!', {
//         icon: 'ℹ️',
//         style: {
//           background: '#3b82f6',
//           color: '#ffffff'
//         }
//       });
//     });

//     socketInstance.on('correctGuess', ({ player, points }) => {
//       gameStore.updatePoints(player, points);
//       toast.success(`${player === address ? 'You' : 'Someone'} guessed correctly!`);
//     });

//     setSocket(socketInstance);

//     return () => {
//       console.log('Cleaning up socket connection');
//       socketInstance.disconnect();
//     };
//   }, [gameCode, address]);

//   const handleStartGame = () => {
//     if (!socket) return;
//     console.log('Starting game...');
//     socket.emit('startGame');
//   };

//   if (isConnecting) {
//     return <LoadingOverlay message="Connecting to game server..." />;
//   }

//   if (connectionError) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-xl font-bold text-red-600 mb-4">{connectionError}</h2>
//           <button
//             onClick={() => router.push('/')}
//             className="px-4 py-2 bg-blue-500 text-white rounded"
//           >
//             Return Home
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-screen">
//       <div className="flex justify-between items-center p-4 bg-white shadow">
//         <div className="flex items-center space-x-4">
//           <h2 className="text-xl font-bold">Game Code: {gameCode}</h2>
//           <span className="px-4 py-2 bg-blue-100 rounded">
//             Time Left: {gameStore.timeLeft}s
//           </span>
//         </div>
//         {!gameStore.isGameStarted && gameStore.isOwner && gameStore.players.length >= 2 && (
//           <button
//             onClick={handleStartGame}
//             className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
//           >
//             Start Game
//           </button>
//         )}
//         {!gameStore.isGameStarted && !gameStore.isOwner && (
//           <div className="text-gray-600">
//             Waiting for room owner to start the game...
//             {gameStore.players.length < 2 && " (Need at least 2 players)"}
//           </div>
//         )}
//         {gameStore.isDrawing && gameStore.currentWord && (
//           <div className="px-4 py-2 bg-green-100 rounded">
//             Word to draw: {gameStore.currentWord}
//           </div>
//         )}
//       </div>

//       <div className="flex flex-1 p-4 space-x-4">
//         <div className="w-3/4 flex flex-col space-y-4">
//           <DrawingCanvas socket={socket} />
//           {gameStore.isDrawing && <DrawingTools socket={socket} />}
//         </div>

//         <div className="w-1/4 flex flex-col space-y-4">
//           <div className="bg-white rounded-lg shadow p-4">
//             <h3 className="text-lg font-semibold mb-4">Players</h3>
//             <div className="space-y-2">
//               {gameStore.players.map((player) => (
//                 <div
//                   key={player.address}
//                   className="flex justify-between items-center"
//                 >
//                   <span className="flex items-center">
//                     {player.address === gameStore.currentDrawer && (
//                       <span className="mr-2">🎨</span>
//                     )}
//                     {player.name || `Player ${player.address.slice(0, 6)}...`}
//                   </span>
//                   <span className="font-bold">
//                     {gameStore.points[player.address] || 0}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>
//           <Chat socket={socket} />
//         </div>
//       </div>
//     </div>
//   );
// };




// // src/components/GameRoom.tsx
// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/router';
// import { useAccount } from 'wagmi';
// import { toast } from 'react-hot-toast';
// import { io, Socket } from 'socket.io-client';
// import { DrawingCanvas } from './DrawingCanvas';
// import { DrawingTools } from './DrawingTools';
// import { Chat } from './Chat';
// import { LoadingOverlay } from './LoadingOverlay';
// import { useScribbleContract } from '@/hooks/useScribbleContract';
// import { useGameStore } from '@/store/gameStore';

// export const GameRoom = () => {
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [isConnecting, setIsConnecting] = useState(true);
//   const [connectionError, setConnectionError] = useState<string | null>(null);
//   const router = useRouter();
//   const { gameCode } = router.query;
//   const { address } = useAccount();
//   const { updatePoints, endGame } = useScribbleContract();
//   const gameStore = useGameStore();

//   useEffect(() => {
//     if (!gameCode || !address) return;

//     const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
//     console.log('Connecting to socket:', socketUrl);

//     const socketInstance = io(socketUrl!, {
//       query: { 
//         gameCode, 
//         address,
//         name: localStorage.getItem('playerName') || `Player ${address.slice(0, 6)}`
//       },
//       transports: ['websocket', 'polling'],
//       reconnectionAttempts: 3,
//       timeout: 10000
//     });

//     socketInstance.on('connect', () => {
//       console.log('Socket connected');
//       setIsConnecting(false);
//       setConnectionError(null);
//     });

//     socketInstance.on('connect_error', (error) => {
//       console.error('Socket connection error:', error);
//       setConnectionError('Failed to connect to game server');
//       setIsConnecting(false);
//       toast.error('Failed to connect to game server');
//     });

//     socketInstance.on('disconnect', () => {
//       console.log('Socket disconnected');
//       setConnectionError('Disconnected from game server');
//     });

//     socketInstance.on('gameState', (state) => {
//       console.log('Received game state:', state);
//       gameStore.setCurrentDrawer(state.currentDrawer);
//       gameStore.setCurrentWord(state.currentWord);
//       gameStore.setTimeLeft(state.timeLeft);
//       gameStore.setPlayers(state.players);
//       gameStore.setIsDrawing(state.currentDrawer === address);
//       gameStore.setIsGameStarted(state.isGameStarted);
//       gameStore.setRoundActive(state.roundActive);
      
//       // Set isOwner if this player created the room
//       if (state.players.length > 0) {
//         gameStore.setIsOwner(state.players[0].address === address);
//       }
//     });

//     socketInstance.on('timeUpdate', (time) => {
//       console.log('Time update:', time);
//       gameStore.setTimeLeft(time);
//     });

//     socketInstance.on('gameStarted', (data) => {
//       console.log('Game started:', data);
//       gameStore.setIsGameStarted(true);
//       gameStore.setCurrentDrawer(data.drawer);
//       if (data.drawer === address) {
//         gameStore.setCurrentWord(data.word);
//         toast.success('Your turn to draw!');
//       }
//       gameStore.setTimeLeft(data.timeLeft);
//     });

//     socketInstance.on('roundStart', ({ drawer, word, timeLeft }) => {
//       console.log('Round started:', { drawer, word, timeLeft });
//       gameStore.setCurrentDrawer(drawer);
//       gameStore.setRoundActive(true);
//       gameStore.setTimeLeft(timeLeft);
//       gameStore.setIsDrawing(drawer === address);
      
//       if (drawer === address) {
//         gameStore.setCurrentWord(word);
//         toast.success('Your turn to draw!');
//       } else {
//         gameStore.setCurrentWord('');
//         toast.success('Time to guess!');
//       }
//     });

//     socketInstance.on('roundEnd', ({ scores, nextDrawer }) => {
//       console.log('Round ended:', { scores, nextDrawer });
//       gameStore.setRoundActive(false);
//       gameStore.setCurrentDrawer(nextDrawer);
//       gameStore.setCurrentWord('');
//       gameStore.setIsDrawing(nextDrawer === address);
      
//       toast('Round ended!', {
//         icon: '🔄',
//         style: {
//           background: '#3b82f6',
//           color: '#ffffff'
//         }
//       });
//     });

//     socketInstance.on('correctGuess', ({ player, points }) => {
//       gameStore.updatePoints(player, points);
//       toast.success(`${player === address ? 'You' : 'Someone'} guessed correctly!`);
//     });

//     setSocket(socketInstance);

//     return () => {
//       console.log('Cleaning up socket connection');
//       socketInstance.disconnect();
//     };
//   }, [gameCode, address]);

//   const handleStartGame = () => {
//     if (!socket) return;
//     console.log('Starting game...');
//     socket.emit('startGame');
//   };

//   if (isConnecting) {
//     return <LoadingOverlay message="Connecting to game server..." />;
//   }

//   if (connectionError) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-xl font-bold text-red-600 mb-4">{connectionError}</h2>
//           <button
//             onClick={() => router.push('/')}
//             className="px-4 py-2 bg-blue-500 text-white rounded"
//           >
//             Return Home
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-screen">
//       <div className="flex justify-between items-center p-4 bg-white shadow">
//         <div className="flex items-center space-x-4">
//           <h2 className="text-xl font-bold">Game Code: {gameCode}</h2>
//           <span className="px-4 py-2 bg-blue-100 rounded">
//             Time Left: {gameStore.timeLeft}s
//           </span>
//         </div>

//         {!gameStore.isGameStarted && gameStore.isOwner && gameStore.players.length >= 2 && (
//           <button
//             onClick={handleStartGame}
//             className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
//           >
//             Start Game
//           </button>
//         )}

//         {!gameStore.isGameStarted && !gameStore.isOwner && (
//           <div className="text-gray-600">
//             Waiting for room owner to start the game...
//             {gameStore.players.length < 2 && " (Need at least 2 players)"}
//           </div>
//         )}

//         {gameStore.isDrawing && gameStore.currentWord && (
//           <div className="px-4 py-2 bg-green-100 rounded">
//             Word to draw: {gameStore.currentWord}
//           </div>
//         )}
//       </div>

//       <div className="flex flex-1 p-4 space-x-4">
//         <div className="w-3/4 flex flex-col space-y-4">
//           <DrawingCanvas socket={socket} />
//           {gameStore.isDrawing && gameStore.roundActive && <DrawingTools socket={socket} />}
//         </div>

//         <div className="w-1/4 flex flex-col space-y-4">
//           <div className="bg-white rounded-lg shadow p-4">
//             <h3 className="text-lg font-semibold mb-4">Players</h3>
//             <div className="space-y-2">
//               {gameStore.players.map((player) => (
//                 <div
//                   key={player.address}
//                   className="flex justify-between items-center"
//                 >
//                   <span className="flex items-center">
//                     {player.address === gameStore.currentDrawer && (
//                       <span className="mr-2">🎨</span>
//                     )}
//                     {player.name || `Player ${player.address.slice(0, 6)}...`}
//                   </span>
//                   <span className="font-bold">
//                     {gameStore.points[player.address] || 0}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>
//           <Chat socket={socket} />
//         </div>
//       </div>
//     </div>
//   );
// };

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/router';
// import { useAccount, usePublicClient } from 'wagmi';
// import { toast } from 'react-hot-toast';
// import { io, Socket } from 'socket.io-client';
// import { Hash } from 'viem';
// import { DrawingCanvas } from './DrawingCanvas';
// import { DrawingTools } from './DrawingTools';
// import { Chat } from './Chat';
// import { LoadingOverlay } from './LoadingOverlay';
// import { useScribbleContract } from '@/hooks/useScribbleContract';
// import { useGameStore } from '@/store/gameStore';
// import { WinnerModal } from './WinnerModal';
// import { Clock, Crown, Users, Palette } from 'lucide-react';
// import { Button } from '@/components/ui/button';

// export const GameRoom = () => {
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [isConnecting, setIsConnecting] = useState(true);
//   const [connectionError, setConnectionError] = useState<string | null>(null);
//   const [showWinnerModal, setShowWinnerModal] = useState(false);
//   const [winnerDetails, setWinnerDetails] = useState<{
//     address: string;
//     prize: bigint;
//     transactionHash?: string;
//   } | null>(null);

//   const router = useRouter();
//   const { gameCode } = router.query;
//   const { address } = useAccount();
//   const publicClient = usePublicClient();
//   const { updatePoints, endGame } = useScribbleContract();
//   const gameStore = useGameStore();

//   const waitForTransaction = async (hash: Hash) => {
//     if (!publicClient) return null;
//     return await publicClient.waitForTransactionReceipt({ hash });
//   };

//   useEffect(() => {
//     if (!gameCode || !address) return;

//     const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
//       query: { 
//         gameCode, 
//         address,
//         name: localStorage.getItem('playerName') || `Player ${address.slice(0, 6)}`
//       },
//       transports: ['websocket', 'polling'],
//       reconnectionAttempts: 3,
//       timeout: 10000
//     });

//     socketInstance.on('connect', () => {
//       setIsConnecting(false);
//       setConnectionError(null);
//     });

//     socketInstance.on('connect_error', (error) => {
//       setConnectionError('Failed to connect to game server');
//       setIsConnecting(false);
//       toast.error('Failed to connect to game server');
//     });

//     socketInstance.on('gameState', (state) => {
//       gameStore.setCurrentDrawer(state.currentDrawer);
//       gameStore.setCurrentWord(state.currentWord);
//       gameStore.setTimeLeft(state.timeLeft);
//       gameStore.setPlayers(state.players);
//       gameStore.setIsDrawing(state.currentDrawer === address);
//       gameStore.setIsGameStarted(state.isGameStarted);
//       gameStore.setRoundActive(state.roundActive);
//       if (state.players.length > 0) {
//         gameStore.setIsOwner(state.players[0].address === address);
//       }
//     });

//     socketInstance.on('timeUpdate', (time) => {
//       gameStore.setTimeLeft(time);
//     });

//     socketInstance.on('roundStart', ({ drawer, word, timeLeft }) => {
//       gameStore.setCurrentDrawer(drawer);
//       gameStore.setRoundActive(true);
//       gameStore.setTimeLeft(timeLeft);
//       gameStore.setIsDrawing(drawer === address);
      
//       if (drawer === address) {
//         gameStore.setCurrentWord(word);
//         toast.success('Your turn to draw!');
//       } else {
//         gameStore.setCurrentWord('');
//         toast.success('Time to guess!');
//       }
//       gameStore.clearCorrectGuessers();
//     });

//     socketInstance.on('roundEnd', ({ scores, nextDrawer, word }) => {
//       gameStore.setRoundActive(false);
//       gameStore.setCurrentDrawer(nextDrawer);
//       gameStore.setCurrentWord('');
//       gameStore.setIsDrawing(nextDrawer === address);
      
//       toast('Round ended! The word was: ' + word, {
//         icon: '🔄',
//         style: {
//           background: '#3b82f6',
//           color: '#ffffff'
//         },
//         duration: 3000
//       });
//     });

//     socketInstance.on('wrongGuess', ({ guess }) => {
//       toast.error(`Wrong guess: ${guess}`, { duration: 2000 });
//     });

//     socketInstance.on('correctGuess', ({ player, points }) => {
//       gameStore.updatePoints(player, points);
//       gameStore.addCorrectGuesser(player);
//       toast.success(`${player === address ? 'You' : 'Someone'} guessed correctly!`, {
//         duration: 3000
//       });
//     });

//     socketInstance.on('chatMessage', (message) => {
//       gameStore.addChatMessage(message);
//     });

//     socketInstance.on('gameEnd', async ({ winner, points, totalPrize }) => {
//       toast.success('Game Over!', { duration: 5000 });

//       setWinnerDetails({
//         address: winner,
//         prize: totalPrize
//       });
//       setShowWinnerModal(true);

//       if (winner === address) {
//         try {
//           const result = await endGame(gameCode as string);
//           if (result?.hash) {
//             toast.success('Claiming prize...', { duration: 3000 });
            
//             gameStore.setLastTransactionHash(result.hash);
//             setWinnerDetails(prev => ({
//               ...prev!,
//               transactionHash: result.hash
//             }));

//             const receipt = await waitForTransaction(result.hash as Hash);
//             if (receipt) {
//               toast.success('Prize claimed successfully!', { duration: 5000 });

//               // Store game result in local storage
//               const gameResult = {
//                 gameCode: gameCode as string,
//                 winner: address,
//                 prizeAmount: totalPrize,
//                 timestamp: Date.now(),
//                 transactionHash: result.hash
//               };
              
//               const history = JSON.parse(localStorage.getItem('gameHistory') || '[]');
//               history.push(gameResult);
//               localStorage.setItem('gameHistory', JSON.stringify(history));
//             }
//           }
//         } catch (error) {
//           console.error('Error ending game:', error);
//           toast.error('Failed to claim prize. Please try again later.', { duration: 5000 });
//         }
//       }

//       setTimeout(() => {
//         gameStore.reset();
//         router.push('/');
//       }, 10000);
//     });

//     setSocket(socketInstance);

//     return () => {
//       socketInstance.disconnect();
//     };
//   }, [gameCode, address]);

//   const handleStartGame = () => {
//     if (!socket) return;
//     socket.emit('startGame');
//   };

//   if (isConnecting) {
//     return <LoadingOverlay message="Connecting to game server..." />;
//   }

//   if (connectionError) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-[#1F48B0]">
//         <div className="text-center bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
//           <h2 className="text-xl font-bold text-red-400 mb-4">{connectionError}</h2>
//           <Button
//             onClick={() => router.push('/')}
//             className="px-4 py-2 bg-[#4CAF50] hover:bg-[#45a049] text-white rounded-full"
//           >
//             Return Home
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-screen bg-[#1F48B0]">
//       <div className="flex justify-between items-center p-4 bg-white/10 backdrop-blur-sm border-b border-white/20 text-white">
//         <div className="flex items-center space-x-4">
//           <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF4B4B] via-[#FFEB3B] to-[#4CAF50]">
//             Game Code: {gameCode}
//           </h2>
//           <span className="px-4 py-2 bg-white/20 rounded-full flex items-center">
//             <Clock className="w-4 h-4 mr-2" />
//             {gameStore.timeLeft}s
//           </span>
//         </div>
//         {!gameStore.isGameStarted && gameStore.isOwner && gameStore.players.length >= 2 && (
//           <Button
//             onClick={handleStartGame}
//             className="bg-[#4CAF50] hover:bg-[#45a049] text-white font-semibold py-2 px-4 rounded-full"
//           >
//             Start Game
//           </Button>
//         )}
//         {gameStore.isDrawing && gameStore.currentWord && (
//           <div className="px-4 py-2 bg-white/20 rounded-full">
//             Word to draw: <span className="font-bold">{gameStore.currentWord}</span>
//           </div>
//         )}
//       </div>

//       <div className="flex flex-1 p-4 space-x-4 text-white">
//         <div className="w-3/4 flex flex-col space-y-4 bg-white/10 backdrop-blur-sm rounded-3xl p-4 border border-white/20">
//           <DrawingCanvas socket={socket} />
//           {gameStore.isDrawing && gameStore.roundActive && (
//             <DrawingTools socket={socket} />
//           )}
//         </div>

//         <div className="w-1/4 flex flex-col space-y-4">
//           <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-4 border border-white/20">
//             <h3 className="text-lg font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#FF4B4B] via-[#FFEB3B] to-[#4CAF50]">
//               Players
//             </h3>
//             <div className="space-y-2">
//               {gameStore.players.map((player) => (
//                 <div
//                   key={player.address}
//                   className="flex justify-between items-center bg-white/5 rounded-full px-4 py-2"
//                 >
//                   <span className="flex items-center">
//                     {player.address === gameStore.currentDrawer && (
//                       <Palette className="w-4 h-4 mr-2 text-[#FFEB3B]" />
//                     )}
//                     {player.name || `Player ${player.address.slice(0, 6)}...`}
//                   </span>
//                   <span className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF4B4B] to-[#FFEB3B]">
//                     {gameStore.points[player.address] || 0}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>
//           <Chat socket={socket} />
//         </div>
//       </div>

//       {showWinnerModal && winnerDetails && (
//         <WinnerModal
//           winner={winnerDetails.address}
//           prize={winnerDetails.prize}
//           transactionHash={winnerDetails.transactionHash}
//           onClose={() => setShowWinnerModal(false)}
//         />
//       )}
//     </div>
//   );
// };

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAccount, usePublicClient } from 'wagmi';
import { toast } from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';
import { Hash } from 'viem';
import { DrawingCanvas } from './DrawingCanvas';
import { DrawingTools } from './DrawingTools';
import { Chat } from './Chat';
import { LoadingOverlay } from './LoadingOverlay';
import { useScribbleContract } from '@/hooks/useScribbleContract';
import { useGameStore } from '@/store/gameStore';
import { WinnerModal } from './WinnerModal';
import { Clock, Crown, Users, Palette, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export const GameRoom = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winnerDetails, setWinnerDetails] = useState<{
    address: string;
    prize: bigint;
    transactionHash?: string;
  } | null>(null);

  const router = useRouter();
  const { gameCode } = router.query;
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { updatePoints, endGame } = useScribbleContract();
  const gameStore = useGameStore();

  const waitForTransaction = async (hash: Hash) => {
    if (!publicClient) return null;
    return await publicClient.waitForTransactionReceipt({ hash });
  };

  useEffect(() => {
    if (!gameCode || !address) return;

    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      query: { 
        gameCode, 
        address,
        name: localStorage.getItem('playerName') || `Player ${address.slice(0, 6)}`
      },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 3,
      timeout: 10000
    });

    socketInstance.on('connect', () => {
      setIsConnecting(false);
      setConnectionError(null);
    });

    socketInstance.on('connect_error', (error) => {
      setConnectionError('Failed to connect to game server');
      setIsConnecting(false);
      toast.error('Failed to connect to game server');
    });

    socketInstance.on('gameState', (state) => {
      gameStore.setCurrentDrawer(state.currentDrawer);
      gameStore.setCurrentWord(state.currentWord);
      gameStore.setTimeLeft(state.timeLeft);
      gameStore.setPlayers(state.players);
      gameStore.setIsDrawing(state.currentDrawer === address);
      gameStore.setIsGameStarted(state.isGameStarted);
      gameStore.setRoundActive(state.roundActive);
      if (state.players.length > 0) {
        gameStore.setIsOwner(state.players[0].address === address);
      }
    });

    socketInstance.on('timeUpdate', (time) => {
      gameStore.setTimeLeft(time);
    });

    socketInstance.on('roundStart', ({ drawer, word, timeLeft }) => {
      gameStore.setCurrentDrawer(drawer);
      gameStore.setRoundActive(true);
      gameStore.setTimeLeft(timeLeft);
      gameStore.setIsDrawing(drawer === address);
      
      if (drawer === address) {
        gameStore.setCurrentWord(word);
        toast.success('Your turn to draw!');
      } else {
        gameStore.setCurrentWord('');
        toast.success('Time to guess!');
      }
      gameStore.clearCorrectGuessers();
    });

    socketInstance.on('roundEnd', ({ scores, nextDrawer, word }) => {
      gameStore.setRoundActive(false);
      gameStore.setCurrentDrawer(nextDrawer);
      gameStore.setCurrentWord('');
      gameStore.setIsDrawing(nextDrawer === address);
      
      toast('Round ended! The word was: ' + word, {
        icon: '🔄',
        style: {
          background: '#3b82f6',
          color: '#ffffff'
        },
        duration: 3000
      });
    });

    socketInstance.on('wrongGuess', ({ guess }) => {
      toast.error(`Wrong guess: ${guess}`, { duration: 2000 });
    });

    socketInstance.on('correctGuess', ({ player, points }) => {
      gameStore.updatePoints(player, points);
      gameStore.addCorrectGuesser(player);
      toast.success(`${player === address ? 'You' : 'Someone'} guessed correctly!`, {
        duration: 3000
      });
    });

    socketInstance.on('chatMessage', (message) => {
      gameStore.addChatMessage(message);
    });

    socketInstance.on('gameEnd', async ({ winner, points, totalPrize }) => {
      toast.success('Game Over!', { duration: 5000 });

      setWinnerDetails({
        address: winner,
        prize: totalPrize
      });
      setShowWinnerModal(true);

      if (winner === address) {
        try {
          const result = await endGame(gameCode as string);
          if (result?.hash) {
            toast.success('Claiming prize...', { duration: 3000 });
            
            gameStore.setLastTransactionHash(result.hash);
            setWinnerDetails(prev => ({
              ...prev!,
              transactionHash: result.hash
            }));

            const receipt = await waitForTransaction(result.hash as Hash);
            if (receipt) {
              toast.success('Prize claimed successfully!', { duration: 5000 });

              // Store game result in local storage
              const gameResult = {
                gameCode: gameCode as string,
                winner: address,
                prizeAmount: totalPrize,
                timestamp: Date.now(),
                transactionHash: result.hash
              };
              
              const history = JSON.parse(localStorage.getItem('gameHistory') || '[]');
              history.push(gameResult);
              localStorage.setItem('gameHistory', JSON.stringify(history));
            }
          }
        } catch (error) {
          console.error('Error ending game:', error);
          toast.error('Failed to claim prize. Please try again later.', { duration: 5000 });
        }
      }

      setTimeout(() => {
        gameStore.reset();
        router.push('/');
      }, 50000);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [gameCode, address]);

  const handleStartGame = () => {
    if (!socket) return;
    socket.emit('startGame');
  };

  if (isConnecting) {
    return <LoadingOverlay message="Connecting to game server..." />;
  }

  if (connectionError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1F48B0] to-[#4A0E8F]">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-lg"
        >
          <h2 className="text-2xl font-bold text-red-400 mb-4">{connectionError}</h2>
          <Button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-[#4CAF50] to-[#45a049] hover:from-[#45a049] hover:to-[#4CAF50] text-white rounded-full font-semibold transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Return Home
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#1F48B0] to-[#4A0E8F]">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center p-4 bg-white/10 backdrop-blur-sm border-b border-white/20 text-white"
      >
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => router.push('/')}
            variant="ghost"
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Leave Game
          </Button>
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-200 via-gray-100 to-white">
            Game Code: {gameCode}
          </h2>
          <motion.span 
            className="px-4 py-2 bg-white/20 rounded-full flex items-center"
            animate={{ scale: gameStore.timeLeft <= 10 ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.5, repeat: gameStore.timeLeft <= 10 ? Infinity : 0 }}
          >
            <Clock className="w-4 h-4 mr-2" />
            {gameStore.timeLeft}s
          </motion.span>
        </div>
        {!gameStore.isGameStarted && gameStore.isOwner && gameStore.players.length >= 2 && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={handleStartGame}
              className="bg-gradient-to-r from-[#4CAF50] to-[#45a049] hover:from-[#45a049] hover:to-[#4CAF50] text-white font-semibold py-2 px-6 rounded-full transition-all duration-300 ease-in-out"
            >
              Start Game
            </Button>
          </motion.div>
        )}
        {gameStore.isDrawing && gameStore.currentWord && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 py-3 bg-white/20 rounded-full font-semibold"
          >
            Word to draw: <span className="font-bold text-[#FFEB3B]">{gameStore.currentWord}</span>
          </motion.div>
        )}
      </motion.div>

      <div className="flex flex-1 p-4 space-x-4 text-white">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-3/4 flex flex-col space-y-4 bg-white/10 backdrop-blur-sm rounded-3xl p-4 border border-white/20 shadow-lg"
        >
          <DrawingCanvas socket={socket} />
          {gameStore.isDrawing && gameStore.roundActive && (
            <DrawingTools socket={socket} />
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-1/4 flex flex-col space-y-4"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-4 border border-white/20 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-200 via-gray-100 to-white">
              Players
            </h3>
            <div className="space-y-2">
              <AnimatePresence>
                {gameStore.players.map((player) => (
                  <motion.div
                    key={player.address}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-between items-center bg-white/5 rounded-full px-4 py-2 transition-all duration-300 ease-in-out hover:bg-white/10"
                  >
                    <span className="flex items-center">
                      {player.address === gameStore.currentDrawer && (
                        <Palette className="w-4 h-4 mr-2 text-[#FFEB3B]" />
                      )}
                      {player.name || `Player ${player.address.slice(0, 6)}...`}
                    </span>
                    <motion.span 
                      className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF4B4B] to-[#FFEB3B]"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.5 }}
                    >
                      {gameStore.points[player.address] || 0}
                    </motion.span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
          <Chat socket={socket} />
        </motion.div>
      </div>

      <AnimatePresence>
        {showWinnerModal && winnerDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <WinnerModal
              winner={winnerDetails.address}
              prize={winnerDetails.prize}
              transactionHash={winnerDetails.transactionHash}
              onClose={() => setShowWinnerModal(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};



// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/router';
// import { useAccount, usePublicClient } from 'wagmi';
// import { toast } from 'react-hot-toast';
// import { io, Socket } from 'socket.io-client';
// import { Hash } from 'viem';
// import { DrawingCanvas } from './DrawingCanvas';
// import { DrawingTools } from './DrawingTools';
// import { Chat } from './Chat';
// import { LoadingOverlay } from './LoadingOverlay';
// import { useScribbleContract } from '@/hooks/useScribbleContract';
// import { useGameStore } from '@/store/gameStore';
// import { Clock, Crown, Users, Palette, ArrowLeft } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { motion, AnimatePresence } from 'framer-motion';
// import GameResultCard from './GameResultCard';
// import { createRoot } from 'react-dom/client';

// export const GameRoom = () => {
//   const [socket, setSocket] = useState<Socket | null>(null);
//   const [isConnecting, setIsConnecting] = useState(true);
//   const [connectionError, setConnectionError] = useState<string | null>(null);

//   const router = useRouter();
//   const { gameCode } = router.query;
//   const { address } = useAccount();
//   const publicClient = usePublicClient();
//   const { updatePoints, endGame } = useScribbleContract();
//   const gameStore = useGameStore();

//   const waitForTransaction = async (hash: Hash) => {
//     if (!publicClient) return null;
//     return await publicClient.waitForTransactionReceipt({ hash });
//   };

//   useEffect(() => {
//     if (!gameCode || !address) return;

//     const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
//       query: { 
//         gameCode, 
//         address,
//         name: localStorage.getItem('playerName') || `Player ${address.slice(0, 6)}`
//       },
//       transports: ['websocket', 'polling'],
//       reconnectionAttempts: 3,
//       timeout: 10000
//     });

//     socketInstance.on('connect', () => {
//       setIsConnecting(false);
//       setConnectionError(null);
//     });

//     socketInstance.on('connect_error', (error) => {
//       setConnectionError('Failed to connect to game server');
//       setIsConnecting(false);
//       toast.error('Failed to connect to game server');
//     });

//     socketInstance.on('gameState', (state) => {
//       gameStore.setCurrentDrawer(state.currentDrawer);
//       gameStore.setCurrentWord(state.currentWord);
//       gameStore.setTimeLeft(state.timeLeft);
//       gameStore.setPlayers(state.players);
//       gameStore.setIsDrawing(state.currentDrawer === address);
//       gameStore.setIsGameStarted(state.isGameStarted);
//       gameStore.setRoundActive(state.roundActive);
//       if (state.players.length > 0) {
//         gameStore.setIsOwner(state.players[0].address === address);
//       }
//     });

//     socketInstance.on('timeUpdate', (time) => {
//       gameStore.setTimeLeft(time);
//     });

//     socketInstance.on('roundStart', ({ drawer, word, timeLeft }) => {
//       gameStore.setCurrentDrawer(drawer);
//       gameStore.setRoundActive(true);
//       gameStore.setTimeLeft(timeLeft);
//       gameStore.setIsDrawing(drawer === address);
      
//       if (drawer === address) {
//         gameStore.setCurrentWord(word);
//         toast.success('Your turn to draw!');
//       } else {
//         gameStore.setCurrentWord('');
//         toast.success('Time to guess!');
//       }
//       gameStore.clearCorrectGuessers();
//     });

//     socketInstance.on('roundEnd', ({ scores, nextDrawer, word }) => {
//       gameStore.setRoundActive(false);
//       gameStore.setCurrentDrawer(nextDrawer);
//       gameStore.setCurrentWord('');
//       gameStore.setIsDrawing(nextDrawer === address);
      
//       toast('Round ended! The word was: ' + word, {
//         icon: '🔄',
//         style: {
//           background: '#3b82f6',
//           color: '#ffffff'
//         },
//         duration: 3000
//       });
//     });

//     socketInstance.on('wrongGuess', ({ guess }) => {
//       toast.error(`Wrong guess: ${guess}`, { duration: 2000 });
//     });

//     socketInstance.on('correctGuess', ({ player, points }) => {
//       gameStore.updatePoints(player, points);
//       gameStore.addCorrectGuesser(player);
//       toast.success(`${player === address ? 'You' : 'Someone'} guessed correctly!`, {
//         duration: 3000
//       });
//     });

//     socketInstance.on('chatMessage', (message) => {
//       gameStore.addChatMessage(message);
//     });

//     socketInstance.on('gameEnd', async ({ winner, points, totalPrize }) => {
//       const isWinner = winner === address;
      
//       // Show the game result card
//       const rootDiv = document.createElement('div');
//       rootDiv.id = 'game-result-root';
//       document.body.appendChild(rootDiv);
      
//       createRoot(rootDiv).render(
//         <GameResultCard 
//           isWinner={isWinner}
//           prize={isWinner ? totalPrize : undefined}
//           playerAddress={address}
//         />
//       );

//       if (isWinner) {
//         try {
//           const result = await endGame(gameCode as string);
//           if (result?.hash) {
//             toast.success('Claiming prize...', { duration: 3000 });
            
//             gameStore.setLastTransactionHash(result.hash);

//             const receipt = await waitForTransaction(result.hash as Hash);
//             if (receipt) {
//               toast.success('Prize claimed successfully!', { duration: 5000 });

//               // Store game result in local storage
//               const gameResult = {
//                 gameCode: gameCode as string,
//                 winner: address,
//                 prizeAmount: totalPrize,
//                 timestamp: Date.now(),
//                 transactionHash: result.hash
//               };
              
//               const history = JSON.parse(localStorage.getItem('gameHistory') || '[]');
//               history.push(gameResult);
//               localStorage.setItem('gameHistory', JSON.stringify(history));
//             }
//           }
//         } catch (error) {
//           console.error('Error ending game:', error);
//           toast.error('Failed to claim prize. Please try again later.');
//         }
//       }

//       // Ensure redirection happens after 10 seconds
//       setTimeout(async () => {
//         try {
//           document.body.removeChild(rootDiv); // Clean up
//           gameStore.reset();
//           await router.push('/');
//         } catch (error) {
//           console.error('Navigation error:', error);
//           // Fallback navigation
//           window.location.href = '/';
//         }
//       }, 10000);
//     });

//     setSocket(socketInstance);

//     return () => {
//       socketInstance.disconnect();
//     };
//   }, [gameCode, address]);

//   const handleStartGame = () => {
//     if (!socket) return;
//     socket.emit('startGame');
//   };

//   const handleLeaveGame = async () => {
//     try {
//       gameStore.reset();
//       await router.push('/');
//     } catch (error) {
//       console.error('Navigation error:', error);
//       window.location.href = '/';
//     }
//   };

//   if (isConnecting) {
//     return <LoadingOverlay message="Connecting to game server..." />;
//   }

//   if (connectionError) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1F48B0] to-[#4A0E8F]">
//         <motion.div 
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           className="text-center bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-lg"
//         >
//           <h2 className="text-2xl font-bold text-red-400 mb-4">{connectionError}</h2>
//           <Button
//             onClick={handleLeaveGame}
//             className="px-6 py-3 bg-gradient-to-r from-[#4CAF50] to-[#45a049] hover:from-[#45a049] hover:to-[#4CAF50] text-white rounded-full font-semibold transition-all duration-300 ease-in-out transform hover:scale-105"
//           >
//             Return Home
//           </Button>
//         </motion.div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col h-screen bg-gradient-to-br from-[#1F48B0] to-[#4A0E8F]">
//       <motion.div 
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="flex justify-between items-center p-4 bg-white/10 backdrop-blur-sm border-b border-white/20 text-white"
//       >
//         <div className="flex items-center space-x-4">
//           <Button
//             onClick={handleLeaveGame}
//             variant="ghost"
//             className="text-white hover:bg-white/10"
//           >
//             <ArrowLeft className="w-5 h-5 mr-2" />
//             Leave Game
//           </Button>
//           <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-200 via-gray-100 to-white">
//             Game Code: {gameCode}
//           </h2>
//           <motion.span 
//             className="px-4 py-2 bg-white/20 rounded-full flex items-center"
//             animate={{ scale: gameStore.timeLeft <= 10 ? [1, 1.1, 1] : 1 }}
//             transition={{ duration: 0.5, repeat: gameStore.timeLeft <= 10 ? Infinity : 0 }}
//           >
//             <Clock className="w-4 h-4 mr-2" />
//             {gameStore.timeLeft}s
//           </motion.span>
//         </div>
//         {!gameStore.isGameStarted && gameStore.isOwner && gameStore.players.length >= 2 && (
//           <motion.div
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//           >
//             <Button
//               onClick={handleStartGame}
//               className="bg-gradient-to-r from-[#4CAF50] to-[#45a049] hover:from-[#45a049] hover:to-[#4CAF50] text-white font-semibold py-2 px-6 rounded-full transition-all duration-300 ease-in-out"
//             >
//               Start Game
//             </Button>
//           </motion.div>
//         )}
//         {gameStore.isDrawing && gameStore.currentWord && (
//           <motion.div 
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="px-6 py-3 bg-white/20 rounded-full font-semibold"
//           >
//             Word to draw: <span className="font-bold text-[#FFEB3B]">{gameStore.currentWord}</span>
//           </motion.div>
//         )}
//       </motion.div>

//       <div className="flex flex-1 p-4 space-x-4 text-white">
//         <motion.div 
//           initial={{ opacity: 0, x: -20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.5, delay: 0.2 }}
//           className="w-3/4 flex flex-col space-y-4 bg-white/10 backdrop-blur-sm rounded-3xl p-4 border border-white/20 shadow-lg"
//         >
//           <DrawingCanvas socket={socket} />
//           {gameStore.isDrawing && gameStore.roundActive && (
//             <DrawingTools socket={socket} />
//           )}
//         </motion.div>

//         <motion.div 
//           initial={{ opacity: 0, x: 20 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 0.5, delay: 0.4 }}
//           className="w-1/4 flex flex-col space-y-4"
//         >
//           <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-4 border border-white/20 shadow-lg">
//             <h3 className="text-xl font-semibold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-200 via-gray-100 to-white">
//               Players
//             </h3>
//             <div className="space-y-2">
//               <AnimatePresence>
//                 {gameStore.players.map((player) => (
//                   <motion.div
//                     key={player.address}
//                     initial={{ opacity: 0, y: -10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: 10 }}
//                     transition={{ duration: 0.3 }}
//                     className="flex justify-between items-center bg-white/5 rounded-full px-4 py-2 transition-all duration-300 ease-in-out hover:bg-white/10"
//                   >
//                     <span className="flex items-center">
//                       {player.address === gameStore.currentDrawer && (
//                         <Palette className="w-4 h-4 mr-2 text-[#FFEB3B]" />
//                       )}
//                       {player.name || `Player ${player.address.slice(0, 6)}...`}
//                     </span>
//                     <motion.span 
//                       className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#FF4B4B] to-[#FFEB3B]"
//                       animate={{ scale: [1, 1.1, 1] }}
//                       transition={{ duration: 0.5 }}
//                     >
//                       {gameStore.points[player.address] || 0}
//                     </motion.span>
//                   </motion.div>
//                 ))}
//               </AnimatePresence>
//             </div>
//           </div>
//           <Chat socket={socket} />
//         </motion.div>
//       </div>
//     </div>
//   );
// };