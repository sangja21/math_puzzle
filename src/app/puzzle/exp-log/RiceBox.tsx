'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './page.module.css';

const BOX_WIDTH = 280;
const BOX_HEIGHT = 360;
const COLS = 20;
const ROWS = 30;
const CAPACITY = COLS * ROWS;
const CELL_W = BOX_WIDTH / COLS;
const CELL_H = BOX_HEIGHT / ROWS;
const GRAIN_R = Math.min(CELL_W, CELL_H) * 0.42;

// 한 알이 의미하는 톨 수: 100^tier
const TIER_UNITS: readonly string[] = [
  '1톨', '100톨', '1만 톨', '100만 톨', '1억 톨',
  '100억 톨', '1조 톨', '100조 톨', '1경 톨', '100경 톨',
];
const MAX_TIER = TIER_UNITS.length - 1;
const MAX_FALLING_PER_CELL = 220; // 한 칸당 최대 떨어뜨릴 알 수 (성능)

interface Grain {
  id: number;
  col: number;
  row: number;
  hue: number;
}

export interface RiceBoxProps {
  cell: number; // 1~64. 0이면 빈 상태
  width?: number;
  height?: number;
}

export function RiceBox({ cell, width = BOX_WIDTH, height = BOX_HEIGHT }: RiceBoxProps) {
  const [grains, setGrains] = useState<Grain[]>([]);
  const [tier, setTier] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const lastCellRef = useRef(0);
  const grainIdRef = useRef(0);
  const colHeightsRef = useRef<number[]>(Array(COLS).fill(0));
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scaleX = width / BOX_WIDTH;
  const scaleY = height / BOX_HEIGHT;

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (cell < lastCellRef.current) {
      // 리셋 (cell이 줄어들면 초기화)
      lastCellRef.current = 0;
      colHeightsRef.current = Array(COLS).fill(0);
      setGrains([]);
      setTier(0);
      setToast(null);
    }

    if (cell <= 0 || cell === lastCellRef.current) return;

    let currentTier = tier;
    let currentGrains = grains.slice();
    let currentHeights = colHeightsRef.current.slice();
    let pendingToast: string | null = null;

    const pickColumn = (heights: number[]): number => {
      let minH = Infinity;
      for (let k = 0; k < COLS; k++) if (heights[k] < minH) minH = heights[k];
      const candidates: number[] = [];
      for (let k = 0; k < COLS; k++) if (heights[k] <= minH + 1) candidates.push(k);
      return candidates[Math.floor(Math.random() * candidates.length)];
    };

    for (let c = lastCellRef.current + 1; c <= cell; c++) {
      // 이 칸의 톨 수: 2^(c-1)
      const grainsThisCell = 1n << BigInt(c - 1);

      let remaining = computeVisibleGrains(grainsThisCell, currentTier);
      let safety = 100;
      while (remaining > 0 && safety-- > 0) {
        const spaceLeft = CAPACITY - currentGrains.length;
        if (remaining > spaceLeft || (currentGrains.length >= CAPACITY * 0.85 && remaining > CAPACITY * 0.15)) {
          // tier 격상
          if (currentTier < MAX_TIER) {
            currentTier++;
            currentGrains = [];
            currentHeights = Array(COLS).fill(0);
            pendingToast = `📏 척도 100배 격상 — 1알 = ${TIER_UNITS[currentTier]}`;
            remaining = computeVisibleGrains(grainsThisCell, currentTier);
            continue;
          } else {
            // 최대 tier: 넘쳐도 표시만
            remaining = Math.min(remaining, spaceLeft);
          }
        }
        const toAdd = Math.min(remaining, spaceLeft);
        for (let i = 0; i < toAdd; i++) {
          const col = pickColumn(currentHeights);
          const row = currentHeights[col];
          if (row >= ROWS) {
            // 컬럼 가득. 다른 컬럼으로
            i--;
            continue;
          }
          currentHeights[col] = row + 1;
          currentGrains.push({
            id: grainIdRef.current++,
            col,
            row,
            hue: 35 + Math.random() * 20,
          });
        }
        remaining -= toAdd;
      }
    }

    colHeightsRef.current = currentHeights;
    lastCellRef.current = cell;
    if (currentTier !== tier) setTier(currentTier);
    setGrains(currentGrains);

    if (pendingToast) {
      setToast(pendingToast);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setToast(null), 1400);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cell]);

  return (
    <div className={styles.riceBoxArea}>
      <div className={styles.tierLabel}>
        <span>📏</span> 1알 = {TIER_UNITS[tier]}
      </div>
      <div
        className={styles.riceBox}
        style={{ width, height }}
        role="img"
        aria-label={`쌀 박스 — 현재 척도 1알이 ${TIER_UNITS[tier]}`}
      >
        {grains.map((g) => (
          <span
            key={g.id}
            className={styles.grain}
            style={{
              left: (g.col + 0.5) * CELL_W * scaleX - GRAIN_R * scaleX,
              bottom: g.row * CELL_H * scaleY,
              width: GRAIN_R * 2 * scaleX,
              height: GRAIN_R * 2 * scaleY,
              background: `radial-gradient(circle at 30% 30%, hsl(${g.hue}, 90%, 80%), hsl(${g.hue}, 75%, 55%) 70%, hsl(${g.hue - 5}, 65%, 40%))`,
            }}
          />
        ))}
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

// 톨 수를 현재 tier의 *보이는 알 수*로 환산
function computeVisibleGrains(grainsThisCell: bigint, tier: number): number {
  const divisor = 100n ** BigInt(tier);
  const q = grainsThisCell / divisor;
  if (q === 0n) return 0;
  // 보이는 알 수 캡 (성능)
  if (q > BigInt(MAX_FALLING_PER_CELL)) return MAX_FALLING_PER_CELL;
  return Number(q);
}
