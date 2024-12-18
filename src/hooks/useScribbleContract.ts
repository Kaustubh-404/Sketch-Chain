// import { useState } from 'react';
// import { useAccount, useWalletClient } from 'wagmi';
// import { formatEther, parseEther, getContract, Address } from 'viem';
// import { SCRIBBLE_CONTRACT_ADDRESS, SCRIBBLE_CONTRACT_ABI } from '@/config/contract';
// import { toast } from 'react-hot-toast';

// // Ensure the contract address is properly typed as `0x${string}`
// const CONTRACT_ADDRESS = SCRIBBLE_CONTRACT_ADDRESS as Address;

// export const useScribbleContract = () => {
//   const { address } = useAccount();
//   const { data: walletClient } = useWalletClient();
//   const [loading, setLoading] = useState(false);

//   // Create contract instance using viem
//   const getContractInstance = () => {
//     if (!walletClient) throw new Error('Wallet not connected');
//     return getContract({
//       address: CONTRACT_ADDRESS,
//       abi: SCRIBBLE_CONTRACT_ABI,
//       walletClient,
//     });
//   };

//   const createRoom = async (maxPlayers: number, wagerAmount: string) => {
//     try {
//       setLoading(true);
//       if (!address || !walletClient) throw new Error('Wallet not connected');

//       const contract = getContractInstance();
//       const gameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
//       const wagerInWei = parseEther(wagerAmount);

//       const hash = await contract.write.createRoom([gameCode, maxPlayers], {
//         value: wagerInWei,
//       });
//       await walletClient.waitForTransactionReceipt({ hash });

