/**
 * 마방진 게임 커스텀 Hook
 *
 * 핵심 메커니즘 3줄 요약:
 * 1. board와 palette는 항상 상호 배타적 — 숫자는 둘 중 하나에만 존재
 * 2. DnD 이벤트(onDragEnd)에서 source/target을 판별하여 배치/반환/이동/swap 수행
 * 3. 매 액션 후 validateBoard를 호출하여 실시간 검증 결과 & localStorage 동기화
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  MagicSquareState,
  BoardSize,
  GameMode,
  DifficultyLevel,
  ValidationDetail,
} from './types';
import { generateMagicSquare, generateGuidedPuzzle } from './generators';
import { validateBoard } from './validation';
import {
  loadGameState,
  saveGameState,
  createInitialState,
  clearGameState,
} from './storage';
import confetti from 'canvas-confetti';

interface UseMagicSquareGameReturn {
  /** 현재 게임 상태 */
  state: MagicSquareState;
  /** 검증 결과 */
  validation: ValidationDetail;
  /** 보드 크기 변경 */
  changeSize: (size: BoardSize) => void;
  /** 모드 변경 */
  changeMode: (mode: GameMode) => void;
  /** 난이도 변경 */
  changeDifficulty: (difficulty: DifficultyLevel) => void;
  /** 잠금 토글 */
  toggleLockGivens: () => void;
  /** 팔레트 → 보드 배치 */
  placeFromPalette: (value: number, row: number, col: number) => void;
  /** 보드 → 팔레트 반환 */
  returnToPalette: (row: number, col: number) => void;
  /** 보드 셀 → 보드 셀 이동/swap */
  moveOnBoard: (fromRow: number, fromCol: number, toRow: number, toCol: number) => void;
  /** 새 게임 시작 */
  resetGame: () => void;
  /** 새 퍼즐 생성 (가이드 모드) */
  newPuzzle: () => void;
  /** 자동 완성 (개발용) */
  autoSolve: () => void;
  /** 힌트: 맞지 않는 첫 번째 행/열 강조 */
  getHint: () => { type: 'row' | 'col' | 'diag'; index: number } | null;
  /** 선택된 타일 (클릭-클릭 이동용) */
  selectedTile: { value: number; source: 'palette' | 'board'; row?: number; col?: number } | null;
  /** 타일 선택 */
  selectTile: (value: number, source: 'palette' | 'board', row?: number, col?: number) => void;
  /** 타일 선택 해제 */
  clearSelection: () => void;
  /** 셀 클릭 (선택된 타일이 있으면 배치/이동) */
  handleCellClick: (row: number, col: number) => void;
  /** 초기화 완료 여부 */
  isReady: boolean;
}

