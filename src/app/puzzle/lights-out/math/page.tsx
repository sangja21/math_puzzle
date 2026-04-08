'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createEmptyBoard, toggleCell, Board } from '@/lib/puzzles/lightsOut';
import styles from './page.module.css';

function XorDemo() {
  const [val, setVal] = useState(false);
  const [count, setCount] = useState(0);

  const handleToggle = () => {
    setVal((v) => !v);
    setCount((c) => c + 1);
  };

  return (
    <div className={styles.xorDemo}>
      <button
        className={`${styles.xorBulb} ${val ? styles.xorOn : styles.xorOff}`}
        onClick={handleToggle}
      >
        {val ? 'ON' : 'OFF'}
      </button>
      <div className={styles.xorInfo}>
        <span>클릭 횟수: {count}</span>
        <span className={styles.xorResult}>
          {count % 2 === 0 ? '짝수 → OFF' : '홀수 → ON'}
        </span>
      </div>
    </div>
  );
}

function OrderDemo() {
  const [board, setBoard] = useState<Board>(createEmptyBoard(3));
  const [historyA, setHistoryA] = useState<[number, number][]>([]);
  const [historyB, setHistoryB] = useState<[number, number][]>([]);
  const [boardB, setBoardB] = useState<Board>(createEmptyBoard(3));
  const [mode, setMode] = useState<'A' | 'B'>('A');

  const handleClick = (row: number, col: number) => {
    if (mode === 'A') {
      setBoard(toggleCell(board, row, col));
      setHistoryA((h) => [...h, [row, col]]);
    } else {
      setBoardB(toggleCell(boardB, row, col));
      setHistoryB((h) => [...h, [row, col]]);
    }
  };

  const currentBoard = mode === 'A' ? board : boardB;
  const currentHistory = mode === 'A' ? historyA : historyB;

  const boardsMatch =
    historyA.length > 0 &&
    historyB.length > 0 &&
    board.every((row, r) => row.every((cell, c) => cell === boardB[r][c]));

  const reset = () => {
    setBoard(createEmptyBoard(3));
    setBoardB(createEmptyBoard(3));
    setHistoryA([]);
    setHistoryB([]);
    setMode('A');
  };

  return (
    <div className={styles.orderDemo}>
      <div className={styles.orderTabs}>
        <button
          className={`${styles.orderTab} ${mode === 'A' ? styles.orderTabActive : ''}`}
          onClick={() => setMode('A')}
        >
          순서 A
        </button>
        <button
          className={`${styles.orderTab} ${mode === 'B' ? styles.orderTabActive : ''}`}
          onClick={() => setMode('B')}
        >
          순서 B
        </button>
        <button className={styles.orderResetBtn} onClick={reset}>
          초기화
        </button>
      </div>

      <div className={styles.orderBoard}>
        {currentBoard.map((row, r) => (
          <div key={r} className={styles.orderRow}>
            {row.map((cell, c) => (
              <button
                key={c}
                className={`${styles.orderCell} ${cell ? styles.on : styles.off}`}
                onClick={() => handleClick(r, c)}
              />
            ))}
          </div>
        ))}
      </div>

      <div className={styles.orderHistory}>
        클릭 기록:{' '}
        {currentHistory.map(([r, c], i) => (
          <span key={i} className={styles.historyChip}>
            ({r},{c})
          </span>
        ))}
        {currentHistory.length === 0 && (
          <span className={styles.historyEmpty}>셀을 클릭해 보세요</span>
        )}
      </div>

      {boardsMatch && (
        <div className={styles.orderMatch}>
          두 보드가 같습니다! 순서는 결과에 영향을 주지 않아요.
        </div>
      )}
    </div>
  );
}

