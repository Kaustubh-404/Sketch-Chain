// import { useEffect, useState } from 'react';
// import { useScribbleContract } from '@/hooks/useScribbleContract';
// import { LoadingSpinner } from '@/components/LoadingSpinner';
// import { formatEther } from 'viem';

// interface GameHistory {
//   gameCode: string;
//   winner: string;
//   prizeAmount: bigint;
//   timestamp: number;
// }

// export default function History() {
//   const [history, setHistory] = useState<GameHistory[]>([]);
//   const [loading, setLoading] = useState(true);
//   const { getGameHistory } = useScribbleContract();

//   useEffect(() => {
//     const fetchHistory = async () => {
//       try {
//         const gameHistory = await getGameHistory();
//         setHistory(gameHistory);
//       } catch (error) {
//         console.error('Error fetching history:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchHistory();
//   }, []);

//   if (loading) {
//     return <LoadingSpinner />;
//   }

//   return (
//     <div className="min-h-screen p-8">
//       <h1 className="text-2xl font-bold mb-6">Game History</h1>
      
//       <div className="grid gap-4">
//         {history.map((game, index) => (
//           <div
//             key={index}
//             className="p-4 border rounded shadow"
//           >
//             <div className="flex justify-between">
//               <span>Game Code: {game.gameCode}</span>
//               <span>Prize: {formatEther(game.prizeAmount)} ETH</span>
//             </div>
//             <div className="text-sm text-gray-500">
//               {new Date(Number(game.timestamp) * 1000).toLocaleString()}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// src/pages/history.tsx
import { useEffect, useState } from 'react';
import { useScribbleContract } from '@/hooks/useScribbleContract';
import { formatEther } from 'viem';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAccount } from 'wagmi';

interface GameHistoryItem {
  gameCode: string;
  winner: string;
  prizeAmount: bigint;
  timestamp: number;
  transactionHash?: string;
}

export default function History() {
  const [history, setHistory] = useState<GameHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { getGameHistory } = useScribbleContract();
  const { address } = useAccount();

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const gameHistory = await getGameHistory();
        setHistory(gameHistory);
      } catch (error) {
        console.error('Error loading history:', error);
      } finally {
        setLoading(false);
      }
    };

    if (address) {
      loadHistory();
    }
  }, [address]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Games Yet</h2>
          <p className="text-gray-600">Start playing to build your history!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Game History</h1>
      
      <div className="grid gap-4">
        {history.map((game, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow p-6 transition-all hover:shadow-lg"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-500">Game Code</p>
                <p className="font-medium">{game.gameCode}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Prize</p>
                <p className="font-bold text-green-600">
                  {formatEther(game.prizeAmount)} MNT
                </p>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Winner</p>
                <p className="font-medium">
                  {game.winner === address ? 'You' : `${game.winner.slice(0, 6)}...${game.winner.slice(-4)}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Date</p>
                <p className="text-gray-600">
                  {new Date(game.timestamp * 1000).toLocaleDateString()}
                </p>
              </div>
            </div>

            {game.transactionHash && (
              <div className="mt-4 pt-4 border-t">
                <a
                  href={`https://explorer.testnet.mantle.xyz/tx/${game.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 text-sm"
                >
                  View Transaction ↗
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}