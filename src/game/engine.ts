export type Player = 'black' | 'white';
export type Phase = 'placement' | 'movement' | 'fly';
export type Cell = Player | null;
export type Difficulty = 'blitz' | 'classic' | 'deep';

export type GameState = {
  board: Cell[];
  currentPlayer: Player;
  phase: Phase;
  winner: Player | null;
  message: string;
  captureRequired: boolean;
};

export type MovePlan = {
  type: 'place' | 'move';
  position?: number;
  from?: number;
  to?: number;
};

export const BOARD_SIZE = 24;

export const ADJACENCY: Record<number, number[]> = {
  0: [1, 7, 8, 17],
  1: [0, 2, 9, 18],
  2: [1, 3, 10, 18],
  3: [2, 4, 11, 19],
  4: [3, 5, 12, 20],
  5: [4, 6, 13, 21],
  6: [5, 7, 14, 22],
  7: [0, 6, 15, 23],
  8: [0, 9, 15, 17],
  9: [1, 8, 10, 16],
  10: [2, 9, 11, 18],
  11: [3, 10, 12, 19],
  12: [4, 11, 13, 20],
  13: [5, 12, 14, 21],
  14: [6, 13, 15, 22],
  15: [7, 8, 14, 23],
  16: [9, 11, 13, 15],
  17: [0, 8, 18],
  18: [1, 10, 17, 19],
  19: [3, 11, 18, 20],
  20: [4, 12, 19, 21],
  21: [5, 13, 20, 22],
  22: [6, 14, 21, 23],
  23: [7, 15, 22],
};

