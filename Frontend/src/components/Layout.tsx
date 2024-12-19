
import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ClientOnly } from './ClientOnly';
import { Palette, History, Home, Pencil, Eraser, PaintBucket, Users, PlusCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";

interface LayoutProps {
  children: ReactNode;
}

const FloatingIcon = ({ Icon, x, y, delay }: { Icon: typeof Pencil; x: number; y: number; delay: number }) => (
  <motion.div
    className="absolute z-0"
    initial={{ opacity: 0, x, y, rotate: 0 }}
    animate={{ 
      opacity: 1, 
      x: [x - 20, x + 20, x], 
      y: [y - 20, y + 20, y],
      rotate: 360
    }}
    transition={{
      opacity: { delay, duration: 0.5 },
      x: { delay, duration: 5, repeat: Infinity, repeatType: 'reverse' },
      y: { delay, duration: 5, repeat: Infinity, repeatType: 'reverse' },
      rotate: { delay, duration: 10, repeat: Infinity, ease: "linear" }
    }}
  >
    <Icon className="w-8 h-8 text-white/50" />
  </motion.div>
);

const Scribble = ({ x, y, delay }: { x: number; y: number; delay: number }) => (
  <motion.div
    className="absolute z-0"
    initial={{ opacity: 0, x, y, scale: 0 }}
    animate={{ 
      opacity: 1, 
      x: [x - 30, x + 30, x], 
      y: [y - 30, y + 30, y],
      scale: [0.8, 1.2, 0.8],
    }}
    transition={{
      opacity: { delay, duration: 0.5 },
      x: { delay, duration: 7, repeat: Infinity, repeatType: 'reverse' },
      y: { delay, duration: 8, repeat: Infinity, repeatType: 'reverse' },
      scale: { delay, duration: 6, repeat: Infinity, repeatType: 'reverse' },
    }}
  >
    <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 10C20 25 40 35 30 50C20 35 40 25 30 10Z" stroke="white" strokeWidth="2" fill="none" />
    </svg>
  </motion.div>
);

const CursorTrail = () => {
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setTrail((prevTrail) => [...prevTrail.slice(-15), { x: e.clientX, y: e.clientY }]);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      {trail.map((point, index) => (
        <motion.div
          key={index}
          className="fixed w-2 h-2 rounded-full bg-white/50 pointer-events-none z-50"
          style={{ left: point.x, top: point.y }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 1, opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      ))}
    </>
  );
};

const ColorfulAvatar = ({ color, delay }: { color: string; delay: number }) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ delay, type: "spring", stiffness: 260, damping: 20 }}
    className={`w-8 h-8 rounded-full ${color} flex items-center justify-center`}
  >
    <div className="w-5 h-5 rounded-full bg-white/20" />
  </motion.div>
);

const AmongUsMinion = ({ color, x, y, delay }: { color: string; x: number; y: number; delay: number }) => (
  <motion.div
    className="absolute z-0"
    initial={{ opacity: 0, x, y }}
    animate={{ opacity: 1, x: [x - 20, x + 20, x], y: [y - 20, y + 20, y] }}
    transition={{
      opacity: { delay, duration: 0.5 },
      x: { delay, duration: 5, repeat: Infinity, repeatType: 'reverse' },
      y: { delay, duration: 5, repeat: Infinity, repeatType: 'reverse' },
    }}
  >
    <motion.div
      className={`w-8 h-10 ${color} rounded-t-full relative`}
      animate={{ rotateY: [0, 180, 0] }}
      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
    >
      <div className="absolute top-1/4 left-1/4 w-4 h-3 bg-[#C6E3FF] rounded-full" />
      <div className="absolute bottom-0 left-0 w-full h-1/3 bg-[#7C9DB5] rounded-b-lg" />
    </motion.div>
  </motion.div>
);

export const Layout = ({ children }: LayoutProps) => {
  const router = useRouter();
  const { address } = useAccount();

  return (
    <div className="min-h-screen bg-[#1F48B0] relative overflow-hidden">
      <motion.div
        className="absolute inset-0 z-0"
        animate={{
          background: [
            'linear-gradient(45deg, #1F48B0, #4A0E8F)',
            'linear-gradient(45deg, #4A0E8F, #1F48B0)',
            'linear-gradient(45deg, #1F48B0, #4A0E8F)',
          ],
        }}
        transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
      />
      
      <FloatingIcon Icon={Pencil} x={50} y={100} delay={0.5} />
      <FloatingIcon Icon={Eraser} x={window.innerWidth - 100} y={150} delay={0.7} />
      <FloatingIcon Icon={PaintBucket} x={200} y={window.innerHeight - 100} delay={0.9} />
      
      <Scribble x={100} y={200} delay={0.3} />
      <Scribble x={window.innerWidth - 150} y={300} delay={0.6} />
      <Scribble x={300} y={window.innerHeight - 200} delay={0.9} />

      <AmongUsMinion color="bg-red-500" x={-50} y={-100} delay={0.5} />
      <AmongUsMinion color="bg-blue-500" x={window.innerWidth - 50} y={-50} delay={0.7} />
      <AmongUsMinion color="bg-green-500" x={-100} y={window.innerHeight - 50} delay={0.9} />
      
      <CursorTrail />
      
      <nav className="backdrop-blur-sm bg-[#1F48B0]/80 border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Palette className="w-8 h-8 text-white" />
              <button
                onClick={() => router.push('/')}
                className="text-2xl font-bold text-white hover:opacity-80 transition-opacity"
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-200 via-gray-100 to-white">
                   SKETCH-CHAIN
                </span>
              </button>
            </motion.div>
            
            <div className="flex items-center gap-6">
              <ClientOnly>
                {address ? (
                  <div className="flex items-center gap-6">
                    <motion.button
                      onClick={() => router.push('/history')}
                      className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <History className="w-5 h-5" />
                      <span className="hidden sm:inline">History</span>
                    </motion.button>
                    <motion.button
                      onClick={() => router.push('/')}
                      className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Home className="w-5 h-5" />
                      <span className="hidden sm:inline">Home</span>
                    </motion.button>
                    <ConnectButton />
                  </div>
                ) : (
                  <ConnectButton />
                )}
              </ClientOnly>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {children}
      </main>

      <footer className="bg-[#1F48B0]/80 border-t border-white/10 py-8 mt-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex gap-2">
              {['bg-[#FF4B4B]', 'bg-[#FF9800]', 'bg-[#FFEB3B]', 'bg-[#4CAF50]', 'bg-[#2196F3]', 'bg-[#9C27B0]'].map((color, i) => (
                <ColorfulAvatar key={color} color={color} delay={0.1 + i * 0.1} />
              ))}
            </div>
            <p className="text-white/80 text-sm text-center">
              © 2023 SKETCH-CHAIN. All rights reserved.
            </p>
            <div className="flex gap-4">
              <motion.a
                href="#"
                className="text-white/80 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                Terms
              </motion.a>
              <motion.a
                href="#"
                className="text-white/80 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                Privacy
              </motion.a>
              <motion.a
                href="#"
                className="text-white/80 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                Contact
              </motion.a>
            </div>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {address && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-8 right-8 z-50"
          >
            <div className="flex gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => router.push('/create')}
                  className="h-14 w-14 rounded-full bg-[#4CAF50] hover:bg-[#45a049] text-white shadow-lg"
                >
                  <PlusCircle className="w-6 h-6" />
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={() => router.push('/join')}
                  className="h-14 w-14 rounded-full bg-[#2196F3] hover:bg-[#1e88e5] text-white shadow-lg"
                >
                  <Users className="w-6 h-6" />
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

