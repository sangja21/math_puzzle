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
  LEVELS,
  ANGLE_MIN,
  ANGLE_MAX,
  ANGLE_STEP,
  ANGLE_DEFAULT,
  SPEED_MIN,
  SPEED_MAX,
  SPEED_STEP,
  SPEED_DEFAULT,
  trajectorySamples,
  trajectoryAt,
  trajectoryVertex,
  pointInRect,
  type Vec2,
  type Rect,
  type Level,
} from '@/lib/puzzles/cannonGame';
import styles from './CannonTab.module.css';

type Phase =
  | { kind: 'aiming' }
  | { kind: 'flying' }
  | { kind: 'hit'; vertex: Vec2 }
  | { kind: 'miss' }
  | { kind: 'complete' };

// SVG viewBox 좌표계: x ∈ [0, 35], y ∈ [-2, 22] (m)
// 화면에선 y를 뒤집기 위해 SVG transform 사용
const VIEW_X = 0;
const VIEW_W = 35;
const VIEW_Y_MIN = -2;
const VIEW_Y_MAX = 22;
const VIEW_H = VIEW_Y_MAX - VIEW_Y_MIN; // 24
const VIEW_BOX = `${VIEW_X} ${VIEW_Y_MIN} ${VIEW_W} ${VIEW_H}`;

// SVG y는 위→아래 증가. 우리 좌표는 위→아래 감소.
// 그래서 g(y) = (VIEW_Y_MAX - y) - (VIEW_Y_MAX - VIEW_Y_MIN) = -(y) + ... 단순히 y → svgY = -y + (VIEW_Y_MIN+VIEW_Y_MAX) — 아래 한 함수로 처리.
// 선택: 콘텐츠 전체를 transform="scale(1,-1) translate(0, -ymax-ymin)" 으로 뒤집을 수도 있지만
// 단순화를 위해 직접 변환 사용.
function sy(y: number): number {
  return VIEW_Y_MAX + VIEW_Y_MIN - y;
}

