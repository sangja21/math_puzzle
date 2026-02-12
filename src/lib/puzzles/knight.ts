
// Type definition for chess board coordinates
export type Position = { row: number; col: number };

// Board size options
export type BoardSize = 5 | 6 | 7 | 8;

export interface KnightState {
  size: BoardSize;
  board: number[][]; // -1: unvisited, 0: start, 1, 2...: step order
  currentPos: Position | null;
  stepCount: number;
  isComplete: boolean;
  history: Position[];
}

// Possible moves for a Knight (L-shape)
const KNIGHT_MOVES = [
  { row: -2, col: -1 }, { row: -2, col: 1 },
  { row: -1, col: -2 }, { row: -1, col: 2 },
  { row: 1, col: -2 }, { row: 1, col: 2 },
  { row: 2, col: -1 }, { row: 2, col: 1 }
];

/**
 * Initializes the game board.
 */
export const initializeGame = (size: BoardSize): KnightState => {
  const board = Array(size).fill(null).map(() => Array(size).fill(-1));
  return {
    size,
    board,
    currentPos: null,
    stepCount: 0,
    isComplete: false,
    history: [],
  };
};

/**
 * Checks if a position is valid and unvisited.
 */
export const isValidMove = (state: KnightState, pos: Position): boolean => {
  const { size, board } = state;
  if (pos.row < 0 || pos.row >= size || pos.col < 0 || pos.col >= size) {
    return false;
  }
  return board[pos.row][pos.col] === -1;
};

/**
 * Returns all valid next moves from a given position.
 */
export const getValidMoves = (state: KnightState, pos: Position): Position[] => {
  return KNIGHT_MOVES.map(move => ({
    row: pos.row + move.row,
    col: pos.col + move.col
  })).filter(nextPos => isValidMove(state, nextPos));
};

/**
 * Warnsdorff's Rule heuristic for finding the next best move.
 * Always choose the move that has the FEWEST onward moves.
 */
const getWarnsdorffMove = (state: KnightState, pos: Position): Position | null => {
  const moves = getValidMoves(state, pos);
  
  if (moves.length === 0) return null;

  // Sort moves by the number of subsequent valid moves (ascending)
  moves.sort((a, b) => {
    // Simulate move A
    state.board[a.row][a.col] = state.stepCount + 1; // Temporarily mark as visited
    const nextMovesA = getValidMoves(state, a).length;
    state.board[a.row][a.col] = -1; // Unmark

    // Simulate move B
    state.board[b.row][b.col] = state.stepCount + 1;
    const nextMovesB = getValidMoves(state, b).length;
    state.board[b.row][b.col] = -1;

    return nextMovesA - nextMovesB;
  });

  // If there's a tie, maybe randomize? For now, pick first.
  return moves[0];
};

/**
 * Warnsdorff's Algorithm Solver
 * Returns the sequence of moves to complete the tour.
 */
export const solveKnightTour = (size: BoardSize, startPos: Position): Position[] | null => {
  // Create a temporary simulation state
  const simState = initializeGame(size);
  simState.board[startPos.row][startPos.col] = 0;
  simState.currentPos = startPos;
  
  const path: Position[] = [startPos];
  const totalCells = size * size;

  for (let step = 1; step < totalCells; step++) {
    const nextMove = getWarnsdorffMove(simState, simState.currentPos!);
    
    if (!nextMove) {
      // Failed to find a complete tour (dead end)
      return null; 
    }

    // Apply move
    simState.board[nextMove.row][nextMove.col] = step;
    simState.currentPos = nextMove;
    simState.stepCount = step;
    path.push(nextMove);
  }

  return path;
};
