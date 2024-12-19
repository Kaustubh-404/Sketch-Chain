


// src/hooks/useScribbleContract.ts
import { useState } from 'react';
import { 
  useAccount, 
  useWriteContract,
  usePublicClient,
} from 'wagmi';
import { parseEther, Address, getAddress, formatEther } from 'viem';
import { SCRIBBLE_CONTRACT_ADDRESS, SCRIBBLE_CONTRACT_ABI } from '@/config/contract';
import { toast } from 'react-hot-toast';

interface RoomDetails {
  owner: Address;
  wagerAmount: bigint;
  maxPlayers: bigint;
  players: Address[];
  isActive: boolean;
  isCompleted: boolean;
  winner: Address;
}

interface GameHistory {
  gameCode: string;
  winner: Address;
  prizeAmount: bigint;
  timestamp: bigint;
}

interface TransactionResult {
  hash: `0x${string}`;
}

export const useScribbleContract = () => {
  const { address: userAddress } = useAccount();
  const publicClient = usePublicClient();
  const [loading, setLoading] = useState(false);
  const { writeContractAsync } = useWriteContract();

  const waitForTransaction = async (hash: `0x${string}`) => {
    if (!publicClient) throw new Error('No public client');
    return await publicClient.waitForTransactionReceipt({ hash });
  };

  const createRoom = async (maxPlayers: number, wagerAmount: string) => {
    try {
      setLoading(true);
      if (!userAddress || !publicClient) throw new Error('Wallet not connected');

      // Input validation
      if (maxPlayers < 2 || maxPlayers > 8) {
        throw new Error('Number of players must be between 2 and 8');
      }

      if (parseFloat(wagerAmount) <= 0) {
        throw new Error('Wager amount must be greater than 0');
      }

      const gameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const wagerInWei = parseEther(wagerAmount);

      console.log('Creating room:', { gameCode, maxPlayers, wagerAmount: wagerInWei.toString() });

      const hash = await writeContractAsync({
        address: SCRIBBLE_CONTRACT_ADDRESS,
        abi: SCRIBBLE_CONTRACT_ABI,
        functionName: 'createRoom',
        args: [gameCode, BigInt(maxPlayers)],
        value: wagerInWei
      });

      console.log('Create room transaction hash:', hash);
      await waitForTransaction(hash);
      
      toast.success('Room created successfully!');
      return gameCode;
    } catch (error: any) {
      console.error('Error creating room:', error);
      if (error.message.includes('insufficient funds')) {
        toast.error('Insufficient funds to create room');
      } else {
        toast.error(error.message || 'Failed to create room');
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (gameCode: string) => {
    try {
      setLoading(true);
      if (!userAddress || !publicClient) throw new Error('Wallet not connected');

      if (gameCode.length !== 6) {
        throw new Error('Invalid game code format');
      }

      console.log('Attempting to join room:', gameCode);

      const hash = await writeContractAsync({
        address: SCRIBBLE_CONTRACT_ADDRESS,
        abi: SCRIBBLE_CONTRACT_ABI,
        functionName: 'joinRoom',
        args: [gameCode]
      });

      console.log('Join transaction hash:', hash);
      await waitForTransaction(hash);
      
      toast.success('Joined room successfully!');
    } catch (error: any) {
      console.error('Error joining room:', error);
      
      if (error.message.includes('insufficient funds')) {
        toast.error('Insufficient funds to join the room');
      } else if (error.message.includes('Already joined')) {
        toast.error('You are already in this room');
      } else if (error.message.includes('Room is full')) {
        toast.error('Room is full');
      } else if (error.message.includes('Room not active')) {
        toast.error('Room is not active');
      } else {
        toast.error('Failed to join room. Please try again.');
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePoints = async (gameCode: string, points: number) => {
    try {
      if (!userAddress || !publicClient) throw new Error('Wallet not connected');

      console.log('Updating points:', { gameCode, points });

      const hash = await writeContractAsync({
        address: SCRIBBLE_CONTRACT_ADDRESS,
        abi: SCRIBBLE_CONTRACT_ABI,
        functionName: 'updatePoints',
        args: [gameCode, getAddress(userAddress), BigInt(points)]
      });

      await waitForTransaction(hash);
      console.log('Points updated successfully');
    } catch (error: any) {
      console.error('Error updating points:', error);
      toast.error('Failed to update points');
      throw error;
    }
  };

  const endGame = async (gameCode: string): Promise<TransactionResult> => {
    try {
      setLoading(true);
      if (!userAddress || !publicClient) throw new Error('Wallet not connected');

      console.log('Ending game:', gameCode);

      const hash = await writeContractAsync({
        address: SCRIBBLE_CONTRACT_ADDRESS,
        abi: SCRIBBLE_CONTRACT_ABI,
        functionName: 'endGame',
        args: [gameCode]
      });

      await waitForTransaction(hash);
      toast.success('Game ended successfully!');
      
      return { hash };
    } catch (error: any) {
      console.error('Error ending game:', error);
      toast.error(error.message || 'Failed to end game');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // const endGame = async (gameCode: string) => {
  //   try {
  //     setLoading(true);
  //     if (!userAddress || !publicClient) throw new Error('Wallet not connected');

  //     console.log('Ending game:', gameCode);

  //     const hash = await writeContractAsync({
  //       address: SCRIBBLE_CONTRACT_ADDRESS,
  //       abi: SCRIBBLE_CONTRACT_ABI,
  //       functionName: 'endGame',
  //       args: [gameCode]
  //     });

  //     await waitForTransaction(hash);
  //     toast.success('Game ended successfully!');
  //   } catch (error: any) {
  //     console.error('Error ending game:', error);
  //     toast.error(error.message || 'Failed to end game');
  //     throw error;
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const getGameHistory = async (): Promise<GameHistory[]> => {
    try {
      if (!userAddress || !publicClient) throw new Error('Wallet not connected');
      
      console.log('Fetching game history for:', userAddress);

      const history = await publicClient.readContract({
        address: SCRIBBLE_CONTRACT_ADDRESS,
        abi: SCRIBBLE_CONTRACT_ABI,
        functionName: 'getPlayerHistory',
        args: [getAddress(userAddress)]
      }) as GameHistory[];

      console.log('Game history:', history);
      return history;
    } catch (error: any) {
      console.error('Error fetching history:', error);
      toast.error('Failed to fetch game history');
      return [];
    }
  };

  return {
    createRoom,
    joinRoom,
    updatePoints,
    endGame,
    getGameHistory,
    loading,
  };
};