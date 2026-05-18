'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  CoordPlane,
  type ArrowSpec,
  type Curve,
  type PointMark,
} from '@/components/CoordPlane';
import {
  JET_STAGES,
  add,
  angleDeg,
  distance,
  flightPosition,
  fromPolarDeg,
  mag,
  sub,
  type Vec2,
} from '@/lib/puzzles/vector';
import styles from './JetstreamTab.module.css';

const X_RANGE: [number, number] = [-10, 10];
const Y_RANGE: [number, number] = [-10, 10];
const W = 420;
const H = 420;
const ANIM_SECONDS = 2.4;

type Phase = 'aim' | 'flying' | 'done';

function defaultHeading(stage: { start: Vec2; goal: Vec2 }): number {
  return Math.round(angleDeg(sub(stage.goal, stage.start)));
}

export function JetstreamTab() {
  const [levelIdx, setLevelIdx] = useState(0);
  const stage = JET_STAGES[levelIdx];

  const [heading, setHeading] = useState(() => defaultHeading(JET_STAGES[0]));
  const [phase, setPhase] = useState<Phase>('aim');
  const [progress, setProgress] = useState(0);
  const [trail, setTrail] = useState<Vec2[]>([]);
  const [cleared, setCleared] = useState<Set<number>>(new Set());
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const goToLevel = (i: number) => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    setLevelIdx(i);
    setHeading(defaultHeading(JET_STAGES[i]));
    setPhase('aim');
    setProgress(0);
    setTrail([]);
  };

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handlePlay = () => {
    if (phase === 'flying') return;
    setPhase('flying');
    setTrail([]);
    startTimeRef.current = performance.now();
    const planeVel = fromPolarDeg(stage.planeSpeed, heading);
    const tick = (now: number) => {
      const elapsed = (now - startTimeRef.current) / 1000;
      const p = Math.min(1, elapsed / ANIM_SECONDS);
      setProgress(p);
      const simT = p * stage.duration;
      setTrail((prev) => {
        const pos = flightPosition(stage.start, planeVel, stage.wind, simT);
        return [...prev, pos];
      });
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setPhase('done');
        const endPos = flightPosition(stage.start, planeVel, stage.wind, stage.duration);
        if (distance(endPos, stage.goal) <= stage.tolerance) {
          setCleared((s) => {
            if (s.has(levelIdx)) return s;
            const next = new Set(s);
            next.add(levelIdx);
            return next;
          });
        }
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const handleReset = () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    setPhase('aim');
    setProgress(0);
    setTrail([]);
  };

  const handleNext = () => {
    if (levelIdx < JET_STAGES.length - 1) {
      goToLevel(levelIdx + 1);
    }
  };

  const currentPos = useMemo<Vec2>(() => {
    if (phase === 'aim') return stage.start;
    if (trail.length === 0) return stage.start;
    return trail[trail.length - 1];
  }, [phase, trail, stage]);

  const endPos = useMemo<Vec2>(() => {
    return flightPosition(
      stage.start,
      fromPolarDeg(stage.planeSpeed, heading),
      stage.wind,
      stage.duration,
    );
  }, [stage, heading]);

  const arrived = phase === 'done' && distance(endPos, stage.goal) <= stage.tolerance;
  const missDist = distance(endPos, stage.goal);

  // ── 시각화 자산 ──
  const arrows = useMemo<ArrowSpec[]>(() => {
    const list: ArrowSpec[] = [];

    // 바람 (지도 위 한가운데 작은 표시 + 시작점에서도 살짝)
    const windCenter: Vec2 = { x: 0, y: 0 };
    const windEnd: Vec2 = add(windCenter, stage.wind);
    list.push({
      x1: windCenter.x,
      y1: windCenter.y,
      x2: windEnd.x,
      y2: windEnd.y,
      color: '#94a3b8',
      width: 2.2,
      label: '바람',
      opacity: 0.9,
    });

    if (phase === 'aim') {
      // 의도한 비행기 속도 (시작점에서)
      const planeVel = fromPolarDeg(stage.planeSpeed, heading);
      list.push({
        x1: stage.start.x,
        y1: stage.start.y,
        x2: stage.start.x + planeVel.x,
        y2: stage.start.y + planeVel.y,
        color: '#38bdf8',
        width: 3,
        label: '비행기',
      });
      // 결과 화살표 (planeVel + wind) — 점선
      const result = add(planeVel, stage.wind);
      list.push({
        x1: stage.start.x,
        y1: stage.start.y,
        x2: stage.start.x + result.x,
        y2: stage.start.y + result.y,
        color: '#fbbf24',
        width: 2.2,
        dashed: true,
        opacity: 0.75,
        label: '실제 방향',
      });
    }

    return list;
  }, [stage, heading, phase]);

  const points = useMemo<PointMark[]>(() => {
    const list: PointMark[] = [
      { x: stage.start.x, y: stage.start.y, color: '#34d399', radius: 8, label: '출발' },
      { x: stage.goal.x, y: stage.goal.y, color: '#fbbf24', radius: 11, label: '목적지' },
    ];
    if (phase !== 'aim') {
      list.push({
        x: currentPos.x,
        y: currentPos.y,
        color: '#38bdf8',
        radius: 7,
        label: phase === 'done' ? (arrived ? '✓' : '✗') : '✈️',
      });
    }
    return list;
  }, [stage, phase, currentPos, arrived]);

  const curves = useMemo<Curve[]>(() => {
    if (trail.length < 2) return [];
    return [
      {
        samples: trail.map((p) => ({ x: p.x, y: p.y })),
        color: '#7dd3fc',
        width: 2.4,
      },
    ];
  }, [trail]);

  const planVel = fromPolarDeg(stage.planeSpeed, heading);
  const resultVel = add(planVel, stage.wind);
  const isLastLevel = levelIdx === JET_STAGES.length - 1;

  return (
    <main className={styles.tab}>
      <header className={styles.head}>
        <div className={styles.headLeft}>
          <span className={styles.lvBadge}>Lv {stage.id}</span>
          <h2 className={styles.headTitle}>{stage.name}</h2>
        </div>
        <span className={styles.windChip}>
          🌬️ 바람 ({stage.wind.x.toFixed(1)}, {stage.wind.y.toFixed(1)}) · |w|=
          {mag(stage.wind).toFixed(2)}
        </span>
      </header>

      <p className={styles.story}>{stage.hint}</p>

      <div className={styles.gameRow}>
        <div className={styles.graphBox}>
          <CoordPlane
            width={W}
            height={H}
            xRange={X_RANGE}
            yRange={Y_RANGE}
            gridTicks={[-8, -4, 4, 8]}
            arrows={arrows}
            points={points}
            curves={curves}
          />
        </div>

        <div className={styles.controlPanel}>
          <div className={styles.headingBox}>
            <div className={styles.headingLabel}>
              <span>비행기 방향</span>
              <span className={styles.headingValue}>{heading}°</span>
            </div>
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={heading}
              onChange={(e) => setHeading(Number(e.target.value))}
              className={styles.slider}
              disabled={phase === 'flying'}
            />
            <div className={styles.headingHint}>
              실제 항로 = (비행기 + 바람) — 합벡터 크기 {mag(resultVel).toFixed(2)}
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.playBtn}
              onClick={handlePlay}
              disabled={phase === 'flying'}
            >
              {phase === 'flying'
                ? `✈️ 비행 중… ${(progress * 100).toFixed(0)}%`
                : '✈️ 이륙'}
            </button>
            <button
              type="button"
              className={styles.resetBtn}
              onClick={handleReset}
              disabled={phase === 'flying'}
            >
              ↺
            </button>
          </div>

          {phase === 'done' && arrived && (
            <div className={`${styles.resultBox} ${styles.resultSuccess}`}>
              <div className={styles.resultTitle}>🎉 정확히 착륙!</div>
              <div className={styles.resultBody}>
                목적지에서 <strong>{missDist.toFixed(2)}</strong> 거리. 바람을
                미리 *역방향* 으로 보정한 게 통했어요.
              </div>
              {!isLastLevel && (
                <button type="button" className={styles.nextBtn} onClick={handleNext}>
                  다음 라운드 →
                </button>
              )}
              {isLastLevel && (
                <div className={styles.finalMsg}>
                  🛬 모든 비행 완료! 제트기류 마스터.
                </div>
              )}
            </div>
          )}

          {phase === 'done' && !arrived && (
            <div className={`${styles.resultBox} ${styles.resultMiss}`}>
              <div className={styles.resultTitle}>😵 항로 이탈</div>
              <div className={styles.resultBody}>
                목적지에서 <strong>{missDist.toFixed(2)}</strong> 만큼 빗나갔어요
                (허용 {stage.tolerance}). 비행기 방향을 바람의 *반대쪽으로* 더
                기울여 보세요.
              </div>
            </div>
          )}

          <div className={styles.levelNav}>
            <span className={styles.levelNavLabel}>라운드</span>
            <div className={styles.levelDots}>
              {JET_STAGES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  className={`${styles.levelDot} ${i === levelIdx ? styles.levelDotActive : ''} ${cleared.has(i) && i !== levelIdx ? styles.levelDotCleared : ''}`}
                  onClick={() => goToLevel(i)}
                  aria-label={`Lv ${s.id}로 이동`}
                >
                  {s.id}
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
            <strong>1.</strong> <strong style={{ color: '#34d399' }}>녹색 ●</strong>은
            출발지, <strong style={{ color: '#fbbf24' }}>노란 ●</strong>은 목적지예요.
          </p>
          <p>
            <strong>2.</strong> 슬라이더로 <strong style={{ color: '#38bdf8' }}>비행기 방향</strong>(파란
            화살표)을 정하면 실제 항로(<strong style={{ color: '#fbbf24' }}>노란 점선</strong>)가
            바뀝니다 ─ 합벡터예요.
          </p>
          <p>
            <strong>3.</strong> *이륙* 누르면 합벡터 방향으로 진짜 비행. 노란 점에
            허용 반경 안으로 도달하면 클리어.
          </p>
          <p style={{ color: 'rgba(248,250,252,0.62)', fontSize: '0.85rem', fontStyle: 'italic' }}>
            🌬️ 회색 화살표가 바람이에요. 바람이 미는 반대쪽으로 비행기 방향을
            기울이는 게 핵심.
          </p>
          <div className={styles.legendRow}>
            <span className={styles.legendDot}>
              <span className={styles.legendSwatch} style={{ background: '#38bdf8' }} />
              비행기 의도 방향
            </span>
            <span className={styles.legendDot}>
              <span className={styles.legendSwatch} style={{ background: '#94a3b8' }} />
              바람
            </span>
            <span className={styles.legendDot}>
              <span className={styles.legendSwatch} style={{ background: '#fbbf24' }} />
              실제 항로 (합)
            </span>
          </div>
        </div>
      </details>
    </main>
  );
}
