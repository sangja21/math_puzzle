'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  createEmptyGrid,
  countNeighbors,
  Grid,
} from '@/lib/puzzles/gameOfLife';
import styles from './page.module.css';

function NeighborDemo() {
  const size = 5;
  const [grid, setGrid] = useState<Grid>(() => {
    const g = createEmptyGrid(size, size);
    g[1][2] = true;
    g[2][1] = true;
    g[2][2] = true;
    g[2][3] = true;
    g[3][2] = true;
    return g;
  });
  const [selected, setSelected] = useState<[number, number] | null>(null);

  const handleClick = (r: number, c: number) => {
    setSelected([r, c]);
  };

  const handleToggle = (r: number, c: number) => {
    const next = grid.map((row) => [...row]);
    next[r][c] = !next[r][c];
    setGrid(next);
  };

  const neighbors = selected ? countNeighbors(grid, selected[0], selected[1]) : null;
  const isAlive = selected ? grid[selected[0]][selected[1]] : false;

  let nextState = '';
  let nextColor = '';
  if (selected && neighbors !== null) {
    if (isAlive) {
      if (neighbors === 2 || neighbors === 3) {
        nextState = '생존';
        nextColor = '#16a34a';
      } else if (neighbors >= 4) {
        nextState = '과밀 사망';
        nextColor = '#ef4444';
      } else {
        nextState = '고독 사망';
        nextColor = '#f59e0b';
      }
    } else {
      if (neighbors === 3) {
        nextState = '탄생!';
        nextColor = '#16a34a';
      } else {
        nextState = '변화 없음';
        nextColor = '#6b7280';
      }
    }
  }

  return (
    <div className={styles.neighborDemo}>
      <p className={styles.demoHint}>
        우클릭(또는 길게 터치)으로 셀 토글, 클릭으로 이웃 분석
      </p>
      <div className={styles.neighborGrid}>
        {grid.map((row, r) => (
          <div key={r} className={styles.nRow}>
            {row.map((cell, c) => {
              const isSel = selected && selected[0] === r && selected[1] === c;
              const isNb =
                selected &&
                Math.abs(selected[0] - r) <= 1 &&
                Math.abs(selected[1] - c) <= 1 &&
                !(selected[0] === r && selected[1] === c);
              return (
                <button
                  key={c}
                  className={`${styles.nCell} ${cell ? styles.alive : styles.dead} ${isSel ? styles.nSelected : ''} ${isNb ? styles.nHighlight : ''}`}
                  onClick={() => handleClick(r, c)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    handleToggle(r, c);
                  }}
                >
                  {isSel && <span className={styles.nLabel}>ME</span>}
                  {isNb && cell && <span className={styles.nLabel}>+1</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      {selected && (
        <div className={styles.neighborResult}>
          <div>
            현재: <strong>{isAlive ? '살아있음' : '죽어있음'}</strong> |
            이웃: <strong>{neighbors}명</strong>
          </div>
          <div style={{ color: nextColor, fontWeight: 700 }}>
            → 다음 세대: {nextState}
          </div>
        </div>
      )}
    </div>
  );
}

export default function GameOfLifeMathPage() {
  return (
    <div className={styles.container}>
      <Link href="/puzzle/game-of-life/playground" className={styles.backButton}>
        ← 시뮬레이터
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>🧬 생명 게임의 수학</h1>
        <p className={styles.subtitle}>
          단순한 규칙에서 복잡한 세계가 탄생하는 이유
        </p>
      </header>

      {/* 1. Cellular Automata */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>1. 셀룰러 오토마타</h2>
        <div className={styles.explanation}>
          <p>
            생명 게임은 <strong>셀룰러 오토마타(Cellular Automata)</strong>의
            일종입니다. 세 가지 요소만 있으면 됩니다:
          </p>
          <div className={styles.threeElements}>
            <div className={styles.element}>
              <div className={styles.elementIcon}>📐</div>
              <strong>격자</strong>
              <span>셀이 배열된 공간</span>
            </div>
            <div className={styles.elementPlus}>+</div>
            <div className={styles.element}>
              <div className={styles.elementIcon}>📋</div>
              <strong>규칙</strong>
              <span>이웃에 따른 상태 변화</span>
            </div>
            <div className={styles.elementPlus}>+</div>
            <div className={styles.element}>
              <div className={styles.elementIcon}>⏰</div>
              <strong>동시 업데이트</strong>
              <span>모든 셀이 한꺼번에</span>
            </div>
          </div>
          <p>
            이 단순한 구조가 놀라울 정도로 복잡한 행동을 만들어냅니다!
          </p>
        </div>
      </section>

      {/* 2. Emergence */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>2. 창발 (Emergence)</h2>
        <div className={styles.explanation}>
          <p>
            <strong>창발</strong>이란 부분의 합보다 전체가 더 큰 현상입니다.
          </p>
          <div className={styles.emergenceExamples}>
            <div className={styles.emergenceCard}>
              <span className={styles.emergenceEmoji}>🐜</span>
              <div>
                <strong>개미 한 마리</strong>
                <p>단순한 페로몬 규칙</p>
              </div>
              <span className={styles.emergenceArrow}>→</span>
              <div>
                <strong>개미 군집</strong>
                <p>도시 같은 복잡한 구조</p>
              </div>
            </div>
            <div className={styles.emergenceCard}>
              <span className={styles.emergenceEmoji}>🧠</span>
              <div>
                <strong>뉴런 하나</strong>
                <p>전기 신호 on/off</p>
              </div>
              <span className={styles.emergenceArrow}>→</span>
              <div>
                <strong>뇌</strong>
                <p>생각, 감정, 의식</p>
              </div>
            </div>
            <div className={styles.emergenceCard}>
              <span className={styles.emergenceEmoji}>🧬</span>
              <div>
                <strong>셀 하나</strong>
                <p>탄생/생존/사망 규칙</p>
              </div>
              <span className={styles.emergenceArrow}>→</span>
              <div>
                <strong>생명 게임</strong>
                <p>글라이더, 우주선, 심지어 컴퓨터!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Neighbor Analysis */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>3. 이웃 분석 실험</h2>
        <div className={styles.explanation}>
          <p>
            각 셀은 <strong>8방향</strong>(상하좌우 + 대각선)의 이웃을 봅니다.
            이웃 수에 따라 다음 세대가 결정됩니다.
          </p>
        </div>
        <div className={styles.demoBox}>
          <NeighborDemo />
        </div>
        <div className={styles.ruleTable}>
          <table>
            <thead>
              <tr>
                <th>현재 상태</th>
                <th>이웃 수</th>
                <th>다음 세대</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>죽어있음</td>
                <td>= 3</td>
                <td className={styles.birth}>탄생</td>
              </tr>
              <tr>
                <td>죽어있음</td>
                <td>≠ 3</td>
                <td>변화 없음</td>
              </tr>
              <tr>
                <td>살아있음</td>
                <td>2 ~ 3</td>
                <td className={styles.survive}>생존</td>
              </tr>
              <tr>
                <td>살아있음</td>
                <td>≥ 4</td>
                <td className={styles.die}>과밀 사망</td>
              </tr>
              <tr>
                <td>살아있음</td>
                <td>≤ 1</td>
                <td className={styles.die}>고독 사망</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Turing Completeness */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>4. 컴퓨터가 되는 게임 (심화)</h2>
        <div className={styles.explanation}>
          <p>
            놀랍게도 생명 게임은 <strong>튜링 완전(Turing Complete)</strong>합니다.
            이 말은:
          </p>
          <div className={styles.turingCards}>
            <div className={styles.turingCard}>
              <strong>AND, OR, NOT 게이트</strong>
              <p>글라이더의 충돌로 논리 게이트를 만들 수 있음</p>
            </div>
            <div className={styles.turingCard}>
              <strong>메모리</strong>
              <p>정물(Still Life)이 데이터를 저장하는 메모리 역할</p>
            </div>
            <div className={styles.turingCard}>
              <strong>신호 전달</strong>
              <p>글라이더가 정보를 실어 나르는 전선 역할</p>
            </div>
          </div>
          <p className={styles.turingConclusion}>
            즉, 이론적으로 <strong>생명 게임 안에서 컴퓨터를 만들 수 있습니다!</strong>
            <br />
            실제로 연구자들이 생명 게임 안에서 생명 게임을 구현하기도 했어요.
          </p>
        </div>
      </section>

      {/* Summary */}
      <section className={styles.summarySection}>
        <h2 className={styles.sectionTitle}>정리</h2>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>셀룰러 오토마타</span>
            <span>격자 + 규칙 + 동시</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>창발</span>
            <span>단순 → 복잡</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>8방향 이웃</span>
            <span>상하좌우 + 대각선</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>튜링 완전</span>
            <span>컴퓨터와 동등!</span>
          </div>
        </div>
      </section>

      <div className={styles.navArea}>
        <Link href="/puzzle/game-of-life" className={styles.navBtn}>
          ← 처음으로
        </Link>
        <Link href="/puzzle/game-of-life/playground" className={styles.navBtnPrimary}>
          다시 구경하기 →
        </Link>
      </div>
    </div>
  );
}
