'use client';

import { useEffect, useRef, useState } from 'react';
import { RiceBox } from './RiceBox';
import {
  analogyFor,
  dialogueAt,
  firstCellExceeding,
  formatKoreanShort,
  formatScientific,
  grainsAt,
  grainsCumulative,
  weightOf,
} from '@/lib/puzzles/expLog';
import styles from './page.module.css';

const AUTO_INTERVAL_MS = 350;
const RICE_PER_TON_GRAINS = 40_000_000n; // 1톤 = 4×10⁷톨
const RICE_KOREA_GRAINS = 140_000_000_000_000n; // 약 350만 톤
const RICE_WORLD_GRAINS = 20_000_000_000_000_000n; // 약 5억 톤

export function RiceBoxGame() {
  const [cell, setCell] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!autoplay) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }
    timerRef.current = setInterval(() => {
      setCell((c) => {
        if (c >= 64) {
          setAutoplay(false);
          return c;
        }
        return c + 1;
      });
    }, AUTO_INTERVAL_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoplay]);

  const next = () => setCell((c) => Math.min(64, c + 1));
  const reset = () => {
    setAutoplay(false);
    setCell(0);
  };

  const displayCell = Math.max(1, cell || 1);
  const thisGrains = cell === 0 ? 0n : grainsAt(displayCell);
  const cumGrains = cell === 0 ? 0n : grainsCumulative(displayCell);
  const analogy = analogyFor(cumGrains);
  const weight = weightOf(cumGrains);
  const dlg = dialogueAt(cell);

  return (
    <main className={styles.gameTab}>
      <div className={styles.gameMain}>
        {/* 좌: 체스판 + 대화 */}
        <div className={styles.chessSide}>
          <ChessBoard cell={cell} />
          <Dialogue sage={dlg.sage} king={dlg.king} />
        </div>

        {/* 우: 떨어지는 쌀 박스 */}
        <div className={styles.gameBoxSide}>
          <RiceBox cell={cell} />
        </div>
      </div>

      {/* 컨트롤 */}
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.primaryBtn}
          onClick={next}
          disabled={cell >= 64}
        >
          {cell === 0 ? '🌾 첫 칸에 한 톨' : cell >= 64 ? '✓ 64칸 완료' : `다음 칸 → ${cell + 1}`}
        </button>
        <button
          type="button"
          className={`${styles.secondaryBtn} ${autoplay ? styles.active : ''}`}
          onClick={() => setAutoplay((a) => !a)}
          disabled={cell >= 64}
        >
          {autoplay ? '⏸ 일시정지' : '▶ 자동 64칸'}
        </button>
        <button type="button" className={styles.secondaryBtn} onClick={reset}>
          ⟲ 처음으로
        </button>
      </div>

      {/* 정보 패널 */}
      <div className={styles.infoPanel}>
        <div className={styles.infoCell}>
          <span className={styles.infoLabel}>현재 칸</span>
          <span className={styles.infoValue}>{cell || '—'} / 64</span>
        </div>
        <div className={styles.infoCell}>
          <span className={styles.infoLabel}>이 칸의 쌀알</span>
          <span className={styles.infoValue}>{formatBig(thisGrains)}</span>
        </div>
        <div className={styles.infoCell}>
          <span className={styles.infoLabel}>누적 쌀알</span>
          <span className={styles.infoValue}>{formatBig(cumGrains)}</span>
        </div>
        <div className={styles.infoCell}>
          <span className={styles.infoLabel}>누적 무게</span>
          <span className={styles.infoValue}>
            {weight.value} {weight.unit}
          </span>
        </div>
        <div className={styles.infoAnalogy}>
          <span className={styles.analogyIcon}>{analogy.icon ?? '🌾'}</span>
          <span className={styles.analogyText}>{analogy.label}</span>
        </div>
      </div>

      {/* 챌린지 */}
      <section>
        <h3 className={styles.sectionTitle} style={{ fontSize: '1.15rem' }}>
          🎯 도전 질문
        </h3>
        <div className={styles.challenges}>
          <ChallengeCard
            question="쌀 1톤(약 4천만 톨)을 처음 넘기는 칸은?"
            answer={`${firstCellExceeding(RICE_PER_TON_GRAINS)}칸`}
          />
          <ChallengeCard
            question="한국 1년 쌀 생산량(약 350만 톤)을 처음 넘기는 칸은?"
            answer={`${firstCellExceeding(RICE_KOREA_GRAINS)}칸`}
          />
          <ChallengeCard
            question="세계 1년 쌀 생산량(약 5억 톤)을 처음 넘기는 칸은?"
            answer={`${firstCellExceeding(RICE_WORLD_GRAINS)}칸`}
          />
          <ChallengeCard
            question="64칸 전체의 쌀을 모으면 세계 1년 생산량의 몇 배?"
            answer="약 900배"
          />
        </div>
      </section>
    </main>
  );
}

function formatBig(n: bigint): string {
  if (n < 1_000_000n) return n.toLocaleString('ko-KR');
  if (n < 10_000_000_000_000_000n) return formatKoreanShort(n);
  return formatScientific(n);
}

// ─── 체스판 8×8 ─────────────────────────────────────
function ChessBoard({ cell }: { cell: number }) {
  // 셀 번호: 좌상(1)→우상(8), 둘째줄 좌(9)→우(16), …, 우하(64)
  const cells: number[] = Array.from({ length: 64 }, (_, i) => i + 1);
  return (
    <div className={styles.chessBoard} role="grid" aria-label="체스판 64칸">
      {cells.map((n) => {
        const row = Math.floor((n - 1) / 8);
        const col = (n - 1) % 8;
        const isLight = (row + col) % 2 === 0;
        const isDone = n < cell;
        const isCurrent = n === cell;
        return (
          <div
            key={n}
            className={[
              styles.chessCell,
              isLight ? styles.cellLight : styles.cellDark,
              isDone ? styles.cellDone : '',
              isCurrent ? styles.cellCurrent : '',
            ]
              .filter(Boolean)
              .join(' ')}
            role="gridcell"
            aria-label={`${n}번 칸${isCurrent ? ' (현재)' : isDone ? ' (지나감)' : ''}`}
          >
            {(isDone || isCurrent) && <span className={styles.cellGrain} aria-hidden="true" />}
            <span className={styles.cellCount}>{n}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── 왕↔현자 대화 ───────────────────────────────────
function Dialogue({ sage, king }: { sage: string; king: string }) {
  return (
    <div className={styles.dialog}>
      <div className={styles.dialogLine}>
        <span className={`${styles.dialogWho} ${styles.dialogSage}`}>🧙‍♂️ 현자</span>
        <span className={styles.dialogText}>{sage}</span>
      </div>
      <div className={styles.dialogLine}>
        <span className={`${styles.dialogWho} ${styles.dialogKing}`}>👑 왕</span>
        <span className={styles.dialogText}>{king}</span>
      </div>
    </div>
  );
}

// ─── 챌린지 카드 (펼치면 답 공개) ────────────────────
function ChallengeCard({ question, answer }: { question: string; answer: string }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className={styles.challengeCard}>
      <span className={styles.challengeQ}>{question}</span>
      {revealed ? (
        <span className={styles.challengeAnswer}>✓ {answer}</span>
      ) : (
        <button
          type="button"
          className={styles.secondaryBtn}
          onClick={() => setRevealed(true)}
        >
          답 보기
        </button>
      )}
    </div>
  );
}
