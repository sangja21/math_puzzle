'use client';

import { useState } from 'react';
import {
  SHADOW_MISSIONS,
  type ShadowMission,
  MY_HEIGHT,
  thalesHeight,
  sunAltitudeDeg,
  shadowStars,
  shadowErrorPct,
  fmtM,
} from '@/lib/puzzles/tangent';
import styles from './ThalesMission.module.css';

type Phase = 'measure' | 'guess' | 'result';

export function ThalesMission() {
  const [missionIdx, setMissionIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('measure');
  const [tape, setTape] = useState(0);
  const [measured, setMeasured] = useState<number | null>(null);
  const [guess, setGuess] = useState<number | null>(null);
  const [starsEarned, setStarsEarned] = useState<number[]>([]);

  const done = missionIdx >= SHADOW_MISSIONS.length;
  const mission = done
    ? SHADOW_MISSIONS[SHADOW_MISSIONS.length - 1]
    : SHADOW_MISSIONS[missionIdx];

  const aligned = Math.abs(tape - mission.targetShadow) < mission.tapeStep * 0.6;

  const startMission = (idx: number) => {
    setMissionIdx(idx);
    setPhase('measure');
    setTape(0);
    setMeasured(null);
    setGuess(null);
  };

  const recordTape = () => {
    if (!aligned) return;
    setMeasured(mission.targetShadow);
    setGuess(
      Math.round((mission.guessMin + mission.guessMax) / 2 / mission.guessStep) *
        mission.guessStep,
    );
    setPhase('guess');
  };

  const submitGuess = () => {
    if (guess === null) return;
    setStarsEarned((prev) => [...prev, shadowStars(mission, guess)]);
    setPhase('result');
  };

  // ─── 전체 미션 완료 요약 ─────────────────────────
  if (done) {
    const total = starsEarned.reduce((s, v) => s + v, 0);
    const max = SHADOW_MISSIONS.length * 3;
    return (
      <div className={styles.wrap}>
        <div className={styles.summaryCard}>
          <h3 className={styles.summaryTitle}>🏺 파라오의 인정!</h3>
          <div className={styles.summaryStars}>
            {'⭐'.repeat(total)}
            <span className={styles.summaryCount}>
              {total} / {max}
            </span>
          </div>
          <ul className={styles.summaryList}>
            {SHADOW_MISSIONS.map((m, i) => (
              <li key={m.id}>
                {m.emoji} {m.name} — {'⭐'.repeat(starsEarned[i] ?? 0) || '—'}
              </li>
            ))}
          </ul>
          <p className={styles.summaryNote}>
            막대기 하나와 그림자만으로 대피라미드의 높이를 알아냈어요 — 2600년
            전 탈레스와 똑같이!
          </p>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => {
              setStarsEarned([]);
              startMission(0);
            }}
          >
            🌅 처음부터 다시 도전
          </button>
        </div>
      </div>
    );
  }

  const ratio = MY_HEIGHT / mission.myShadow;

  return (
    <div className={styles.wrap}>
      {/* 미션 헤더 */}
      <div className={styles.missionHeader}>
        <span className={styles.missionBadge}>
          미션 {missionIdx + 1} / {SHADOW_MISSIONS.length}
        </span>
        <h3 className={styles.missionTitle}>
          {mission.emoji} {mission.name}
        </h3>
        <p className={styles.missionScene}>{mission.scene}</p>
        {mission.note && <p className={styles.scaleNote}>☝️ {mission.note}</p>}
      </div>

      {/* 내 측정값 카드 */}
      <div className={styles.myCard}>
        🧍 내 키 <strong>{fmtM(MY_HEIGHT)}</strong> · 내 그림자{' '}
        <strong>{fmtM(mission.myShadow)}</strong>
        <span className={styles.myRatio}>
          → 높이/그림자 비 = {ratio.toFixed(2)} (지금 이 시각 누구나!)
        </span>
      </div>

      {/* 장면 */}
      <div className={styles.sceneBox}>
        <SceneSvg mission={mission} phase={phase} tape={tape} aligned={aligned} guess={guess} />
      </div>

      {/* 단계별 컨트롤 */}
      {phase === 'measure' && (
        <div className={styles.panel}>
          <div className={styles.stepLabel}>① 줄자로 그림자 재기</div>
          <p className={styles.stepDesc}>
            줄자를 끌어 {mission.emoji} 그림자 끝까지 정확히 펼치세요.
          </p>
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabel}>
              <span>📏 줄자</span>
              <span className={styles.sliderValue}>{fmtM(tape)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={Math.ceil(mission.targetShadow * 1.2)}
              step={mission.tapeStep}
              value={tape}
              onChange={(e) => setTape(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
          {aligned ? (
            <div className={styles.alignedBanner}>
              🎯 그림자 끝에 딱! 길이를 기록하세요.
            </div>
          ) : (
            <p className={styles.hint}>
              {tape < mission.targetShadow ? '아직 그림자 끝에 못 미쳤어요…' : '그림자보다 길어요 — 줄여 보세요.'}
            </p>
          )}
          <button
            type="button"
            className={styles.primaryBtn}
            disabled={!aligned}
            onClick={recordTape}
          >
            📐 이 길이로 기록
          </button>
        </div>
      )}

      {phase === 'guess' && measured !== null && (
        <div className={styles.panel}>
          <div className={styles.stepLabel}>② 높이 추정 — 탈레스처럼!</div>
          <p className={styles.stepDesc}>
            비례식을 채워 보세요:{' '}
            <span className={styles.mono}>
              {fmtM(MY_HEIGHT)} / {fmtM(mission.myShadow)} = ? / {fmtM(measured)}
            </span>
          </p>
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabel}>
              <span>🗼 내 추정 높이</span>
              <span className={styles.sliderValue}>
                {guess !== null ? fmtM(guess) : '—'}
              </span>
            </div>
            <input
              type="range"
              min={mission.guessMin}
              max={mission.guessMax}
              step={mission.guessStep}
              value={guess ?? mission.guessMin}
              onChange={(e) => setGuess(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
          <button type="button" className={styles.primaryBtn} onClick={submitGuess}>
            ✅ 정답 확인
          </button>
        </div>
      )}

      {phase === 'result' && guess !== null && (
        <ResultPanel
          mission={mission}
          guess={guess}
          isLast={missionIdx === SHADOW_MISSIONS.length - 1}
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
  mission: ShadowMission;
  guess: number;
  isLast: boolean;
  onNext: () => void;
}) {
  const stars = shadowStars(mission, guess);
  const err = shadowErrorPct(mission, guess);
  const computed = thalesHeight(MY_HEIGHT, mission.myShadow, mission.targetShadow);
  const sunDeg = sunAltitudeDeg(MY_HEIGHT, mission.myShadow);

  return (
    <div className={styles.panel}>
      <div className={styles.resultStars}>{stars > 0 ? '⭐'.repeat(stars) : '💧'}</div>
      <table className={styles.resultTable}>
        <tbody>
          <tr>
            <th>내 추정</th>
            <td>{fmtM(guess)}</td>
          </tr>
          <tr>
            <th>실제 높이</th>
            <td>{fmtM(mission.height)}</td>
          </tr>
          <tr>
            <th>오차</th>
            <td>{err.toFixed(1)}%</td>
          </tr>
        </tbody>
      </table>

      <div className={styles.mathCard}>
        <div className={styles.mathCardTitle}>🧮 수학의 눈으로 보면</div>
        <p>
          높이/그림자 비 ={' '}
          <span className={styles.mono}>
            {fmtM(MY_HEIGHT)} ÷ {fmtM(mission.myShadow)} ={' '}
            {(MY_HEIGHT / mission.myShadow).toFixed(2)}
          </span>{' '}
          — 이게 바로 <strong>tan(태양 고도 {sunDeg.toFixed(1)}°)</strong>. 같은
          시각엔 모두에게 같으니{' '}
          <span className={styles.mono}>
            {fmtM(mission.targetShadow)} × {(MY_HEIGHT / mission.myShadow).toFixed(2)} ={' '}
            {fmtM(computed)}
          </span>
          . {mission.id === 'pyramid' && '실제 쿠푸 피라미드의 원래 높이가 약 146.6m!'}
        </p>
      </div>

      <button type="button" className={styles.primaryBtn} onClick={onNext}>
        {isLast ? '🏺 최종 결과 보기' : '다음 미션 ▶'}
      </button>
    </div>
  );
}

// ─── 장면 SVG ────────────────────────────────────
function SceneSvg({
  mission,
  phase,
  tape,
  aligned,
  guess,
}: {
  mission: ShadowMission;
  phase: Phase;
  tape: number;
  aligned: boolean;
  guess: number | null;
}) {
  const W = 580;
  const H = 330;
  const PT = 30;
  const PB = 44;
  const PX = 40;

  // 피라미드는 밑변 절반만큼 왼쪽 공간 필요
  const halfBase = mission.id === 'pyramid' ? mission.height * 0.79 : 0;
  const xMin = -(halfBase + mission.targetShadow * 0.04);
  const xMax = mission.targetShadow * 1.22;
  const yMax = mission.height * 1.18;
  const kx = (W - 2 * PX) / (xMax - xMin);
  const ky = (H - PT - PB) / yMax;
  const sx = (x: number) => PX + (x - xMin) * kx;
  const groundY = H - PB;
  const sy = (y: number) => groundY - y * ky;

  const tipX = sx(mission.targetShadow);
  const topY = sy(mission.height);

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      className={styles.scene}
      role="img"
      aria-label={`${mission.name} 그림자 측량 장면`}
    >
      {/* 해 — 꼭대기→그림자 끝 연장선 위 */}
      <SunOnRay
        x1={tipX}
        y1={groundY}
        x2={sx(0)}
        y2={topY}
      />

      {/* 지면 */}
      <line
        x1={PX - 10}
        y1={groundY}
        x2={W - PX + 10}
        y2={groundY}
        stroke="rgba(248,250,252,0.5)"
        strokeWidth={2}
      />

      {/* 그림자 */}
      <line
        x1={sx(0)}
        y1={groundY + 4}
        x2={tipX}
        y2={groundY + 4}
        stroke="rgba(2,6,23,0.9)"
        strokeWidth={7}
        strokeLinecap="round"
      />

      {/* 햇빛 줄기 (꼭대기 → 그림자 끝) */}
      <line
        x1={sx(0)}
        y1={topY}
        x2={tipX}
        y2={groundY}
        stroke="#fbbf24"
        strokeWidth={1.6}
        strokeDasharray="6 5"
        opacity={0.85}
      />

      {/* 목표 물체 */}
      <TargetShape mission={mission} sx={sx} sy={sy} groundY={groundY} />

      {/* 측정 기준점 (피라미드 중심) */}
      {mission.id === 'pyramid' && (
        <circle cx={sx(0)} cy={groundY} r={4} fill="#f87171" />
      )}

      {/* 줄자 */}
      {phase === 'measure' && (
        <>
          <line
            x1={sx(0)}
            y1={groundY + 14}
            x2={sx(Math.min(tape, xMax))}
            y2={groundY + 14}
            stroke={aligned ? '#fbbf24' : '#f87171'}
            strokeWidth={4}
            strokeLinecap="round"
          />
          <text
            x={sx(Math.min(tape, xMax))}
            y={groundY + 32}
            fill={aligned ? '#fde68a' : '#fca5a5'}
            fontSize={12}
            fontWeight="bold"
            textAnchor="middle"
          >
            📏 {fmtM(tape)}
          </text>
        </>
      )}

      {/* 기록된 줄자 */}
      {phase !== 'measure' && (
        <>
          <line
            x1={sx(0)}
            y1={groundY + 14}
            x2={tipX}
            y2={groundY + 14}
            stroke="#fbbf24"
            strokeWidth={4}
            strokeLinecap="round"
          />
          <text
            x={(sx(0) + tipX) / 2}
            y={groundY + 32}
            fill="#fde68a"
            fontSize={12}
            fontWeight="bold"
            textAnchor="middle"
          >
            그림자 {fmtM(mission.targetShadow)}
          </text>
        </>
      )}

      {/* 그림자 끝 표시 */}
      {aligned && phase === 'measure' && (
        <circle cx={tipX} cy={groundY} r={12} fill="rgba(251,191,36,0.3)" />
      )}

      {/* 추정 높이 마커 */}
      {(phase === 'guess' || phase === 'result') && guess !== null && guess <= yMax && (
        <>
          <line
            x1={PX}
            y1={sy(guess)}
            x2={W - PX}
            y2={sy(guess)}
            stroke="#38bdf8"
            strokeWidth={1.6}
            strokeDasharray="8 5"
            opacity={0.9}
          />
          <text
            x={W - PX}
            y={sy(guess) - 5}
            fill="#7dd3fc"
            fontSize={11}
            fontWeight="bold"
            textAnchor="end"
          >
            내 추정 {fmtM(guess)}
          </text>
        </>
      )}
    </svg>
  );
}

/** 그림자 끝 → 꼭대기 연장선 위에 해를 그림 */
function SunOnRay({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  // (x1,y1)=그림자 끝, (x2,y2)=꼭대기 — 꼭대기 너머로 연장
  const dx = x2 - x1;
  const dy = y2 - y1;
  const t = 1.35;
  const sunX = x1 + dx * t;
  const sunY = y1 + dy * t;
  return (
    <text x={Math.max(sunX, 30)} y={Math.max(sunY, 24)} fontSize={22} textAnchor="middle">
      ☀️
    </text>
  );
}

function TargetShape({
  mission,
  sx,
  sy,
  groundY,
}: {
  mission: ShadowMission;
  sx: (x: number) => number;
  sy: (y: number) => number;
  groundY: number;
}) {
  const h = mission.height;
  switch (mission.id) {
    case 'tree':
      return (
        <g>
          <line
            x1={sx(0)}
            y1={groundY}
            x2={sx(0)}
            y2={sy(h * 0.6)}
            stroke="#92400e"
            strokeWidth={8}
          />
          <circle cx={sx(0)} cy={sy(h * 0.76)} r={(sy(0) - sy(h * 0.46)) / 2} fill="#16a34a" />
        </g>
      );
    case 'flag':
      return (
        <g>
          <line
            x1={sx(0)}
            y1={groundY}
            x2={sx(0)}
            y2={sy(h)}
            stroke="#cbd5e1"
            strokeWidth={4}
          />
          <text x={sx(0) + 14} y={sy(h) + 8} fontSize={18}>
            🇰🇷
          </text>
        </g>
      );
    case 'obelisk':
      return (
        <polygon
          points={`${sx(0) - 9},${groundY} ${sx(0) + 9},${groundY} ${sx(0) + 4},${sy(h * 0.92)} ${sx(0)},${sy(h)} ${sx(0) - 4},${sy(h * 0.92)}`}
          fill="#d6bb8a"
          stroke="#a16207"
          strokeWidth={1.5}
        />
      );
    case 'pyramid': {
      const half = h * 0.79; // 쿠푸: 밑변 230m ÷ 2 ≈ 높이 × 0.79
      return (
        <g>
          <polygon
            points={`${sx(-half)},${groundY} ${sx(half)},${groundY} ${sx(0)},${sy(h)}`}
            fill="#d6bb8a"
            stroke="#a16207"
            strokeWidth={2}
          />
          <line
            x1={sx(0)}
            y1={groundY}
            x2={sx(0)}
            y2={sy(h)}
            stroke="rgba(120,53,15,0.5)"
            strokeWidth={1.4}
            strokeDasharray="5 4"
          />
        </g>
      );
    }
    default:
      return null;
  }
}
