

import { useState } from 'react';
import { useRouter } from 'next/router';
import { useScribbleContract } from '@/hooks/useScribbleContract';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function JoinRoom() {
  const [gameCode, setGameCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const router = useRouter();
  const { joinRoom, loading } = useScribbleContract();

  const handleJoinRoom = async () => {
    try {
      if (!gameCode || !playerName) {
        toast.error('Please fill in all fields');
        return;
      }

      if (gameCode.length !== 6) {
        toast.error('Game code must be 6 characters');
        return;
      }

      localStorage.setItem('playerName', playerName);
      await joinRoom(gameCode);
      router.push(`/game/${gameCode}`);
    } catch (error: any) {
      console.error('Failed to join room:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#1F48B0] relative overflow-hidden">
      <div 
        className="absolute inset-0 z-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54 22c0-12-18-8-18 4 0 12-24 8-24-4 0-12 18-8 18 4 0 12 24 8 24-4z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <Card className="bg-white/5 backdrop-blur-sm border-0 shadow-2xl p-8 rounded-3xl">
          <motion.h2 
            className="text-2xl font-medium text-center text-white/90 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Join Game Room
          </motion.h2>

          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-white/70 mb-2">Game Code</p>
              <Input
                type="text"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="h-12 text-lg tracking-wider text-center bg-white/10 border-0 text-white placeholder-white/30 rounded-xl focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-white/70 mb-2">Your Name</p>
              <Input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                maxLength={20}
                className="h-12 bg-white/10 border-0 text-white placeholder-white/30 rounded-xl focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
            </div>

            <Button
              onClick={handleJoinRoom}
              disabled={loading || !gameCode || !playerName}
              className="w-full h-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium text-lg rounded-xl transition-all duration-200 mt-4 border-0 shadow-lg shadow-purple-500/25"
            >
              {loading ? 'Joining...' : 'Join Room'}
            </Button>
          </div>
        </Card>
      </motion.div>
      {loading && <LoadingOverlay message="Joining room..." />}
    </div>
  );
}

