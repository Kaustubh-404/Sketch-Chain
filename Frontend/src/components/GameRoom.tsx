

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