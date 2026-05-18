'use client';

import React from 'react';
import styles from './CoordPlane.module.css';

export interface Curve {
  samples: { x: number; y: number }[];
  color: string;
  dashed?: boolean;
  width?: number;
}

export interface PointMark {
  x: number;
  y: number;
  color: string;
  label?: string;
  radius?: number;
}

export interface ArrowSpec {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  width?: number;
  dashed?: boolean;
  label?: string;
  /** label은 화살표 끝점 근처. 기본 8px 안쪽 오프셋 */
  labelOffset?: number;
  /** 머리 크기(px). 기본 10 */
  headSize?: number;
  opacity?: number;
}

export interface CoordPlaneProps {
  width?: number;
  height?: number;
  xRange?: [number, number];
  yRange?: [number, number];
  gridTicks?: number[];
  curves?: Curve[];
  points?: PointMark[];
  arrows?: ArrowSpec[];
  className?: string;
}

const DEFAULT_TICKS = [-8, -6, -4, -2, 2, 4, 6, 8];

export function CoordPlane({
  width = 380,
  height = 380,
  xRange = [-10, 10],
  yRange = [-10, 10],
  gridTicks = DEFAULT_TICKS,
  curves = [],
  points = [],
  arrows = [],
  className,
}: CoordPlaneProps) {
  const projX = (x: number) =>
    ((x - xRange[0]) / (xRange[1] - xRange[0])) * width;
  const projY = (y: number) =>
    height - ((y - yRange[0]) / (yRange[1] - yRange[0])) * height;

  const ySpan = yRange[1] - yRange[0];
  const yClampMin = yRange[0] - ySpan * 0.1;
  const yClampMax = yRange[1] + ySpan * 0.1;

  const x0 = projX(0);
  const y0 = projY(0);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`${styles.svgPlane} ${className ?? ''}`.trim()}
    >
      {gridTicks.map((t) => (
        <React.Fragment key={`grid-${t}`}>
          <line
            x1={projX(t)} y1={0}
            x2={projX(t)} y2={height}
            stroke="rgba(255,255,255,0.08)" strokeWidth={1}
          />
          <line
            x1={0} y1={projY(t)}
            x2={width} y2={projY(t)}
            stroke="rgba(255,255,255,0.08)" strokeWidth={1}
          />
          <text
            x={projX(t) + 3}
            y={y0 - 4}
            fill="rgba(255,255,255,0.35)"
            fontSize={9}
          >{t}</text>
          <text
            x={x0 + 4}
            y={projY(t) + 3}
            fill="rgba(255,255,255,0.35)"
            fontSize={9}
          >{t}</text>
        </React.Fragment>
      ))}

      <line x1={0} y1={y0} x2={width} y2={y0} stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} />
      <line x1={x0} y1={0} x2={x0} y2={height} stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} />
      <text x={width - 12} y={y0 - 6} fill="rgba(255,255,255,0.6)" fontSize={12} fontWeight="bold">x</text>
      <text x={x0 + 6} y={14} fill="rgba(255,255,255,0.6)" fontSize={12} fontWeight="bold">y</text>

      {curves.map((curve, i) => {
        if (curve.samples.length < 2) return null;
        const pts = curve.samples
          .map((s) => {
            const yClamped = Math.max(yClampMin, Math.min(yClampMax, s.y));
            return `${projX(s.x).toFixed(2)},${projY(yClamped).toFixed(2)}`;
          })
          .join(' ');
        return (
          <polyline
            key={`curve-${i}`}
            points={pts}
            fill="none"
            stroke={curve.color}
            strokeWidth={curve.width ?? 2.5}
            strokeDasharray={curve.dashed ? '8 5' : undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })}

      {arrows.map((a, i) => {
        const sx = projX(a.x1);
        const sy = projY(a.y1);
        const ex = projX(a.x2);
        const ey = projY(a.y2);
        const dx = ex - sx;
        const dy = ey - sy;
        const len = Math.hypot(dx, dy);
        if (len < 0.5) return null;
        const head = a.headSize ?? 10;
        const ux = dx / len;
        const uy = dy / len;
        // 머리 안쪽으로 살짝 들어가서 선이 끝나도록 — 머리가 더 깔끔
        const shaftEx = ex - ux * head * 0.6;
        const shaftEy = ey - uy * head * 0.6;
        const leftX = ex - ux * head + uy * head * 0.55;
        const leftY = ey - uy * head - ux * head * 0.55;
        const rightX = ex - ux * head - uy * head * 0.55;
        const rightY = ey - uy * head + ux * head * 0.55;
        const labelOff = a.labelOffset ?? 8;
        const labelX = ex - ux * labelOff + uy * 12;
        const labelY = ey - uy * labelOff - ux * 12;
        return (
          <g
            key={`arrow-${i}`}
            opacity={a.opacity ?? 1}
          >
            <line
              x1={sx}
              y1={sy}
              x2={shaftEx}
              y2={shaftEy}
              stroke={a.color}
              strokeWidth={a.width ?? 2.5}
              strokeLinecap="round"
              strokeDasharray={a.dashed ? '6 4' : undefined}
            />
            <polygon
              points={`${ex},${ey} ${leftX},${leftY} ${rightX},${rightY}`}
              fill={a.color}
            />
            {a.label && (
              <text
                x={labelX}
                y={labelY}
                fill={a.color}
                fontSize={12}
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="central"
                style={{ paintOrder: 'stroke', stroke: 'rgba(2,6,23,0.8)', strokeWidth: 3 }}
              >
                {a.label}
              </text>
            )}
          </g>
        );
      })}

      {points.map((p, i) => (
        <React.Fragment key={`point-${i}`}>
          <circle
            cx={projX(p.x)}
            cy={projY(p.y)}
            r={p.radius ?? 6}
            fill={p.color}
            stroke="white"
            strokeWidth={2}
          />
          {p.label && (
            <text
              x={projX(p.x) + 9}
              y={projY(p.y) - 6}
              fill={p.color}
              fontSize={12}
              fontWeight="bold"
            >{p.label}</text>
          )}
        </React.Fragment>
      ))}
    </svg>
  );
}

export function sampleLine(
  a: number,
  b: number,
  xMin = -10,
  xMax = 10,
): { x: number; y: number }[] {
  return [
    { x: xMin, y: a * xMin + b },
    { x: xMax, y: a * xMax + b },
  ];
}

export function sampleFunction(
  fn: (x: number) => number,
  xMin: number,
  xMax: number,
  count = 200,
): { x: number; y: number }[] {
  const samples: { x: number; y: number }[] = [];
  const step = (xMax - xMin) / (count - 1);
  for (let i = 0; i < count; i++) {
    const x = xMin + i * step;
    samples.push({ x, y: fn(x) });
  }
  return samples;
}
