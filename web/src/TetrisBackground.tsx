import React, { useRef, useEffect } from 'react';

const COLS = 10;
const ROWS = 20;
const BOARD_PADDING = 32; // px padding from edges
const BLOCK_SIZE = 36;
const COLORS = [
  '#01cdfe', // neon blue
  '#ff71ce', // neon pink
  '#b967ff', // neon purple
  '#05ffa1', // neon green
  '#fff600', // neon yellow
  '#fffb96', // neon light yellow
  '#ffb347', // neon orange
];
const BG_COLOR = '#1a1a2e';
const GLOW = '0 0 10px #fff, 0 0 20px #01cdfe, 0 0 40px #ff71ce';

const SHAPES = [
  // I
  [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  // J
  [
    [2, 0, 0],
    [2, 2, 2],
    [0, 0, 0],
  ],
  // L
  [
    [0, 0, 3],
    [3, 3, 3],
    [0, 0, 0],
  ],
  // O
  [
    [4, 4],
    [4, 4],
  ],
  // S
  [
    [0, 5, 5],
    [5, 5, 0],
    [0, 0, 0],
  ],
  // T
  [
    [0, 6, 0],
    [6, 6, 6],
    [0, 0, 0],
  ],
  // Z
  [
    [7, 7, 0],
    [0, 7, 7],
    [0, 0, 0],
  ],
];

function randomShape() {
  const idx = Math.floor(Math.random() * SHAPES.length);
  return { shape: SHAPES[idx], color: COLORS[idx] };
}

function drawBlock(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, size: number) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 24;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, size, size);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, size, size);
  ctx.restore();
}

const TetrisBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const board = useRef<number[][]>(Array.from({ length: ROWS }, () => Array(COLS).fill(0)));
  const current = useRef<any>(null);
  const pos = useRef({ x: 3, y: 0 });
  const dropTime = useRef(0);
  const speed = 350; // ms

  // Reset board
  function resetBoard() {
    board.current = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  }

  // Place current piece on the board
  function merge() {
    const { shape } = current.current;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          board.current[pos.current.y + y][pos.current.x + x] = shape[y][x];
        }
      }
    }
  }

  // Check collision
  function collide(offsetY = 0, offsetX = 0) {
    const { shape } = current.current;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (
          shape[y][x] &&
          (board.current[pos.current.y + y + offsetY]?.[pos.current.x + x + offsetX] ||
            pos.current.y + y + offsetY >= ROWS ||
            pos.current.x + x + offsetX < 0 ||
            pos.current.x + x + offsetX >= COLS)
        ) {
          return true;
        }
      }
    }
    return false;
  }

  // Remove full lines
  function clearLines() {
    board.current = board.current.filter(row => row.some(cell => !cell));
    while (board.current.length < ROWS) {
      board.current.unshift(Array(COLS).fill(0));
    }
  }

  // Draw the board and current piece
  function draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // Draw board
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (board.current[y][x]) {
          drawBlock(ctx, x * BLOCK_SIZE, y * BLOCK_SIZE, COLORS[board.current[y][x] - 1], BLOCK_SIZE);
        }
      }
    }
    // Draw current piece
    const { shape, color } = current.current;
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          drawBlock(ctx, (pos.current.x + x) * BLOCK_SIZE, (pos.current.y + y) * BLOCK_SIZE, color, BLOCK_SIZE);
        }
      }
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let blockSize = 36; // default
    function resizeCanvas() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Calculate block size to fit the board in the viewport with padding
      const maxBlockWidth = (window.innerWidth - 2 * BOARD_PADDING) / COLS;
      const maxBlockHeight = (window.innerHeight - 2 * BOARD_PADDING) / ROWS;
      blockSize = Math.floor(Math.min(maxBlockWidth, maxBlockHeight));
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    resetBoard();
    current.current = randomShape();
    pos.current = { x: 3, y: 0 };
    dropTime.current = Date.now();

    let animationFrameId: number;
    function loop() {
      if (!canvas || !ctx) return;
      const now = Date.now();
      if (now - dropTime.current > speed) {
        // Try to move down
        if (!collide(1, 0)) {
          pos.current.y += 1;
        } else {
          merge();
          clearLines();
          current.current = randomShape();
          pos.current = { x: 3, y: 0 };
          if (collide()) {
            resetBoard();
          }
        }
        dropTime.current = now;
      }
      // Fill the whole canvas with the background color
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Center the Tetris board
      const boardWidth = COLS * blockSize;
      const boardHeight = ROWS * blockSize;
      const offsetX = (canvas.width - boardWidth) / 2;
      const offsetY = (canvas.height - boardHeight) / 2;
      ctx.save();
      ctx.translate(offsetX, offsetY);
      draw(ctx);
      ctx.restore();
      animationFrameId = requestAnimationFrame(loop);
    }
    loop();
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        opacity: 0.95,
        pointerEvents: 'none',
        filter: 'none',
        display: 'block',
        background: 'transparent',
      }}
    />
  );
};

export default TetrisBackground; 