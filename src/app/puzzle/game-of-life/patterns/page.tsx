'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  createEmptyGrid,
  nextGeneration,
  placePattern,
  PATTERNS,
  PATTERN_TYPES,
  Pattern,
  Grid,
} from '@/lib/puzzles/gameOfLife';
import styles from './page.module.css';

function PatternPreview({ pattern }: { pattern: Pattern }) {
  const previewSize = 8;
  const [grid, setGrid] = useState<Grid>(() => {
    const g = createEmptyGrid(previewSize, previewSize);
    return placePattern(g, pattern, Math.floor(previewSize / 2) - 1, Math.floor(previewSize / 2) - 1);
  });
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = useCallback(() => {
    const g = createEmptyGrid(previewSize, previewSize);
    setGrid(placePattern(g, pattern, Math.floor(previewSize / 2) - 1, Math.floor(previewSize / 2) - 1));
  }, [pattern]);

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setGrid((g) => nextGeneration(g));
      }, 400);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing]);

  const handleToggle = () => {
    if (!playing) {
      reset();
      setPlaying(true);
    } else {
      setPlaying(false);
    }
  };

  const typeInfo = PATTERN_TYPES[pattern.type];

  return (
    <div className={styles.patternCard}>
      <div className={styles.patternHeader}>
        <span className={styles.patternType} style={{ color: typeInfo.color }}>
          {typeInfo.emoji} {typeInfo.label}
        </span>
        <h3 className={styles.patternName}>{pattern.name}</h3>
      </div>

      <div className={styles.previewGrid}>
        {grid.map((row, r) => (
          <div key={r} className={styles.previewRow}>
            {row.map((cell, c) => (
              <div
                key={c}
                className={`${styles.previewCell} ${cell ? styles.alive : ''}`}
              />
            ))}
          </div>
        ))}
      </div>

      <p className={styles.patternDesc}>{pattern.description}</p>

      <button className={styles.playBtn} onClick={handleToggle}>
        {playing ? '⏸ 정지' : '▶ 재생'}
      </button>
    </div>
  );
}

export default function PatternsPage() {
  const types = ['still', 'oscillator', 'spaceship', 'other'] as const;

  return (
    <div className={styles.container}>
      <Link href="/puzzle/game-of-life" className={styles.backButton}>
        ← 규칙 보기
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>🧬 주요 패턴</h1>
        <p className={styles.subtitle}>
          단 4가지 규칙에서 이런 다양한 패턴이 탄생합니다!
        </p>
      </header>

      {types.map((type) => {
        const typeInfo = PATTERN_TYPES[type];
        const patterns = PATTERNS.filter((p) => p.type === type);
        return (
          <section key={type} className={styles.typeSection}>
            <h2 className={styles.typeTitle}>
              {typeInfo.emoji} {typeInfo.label}
            </h2>
            <div className={styles.patternGrid}>
              {patterns.map((p) => (
                <PatternPreview key={p.name} pattern={p} />
              ))}
            </div>
          </section>
        );
      })}

      <div className={styles.navArea}>
        <Link href="/puzzle/game-of-life" className={styles.navBtn}>
          ← 규칙으로
        </Link>
        <Link
          href="/puzzle/game-of-life/playground"
          className={styles.nextButton}
        >
          직접 구경하기 →
        </Link>
      </div>
    </div>
  );
}
