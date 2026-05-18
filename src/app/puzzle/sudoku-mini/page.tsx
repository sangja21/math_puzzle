'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import {
  type Board,
  type Puzzle,
  PUZZLES,
  SIZE,
  cloneBoard,
  findConflicts,
  isComplete,
  solve,
} from '@/lib/puzzles/sudokuMini';

type Difficulty = 'easy' | 'medium' | 'hard';
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];
const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: '쉬움',
  medium: '보통',
  hard: '어려움',
};

const PUZZLES_BY_DIFFICULTY: Record<Difficulty, Puzzle[]> = {
  easy: PUZZLES.filter((p) => p.difficulty === 'easy'),
  medium: PUZZLES.filter((p) => p.difficulty === 'medium'),
  hard: PUZZLES.filter((p) => p.difficulty === 'hard'),
};

function isGivenCell(initial: Board, row: number, col: number): boolean {
  return initial[row][col] !== 0;
}

export default function SudokuMiniPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const puzzleList = PUZZLES_BY_DIFFICULTY[difficulty];
  const puzzle = puzzleList[puzzleIdx % puzzleList.length];

  const [board, setBoard] = useState<Board>(() => cloneBoard(puzzle.initial));
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [hintCell, setHintCell] = useState<{ row: number; col: number } | null>(null);

  // 퍼즐 바뀌면 상태 리셋
  useEffect(() => {
    setBoard(cloneBoard(puzzle.initial));
    setSelected(null);
    setHintCell(null);
  }, [puzzle]);

  const conflicts = useMemo(() => findConflicts(board), [board]);
  const conflictSet = useMemo(() => {
    const s = new Set<string>();
    for (const { row, col } of conflicts) s.add(`${row},${col}`);
    return s;
  }, [conflicts]);

  const solved = useMemo(() => isComplete(board), [board]);

  const filledCount = useMemo(() => {
    let k = 0;
    for (const row of board) for (const v of row) if (v > 0) k++;
    return k;
  }, [board]);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (isGivenCell(puzzle.initial, row, col)) return;
    setSelected({ row, col });
    setHintCell(null);
  }, [puzzle.initial]);

  const handleNum = useCallback((num: number) => {
    if (!selected) return;
    const { row, col } = selected;
    if (isGivenCell(puzzle.initial, row, col)) return;
    setBoard((prev) => {
      const next = cloneBoard(prev);
      next[row][col] = num;
      return next;
    });
  }, [selected, puzzle.initial]);

  const handleErase = useCallback(() => {
    if (!selected) return;
    const { row, col } = selected;
    if (isGivenCell(puzzle.initial, row, col)) return;
    setBoard((prev) => {
      const next = cloneBoard(prev);
      next[row][col] = 0;
      return next;
    });
  }, [selected, puzzle.initial]);

  const handleHint = useCallback(() => {
    // 정답 한 셀을 공개 — 충돌이 있으면 먼저 정답과 다른 셀, 없으면 첫 빈 셀
    const solution = solve(puzzle.initial);
    if (!solution) return;
    // 1) 잘못 입력된 셀 (정답과 다름, 사용자 입력) 찾기
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (isGivenCell(puzzle.initial, r, c)) continue;
        if (board[r][c] !== 0 && board[r][c] !== solution[r][c]) {
          setBoard((prev) => {
            const next = cloneBoard(prev);
            next[r][c] = solution[r][c];
            return next;
          });
          setHintCell({ row: r, col: c });
          setSelected({ row: r, col: c });
          return;
        }
      }
    }
    // 2) 빈 셀에 정답 채우기
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (isGivenCell(puzzle.initial, r, c)) continue;
        if (board[r][c] === 0) {
          setBoard((prev) => {
            const next = cloneBoard(prev);
            next[r][c] = solution[r][c];
            return next;
          });
          setHintCell({ row: r, col: c });
          setSelected({ row: r, col: c });
          return;
        }
      }
    }
  }, [board, puzzle.initial]);

  const handleReset = useCallback(() => {
    setBoard(cloneBoard(puzzle.initial));
    setSelected(null);
    setHintCell(null);
  }, [puzzle.initial]);

  const handleNextPuzzle = useCallback(() => {
    setPuzzleIdx((i) => (i + 1) % puzzleList.length);
  }, [puzzleList.length]);

  const handleDifficulty = useCallback((d: Difficulty) => {
    if (d === difficulty) return;
    setDifficulty(d);
    setPuzzleIdx(0);
  }, [difficulty]);

  // 키보드 지원 — 1~4 입력, Backspace/0 지우기, 화살표 이동
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '4') {
        handleNum(Number(e.key));
      } else if (e.key === '0' || e.key === 'Backspace' || e.key === 'Delete') {
        handleErase();
      } else if (selected) {
        let { row, col } = selected;
        if (e.key === 'ArrowUp') row = (row + SIZE - 1) % SIZE;
        else if (e.key === 'ArrowDown') row = (row + 1) % SIZE;
        else if (e.key === 'ArrowLeft') col = (col + SIZE - 1) % SIZE;
        else if (e.key === 'ArrowRight') col = (col + 1) % SIZE;
        else return;
        e.preventDefault();
        setSelected({ row, col });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleNum, handleErase, selected]);

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.homeBtn}>🏠 메인으로</Link>

      <header className={styles.header}>
        <h1 className={styles.title}>
          <span>🟦</span> 스도쿠 미니 (4×4)
        </h1>
        <p className={styles.subtitle}>
          가로·세로·<strong>2×2 박스</strong>에 1~4를 한 번씩.
          9×9 스도쿠의 어린이 버전 — 같은 규칙, 더 작은 두뇌 운동.
        </p>
      </header>

      <div className={styles.difficultyRow}>
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            type="button"
            className={`${styles.diffChip} ${styles[`diff_${d}`]} ${difficulty === d ? styles.diffChipActive : ''}`}
            onClick={() => handleDifficulty(d)}
          >
            {DIFFICULTY_LABEL[d]}
          </button>
        ))}
        <div className={styles.puzzleIdx}>
          퍼즐 {(puzzleIdx % puzzleList.length) + 1} / {puzzleList.length}
        </div>
      </div>

      <section className={styles.stage}>
        <div className={styles.statsRow}>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>채움</span>
            <span className={styles.statValue}>{filledCount} / {SIZE * SIZE}</span>
          </div>
          <div className={`${styles.statBox} ${conflicts.length > 0 ? styles.statBoxBad : ''}`}>
            <span className={styles.statLabel}>충돌</span>
            <span className={styles.statValue}>{conflicts.length}</span>
          </div>
          <div className={`${styles.statBox} ${solved ? styles.statBoxGood : ''}`}>
            <span className={styles.statLabel}>상태</span>
            <span className={styles.statValue}>{solved ? '✓ 완성' : '진행 중'}</span>
          </div>
        </div>

        <div className={styles.boardWrap}>
          <div className={styles.board}>
            {Array.from({ length: SIZE }).map((_, row) => (
              <React.Fragment key={row}>
                {Array.from({ length: SIZE }).map((__, col) => {
                  const v = board[row][col];
                  const given = isGivenCell(puzzle.initial, row, col);
                  const isSelected = selected?.row === row && selected?.col === col;
                  const isConflict = conflictSet.has(`${row},${col}`);
                  const isHint = hintCell?.row === row && hintCell?.col === col;
                  // 굵은 경계: 박스 경계선 (col=2, row=2 사이)
                  const borderClass = [
                    row === 1 ? styles.thickBottom : '',
                    col === 1 ? styles.thickRight : '',
                  ].join(' ');
                  return (
                    <button
                      key={`${row}-${col}`}
                      type="button"
                      className={[
                        styles.cell,
                        borderClass,
                        given ? styles.cellGiven : styles.cellInput,
                        isSelected ? styles.cellSelected : '',
                        isConflict ? styles.cellConflict : '',
                        isHint ? styles.cellHint : '',
                      ].filter(Boolean).join(' ')}
                      onClick={() => handleCellClick(row, col)}
                      aria-label={`행 ${row + 1} 열 ${col + 1}${v ? ` 값 ${v}` : ' 빈칸'}`}
                    >
                      {v > 0 ? v : ''}
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        {solved && (
          <div className={styles.celebrate}>
            <span className={styles.celebrateText}>🎉 완성! 잘했어요!</span>
            <button type="button" className={styles.nextBtn} onClick={handleNextPuzzle}>
              ▶ 다음 퍼즐
            </button>
          </div>
        )}
      </section>

      <section className={styles.controlPanel}>
        <div className={styles.numPad}>
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              type="button"
              className={styles.numBtn}
              onClick={() => handleNum(n)}
              disabled={!selected}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            className={styles.eraseBtn}
            onClick={handleErase}
            disabled={!selected}
          >
            ✕ 지우기
          </button>
        </div>

        <div className={styles.btnRow}>
          <button type="button" className={styles.hintBtn} onClick={handleHint} disabled={solved}>
            💡 힌트
          </button>
          <button type="button" className={styles.resetBtn} onClick={handleReset}>
            🔄 리셋
          </button>
          <button type="button" className={styles.newBtn} onClick={handleNextPuzzle}>
            🎲 새 퍼즐
          </button>
        </div>
      </section>

      <details className={styles.help}>
        <summary>4×4 스도쿠는 9×9 와 뭐가 다를까? 🤔</summary>
        <div className={styles.helpBody}>
          <p>
            <strong>규칙:</strong> 가로 한 줄, 세로 한 줄, 그리고 굵은 선으로 묶인{' '}
            <strong>2×2 박스</strong> 각각에 1~4 가 정확히 한 번씩 들어가야 해요.
          </p>
          <p>
            <strong>4×4 vs 9×9:</strong> 9×9 스도쿠는 가로·세로·3×3 박스에 1~9 가 한 번씩.
            크기만 다를 뿐 본질은 같은 <em>라틴 방진</em> 퍼즐이에요.
          </p>
          <ul>
            <li>4×4 의 가능한 완전 보드 수: <strong>288</strong>개</li>
            <li>9×9 의 가능한 완전 보드 수: 약 <strong>6.67 × 10²¹</strong>개</li>
            <li>4×4 는 단서가 <strong>4개 이하</strong>면 거의 항상 답이 여러 개 — 보통 6개 이상이 좋아요.</li>
          </ul>
          <p>
            <strong>조작법:</strong> 빈 칸을 클릭해 선택하고 숫자 패드를 누르세요.
            키보드 1~4 입력, Backspace 로 지우기, 방향키로 이동도 됩니다.
          </p>
        </div>
      </details>
    </div>
  );
}
