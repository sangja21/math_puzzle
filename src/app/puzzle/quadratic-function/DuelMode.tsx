'use client';

import {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import confetti from 'canvas-confetti';
import {
  G,
  ANGLE_MIN,
  ANGLE_MAX,
  ANGLE_STEP,
  ANGLE_DEFAULT,
  SPEED_MIN,
  SPEED_MAX,
  SPEED_STEP,
  SPEED_DEFAULT,
  ENEMY_X,
  USER_BBOX,
  ENEMY_BBOX,
  MAX_HP,
  HIT_DAMAGE,
  ENEMY_PRECISION_AT,
  trajectoryAt,
  trajectorySamples,
  enemyTrajectoryAt,
  enemyTrajectorySamples,
  computeEnemyShot,
  pointInRect,
  type Vec2,
  type EnemyShot,
} from '@/lib/puzzles/cannonGame';
import styles from './CannonTab.module.css';

type DuelPhase =
  | { kind: 'aiming' }
  | { kind: 'user-flying' }
  | { kind: 'user-hit' } // 사용자 포탄 명중 (적 HP 깎임)
  | { kind: 'user-miss' } // 사용자 미스
  | { kind: 'enemy-pause'; shot: EnemyShot }
  | { kind: 'enemy-flying'; shot: EnemyShot }
  | { kind: 'enemy-hit' } // 적 포탄 명중 (사용자 HP 깎임)
  | { kind: 'enemy-miss' }
  | { kind: 'final'; outcome: 'win' | 'lose' };

const VIEW_X = -2;
const VIEW_W = 38;
const VIEW_Y_MIN = -2;
const VIEW_Y_MAX = 22;
const VIEW_H = VIEW_Y_MAX - VIEW_Y_MIN;
const VIEW_BOX = `${VIEW_X} ${VIEW_Y_MIN} ${VIEW_W} ${VIEW_H}`;

function sy(y: number): number {
  return VIEW_Y_MAX + VIEW_Y_MIN - y;
}

export function DuelMode({ onBack }: { onBack: () => void }) {
  const [angle, setAngle] = useState<number>(ANGLE_DEFAULT);
  const [speed, setSpeed] = useState<number>(SPEED_DEFAULT);
  const [userHP, setUserHP] = useState<number>(MAX_HP);
  const [enemyHP, setEnemyHP] = useState<number>(MAX_HP);
  const [enemyShotIndex, setEnemyShotIndex] = useState<number>(0);
  const [userShotCount, setUserShotCount] = useState<number>(0);
  const [phase, setPhase] = useState<DuelPhase>({ kind: 'aiming' });

  // 사용자 / 적 발사 진행 시간
  const [userT, setUserT] = useState<number>(0);
  const [enemyT, setEnemyT] = useState<number>(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  // 미리보기 궤적 (aiming 상태에서만)
  const previewPath = useMemo(
    () =>
      trajectorySamples(angle, speed, {
        dt: 0.05,
        maxT: 6,
        minY: VIEW_Y_MIN,
      }),
    [angle, speed],
  );

  // 사용자 발사 트레일
  const userPath = useMemo(() => {
    if (phase.kind !== 'user-flying') return [];
    return trajectorySamples(angle, speed, {
      dt: 0.04,
      maxT: userT,
      minY: VIEW_Y_MIN,
    });
  }, [phase.kind, angle, speed, userT]);

  const userBall: Vec2 | null = useMemo(() => {
    if (phase.kind !== 'user-flying') return null;
    return trajectoryAt(angle, speed, userT);
  }, [phase.kind, angle, speed, userT]);

  // 적 발사 트레일
  const enemyPath = useMemo(() => {
    if (phase.kind !== 'enemy-flying') return [];
    return enemyTrajectorySamples(phase.shot.angleDeg, phase.shot.speed, {
      dt: 0.04,
      maxT: enemyT,
      minY: VIEW_Y_MIN,
    });
  }, [phase, enemyT]);

  const enemyBall: Vec2 | null = useMemo(() => {
    if (phase.kind !== 'enemy-flying') return null;
    return enemyTrajectoryAt(phase.shot.angleDeg, phase.shot.speed, enemyT);
  }, [phase, enemyT]);

  const cleanupRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // 사용자 발사 애니메이션
  useEffect(() => {
    if (phase.kind !== 'user-flying') return;

    startRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - startRef.current) / 1000;
      setUserT(elapsed);

      const p = trajectoryAt(angle, speed, elapsed);

      // 적 명중 — 데미지 적용
      if (pointInRect(p, ENEMY_BBOX)) {
        setEnemyHP((hp) => Math.max(0, hp - HIT_DAMAGE));
        setPhase({ kind: 'user-hit' });
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.5 },
        });
        return;
      }

      // 지면 또는 시간 초과 — 미스
      if (p.y < 0 || elapsed > 6) {
        setPhase({ kind: 'user-miss' });
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return cleanupRaf;
  }, [phase.kind, angle, speed, cleanupRaf]);

  // 사용자 명중 후 1.0s — 적 KO 면 final, 아니면 적 차례
  useEffect(() => {
    if (phase.kind !== 'user-hit') return;
    const id = setTimeout(() => {
      if (enemyHP <= 0) {
        // 큰 confetti 한 번 더
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.5 },
        });
        setPhase({ kind: 'final', outcome: 'win' });
      } else {
        const shot = computeEnemyShot(enemyShotIndex);
        setEnemyShotIndex((i) => i + 1);
        setEnemyT(0);
        setPhase({ kind: 'enemy-pause', shot });
      }
    }, 1000);
    return () => clearTimeout(id);
  }, [phase.kind, enemyHP, enemyShotIndex]);

  // 사용자 미스 후 0.6s — 적 차례
  useEffect(() => {
    if (phase.kind !== 'user-miss') return;
    const id = setTimeout(() => {
      const shot = computeEnemyShot(enemyShotIndex);
      setEnemyShotIndex((i) => i + 1);
      setEnemyT(0);
      setPhase({ kind: 'enemy-pause', shot });
    }, 600);
    return () => clearTimeout(id);
  }, [phase.kind, enemyShotIndex]);

  // 적 일시정지 (조준) — 0.6s
  useEffect(() => {
    if (phase.kind !== 'enemy-pause') return;
    const id = setTimeout(() => {
      setEnemyT(0);
      setPhase({ kind: 'enemy-flying', shot: phase.shot });
    }, 600);
    return () => clearTimeout(id);
  }, [phase]);

  // 적 발사 애니메이션
  useEffect(() => {
    if (phase.kind !== 'enemy-flying') return;

    startRef.current = performance.now();
    const shot = phase.shot;

    const tick = (now: number) => {
      const elapsed = (now - startRef.current) / 1000;
      setEnemyT(elapsed);

      const p = enemyTrajectoryAt(shot.angleDeg, shot.speed, elapsed);

      // 사용자 명중 — 데미지 적용
      if (pointInRect(p, USER_BBOX)) {
        setUserHP((hp) => Math.max(0, hp - HIT_DAMAGE));
        setPhase({ kind: 'enemy-hit' });
        return;
      }

      // 지면 또는 시간 초과 — 미스
      if (p.y < 0 || elapsed > 6) {
        setPhase({ kind: 'enemy-miss' });
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return cleanupRaf;
  }, [phase, cleanupRaf]);

  // 적 명중 후 1.0s — 사용자 KO 면 final, 아니면 사용자 차례
  useEffect(() => {
    if (phase.kind !== 'enemy-hit') return;
    const id = setTimeout(() => {
      if (userHP <= 0) {
        setPhase({ kind: 'final', outcome: 'lose' });
      } else {
        setUserT(0);
        setPhase({ kind: 'aiming' });
      }
    }, 1000);
    return () => clearTimeout(id);
  }, [phase.kind, userHP]);

  // 적 미스 후 0.6s — 사용자 차례
  useEffect(() => {
    if (phase.kind !== 'enemy-miss') return;
    const id = setTimeout(() => {
      setUserT(0);
      setPhase({ kind: 'aiming' });
    }, 600);
    return () => clearTimeout(id);
  }, [phase.kind]);

  const onFire = () => {
    if (phase.kind !== 'aiming') return;
    setUserT(0);
    setUserShotCount((n) => n + 1);
    setPhase({ kind: 'user-flying' });
  };

  const onRestart = () => {
    cleanupRaf();
    setUserHP(MAX_HP);
    setEnemyHP(MAX_HP);
    setEnemyShotIndex(0);
    setUserShotCount(0);
    setUserT(0);
    setEnemyT(0);
    setAngle(ANGLE_DEFAULT);
    setSpeed(SPEED_DEFAULT);
    setPhase({ kind: 'aiming' });
  };

  if (phase.kind === 'final') {
    return (
      <div className={styles.cannonTab}>
        <div
          className={`${styles.duelFinal} ${
            phase.outcome === 'win' ? styles.duelFinalWin : styles.duelFinalLose
          }`}
        >
          <span className={styles.duelFinalEmoji}>
            {phase.outcome === 'win' ? '🏆' : '💥'}
          </span>
          <h2>{phase.outcome === 'win' ? '승리!' : '패배...'}</h2>
          <p>
            {phase.outcome === 'win'
              ? `사용자 발사 ${userShotCount}회 만에 적의 체력을 0으로 만들었어요. 빠르고 정확한 조준이었습니다.`
              : `적의 체력을 다 깎기 전에 당신의 체력이 먼저 0이 됐어요. 다시 도전!`}
          </p>
          <div className={styles.duelStatsRow}>
            <span>적 발사 횟수: {enemyShotIndex}</span>
            <span>·</span>
            <span>사용자 발사 횟수: {userShotCount}</span>
          </div>
          <div className={styles.duelFinalActions}>
            <button className={styles.restartBtn} onClick={onRestart}>
              🔄 다시 도전
            </button>
            <button className={styles.backBtn} onClick={onBack}>
              ← 모드 선택
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sceneClass = `${styles.scene} ${
    phase.kind === 'enemy-hit' ? styles.shake : ''
  } ${phase.kind === 'user-hit' ? styles.flash : ''}`;

  // 상태 메시지
  let statusNode: React.ReactNode = null;
  if (phase.kind === 'aiming') {
    statusNode = (
      <button className={styles.fireBtn} onClick={onFire}>
        🎯 발사!
      </button>
    );
  } else if (phase.kind === 'user-flying') {
    statusNode = (
      <div className={styles.statusFlying}>🚀 사용자 포탄 비행 중...</div>
    );
  } else if (phase.kind === 'user-hit') {
    statusNode = (
      <div className={styles.statusHit}>
        🎯 명중! 적 체력 −{HIT_DAMAGE}
      </div>
    );
  } else if (phase.kind === 'user-miss') {
    statusNode = <div className={styles.statusMiss}>빗나감 — 적 차례</div>;
  } else if (phase.kind === 'enemy-pause') {
    statusNode = <div className={styles.statusEnemy}>⚔️ 적이 조준 중...</div>;
  } else if (phase.kind === 'enemy-flying') {
    statusNode = <div className={styles.statusEnemyFire}>💨 적 포탄 발사!</div>;
  } else if (phase.kind === 'enemy-hit') {
    statusNode = (
      <div className={styles.statusMiss}>
        💥 적의 포탄에 맞았어요! 체력 −{HIT_DAMAGE}
      </div>
    );
  } else if (phase.kind === 'enemy-miss') {
    statusNode = (
      <div className={styles.statusRound}>적 미스 — 사용자 차례</div>
    );
  }

  // 적 정확도 (다음 발사 기준)
  const nextEnemyAccuracy = Math.min(
    100,
    Math.round((enemyShotIndex / ENEMY_PRECISION_AT) * 100),
  );

  // 적의 현재 발사 정보
  const enemyShot =
    phase.kind === 'enemy-pause' || phase.kind === 'enemy-flying'
      ? phase.shot
      : null;

  return (
    <div className={styles.cannonTab}>
      {/* HUD: 체력바 + 발사 횟수 */}
      <div className={styles.hud}>
        <div className={styles.hudLeft}>
          <button className={styles.backBtn} onClick={onBack}>
            ← 모드 선택
          </button>
        </div>
        <div className={styles.hudRight}>
          적 정확도 다음턴 <strong>{nextEnemyAccuracy}%</strong>
        </div>
      </div>

      <div className={styles.hpRow}>
        <HpBar
          label="🤺 사용자"
          hp={userHP}
          max={MAX_HP}
          color="#60a5fa"
          glowColor="rgba(96, 165, 250, 0.5)"
        />
        <HpBar
          label="⚔️ 적"
          hp={enemyHP}
          max={MAX_HP}
          color="#f87171"
          glowColor="rgba(248, 113, 113, 0.5)"
          rightAligned
        />
      </div>

      {/* SVG 씬 */}
      <div className={sceneClass}>
        <svg
          viewBox={VIEW_BOX}
          className={styles.sceneSvg}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="duelSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#312e81" />
            </linearGradient>
          </defs>

          <rect
            x={VIEW_X}
            y={VIEW_Y_MIN}
            width={VIEW_W}
            height={VIEW_H}
            fill="url(#duelSky)"
          />

          {/* 지면 */}
          <rect
            x={VIEW_X}
            y={sy(0)}
            width={VIEW_W}
            height={Math.abs(VIEW_Y_MIN)}
            fill="#3f2e1c"
          />
          <line
            x1={VIEW_X}
            x2={VIEW_X + VIEW_W}
            y1={sy(0)}
            y2={sy(0)}
            stroke="#92400e"
            strokeWidth={0.05}
          />

          {/* 격자 */}
          {[5, 10, 15, 20, 25, 30].map((gx) => (
            <line
              key={`gx-${gx}`}
              x1={gx}
              x2={gx}
              y1={sy(0)}
              y2={sy(VIEW_Y_MAX - 1)}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={0.03}
            />
          ))}
          {[10, 20, 30].map((gx) => (
            <text
              key={`gxl-${gx}`}
              x={gx}
              y={sy(-0.6)}
              fontSize={0.5}
              fill="rgba(255,255,255,0.5)"
              textAnchor="middle"
            >
              {gx}m
            </text>
          ))}

          {/* 미리보기 궤적 */}
          {phase.kind === 'aiming' && (
            <PreviewPath path={previewPath} />
          )}

          {/* 사용자 트레일 */}
          {userPath.length > 0 && (
            <polyline
              points={userPath.map((p) => `${p.x},${sy(p.y)}`).join(' ')}
              fill="none"
              stroke="#fbbf24"
              strokeWidth={0.12}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* 적 트레일 */}
          {enemyPath.length > 0 && (
            <polyline
              points={enemyPath.map((p) => `${p.x},${sy(p.y)}`).join(' ')}
              fill="none"
              stroke="#f87171"
              strokeWidth={0.12}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* 사용자 포탄 */}
          {userBall && userBall.y >= VIEW_Y_MIN && (
            <circle
              cx={userBall.x}
              cy={sy(userBall.y)}
              r={0.35}
              fill="#fbbf24"
              stroke="#fde68a"
              strokeWidth={0.06}
            />
          )}

          {/* 적 포탄 */}
          {enemyBall && enemyBall.y >= VIEW_Y_MIN && (
            <circle
              cx={enemyBall.x}
              cy={sy(enemyBall.y)}
              r={0.35}
              fill="#f87171"
              stroke="#fca5a5"
              strokeWidth={0.06}
            />
          )}

          {/* 사용자 대포 */}
          <UserCannon angleDeg={angle} hpRatio={userHP / MAX_HP} />

          {/* 적 대포 */}
          <EnemyCannon
            angleDeg={enemyShot ? enemyShot.angleDeg : 45}
            x={ENEMY_X}
            hpRatio={enemyHP / MAX_HP}
          />
        </svg>
      </div>

      {/* 컨트롤 */}
      <div className={styles.controls}>
        <SliderRow
          label="발사각 θ"
          unit="°"
          value={angle}
          setValue={setAngle}
          min={ANGLE_MIN}
          max={ANGLE_MAX}
          step={ANGLE_STEP}
          disabled={phase.kind !== 'aiming'}
        />
        <SliderRow
          label="초속 v"
          unit=" m/s"
          value={speed}
          setValue={setSpeed}
          min={SPEED_MIN}
          max={SPEED_MAX}
          step={SPEED_STEP}
          disabled={phase.kind !== 'aiming'}
        />

        <div className={styles.equation}>
          y = x · tan({angle}°) − {G} · x² / (2 · {speed}² · cos²({angle}°))
        </div>

        <div className={styles.hint}>
          💡 적의 거리는 <strong>{ENEMY_X}m</strong>. 한 번 명중할 때마다 체력 −
          {HIT_DAMAGE}. 적은 발사할수록 정확해져요!
          {enemyShot && (
            <>
              {' '}
              · 적 조준: θ={enemyShot.angleDeg.toFixed(1)}°, v=
              {enemyShot.speed.toFixed(1)}m/s
            </>
          )}
        </div>

        <div className={styles.actionRow}>{statusNode}</div>
      </div>
    </div>
  );
}

// ─── 체력바 ────────────────────────────────────

function HpBar({
  label,
  hp,
  max,
  color,
  glowColor,
  rightAligned,
}: {
  label: string;
  hp: number;
  max: number;
  color: string;
  glowColor: string;
  rightAligned?: boolean;
}) {
  const ratio = Math.max(0, hp) / max;
  const pct = Math.round(ratio * 100);
  const lowHp = ratio <= 0.25;
  return (
    <div
      className={`${styles.hpBox} ${rightAligned ? styles.hpBoxRight : ''}`}
    >
      <div className={styles.hpHeader}>
        <span className={styles.hpLabel}>{label}</span>
        <span
          className={styles.hpValue}
          style={{ color: lowHp ? '#f87171' : color }}
        >
          {Math.max(0, hp)} / {max}
        </span>
      </div>
      <div className={styles.hpTrack}>
        <div
          className={styles.hpFill}
          style={{
            width: `${pct}%`,
            background: color,
            boxShadow: `0 0 12px ${glowColor}`,
          }}
        />
      </div>
    </div>
  );
}

// ─── SVG 컴포넌트 ───────────────────────────────

function UserCannon({ angleDeg, hpRatio }: { angleDeg: number; hpRatio: number }) {
  const opacity = 0.4 + 0.6 * hpRatio; // 체력 낮을수록 투명
  return (
    <g opacity={opacity}>
      <rect x={-0.6} y={sy(0.6)} width={1.2} height={0.6} fill="#475569" />
      <circle cx={-0.4} cy={sy(0)} r={0.25} fill="#1e293b" />
      <circle cx={0.4} cy={sy(0)} r={0.25} fill="#1e293b" />
      <g transform={`translate(0, ${sy(0.5)}) rotate(${-angleDeg})`}>
        <rect
          x={0}
          y={-0.25}
          width={1.4}
          height={0.5}
          fill="#64748b"
          stroke="#334155"
          strokeWidth={0.05}
        />
        <circle cx={1.4} cy={0} r={0.18} fill="#1e293b" />
      </g>
    </g>
  );
}

function EnemyCannon({
  angleDeg,
  x,
  hpRatio,
}: {
  angleDeg: number;
  x: number;
  hpRatio: number;
}) {
  const opacity = 0.4 + 0.6 * hpRatio;
  return (
    <g transform={`translate(${x}, 0)`} opacity={opacity}>
      <rect x={-0.6} y={sy(0.6)} width={1.2} height={0.6} fill="#7f1d1d" />
      <circle cx={-0.4} cy={sy(0)} r={0.25} fill="#1e293b" />
      <circle cx={0.4} cy={sy(0)} r={0.25} fill="#1e293b" />
      <g transform={`translate(0, ${sy(0.5)}) rotate(${180 + angleDeg})`}>
        <rect
          x={0}
          y={-0.25}
          width={1.4}
          height={0.5}
          fill="#dc2626"
          stroke="#7f1d1d"
          strokeWidth={0.05}
        />
        <circle cx={1.4} cy={0} r={0.18} fill="#1e293b" />
      </g>
    </g>
  );
}

function PreviewPath({ path }: { path: Vec2[] }) {
  if (path.length < 2) return null;
  const points = path.map((p) => `${p.x},${sy(p.y)}`).join(' ');
  return (
    <polyline
      points={points}
      fill="none"
      stroke="rgba(251, 191, 36, 0.5)"
      strokeWidth={0.08}
      strokeDasharray="0.3 0.25"
      strokeLinecap="round"
    />
  );
}

// ─── 슬라이더 ───────────────────────────────────

function SliderRow({
  label,
  unit,
  value,
  setValue,
  min,
  max,
  step,
  disabled,
}: {
  label: string;
  unit: string;
  value: number;
  setValue: (v: number) => void;
  min: number;
  max: number;
  step: number;
  disabled?: boolean;
}) {
  return (
    <div className={`${styles.sliderGroup} ${disabled ? styles.disabled : ''}`}>
      <div className={styles.sliderHead}>
        <span className={styles.sliderLabel}>{label}</span>
        <span className={styles.sliderVal}>
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        className={styles.slider}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => setValue(Number(e.target.value))}
      />
    </div>
  );
}
