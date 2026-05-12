'use client';

import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import styles from './page.module.css';

const BOX_WIDTH = 280;
const BOX_HEIGHT = 360;
const GRAIN_R = 4; // 알 반지름 (px)
const WALL_T = 60; // 박스 안 보이는 벽 두께

// 한 알이 의미하는 톨 수: 100^tier
const TIER_UNITS: readonly string[] = [
  '1톨', '100톨', '1만 톨', '100만 톨', '1억 톨',
  '100억 톨', '1조 톨', '100조 톨', '1경 톨', '100경 톨',
];
const MAX_TIER = TIER_UNITS.length - 1;

// 한 칸당 최대 떨어뜨릴 알 수 (성능)
const MAX_DROP_PER_CELL = 140;
// 박스 가용 알 수 캡 (이걸 넘기 직전이 격상 트리거)
const SOFT_CAPACITY = 260;
// 한 프레임에 spawn하는 알 수
const SPAWN_PER_FRAME = 6;

export interface RiceBoxProps {
  cell: number;
  width?: number;
  height?: number;
}

export function RiceBox({ cell, width = BOX_WIDTH, height = BOX_HEIGHT }: RiceBoxProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const bodiesRef = useRef<Array<{ body: Matter.Body; el: HTMLDivElement }>>([]);
  const dropQueueRef = useRef(0);
  const tierRef = useRef(0);
  const lastCellRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const grainIdRef = useRef(0);

  const [tier, setTier] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  // ── 엔진 초기화 ────────────────────────────────
  useEffect(() => {
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1, scale: 0.0012 },
      enableSleeping: true,
    });
    engine.timing.timeScale = 1.0;
    engineRef.current = engine;

    // 좌·우·바닥 벽 (박스 밖 안 보이게 두꺼움)
    const floor = Matter.Bodies.rectangle(
      width / 2,
      height + WALL_T / 2 - 1,
      width + WALL_T * 2,
      WALL_T,
      { isStatic: true, friction: 0.6 },
    );
    const left = Matter.Bodies.rectangle(
      -WALL_T / 2,
      height / 2,
      WALL_T,
      height + WALL_T * 2,
      { isStatic: true, friction: 0.1 },
    );
    const right = Matter.Bodies.rectangle(
      width + WALL_T / 2,
      height / 2,
      WALL_T,
      height + WALL_T * 2,
      { isStatic: true, friction: 0.1 },
    );
    Matter.World.add(engine.world, [floor, left, right]);

    const tick = () => {
      Matter.Engine.update(engine, 1000 / 60);

      // queue에서 새 알 spawn
      let spawned = 0;
      while (
        spawned < SPAWN_PER_FRAME &&
        dropQueueRef.current > 0 &&
        bodiesRef.current.length < SOFT_CAPACITY + 30
      ) {
        spawnGrain();
        dropQueueRef.current--;
        spawned++;
      }

      // body 위치 → DOM transform
      const arr = bodiesRef.current;
      for (let i = 0; i < arr.length; i++) {
        const { body, el } = arr[i];
        el.style.transform = `translate3d(${body.position.x - GRAIN_R}px, ${body.position.y - GRAIN_R}px, 0) rotate(${body.angle}rad)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      bodiesRef.current.forEach(({ el }) => el.remove());
      bodiesRef.current = [];
      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
      engineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  // ── cell 변화 시 떨어뜨릴 알 수 계산 ─────────────
  useEffect(() => {
    if (cell < lastCellRef.current) {
      // 리셋
      lastCellRef.current = 0;
      dropQueueRef.current = 0;
      tierRef.current = 0;
      setTier(0);
      setToast(null);
      clearAllGrains();
      return;
    }
    if (cell <= 0 || cell === lastCellRef.current) return;

    for (let c = lastCellRef.current + 1; c <= cell; c++) {
      const grainsThisCell = 1n << BigInt(c - 1);
      let toAdd = computeVisible(grainsThisCell, tierRef.current);

      // 격상이 필요한지 미리 검사 (현재 박스 + 추가 후 SOFT_CAPACITY 초과 여부)
      while (
        bodiesRef.current.length + dropQueueRef.current + toAdd > SOFT_CAPACITY &&
        tierRef.current < MAX_TIER
      ) {
        tierRef.current++;
        showToast(`📏 척도 100배 격상 — 1알 = ${TIER_UNITS[tierRef.current]}`);
        clearAllGrains();
        dropQueueRef.current = 0;
        toAdd = computeVisible(grainsThisCell, tierRef.current);
      }

      dropQueueRef.current += Math.min(toAdd, MAX_DROP_PER_CELL);
    }

    setTier(tierRef.current);
    lastCellRef.current = cell;
  }, [cell]);

  const showToast = (text: string) => {
    setToast(text);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 1400);
  };

  const clearAllGrains = () => {
    const engine = engineRef.current;
    if (!engine) return;
    bodiesRef.current.forEach(({ body, el }) => {
      Matter.World.remove(engine.world, body);
      el.remove();
    });
    bodiesRef.current = [];
  };

  const spawnGrain = () => {
    const engine = engineRef.current;
    const container = containerRef.current;
    if (!engine || !container) return;

    // 위쪽 좌우 약간 랜덤
    const x = width * 0.18 + Math.random() * width * 0.64;
    const y = -GRAIN_R - Math.random() * 30;
    const body = Matter.Bodies.circle(x, y, GRAIN_R, {
      friction: 0.55,
      frictionStatic: 0.6,
      restitution: 0.05,
      density: 0.002,
      sleepThreshold: 30,
    });
    Matter.Body.setVelocity(body, { x: (Math.random() - 0.5) * 0.6, y: 0 });
    Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.05);
    Matter.World.add(engine.world, body);

    const el = document.createElement('div');
    el.className = styles.grainPhys;
    const hue = 35 + Math.random() * 20;
    el.style.width = `${GRAIN_R * 2}px`;
    el.style.height = `${GRAIN_R * 2}px`;
    el.style.background = `radial-gradient(circle at 30% 30%, hsl(${hue}, 90%, 80%), hsl(${hue}, 75%, 55%) 70%, hsl(${hue - 5}, 65%, 40%))`;
    container.appendChild(el);

    bodiesRef.current.push({ body, el });
    grainIdRef.current++;
  };

  return (
    <div className={styles.riceBoxArea}>
      <div className={styles.tierLabel}>
        <span>📏</span> 1알 = {TIER_UNITS[tier]}
      </div>
      <div
        ref={containerRef}
        className={styles.riceBox}
        style={{ width, height }}
        role="img"
        aria-label={`쌀 박스 — 현재 척도 1알이 ${TIER_UNITS[tier]}`}
      >
        {toast && <div className={styles.toast}>{toast}</div>}
      </div>
      <div className={styles.tierDots} aria-hidden="true">
        {TIER_UNITS.map((_, i) => (
          <span
            key={i}
            className={`${styles.tierDot} ${i <= tier ? styles.tierDotActive : ''}`}
          />
        ))}
      </div>
    </div>
  );
}

function computeVisible(grainsThisCell: bigint, tier: number): number {
  const divisor = 100n ** BigInt(tier);
  const q = grainsThisCell / divisor;
  if (q === 0n) return 0;
  if (q > BigInt(MAX_DROP_PER_CELL)) return MAX_DROP_PER_CELL;
  return Number(q);
}