export const MILLS: number[][] = [
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

export function otherPlayer(player: Player): Player {
  return player === 'black' ? 'white' : 'black';
}

export function getPlayerStones(board: Cell[], player: Player): number {
  return board.filter((cell) => cell === player).length;
}

export function getLegalPlacements(board: Cell[]): number[] {
  return board.reduce<number[]>((acc, cell, index) => {
    if (cell === null) acc.push(index);
    return acc;
  }, []);
}

export function getPhase(board: Cell[]): Phase {
  const black = getPlayerStones(board, 'black');
  const white = getPlayerStones(board, 'white');

  if (black < 9 || white < 9) return 'placement';
  if (Math.min(black, white) <= 3) return 'fly';
  return 'movement';
}

export function hasMillAt(board: Cell[], position: number, player: Player | null): boolean {
  if (!player) return false;
  return MILLS.some((mill) => mill.includes(position) && mill.every((index) => board[index] === player));
}

export function getCaptureOptions(board: Cell[], player: Player): number[] {
  const opponent = otherPlayer(player);
  const options: number[] = [];

  for (let i = 0; i < board.length; i += 1) {
    if (board[i] !== opponent) continue;
    const inMill = MILLS.some((mill) => mill.includes(i) && mill.every((idx) => board[idx] === opponent));
    const allOpponentInMill = board.every((cell, idx) => {
      if (cell !== opponent) return true;
      return MILLS.some((mill) => mill.includes(idx) && mill.every((j) => board[j] === opponent));
    });

    if (!inMill || allOpponentInMill) {
      options.push(i);
    }
  }

  return options;
}

export function getLegalMovesForPiece(board: Cell[], position: number, player: Player, phase: Phase): number[] {
  if (board[position] !== player) return [];
  if (phase === 'placement') return [];

  const neighbors = ADJACENCY[position] ?? [];
  if (phase === 'fly') {
    return board.reduce<number[]>((acc, cell, index) => {
      if (cell === null) acc.push(index);
      return acc;
    }, []);
  }

  return neighbors.filter((index) => board[index] === null);
}

function advanceTurn(game: GameState, nextBoard: Cell[]): GameState {
  const nextPlayer = otherPlayer(game.currentPlayer);
  const nextPhase = getPhase(nextBoard);
  const opponentStones = getPlayerStones(nextBoard, nextPlayer);

  let winner: Player | null = null;
  let message = `${nextPlayer === 'black' ? 'Black' : 'White'} to move.`;

  if (opponentStones <= 2) {
    winner = game.currentPlayer;
    message = `${game.currentPlayer === 'black' ? 'Black' : 'White'} wins!`;
  }

  return {
    board: nextBoard,
    currentPlayer: nextPlayer,
    phase: nextPhase,
    winner,
    message,
    captureRequired: false,
  };
}

export function createInitialGame(): GameState {
  return {
    board: Array(BOARD_SIZE).fill(null),
    currentPlayer: 'black',
    phase: 'placement',
    winner: null,
    message: 'Black to place the first stone.',
    captureRequired: false,
  };
}

export function placeStone(game: GameState, position: number): GameState | null {
  if (game.phase !== 'placement') return null;
  if (game.board[position] !== null) return null;
  if (game.winner) return null;

  const nextBoard = [...game.board];
  nextBoard[position] = game.currentPlayer;

  const formedMill = hasMillAt(nextBoard, position, game.currentPlayer);
  if (formedMill) {
    const captures = getCaptureOptions(nextBoard, game.currentPlayer);
    if (captures.length > 0) {
      return {
        ...game,
        board: nextBoard,
        phase: getPhase(nextBoard),
        message: `Mill! ${game.currentPlayer === 'black' ? 'Black' : 'White'} must capture a piece.`,
        captureRequired: true,
      };
    }
  }

  return advanceTurn(game, nextBoard);
}

export function moveStone(game: GameState, from: number, to: number): GameState | null {
  if (game.winner) return null;
  if (game.captureRequired) return null;
  if (game.board[from] !== game.currentPlayer) return null;
  if (game.board[to] !== null) return null;

  const legalMoves = getLegalMovesForPiece(game.board, from, game.currentPlayer, game.phase);
  if (!legalMoves.includes(to)) return null;

  const nextBoard = [...game.board];
  nextBoard[from] = null;
  nextBoard[to] = game.currentPlayer;

  const formedMill = hasMillAt(nextBoard, to, game.currentPlayer);
  if (formedMill) {
    const captures = getCaptureOptions(nextBoard, game.currentPlayer);
    if (captures.length > 0) {
      return {
        ...game,
        board: nextBoard,
        phase: getPhase(nextBoard),
        message: `Mill! ${game.currentPlayer === 'black' ? 'Black' : 'White'} must capture a piece.`,
        captureRequired: true,
      };
    }
  }

  return advanceTurn(game, nextBoard);
}

export function removeStone(game: GameState, position: number): GameState | null {
  if (!game.captureRequired) return null;
  if (game.board[position] !== otherPlayer(game.currentPlayer)) return null;
  if (game.winner) return null;

  const nextBoard = [...game.board];
  nextBoard[position] = null;

  const nextPlayer = otherPlayer(game.currentPlayer);
  const nextPhase = getPhase(nextBoard);
  const opponentStones = getPlayerStones(nextBoard, nextPlayer);

  let winner: Player | null = null;
  let message = `${nextPlayer === 'black' ? 'Black' : 'White'} to move.`;

  if (opponentStones <= 2) {
    winner = game.currentPlayer;
    message = `${game.currentPlayer === 'black' ? 'Black' : 'White'} wins!`;
  }

  return {
    board: nextBoard,
    currentPlayer: nextPlayer,
    phase: nextPhase,
    winner,
    message,
    captureRequired: false,
  };
}

export function getBestAiMove(game: GameState): MovePlan | null {
  const legalPlacements = getLegalPlacements(game.board);
  if (game.phase === 'placement') {
    if (legalPlacements.length === 0) return null;
    return { type: 'place', position: legalPlacements[0] };
  }

  const player = game.currentPlayer;
  const possibleMoves: MovePlan[] = [];

  for (let from = 0; from < game.board.length; from += 1) {
    if (game.board[from] !== player) continue;
    const legalTargets = getLegalMovesForPiece(game.board, from, player, game.phase);
    for (const to of legalTargets) {
      possibleMoves.push({ type: 'move', from, to });
    }
  }

  if (possibleMoves.length === 0) return null;
  return possibleMoves[0];
}

export type MovePlan = {
  type: 'place' | 'move';
  position?: number;
  from?: number;
  to?: number;
};
