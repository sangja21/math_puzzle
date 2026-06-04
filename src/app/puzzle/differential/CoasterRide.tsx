'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  COASTER_ROUNDS,
  type CoasterRound,
  X_MIN,
  X_MAX,
  trackSlope,
  steepestX,
  trackExtrema,
  starsForSpot,
  hitExtremum,
} from '@/lib/puzzles/differential';
import styles from './CoasterRide.module.css';

type Phase = 'play' | 'result';

export function CoasterRide() {
  const [roundIdx, setRoundIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('play');
  const [markerX, setMarkerX] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [cartX, setCartX] = useState(0);
  const [found, setFound] = useState<number[]>([]);
  const [wrong, setWrong] = useState(0);
  const [missMsg, setMissMsg] = useState<string | null>(null);
  const [lastStars, setLastStars] = useState(0);
  const [starsEarned, setStarsEarned] = useState<number[]>([]);
  const rafRef = useRef(0);

  const done = roundIdx >= COASTER_ROUNDS.length;
  const round = done
    ? COASTER_ROUNDS[COASTER_ROUNDS.length - 1]
    : COASTER_ROUNDS[roundIdx];

  const answerX = useMemo(() => steepestX(round), [round]);
  const extrema = useMemo(() => trackExtrema(round), [round]);

  // ─── 자동 주행 애니메이션 ────────────────────
  useEffect(() => {
    if (!playing) return;
    let start: number | null = null;
    const DURATION = 6000;
    const tick = (t: number) => {
      if (start === null) start = t;
      const p = Math.min((t - start) / DURATION, 1);
      // easeInOut 약간 — 실감나게
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      setCartX(X_MIN + (X_MAX - X_MIN) * eased);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setPlaying(false);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing]);

  const gaugeX = playing ? cartX : markerX;
  const slope = trackSlope(round, gaugeX);

  const startRound = (idx: number) => {
    setRoundIdx(idx);
    setPhase('play');
    setMarkerX(0);
    setCartX(0);
    setPlaying(false);
    setFound([]);
    setWrong(0);
    setMissMsg(null);
  };

  const flagHere = () => {
    if (round.kind === 'steepest') {
      const s = starsForSpot(markerX, answerX);
      setLastStars(s);
      setStarsEarned((prev) => [...prev, s]);
      setPhase('result');
      return;
    }
    // extrema 라운드
    const hit = hitExtremum(extrema, markerX);
    if (hit >= 0 && !found.includes(hit)) {
      const nf = [...found, hit];
      setFound(nf);
      setMissMsg(null);
      if (nf.length === extrema.length) {
        const s = wrong === 0 ? 3 : wrong <= 2 ? 2 : 1;
        setLastStars(s);
        setStarsEarned((prev) => [...prev, s]);
        setPhase('result');
      }
    } else if (hit >= 0) {
      setMissMsg('이미 잡은 곳이에요! 다른 봉우리·골짜기를 찾아보세요.');
    } else {
      setWrong((w) => w + 1);
      setMissMsg('여긴 아니에요 — 기울기계가 0에 가까운 곳을 노리세요!');
    }
  };

  // ─── 전체 완료 요약 ──────────────────────────
  if (done) {
    const total = starsEarned.reduce((s, v) => s + v, 0);
    const max = COASTER_ROUNDS.length * 3;
    return (
      <div className={styles.wrap}>
        <div className={styles.summaryCard}>
          <h3 className={styles.summaryTitle}>🎡 모든 트랙 정복!</h3>
          <div className={styles.summaryStars}>
            {'⭐'.repeat(total)}
            <span className={styles.summaryCount}>
              {total} / {max}
            </span>
          </div>
          <ul className={styles.summaryList}>
            {COASTER_ROUNDS.map((r, i) => (
              <li key={r.id}>
                {r.emoji} {r.name} — {'⭐'.repeat(starsEarned[i] ?? 0) || '—'}
              </li>
            ))}
          </ul>
          <p className={styles.summaryNote}>
            기울기계 하나로 가장 가파른 곳과 봉우리·골짜기를 모두 찾아냈어요 —
            그게 바로 미분이 하는 일!
          </p>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => {
              setStarsEarned([]);
              startRound(0);
            }}
          >
            🎢 처음부터 다시 도전
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      {/* 라운드 헤더 */}
      <div className={styles.missionHeader}>
        <span className={styles.missionBadge}>
          라운드 {roundIdx + 1} / {COASTER_ROUNDS.length}
        </span>
        <h3 className={styles.missionTitle}>
          {round.emoji} {round.name}
        </h3>
        <p className={styles.missionScene}>{round.task}</p>
      </div>

      {/* 트랙 장면 */}
      <div className={styles.sceneBox}>
        <TrackSvg
          round={round}
          cartX={playing ? cartX : markerX}
          markerX={markerX}
          showAnswer={phase === 'result'}
          answerX={answerX}
          extrema={extrema}
          found={found}
        />
        {/* 기울기계 */}
        <div className={styles.gauge}>
          <span className={styles.gaugeLabel}>🧭 기울기계</span>
          <GaugeDial slope={slope} />
          <span
            className={`${styles.gaugeValue} ${
              slope < -0.15 ? styles.gaugeDown : slope > 0.15 ? styles.gaugeUp : styles.gaugeFlat
            }`}
          >
            {slope >= 0 ? '+' : ''}
            {slope.toFixed(2)}
          </span>
        </div>
      </div>

      {phase === 'play' && (
        <div className={styles.panel}>
          <div className={styles.stepLabel}>
            {round.kind === 'steepest' ? '🚩 가장 가파른 활강 지점 찾기' : `🚩 봉우리·골짜기 ${found.length} / ${extrema.length}`}
          </div>
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabel}>
              <span>🚃 마커 위치</span>
              <span className={styles.sliderValue}>{markerX.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={X_MIN}
              max={X_MAX}
              step={0.1}
              value={markerX}
              onChange={(e) => {
                setMarkerX(Number(e.target.value));
                setMissMsg(null);
              }}
              className={styles.slider}
              disabled={playing}
            />
          </div>
          {missMsg && <p className={styles.hint}>{missMsg}</p>}
          <div className={styles.btnRow}>
            <button
              type="button"
              className={styles.ghostBtn}
              disabled={playing}
              onClick={() => setPlaying(true)}
            >
              ▶ 자동 주행
            </button>
            <button
              type="button"
              className={styles.primaryBtn}
              disabled={playing}
              onClick={flagHere}
            >
              🚩 여기다!
            </button>
          </div>
        </div>
      )}

      {phase === 'result' && (
        <div className={styles.panel}>
          <div className={styles.resultStars}>
            {lastStars > 0 ? '⭐'.repeat(lastStars) : '💧'}
          </div>
          <div className={styles.mathCard}>
            <div className={styles.mathCardTitle}>🧮 수학의 눈으로 보면</div>
            {round.kind === 'steepest' ? (
              <p>
                정답은 <span className={styles.mono}>x = {answerX.toFixed(1)}</span>{' '}
                (내 마커: {markerX.toFixed(1)}). 트랙 높이 h(x) 의 미분{' '}
                <span className={styles.mono}>
                  h′({answerX.toFixed(1)}) = {trackSlope(round, answerX).toFixed(2)}
                </span>{' '}
                — 트랙 전체에서 <strong>가장 작은(가장 음수인) 미분값</strong>,
                즉 가장 가파른 내리막이에요.
              </p>
            ) : (
              <p>
                봉우리·골짜기{' '}
                <span className={styles.mono}>
                  {extrema.map((e) => `x=${e.x.toFixed(1)}`).join(' · ')}
                </span>{' '}
                — 모두 <strong>h′ = 0 인 지점</strong> (틀린 시도 {wrong}회).
                기울기계가 0을 가리키는 순간이 바로 극값!
              </p>
            )}
          </div>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => startRound(roundIdx + 1)}
          >
            {roundIdx === COASTER_ROUNDS.length - 1 ? '🎡 최종 결과 보기' : '다음 라운드 ▶'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── 기울기계 다이얼 ─────────────────────────────
function GaugeDial({ slope }: { slope: number }) {
  // 기울기 0 → 바늘 수직, 오르막(+) → 오른쪽, 내리막(−) → 왼쪽
  const theta = Math.PI / 2 - Math.atan(slope);
  const x2 = 32 + 24 * Math.cos(theta);
  const y2 = 36 - 24 * Math.sin(theta);
  return (
    <svg width={64} height={40} viewBox="0 0 64 40" aria-hidden>
      <path
        d="M 6 36 A 26 26 0 0 1 58 36"
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth={5}
        strokeLinecap="round"
      />
      <line x1={32} y1={36} x2={x2} y2={y2} stroke="#fbbf24" strokeWidth={3} strokeLinecap="round" />
      <circle cx={32} cy={36} r={3.5} fill="#fbbf24" />
    </svg>
  );
}

// ─── 트랙 SVG ────────────────────────────────────
function TrackSvg({
  round,
  cartX,
  markerX,
  showAnswer,
  answerX,
  extrema,
  found,
}: {
  round: CoasterRound;
  cartX: number;
  markerX: number;
  showAnswer: boolean;
  answerX: number;
  extrema: { x: number; y: number; kind: 'max' | 'min' }[];
  found: number[];
}) {
  const W = 580;
  const H = 300;
  const PT = 30;
  const PB = 34;
  const PX = 30;
  const kx = (W - 2 * PX) / (X_MAX - X_MIN);
  const ky = (H - PT - PB) / round.yMax;
  const sx = (x: number) => PX + (x - X_MIN) * kx;
  const sy = (y: number) => H - PB - y * ky;

  const trackPath = useMemo(() => {
    const N = 160;
    const pts: string[] = [];
    for (let i = 0; i <= N; i++) {
      const x = X_MIN + ((X_MAX - X_MIN) * i) / N;
      pts.push(`${i === 0 ? 'M' : 'L'}${sx(x).toFixed(1)},${sy(round.h(x)).toFixed(1)}`);
    }
    return pts.join(' ');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  // 지지 기둥
  const pillars = useMemo(() => {
    const xs: number[] = [];
    for (let x = 0.8; x < X_MAX; x += 1.4) xs.push(x);
    return xs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const cartY = sy(round.h(cartX)) - 11;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      className={styles.scene}
      role="img"
      aria-label={`${round.name} 트랙`}
    >
      {/* 별빛 배경 점 */}
      {[40, 140, 260, 380, 500].map((x, i) => (
        <circle key={i} cx={x} cy={26 + (i % 3) * 14} r={1.4} fill="rgba(248,250,252,0.5)" />
      ))}

      {/* 지면 */}
      <line
        x1={PX - 8}
        y1={H - PB}
        x2={W - PX + 8}
        y2={H - PB}
        stroke="rgba(248,250,252,0.4)"
        strokeWidth={2}
      />

      {/* 지지 기둥 */}
      {pillars.map((x) => (
        <line
          key={x}
          x1={sx(x)}
          y1={sy(round.h(x))}
          x2={sx(x)}
          y2={H - PB}
          stroke="rgba(167,139,250,0.28)"
          strokeWidth={2}
        />
      ))}

      {/* 트랙 */}
      <path d={trackPath} fill="none" stroke="#a78bfa" strokeWidth={4} strokeLinecap="round" />

      {/* 극값 깃발 (잡은 것) */}
      {extrema.map((e, i) =>
        found.includes(i) ? (
          <text key={i} x={sx(e.x)} y={sy(e.y) - 14} fontSize={16} textAnchor="middle">
            🚩
          </text>
        ) : null,
      )}

      {/* 정답 마커 */}
      {showAnswer && (
        <>
          <line
            x1={sx(answerX)}
            y1={PT}
            x2={sx(answerX)}
            y2={H - PB}
            stroke="#34d399"
            strokeWidth={1.6}
            strokeDasharray="6 5"
          />
          <text x={sx(answerX)} y={PT - 4} fontSize={12} fill="#6ee7b7" textAnchor="middle" fontWeight="bold">
            정답
          </text>
        </>
      )}

      {/* 내 마커 */}
      <line
        x1={sx(markerX)}
        y1={PT + 8}
        x2={sx(markerX)}
        y2={H - PB}
        stroke="rgba(251,191,36,0.55)"
        strokeWidth={1.4}
        strokeDasharray="4 4"
      />

      {/* 카트 */}
      <text x={sx(cartX)} y={cartY} fontSize={20} textAnchor="middle">
        🚃
      </text>
    </svg>
  );
}
