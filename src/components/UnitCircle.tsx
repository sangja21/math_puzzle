'use client';

import React from 'react';

export interface UnitCircleProps {
  /** 회전 각도 (도). 양의 x축이 0°, 반시계로 증가 */
  angleDeg: number;
  size?: number;
  /** 단위원 반지름(px). 기본 size의 38% */
  radiusPx?: number;
  /** sin (수직 투영선) 표시 */
  showSin?: boolean;
  /** cos (수평 투영선) 표시 */
  showCos?: boolean;
  /** tan (x=1 위로의 연장선) 표시 */
  showTan?: boolean;
  /** 각도 호 표시 */
  showArc?: boolean;
  /** 회전 흔적 표시 (0°~angleDeg) */
  showTrail?: boolean;
  className?: string;
  /** 회전점 색 */
  pointColor?: string;
  /** sin 투영 색 */
  sinColor?: string;
  /** cos 투영 색 */
  cosColor?: string;
}

const C_AXIS = 'rgba(255,255,255,0.45)';
const C_GRID = 'rgba(255,255,255,0.12)';
const C_CIRCLE = 'rgba(255,255,255,0.55)';

export function UnitCircle({
  angleDeg,
  size = 280,
  radiusPx,
  showSin = true,
  showCos = false,
  showTan = false,
  showArc = true,
  showTrail = false,
  className,
  pointColor = '#fbbf24',
  sinColor = '#f472b6',
  cosColor = '#34d399',
}: UnitCircleProps) {
  const cx = size / 2;
  const cy = size / 2;
  const R = radiusPx ?? size * 0.38;

  const rad = (angleDeg * Math.PI) / 180;
  const px = cx + R * Math.cos(rad);
  const py = cy - R * Math.sin(rad);

  // 각도 호 — 양의 x축에서 회전점까지
  const arcR = R * 0.28;
  const arcLargeFlag = Math.abs(angleDeg) > 180 ? 1 : 0;
  // angle 부호 처리 (반시계 양)
  const arcEnd = {
    x: cx + arcR * Math.cos(rad),
    y: cy - arcR * Math.sin(rad),
  };
  const sweepFlag = angleDeg >= 0 ? 0 : 1;
  const arcPath = `M ${cx + arcR} ${cy} A ${arcR} ${arcR} 0 ${arcLargeFlag} ${sweepFlag} ${arcEnd.x} ${arcEnd.y}`;

  // 회전 trail
  let trailPath = '';
  if (showTrail) {
    const steps = 60;
    const segs: string[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * angleDeg;
      const tr = (t * Math.PI) / 180;
      const x = cx + R * Math.cos(tr);
      const y = cy - R * Math.sin(tr);
      segs.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`);
    }
    trailPath = segs.join(' ');
  }

  // tan: x=1(=cx+R)에서 sec 만큼 위/아래
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const tanLen = Math.abs(cos) < 1e-4 ? null : (R * sin) / cos;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
    >
      {/* 격자 (얇게) */}
      <line x1={0} y1={cy} x2={size} y2={cy} stroke={C_AXIS} strokeWidth={1.2} />
      <line x1={cx} y1={0} x2={cx} y2={size} stroke={C_AXIS} strokeWidth={1.2} />
      <line
        x1={cx - R}
        y1={cy - R - 4}
        x2={cx - R}
        y2={cy + R + 4}
        stroke={C_GRID}
      />
      <line
        x1={cx + R}
        y1={cy - R - 4}
        x2={cx + R}
        y2={cy + R + 4}
        stroke={C_GRID}
      />
      <line
        x1={cx - R - 4}
        y1={cy - R}
        x2={cx + R + 4}
        y2={cy - R}
        stroke={C_GRID}
      />
      <line
        x1={cx - R - 4}
        y1={cy + R}
        x2={cx + R + 4}
        y2={cy + R}
        stroke={C_GRID}
      />

      {/* 단위원 */}
      <circle
        cx={cx}
        cy={cy}
        r={R}
        fill="none"
        stroke={C_CIRCLE}
        strokeWidth={1.8}
      />

      {/* 회전 trail */}
      {showTrail && (
        <path
          d={trailPath}
          fill="none"
          stroke={pointColor}
          strokeWidth={2}
          opacity={0.35}
        />
      )}

      {/* 각도 호 */}
      {showArc && (
        <path
          d={arcPath}
          fill="none"
          stroke="#fbbf24"
          strokeWidth={2}
          opacity={0.8}
        />
      )}

      {/* 반지름 선 */}
      <line
        x1={cx}
        y1={cy}
        x2={px}
        y2={py}
        stroke="#e2e8f0"
        strokeWidth={2.2}
        strokeLinecap="round"
      />

      {/* tan 보조선 (단위원 오른쪽 접선 위) */}
      {showTan && tanLen !== null && (
        <>
          <line
            x1={cx + R}
            y1={cy}
            x2={cx + R}
            y2={cy - tanLen}
            stroke="#a78bfa"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          <text
            x={cx + R + 6}
            y={cy - tanLen / 2}
            fill="#a78bfa"
            fontSize={12}
            fontWeight="bold"
          >
            tan θ
          </text>
        </>
      )}

      {/* sin (수직 점선) */}
      {showSin && (
        <>
          <line
            x1={px}
            y1={cy}
            x2={px}
            y2={py}
            stroke={sinColor}
            strokeWidth={2.6}
            strokeLinecap="round"
          />
          <text
            x={px + 6}
            y={(cy + py) / 2}
            fill={sinColor}
            fontSize={12}
            fontWeight="bold"
            dominantBaseline="middle"
          >
            sin θ
          </text>
        </>
      )}

      {/* cos (수평 점선) */}
      {showCos && (
        <>
          <line
            x1={cx}
            y1={py}
            x2={px}
            y2={py}
            stroke={cosColor}
            strokeWidth={2.6}
            strokeLinecap="round"
          />
          <text
            x={(cx + px) / 2}
            y={py - 6}
            fill={cosColor}
            fontSize={12}
            fontWeight="bold"
            textAnchor="middle"
          >
            cos θ
          </text>
        </>
      )}

      {/* 회전점 */}
      <circle
        cx={px}
        cy={py}
        r={6}
        fill={pointColor}
        stroke="white"
        strokeWidth={2}
      />

      {/* 라벨: 0° 표기 */}
      <text x={cx + R + 6} y={cy + 14} fill="rgba(255,255,255,0.55)" fontSize={10}>
        0°
      </text>
      <text x={cx + R + 6} y={cy - R + 4} fill="rgba(255,255,255,0.55)" fontSize={10}>
        1
      </text>
    </svg>
  );
}
