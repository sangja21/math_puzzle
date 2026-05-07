'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CoordPlane, sampleFunction, type Curve, type PointMark } from '@/components/CoordPlane';
import {
  DEFENSE_LEVELS,
  controlPointXs,
  isEnemyHit,
  lagrangeInterpolate,
  type Point,
} from '@/lib/puzzles/polynomial';
import styles from './DefenseTab.module.css';

const X_RANGE: [number, number] = [-5, 5];
const Y_RANGE: [number, number] = [-5, 5];
const W = 420;
const H = 420;
const HIT_THRESHOLD = 0.4;

export function DefenseTab() {
  const [levelIdx, setLevelIdx] = useState(0);
  const [degree, setDegree] = useState(1);
  const [controlYs, setControlYs] = useState<number[]>([0, 0]);

  const level = DEFENSE_LEVELS[levelIdx];

  const handleDegreeChange = (newDegree: number) => {
    setDegree(newDegree);
    setControlYs((prev) => {
      const k = newDegree + 1;
      const next = Array(k).fill(0);
      for (let i = 0; i < Math.min(prev.length, k); i++) next[i] = prev[i];
      return next;
    });
  };

  const handleLevelChange = (newIdx: number) => {
    setLevelIdx(newIdx);
    setDegree(1);
    setControlYs([0, 0]);
  };

  const xs = useMemo(() => controlPointXs(degree), [degree]);
  const controlPoints: Point[] = useMemo(
    () => xs.map((x, i) => ({ x, y: controlYs[i] ?? 0 })),
    [xs, controlYs],
  );

  const fn = useMemo(() => lagrangeInterpolate(controlPoints), [controlPoints]);

  const curveSamples = useMemo(
    () => sampleFunction(fn, X_RANGE[0], X_RANGE[1], 320),
    [fn],
  );

  const hits = useMemo(
    () => level.enemies.map((e) => isEnemyHit(fn, e, HIT_THRESHOLD)),
    [level, fn],
  );

  const allHit = hits.every(Boolean);
  const hitCount = hits.filter(Boolean).length;
  const missingDegree = degree < level.minDegree;

  const enemyMarks: PointMark[] = level.enemies.map((e, i) => ({
    x: e.x,
    y: e.y,
    color: hits[i] ? '#34d399' : '#f87171',
    radius: 9,
    label: hits[i] ? '✓' : undefined,
  }));

  const curves: Curve[] = [
    {
      samples: curveSamples,
      color: allHit ? '#34d399' : '#a78bfa',
      width: 2.8,
    },
  ];

  const handleCpChange = (i: number, y: number) => {
    setControlYs((prev) => prev.map((v, idx) => (idx === i ? y : v)));
  };

  const handleNext = () => {
    if (levelIdx < DEFENSE_LEVELS.length - 1) {
      handleLevelChange(levelIdx + 1);
    }
  };

  const handleReset = () => {
    setControlYs(Array(degree + 1).fill(0));
  };

  const isLastLevel = levelIdx === DEFENSE_LEVELS.length - 1;

  return (
    <main className={styles.tab}>
      <header className={styles.head}>
        <div className={styles.headLeft}>
          <span className={styles.lvBadge}>Lv {level.level}</span>
          <h2 className={styles.headTitle}>적 {level.enemies.length}명</h2>
        </div>
        <div className={styles.headRight}>
          <span className={styles.scoreChip}>
            💥 {hitCount} / {level.enemies.length}
          </span>
        </div>
      </header>

      <p className={styles.story}>{level.story}</p>

      <div className={styles.gameRow}>
        <div className={styles.graphBoxRel}>
          <CoordPlane
            width={W}
            height={H}
            xRange={X_RANGE}
            yRange={Y_RANGE}
            gridTicks={[-4, -2, 2, 4]}
            curves={curves}
            points={enemyMarks}
          />
          <ControlPointOverlay
            points={controlPoints}
            onChange={handleCpChange}
            xRange={X_RANGE}
            yRange={Y_RANGE}
            width={W}
            height={H}
          />
        </div>

        <div className={styles.controlPanel}>
          <div className={styles.degreeBox}>
            <div className={styles.degreeLabel}>
              차수 <span className={styles.degreeValue}>{degree}</span>
            </div>
            <input
              type="range"
              min={1}
              max={6}
              step={1}
              value={degree}
              onChange={(e) => handleDegreeChange(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.degreeHint}>
              조작점 {degree + 1}개를 위아래로 드래그하세요
            </div>
          </div>

          {missingDegree && !allHit && (
            <div className={styles.warnBox}>
              ⚠️ 차수가 부족해 보여요. 적 {level.enemies.length}명을 모두 통과하려면
              최소 <strong>{level.minDegree}차</strong>가 필요합니다.
            </div>
          )}

          {allHit && (
            <div className={styles.clearBox}>
              <div className={styles.clearTitle}>🎉 라운드 클리어!</div>
              <div className={styles.clearSubtitle}>
                {degree}차 곡선으로 적 {level.enemies.length}명을 모두 명중!
              </div>
              {!isLastLevel && (
                <button
                  type="button"
                  className={styles.nextBtn}
                  onClick={handleNext}
                >
                  다음 라운드 →
                </button>
              )}
              {isLastLevel && (
                <div className={styles.finalMsg}>
                  🏛️ 시라쿠사를 지켜냈습니다! 모든 라운드 완료!
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            className={styles.resetBtn}
            onClick={handleReset}
          >
            조작점 초기화
          </button>

          <div className={styles.levelNav}>
            <span className={styles.levelNavLabel}>라운드</span>
            <div className={styles.levelDots}>
              {DEFENSE_LEVELS.map((l, i) => (
                <button
                  key={l.level}
                  type="button"
                  className={`${styles.levelDot} ${i === levelIdx ? styles.levelDotActive : ''}`}
                  onClick={() => handleLevelChange(i)}
                  aria-label={`Lv ${l.level}로 이동`}
                >
                  {l.level}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <details className={styles.help}>
        <summary>💡 어떻게 푸는 건가요?</summary>
        <div className={styles.helpBody}>
          <p>
            <strong>1.</strong> 차수를 정하면 그만큼{' '}
            <strong className={styles.kw}>조작점(노란 ●)</strong>이 등간격으로
            생겨요. (차수 N → 조작점 N+1개)
          </p>
          <p>
            <strong>2.</strong> 조작점을 위아래로 드래그하면 그 점들을 모두 지나는
            곡선이 자동으로 그려져요.
          </p>
          <p>
            <strong>3.</strong> 곡선이 적(빨간 ●)을 지나면 명중! 모든 적을 통과하면
            라운드 클리어.
          </p>
          <p className={styles.helpHint}>
            🔑 핵심: 적 N명을 모두 통과하려면 차수가 최소{' '}
            <strong className={styles.kw}>N − 1</strong> 이상이어야 해요. 부족하면
            아무리 노력해도 다 못 맞혀요.
          </p>
        </div>
      </details>
    </main>
  );
}

// ─── 조작점 오버레이: y만 위아래로 드래그 ────────────────────
function ControlPointOverlay({
  points,
  onChange,
  xRange,
  yRange,
  width,
  height,
}: {
  points: Point[];
  onChange: (i: number, y: number) => void;
  xRange: [number, number];
  yRange: [number, number];
  width: number;
  height: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

  const projX = (x: number) =>
    ((x - xRange[0]) / (xRange[1] - xRange[0])) * width;
  const projY = (y: number) =>
    height - ((y - yRange[0]) / (yRange[1] - yRange[0])) * height;

  useEffect(() => {
    if (draggingIdx === null) return;
    const onMove = (e: PointerEvent) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const scaleY = height / rect.height;
      const py = (e.clientY - rect.top) * scaleY;
      const yRaw = yRange[1] - (py / height) * (yRange[1] - yRange[0]);
      const ySnap = Math.round(yRaw * 4) / 4; // 0.25 스냅
      const y = Math.max(yRange[0], Math.min(yRange[1], ySnap));
      onChange(draggingIdx, y);
    };
    const onUp = () => setDraggingIdx(null);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [draggingIdx, onChange, yRange, height]);

  return (
    <svg
      ref={svgRef}
      className={styles.dragLayer}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      {points.map((p, i) => (
        <g key={i}>
          {/* 수직 가이드선 */}
          <line
            x1={projX(p.x)}
            y1={0}
            x2={projX(p.x)}
            y2={height}
            stroke="rgba(251, 191, 36, 0.18)"
            strokeWidth={1}
            strokeDasharray="3 4"
          />
          <circle
            cx={projX(p.x)}
            cy={projY(p.y)}
            r={11}
            fill="#fbbf24"
            stroke="white"
            strokeWidth={2}
            opacity={draggingIdx === i ? 0.95 : 0.85}
            style={{ cursor: draggingIdx === i ? 'grabbing' : 'grab' }}
            onPointerDown={(e) => {
              e.preventDefault();
              setDraggingIdx(i);
            }}
          />
        </g>
      ))}
    </svg>
  );
}
