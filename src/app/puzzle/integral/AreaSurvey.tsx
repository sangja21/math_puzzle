'use client';

import { useMemo, useState } from 'react';
import {
  AREA_MISSIONS,
  type AreaMission,
  AX_MIN,
  AX_MAX,
  N_STEPS,
  midpointSum,
  areaStars,
  areaErrorPct,
} from '@/lib/puzzles/integral';
import styles from './AreaSurvey.module.css';

type Phase = 'estimate' | 'verify' | 'result';

export function AreaSurvey() {
  const [missionIdx, setMissionIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('estimate');
  const [guess, setGuess] = useState<number | null>(null);
  const [ni, setNi] = useState(0);
  const [starsEarned, setStarsEarned] = useState<number[]>([]);

  const done = missionIdx >= AREA_MISSIONS.length;
  const mission = done
    ? AREA_MISSIONS[AREA_MISSIONS.length - 1]
    : AREA_MISSIONS[missionIdx];

  const n = phase === 'estimate' ? 0 : N_STEPS[ni];
  const sum = n > 0 ? midpointSum(mission, n) : 0;

  const startMission = (idx: number) => {
    setMissionIdx(idx);
    setPhase('estimate');
    setGuess(null);
    setNi(0);
  };

  const submitEstimate = () => {
    if (guess === null) return;
    setPhase('verify');
  };

  const reveal = () => {
    if (guess === null) return;
    setStarsEarned((prev) => [...prev, areaStars(mission, guess)]);
    setPhase('result');
  };

  // ─── 전체 완료 요약 ──────────────────────────
  if (done) {
    const total = starsEarned.reduce((s, v) => s + v, 0);
    const max = AREA_MISSIONS.length * 3;
    return (
      <div className={styles.wrap}>
        <div className={styles.summaryCard}>
          <h3 className={styles.summaryTitle}>📜 측량 길드 승급!</h3>
          <div className={styles.summaryStars}>
            {'⭐'.repeat(total)}
            <span className={styles.summaryCount}>
              {total} / {max}
            </span>
          </div>
          <ul className={styles.summaryList}>
            {AREA_MISSIONS.map((m, i) => (
              <li key={m.id}>
                {m.emoji} {m.name} — {'⭐'.repeat(starsEarned[i] ?? 0) || '—'}
              </li>
            ))}
          </ul>
          <p className={styles.summaryNote}>
            모눈으로 어림하고 직사각형으로 검증했어요 — 아르키메데스부터
            뉴턴까지, 적분의 역사를 한 바퀴!
          </p>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => {
              setStarsEarned([]);
              startMission(0);
            }}
          >
            🎯 처음부터 다시 도전
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      {/* 미션 헤더 */}
      <div className={styles.missionHeader}>
        <span className={styles.missionBadge}>
          미션 {missionIdx + 1} / {AREA_MISSIONS.length}
        </span>
        <h3 className={styles.missionTitle}>
          {mission.emoji} {mission.name}
        </h3>
        <p className={styles.missionScene}>{mission.scene}</p>
      </div>

      {/* 장면 */}
      <div className={styles.sceneBox}>
        <AreaSvg mission={mission} n={n} showGrid={phase === 'estimate'} />
        {phase !== 'estimate' && (
          <div className={styles.sumBar}>
            <span>
              직사각형 <strong>{n}</strong>개의 합
            </span>
            <span className={styles.sumValue}>{sum.toFixed(3)}</span>
          </div>
        )}
      </div>

      {phase === 'estimate' && (
        <div className={styles.panel}>
          <div className={styles.stepLabel}>① 모눈으로 어림하기</div>
          <p className={styles.stepDesc}>
            모눈 한 칸 = <span className={styles.mono}>1 × 1</span>. 색칠된
            영역이 몇 칸쯤일지 세어 보고 추정을 제출하세요.
          </p>
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabel}>
              <span>📐 내 추정 면적</span>
              <span className={styles.sliderValue}>
                {guess !== null ? guess.toFixed(1) : '—'}
              </span>
            </div>
            <input
              type="range"
              min={mission.guessMin}
              max={mission.guessMax}
              step={mission.guessStep}
              value={guess ?? (mission.guessMin + mission.guessMax) / 2}
              onChange={(e) => setGuess(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
          <button
            type="button"
            className={styles.primaryBtn}
            disabled={guess === null}
            onClick={submitEstimate}
          >
            📨 추정 제출
          </button>
        </div>
      )}

      {phase === 'verify' && guess !== null && (
        <div className={styles.panel}>
          <div className={styles.stepLabel}>② 직사각형 부대 출동!</div>
          <p className={styles.stepDesc}>
            내 추정 <span className={styles.mono}>{guess.toFixed(1)}</span> —
            과연? N 을 끝까지 올리며 직사각형 합이 어디로 다가가는지 지켜보세요.
          </p>
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabel}>
              <span>직사각형 개수 N</span>
              <span className={styles.sliderValue}>{N_STEPS[ni]}</span>
            </div>
            <input
              type="range"
              min={0}
              max={N_STEPS.length - 1}
              step={1}
              value={ni}
              onChange={(e) => setNi(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
          <button
            type="button"
            className={styles.primaryBtn}
            disabled={N_STEPS[ni] < 32}
            onClick={reveal}
          >
            📜 정답 공개 {N_STEPS[ni] < 32 ? '(N을 32 이상으로!)' : ''}
          </button>
        </div>
      )}

      {phase === 'result' && guess !== null && (
        <ResultPanel
          mission={mission}
          guess={guess}
          isLast={missionIdx === AREA_MISSIONS.length - 1}
          onNext={() => startMission(missionIdx + 1)}
        />
      )}
    </div>
  );
}

// ─── 결과 패널 ───────────────────────────────────
function ResultPanel({
  mission,
  guess,
  isLast,
  onNext,
}: {
  mission: AreaMission;
  guess: number;
  isLast: boolean;
  onNext: () => void;
}) {
  const stars = areaStars(mission, guess);
  const err = areaErrorPct(mission, guess);
  const finest = midpointSum(mission, 128);

  return (
    <div className={styles.panel}>
      <div className={styles.resultStars}>{stars > 0 ? '⭐'.repeat(stars) : '💧'}</div>
      <table className={styles.resultTable}>
        <tbody>
          <tr>
            <th>내 추정</th>
            <td>{guess.toFixed(1)}</td>
          </tr>
          <tr>
            <th>직사각형 128개 합</th>
            <td>{finest.toFixed(3)}</td>
          </tr>
          <tr>
            <th>참값</th>
            <td>{mission.exact.toFixed(3)}</td>
          </tr>
          <tr>
            <th>오차</th>
            <td>{err.toFixed(1)}%</td>
          </tr>
        </tbody>
      </table>

      <div className={styles.mathCard}>
        <div className={styles.mathCardTitle}>🧮 수학의 눈으로 보면</div>
        <p>{mission.exactNote}</p>
      </div>

      <button type="button" className={styles.primaryBtn} onClick={onNext}>
        {isLast ? '📜 최종 결과 보기' : '다음 미션 ▶'}
      </button>
    </div>
  );
}

// ─── 면적 그림 (원리 탭과 공유) ──────────────────
export function AreaSvg({
  mission,
  n,
  showGrid,
  fillToX,
}: {
  mission: Pick<AreaMission, 'f' | 'yMax'>;
  /** 직사각형 개수 — 0 이면 영역 채움만 */
  n: number;
  showGrid: boolean;
  /** 영역을 x 까지만 채움 (FTC 시연용) */
  fillToX?: number;
}) {
  const W = 580;
  const H = 290;
  const PT = 20;
  const PB = 34;
  const PX = 34;
  const kx = (W - 2 * PX) / (AX_MAX - AX_MIN);
  const ky = (H - PT - PB) / mission.yMax;
  const sx = (x: number) => PX + (x - AX_MIN) * kx;
  const sy = (y: number) => H - PB - y * ky;

  const xEnd = fillToX ?? AX_MAX;

  const areaPath = useMemo(() => {
    const N = 140;
    const pts: string[] = [`M${sx(AX_MIN)},${sy(0)}`];
    for (let i = 0; i <= N; i++) {
      const x = AX_MIN + ((xEnd - AX_MIN) * i) / N;
      pts.push(`L${sx(x).toFixed(1)},${sy(mission.f(x)).toFixed(1)}`);
    }
    pts.push(`L${sx(xEnd)},${sy(0)} Z`);
    return pts.join(' ');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mission, xEnd]);

  const curvePath = useMemo(() => {
    const N = 140;
    const pts: string[] = [];
    for (let i = 0; i <= N; i++) {
      const x = AX_MIN + ((AX_MAX - AX_MIN) * i) / N;
      pts.push(`${i === 0 ? 'M' : 'L'}${sx(x).toFixed(1)},${sy(mission.f(x)).toFixed(1)}`);
    }
    return pts.join(' ');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mission]);

  const rects = useMemo(() => {
    if (n <= 0) return [];
    const w = (AX_MAX - AX_MIN) / n;
    const out: { x: number; w: number; h: number }[] = [];
    for (let i = 0; i < n; i++) {
      const x = AX_MIN + i * w;
      out.push({ x, w, h: mission.f(x + w / 2) });
    }
    return out;
  }, [mission, n]);

  const gridYMax = Math.ceil(mission.yMax);

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      className={styles.scene}
      role="img"
      aria-label="곡선 아래 면적"
    >
      {/* 모눈 */}
      {showGrid && (
        <>
          {Array.from({ length: AX_MAX + 1 }, (_, i) => (
            <line
              key={`vx${i}`}
              x1={sx(i)}
              y1={sy(gridYMax)}
              x2={sx(i)}
              y2={sy(0)}
              stroke="rgba(148,163,184,0.25)"
              strokeWidth={i % 2 === 0 ? 1.2 : 0.6}
            />
          ))}
          {Array.from({ length: gridYMax + 1 }, (_, i) => (
            <line
              key={`hz${i}`}
              x1={sx(0)}
              y1={sy(i)}
              x2={sx(AX_MAX)}
              y2={sy(i)}
              stroke="rgba(148,163,184,0.25)"
              strokeWidth={i % 2 === 0 ? 1.2 : 0.6}
            />
          ))}
        </>
      )}

      {/* 영역 채움 */}
      <path d={areaPath} fill="rgba(45,212,191,0.22)" stroke="none" />

      {/* 직사각형 */}
      {rects.map((r, i) => (
        <rect
          key={i}
          x={sx(r.x)}
          y={sy(r.h)}
          width={r.w * kx}
          height={r.h * ky}
          fill="rgba(251,191,36,0.18)"
          stroke="#fbbf24"
          strokeWidth={n > 32 ? 0.6 : 1.2}
        />
      ))}

      {/* 곡선 */}
      <path d={curvePath} fill="none" stroke="#2dd4bf" strokeWidth={3} />

      {/* 바닥축 + 눈금 숫자 */}
      <line
        x1={PX - 8}
        y1={sy(0)}
        x2={W - PX + 8}
        y2={sy(0)}
        stroke="rgba(248,250,252,0.5)"
        strokeWidth={2}
      />
      {Array.from({ length: AX_MAX + 1 }, (_, i) => (
        <text
          key={`tx${i}`}
          x={sx(i)}
          y={sy(0) + 18}
          fill="rgba(248,250,252,0.6)"
          fontSize={10}
          textAnchor="middle"
        >
          {i}
        </text>
      ))}
    </svg>
  );
}
