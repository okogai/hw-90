import React, { useEffect, useRef, useState } from 'react';
import { Pixel } from '../../types';

const WS_URL = 'ws://localhost:8000/draw';

const DrawBoard = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [color, setColor] = useState<string>('#000000');
  const [size, setSize] = useState<number>(5);
  const [pixels, setPixels] = useState<Pixel[]>([]);

  useEffect(() => {
    const socket = new WebSocket(WS_URL);
    setWs(socket);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'init' || data.type === 'draw') {
        setPixels(data.pixels);
      }
    };

    socket.onclose = () => console.log('WebSocket closed');

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        pixels.forEach(({ x, y, color, size }) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    }
  }, [pixels]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons !== 1 || !ws) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const pixel: Pixel = { x, y, color, size };

    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'draw', pixels: [pixel] }));
    }

    setPixels((prevPixels) => [...prevPixels, pixel]);
  };
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column'
    }}>
      <h1>Drawing board</h1>
      <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)}/>
        <input type="range" min="1" max="30" value={size} onChange={(e) => setSize(Number(e.target.value))}/>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        style={{border: '1px solid black', cursor: 'pointer'}}
        onMouseMove={handleMouseMove}
      />
    </div>
  );
};

export default DrawBoard;