// src/pages/create.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useScribbleContract } from '@/hooks/useScribbleContract';
import { LoadingOverlay } from '@/components/LoadingOverlay';

export default function CreateRoom() {
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [wagerAmount, setWagerAmount] = useState('1');
  const router = useRouter();
  const { createRoom, loading } = useScribbleContract();

  const handleCreateRoom = async () => {
    try {
      const gameCode = await createRoom(maxPlayers, wagerAmount);
      router.push(`/game/${gameCode}`);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="w-96 space-y-4">
        <h1 className="text-2xl font-bold mb-6 text-[#FFFFD1]">Create Room</h1>
        
        <div>
          <label className="block mb-2 text-[#FFFFD1]">Number of Players</label>
          <input
            type="number"
            min="2"
            max="8"
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(Number(e.target.value))}
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-2 text-[#FFFFD1]">Wager Amount (ETH)</label>
          <input
            type="number"
            min="1"
            step="0.1"
            value={wagerAmount}
            onChange={(e) => setWagerAmount(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        <button
          onClick={handleCreateRoom}
          className="w-full px-6 py-3 bg-blue-500 text-[#FFFFD1]"
          disabled={loading}
        >
          Create Room
        </button>
      </div>
      {loading && <LoadingOverlay message="Creating room..." />}
    </div>
  );
}


