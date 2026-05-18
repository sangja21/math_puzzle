'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import {
  hypotenuse,
  hypSquareTiltDeg,
  localTriangle,
  triangleArrangement,
  whiteArea,
} from '@/lib/puzzles/pythagoras';

// SVG 큰 정사각형 픽셀 크기 — viewBox 는 (a+b) 단위. 둘레 패딩 PAD.
const SVG_SIZE = 400;
const PAD = 16;

// 자동 토글 한 방향 시간 (ms) — t 가 0→1 또는 1→0 으로 가는 데 걸리는 시간.
const AUTO_PERIOD_MS = 2000;

// 회전 구분용 4색 — 다리 a²+b² ↔ 빗변 c² 사이 회전 차이를 색으로 식별.
const TRI_COLORS = ['#60a5fa', '#f472b6', '#34d399', '#fbbf24'] as const;

export default function PythagorasPage() {
  const [a, setA] = useState(3);
  const [b, setB] = useState(4);
  const [t, setT] = useState(0);
  const [auto, setAuto] = useState(true);

  // 자동 토글 — requestAnimationFrame 으로 부드러운 ping-pong.
  // direction: +1 (0→1), -1 (1→0).
  const dirRef = useRef<1 | -1>(1);
  const lastTimeRef = useRef<number | null>(null);
  useEffect(() => {
    if (!auto) {
      lastTimeRef.current = null;
      return;
    }
    let frame = 0;
    const loop = (now: number) => {
      const last = lastTimeRef.current ?? now;
      const dt = now - last;
      lastTimeRef.current = now;
      setT((prev) => {
        let next = prev + (dirRef.current * dt) / AUTO_PERIOD_MS;
        if (next >= 1) {
          next = 1;
          dirRef.current = -1;
        } else if (next <= 0) {
          next = 0;
          dirRef.current = 1;
        }
        return next;
      });
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [auto]);

  const handleManualT = useCallback((value: number) => {
    setAuto(false);
    setT(value);
  }, []);

  const c = useMemo(() => hypotenuse(a, b), [a, b]);
  const s = a + b;
  const arrangement = useMemo(() => triangleArrangement(a, b, t), [a, b, t]);
  const local = useMemo(() => localTriangle(a, b), [a, b]);
  const localPoints = useMemo(
    () => local.map(([x, y]) => `${x},${y}`).join(' '),
    [local],
  );
  const tilt = useMemo(() => hypSquareTiltDeg(a, b), [a, b]);

  const bigArea = s * s;
  const triArea = 2 * a * b;
  const white = whiteArea(a, b);

  // SVG viewBox 단위 → 픽셀 환산.
  const unit = SVG_SIZE / s;
  // 자동 모드 시 transition 으로 부드럽게, 수동 슬라이드 시에는 즉시 반응.
  // 단, 60fps RAF 로 t 가 매 프레임 바뀌므로 transition 은 짧게 둔다 (jitter 방지).
  const transitionStyle = auto ? 'transform 0.06s linear' : 'none';

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.homeBtn}>🏠 메인으로</Link>

      <header className={styles.header}>
        <h1 className={styles.title}>
          <span>📐</span> 피타고라스 시각 증명
        </h1>
        <p className={styles.subtitle}>
          같은 큰 정사각형을 두 가지로 채워보세요. 흰 공간은 <strong>a² + b²</strong> = <strong>c²</strong>{' '}
          — 어느 배치든 늘 같습니다.
        </p>
      </header>

      <section className={styles.controls}>
        <div className={styles.legCtrl}>
          <label className={styles.legLabel}>
            <span>a (다리)</span>
            <span className={styles.legValue}>{a}</span>
          </label>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={a}
            onChange={(e) => setA(Number(e.target.value))}
            className={styles.slider}
            aria-label="다리 a 길이"
          />
        </div>
        <div className={styles.legCtrl}>
          <label className={styles.legLabel}>
            <span>b (다리)</span>
            <span className={styles.legValue}>{b}</span>
          </label>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={b}
            onChange={(e) => setB(Number(e.target.value))}
            className={styles.slider}
            aria-label="다리 b 길이"
          />
        </div>
        <div className={styles.legCtrl}>
          <span className={styles.legLabel}>
            <span>c (빗변)</span>
            <span className={styles.legValue}>{Number.isInteger(c) ? c : c.toFixed(3)}</span>
          </span>
          <div className={styles.cFormula}>
            √({a}² + {b}²) = √{a * a + b * b}
          </div>
        </div>
      </section>

      <section className={styles.stage}>
        <svg
          className={styles.svg}
          viewBox={`${-PAD} ${-PAD} ${SVG_SIZE + 2 * PAD} ${SVG_SIZE + 2 * PAD}`}
          width={SVG_SIZE + 2 * PAD}
          height={SVG_SIZE + 2 * PAD}
          aria-label="피타고라스 시각 증명 도형"
        >
          {/* 큰 (a+b) × (a+b) 정사각형 — 짙은 베이지 배경 */}
          <rect
            x={0}
            y={0}
            width={SVG_SIZE}
            height={SVG_SIZE}
            className={styles.bigSquare}
          />

          {/* 흰 공간을 시각화 — t 값에 따라 두 모드 사이 보간 */}
          <g className={styles.whiteGroup}>
            {/* t=0 부근: 좌상 a², 우하 b² 정사각형 */}
            <rect
              x={0}
              y={0}
              width={a * unit}
              height={a * unit}
              className={styles.whiteSquare}
              style={{ opacity: 1 - t }}
            />
            <rect
              x={a * unit}
              y={a * unit}
              width={b * unit}
              height={b * unit}
              className={styles.whiteSquare}
              style={{ opacity: 1 - t }}
            />
            {/* t=1 부근: 가운데 기울어진 c² 정사각형. 한 꼭짓점 (b, 0) 을 회전 중심으로
                tilt 만큼 SVG 시계방향 회전하면 (b,0)→(0,a)→(a, a+b)→(a+b, b) 와 일치. */}
            <rect
              x={b * unit}
              y={0}
              width={c * unit}
              height={c * unit}
              transform={`rotate(${tilt} ${b * unit} 0)`}
              className={styles.whiteSquareC}
              style={{ opacity: t }}
            />
          </g>

          {/* 4개 직각삼각형 — t 보간된 위치/회전 */}
          {arrangement.map((tri, i) => (
            <g
              key={i}
              transform={`translate(${tri.pivot.x * unit} ${tri.pivot.y * unit}) rotate(${tri.rotation}) scale(${unit})`}
              style={{ transition: transitionStyle }}
            >
              <polygon
                points={localPoints}
                fill={TRI_COLORS[i]}
                stroke="#0f172a"
                strokeWidth={2 / unit}
                strokeLinejoin="round"
                className={styles.triangle}
              />
            </g>
          ))}

          {/* 모서리 좌표 라벨 — a, b 표시. 큰 정사각형 바깥 약간 떨어진 곳에. */}
          <g className={styles.dimLabels}>
            {/* 상단: a (왼쪽 a), b (오른쪽 b) */}
            <text x={(a * unit) / 2} y={-4} className={styles.dimLabel}>a={a}</text>
            <text x={a * unit + (b * unit) / 2} y={-4} className={styles.dimLabel}>b={b}</text>
            {/* 좌측: 위 a, 아래 b */}
            <text
              x={-4}
              y={(a * unit) / 2}
              className={styles.dimLabel}
              textAnchor="end"
              dominantBaseline="middle"
            >
              a={a}
            </text>
            <text
              x={-4}
              y={a * unit + (b * unit) / 2}
              className={styles.dimLabel}
              textAnchor="end"
              dominantBaseline="middle"
            >
              b={b}
            </text>
          </g>
        </svg>

        <div className={styles.tCtrl}>
          <div className={styles.tHeader}>
            <span className={styles.tTitle}>재배치 진행도 t</span>
            <span className={styles.tValue}>{t.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={t}
            onChange={(e) => handleManualT(Number(e.target.value))}
            className={`${styles.slider} ${styles.tSlider}`}
            aria-label="재배치 진행도"
          />
          <div className={styles.tEnds}>
            <button
              type="button"
              className={`${styles.endBtn} ${t < 0.5 ? styles.endBtnActive : ''}`}
              onClick={() => handleManualT(0)}
            >
              a² + b² 배치
            </button>
            <button
              type="button"
              className={`${styles.endBtn} ${t >= 0.5 ? styles.endBtnActive : ''}`}
              onClick={() => handleManualT(1)}
            >
              c² 배치
            </button>
          </div>
          <label className={styles.autoToggle}>
            <input
              type="checkbox"
              checked={auto}
              onChange={(e) => setAuto(e.target.checked)}
            />
            <span>자동 왕복 애니메이션</span>
          </label>
        </div>
      </section>

      <section className={styles.areaPanel}>
        <div className={styles.areaRow}>
          <span className={styles.areaLabel}>큰 정사각형</span>
          <span className={styles.areaFormula}>(a+b)² = ({a}+{b})²</span>
          <span className={styles.areaValue}>{bigArea}</span>
        </div>
        <div className={styles.areaRow}>
          <span className={styles.areaLabel}>4개 삼각형</span>
          <span className={styles.areaFormula}>4 × (½·a·b) = 2ab</span>
          <span className={styles.areaValue}>{triArea}</span>
        </div>
        <div className={`${styles.areaRow} ${styles.areaWhite}`}>
          <span className={styles.areaLabel}>흰 공간 (불변)</span>
          <span className={styles.areaFormula}>
            (a+b)² − 2ab = a² + b² = c²
          </span>
          <span className={styles.areaValue}>{white}</span>
        </div>
      </section>

      <details className={styles.help}>
        <summary>왜 두 배치 모두 흰 면적이 같을까? 🤔</summary>
        <div className={styles.helpBody}>
          <p>
            큰 정사각형의 한 변은 <strong>a + b</strong>, 면적은 <strong>(a+b)²</strong> 로 고정.{' '}
            그 안의 4개 직각삼각형은 <em>위치·회전만</em> 바뀔 뿐 모양은 그대로니까{' '}
            4 × ½ab = <strong>2ab</strong> 도 고정.
          </p>
          <p>
            남는 흰 공간 = (a+b)² − 2ab = a² + 2ab + b² − 2ab ={' '}
            <strong>a² + b²</strong>.{' '}
            한편 t=1 배치에서 그 흰 공간은 <em>한 변이 c 인 정사각형 하나</em>,{' '}
            즉 <strong>c²</strong>. 같은 공간을 두 가지로 표현한 것이므로
            <strong> a² + b² = c²</strong>.
          </p>
          <p>
            <strong>3, 4, 5 직각삼각형의 특별함:</strong>{' '}
            세 변이 모두 정수인 가장 작은 직각삼각형. 이런 정수 세 쌍을 <em>피타고라스 수</em>{' '}
            라 부르며 (3,4,5), (5,12,13), (8,15,17), (7,24,25), (20,21,29) … 무한히 존재합니다.
          </p>
          <p>
            <strong>조작법:</strong> a, b 슬라이더로 다리 길이 (1~5) 를 바꾸고, t 슬라이더로{' '}
            두 배치 사이를 직접 이동해 보세요. 자동 왕복을 끄면 일시정지됩니다.
          </p>
        </div>
      </details>
    </div>
  );
}
