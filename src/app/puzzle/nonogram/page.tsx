'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import {
  type CellState,
  type Grid,
  type Puzzle,
  PUZZLES,
  colClues,
  lineMatchesClues,
  matches,
  rowClues,
} from '@/lib/puzzles/nonogram';

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

type Mode = 'fill' | 'cross';

function emptyGrid(rows: number, cols: number): Grid {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => 'empty' as CellState));
}

function cloneGrid(g: Grid): Grid {
  return g.map((r) => [...r]);
}

export default function NonogramPage() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const puzzleList = PUZZLES_BY_DIFFICULTY[difficulty];
  const puzzle = puzzleList[puzzleIdx % puzzleList.length];

  const rows = puzzle.solution.length;
  const cols = puzzle.solution[0].length;

  const [grid, setGrid] = useState<Grid>(() => emptyGrid(rows, cols));
  const [mode, setMode] = useState<Mode>('fill');
  const [autoCheck, setAutoCheck] = useState(true);
  const [hintCell, setHintCell] = useState<{ row: number; col: number } | null>(null);

  // 퍼즐 바뀌면 상태 리셋
  useEffect(() => {
    setGrid(emptyGrid(puzzle.solution.length, puzzle.solution[0].length));
    setHintCell(null);
  }, [puzzle]);

  const rowCluesArr = useMemo(() => rowClues(puzzle.solution), [puzzle]);
  const colCluesArr = useMemo(() => colClues(puzzle.solution), [puzzle]);

  const maxRowClueLen = useMemo(
    () => rowCluesArr.reduce((m, c) => Math.max(m, c.length), 1),
    [rowCluesArr],
  );
  const maxColClueLen = useMemo(
    () => colCluesArr.reduce((m, c) => Math.max(m, c.length), 1),
    [colCluesArr],
  );

  const solved = useMemo(() => matches(grid, puzzle.solution), [grid, puzzle.solution]);

  // 줄별 일치 — 자동 검증용 (라이브 피드백)
  const rowMatched = useMemo(
    () => grid.map((line, i) => lineMatchesClues(line, rowCluesArr[i])),
    [grid, rowCluesArr],
  );
  const colMatched = useMemo(() => {
    const out: boolean[] = [];
    for (let c = 0; c < cols; c++) {
      const line: CellState[] = [];
      for (let r = 0; r < rows; r++) line.push(grid[r][c]);
      out.push(lineMatchesClues(line, colCluesArr[c]));
    }
    return out;
  }, [grid, colCluesArr, rows, cols]);

  const filledCount = useMemo(() => {
    let k = 0;
    for (const row of grid) for (const v of row) if (v === 'filled') k++;
    return k;
  }, [grid]);
  const targetFilled = useMemo(() => {
    let k = 0;
    for (const row of puzzle.solution) for (const v of row) if (v === 1) k++;
    return k;
  }, [puzzle.solution]);

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      setHintCell(null);
      setGrid((prev) => {
        const next = cloneGrid(prev);
        const cur = next[row][col];
        if (mode === 'fill') {
          next[row][col] = cur === 'filled' ? 'empty' : 'filled';
        } else {
          next[row][col] = cur === 'cross' ? 'empty' : 'cross';
        }
        return next;
      });
    },
    [mode],
  );

  // 우클릭: 항상 cross 토글 (PC 사용자 빠른 입력)
  const handleCellContext = useCallback(
    (e: React.MouseEvent, row: number, col: number) => {
      e.preventDefault();
      setHintCell(null);
      setGrid((prev) => {
        const next = cloneGrid(prev);
        next[row][col] = next[row][col] === 'cross' ? 'empty' : 'cross';
        return next;
      });
    },
    [],
  );

  const handleHint = useCallback(() => {
    // 잘못 칠해진 셀(검정인데 정답은 흰) 또는 비어있는 정답 셀을 하나 채움
    // 1) filled 인데 0 인 셀 → empty 로 정정
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === 'filled' && puzzle.solution[r][c] === 0) {
          setGrid((prev) => {
            const next = cloneGrid(prev);
            next[r][c] = 'empty';
            return next;
          });
          setHintCell({ row: r, col: c });
          return;
        }
      }
    }
    // 2) 비어있는 정답 검은 칸 → filled
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (puzzle.solution[r][c] === 1 && grid[r][c] !== 'filled') {
          setGrid((prev) => {
            const next = cloneGrid(prev);
            next[r][c] = 'filled';
            return next;
          });
          setHintCell({ row: r, col: c });
          return;
        }
      }
    }
  }, [grid, puzzle.solution, rows, cols]);

  const handleReset = useCallback(() => {
    setGrid(emptyGrid(rows, cols));
    setHintCell(null);
  }, [rows, cols]);

  const handleNextPuzzle = useCallback(() => {
    setPuzzleIdx((i) => (i + 1) % puzzleList.length);
  }, [puzzleList.length]);

  const handleDifficulty = useCallback(
    (d: Difficulty) => {
      if (d === difficulty) return;
      setDifficulty(d);
      setPuzzleIdx(0);
    },
    [difficulty],
  );

  // 굵은 5칸 구분선 — 노노그램 컨벤션 (큰 그리드에서 좌표 가독성)
  const isThickRight = (c: number) => (c + 1) % 5 === 0 && c !== cols - 1;
  const isThickBottom = (r: number) => (r + 1) % 5 === 0 && r !== rows - 1;

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.homeBtn}>🏠 메인으로</Link>

      <header className={styles.header}>
        <h1 className={styles.title}>
          <span>🟧</span> 노노그램 (네모로직)
        </h1>
        <p className={styles.subtitle}>
          가로·세로에 적힌 숫자는 <strong>연속된 검은 칸 블록의 길이</strong>.
          단서만 보고 칸을 채워 그림을 완성하세요!
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
          {puzzle.name} · {puzzleIdx % puzzleList.length + 1}/{puzzleList.length}
        </div>
      </div>

      <section className={styles.stage}>
        <div className={styles.statsRow}>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>크기</span>
            <span className={styles.statValue}>{rows}×{cols}</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>채움</span>
            <span className={styles.statValue}>{filledCount} / {targetFilled}</span>
          </div>
          <div className={`${styles.statBox} ${solved ? styles.statBoxGood : ''}`}>
            <span className={styles.statLabel}>상태</span>
            <span className={styles.statValue}>{solved ? '✓ 완성' : '진행 중'}</span>
          </div>
        </div>

        {/* 모드 토글 — 모바일에서 한 탭으로 입력 */}
        <div className={styles.modeRow}>
          <button
            type="button"
            className={`${styles.modeBtn} ${mode === 'fill' ? styles.modeBtnActiveFill : ''}`}
            onClick={() => setMode('fill')}
          >
            ⬛ 채우기 모드
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${mode === 'cross' ? styles.modeBtnActiveCross : ''}`}
            onClick={() => setMode('cross')}
          >
            ✕ X 모드
          </button>
          <label className={styles.autoCheck}>
            <input
              type="checkbox"
              checked={autoCheck}
              onChange={(e) => setAutoCheck(e.target.checked)}
            />
            줄별 자동 검증
          </label>
        </div>

        <div className={styles.boardWrap}>
          {/* 그리드 = CSS grid 1+cols × 1+rows. 좌상단 빈칸, 위쪽 행에 열단서, 왼쪽 열에 행단서 */}
          <div
            className={`${styles.board} ${rows === 5 ? styles.board5 : styles.board10}`}
            style={{
              gridTemplateColumns: `${maxRowClueLen * 1.2}em repeat(${cols}, var(--cell))`,
              gridTemplateRows: `${maxColClueLen * 1.2}em repeat(${rows}, var(--cell))`,
            }}
          >
            <div className={styles.corner} aria-hidden />

            {/* 열 단서 (상단) */}
            {colCluesArr.map((clues, c) => {
              const ok = autoCheck && colMatched[c];
              return (
                <div
                  key={`col-clue-${c}`}
                  className={`${styles.colClue} ${ok ? styles.clueOk : ''} ${isThickRight(c) ? styles.thickRight : ''}`}
                >
                  {clues.length === 0 ? (
                    <span className={styles.clueZero}>0</span>
                  ) : (
                    clues.map((n, i) => <span key={i}>{n}</span>)
                  )}
                </div>
              );
            })}

            {/* 각 행: 행 단서 + 셀들 */}
            {Array.from({ length: rows }).map((_, r) => {
              const rowOk = autoCheck && rowMatched[r];
              return (
                <React.Fragment key={`row-${r}`}>
                  <div
                    className={`${styles.rowClue} ${rowOk ? styles.clueOk : ''} ${isThickBottom(r) ? styles.thickBottom : ''}`}
                  >
                    {rowCluesArr[r].length === 0 ? (
                      <span className={styles.clueZero}>0</span>
                    ) : (
                      rowCluesArr[r].map((n, i) => <span key={i}>{n}</span>)
                    )}
                  </div>
                  {Array.from({ length: cols }).map((__, c) => {
                    const state = grid[r][c];
                    const isHint = hintCell?.row === r && hintCell?.col === c;
                    return (
                      <button
                        key={`cell-${r}-${c}`}
                        type="button"
                        className={[
                          styles.cell,
                          state === 'filled' ? styles.cellFilled : '',
                          state === 'cross' ? styles.cellCross : '',
                          isThickRight(c) ? styles.thickRight : '',
                          isThickBottom(r) ? styles.thickBottom : '',
                          isHint ? styles.cellHint : '',
                        ].filter(Boolean).join(' ')}
                        onClick={() => handleCellClick(r, c)}
                        onContextMenu={(e) => handleCellContext(e, r, c)}
                        aria-label={`행 ${r + 1} 열 ${c + 1} ${state}`}
                      >
                        {state === 'cross' ? '✕' : ''}
                      </button>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {solved && (
          <div className={styles.celebrate}>
            <span className={styles.celebrateText}>🎉 완성! 그림이 보이나요?</span>
            <button type="button" className={styles.nextBtn} onClick={handleNextPuzzle}>
              ▶ 다음 퍼즐
            </button>
          </div>
        )}
      </section>

      <section className={styles.controlPanel}>
        <div className={styles.btnRow}>
          <button type="button" className={styles.hintBtn} onClick={handleHint} disabled={solved}>
            💡 힌트
          </button>
          <button type="button" className={styles.resetBtn} onClick={handleReset}>
            🔄 리셋
          </button>
          <button type="button" className={styles.newBtn} onClick={handleNextPuzzle}>
            🎲 다음 퍼즐
          </button>
        </div>
      </section>

      <details className={styles.help}>
        <summary>노노그램, 어떻게 풀까? 🤔</summary>
        <div className={styles.helpBody}>
          <p>
            <strong>단서 읽기:</strong> 행/열 옆 숫자는 <em>연속된 검은 칸 블록</em>의 길이.
            예) <code>2 1 3</code> 은 「2칸 → (한 칸 이상 띄움) → 1칸 → (띄움) → 3칸」 순서로 검정.
          </p>
          <p>
            <strong>조작:</strong>
          </p>
          <ul>
            <li><strong>채우기 모드</strong>에서 셀 탭 → 검정/비움 토글</li>
            <li><strong>X 모드</strong>에서 셀 탭 → X(확실히 흰 칸 마킹)/비움 토글</li>
            <li>PC: 셀에 <strong>우클릭</strong> 하면 모드와 상관없이 X 토글</li>
            <li><strong>자동 검증</strong> 켜면 단서와 줄이 일치할 때 초록 강조</li>
          </ul>
          <p>
            <strong>흔한 추론 패턴:</strong>
          </p>
          <ul>
            <li>줄 길이 = 단서 합 + (단서 개수 − 1) 이면 배치 유일 — 바로 다 채울 수 있어요.</li>
            <li>겹침 기법: 단서가 큰 경우, 왼쪽 끝/오른쪽 끝에서 각각 밀어붙였을 때 <em>둘 다 검정</em>인 칸은 반드시 검정.</li>
            <li>줄에 <code>0</code> 만 있으면 그 줄은 전부 X.</li>
            <li>한 블록을 확정하면 양 끝은 반드시 X — 모드 전환해서 X 로 잠가두면 실수 줄어요.</li>
          </ul>
          <p>
            <strong>역사:</strong> 1987년 일본의 니시오 노리유키와 테츠야 니시오가 비슷한 시기 각각 개발.
            영국 디자이너 제임스 다네일이 「Nonograms」 이름으로 1990년 출판해 세계로 퍼졌어요.
          </p>
        </div>
      </details>
    </div>
  );
}
