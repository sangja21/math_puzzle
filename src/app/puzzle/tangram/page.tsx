'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  PIECES,
  Placement,
  PieceId,
  Rotation,
  SILHOUETTES,
  matchesTarget,
  polygonArea,
  transformedVertices,
} from '@/lib/puzzles/tangram';
import styles from './page.module.css';

// 보드 viewBox 단위
const VB_W = 12;
const VB_H = 10;
const TARGET_OFFSET = { x: 2, y: 1 };
const SNAP = 0.5;

const PIECE_IDS: PieceId[] = [
  'large1',
  'large2',
  'medium',
  'small1',
  'small2',
  'square',
  'parallelogram',
];

function initialPlacements(): Placement[] {
  // 트레이에 7조각을 격자처럼 배치 — 회전 0°, 화면 우측에 펼침
  const slots: Record<PieceId, { tx: number; ty: number }> = {
    large1: { tx: 2, ty: 7.5 },
    large2: { tx: 5, ty: 7.5 },
    medium: { tx: 8.5, ty: 7.5 },
    small1: { tx: 1, ty: 9 },
    small2: { tx: 3, ty: 9 },
    square: { tx: 5, ty: 9 },
    parallelogram: { tx: 8, ty: 9 },
  };
  return PIECE_IDS.map((id) => ({
    id,
    rotation: 0 as Rotation,
    mirror: 1 as const,
    tx: slots[id].tx,
    ty: slots[id].ty,
  }));
}

function rotate(r: Rotation, delta: 45 | -45): Rotation {
  const next = ((r + delta + 360) % 360) as Rotation;
  return next;
}

function snap(v: number): number {
  return Math.round(v / SNAP) * SNAP;
}

