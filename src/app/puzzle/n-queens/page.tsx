'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import {
  type Board,
  type SolveStep,
  attackingPairs,
  countSolutions,
  solveOne,
  solveSteps,
} from '@/lib/puzzles/nQueens';

type NSize = 4 | 6 | 8;
const N_OPTIONS: NSize[] = [4, 6, 8];
const STEP_MS = 400;

function emptyBoard(n: number): Board {
  return new Array(n).fill(-1);
}

function placedCount(board: Board): number {
  let k = 0;
  for (const r of board) if (r >= 0) k++;
  return k;
}

interface ConflictLine {
  x1: number; y1: number; x2: number; y2: number;
  key: string;
}

export default function NQueensPage() {
  const [n, setN] = useState<NSize>(4);
  const [userBoard, setUserBoard] = useState<Board>(() => emptyBoard(4));
  const [hintCell, setHintCell] = useState<{ row: number; col: number } | null>(null);
  const [autoSteps, setAutoSteps] = useState<SolveStep[] | null>(null);
  const [autoIdx, setAutoIdx] = useState(0);
  const [autoPlaying, setAutoPlaying] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 카운트는 N마다 한 번만 — 92도 즉시지만 그래도 메모
  const solutionTotal = useMemo(() => countSolutions(n), [n]);

  // 자동 풀이 중에는 step.board 를 그대로 표시 — setBoard 동기화 불필요
  const currentStep = autoSteps && autoIdx < autoSteps.length ? autoSteps[autoIdx] : null;
  const board: Board = currentStep ? currentStep.board : userBoard;

  const conflicts = useMemo(() => attackingPairs(board), [board]);
  const placed = placedCount(board);
  const solved = placed === n && conflicts.length === 0;

  const stopAuto = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setAutoPlaying(false);
  }, []);

  // 자동 재생 — autoIdx 변경마다 다음 단계 예약. setBoard 호출하지 않고 인덱스만 진전시켜
  // cascading render 회피. 종료 시점도 setTimeout 콜백에서만 끄도록 분리.
  useEffect(() => {
    if (!autoPlaying || !autoSteps) return;
    if (autoIdx >= autoSteps.length) return;
    const total = autoSteps.length;
    timerRef.current = setTimeout(() => {
      if (autoIdx + 1 >= total) {
        setAutoPlaying(false);
      } else {
        setAutoIdx((i) => i + 1);
      }
    }, STEP_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [autoPlaying, autoSteps, autoIdx]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const handleSelectN = useCallback((next: NSize) => {
    if (next === n) return;
    stopAuto();
    setAutoSteps(null);
    setAutoIdx(0);
    setHintCell(null);
    setN(next);
    setUserBoard(emptyBoard(next));
  }, [n, stopAuto]);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (autoPlaying || autoSteps) return;
    setHintCell(null);
    setUserBoard((prev) => {
      const next = prev.slice();
      if (next[col] === row) {
        next[col] = -1;
      } else {
        next[col] = row;
      }
      return next;
    });
  }, [autoPlaying, autoSteps]);

  const handleHint = useCallback(() => {
    if (autoPlaying) return;
    const sol = solveOne(n);
    if (!sol) return;
    // 현재와 다른 첫 칼럼을 한 칸 보여주기
    for (let c = 0; c < n; c++) {
      if (userBoard[c] !== sol[c]) {
        setHintCell({ row: sol[c], col: c });
        return;
      }
    }
    setHintCell(null);
  }, [n, userBoard, autoPlaying]);

  const handleAuto = useCallback(() => {
    setHintCell(null);
    const steps = solveSteps(n);
    setAutoSteps(steps);
    setAutoIdx(0);
    setAutoPlaying(true);
  }, [n]);

  const handlePauseResume = useCallback(() => {
    if (!autoSteps) return;
    if (autoPlaying) {
      stopAuto();
    } else if (autoIdx < autoSteps.length) {
      setAutoPlaying(true);
    }
  }, [autoPlaying, autoSteps, autoIdx, stopAuto]);

  const handleReset = useCallback(() => {
    stopAuto();
    setAutoSteps(null);
    setAutoIdx(0);
    setHintCell(null);
    setUserBoard(emptyBoard(n));
  }, [n, stopAuto]);

  // SVG 좌표계: 0..n. cellSize=1, padding 별도. 충돌 선은 cell 중심끼리.
  const cellSize = 1;
  const padding = 0.05;
  const total = n * cellSize + padding * 2;

  const conflictLines: ConflictLine[] = useMemo(() => {
    return conflicts.map(([[r1, c1], [r2, c2]]) => ({
      x1: padding + c1 * cellSize + 0.5,
      y1: padding + r1 * cellSize + 0.5,
      x2: padding + c2 * cellSize + 0.5,
      y2: padding + r2 * cellSize + 0.5,
      key: `${r1},${c1}-${r2},${c2}`,
    }));
  }, [conflicts]);

  const conflictCells = useMemo(() => {
    const set = new Set<string>();
    for (const [[r1, c1], [r2, c2]] of conflicts) {
      set.add(`${r1},${c1}`);
      set.add(`${r2},${c2}`);
    }
    return set;
  }, [conflicts]);

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.homeBtn}>🏠 메인으로</Link>

      <header className={styles.header}>
        <h1 className={styles.title}>
          <span>♛</span> N-퀸 퍼즐
        </h1>
        <p className={styles.subtitle}>
          체스의 퀸은 가로·세로·대각선 모두를 공격합니다. N×N 보드에 퀸 N개를{' '}
          <strong>서로 공격하지 못하게</strong> 놓아보세요. 1848년부터 내려온 백트래킹의 고전.
        </p>
      </header>

      <div className={styles.sizeRow}>
        {N_OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            className={`${styles.sizeChip} ${n === opt ? styles.sizeChipActive : ''}`}
            onClick={() => handleSelectN(opt)}
            disabled={autoPlaying}
          >
            {opt} × {opt}
          </button>
        ))}
      </div>

      <section className={styles.stage}>
        <div className={styles.statsRow}>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>놓은 퀸</span>
            <span className={styles.statValue}>{placed} / {n}</span>
          </div>
          <div className={`${styles.statBox} ${conflicts.length > 0 ? styles.statBoxBad : ''}`}>
            <span className={styles.statLabel}>충돌</span>
            <span className={styles.statValue}>{conflicts.length}</span>
          </div>
          <div className={`${styles.statBox} ${solved ? styles.statBoxGood : ''}`}>
            <span className={styles.statLabel}>상태</span>
            <span className={styles.statValue}>{solved ? '✓ 클리어' : '진행 중'}</span>
          </div>
        </div>

        <div className={styles.boardWrap}>
          <svg
            className={styles.boardSvg}
            viewBox={`0 0 ${total} ${total}`}
            preserveAspectRatio="xMidYMid meet"
          >
            {Array.from({ length: n }).map((_, row) =>
              Array.from({ length: n }).map((__, col) => {
                const isDark = (row + col) % 2 === 1;
                const queenRow = board[col];
                const hasQueen = queenRow === row;
                const isHint = hintCell && hintCell.row === row && hintCell.col === col;
                const isConflict = hasQueen && conflictCells.has(`${row},${col}`);
                const isTryHere =
                  currentStep &&
                  currentStep.column === col &&
                  currentStep.board[col] === row &&
                  (currentStep.status === 'reject' || currentStep.status === 'try');
                return (
                  <g
                    key={`${row}-${col}`}
                    onClick={() => handleCellClick(row, col)}
                    className={styles.cellGroup}
                  >
                    <rect
                      x={padding + col * cellSize}
                      y={padding + row * cellSize}
                      width={cellSize}
                      height={cellSize}
                      className={isDark ? styles.cellDark : styles.cellLight}
                    />
                    {isHint && !hasQueen && (
                      <rect
                        x={padding + col * cellSize + 0.08}
                        y={padding + row * cellSize + 0.08}
                        width={cellSize - 0.16}
                        height={cellSize - 0.16}
                        className={styles.cellHint}
                      />
                    )}
                    {isTryHere && !hasQueen && currentStep?.status === 'reject' && (
                      <rect
                        x={padding + col * cellSize + 0.08}
                        y={padding + row * cellSize + 0.08}
                        width={cellSize - 0.16}
                        height={cellSize - 0.16}
                        className={styles.cellReject}
                      />
                    )}
                    {hasQueen && (
                      <text
                        x={padding + col * cellSize + cellSize / 2}
                        y={padding + row * cellSize + cellSize / 2}
                        className={`${styles.queen} ${isConflict ? styles.queenConflict : ''}`}
                        textAnchor="middle"
                        dominantBaseline="central"
                      >
                        ♛
                      </text>
                    )}
                  </g>
                );
              }),
            )}

            {conflictLines.map((line) => (
              <line
                key={line.key}
                x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2}
                className={styles.conflictLine}
              />
            ))}
          </svg>
        </div>

        {autoSteps && (
          <div className={styles.autoBar}>
            <span className={styles.autoStep}>
              단계 {Math.min(autoIdx + 1, autoSteps.length)} / {autoSteps.length}
              {currentStep && (
                <em className={`${styles.statusTag} ${styles[`status_${currentStep.status}`]}`}>
                  {currentStep.status === 'try' && '시도'}
                  {currentStep.status === 'reject' && '거절'}
                  {currentStep.status === 'accept' && '성공'}
                  {currentStep.status === 'backtrack' && '백트래킹'}
                </em>
              )}
            </span>
            <button
              type="button"
              className={styles.smallBtn}
              onClick={handlePauseResume}
              disabled={autoIdx >= autoSteps.length}
            >
              {autoPlaying ? '⏸ 일시정지' : '▶ 재생'}
            </button>
          </div>
        )}
      </section>

      <section className={styles.controlPanel}>
        <div className={styles.totalBox}>
          <span className={styles.totalLabel}>{n}×{n} 보드의 가능한 해</span>
          <span className={styles.totalValue}>{solutionTotal}<span className={styles.totalUnit}>가지</span></span>
        </div>
        <div className={styles.btnRow}>
          <button type="button" className={styles.hintBtn} onClick={handleHint} disabled={autoPlaying || solved}>
            💡 힌트 한 칸
          </button>
          <button type="button" className={styles.autoBtn} onClick={handleAuto} disabled={autoPlaying}>
            🤖 자동 풀이
          </button>
          <button type="button" className={styles.resetBtn} onClick={handleReset}>
            🔄 리셋
          </button>
        </div>
      </section>

      <details className={styles.help}>
        <summary>왜 N=2, 3은 불가능하고 N=4부터는 가능할까? 🤔</summary>
        <div className={styles.helpBody}>
          <p>
            <strong>N=1:</strong> 퀸 1개만 놓으면 끝. 자명한 1개의 해.
          </p>
          <p>
            <strong>N=2:</strong> 보드가 2×2 — 어떤 두 칸도 같은 행·열 또는 대각선 위에 있어요.
            두 퀸을 떨어뜨려 놓을 수 없습니다. <em>해 0개.</em>
          </p>
          <p>
            <strong>N=3:</strong> 3×3에서 첫 퀸을 어디에 놓아도 남은 칸들이 전부 같은 행·열·대각선에
            걸립니다. 세 퀸을 배치할 빈 자리가 없어요. <em>해 0개.</em>
          </p>
          <p>
            <strong>N=4:</strong> 드디어 가능 — 2가지 해. 4×4 부터는 보드가 충분히 넓어
            대각선 공격을 비껴갈 자리가 생기죠. N이 커지면 해의 수는 폭발적으로 증가합니다.
          </p>
          <ul>
            <li>4×4 → <strong>2</strong>가지</li>
            <li>5×5 → <strong>10</strong>가지</li>
            <li>6×6 → <strong>4</strong>가지</li>
            <li>7×7 → <strong>40</strong>가지</li>
            <li>8×8 → <strong>92</strong>가지 (대칭 제외 12가지)</li>
          </ul>
          <p>
            <strong>자동 풀이</strong> 버튼을 누르면 컴퓨터가 한 열씩 퀸을 놓아보고, 충돌이 나면
            되돌아가서 다른 행을 시도하는 <em>백트래킹</em> 과정을 직접 볼 수 있어요.
          </p>
        </div>
      </details>
    </div>
  );
}
