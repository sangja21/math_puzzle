'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Board,
  LEVELS,
  generatePuzzle,
  toggleCell,
  isSolved,
  countLit,
} from '@/lib/puzzles/lightsOut';
import styles from './page.module.css';

export default function LightsOutGamePage() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [unlockedLevel, setUnlockedLevel] = useState(0);
  const [board, setBoard] = useState<Board>(() =>
    generatePuzzle(LEVELS[0].size, LEVELS[0].clicks)
  );
  const [moves, setMoves] = useState(0);
  const [cleared, setCleared] = useState(false);
  const [lastClicked, setLastClicked] = useState<[number, number] | null>(null);
  const [allCleared, setAllCleared] = useState(false);

  const level = LEVELS[currentLevel];

  const startLevel = useCallback((levelIndex: number) => {
    const lv = LEVELS[levelIndex];
    setCurrentLevel(levelIndex);
    setBoard(generatePuzzle(lv.size, lv.clicks));
    setMoves(0);
    setCleared(false);
    setLastClicked(null);
  }, []);

  const handleCellClick = (row: number, col: number) => {
    if (cleared) return;

    const next = toggleCell(board, row, col);
    setBoard(next);
    setMoves((m) => m + 1);
    setLastClicked([row, col]);
    setTimeout(() => setLastClicked(null), 350);

    if (isSolved(next)) {
      setCleared(true);
      if (currentLevel >= unlockedLevel) {
        const nextUnlock = Math.min(currentLevel + 1, LEVELS.length - 1);
        setUnlockedLevel(nextUnlock);
      }
      if (currentLevel === LEVELS.length - 1) {
        setAllCleared(true);
      }
    }
  };

  const handleReset = () => {
    startLevel(currentLevel);
  };

  const handleNextLevel = () => {
    if (currentLevel < LEVELS.length - 1) {
      startLevel(currentLevel + 1);
    }
  };

  return (
    <div className={styles.container}>
      <Link href="/puzzle/lights-out" className={styles.backButton}>
        ← 규칙 보기
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>💡 라이츠 아웃</h1>
      </header>

      {/* Level Selector */}
      <div className={styles.levelBar}>
        {LEVELS.map((lv, i) => (
          <button
            key={lv.level}
            className={`${styles.levelBtn} ${i === currentLevel ? styles.levelActive : ''} ${i > unlockedLevel ? styles.levelLocked : ''}`}
            onClick={() => i <= unlockedLevel && startLevel(i)}
            disabled={i > unlockedLevel}
          >
            <span className={styles.levelNum}>
              {i > unlockedLevel ? '🔒' : lv.level}
            </span>
            <span className={styles.levelName}>{lv.name}</span>
          </button>
        ))}
      </div>

      {/* Game Info */}
      <div className={styles.gameInfo}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>단계</span>
          <span className={styles.infoValue}>
            {level.level} - {level.name}
          </span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>격자</span>
          <span className={styles.infoValue}>
            {level.size}×{level.size}
          </span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>클릭 수</span>
          <span className={styles.infoValue}>{moves}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>남은 불</span>
          <span className={styles.infoValue}>{countLit(board)}</span>
        </div>
      </div>

      {/* Board */}
      <div className={styles.boardWrapper}>
        <div
          className={styles.board}
          style={{
            gridTemplateColumns: `repeat(${level.size}, 1fr)`,
          }}
        >
          {board.map((row, r) =>
            row.map((cell, c) => {
              const isAffected =
                lastClicked &&
                Math.abs(lastClicked[0] - r) + Math.abs(lastClicked[1] - c) <=
                  1;
              return (
                <button
                  key={`${r}-${c}`}
                  className={`${styles.cell} ${cell ? styles.on : styles.off} ${isAffected ? styles.affected : ''}`}
                  onClick={() => handleCellClick(r, c)}
                  disabled={cleared}
                />
              );
            })
          )}
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <button className={styles.resetBtn} onClick={handleReset}>
          다시 시도
        </button>
      </div>

      {/* Clear Modal */}
      {cleared && (
        <div className={styles.clearOverlay}>
          <div className={styles.clearModal}>
            {allCleared ? (
              <>
                <div className={styles.clearEmoji}>🏆</div>
                <h2 className={styles.clearTitle}>전체 클리어!</h2>
                <p className={styles.clearText}>
                  모든 단계를 완료했습니다!
                </p>
                <div className={styles.clearActions}>
                  <Link
                    href="/puzzle/lights-out/math"
                    className={styles.nextBtn}
                  >
                    수학적 원리 알아보기 →
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className={styles.clearEmoji}>🎉</div>
                <h2 className={styles.clearTitle}>
                  {level.level}단계 클리어!
                </h2>
                <p className={styles.clearText}>
                  {moves}번 만에 모든 불을 껐습니다!
                </p>
                <div className={styles.clearActions}>
                  <button
                    className={styles.retryBtn}
                    onClick={handleReset}
                  >
                    다시 도전
                  </button>
                  <button
                    className={styles.nextBtn}
                    onClick={handleNextLevel}
                  >
                    다음 단계 →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
