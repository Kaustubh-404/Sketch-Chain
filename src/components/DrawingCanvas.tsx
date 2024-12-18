// src/components/DrawingCanvas.tsx
import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/store/gameStore';

interface Point {
  x: number;
  y: number;
}

export const DrawingCanvas = ({ socket }: { socket: any }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);
  const { isDrawing: canDraw } = useGameStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.strokeStyle = '#000000';
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    // Listen for drawing updates from other players
    if (socket) {
      socket.on('drawUpdate', (data: any) => {
        const drawData = data.lines;
        drawFromData(drawData);
      });
    }
  }, [socket]);

  const drawFromData = (lines: any[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    lines.forEach(line => {
      context.beginPath();
      context.moveTo(line.start.x, line.start.y);
      context.lineTo(line.end.x, line.end.y);
      context.stroke();
    });
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canDraw) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setLastPoint({ x, y });
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canDraw || !lastPoint || !socket) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    context.beginPath();
    context.moveTo(lastPoint.x, lastPoint.y);
    context.lineTo(x, y);
    context.stroke();

    // Emit drawing data
    socket.emit('draw', {
      lines: [{
        start: lastPoint,
        end: { x, y }
      }]
    });

    setLastPoint({ x, y });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPoint(null);
  };

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={400}
      className="border border-gray-300 rounded-lg bg-white"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
    />
  );
};

