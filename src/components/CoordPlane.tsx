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

export interface CoordPlaneProps {
  width?: number;
  height?: number;
  xRange?: [number, number];
  yRange?: [number, number];
  gridTicks?: number[];
  curves?: Curve[];
  points?: PointMark[];
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
