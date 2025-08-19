import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit3, 
  Square, 
  Circle, 
  ArrowRight, 
  Type, 
  Eraser, 
  Palette, 
  Download, 
  Upload, 
  Trash2, 
  Undo, 
  Redo,
  Users,
  X,
  Save
} from 'lucide-react';

interface WhiteboardProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  collaborators?: string[];
}

export const Whiteboard: React.FC<WhiteboardProps> = ({ 
  isOpen, 
  onClose, 
  roomName, 
  collaborators = [] 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<'pen' | 'eraser' | 'text' | 'rectangle' | 'circle' | 'arrow'>('pen');
  const [color, setColor] = useState('#10b981');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const tools = [
    { id: 'pen', name: 'Pen', icon: Edit3 },
    { id: 'eraser', name: 'Eraser', icon: Eraser },
    { id: 'text', name: 'Text', icon: Type },
    { id: 'rectangle', name: 'Rectangle', icon: Square },
    { id: 'circle', name: 'Circle', icon: Circle },
    { id: 'arrow', name: 'Arrow', icon: ArrowRight }
  ];

  const colors = [
    '#10b981', '#3b82f6', '#ef4444', '#f59e0b', 
    '#8b5cf6', '#ec4899', '#000000', '#6b7280'
  ];

  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Set default styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;

    // Save initial state
    saveToHistory(ctx);
  }, [isOpen]);

  const saveToHistory = (ctx: CanvasRenderingContext2D) => {
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
    ctx.lineWidth = tool === 'eraser' ? strokeWidth * 3 : strokeWidth;
    ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    saveToHistory(ctx);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      setHistoryIndex(historyIndex - 1);
      ctx.putImageData(history[historyIndex - 1], 0, 0);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      setHistoryIndex(historyIndex + 1);
      ctx.putImageData(history[historyIndex + 1], 0, 0);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveToHistory(ctx);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${roomName}-whiteboard.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Header */}
          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Edit3 className="w-6 h-6 text-emerald-600" />
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white">{roomName} - Whiteboard</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Collaborative whiteboard • {collaborators.length} collaborators
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={downloadCanvas}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </motion.button>
                <motion.button
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </motion.button>
                <motion.button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </motion.button>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Tools */}
                <div className="flex items-center gap-2">
                  {tools.map(toolOption => {
                    const Icon = toolOption.icon;
                    return (
                      <motion.button
                        key={toolOption.id}
                        onClick={() => setTool(toolOption.id as any)}
                        className={`p-3 rounded-lg transition-colors ${
                          tool === toolOption.id
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        title={toolOption.name}
                      >
                        <Icon className="w-5 h-5" />
                      </motion.button>
                    );
                  })}
                </div>

                {/* Colors */}
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  {colors.map(colorOption => (
                    <motion.button
                      key={colorOption}
                      onClick={() => setColor(colorOption)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        color === colorOption
                          ? 'border-gray-900 dark:border-white scale-110'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      style={{ backgroundColor: colorOption }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    />
                  ))}
                </div>

                {/* Stroke Width */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Size:</span>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={strokeWidth}
                    onChange={(e) => setStrokeWidth(Number(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-6">{strokeWidth}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* History Controls */}
                <motion.button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                >
                  <Undo className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </motion.button>
                <motion.button
                  onClick={redo}
                  disabled={historyIndex >= history.length - 1}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                >
                  <Redo className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </motion.button>
                <motion.button
                  onClick={clearCanvas}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600"
                  whileHover={{ scale: 1.05 }}
                >
                  <Trash2 className="w-5 h-5" />
                </motion.button>

                {/* Collaborators */}
                <div className="flex items-center gap-2 ml-4">
                  <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div className="flex -space-x-2">
                    {collaborators.slice(0, 3).map((collaborator, index) => (
                      <img
                        key={index}
                        src={`https://images.unsplash.com/photo-${1472099645785 + index}?w=32&h=32&fit=crop&crop=face`}
                        alt="Collaborator"
                        className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900"
                      />
                    ))}
                    {collaborators.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs font-medium">
                        +{collaborators.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 bg-white dark:bg-gray-100 p-4">
            <canvas
              ref={canvasRef}
              className="w-full h-full border border-gray-200 dark:border-gray-700 rounded-lg cursor-crosshair bg-white"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};