export function CannonTab() {
  const [angle, setAngle] = useState<number>(ANGLE_DEFAULT);
  const [speed, setSpeed] = useState<number>(SPEED_DEFAULT);
  const [levelIdx, setLevelIdx] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);
  const [phase, setPhase] = useState<Phase>({ kind: 'aiming' });

  // 발사 진행 시간 (초)
  const [t, setT] = useState<number>(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  const level: Level | undefined = LEVELS[levelIdx];

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

  // 비행 중 현재 위치
  const ballPos: Vec2 | null = useMemo(() => {
    if (phase.kind !== 'flying') return null;
    return trajectoryAt(angle, speed, t);
  }, [phase.kind, angle, speed, t]);

  // 비행 중 누적 트레일
  const flyingPath = useMemo(() => {
    if (phase.kind !== 'flying') return [];
    return trajectorySamples(angle, speed, {
      dt: 0.04,
      maxT: t,
      minY: VIEW_Y_MIN,
    });
  }, [phase.kind, angle, speed, t]);

  const cleanupRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // 비행 애니메이션 + 충돌 체크
  useEffect(() => {
    if (phase.kind !== 'flying' || !level) return;

    startRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - startRef.current) / 1000;
      setT(elapsed);

      const p = trajectoryAt(angle, speed, elapsed);

      // 장애물 충돌
      if (level.obstacles) {
        for (const o of level.obstacles) {
          if (pointInRect(p, o)) {
            setPhase({ kind: 'miss' });
            return;
          }
        }
      }

      // 표적 명중
      if (pointInRect(p, level.target)) {
        const v = trajectoryVertex(angle, speed);
        setPhase({ kind: 'hit', vertex: v });
        // confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.5 },
        });
        return;
      }

      // 지면 닿음 (표적 밖이면 미스)
      if (p.y < 0) {
        setPhase({ kind: 'miss' });
        return;
      }

      // 시간 초과
      if (elapsed > 6) {
        setPhase({ kind: 'miss' });
        return;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return cleanupRaf;
  }, [phase.kind, angle, speed, level, cleanupRaf]);

  // 명중 후 다음 레벨 자동 전환
  useEffect(() => {
    if (phase.kind !== 'hit') return;
    const id = setTimeout(() => {
      setT(0);
      if (levelIdx + 1 >= LEVELS.length) {
        setPhase({ kind: 'complete' });
      } else {
        setLevelIdx((i) => i + 1);
        setAttempts(0);
        setPhase({ kind: 'aiming' });
      }
    }, 1400);
    return () => clearTimeout(id);
  }, [phase.kind, levelIdx]);

  // 미스 후 자동 재시도
  useEffect(() => {
    if (phase.kind !== 'miss') return;
    const id = setTimeout(() => {
      setT(0);
      setPhase({ kind: 'aiming' });
    }, 900);
    return () => clearTimeout(id);
  }, [phase.kind]);

  const onFire = () => {
    if (phase.kind !== 'aiming') return;
    setAttempts((a) => a + 1);
    setT(0);
    setPhase({ kind: 'flying' });
  };

  const onRestart = () => {
    cleanupRaf();
    setLevelIdx(0);
    setAttempts(0);
    setT(0);
    setAngle(ANGLE_DEFAULT);
    setSpeed(SPEED_DEFAULT);
    setPhase({ kind: 'aiming' });
  };

  if (phase.kind === 'complete') {
    return (
      <div className={styles.cannonTab}>
        <div className={styles.complete}>
          <span className={styles.completeEmoji}>🏆</span>
          <h2>모든 레벨 클리어!</h2>
          <p>
            발사각과 초속의 조합이 어떻게 포물선의 모양을 바꾸는지 직접
            느꼈을 거예요. 원리 탭의 § 5 (꼭짓점) 와 § 6 (근) 을 다시 보면
            방금 쏜 포탄들이 새롭게 보일 거예요.
          </p>
          <button className={styles.restartBtn} onClick={onRestart}>
            🔄 다시 시작
          </button>
        </div>
      </div>
    );
  }

  if (!level) return null;

  const sceneClass = `${styles.scene} ${
    phase.kind === 'miss' ? styles.shake : ''
  } ${phase.kind === 'hit' ? styles.flash : ''}`;

  return (
    <div className={styles.cannonTab}>
      {/* HUD */}
      <div className={styles.hud}>
        <div className={styles.hudLeft}>
          <span className={styles.levelBadge}>
            레벨 {level.id} / {LEVELS.length}
          </span>
          <span className={styles.levelName}>{level.name}</span>
        </div>
        <div className={styles.hudRight}>
          시도 <strong>{attempts}</strong>
        </div>
      </div>

      {/* SVG 씬 */}
      <div className={sceneClass}>
        <svg
          viewBox={VIEW_BOX}
          className={styles.sceneSvg}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e1b4b" />
              <stop offset="100%" stopColor="#312e81" />
            </linearGradient>
          </defs>

          {/* 하늘 */}
          <rect
            x={VIEW_X}
            y={VIEW_Y_MIN}
            width={VIEW_W}
            height={VIEW_H}
            fill="url(#skyGrad)"
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

          {/* 격자 (옅게) */}
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
          {[5, 10, 15, 20].map((gy) => (
            <line
              key={`gy-${gy}`}
              x1={VIEW_X}
              x2={VIEW_X + VIEW_W}
              y1={sy(gy)}
              y2={sy(gy)}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={0.03}
            />
          ))}
          {/* 거리 라벨 */}
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

          {/* 장애물 */}
          {level.obstacles?.map((o, i) => (
            <rect
              key={`obs-${i}`}
              x={o.x}
              y={sy(o.y + o.h)}
              width={o.w}
              height={o.h}
              fill="#475569"
              stroke="#1e293b"
              strokeWidth={0.05}
            />
          ))}

          {/* 표적 */}
          <Target rect={level.target} />

          {/* 미리보기 궤적 (aiming 상태) */}
          {phase.kind === 'aiming' && (
            <PreviewPath path={previewPath} />
          )}

          {/* 비행 궤적 트레일 */}
          {phase.kind === 'flying' && flyingPath.length > 0 && (
            <polyline
              points={flyingPath.map((p) => `${p.x},${sy(p.y)}`).join(' ')}
              fill="none"
              stroke="#fbbf24"
              strokeWidth={0.12}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* 포탄 */}
          {ballPos && ballPos.y >= VIEW_Y_MIN && (
            <circle
              cx={ballPos.x}
              cy={sy(ballPos.y)}
              r={0.35}
              fill="#f87171"
              stroke="#fca5a5"
              strokeWidth={0.06}
            />
          )}

          {/* 대포 */}
          <Cannon angleDeg={angle} />
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

        {/* 동적 수식 */}
        <div className={styles.equation}>
          y = x · tan({angle}°) − {G} · x² / (2 · {speed}² · cos²({angle}°))
        </div>

        {/* 힌트 */}
        <div className={styles.hint}>💡 {level.hint}</div>

        {/* 발사 버튼 / 상태 메시지 */}
        <div className={styles.actionRow}>
          {phase.kind === 'aiming' && (
            <button className={styles.fireBtn} onClick={onFire}>
              🎯 발사!
            </button>
          )}
          {phase.kind === 'flying' && (
            <div className={styles.statusFlying}>🚀 비행 중...</div>
          )}
          {phase.kind === 'hit' && (
            <div className={styles.statusHit}>
              명중! 꼭짓점은 ({phase.vertex.x.toFixed(1)},{' '}
              {phase.vertex.y.toFixed(1)})m 였어요.
            </div>
          )}
          {phase.kind === 'miss' && (
            <div className={styles.statusMiss}>다시 시도해 보세요!</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 하위 SVG 컴포넌트 ────────────────────────────────────

function Cannon({ angleDeg }: { angleDeg: number }) {
  // 받침: x=-0.6~0.6, y=0~0.6
  // 포신: 길이 1.4, 두께 0.5, 회전 중심 (0, 0.5)
  // 포신 끝이 발사 시점으로 가정
  return (
    <g>
      {/* 받침 */}
      <rect x={-0.6} y={sy(0.6)} width={1.2} height={0.6} fill="#475569" />
      <circle cx={-0.4} cy={sy(0)} r={0.25} fill="#1e293b" />
      <circle cx={0.4} cy={sy(0)} r={0.25} fill="#1e293b" />
      {/* 포신 (회전) */}
      <g transform={`translate(0, ${sy(0.5)}) rotate(${-angleDeg}) translate(0, 0)`}>
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

function Target({ rect }: { rect: Rect }) {
  const cx = rect.x + rect.w / 2;
  const cy = rect.y + rect.h / 2;
  return (
    <g>
      <rect
        x={rect.x}
        y={sy(rect.y + rect.h)}
        width={rect.w}
        height={rect.h}
        fill="rgba(248, 113, 113, 0.2)"
        stroke="#f87171"
        strokeWidth={0.08}
      />
      <circle cx={cx} cy={sy(cy)} r={0.5} fill="#f87171" />
      <circle cx={cx} cy={sy(cy)} r={0.3} fill="#fca5a5" />
      <circle cx={cx} cy={sy(cy)} r={0.12} fill="#7f1d1d" />
      {/* 표적 받침 (공중 표적은 기둥) */}
      {rect.y > 0 && (
        <line
          x1={cx}
          x2={cx}
          y1={sy(rect.y)}
          y2={sy(0)}
          stroke="#7f1d1d"
          strokeWidth={0.1}
          strokeDasharray="0.2 0.2"
        />
      )}
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

// ─── 슬라이더 ───────────────────────────────────────────

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