export function useMagicSquareGame(): UseMagicSquareGameReturn {
  const [state, setState] = useState<MagicSquareState>(() => createInitialState());
  const [isReady, setIsReady] = useState(false);
  const [selectedTile, setSelectedTile] = useState<UseMagicSquareGameReturn['selectedTile']>(null);
  const solvedRef = useRef(false);

  // 초기 로드 (SSR 안전)
  useEffect(() => {
    const saved = loadGameState();
    if (saved) {
      setState(saved);
    }
    setIsReady(true);
  }, []);

  // 상태 변경 시 저장
  useEffect(() => {
    if (isReady) {
      saveGameState(state);
    }
  }, [state, isReady]);

  // 검증 결과 계산
  const validation = validateBoard(state.board);

  // 성공 감지 및 confetti
  useEffect(() => {
    if (validation.isSolved && !solvedRef.current) {
      solvedRef.current = true;
      setState(prev => ({ ...prev, solved: true }));
      // Confetti 발사!
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#4ade80', '#037dd6', '#f6851b'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#4ade80', '#037dd6', '#f6851b'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } else if (!validation.isSolved) {
      solvedRef.current = false;
    }
  }, [validation.isSolved]);

  /** 새 게임 설정 (크기/모드/난이도 변경 시 호출) */
  const setupNewGame = useCallback(
    (size: BoardSize, mode: GameMode, difficulty: DifficultyLevel, lockGivens: boolean) => {
      if (mode === 'guided') {
        const puzzle = generateGuidedPuzzle(size, difficulty);
        setState({
          size,
          mode,
          difficulty,
          lockGivens,
          board: puzzle.board,
          locked: puzzle.locked,
          palette: puzzle.removedNumbers,
          solved: false,
        });
      } else {
        const newState = createInitialState(size, mode, difficulty);
        newState.lockGivens = lockGivens;
        setState(newState);
      }
      setSelectedTile(null);
    },
    []
  );

  const changeSize = useCallback(
    (size: BoardSize) => {
      setupNewGame(size, state.mode, state.difficulty, state.lockGivens);
    },
    [state.mode, state.difficulty, state.lockGivens, setupNewGame]
  );

  const changeMode = useCallback(
    (mode: GameMode) => {
      setupNewGame(state.size, mode, state.difficulty, state.lockGivens);
    },
    [state.size, state.difficulty, state.lockGivens, setupNewGame]
  );

  const changeDifficulty = useCallback(
    (difficulty: DifficultyLevel) => {
      setupNewGame(state.size, state.mode, difficulty, state.lockGivens);
    },
    [state.size, state.mode, state.lockGivens, setupNewGame]
  );

  const toggleLockGivens = useCallback(() => {
    setState(prev => ({ ...prev, lockGivens: !prev.lockGivens }));
  }, []);

  const placeFromPalette = useCallback(
    (value: number, row: number, col: number) => {
      setState(prev => {
        // 잠긴 셀에는 배치 불가
        if (prev.locked[row][col] && prev.lockGivens) return prev;

        const newBoard = prev.board.map(r => [...r]);
        const newPalette = [...prev.palette];

        // 이미 숫자가 있는 셀이면 swap
        const existing = newBoard[row][col];
        if (existing !== null) {
          // 기존 숫자를 팔레트로 반환
          newPalette.push(existing);
        }

        // 팔레트에서 숫자 제거
        const idx = newPalette.indexOf(value);
        if (idx === -1) return prev;
        newPalette.splice(idx, 1);

        // 셀에 배치
        newBoard[row][col] = value;

        // 팔레트 정렬
        newPalette.sort((a, b) => a - b);

        return { ...prev, board: newBoard, palette: newPalette, solved: false };
      });
    },
    []
  );

  const returnToPalette = useCallback((row: number, col: number) => {
    setState(prev => {
      // 잠긴 셀은 반환 불가
      if (prev.locked[row][col] && prev.lockGivens) return prev;

      const value = prev.board[row][col];
      if (value === null) return prev;

      const newBoard = prev.board.map(r => [...r]);
      newBoard[row][col] = null;

      const newPalette = [...prev.palette, value].sort((a, b) => a - b);

      return { ...prev, board: newBoard, palette: newPalette, solved: false };
    });
  }, []);

  const moveOnBoard = useCallback(
    (fromRow: number, fromCol: number, toRow: number, toCol: number) => {
      setState(prev => {
        // 출발지가 잠겼으면 이동 불가
        if (prev.locked[fromRow][fromCol] && prev.lockGivens) return prev;
        // 도착지가 잠겼으면 이동 불가
        if (prev.locked[toRow][toCol] && prev.lockGivens) return prev;

        const fromValue = prev.board[fromRow][fromCol];
        if (fromValue === null) return prev;

        const newBoard = prev.board.map(r => [...r]);
        const toValue = newBoard[toRow][toCol];

        // swap 또는 이동
        newBoard[toRow][toCol] = fromValue;
        newBoard[fromRow][fromCol] = toValue; // null이면 단순 이동, 숫자면 swap

        return { ...prev, board: newBoard, solved: false };
      });
    },
    []
  );

  const resetGame = useCallback(() => {
    setupNewGame(state.size, state.mode, state.difficulty, state.lockGivens);
    clearGameState();
  }, [state.size, state.mode, state.difficulty, state.lockGivens, setupNewGame]);

  const newPuzzle = useCallback(() => {
    setupNewGame(state.size, 'guided', state.difficulty, state.lockGivens);
  }, [state.size, state.difficulty, state.lockGivens, setupNewGame]);

  const autoSolve = useCallback(() => {
    const solution = generateMagicSquare(state.size);
    setState(prev => ({
      ...prev,
      board: solution,
      palette: [],
      solved: false, // validateBoard가 감지할 것
    }));
  }, [state.size]);

  const getHint = useCallback((): { type: 'row' | 'col' | 'diag'; index: number } | null => {
    if (!validation.isFilled) return null;

    for (let i = 0; i < validation.rowSums.length; i++) {
      if (validation.rowSums[i] !== validation.targetSum) {
        return { type: 'row', index: i };
      }
    }
    for (let i = 0; i < validation.colSums.length; i++) {
      if (validation.colSums[i] !== validation.targetSum) {
        return { type: 'col', index: i };
      }
    }
    if (validation.mainDiagSum !== validation.targetSum) {
      return { type: 'diag', index: 0 };
    }
    if (validation.antiDiagSum !== validation.targetSum) {
      return { type: 'diag', index: 1 };
    }

    return null;
  }, [validation]);

  const selectTile = useCallback(
    (value: number, source: 'palette' | 'board', row?: number, col?: number) => {
      setSelectedTile(prev => {
        // 이미 같은 타일이 선택되어 있으면 해제
        if (prev && prev.value === value && prev.source === source) {
          return null;
        }
        return { value, source, row, col };
      });
    },
    []
  );

  const clearSelection = useCallback(() => {
    setSelectedTile(null);
  }, []);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      if (!selectedTile) {
        // 선택된 타일 없음 → 보드 셀의 숫자를 선택
        const value = state.board[row][col];
        if (value !== null && !(state.locked[row][col] && state.lockGivens)) {
          selectTile(value, 'board', row, col);
        }
        return;
      }

      if (selectedTile.source === 'palette') {
        placeFromPalette(selectedTile.value, row, col);
      } else if (selectedTile.source === 'board' && selectedTile.row !== undefined && selectedTile.col !== undefined) {
        if (selectedTile.row === row && selectedTile.col === col) {
          // 같은 셀 클릭 → 팔레트로 반환
          returnToPalette(row, col);
        } else {
          moveOnBoard(selectedTile.row, selectedTile.col, row, col);
        }
      }

      setSelectedTile(null);
    },
    [selectedTile, state.board, state.locked, state.lockGivens, selectTile, placeFromPalette, returnToPalette, moveOnBoard]
  );

  return {
    state,
    validation,
    changeSize,
    changeMode,
    changeDifficulty,
    toggleLockGivens,
    placeFromPalette,
    returnToPalette,
    moveOnBoard,
    resetGame,
    newPuzzle,
    autoSolve,
    getHint,
    selectedTile,
    selectTile,
    clearSelection,
    handleCellClick,
    isReady,
  };
}
