import { useEffect, useMemo, useState } from 'react';
import {
  type GameState,
  createInitialGame,
  getBestAiMove,
  getCaptureOptions,
  getLegalMovesForPiece,
  getLegalPlacements,
  getPlayerStones,
  hasMillAt,
  moveStone,
  placeStone,
  removeStone,
} from './game/engine';

const BOARD_POINTS = [
  { x: 100, y: 100 },
  { x: 220, y: 100 },
  { x: 340, y: 100 },
  { x: 340, y: 220 },
  { x: 340, y: 340 },
  { x: 220, y: 340 },
  { x: 100, y: 340 },
  { x: 100, y: 220 },
  { x: 160, y: 160 },
  { x: 220, y: 160 },
  { x: 280, y: 160 },
  { x: 280, y: 220 },
  { x: 280, y: 280 },
  { x: 220, y: 280 },
  { x: 160, y: 280 },
  { x: 160, y: 220 },
  { x: 220, y: 220 },
  { x: 160, y: 100 },
  { x: 280, y: 100 },
  { x: 340, y: 160 },
  { x: 340, y: 280 },
  { x: 280, y: 340 },
  { x: 160, y: 340 },
  { x: 100, y: 280 },
];

const BOARD_LINES = [
  [0, 1, 2],
  [2, 3, 4],
  [4, 5, 6],
  [6, 7, 0],
  [8, 9, 10],
  [10, 11, 12],
  [12, 13, 14],
  [14, 15, 8],
  [16, 17, 18],
  [18, 19, 20],
  [20, 21, 22],
  [22, 23, 16],
  [1, 9, 17],
  [3, 11, 19],
  [5, 13, 21],
  [7, 15, 23],
];

function App() {
  const [started, setStarted] = useState(false);
  const [mode, setMode] = useState<'local' | 'ai'>('local');
  const [game, setGame] = useState<GameState>(() => createInitialGame());
  const [selected, setSelected] = useState<number | null>(null);

  const legalPlacements = useMemo(() => getLegalPlacements(game.board), [game.board]);

  const handleBoardClick = (position: number) => {
    if (!started || game.winner) return;

    if (game.captureRequired) {
      const next = removeStone(game, position);
      if (next) {
        setGame(next);
        setSelected(null);
      }
      return;
    }

    if (game.phase === 'placement') {
      if (game.board[position] !== null) return;
      const next = placeStone(game, position);
      if (next) {
        setGame(next);
        setSelected(null);
      }
      return;
    }

    const occupied = game.board[position];

    if (occupied === game.currentPlayer) {
      const moves = getLegalMovesForPiece(game.board, position, game.currentPlayer, game.phase);
      if (moves.length > 0) {
        setSelected(position);
      }
      return;
    }

    if (selected !== null) {
      const next = moveStone(game, selected, position);
      if (next) {
        setGame(next);
        setSelected(null);
      }
    }
  };

  useEffect(() => {
    if (!started || game.winner || mode !== 'ai' || game.captureRequired) return;

    const aiTurn = game.currentPlayer === 'white';
    if (!aiTurn) return;

    const timer = window.setTimeout(() => {
      const move = getBestAiMove(game);
      if (!move) return;

      if (move.type === 'place') {
        const next = placeStone(game, move.position!);
        if (next) setGame(next);
        return;
      }

      if (move.type === 'move') {
        const next = moveStone(game, move.from!, move.to!);
        if (next) setGame(next);
      }
    }, 220);

    return () => window.clearTimeout(timer);
  }, [game, started, mode]);

  const onStart = () => {
    setGame(createInitialGame());
    setSelected(null);
    setStarted(true);
  };

  return (
    <div className="app-shell">
      {!started && (
        <div className="start-overlay">
          <div className="start-panel">
            <div className="eyebrow">STRATEGY MATCH</div>
            <h1>9 Stones — The Master&apos;s Edition</h1>
            <p>A fast, click-first Nine Men&apos;s Morris experience.</p>

            <div className="mode-buttons">
              <button className={mode === 'local' ? 'active' : ''} onClick={() => setMode('local')}>
                Local Match
              </button>
              <button className={mode === 'ai' ? 'active' : ''} onClick={() => setMode('ai')}>
                Play vs AI
              </button>
            </div>

            <button className="start-button" onClick={onStart}>Start Game</button>
          </div>
        </div>
      )}

      {started && (
        <>
          <div className="topbar">
            <div>
              <div className="eyebrow">MASTER STRATEGY</div>
              <h1>9 Stones — The Master&apos;s Edition</h1>
            </div>
            <div className="toolbar">
              <button onClick={onStart}>New Match</button>
            </div>
          </div>

          <div className="status-row">
            <div className={`turn-pill ${game.currentPlayer}`}>
              {game.winner ? `Winner: ${game.winner}` : `Turn: ${game.currentPlayer === 'black' ? 'Black' : 'White'}`}
            </div>
            <div className="meta-pill">Phase: {game.phase}</div>
            <div className="meta-pill">Black: {getPlayerStones(game.board, 'black')}</div>
            <div className="meta-pill">White: {getPlayerStones(game.board, 'white')}</div>
          </div>

          <div className="board-panel">
            <svg viewBox="0 0 440 440" className="board-svg" aria-label="Nine Men's Morris board">
              {BOARD_LINES.map((line, idx) => {
                const [a, b, c] = line;
                const p1 = BOARD_POINTS[a];
                const p2 = BOARD_POINTS[b];
                const p3 = BOARD_POINTS[c];
                return (
                  <g key={idx}>
                    <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} className="mill-line" />
                    <line x1={p2.x} y1={p2.y} x2={p3.x} y2={p3.y} className="mill-line" />
                  </g>
                );
              })}

              {BOARD_POINTS.map((point, index) => {
                const value = game.board[index];
                const isLegal = legalPlacements.includes(index) || (!!selected && getLegalMovesForPiece(game.board, selected, game.currentPlayer, game.phase).includes(index));
                const isSelected = selected === index;
                const isCaptureTarget = game.captureRequired && getCaptureOptions(game.board, game.currentPlayer).includes(index);

                return (
                  <g key={index} onClick={() => handleBoardClick(index)} className="node-group">
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={18}
                      className={[
                        'node',
                        value ? `occupied ${value}` : '',
                        isLegal ? 'legal' : '',
                        isSelected ? 'selected' : '',
                        isCaptureTarget ? 'capture' : '',
                      ].join(' ')}
                    />
                    {value && <circle cx={point.x} cy={point.y} r={10} className={`stone ${value}`} />}
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="panel-grid">
            <div className="panel">
              <h3>Gameplay</h3>
              <ul>
                <li>Click an empty spot to place a stone.</li>
                <li>Click your own stone, then an empty neighbor to move.</li>
                <li>Form a mill to remove one enemy stone.</li>
                <li>When you have three stones left, you may fly anywhere.</li>
              </ul>
            </div>

            <div className="panel">
              <h3>Notes</h3>
              <p>{game.message}</p>
              {game.captureRequired && <p className="capture-warning">Choose an enemy stone to capture.</p>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
