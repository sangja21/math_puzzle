'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Grid,
  createEmptyGrid,
  nextGeneration,
  placePattern,
  countAlive,
  PATTERNS,
  PATTERN_TYPES,
} from '@/lib/puzzles/gameOfLife';
import styles from './page.module.css';

const ROWS = 30;
const COLS = 30;
const SPEEDS = [
  { label: '느림', ms: 500 },
  { label: '보통', ms: 200 },
  { label: '빠름', ms: 80 },
];

export default function PlaygroundPage() {
  const [grid, setGrid] = useState<Grid>(() => createEmptyGrid(ROWS, COLS));
  const [running, setRunning] = useState(false);
  const [gen, setGen] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [selectedPattern, setSelectedPattern] = useState('');

  const runningRef = useRef(running);
  runningRef.current = running;
  const speedRef = useRef(SPEEDS[speedIdx].ms);
  speedRef.current = SPEEDS[speedIdx].ms;

  const runSimulation = useCallback(() => {
    if (!runningRef.current) return;
    setGrid((g) => nextGeneration(g));
    setGen((g) => g + 1);
    setTimeout(runSimulation, speedRef.current);
  }, []);

  const handlePlayPause = () => {
    if (!running) {
      setRunning(true);
      runningRef.current = true;
      setTimeout(runSimulation, speedRef.current);
    } else {
      setRunning(false);
    }
  };

  const handleStep = () => {
    setGrid((g) => nextGeneration(g));
    setGen((g) => g + 1);
  };

  const handleClear = () => {
    setRunning(false);
    setGrid(createEmptyGrid(ROWS, COLS));
    setGen(0);
    setSelectedPattern('');
  };

  const handleCellClick = (r: number, c: number) => {
    setGrid((g) => {
      const next = g.map((row) => [...row]);
      next[r][c] = !next[r][c];
      return next;
    });
  };

  const handlePatternSelect = (patternName: string) => {
    const pattern = PATTERNS.find((p) => p.name === patternName);
    if (!pattern) return;
    setRunning(false);
    const g = createEmptyGrid(ROWS, COLS);
    setGrid(placePattern(g, pattern, Math.floor(ROWS / 2), Math.floor(COLS / 2)));
    setGen(0);
    setSelectedPattern(patternName);
  };

  const handleRandom = () => {
    setRunning(false);
    const g = createEmptyGrid(ROWS, COLS);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        g[r][c] = Math.random() < 0.25;
      }
    }
    setGrid(g);
    setGen(0);
    setSelectedPattern('');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      runningRef.current = false;
    };
  }, []);

  return (
    <div className={styles.container}>
      <Link href="/puzzle/game-of-life/patterns" className={styles.backButton}>
        ← 패턴 소개
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>🧬 생명 게임 시뮬레이터</h1>
      </header>

      {/* Pattern Presets */}
      <div className={styles.presets}>
        <div className={styles.presetLabel}>프리셋:</div>
        <div className={styles.presetBtns}>
          {PATTERNS.map((p) => (
            <button
              key={p.name}
              className={`${styles.presetBtn} ${selectedPattern === p.name ? styles.presetActive : ''}`}
              onClick={() => handlePatternSelect(p.name)}
              title={`${PATTERN_TYPES[p.type].emoji} ${p.description}`}
            >
              {p.name}
            </button>
          ))}
          <button className={styles.presetBtn} onClick={handleRandom}>
            🎲 랜덤
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>세대</span>
          <span className={styles.statValue}>{gen}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>생존</span>
          <span className={styles.statValue}>{countAlive(grid)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>격자</span>
          <span className={styles.statValue}>
            {ROWS}×{COLS}
          </span>
        </div>
      </div>

      {/* Board */}
      <div className={styles.boardWrapper}>
        <div
          className={styles.board}
          style={{
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <div
                key={`${r}-${c}`}
                className={`${styles.cell} ${cell ? styles.alive : ''}`}
                onMouseDown={() => handleCellClick(r, c)}
              />
            ))
          )}
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <button
          className={`${styles.controlBtn} ${running ? styles.pauseBtn : styles.playBtn}`}
          onClick={handlePlayPause}
        >
          {running ? '⏸ 정지' : '▶ 재생'}
        </button>
        <button
          className={styles.controlBtn}
          onClick={handleStep}
          disabled={running}
        >
          ⏭ 한 세대
        </button>
        <div className={styles.speedGroup}>
          {SPEEDS.map((s, i) => (
            <button
              key={s.label}
              className={`${styles.speedBtn} ${i === speedIdx ? styles.speedActive : ''}`}
              onClick={() => setSpeedIdx(i)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button className={styles.controlBtn} onClick={handleClear}>
          🗑 클리어
        </button>
      </div>

      <p className={styles.tip}>
        셀을 클릭하여 직접 그릴 수 있어요. 프리셋을 선택하고 재생해 보세요!
      </p>

      <div className={styles.navArea}>
        <Link href="/puzzle/game-of-life/math" className={styles.nextButton}>
          수학적 원리 알아보기 →
        </Link>
      </div>
    </div>
  );
}
