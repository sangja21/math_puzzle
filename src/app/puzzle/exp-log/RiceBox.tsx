'use client';

import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import styles from './page.module.css';

const BOX_WIDTH = 280;
const BOX_HEIGHT = 380;
const GRAIN_R = 4;
const WALL_T = 60;

const PER_CELL_CAP = 100; // 한 칸당 떨어뜨릴 알 수 상한
const HARD_CAPACITY = 2000; // 박스 안 알 수 최대 (성능 안전)
const SPAWN_PER_FRAME = 8;

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
  const lastCellRef = useRef(0);
  const overflowShownRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const [bodyCount, setBodyCount] = useState(0);

  // ── 엔진 초기화 ────────────────────────────────
  useEffect(() => {
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1, scale: 0.0012 },
      enableSleeping: true,
    });
    engineRef.current = engine;

    // 좌·우·바닥 — 위쪽은 뚫림 (알이 박스 위로 솟을 수 있음)
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
      height * 3,
      { isStatic: true, friction: 0.1 },
    );
    const right = Matter.Bodies.rectangle(
      width + WALL_T / 2,
      height / 2,
      WALL_T,
      height * 3,
      { isStatic: true, friction: 0.1 },
    );
    Matter.World.add(engine.world, [floor, left, right]);

    let lastCountUpdate = 0;
    const tick = (now: number) => {
      Matter.Engine.update(engine, 1000 / 60);

      // spawn
      let spawned = 0;
      while (spawned < SPAWN_PER_FRAME && dropQueueRef.current > 0) {
        if (bodiesRef.current.length >= HARD_CAPACITY) {
          dropQueueRef.current = 0;
          if (!overflowShownRef.current) {
            showToast('💥 박스가 한계에 — 진짜 양은 훨씬 더 많아요');
            overflowShownRef.current = true;
          }
          break;
        }
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

      // body count UI 갱신 (5fps로)
      if (now - lastCountUpdate > 200) {
        setBodyCount(arr.length);
        lastCountUpdate = now;
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

  // ── cell 변화 시 떨어뜨릴 알 수 enqueue ─────────
  useEffect(() => {
    if (cell < lastCellRef.current) {
      // 리셋
      lastCellRef.current = 0;
      dropQueueRef.current = 0;
      overflowShownRef.current = false;
      setToast(null);
      clearAllGrains();
      return;
    }
    if (cell <= 0 || cell === lastCellRef.current) return;

    for (let c = lastCellRef.current + 1; c <= cell; c++) {
      const grainsThisCell = 1n << BigInt(c - 1);
      const visible =
        grainsThisCell > BigInt(PER_CELL_CAP) ? PER_CELL_CAP : Number(grainsThisCell);
      dropQueueRef.current += visible;
    }
    lastCellRef.current = cell;
  }, [cell]);

  const showToast = (text: string) => {
    setToast(text);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 1800);
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

    const x = width * 0.18 + Math.random() * width * 0.64;
    const y = -GRAIN_R - 20 - Math.random() * 60;
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
  };

  return (
    <div className={styles.riceBoxArea}>
      <div className={styles.tierLabel}>
        <span>🌾</span> 박스 안 {bodyCount.toLocaleString('ko-KR')}알 쌓임
      </div>
      <div
        ref={containerRef}
        className={styles.riceBox}
        style={{ width, height }}
        role="img"
        aria-label={`쌀 박스 — 현재 ${bodyCount}개 알이 쌓여 있음`}
      >
        {toast && <div className={styles.toast}>{toast}</div>}
      </div>
    </div>
  );
}
