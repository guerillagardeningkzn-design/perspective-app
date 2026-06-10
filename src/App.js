import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Grid3x3, Eye, EyeOff, RotateCcw, Download } from 'lucide-react';

export default function PerspectiveDrawingApp() {
  const canvasRef = useRef(null);
  const [showGuides, setShowGuides] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showHorizon, setShowHorizon] = useState(true);
  const [perspective, setPerspective] = useState('one-point');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLesson, setCurrentLesson] = useState('intro');
  const [vanishingPoints, setVanishingPoints] = useState([
    { x: 0.5, y: 0.3 }
  ]);
  const [strokes, setStrokes] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);

  const lessons = {
    intro: {
      title: 'What is Perspective?',
      content: 'Perspective is the technique of representing three-dimensional objects on a two-dimensional surface to create the illusion of depth and space. Lines recede toward vanishing points on the horizon line.',
      tips: ['Objects appear smaller as they recede', 'Parallel lines converge toward vanishing points', 'Horizon line is at eye level']
    },
    'one-point': {
      title: 'One-Point Perspective',
      content: 'One-point perspective has a single vanishing point where all receding lines converge. This creates a dramatic sense of depth and is perfect for drawing roads, hallways, and symmetrical scenes.',
      tips: ['One central vanishing point', 'All receding lines converge to this point', 'Great for symmetrical compositions']
    },
    'two-point': {
      title: 'Two-Point Perspective',
      content: 'Two-point perspective uses two vanishing points on the horizon line. This is the most common perspective in drawing and creates dynamic compositions with multiple faces visible.',
      tips: ['Two vanishing points on horizon line', 'Vertical lines remain vertical', 'Best for showing corner views']
    },
    'three-point': {
      title: 'Three-Point Perspective',
      content: 'Three-point perspective adds a third vanishing point either above or below the horizon. This creates extreme angles, perfect for dramatic aerial or worm\'s eye views.',
      tips: ['Three vanishing points total', 'Vertical lines also converge', 'Creates dynamic, dramatic angles']
    },
    'construction': {
      title: 'Construction Techniques',
      content: 'Use light construction lines to map out your perspective before adding details. Start with the horizon line and vanishing points, then lay down basic shapes and proportions.',
      tips: ['Start light, go dark', 'Use vanishing point guides', 'Block out major shapes first']
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    // Clear canvas
    ctx.fillStyle = '#fafaf8';
    ctx.fillRect(0, 0, width, height);

    // Apply transformations
    ctx.save();
    ctx.translate(width / 2 + panX, height / 2 + panY);
    ctx.scale(zoom, zoom);
    ctx.translate(-width / 2, -height / 2);

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#e8e6e1';
      ctx.lineWidth = 0.5;
      const gridSize = 40;
      for (let i = 0; i <= width; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i <= height; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }
    }

    // Draw horizon line
    if (showHorizon) {
      ctx.strokeStyle = '#a8a5a0';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      const horizonY = height * 0.35;
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(width, horizonY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#a8a5a0';
      ctx.font = '12px sans-serif';
      ctx.fillText('Horizon Line (Eye Level)', 10, horizonY - 5);
    }

    // Draw vanishing point guides
    if (showGuides && vanishingPoints.length > 0) {
      const horizonY = height * 0.35;
      vanishingPoints.forEach((vp, idx) => {
        const vpX = width * vp.x;
        const vpY = horizonY;

        // Draw convergence lines
        ctx.strokeStyle = idx === 0 ? 'rgba(239, 68, 68, 0.15)' : idx === 1 ? 'rgba(59, 130, 246, 0.15)' : 'rgba(34, 197, 94, 0.15)';
        ctx.lineWidth = 1;

        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 12) {
          const length = Math.max(width, height) * 2;
          ctx.beginPath();
          ctx.moveTo(vpX, vpY);
          ctx.lineTo(vpX + Math.cos(angle) * length, vpY + Math.sin(angle) * length);
          ctx.stroke();
        }

        // Draw vanishing point
        const color = idx === 0 ? '#ef4444' : idx === 1 ? '#3b82f6' : '#22c55e';
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(vpX, vpY, 6, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Draw user strokes
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    strokes.forEach(stroke => {
      if (stroke.length > 0) {
        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);
        stroke.forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
      }
    });

    ctx.restore();
  }, [showGuides, showGrid, showHorizon, vanishingPoints, strokes, zoom, panX, panY, perspective]);

  const handleCanvasMouseDown = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2 - panX) / zoom + rect.width / 2;
    const y = (e.clientY - rect.top - rect.height / 2 - panY) / zoom + rect.height / 2;
    setStrokes([...strokes, [{ x, y }]]);
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2 - panX) / zoom + rect.width / 2;
    const y = (e.clientY - rect.top - rect.height / 2 - panY) / zoom + rect.height / 2;

    const newStrokes = [...strokes];
    if (newStrokes.length > 0) {
      newStrokes[newStrokes.length - 1].push({ x, y });
      setStrokes(newStrokes);
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDrawing(false);
  };

  const updatePerspective = (type) => {
    setPerspective(type);
    if (type === 'one-point') {
      setVanishingPoints([{ x: 0.5, y: 0.3 }]);
    } else if (type === 'two-point') {
      setVanishingPoints([{ x: 0.35, y: 0.3 }, { x: 0.65, y: 0.3 }]);
    } else if (type === 'three-point') {
      setVanishingPoints([
        { x: 0.35, y: 0.3 },
        { x: 0.65, y: 0.3 },
        { x: 0.5, y: 0.8 }
      ]);
    }
  };

  const clearCanvas = () => {
    setStrokes([]);
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'perspective-drawing.png';
    link.click();
  };

  const lesson = lessons[currentLesson];

  return (
    <div className="h-screen bg-white flex overflow-hidden" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Left Sidebar - Lessons */}
      <div className="w-80 bg-gradient-to-b from-slate-50 to-white border-r border-slate-200 overflow-y-auto">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">Perspective</h1>
          <p className="text-xs text-slate-500 mt-1">Master depth & dimension</p>
        </div>

        {/* Lesson Content */}
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">{lesson.title}</h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">{lesson.content}</p>
          <div className="space-y-2">
            {lesson.tips.map((tip, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <span className="text-xs font-semibold text-slate-400 min-w-fit">TIP {idx + 1}</span>
                <p className="text-xs text-slate-600">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Lesson Navigation */}
        <div className="p-4 space-y-2">
          <button
            onClick={() => setCurrentLesson('intro')}
            className={`w-full text-left px-4 py-2 rounded text-sm font-medium transition-colors ${
              currentLesson === 'intro'
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Introduction
          </button>
          <button
            onClick={() => { setCurrentLesson('one-point'); updatePerspective('one-point'); }}
            className={`w-full text-left px-4 py-2 rounded text-sm font-medium transition-colors ${
              currentLesson === 'one-point'
                ? 'bg-red-500 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            One-Point Perspective
          </button>
          <button
            onClick={() => { setCurrentLesson('two-point'); updatePerspective('two-point'); }}
            className={`w-full text-left px-4 py-2 rounded text-sm font-medium transition-colors ${
              currentLesson === 'two-point'
                ? 'bg-blue-500 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Two-Point Perspective
          </button>
          <button
            onClick={() => { setCurrentLesson('three-point'); updatePerspective('three-point'); }}
            className={`w-full text-left px-4 py-2 rounded text-sm font-medium transition-colors ${
              currentLesson === 'three-point'
                ? 'bg-green-500 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Three-Point Perspective
          </button>
          <button
            onClick={() => setCurrentLesson('construction')}
            className={`w-full text-left px-4 py-2 rounded text-sm font-medium transition-colors ${
              currentLesson === 'construction'
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Construction Tips
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b border-slate-200 bg-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowGuides(!showGuides)}
              className="p-2 hover:bg-slate-100 rounded transition-colors"
              title="Toggle vanishing point guides"
            >
              {showGuides ? <Eye size={20} /> : <EyeOff size={20} />}
              <span className="text-xs text-slate-600 ml-1">Guides</span>
            </button>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className="p-2 hover:bg-slate-100 rounded transition-colors"
              title="Toggle grid"
            >
              <Grid3x3 size={20} />
              <span className="text-xs text-slate-600 ml-1">Grid</span>
            </button>
            <button
              onClick={() => setShowHorizon(!showHorizon)}
              className="p-2 hover:bg-slate-100 rounded transition-colors"
              title="Toggle horizon line"
            >
              <span className="text-xs text-slate-600">Horizon</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearCanvas}
              className="px-3 py-2 rounded text-sm font-medium hover:bg-slate-100 transition-colors flex items-center gap-2"
            >
              <RotateCcw size={16} />
              Clear
            </button>
            <button
              onClick={downloadDrawing}
              className="px-3 py-2 rounded text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <Download size={16} />
              Export
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-hidden bg-slate-50 relative">
          <canvas
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            className="w-full h-full cursor-crosshair"
          />

          {/* Zoom and Info */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-sm border border-slate-200 p-3 text-xs text-slate-600">
            <p>Zoom: {(zoom * 100).toFixed(0)}%</p>
            <p className="mt-1">Scroll to zoom • Drag to pan</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