function MatrixDemo() {
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(
    null
  );
  const size = 3;

  const getAffectedPattern = (row: number, col: number): boolean[][] => {
    const pattern = Array.from({ length: size }, () =>
      Array(size).fill(false)
    );
    const dirs = [
      [0, 0],
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    for (const [dr, dc] of dirs) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
        pattern[nr][nc] = true;
      }
    }
    return pattern;
  };

  const pattern = selectedCell
    ? getAffectedPattern(selectedCell[0], selectedCell[1])
    : null;

  return (
    <div className={styles.matrixDemo}>
      <p className={styles.matrixHint}>
        아래 셀을 클릭하면 영향 범위가 행렬로 표시됩니다.
      </p>
      <div className={styles.matrixRow}>
        <div className={styles.matrixGrid}>
          <div className={styles.matrixLabel}>클릭할 셀 선택</div>
          {Array.from({ length: size }, (_, r) => (
            <div key={r} className={styles.orderRow}>
              {Array.from({ length: size }, (_, c) => (
                <button
                  key={c}
                  className={`${styles.matrixCell} ${selectedCell && selectedCell[0] === r && selectedCell[1] === c ? styles.matrixSelected : ''}`}
                  onClick={() => setSelectedCell([r, c])}
                >
                  ({r},{c})
                </button>
              ))}
            </div>
          ))}
        </div>

        {pattern && (
          <>
            <div className={styles.matrixArrow}>→</div>
            <div className={styles.matrixGrid}>
              <div className={styles.matrixLabel}>영향 패턴</div>
              {pattern.map((row, r) => (
                <div key={r} className={styles.orderRow}>
                  {row.map((cell, c) => (
                    <div
                      key={c}
                      className={`${styles.matrixResult} ${cell ? styles.matrixAffected : ''}`}
                    >
                      {cell ? '1' : '0'}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedCell && (
        <div className={styles.matrixExplain}>
          ({selectedCell[0]},{selectedCell[1]})을 누르면 1로 표시된 위치가
          토글됩니다.
          <br />
          이 패턴들을 모아 <strong>행렬</strong>로 만들면, 퍼즐을{' '}
          <strong>연립방정식</strong>으로 풀 수 있어요!
        </div>
      )}
    </div>
  );
}

export default function LightsOutMathPage() {
  return (
    <div className={styles.container}>
      <Link href="/puzzle/lights-out/game" className={styles.backButton}>
        ← 게임으로
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>💡 라이츠 아웃의 수학</h1>
        <p className={styles.subtitle}>게임 뒤에 숨은 수학적 원리를 알아보자!</p>
      </header>

      {/* Section 1: Event Connection */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>1. 이벤트와의 연결</h2>
        <div className={styles.conceptGrid}>
          <div className={styles.conceptCard}>
            <div className={styles.conceptIcon}>🖱️</div>
            <h3>이벤트 (Event)</h3>
            <p>
              &quot;셀을 클릭한다&quot; = 이벤트가 발생한다.
              <br />
              블록코딩에서 &quot;깃발을 클릭했을 때&quot;와 같은 개념!
            </p>
          </div>
          <div className={styles.conceptCard}>
            <div className={styles.conceptIcon}>⚡</div>
            <h3>핸들러 (Handler)</h3>
            <p>
              이벤트가 발생하면 실행되는 동작.
              <br />
              라이츠 아웃에서는 &quot;십자 방향 토글&quot;이 핸들러!
            </p>
          </div>
          <div className={styles.conceptCard}>
            <div className={styles.conceptIcon}>🌊</div>
            <h3>전파 (Propagation)</h3>
            <p>
              하나의 이벤트가 여러 대상에 영향.
              <br />한 번의 클릭이 최대 5개 셀을 바꾸는 것처럼!
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: XOR */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>2. 토글과 XOR</h2>
        <div className={styles.explanation}>
          <p>
            같은 셀을 <strong>두 번</strong> 누르면 원래대로 돌아옵니다. 왜일까요?
          </p>
          <ul className={styles.bulletList}>
            <li>
              <strong>1번 누르면</strong>: OFF → ON (또는 ON → OFF)
            </li>
            <li>
              <strong>2번 누르면</strong>: 다시 원래 상태로!
            </li>
            <li>
              이것이 바로 <strong>XOR (배타적 논리합)</strong>의 성질
            </li>
            <li>
              <strong>짝수 번</strong> = 취소, <strong>홀수 번</strong> = 적용
            </li>
          </ul>
        </div>
        <div className={styles.demoBox}>
          <h3 className={styles.demoTitle}>직접 해보기: 토글 실험</h3>
          <XorDemo />
        </div>
      </section>

      {/* Section 3: Order Independence */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>3. 순서는 상관없다!</h2>
        <div className={styles.explanation}>
          <p>놀라운 사실: 셀을 누르는 <strong>순서</strong>는 결과에 영향을 주지 않습니다!</p>
          <ul className={styles.bulletList}>
            <li>
              (0,0) → (1,1) 순서로 누르나
            </li>
            <li>
              (1,1) → (0,0) 순서로 누르나
            </li>
            <li>
              결과는 <strong>항상 같습니다</strong> (교환법칙)
            </li>
            <li>
              즉, &quot;어떤 셀을 누를지&quot;만 결정하면 됩니다
            </li>
          </ul>
        </div>
        <div className={styles.demoBox}>
          <h3 className={styles.demoTitle}>
            직접 해보기: 순서 A와 B로 같은 셀을 다른 순서로 눌러보세요
          </h3>
          <OrderDemo />
        </div>
      </section>

      {/* Section 4: Matrix */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>4. 행렬로 풀기 (심화)</h2>
        <div className={styles.explanation}>
          <p>
            각 셀을 누를 때 영향받는 패턴을 <strong>행렬</strong>로 표현할 수
            있습니다.
          </p>
          <ul className={styles.bulletList}>
            <li>영향받는 셀 = 1, 아닌 셀 = 0</li>
            <li>
              이 행렬들을 모으면 <strong>연립방정식</strong>이 됩니다
            </li>
            <li>
              수학자들은 <strong>GF(2)</strong>라는 체계로 이 문제를 풀어요
            </li>
            <li>GF(2)에서는 1+1=0 (XOR과 같은 규칙!)</li>
          </ul>
        </div>
        <div className={styles.demoBox}>
          <h3 className={styles.demoTitle}>직접 해보기: 영향 패턴 보기</h3>
          <MatrixDemo />
        </div>
      </section>

      {/* Summary */}
      <section className={styles.summarySection}>
        <h2 className={styles.sectionTitle}>정리</h2>
        <div className={styles.summaryGrid}>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>이벤트</span>
            <span>클릭 → 반응 → 전파</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>XOR</span>
            <span>2번 누르면 취소</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>교환법칙</span>
            <span>순서 무관</span>
          </div>
          <div className={styles.summaryItem}>
            <span className={styles.summaryLabel}>행렬</span>
            <span>패턴을 수식으로</span>
          </div>
        </div>
      </section>

      <div className={styles.navArea}>
        <Link href="/puzzle/lights-out" className={styles.navBtn}>
          ← 규칙으로
        </Link>
        <Link href="/puzzle/lights-out/game" className={styles.navBtnPrimary}>
          다시 플레이 →
        </Link>
      </div>
    </div>
  );
}
