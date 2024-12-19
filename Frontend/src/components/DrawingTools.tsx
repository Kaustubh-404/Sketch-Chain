import { useState } from 'react';

interface DrawingToolsProps {
  socket: any;
}

export const DrawingTools = ({ socket }: DrawingToolsProps) => {
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);

  const colors = [
    '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
    '#ffff00', '#ff00ff', '#00ffff', '#ff9900', '#9900ff'
  ];

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    if (socket) {
      socket.emit('updateDrawingSettings', { color });
    }
  };

  const handleSizeChange = (size: number) => {
    setBrushSize(size);
    if (socket) {
      socket.emit('updateDrawingSettings', { size });
    }
  };

  const clearCanvas = () => {
    if (socket) {
      socket.emit('clearCanvas');
    }
  };

  return (
    <div className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow">
      <div className="flex space-x-2">
        {colors.map((color) => (
          <button
            key={color}
            className={`w-8 h-8 rounded-full border-2 ${
              selectedColor === color ? 'border-gray-900' : 'border-gray-200'
            }`}
            style={{ backgroundColor: color }}
            onClick={() => handleColorChange(color)}
          />
        ))}
      </div>

      <div className="flex items-center space-x-2">
        <label className="text-sm">Size:</label>
        <input
          type="range"
          min="1"
          max="20"
          value={brushSize}
          onChange={(e) => handleSizeChange(Number(e.target.value))}
          className="w-32"
        />
      </div>

      <button
        onClick={clearCanvas}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Clear
      </button>
    </div>
  );
};