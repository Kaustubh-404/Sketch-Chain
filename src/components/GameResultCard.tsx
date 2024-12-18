import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Pencil } from 'lucide-react';
import { formatEther } from 'viem';

interface GameResultProps {
  isWinner: boolean;
  prize?: bigint;
  playerAddress: string;
}

const GameResultCard: React.FC<GameResultProps> = ({ isWinner, prize, playerAddress }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 50 }}
        animate={{ y: 0 }}
        className={`w-full max-w-md p-8 rounded-2xl shadow-2xl ${
          isWinner 
            ? 'bg-gradient-to-br from-yellow-100 to-yellow-50 border-2 border-yellow-200' 
            : 'bg-gradient-to-br from-blue-100 to-blue-50 border-2 border-blue-200'
        }`}
      >
        <div className="text-center space-y-6">
          {isWinner ? (
            <>
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", duration: 1.5 }}
                className="inline-block"
              >
                <Trophy className="w-16 h-16 text-yellow-500 mx-auto" />
              </motion.div>
              <motion.h2 
                className="text-4xl font-bold text-yellow-800"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                🎉 Victory! 🎉
              </motion.h2>
              <p className="text-yellow-700 text-lg">Congratulations, you've won!</p>
              {prize && (
                <div className="bg-yellow-200/50 rounded-lg p-4 mt-4">
                  <p className="text-yellow-800 font-semibold">Prize Won</p>
                  <p className="text-2xl font-bold text-yellow-900">{formatEther(prize)} MNT</p>
                </div>
              )}
            </>
          ) : (
            <>
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", duration: 1 }}
                className="inline-block"
              >
                <Pencil className="w-16 h-16 text-blue-500 mx-auto" />
              </motion.div>
              <h2 className="text-4xl font-bold text-blue-800">Keep Drawing!</h2>
              <p className="text-blue-700 text-lg">Better luck next time! 🎨</p>
              <p className="text-blue-600 italic mt-2">
                "Practice makes perfect - every game makes you better!"
              </p>
            </>
          )}
          <div className="mt-6 text-gray-500">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 10, ease: 'linear' }}
              className="h-1 bg-gray-300 rounded-full mb-2"
            />
            <p className="text-sm">Redirecting to home page...</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GameResultCard;  