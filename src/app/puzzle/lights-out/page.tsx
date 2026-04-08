'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createEmptyBoard, toggleCell, Board } from '@/lib/puzzles/lightsOut';
import styles from './page.module.css';

export default function LightsOutRulePage() {
  const [demoBoard, setDemoBoard] = useState<Board>(() => {
    const board = createEmptyBoard(3);
    board[0][1] = true;
    board[1][0] = true;
    board[1][1] = true;
    board[1][2] = true;
    board[2][1] = true;
    return board;
  });
  const [lastClicked, setLastClicked] = useState<[number, number] | null>(null);
  const [clickCount, setClickCount] = useState(0);

  const handleDemoClick = (row: number, col: number) => {
    setDemoBoard(toggleCell(demoBoard, row, col));
    setLastClicked([row, col]);
    setClickCount((c) => c + 1);
    setTimeout(() => setLastClicked(null), 400);
  };

  const resetDemo = () => {
    const board = createEmptyBoard(3);
    board[0][1] = true;
    board[1][0] = true;
    board[1][1] = true;
    board[1][2] = true;
    board[2][1] = true;
    setDemoBoard(board);
    setLastClicked(null);
    setClickCount(0);
  };

  const allOff = demoBoard.every((row) => row.every((cell) => !cell));

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backButton}>
        ← 홈으로
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>💡 라이츠 아웃</h1>
        <p className={styles.subtitle}>
          하나의 클릭이 주변을 바꾼다 — 모든 불을 꺼라!
        </p>
      </header>

      <section className={styles.rulesSection}>
        <h2 className={styles.sectionTitle}>게임 규칙</h2>
        <div className={styles.ruleCards}>
          <div className={styles.ruleCard}>
            <div className={styles.ruleIcon}>👆</div>
            <h3>클릭하면?</h3>
            <p>
              셀을 클릭하면 <strong>자기 자신</strong>과{' '}
              <strong>상·하·좌·우</strong> 총 최대 5칸의 불이 반전됩니다.
            </p>
          </div>
          <div className={styles.ruleCard}>
            <div className={styles.ruleIcon}>🔄</div>
            <h3>반전(토글)</h3>
            <p>
              켜진 불은 <strong>꺼지고</strong>, 꺼진 불은{' '}
              <strong>켜집니다</strong>. 이것이 토글!
            </p>
          </div>
          <div className={styles.ruleCard}>
            <div className={styles.ruleIcon}>🎯</div>
            <h3>목표</h3>
            <p>
              모든 불을 <strong>전부 끄면</strong> 클리어! 최소 클릭으로
              도전하세요.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.demoSection}>
        <h2 className={styles.sectionTitle}>직접 해보기</h2>
        <p className={styles.demoHint}>
          아래 격자를 클릭해서 규칙을 체험해 보세요!
        </p>

        <div className={styles.demoArea}>
          <div className={styles.demoBoard}>
            {demoBoard.map((row, r) => (
              <div key={r} className={styles.demoRow}>
                {row.map((cell, c) => {
                  const isAffected =
                    lastClicked &&
                    (Math.abs(lastClicked[0] - r) +
                      Math.abs(lastClicked[1] - c) <=
                      1);
                  return (
                    <button
                      key={c}
                      className={`${styles.demoCell} ${cell ? styles.on : styles.off} ${isAffected ? styles.affected : ''}`}
                      onClick={() => handleDemoClick(r, c)}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          <div className={styles.demoInfo}>
            <span>클릭 수: {clickCount}</span>
            <button className={styles.resetBtn} onClick={resetDemo}>
              초기화
            </button>
          </div>

          {allOff && clickCount > 0 && (
            <div className={styles.demoClear}>
              모든 불을 껐습니다! 🎉
            </div>
          )}
        </div>
      </section>

      <section className={styles.eventSection}>
        <h2 className={styles.sectionTitle}>🖥️ 프로그래밍과의 연결</h2>
        <div className={styles.eventCards}>
          <div className={styles.eventCard}>
            <div className={styles.eventLabel}>이벤트</div>
            <div className={styles.eventDesc}>셀을 클릭하는 것</div>
          </div>
          <div className={styles.eventArrow}>→</div>
          <div className={styles.eventCard}>
            <div className={styles.eventLabel}>핸들러(반응)</div>
            <div className={styles.eventDesc}>십자 방향 불 토글</div>
          </div>
          <div className={styles.eventArrow}>→</div>
          <div className={styles.eventCard}>
            <div className={styles.eventLabel}>전파</div>
            <div className={styles.eventDesc}>주변 셀까지 영향</div>
          </div>
        </div>
        <p className={styles.eventNote}>
          블록코딩에서 배울 <strong>&quot;이벤트&quot;</strong> 개념이 바로 이것!
          <br />
          &quot;~을 클릭했을 때&quot; → &quot;~을 실행한다&quot;
        </p>
      </section>

      <div className={styles.startArea}>
        <Link href="/puzzle/lights-out/game" className={styles.startButton}>
          게임 시작하기 →
        </Link>
      </div>
    </div>
  );
}
