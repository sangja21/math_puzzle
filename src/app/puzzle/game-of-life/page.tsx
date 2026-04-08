'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import {
  createEmptyGrid,
  nextGeneration,
  countNeighbors,
  Grid,
} from '@/lib/puzzles/gameOfLife';
import styles from './page.module.css';

const DEMO_SIZE = 6;

function MiniDemo() {
  const [grid, setGrid] = useState<Grid>(() => {
    const g = createEmptyGrid(DEMO_SIZE, DEMO_SIZE);
    // Blinker 배치
    g[2][1] = true;
    g[2][2] = true;
    g[2][3] = true;
    return g;
  });
  const [gen, setGen] = useState(0);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);

  const handleCellClick = (r: number, c: number) => {
    const next = grid.map((row) => [...row]);
    next[r][c] = !next[r][c];
    setGrid(next);
    setSelectedCell([r, c]);
  };

  const handleStep = useCallback(() => {
    setGrid((g) => nextGeneration(g));
    setGen((g) => g + 1);
    setSelectedCell(null);
  }, []);

  const handleReset = () => {
    const g = createEmptyGrid(DEMO_SIZE, DEMO_SIZE);
    g[2][1] = true;
    g[2][2] = true;
    g[2][3] = true;
    setGrid(g);
    setGen(0);
    setSelectedCell(null);
  };

  const neighbors = selectedCell
    ? countNeighbors(grid, selectedCell[0], selectedCell[1])
    : null;
  const isAlive = selectedCell ? grid[selectedCell[0]][selectedCell[1]] : false;

  let prediction = '';
  if (selectedCell !== null && neighbors !== null) {
    if (isAlive) {
      prediction =
        neighbors === 2 || neighbors === 3
          ? '생존 (이웃 2~3명)'
          : neighbors >= 4
            ? '과밀 사망 (이웃 4+명)'
            : '고독 사망 (이웃 0~1명)';
    } else {
      prediction =
        neighbors === 3
          ? '탄생! (이웃 정확히 3명)'
          : `변화 없음 (이웃 ${neighbors}명)`;
    }
  }

  return (
    <div className={styles.demoArea}>
      <div className={styles.demoGrid}>
        {grid.map((row, r) => (
          <div key={r} className={styles.demoRow}>
            {row.map((cell, c) => {
              const isSelected =
                selectedCell &&
                selectedCell[0] === r &&
                selectedCell[1] === c;
              const isNeighbor =
                selectedCell &&
                Math.abs(selectedCell[0] - r) <= 1 &&
                Math.abs(selectedCell[1] - c) <= 1 &&
                !(selectedCell[0] === r && selectedCell[1] === c);
              return (
                <button
                  key={c}
                  className={`${styles.demoCell} ${cell ? styles.alive : styles.dead} ${isSelected ? styles.selected : ''} ${isNeighbor ? styles.neighbor : ''}`}
                  onClick={() => handleCellClick(r, c)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {selectedCell && (
        <div className={styles.cellInfo}>
          <span>
            ({selectedCell[0]},{selectedCell[1]}) —{' '}
            {isAlive ? '살아있음' : '죽어있음'} — 이웃: {neighbors}명
          </span>
          <span className={styles.prediction}>→ 다음 세대: {prediction}</span>
        </div>
      )}

      <div className={styles.demoControls}>
        <span className={styles.genLabel}>세대: {gen}</span>
        <button className={styles.stepBtn} onClick={handleStep}>
          다음 세대 ▶
        </button>
        <button className={styles.resetBtn} onClick={handleReset}>
          초기화
        </button>
      </div>
    </div>
  );
}

export default function GameOfLifeRulePage() {
  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backButton}>
        ← 홈으로
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>🧬 생명 게임</h1>
        <p className={styles.subtitle}>
          존 콘웨이(1937~2020)가 만든 세상에서 가장 유명한 &quot;구경 게임&quot;
        </p>
      </header>

      <section className={styles.rulesSection}>
        <h2 className={styles.sectionTitle}>규칙은 딱 4가지</h2>
        <p className={styles.rulesIntro}>
          격자 위의 각 셀은 <strong>살아있거나</strong> <strong>죽어있습니다</strong>.
          매 세대마다 8방향 이웃을 세고, 다음 규칙을 <strong>동시에</strong> 적용합니다.
        </p>
        <div className={styles.ruleCards}>
          <div className={`${styles.ruleCard} ${styles.ruleBirth}`}>
            <div className={styles.ruleIcon}>🐣</div>
            <h3>탄생</h3>
            <p>
              죽은 셀 주변에 <strong>정확히 3개</strong>의 이웃이 살아있으면
              → 새 생명 탄생!
            </p>
          </div>
          <div className={`${styles.ruleCard} ${styles.ruleSurvive}`}>
            <div className={styles.ruleIcon}>💚</div>
            <h3>생존</h3>
            <p>
              살아있는 셀 주변에 <strong>2~3개</strong> 이웃
              → 계속 생존
            </p>
          </div>
          <div className={`${styles.ruleCard} ${styles.ruleOverpop}`}>
            <div className={styles.ruleIcon}>😵</div>
            <h3>과밀</h3>
            <p>
              살아있는 셀 주변에 <strong>4개 이상</strong> 이웃
              → 과밀로 사망
            </p>
          </div>
          <div className={`${styles.ruleCard} ${styles.ruleLonely}`}>
            <div className={styles.ruleIcon}>😢</div>
            <h3>고독</h3>
            <p>
              살아있는 셀 주변에 <strong>1개 이하</strong> 이웃
              → 외로워서 사망
            </p>
          </div>
        </div>
      </section>

      <section className={styles.demoSection}>
        <h2 className={styles.sectionTitle}>직접 해보기</h2>
        <p className={styles.demoHint}>
          셀을 클릭해서 배치하고, &quot;다음 세대&quot;를 눌러 규칙을 확인하세요!
          <br />
          셀을 선택하면 이웃 수와 다음 세대 예측이 표시됩니다.
        </p>
        <MiniDemo />
      </section>

      <section className={styles.keyPoint}>
        <h2 className={styles.sectionTitle}>핵심 포인트</h2>
        <div className={styles.keyPointCards}>
          <div className={styles.keyCard}>
            <strong>동시 업데이트</strong>
            <p>모든 셀이 동시에 바뀝니다. 하나씩이 아니에요!</p>
          </div>
          <div className={styles.keyCard}>
            <strong>플레이어 없음</strong>
            <p>처음 배치만 정하면 나머지는 규칙이 알아서!</p>
          </div>
          <div className={styles.keyCard}>
            <strong>무한한 가능성</strong>
            <p>단 4개의 규칙에서 놀라운 패턴들이 탄생합니다.</p>
          </div>
        </div>
      </section>

      <div className={styles.navArea}>
        <Link href="/puzzle/game-of-life/patterns" className={styles.nextButton}>
          주요 패턴 보기 →
        </Link>
      </div>
    </div>
  );
}