//       toast.success('Room created successfully!');
//       return gameCode;
//     } catch (error: any) {
//       console.error('Error creating room:', error);
//       toast.error(error.message || 'Failed to create room');
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const joinRoom = async (gameCode: string) => {
//     try {
//       setLoading(true);
//       if (!address || !walletClient) throw new Error('Wallet not connected');

//       const contract = getContractInstance();
//       const room = await contract.read.getRoomDetails([gameCode]);
//       if (!room.isActive) throw new Error('Room is not active');
//       if (room.players.length >= room.maxPlayers) throw new Error('Room is full');

//       const hash = await contract.write.joinRoom([gameCode], {
//         value: room.wagerAmount,
//       });
//       await walletClient.waitForTransactionReceipt({ hash });

//       toast.success('Joined room successfully!');
//     } catch (error: any) {
//       console.error('Error joining room:', error);
//       toast.error(error.message || 'Failed to join room');
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updatePoints = async (gameCode: string, points: number) => {
//     try {
//       if (!address || !walletClient) throw new Error('Wallet not connected');

//       const contract = getContractInstance();
//       const hash = await contract.write.updatePoints([gameCode, address as Address, points]);
//       await walletClient.waitForTransactionReceipt({ hash });
//     } catch (error: any) {
//       console.error('Error updating points:', error);
//       throw error;
//     }
//   };

//   const endGame = async (gameCode: string) => {
//     try {
//       setLoading(true);
//       if (!address || !walletClient) throw new Error('Wallet not connected');

//       const contract = getContractInstance();
//       const hash = await contract.write.endGame([gameCode]);
//       await walletClient.waitForTransactionReceipt({ hash });

//       toast.success('Game ended successfully!');
//     } catch (error: any) {
//       console.error('Error ending game:', error);
//       toast.error(error.message || 'Failed to end game');
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getGameHistory = async () => {
//     try {
//       if (!address) throw new Error('Wallet not connected');
//       const contract = getContractInstance();
//       const history = await contract.read.getPlayerHistory([address as Address]);
//       return history;
//     } catch (error: any) {
//       console.error('Error fetching history:', error);
//       toast.error('Failed to fetch game history');
//       return [];
//     }
//   };

//   return {
//     createRoom,
//     joinRoom,
//     updatePoints,
//     endGame,
//     getGameHistory,
//     loading,
//   };
// };

// src/hooks/useScribbleContract.ts
// import { useState } from 'react';
// import { 
//   useAccount, 
//   useWriteContract,
//   usePublicClient,
//   useWaitForTransactionReceipt
// } from 'wagmi';
// import { parseEther, Address } from 'viem';
// import { SCRIBBLE_CONTRACT_ADDRESS, SCRIBBLE_CONTRACT_ABI } from '@/config/contract';
// import { toast } from 'react-hot-toast';

// const CONTRACT_ADDRESS = SCRIBBLE_CONTRACT_ADDRESS as Address;

// export const useScribbleContract = () => {
//   const { address } = useAccount();
//   const publicClient = usePublicClient();
//   const [loading, setLoading] = useState(false);
//   const { writeContractAsync } = useWriteContract();
//   const { data: transactionReceipt } = useWaitForTransactionReceipt();

//   const waitForTransaction = async (hash: `0x${string}`) => {
//     if (!publicClient) throw new Error('No public client');
//     return await publicClient.waitForTransactionReceipt({ hash });
//   };

//   const createRoom = async (maxPlayers: number, wagerAmount: string) => {
//     try {
//       setLoading(true);
//       if (!address || !publicClient) throw new Error('Wallet not connected');

//       const gameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
//       const wagerInWei = parseEther(wagerAmount);

//       const hash = await writeContractAsync({
//         address: CONTRACT_ADDRESS,
//         abi: SCRIBBLE_CONTRACT_ABI,
//         functionName: 'createRoom',
//         args: [gameCode, BigInt(maxPlayers)],
//         value: wagerInWei
//       });

//       await waitForTransaction(hash);
//       toast.success('Room created successfully!');
//       return gameCode;
//     } catch (error: any) {
//       console.error('Error creating room:', error);
//       toast.error(error.message || 'Failed to create room');
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const joinRoom = async (gameCode: string) => {
//     try {
//       setLoading(true);
//       if (!address || !publicClient) throw new Error('Wallet not connected');

//       const room = await publicClient.readContract({
//         address: CONTRACT_ADDRESS,
//         abi: SCRIBBLE_CONTRACT_ABI,
//         functionName: 'getRoomDetails',
//         args: [gameCode]
//       });

//       if (!room[4]) throw new Error('Room is not active');
//       if (room[2] <= room[3].length) throw new Error('Room is full');

//       const hash = await writeContractAsync({
//         address: CONTRACT_ADDRESS,
//         abi: SCRIBBLE_CONTRACT_ABI,
//         functionName: 'joinRoom',
//         args: [gameCode],
//         value: room[1]
//       });

//       await waitForTransaction(hash);
//       toast.success('Joined room successfully!');
//     } catch (error: any) {
//       console.error('Error joining room:', error);
//       toast.error(error.message || 'Failed to join room');
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };
// import { useState } from 'react';
// import { 
//   useAccount, 
//   useWriteContract,
//   usePublicClient,
// } from 'wagmi';
// import { parseEther, Address } from 'viem';
// import { SCRIBBLE_CONTRACT_ADDRESS, SCRIBBLE_CONTRACT_ABI } from '@/config/contract';
// import { toast } from 'react-hot-toast';

// const CONTRACT_ADDRESS = SCRIBBLE_CONTRACT_ADDRESS;

// interface RoomDetails {
//   owner: Address;
//   wagerAmount: bigint;
//   maxPlayers: bigint;
//   players: Address[];
//   isActive: boolean;
//   isCompleted: boolean;
//   winner: Address;
// }

// export const useScribbleContract = () => {
//   const { address } = useAccount();
//   const publicClient = usePublicClient();
//   const [loading, setLoading] = useState(false);
//   const { writeContractAsync } = useWriteContract();

//   const waitForTransaction = async (hash: `0x${string}`) => {
//     if (!publicClient) throw new Error('No public client');
//     return await publicClient.waitForTransactionReceipt({ hash });
//   };

//   const getRoomDetails = async (gameCode: string): Promise<RoomDetails> => {
//     if (!publicClient) throw new Error('No public client');
    
//     try {
//       const data = await publicClient.readContract({
//         address: CONTRACT_ADDRESS,
//         abi: SCRIBBLE_CONTRACT_ABI,
//         functionName: 'getRoomDetails',
//         args: [gameCode]
//       });

//       // Contract returns an array of values that we need to structure
//       const [owner, wagerAmount, maxPlayers, players, isActive, isCompleted, winner] = data as [
//         Address,
//         bigint,
//         bigint,
//         Address[],
//         boolean,
//         boolean,
//         Address
//       ];

//       return {
//         owner,
//         wagerAmount,
//         maxPlayers,
//         players,
//         isActive,
//         isCompleted,
//         winner
//       };
//     } catch (error) {
//       console.error('Error getting room details:', error);
//       throw new Error('Room does not exist or is not active');
//     }
//   };

//   const createRoom = async (maxPlayers: number, wagerAmount: string) => {
//     try {
//       setLoading(true);
//       if (!address || !publicClient) throw new Error('Wallet not connected');

//       const gameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
//       const wagerInWei = parseEther(wagerAmount);

//       const hash = await writeContractAsync({
//         address: CONTRACT_ADDRESS,
//         abi: SCRIBBLE_CONTRACT_ABI,
//         functionName: 'createRoom',
//         args: [gameCode, BigInt(maxPlayers)],
//         value: wagerInWei
//       });

//       await waitForTransaction(hash);
//       toast.success('Room created successfully!');
//       return gameCode;
//     } catch (error: any) {
//       console.error('Error creating room:', error);
//       toast.error(error.message || 'Failed to create room');
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const joinRoom = async (gameCode: string) => {
//     try {
//       setLoading(true);
//       if (!address || !publicClient) throw new Error('Wallet not connected');

//       // Get room details
//       const room = await getRoomDetails(gameCode);

//       if (!room.isActive) throw new Error('Room is not active');
//       if (room.players.length >= Number(room.maxPlayers)) throw new Error('Room is full');
//       if (room.isCompleted) throw new Error('Game is already completed');

//       const hash = await writeContractAsync({
//         address: CONTRACT_ADDRESS,
//         abi: SCRIBBLE_CONTRACT_ABI,
//         functionName: 'joinRoom',
//         args: [gameCode],
//         value: room.wagerAmount
//       });

//       await waitForTransaction(hash);
//       toast.success('Joined room successfully!');
//     } catch (error: any) {
//       console.error('Error joining room:', error);
//       toast.error(error.message || 'Failed to join room');
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };


//   const updatePoints = async (gameCode: string, points: number) => {
//     try {
//       if (!address || !publicClient) throw new Error('Wallet not connected');

//       const hash = await writeContractAsync({
//         address: CONTRACT_ADDRESS,
//         abi: SCRIBBLE_CONTRACT_ABI,
//         functionName: 'updatePoints',
//         args: [gameCode, address as Address, BigInt(points)]
//       });

//       await waitForTransaction(hash);
//     } catch (error: any) {
//       console.error('Error updating points:', error);
//       throw error;
//     }
//   };

//   const endGame = async (gameCode: string) => {
//     try {
//       setLoading(true);
//       if (!address || !publicClient) throw new Error('Wallet not connected');

//       const hash = await writeContractAsync({
//         address: CONTRACT_ADDRESS,
//         abi: SCRIBBLE_CONTRACT_ABI,
//         functionName: 'endGame',
//         args: [gameCode]
//       });

//       await waitForTransaction(hash);
//       toast.success('Game ended successfully!');
//     } catch (error: any) {
//       console.error('Error ending game:', error);
//       toast.error(error.message || 'Failed to end game');
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getGameHistory = async () => {
//     try {
//       if (!address || !publicClient) throw new Error('Wallet not connected');
      
//       const history = await publicClient.readContract({
//         address: CONTRACT_ADDRESS,
//         abi: SCRIBBLE_CONTRACT_ABI,
//         functionName: 'getPlayerHistory',
//         args: [address as Address]
//       });

//       return history;
//     } catch (error: any) {
//       console.error('Error fetching history:', error);
//       toast.error('Failed to fetch game history');
//       return [];
//     }
//   };

//   return {
//     createRoom,
//     joinRoom,
//     updatePoints,
//     endGame,
//     getGameHistory,
//     loading,
//   };
// };


// src/hooks/useScribbleContract.ts
// import { useState } from 'react';
// import { 
//   useAccount, 
//   useWriteContract,
//   usePublicClient,
// } from 'wagmi';
// import { parseEther, Address, getAddress } from 'viem';
// import { SCRIBBLE_CONTRACT_ADDRESS, SCRIBBLE_CONTRACT_ABI } from '@/config/contract';
// import { toast } from 'react-hot-toast';

// interface RoomDetails {
//   owner: Address;
//   wagerAmount: bigint;
//   maxPlayers: bigint;
//   players: Address[];
//   isActive: boolean;
//   isCompleted: boolean;
//   winner: Address;
// }

// interface GameHistory {
//   gameCode: string;
//   winner: Address;
//   prizeAmount: bigint;
//   timestamp: bigint;
// }

// export const useScribbleContract = () => {
//   const { address: userAddress } = useAccount();
//   const publicClient = usePublicClient();
//   const [loading, setLoading] = useState(false);
//   const { writeContractAsync } = useWriteContract();

//   const waitForTransaction = async (hash: `0x${string}`) => {
//     if (!publicClient) throw new Error('No public client');
//     return await publicClient.waitForTransactionReceipt({ hash });
//   };

//   const getRoomDetails = async (gameCode: string): Promise<RoomDetails> => {
//     if (!publicClient) throw new Error('No public client');
    
//     try {
//       const data = await publicClient.readContract({
//         address: SCRIBBLE_CONTRACT_ADDRESS,
//         abi: SCRIBBLE_CONTRACT_ABI,
//         functionName: 'getRoomDetails',
//         args: [gameCode]
//       });

//       const [owner, wagerAmount, maxPlayers, players, isActive, isCompleted, winner] = data as [
//         Address,
//         bigint,
//         bigint,
//         Address[],
//         boolean,
//         boolean,
//         Address
//       ];

//       return {
//         owner,
//         wagerAmount,
//         maxPlayers,
//         players,
//         isActive,
//         isCompleted,
//         winner
//       };
//     } catch (error) {
//       console.error('Error getting room details:', error);
//       throw new Error('Room does not exist or is not active');
//     }
//   };

//   const createRoom = async (maxPlayers: number, wagerAmount: string) => {
//     try {
//       setLoading(true);
//       if (!userAddress || !publicClient) throw new Error('Wallet not connected');

//       const gameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
//       const wagerInWei = parseEther(wagerAmount);

//       const hash = await writeContractAsync({
//         address: SCRIBBLE_CONTRACT_ADDRESS,
//         abi: SCRIBBLE_CONTRACT_ABI,
//         functionName: 'createRoom',
//         args: [gameCode, BigInt(maxPlayers)],
//         value: wagerInWei
//       });

//       await waitForTransaction(hash);
//       toast.success('Room created successfully!');
//       return gameCode;
//     } catch (error: any) {
//       console.error('Error creating room:', error);
//       toast.error(error.message || 'Failed to create room');
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const joinRoom = async (gameCode: string) => {
//     try {
//       setLoading(true);
//       if (!userAddress || !publicClient) throw new Error('Wallet not connected');

//       const room = await getRoomDetails(gameCode);

//       if (!room.isActive) throw new Error('Room is not active');
//       if (room.players.length >= Number(room.maxPlayers)) throw new Error('Room is full');
//       if (room.isCompleted) throw new Error('Game is already completed');

//       const hash = await writeContractAsync({
//         address: SCRIBBLE_CONTRACT_ADDRESS,
//         abi: SCRIBBLE_CONTRACT_ABI,
//         functionName: 'joinRoom',
//         args: [gameCode],
//         value: room.wagerAmount
//       });

//       await waitForTransaction(hash);
//       toast.success('Joined room successfully!');
//     } catch (error: any) {
//       console.error('Error joining room:', error);
//       toast.error(error.message || 'Failed to join room');
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updatePoints = async (gameCode: string, points: number) => {
//     try {
//       if (!userAddress || !publicClient) throw new Error('Wallet not connected');

//       const hash = await writeContractAsync({
//         address: SCRIBBLE_CONTRACT_ADDRESS,
//         abi: SCRIBBLE_CONTRACT_ABI,
//         functionName: 'updatePoints',
//         args: [gameCode, getAddress(userAddress), BigInt(points)]
//       });

//       await waitForTransaction(hash);
//     } catch (error: any) {
//       console.error('Error updating points:', error);
//       throw error;
//     }
//   };

//   const endGame = async (gameCode: string) => {
//     try {
//       setLoading(true);
//       if (!userAddress || !publicClient) throw new Error('Wallet not connected');

//       const hash = await writeContractAsync({
//         address: SCRIBBLE_CONTRACT_ADDRESS,
//         abi: SCRIBBLE_CONTRACT_ABI,
//         functionName: 'endGame',
//         args: [gameCode]
//       });

//       await waitForTransaction(hash);
//       toast.success('Game ended successfully!');
//     } catch (error: any) {
//       console.error('Error ending game:', error);
//       toast.error(error.message || 'Failed to end game');
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getGameHistory = async (): Promise<GameHistory[]> => {
//     try {
//       if (!userAddress || !publicClient) throw new Error('Wallet not connected');
      
//       const history = await publicClient.readContract({
//         address: SCRIBBLE_CONTRACT_ADDRESS,
//         abi: SCRIBBLE_CONTRACT_ABI,
//         functionName: 'getPlayerHistory',
//         args: [getAddress(userAddress)]
//       }) as GameHistory[];

//       return history;
//     } catch (error: any) {
//       console.error('Error fetching history:', error);
//       toast.error('Failed to fetch game history');
//       return [];
//     }
//   };

//   return {
//     createRoom,
//     joinRoom,
//     updatePoints,
//     endGame,
//     getGameHistory,
//     getRoomDetails,
//     loading,
//   };
// };



// // src/hooks/useScribbleContract.ts
// import { useState } from 'react';
// import { 
//   useAccount, 
//   useWriteContract,
//   usePublicClient,
// } from 'wagmi';
// import { parseEther, Address, getAddress } from 'viem';
// import { SCRIBBLE_CONTRACT_ADDRESS, SCRIBBLE_CONTRACT_ABI } from '@/config/contract';
// import { toast } from 'react-hot-toast';

// interface RoomDetails {
//   owner: Address;
//   wagerAmount: bigint;
//   maxPlayers: bigint;
//   players: Address[];
//   isActive: boolean;
//   isCompleted: boolean;
//   winner: Address;
// }

// interface GameHistory {
//   gameCode: string;
//   winner: Address;
//   prizeAmount: bigint;
//   timestamp: bigint;
// }

// export const useScribbleContract = () => {
//   const { address: userAddress } = useAccount();
//   const publicClient = usePublicClient();
//   const [loading, setLoading] = useState(false);
//   const { writeContractAsync } = useWriteContract();

//   const waitForTransaction = async (hash: `0x${string}`) => {
//     if (!publicClient) throw new Error('No public client');
//     return await publicClient.waitForTransactionReceipt({ hash });
//   };

//   const getRoomDetails = async (gameCode: string): Promise<RoomDetails | null> => {
//     if (!publicClient) throw new Error('No public client');
//     if (!gameCode) throw new Error('Game code is required');
    
//     try {
//       if (gameCode.length !== 6) {
//         throw new Error('Invalid game code format');
//       }

//       console.log('Getting room details for:', gameCode);

//       const data = await publicClient.readContract({
//         address: SCRIBBLE_CONTRACT_ADDRESS,
//         abi: SCRIBBLE_CONTRACT_ABI,
//         functionName: 'getRoomDetails',
//         args: [gameCode]
//       });

//       console.log('Room details raw data:', data);

//       if (!data) return null;

//       const [owner, wagerAmount, maxPlayers, players, isActive, isCompleted, winner] = data as [
//         Address,
//         bigint,
//         bigint,
//         Address[],
//         boolean,
//         boolean,
//         Address
//       ];

//       const roomDetails = {
//         owner,
//         wagerAmount,
//         maxPlayers,
//         players,
//         isActive,
//         isCompleted,
//         winner
//       };

//       console.log('Processed room details:', roomDetails);
//       return roomDetails;

//     } catch (error: any) {
//       console.error('Error getting room details:', error);
//       if (error.message.includes('revert')) {
//         throw new Error('Room does not exist');
//       }
//       throw error;
//     }
//   };

//   const createRoom = async (maxPlayers: number, wagerAmount: string) => {
//     try {
//       setLoading(true);
//       if (!userAddress || !publicClient) throw new Error('Wallet not connected');

//       // Input validation
//       if (maxPlayers < 2 || maxPlayers > 8) {
//         throw new Error('Number of players must be between 2 and 8');
//       }

//       if (parseFloat(wagerAmount) <= 0) {
//         throw new Error('Wager amount must be greater than 0');
//       }

//       const gameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
//       const wagerInWei = parseEther(wagerAmount);

//       console.log('Creating room with params:', {
//         gameCode,
//         maxPlayers,
//         wagerAmount: wagerInWei.toString()
//       });

//       const hash = await writeContractAsync({
//         address: SCRIBBLE_CONTRACT_ADDRESS,
//         abi: SCRIBBLE_CONTRACT_ABI,
//         functionName: 'createRoom',
//         args: [gameCode, BigInt(maxPlayers)],
//         value: wagerInWei
//       });

//       console.log('Create room transaction hash:', hash);

//       const receipt = await waitForTransaction(hash);
//       console.log('Create room transaction receipt:', receipt);

//       toast.success('Room created successfully!');
//       return gameCode;
//     } catch (error: any) {
//       console.error('Error creating room:', error);
//       if (error.message.includes('insufficient funds')) {
//         toast.error('Insufficient funds to create room');
//       } else {
//         toast.error(error.message || 'Failed to create room');
//       }
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const joinRoom = async (gameCode: string) => {
//     try {
//       setLoading(true);
//       if (!userAddress || !publicClient) throw new Error('Wallet not connected');

//       // Validate game code
//       if (gameCode.length !== 6) {
//         throw new Error('Invalid game code format');
//       }

//       console.log('Fetching room details for game code:', gameCode);

//       const room = await getRoomDetails(gameCode);
      
//       if (!room) {
//         throw new Error('Room not found');
//       }

//       console.log('Room details:', room);

//       // Validate room state
//       if (!room.isActive) throw new Error('Room is not active');
//       if (room.players.length >= Number(room.maxPlayers)) throw new Error('Room is full');
//       if (room.isCompleted) throw new Error('Game is already completed');
//       if (room.players.includes(userAddress as Address)) {
//         throw new Error('You are already in this room');
//       }

//       console.log('Joining room with wager amount:', room.wagerAmount.toString());

//       const hash = await writeContractAsync({
//         address: SCRIBBLE_CONTRACT_ADDRESS,
//         abi: SCRIBBLE_CONTRACT_ABI,
//         functionName: 'joinRoom',
//         args: [gameCode],
//         value: room.wagerAmount
//       });

//       console.log('Join transaction hash:', hash);
//       await waitForTransaction(hash);
//       toast.success('Joined room successfully!');
//     } catch (error: any) {
//       console.error('Error joining room:', error);
//       if (error.message.includes('insufficient funds')) {
//         toast.error('Insufficient funds to join room');
//       } else {
//         toast.error(error.message || 'Failed to join room');
//       }
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updatePoints = async (gameCode: string, points: number) => {
//     try {
//       if (!userAddress || !publicClient) throw new Error('Wallet not connected');

//       console.log('Updating points:', { gameCode, points });

//       const hash = await writeContractAsync({
//         address: SCRIBBLE_CONTRACT_ADDRESS,
//         abi: SCRIBBLE_CONTRACT_ABI,
//         functionName: 'updatePoints',
//         args: [gameCode, getAddress(userAddress), BigInt(points)]
//       });

//       await waitForTransaction(hash);
//       console.log('Points updated successfully');
//     } catch (error: any) {
//       console.error('Error updating points:', error);
//       throw error;
//     }
//   };

//   const endGame = async (gameCode: string) => {
//     try {
//       setLoading(true);
//       if (!userAddress || !publicClient) throw new Error('Wallet not connected');

//       console.log('Ending game:', gameCode);

//       const hash = await writeContractAsync({
//         address: SCRIBBLE_CONTRACT_ADDRESS,
//         abi: SCRIBBLE_CONTRACT_ABI,
//         functionName: 'endGame',
//         args: [gameCode]
//       });

//       await waitForTransaction(hash);
//       toast.success('Game ended successfully!');
//     } catch (error: any) {
//       console.error('Error ending game:', error);
//       toast.error(error.message || 'Failed to end game');
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getGameHistory = async (): Promise<GameHistory[]> => {
//     try {
//       if (!userAddress || !publicClient) throw new Error('Wallet not connected');
      
//       console.log('Fetching game history for address:', userAddress);

//       const history = await publicClient.readContract({
//         address: SCRIBBLE_CONTRACT_ADDRESS,
//         abi: SCRIBBLE_CONTRACT_ABI,
//         functionName: 'getPlayerHistory',
//         args: [getAddress(userAddress)]
//       }) as GameHistory[];

//       console.log('Game history:', history);
//       return history;
//     } catch (error: any) {
//       console.error('Error fetching history:', error);
//       toast.error('Failed to fetch game history');
//       return [];
//     }
//   };

//   return {
//     createRoom,
//     joinRoom,
//     updatePoints,
//     endGame,
//     getGameHistory,
//     getRoomDetails,
//     loading,
//   };
// };



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