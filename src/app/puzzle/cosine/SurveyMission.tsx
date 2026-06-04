'use client';

import { useMemo, useState } from 'react';
import {
  MISSIONS,
  type Mission,
  viewAngle,
  triangulate,
  trueDistance,
  starsForGuess,
  errorPct,
  fmtDist,
} from '@/lib/puzzles/cosine';
import styles from './SurveyMission.module.css';

const DEG = Math.PI / 180;

type Phase = 'aimA' | 'aimB' | 'guess' | 'result';

const TARGET_EMOJI: Record<string, string> = {
  flag: '🚩',
  river: '🌳',
  peak: '⛰️',
  moon: '🌕',
};

/** 미션별 각도 표기 자릿수 */
function fmtAngle(mission: Mission, deg: number): string {
  return deg.toFixed(mission.aim.step < 0.1 ? 2 : 1);
}

export function SurveyMission() {
  const [missionIdx, setMissionIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('aimA');
  const [aim, setAim] = useState(45);
  const [recA, setRecA] = useState<number | null>(null);
  const [recB, setRecB] = useState<number | null>(null);
  const [guess, setGuess] = useState<number | null>(null);
  const [starsEarned, setStarsEarned] = useState<number[]>([]);

  const done = missionIdx >= MISSIONS.length;
  const mission = done ? MISSIONS[MISSIONS.length - 1] : MISSIONS[missionIdx];

  const trueA = viewAngle(mission, 'A');
  const trueB = viewAngle(mission, 'B');
  const truth = trueDistance(mission);

  const aligned =
    phase === 'aimA'
      ? Math.abs(aim - trueA) <= mission.aim.tol
      : phase === 'aimB'
        ? Math.abs(aim - trueB) <= mission.aim.tol
        : false;

  const startMission = (idx: number) => {
    setMissionIdx(idx);
    setPhase('aimA');
    setAim(MISSIONS[Math.min(idx, MISSIONS.length - 1)]?.aim.min ?? 0);
    setRecA(null);
    setRecB(null);
    setGuess(null);
  };

  const recordAngle = () => {
    if (!aligned) return;
    if (phase === 'aimA') {
      setRecA(aim);
      setPhase('aimB');
      setAim(mission.aim.min);
    } else if (phase === 'aimB') {
      setRecB(aim);
      setPhase('guess');
      setGuess(Math.round((mission.guessMin + mission.guessMax) / 2 / mission.guessStep) * mission.guessStep);
    }
  };

  const submitGuess = () => {
    if (guess === null) return;
    setStarsEarned((prev) => [...prev, starsForGuess(mission, guess)]);
    setPhase('result');
  };

  const nextMission = () => {
    startMission(missionIdx + 1);
  };

  // ─── 전체 미션 완료 요약 ─────────────────────────
  if (done) {
    const total = starsEarned.reduce((s, v) => s + v, 0);
    const max = MISSIONS.length * 3;
    return (
      <div className={styles.wrap}>
        <div className={styles.summaryCard}>
          <h3 className={styles.summaryTitle}>🏅 모든 관측 미션 완료!</h3>
          <div className={styles.summaryStars}>
            {'⭐'.repeat(total)}
            <span className={styles.summaryCount}>
              {total} / {max}
            </span>
          </div>
          <ul className={styles.summaryList}>
            {MISSIONS.map((m, i) => (
              <li key={m.id}>
                {m.emoji} {m.name} — {'⭐'.repeat(starsEarned[i] ?? 0) || '—'}
              </li>
            ))}
          </ul>
          <p className={styles.summaryNote}>
            줄자 없이 각도 두 개로 달까지의 거리를 쟀어요 — 옛 천문학자들과 똑같은
            방법으로!
          </p>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => {
              setStarsEarned([]);
              startMission(0);
            }}
          >
            🔭 처음부터 다시 도전
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
          미션 {missionIdx + 1} / {MISSIONS.length}
        </span>
        <h3 className={styles.missionTitle}>
          {mission.emoji} {mission.name}
        </h3>
        <p className={styles.missionScene}>{mission.scene}</p>
        {mission.id === 'moon' && (
          <p className={styles.scaleNote}>☝️ 그림은 실제 축척이 아니에요</p>
        )}
      </div>

      {/* 장면 */}
      <div className={styles.sceneBox}>
        <SceneSvg
          mission={mission}
          phase={phase}
          aim={aim}
          recA={recA}
          recB={recB}
          aligned={aligned}
          guess={guess}
        />
      </div>

      {/* 단계별 컨트롤 */}
      {(phase === 'aimA' || phase === 'aimB') && (
        <div className={styles.panel}>
          <div className={styles.stepLabel}>
            {phase === 'aimA' ? '① 왼쪽 관측점에서 조준' : '② 오른쪽 관측점에서 조준'}
          </div>
          <p className={styles.stepDesc}>
            망원경을 돌려 {TARGET_EMOJI[mission.id]} 목표에 시선이 닿게
            맞추세요. 기선(빨간 줄)에서 잰 각도가 기록돼요.
          </p>
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabel}>
              <span>🔭 망원경 각도</span>
              <span className={styles.sliderValue}>{fmtAngle(mission, aim)}°</span>
            </div>
            <input
              type="range"
              min={mission.aim.min}
              max={mission.aim.max}
              step={mission.aim.step}
              value={aim}
              onChange={(e) => setAim(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
          {aligned ? (
            <div className={styles.alignedBanner}>🎯 조준 성공! 각도를 기록하세요.</div>
          ) : (
            <p className={styles.hint}>
              {aim < (phase === 'aimA' ? trueA : trueB) ? '조금 더 위로…' : '조금 더 아래로…'}
            </p>
          )}
          <button
            type="button"
            className={styles.primaryBtn}
            disabled={!aligned}
            onClick={recordAngle}
          >
            📐 이 각도로 기록
          </button>
        </div>
      )}

      {phase === 'guess' && recA !== null && recB !== null && (
        <div className={styles.panel}>
          <div className={styles.stepLabel}>③ 거리 추정</div>
          <p className={styles.stepDesc}>
            두 시선이 만나는 곳이 목표! 기선 {fmtDist(mission.baseline, mission.unit)} 과
            두 각도 <span className={styles.mono}>{fmtAngle(mission, recA)}°</span> ·{' '}
            <span className={styles.mono}>{fmtAngle(mission, recB)}°</span> 로 삼각형이
            완성됐어요. 눈금선을 읽고 목표까지의 거리를 추정해 보세요.
          </p>
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabel}>
              <span>📏 내 추정 거리</span>
              <span className={styles.sliderValue}>
                {guess !== null ? fmtDist(guess, mission.unit) : '—'}
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

      {phase === 'result' && recA !== null && recB !== null && guess !== null && (
        <ResultPanel
          mission={mission}
          recA={recA}
          recB={recB}
          guess={guess}
          truth={truth}
          isLast={missionIdx === MISSIONS.length - 1}
          onNext={nextMission}
        />
      )}
    </div>
  );
}

// ─── 결과 패널 ───────────────────────────────────
function ResultPanel({
  mission,
  recA,
  recB,
  guess,
  truth,
  isLast,
  onNext,
}: {
  mission: Mission;
  recA: number;
  recB: number;
  guess: number;
  truth: number;
  isLast: boolean;
  onNext: () => void;
}) {
  const stars = starsForGuess(mission, guess);
  const err = errorPct(mission, guess);
  const tri = triangulate(mission.baseline, recA, recB);

  return (
    <div className={styles.panel}>
      <div className={styles.resultStars}>
        {stars > 0 ? '⭐'.repeat(stars) : '💧'}
      </div>
      <table className={styles.resultTable}>
        <tbody>
          <tr>
            <th>내 추정</th>
            <td>{fmtDist(guess, mission.unit)}</td>
          </tr>
          <tr>
            <th>실제 거리</th>
            <td>{fmtDist(truth, mission.unit)}</td>
          </tr>
          <tr>
            <th>오차</th>
            <td>{err.toFixed(1)}%</td>
          </tr>
        </tbody>
      </table>

      {tri && (
        <div className={styles.mathCard}>
          <div className={styles.mathCardTitle}>🧮 수학의 눈으로 보면</div>
          <p>
            세 각의 합은 180° — 목표 꼭짓점의 각은{' '}
            <span className={styles.mono}>
              180° − {fmtAngle(mission, recA)}° − {fmtAngle(mission, recB)}° ={' '}
              {tri.apexDeg.toFixed(mission.aim.step < 0.1 ? 2 : 1)}°
            </span>
            . 기선과 두 각만으로 삼각형의 모든 변이 정해지고, 시선 방향을{' '}
            <strong>cos·sin 비율로 분해</strong>하면 목표까지의 거리가{' '}
            <span className={styles.mono}>{fmtDist(tri.height, mission.unit)}</span> 로
            계산돼요. {mission.id === 'moon' && '실제 달까지 평균 거리는 약 384,400km!'}
          </p>
        </div>
      )}

      <button type="button" className={styles.primaryBtn} onClick={onNext}>
        {isLast ? '🏅 최종 결과 보기' : '다음 미션 ▶'}
      </button>
    </div>
  );
}

// ─── 장면 SVG ────────────────────────────────────
function SceneSvg({
  mission,
  phase,
  aim,
  recA,
  recB,
  aligned,
  guess,
}: {
  mission: Mission;
  phase: Phase;
  aim: number;
  recA: number | null;
  recB: number | null;
  aligned: boolean;
  guess: number | null;
}) {
  const W = 580;
  const H = 352;
  const PT = 26;
  const PB = 56;
  const PX = 46;

  const yMax = mission.target.y * 1.15;
  const xMin = -mission.baseline * 0.08;
  const xMax = mission.baseline * 1.08;
  const kx = (W - 2 * PX) / (xMax - xMin);
  const ky = (H - PT - PB) / yMax;
  const sx = (x: number) => PX + (x - xMin) * kx;
  const sy = (y: number) => H - PB - y * ky;

  /** 관측점에서 각 θ 로 뻗는 시선 끝점 (장면 좌표) */
  const rayEnd = (from: 'A' | 'B', deg: number) => {
    const t = yMax / Math.max(Math.sin(deg * DEG), 0.02);
    const dx = t * Math.cos(deg * DEG);
    return from === 'A'
      ? { x: dx, y: t * Math.sin(deg * DEG) }
      : { x: mission.baseline - dx, y: t * Math.sin(deg * DEG) };
  };

  // 눈금선 (추정·결과 단계)
  const gridLines = useMemo(() => {
    if (phase !== 'guess' && phase !== 'result') return [];
    const lines: number[] = [];
    for (let y = mission.gridEvery; y <= yMax; y += mission.gridEvery) {
      lines.push(y);
    }
    return lines;
  }, [phase, mission, yMax]);

  const tgt = { x: sx(mission.target.x), y: sy(mission.target.y) };
  const Ax = sx(0);
  const Bx = sx(mission.baseline);
  const groundY = sy(0);

  const liveRay =
    phase === 'aimA' || phase === 'aimB'
      ? rayEnd(phase === 'aimA' ? 'A' : 'B', aim)
      : null;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${W} ${H}`}
      className={styles.scene}
      role="img"
      aria-label={`${mission.name} 관측 장면`}
    >
      {/* 눈금선 */}
      {gridLines.map((y) => (
        <g key={y}>
          <line
            x1={PX - 6}
            y1={sy(y)}
            x2={W - PX + 6}
            y2={sy(y)}
            stroke="rgba(148,163,184,0.25)"
            strokeDasharray="4 6"
          />
          <text
            x={PX - 10}
            y={sy(y) + 3}
            fill="rgba(148,163,184,0.8)"
            fontSize={10}
            textAnchor="end"
          >
            {fmtDist(y, mission.unit)}
          </text>
        </g>
      ))}

      {/* 추정 거리 마커 */}
      {(phase === 'guess' || phase === 'result') && guess !== null && guess <= yMax && (
        <line
          x1={PX}
          y1={sy(guess)}
          x2={W - PX}
          y2={sy(guess)}
          stroke="#fbbf24"
          strokeWidth={1.6}
          strokeDasharray="8 5"
          opacity={0.9}
        />
      )}

      {/* 지면 */}
      <line
        x1={PX - 10}
        y1={groundY}
        x2={W - PX + 10}
        y2={groundY}
        stroke="rgba(248,250,252,0.5)"
        strokeWidth={2}
      />

      {/* 기선 (빨간 줄) */}
      <line
        x1={Ax}
        y1={groundY}
        x2={Bx}
        y2={groundY}
        stroke="#f87171"
        strokeWidth={3.4}
        strokeLinecap="round"
      />
      <text
        x={(Ax + Bx) / 2}
        y={groundY + 18}
        fill="#fca5a5"
        fontSize={12}
        fontWeight="bold"
        textAnchor="middle"
      >
        기선 {fmtDist(mission.baseline, mission.unit)}
      </text>

      {/* 기록된 시선 A */}
      {recA !== null && (
        <line
          x1={Ax}
          y1={groundY}
          x2={sx(rayEnd('A', recA).x)}
          y2={sy(rayEnd('A', recA).y)}
          stroke="#34d399"
          strokeWidth={2}
          opacity={0.85}
        />
      )}
      {/* 기록된 시선 B */}
      {recB !== null && (
        <line
          x1={Bx}
          y1={groundY}
          x2={sx(rayEnd('B', recB).x)}
          y2={sy(rayEnd('B', recB).y)}
          stroke="#38bdf8"
          strokeWidth={2}
          opacity={0.85}
        />
      )}

      {/* 조준 중인 시선 */}
      {liveRay && (
        <line
          x1={phase === 'aimA' ? Ax : Bx}
          y1={groundY}
          x2={sx(liveRay.x)}
          y2={sy(liveRay.y)}
          stroke={aligned ? '#fbbf24' : 'rgba(248,250,252,0.55)'}
          strokeWidth={aligned ? 3 : 2}
          strokeDasharray={aligned ? undefined : '6 5'}
        />
      )}

      {/* 기록 각 라벨 */}
      {recA !== null && (
        <text x={Ax + 12} y={groundY - 10} fill="#34d399" fontSize={11} fontWeight="bold">
          {fmtAngle(mission, recA)}°
        </text>
      )}
      {recB !== null && (
        <text
          x={Bx - 12}
          y={groundY - 10}
          fill="#38bdf8"
          fontSize={11}
          fontWeight="bold"
          textAnchor="end"
        >
          {fmtAngle(mission, recB)}°
        </text>
      )}

      {/* 관측점 */}
      <text x={Ax} y={groundY + 34} fontSize={20} textAnchor="middle">
        🔭
      </text>
      <text
        x={Ax}
        y={groundY + 50}
        fill="rgba(248,250,252,0.75)"
        fontSize={10}
        textAnchor="middle"
      >
        관측점 A
      </text>
      <text x={Bx} y={groundY + 34} fontSize={20} textAnchor="middle">
        🔭
      </text>
      <text
        x={Bx}
        y={groundY + 50}
        fill="rgba(248,250,252,0.75)"
        fontSize={10}
        textAnchor="middle"
      >
        관측점 B
      </text>

      {/* 목표 */}
      {aligned && (
        <circle cx={tgt.x} cy={tgt.y} r={18} fill="rgba(251,191,36,0.25)" />
      )}
      <text x={tgt.x} y={tgt.y + 7} fontSize={22} textAnchor="middle">
        {TARGET_EMOJI[mission.id]}
      </text>
    </svg>
  );
}