export default function TangramPage() {
  const [silIdx, setSilIdx] = useState(0);
  const [placements, setPlacements] = useState<Placement[]>(() => initialPlacements());
  const [selected, setSelected] = useState<PieceId | null>(null);
  const [cleared, setCleared] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{
    id: PieceId;
    pointerId: number;
    startTx: number;
    startTy: number;
    startPx: number;
    startPy: number;
  } | null>(null);

  const silhouette = SILHOUETTES[silIdx];

  const targetOutlineOffset = useMemo(
    () => silhouette.outline.map((v) => ({ x: v.x + TARGET_OFFSET.x, y: v.y + TARGET_OFFSET.y })),
    [silhouette],
  );

  const targetArea = useMemo(() => polygonArea(silhouette.outline), [silhouette]);

  const filledArea = useMemo(
    () => placements.reduce((s, p) => s + polygonArea(transformedVertices(p)), 0),
    [placements],
  );

  const pickSilhouette = useCallback((i: number) => {
    setSilIdx(i);
    setCleared(false);
    setPlacements(initialPlacements());
    setSelected(null);
  }, []);

  const reset = useCallback(() => {
    setPlacements(initialPlacements());
    setSelected(null);
    setCleared(false);
  }, []);

  // 스크린 좌표 → viewBox 좌표
  const toViewBox = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * VB_W,
      y: ((clientY - rect.top) / rect.height) * VB_H,
    };
  }, []);

  const onPiecePointerDown = useCallback(
    (e: React.PointerEvent<SVGGElement>, id: PieceId) => {
      e.stopPropagation();
      (e.target as Element).setPointerCapture?.(e.pointerId);
      setSelected(id);
      const p = placements.find((q) => q.id === id);
      if (!p) return;
      const pt = toViewBox(e.clientX, e.clientY);
      dragRef.current = {
        id,
        pointerId: e.pointerId,
        startTx: p.tx,
        startTy: p.ty,
        startPx: pt.x,
        startPy: pt.y,
      };
    },
    [placements, toViewBox],
  );

  const onPiecePointerMove = useCallback(
    (e: React.PointerEvent<SVGGElement>) => {
      const d = dragRef.current;
      if (!d || d.pointerId !== e.pointerId) return;
      const pt = toViewBox(e.clientX, e.clientY);
      const dx = pt.x - d.startPx;
      const dy = pt.y - d.startPy;
      const tx = snap(d.startTx + dx);
      const ty = snap(d.startTy + dy);
      setPlacements((prev) => prev.map((p) => (p.id === d.id ? { ...p, tx, ty } : p)));
    },
    [toViewBox],
  );

  const endDrag = useCallback(() => {
    dragRef.current = null;
  }, []);

  const rotateSelected = useCallback(
    (delta: 45 | -45) => {
      if (!selected) return;
      setPlacements((prev) =>
        prev.map((p) => (p.id === selected ? { ...p, rotation: rotate(p.rotation, delta) } : p)),
      );
    },
    [selected],
  );

  const mirrorSelected = useCallback(() => {
    if (selected !== 'parallelogram') return;
    setPlacements((prev) =>
      prev.map((p) =>
        p.id === 'parallelogram' ? { ...p, mirror: (p.mirror === 1 ? -1 : 1) as 1 | -1 } : p,
      ),
    );
  }, [selected]);

  // 매칭 — 매번 placement 변할 때 검사 (조각 수 7개 고정이라 비용 작음)
  React.useEffect(() => {
    const target = { vertices: targetOutlineOffset };
    if (matchesTarget(placements, target)) {
      setCleared(true);
    } else if (cleared) {
      setCleared(false);
    }
  }, [placements, targetOutlineOffset, cleared]);

  // 키보드 단축키: R/F
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!selected) return;
      if (e.key === 'r' || e.key === 'R') rotateSelected(45);
      if (e.key === 'e' || e.key === 'E') rotateSelected(-45);
      if (e.key === 'f' || e.key === 'F') mirrorSelected();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selected, rotateSelected, mirrorSelected]);

  const nextSilhouette = useCallback(() => {
    pickSilhouette((silIdx + 1) % SILHOUETTES.length);
  }, [silIdx, pickSilhouette]);

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backButton}>
        ← 메인으로
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>🧩 탱그램</h1>
        <p className={styles.subtitle}>
          큰 정사각형을 자른 7조각으로 실루엣을 채워보세요.
        </p>
      </header>

      <div className={styles.silhouetteBar}>
        {SILHOUETTES.map((s, i) => (
          <button
            key={s.id}
            className={`${styles.silBtn} ${i === silIdx ? styles.silActive : ''}`}
            onClick={() => pickSilhouette(i)}
          >
            <span className={styles.silEmoji}>{s.emoji}</span>
            <span className={styles.silName}>{s.name}</span>
            <span className={styles.silDiff} data-diff={s.difficulty}>
              {s.difficulty === 'easy' ? '쉬움' : s.difficulty === 'medium' ? '보통' : '어려움'}
            </span>
          </button>
        ))}
      </div>

      <div className={styles.boardRow}>
        <svg
          ref={svgRef}
          className={styles.board}
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          onPointerMove={onPiecePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {/* 격자 */}
          <defs>
            <pattern id="tangramGrid" width="0.5" height="0.5" patternUnits="userSpaceOnUse">
              <path d="M 0.5 0 L 0 0 0 0.5" fill="none" stroke="rgba(148, 163, 184, 0.08)" strokeWidth="0.01" />
            </pattern>
          </defs>
          <rect width={VB_W} height={VB_H} fill="url(#tangramGrid)" />

          {/* 목표 실루엣 */}
          <polygon
            points={targetOutlineOffset.map((v) => `${v.x},${v.y}`).join(' ')}
            fill="rgba(251, 191, 36, 0.13)"
            stroke="rgba(251, 191, 36, 0.55)"
            strokeWidth="0.05"
            strokeDasharray="0.18 0.12"
          />

          {/* 트레이 영역 표시 */}
          <line
            x1={0}
            y1={6.7}
            x2={VB_W}
            y2={6.7}
            stroke="rgba(148, 163, 184, 0.18)"
            strokeWidth="0.02"
            strokeDasharray="0.2 0.15"
          />
          <text
            x={0.2}
            y={6.55}
            fontSize="0.28"
            fill="rgba(148, 163, 184, 0.55)"
          >
            트레이 (조각을 위로 드래그)
          </text>

          {/* 조각 */}
          {placements.map((p) => {
            const verts = transformedVertices(p);
            const isSel = selected === p.id;
            return (
              <g
                key={p.id}
                onPointerDown={(e) => onPiecePointerDown(e, p.id)}
                style={{ cursor: 'grab', touchAction: 'none' }}
              >
                <polygon
                  points={verts.map((v) => `${v.x},${v.y}`).join(' ')}
                  fill={PIECES[p.id].color}
                  fillOpacity={isSel ? 0.95 : 0.85}
                  stroke={isSel ? '#fff' : 'rgba(15, 23, 42, 0.55)'}
                  strokeWidth={isSel ? 0.08 : 0.04}
                />
              </g>
            );
          })}

          {cleared && (
            <g pointerEvents="none">
              <rect
                x={1}
                y={3.2}
                width={10}
                height={1.4}
                rx={0.2}
                fill="rgba(16, 185, 129, 0.92)"
              />
              <text
                x={6}
                y={4.1}
                textAnchor="middle"
                fontSize="0.7"
                fontWeight="800"
                fill="#0b1620"
              >
                🎉 완성! {silhouette.name}
              </text>
            </g>
          )}
        </svg>

        <aside className={styles.panel}>
          <div className={styles.panelGroup}>
            <div className={styles.targetCard}>
              <span className={styles.targetEmoji}>{silhouette.emoji}</span>
              <div>
                <div className={styles.targetName}>{silhouette.name}</div>
                <div className={styles.targetDiff} data-diff={silhouette.difficulty}>
                  {silhouette.difficulty === 'easy' ? '쉬움' : silhouette.difficulty === 'medium' ? '보통' : '어려움'}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.panelGroup}>
            <div className={styles.groupTitle}>선택한 조각</div>
            <div className={styles.selectedName}>
              {selected ? `${PIECES[selected].id}` : '없음 (조각을 클릭)'}
            </div>
            <div className={styles.rotRow}>
              <button
                className={styles.rotBtn}
                onClick={() => rotateSelected(-45)}
                disabled={!selected}
                aria-label="45도 반시계 회전"
              >
                ↺ 45°
              </button>
              <button
                className={styles.rotBtn}
                onClick={() => rotateSelected(45)}
                disabled={!selected}
                aria-label="45도 시계 회전"
              >
                ↻ 45°
              </button>
            </div>
            <button
              className={styles.mirrorBtn}
              onClick={mirrorSelected}
              disabled={selected !== 'parallelogram'}
              title="평행사변형만 좌우 반전 가능"
            >
              ⇋ 좌우 반전
            </button>
          </div>

          <div className={styles.panelGroup}>
            <div className={styles.groupTitle}>채움</div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${Math.min(100, (filledArea / targetArea) * 100)}%` }}
              />
            </div>
            <div className={styles.progressText}>
              {filledArea.toFixed(1)} / {targetArea.toFixed(1)}
            </div>
          </div>

          <div className={styles.panelGroup}>
            <button className={styles.resetBtn} onClick={reset}>
              🔄 리셋
            </button>
            <button className={styles.nextBtn} onClick={nextSilhouette}>
              ➡️ 다음 실루엣
            </button>
          </div>

          {silhouette.hint && (
            <div className={styles.hintBox}>💡 {silhouette.hint}</div>
          )}
        </aside>
      </div>

      <details className={styles.help}>
        <summary>도움말 / 조작법</summary>
        <ul>
          <li><strong>클릭</strong> — 조각을 선택합니다(흰 테두리).</li>
          <li><strong>드래그</strong> — 선택된 조각을 0.5 격자에 맞춰 이동합니다.</li>
          <li><strong>↻ / ↺ 버튼 또는 R/E 키</strong> — 선택 조각을 45° 회전합니다.</li>
          <li><strong>⇋ 버튼 또는 F 키</strong> — 평행사변형만 좌우 반전 가능합니다.</li>
          <li>겹친 채로 두면 매칭 실패 — 빈틈 없이 외곽 안을 채워야 완성입니다.</li>
        </ul>
        <p className={styles.helpFoot}>
          탱그람은 7세기 중국의 칠교판(七巧板). 큰 정사각형 하나를 7조각으로 자른 뒤
          새·고양이·집 등 무궁무진한 실루엣을 만들어내는 고전 기하 놀이입니다.
        </p>
      </details>
    </div>
  );
}
