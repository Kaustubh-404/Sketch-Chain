
// src/store/gameStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Player } from '@/types/game';

interface GameState {
  currentWord: string;
  currentDrawer: string;
  timeLeft: number;
  points: Record<string, number>;
  players: Player[];
  gameCode: string;
  isDrawing: boolean;
  isGameStarted: boolean;
  roundActive: boolean;
  isOwner: boolean;
  playersWhoDrawn: string[];
  correctGuessers: string[];
  chatMessages: Array<{
    player: string;
    text: string;
    type: 'guess' | 'system' | 'chat';
  }>;
  lastTransactionHash?: string;

  // Actions
  setCurrentWord: (word: string) => void;
  setCurrentDrawer: (drawer: string) => void;
  setTimeLeft: (time: number) => void;
  updatePoints: (address: string, points: number) => void;
  setPlayers: (players: Player[]) => void;
  setGameCode: (code: string) => void;
  setIsDrawing: (isDrawing: boolean) => void;
  setIsGameStarted: (isStarted: boolean) => void;
  setRoundActive: (isActive: boolean) => void;
  setIsOwner: (isOwner: boolean) => void;
  addPlayerWhoDrawn: (address: string) => void;
  addCorrectGuesser: (address: string) => void;
  clearCorrectGuessers: () => void;
  addChatMessage: (message: { player: string; text: string; type: 'guess' | 'system' | 'chat' }) => void;
  setLastTransactionHash: (hash: string) => void;
  reset: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set) => ({
      currentWord: '',
      currentDrawer: '',
      timeLeft: 90,
      points: {},
      players: [],
      gameCode: '',
      isDrawing: false,
      isGameStarted: false,
      roundActive: false,
      isOwner: false,
      playersWhoDrawn: [],
      correctGuessers: [],
      chatMessages: [],
      lastTransactionHash: undefined,

      setCurrentWord: (word) => set({ currentWord: word }),
      setCurrentDrawer: (drawer) => set((state) => ({
        currentDrawer: drawer,
        playersWhoDrawn: !state.playersWhoDrawn.includes(drawer) 
          ? [...state.playersWhoDrawn, drawer]
          : state.playersWhoDrawn
      })),
      setTimeLeft: (time) => set({ timeLeft: time }),
      updatePoints: (address, points) => set((state) => ({
        points: { ...state.points, [address]: points }
      })),
      setPlayers: (players) => set({ players }),
      setGameCode: (code) => set({ gameCode: code }),
      setIsDrawing: (isDrawing) => set({ isDrawing }),
      setIsGameStarted: (isStarted) => set({ isGameStarted: isStarted }),
      setRoundActive: (isActive) => set({ roundActive: isActive }),
      setIsOwner: (isOwner) => set({ isOwner }),
      addPlayerWhoDrawn: (address) => set((state) => ({
        playersWhoDrawn: [...state.playersWhoDrawn, address]
      })),
      addCorrectGuesser: (address) => set((state) => ({
        correctGuessers: [...state.correctGuessers, address]
      })),
      clearCorrectGuessers: () => set({ correctGuessers: [] }),
      addChatMessage: (message) => set((state) => ({
        chatMessages: [...state.chatMessages, message]
      })),
      setLastTransactionHash: (hash) => set({ lastTransactionHash: hash }),
      reset: () => set({
        currentWord: '',
        currentDrawer: '',
        timeLeft: 90,
        points: {},
        players: [],
        gameCode: '',
        isDrawing: false,
        isGameStarted: false,
        roundActive: false,
        isOwner: false,
        playersWhoDrawn: [],
        correctGuessers: [],
        chatMessages: [],
        lastTransactionHash: undefined
      }),
    }),
    {
      name: 'scribble-game-storage',
      partialize: (state) => ({
        points: state.points,
        players: state.players,
        gameCode: state.gameCode,
        playersWhoDrawn: state.playersWhoDrawn,
        lastTransactionHash: state.lastTransactionHash
      })
    }
  )
);