import { useMemo, useState } from 'react';
import {
  type GameState,
  type Player,
  type Position,
  createInitialGame,
  getLegalPlacements,
  getLegalMovesForPiece,
  getPlayerStones,
  moveStone,
  placeStone,
  removeStone,
  hasMillAt,
  otherPlayer,
  isTerminal,
  getBestMove,
  getCaptureOptions,
  getPhase,
  type LineOfPlay,
} from './game/engine';

const boardPositions = [
  { x: 100, y: 100 },
  { x: 220, y: 100 },
  { x: 340, y: 100 },
  { x: 340, y: 220 },
  { x: 340, y: 340 },
  { x: 220, y: 340 },
  { x: 100, y: 340 },
  { x: 100, y: 220 },
  { x: 160, y: 160 },
  { x: 260, y: 160 },
  { x: 260, y: 260 },
  { x: 160, y: 260 },
  { x: 200, y: 200 },
  { x: 260, y: 200 },
  { x: 260, y: 260 },
  { x: 200, y: 260 },
  { x: 220, y: 220 },
  { x: 280, y: 220 },
  { x: 280, y: 280 },
  { x: 220, y: 280 },
  { x: 240, y: 240 },
  { x: 300, y: 240 },
  { x: 300, y: 300 },
  { x: 240, y: 300 },
];

const lines = [
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
  const [game, setGame] = useState<GameState>(() => createInitialGame());
  const [selected, setSelected] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<'blitz' | 'classic' | 'deep'>('classic');
  const [playerMode, setPlayerMode] = useState<'pvp' | 'ai'>('ai');

  const legalPlacements = useMemo(() => getLegalPlacements(game.board), [game.board]);
  const currentPlayer = game.currentPlayer;

  const handleCellClick = (position: number) => {
    if (game.winner || game.status === 'capture') return;

    if (game.currentPlayer === 'black' && playerMode === 'ai') return;

    const board = game.board;
    const occupied = board[position];

    if (game.captureTarget !== null) {
      const captureResult = removeStone(game, position);
      if (captureResult) {
        setGame(captureResult);
        setSelected(null);
      }
      return;
    }

    if (game.phase === 'placement') {
      if (occupied !== null) return;
      const next = placeStone(game, position);
      if (next) {
        setGame(next);
        setSelected(null);
      }
      return;
    }

    if (occupied === currentPlayer) {
      const legalMoves = getLegalMovesForPiece(board, position, currentPlayer, getPhase(game));
      if (legalMoves.length > 0) {
        setSelected(position);
      }
      return;
    }

    if (selected !== null) {
      const moved = moveStone(game, selected, position);
      if (moved) {
        setGame(moved);
        setSelected(null);
      }
    }
  };

  const maybeApplyAiMove = () => {
    if (game.winner || playerMode !== 'ai' || game.currentPlayer !== 'black') return;

    const move = getBestMove(game, difficulty);
    if (!move) return;

    if (move.type === 'place') {
      const next = placeStone(game, move.position);
      if (next) setGame(next);
      return;
    }

    if (move.type === 'move') {
      const next = moveStone(game, move.from, move.to);
      if (next) setGame(next);
      return;
    }

    if (move.type === 'capture') {
      const next = removeStone(game, move.position);
      if (next) setGame(next);
    }
  };

  const resetGame = () => {
    setGame(createInitialGame());
    setSelected(null);
  };

  const aiMoveTimer = useMemo(() => {
    return setTimeout(() => {
      maybeApplyAiMove();
    }, 150);
  }, [game, playerMode, difficulty]);

  return (
    <div className="app-shell">
      <div className="topbar">
        <div>
          <div className="eyebrow">MASTER STRATEGY</div>
          <h1>9 Stones — The Master&apos;s Edition</h1>
        </div>
        <div className="toolbar">
          <select value={playerMode} onChange={(e) => setPlayerMode(e.target.value as 'pvp' | 'ai')}>
            <option value="ai">Play vs AI</option>
            <option value="pvp">Local 2-player</option>
          </select>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as 'blitz' | 'classic' | 'deep')}>
            <option value="blitz">Blitz</option>
            <option value="classic">Classic</option>
            <option value="deep">Deep</option>
          </select>
          <button onClick={resetGame}>New game</button>
        </div>
      </div>

      <div className="status-row">
        <div className={`turn-pill ${currentPlayer}`}>
          {game.winner ? `Winner: ${game.winner}` : `Turn: ${currentPlayer === 'black' ? 'Black' : 'White'}`}
        </div>
        <div className="meta-pill">Phase: {game.phase}</div>
        <div className="meta-pill">Black stones: {getPlayerStones(game.board, 'black')}</div>
        <div className="meta-pill">White stones: {getPlayerStones(game.board, 'white')}</div>
      </div>

      <div className="board-panel">
        <svg viewBox="0 0 440 440" className="board-svg" aria-label="Nine Men's Morris board">
          {lines.map((line, index) => {
            const [a, b, c] = line;
            const p1 = boardPositions[a];
            const p2 = boardPositions[b];
            const p3 = boardPositions[c];
            return (
              <g key={index}>
                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} className="mill-line" />
                <line x1={p2.x} y1={p2.y} x2={p3.x} y2={p3.y} className="mill-line" />
              </g>
            );
          })}

          {boardPositions.map((pos, index) => {
            const value = game.board[index];
            const isTargetable = legalPlacements.includes(index) || (!!selected && getLegalMovesForPiece(game.board, selected, currentPlayer, getPhase(game)).includes(index));
            const isSelected = selected === index;
            const isMill = hasMillAt(game.board, index, value ?? 'black');

            return (
              <g key={index} onClick={() => handleCellClick(index)} className="node-group">
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={18}
                  className={[
                    'node',
                    value ? `occupied ${value}` : '',
                    isSelected ? 'selected' : '',
                    isTargetable ? 'legal' : '',
                    isMill ? 'mill' : '',
                  ]
                    .join(' ')}
                />
                {value && <circle cx={pos.x} cy={pos.y} r={10} className={`stone ${value}`} />}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="panel-grid">
        <div className="panel">
          <h3>Rules</h3>
          <ul>
            <li>Place stones until both players have nine on the board.</li>
            <li>Form a mill to remove one opponent stone not in a mill.</li>
            <li>Move to adjacent intersections once the placement phase ends.</li>
            <li>Fly when you reach three stones remaining.</li>
          </ul>
        </div>

        <div className="panel">
          <h3>Master Notes</h3>
          <p>{game.message}</p>
          {game.captureTarget !== null && (
            <p className="capture-warning">Capture a highlighted enemy stone.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
