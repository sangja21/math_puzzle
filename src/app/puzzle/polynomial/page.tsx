'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { StoryHeader } from '@/components/StoryHeader';
import { CoordPlane, sampleFunction, type Curve } from '@/components/CoordPlane';
import {
  evaluatePolynomial,
  lagrangeInterpolate,
  rungeFunction,
  rungePoints,
  DEGREE_SAMPLES,
  type Point,
} from '@/lib/puzzles/polynomial';
import { DefenseTab } from './DefenseTab';
import styles from './page.module.css';

type Tab = 'principle' | 'defense';

const STORY =
  '시라쿠사가 로마군에 포위되었을 때, 노학자 아르키메데스는 *정교한 곡선* 으로 ' +
  '돌을 날리는 투석기와 빛을 모으는 거울을 설계해 조국을 지켰습니다. ' +
  '직선과 포물선만으로는 부족했던 순간 ─ 차수가 더 높은 곡선의 비밀이 필요했죠.';

export default function PolynomialPage() {
  const [tab, setTab] = useState<Tab>('principle');

  return (
    <div className={styles.container}>
      <StoryHeader
        emoji="〰️"
        title="다항함수의 원리"
        subtitle="조국을 구한 아르키메데스"
        story={STORY}
        coreMath={['y = aₙxⁿ + … + a₀', '차수 ↔ 굽이', '보간', '끝단 거동']}
      />

      <nav
        className={styles.tabs}
        role="tablist"
        aria-label="다항함수 학습 탭"
      >
        <button
          role="tab"
          aria-selected={tab === 'principle'}
          className={`${styles.tab} ${tab === 'principle' ? styles.tabActive : ''}`}
          onClick={() => setTab('principle')}
        >
          📐 수학의 원리
        </button>
        <button
          role="tab"
          aria-selected={tab === 'defense'}
          className={`${styles.tab} ${tab === 'defense' ? styles.tabActive : ''}`}
          onClick={() => setTab('defense')}
        >
          🏰 아르키메데스 방어전
        </button>
      </nav>

      {tab === 'principle' && (
        <main className={styles.principleTab}>
          <Section1Intro />
          <Section2Degree />
          <Section3Lagrange />
          <Section4EndBehavior />
          <Section5Runge />
          <Section6SelfCheck />
          <CallToDefense onClick={() => setTab('defense')} />
        </main>
      )}

      {tab === 'defense' && <DefenseTab />}
    </div>
  );
}

function CallToDefense({ onClick }: { onClick: () => void }) {
  return (
    <div className={styles.cta}>
      <h3>🏰 이제 시라쿠사를 지킬 시간!</h3>
      <p>
        배운 걸 활용해 적을 모두 통과하는 곡선을 만들어보세요. 차수가 부족하면
        절대 모두 못 맞혀요.
      </p>
      <button type="button" className={styles.ctaBtn} onClick={onClick}>
        아르키메데스 방어전 시작
      </button>
    </div>
  );
}

// ─── § 1. 다항함수란 ──────────────────────────────────────────
function Section1Intro() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>1. 다항함수란?</h2>
      <p className={styles.lead}>
        직선(<span className={styles.eq}>y = ax + b</span>)과 포물선
        (<span className={styles.eq}>y = ax² + bx + c</span>)을 합쳐 더 일반화한 식이{' '}
        <strong className={styles.kw}>다항함수</strong>예요.
      </p>
      <div className={styles.equationBig}>y = aₙxⁿ + aₙ₋₁xⁿ⁻¹ + … + a₁x + a₀</div>
      <p className={styles.note}>
        가장 큰 지수 n을 <strong className={styles.kw}>차수</strong>라고 부르고,
        차수가 곡선의 모양을 결정합니다.
      </p>
    </section>
  );
}

// ─── § 2. 차수 = 굽이 수 ─────────────────────────────────────
function Section2Degree() {
  const [degree, setDegree] = useState(3);
  const coeffs = DEGREE_SAMPLES[degree];

  const curves: Curve[] = useMemo(
    () => [
      {
        samples: sampleFunction(
          (x) => evaluatePolynomial(coeffs, x),
          -5,
          5,
          240,
        ),
        color: '#60a5fa',
        width: 2.6,
      },
    ],
    [coeffs],
  );

  const turning = degree - 1;

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>2. 차수가 곡선의 굽이를 결정해요</h2>
      <p className={styles.lead}>
        차수를 1에서 7까지 올려보세요. <strong>굽이(꺾이는 곳)</strong>가
        <span className={styles.kw}> 차수 − 1 </span>개씩 늘어나는 게 보이나요?
      </p>

      <div className={styles.graphRow}>
        <div className={styles.graphBox}>
          <CoordPlane
            width={380}
            height={380}
            xRange={[-5, 5]}
            yRange={[-8, 8]}
            gridTicks={[-4, -2, 2, 4]}
            curves={curves}
          />
        </div>

        <div className={styles.controlPanel}>
          <div className={styles.equationBig}>차수 n = {degree}</div>
          <div className={styles.directionChip}>
            굽이 {turning}개 ({degree === 1 ? '직선' : `${degree - 1}번 꺾임`})
          </div>
          <div className={styles.sliderGroup}>
            <div className={styles.sliderRow}>
              <span className={styles.sliderLabel}>
                <span className={styles.varName}>n</span> = {degree}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={7}
              step={1}
              value={degree}
              onChange={(e) => setDegree(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderHint}>1 ≤ n ≤ 7</div>
          </div>
          <p className={styles.note}>
            예시: 1차 = 직선, 2차 = 한 번 꺾인 포물선, 3차 = 두 번 꺾인 S자…
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── § 3. 점들을 모두 지나는 곡선은 단 하나 ─────────────────
const LAGRANGE_X_RANGE: [number, number] = [-5, 5];
const LAGRANGE_Y_RANGE: [number, number] = [-6, 6];
const LAGRANGE_W = 380;
const LAGRANGE_H = 380;

function Section3Lagrange() {

  const [points, setPoints] = useState<Point[]>([
    { x: -4, y: 2 },
    { x: -2, y: -3 },
    { x: 0, y: 1 },
    { x: 2, y: 4 },
    { x: 4, y: -2 },
  ]);

  const fn = useMemo(() => lagrangeInterpolate(points), [points]);

  const curves: Curve[] = useMemo(
    () => [
      {
        samples: sampleFunction(fn, LAGRANGE_X_RANGE[0], LAGRANGE_X_RANGE[1], 300),
        color: '#fbbf24',
        width: 2.6,
      },
    ],
    [fn],
  );

  const handleChange = (i: number, p: Point) => {
    setPoints((prev) => prev.map((q, idx) => (idx === i ? p : q)));
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        3. 점들을 모두 지나는 곡선은 <span className={styles.eq}>딱 하나</span>
      </h2>
      <p className={styles.lead}>
        점 5개를 드래그해 보세요. 그 5점을 정확히 지나는{' '}
        <strong className={styles.kw}>4차 이하 다항</strong>이 단 하나 존재하고,
        곡선이 따라옵니다.
      </p>

      <div className={styles.graphRow}>
        <div className={styles.graphBoxRel}>
          <CoordPlane
            width={LAGRANGE_W}
            height={LAGRANGE_H}
            xRange={LAGRANGE_X_RANGE}
            yRange={LAGRANGE_Y_RANGE}
            gridTicks={[-4, -2, 2, 4]}
            curves={curves}
          />
          <DraggablePointsOverlay
            points={points}
            onChange={handleChange}
            xRange={LAGRANGE_X_RANGE}
            yRange={LAGRANGE_Y_RANGE}
            width={LAGRANGE_W}
            height={LAGRANGE_H}
          />
        </div>

        <div className={styles.controlPanel}>
          <div className={styles.directionChip}>점 5개 → 4차 다항</div>
          <p className={styles.note}>
            일반적으로 <strong>점 N개를 정확히 지나는</strong> 다항의 (최소) 차수는
            <span className={styles.kw}> N − 1 </span>이에요. 이걸{' '}
            <strong>라그랑주 보간</strong>이라고 부릅니다.
          </p>
          <button
            type="button"
            className={styles.resetBtn}
            onClick={() =>
              setPoints([
                { x: -4, y: 2 },
                { x: -2, y: -3 },
                { x: 0, y: 1 },
                { x: 2, y: 4 },
                { x: 4, y: -2 },
              ])
            }
          >
            처음 위치로
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── § 4. 양쪽 끝은 어디로? ─────────────────────────────────
function Section4EndBehavior() {
  // 차수 2,3,4,5 — 최고차 계수 양수일 때
  const cards = [
    { degree: 2, label: '짝수 · 양쪽 위로 ↑↑', coeffs: DEGREE_SAMPLES[2] },
    { degree: 3, label: '홀수 · 왼아래 오른위 ↙↗', coeffs: DEGREE_SAMPLES[3] },
    { degree: 4, label: '짝수 · 양쪽 위로 ↑↑', coeffs: DEGREE_SAMPLES[4] },
    { degree: 5, label: '홀수 · 왼아래 오른위 ↙↗', coeffs: DEGREE_SAMPLES[5] },
  ];

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>4. 양쪽 끝은 어디로 갈까?</h2>
      <p className={styles.lead}>
        화살표만 봐도 짝수 차수와 홀수 차수의 차이를 알 수 있어요.{' '}
        <strong>짝수</strong>는 양쪽이 같은 방향, <strong>홀수</strong>는 반대.
      </p>

      <div className={styles.endCardGrid}>
        {cards.map((c) => {
          const samples = sampleFunction(
            (x) => evaluatePolynomial(c.coeffs, x),
            -5,
            5,
            180,
          );
          return (
            <figure key={c.degree} className={styles.endCard}>
              <div className={styles.endIconWrap}>
                <CoordPlane
                  width={170}
                  height={130}
                  xRange={[-5, 5]}
                  yRange={[-7, 7]}
                  gridTicks={[]}
                  curves={[{ samples, color: '#a78bfa', width: 2.4 }]}
                />
              </div>
              <figcaption>
                <strong>{c.degree}차</strong>
                <span>{c.label}</span>
              </figcaption>
            </figure>
          );
        })}
      </div>
      <p className={styles.note}>
        최고차 계수가 음수면 화살표가 모두 뒤집혀요. (예: y = −x³ → 왼위, 오른아래)
      </p>
    </section>
  );
}

// ─── § 5. 룽게 — 차수만 올리면 위험! ─────────────────────────
function Section5Runge() {
  const [n, setN] = useState<5 | 9 | 13>(9);
  const xRange: [number, number] = [-5, 5];
  const yRange: [number, number] = [-4, 8];

  const truthSamples = useMemo(
    () => sampleFunction(rungeFunction, -5, 5, 200),
    [],
  );

  const pts = useMemo(() => rungePoints(n), [n]);
  const interp = useMemo(() => lagrangeInterpolate(pts), [pts]);
  const interpSamples = useMemo(
    () => sampleFunction(interp, -5, 5, 400),
    [interp],
  );

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>5. 차수만 올리면 위험! (룽게 함정)</h2>
      <p className={styles.lead}>
        <strong>똑같은 함수</strong>를 등간격 점으로 더 많이 찍어 보간해도,
        가장자리에서 곡선이 미친 듯 흔들려요. 차수↑ ≠ 정확도↑
      </p>

      <div className={styles.graphRow}>
        <div className={styles.graphBox}>
          <CoordPlane
            width={380}
            height={380}
            xRange={xRange}
            yRange={yRange}
            gridTicks={[-4, -2, 2, 4]}
            curves={[
              {
                samples: truthSamples,
                color: 'rgba(148, 163, 184, 0.7)',
                width: 2,
                dashed: true,
              },
              {
                samples: interpSamples,
                color: '#f87171',
                width: 2.5,
              },
            ]}
            points={pts.map((p) => ({
              x: p.x,
              y: p.y,
              color: '#fbbf24',
              radius: 5,
            }))}
          />
        </div>

        <div className={styles.controlPanel}>
          <div className={styles.equationBig}>점 {n}개</div>
          <div className={styles.directionChip}>{n - 1}차 보간 다항</div>
          <div className={styles.toggleRow}>
            {[5, 9, 13].map((k) => (
              <button
                key={k}
                type="button"
                className={`${styles.toggleBtn} ${n === k ? styles.toggleActive : ''}`}
                onClick={() => setN(k as 5 | 9 | 13)}
              >
                {k}점
              </button>
            ))}
          </div>
          <p className={styles.note}>
            점선(회색) = 원래 함수 <span className={styles.eq}>5/(1+x²)</span>,
            빨간 곡선 = 등간격 점으로 만든 보간 다항. 점이 많아질수록 가장자리가
            <strong> 폭발</strong>합니다.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── § 6. 자가 점검 ──────────────────────────────────────────
function Section6SelfCheck() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>6. 자가 점검</h2>

      <details className={styles.selfCheck}>
        <summary>Q1. 5차 다항의 굽이는 최대 몇 개일까요?</summary>
        <div className={styles.selfCheckBody}>
          <p className={styles.scA}>정답 — 4개</p>
          <p className={styles.scHint}>차수 N의 굽이는 최대 N−1개. (§ 2 슬라이더로 직접 확인)</p>
        </div>
      </details>

      <details className={styles.selfCheck}>
        <summary>Q2. 점 4개를 모두 지나는 다항의 (최소) 차수는?</summary>
        <div className={styles.selfCheckBody}>
          <p className={styles.scA}>정답 — 3차</p>
          <p className={styles.scHint}>점 N개 → N−1차 다항이 유일. (§ 3 라그랑주 보간)</p>
        </div>
      </details>

      <details className={styles.selfCheck}>
        <summary>Q3. y = −x³ 의 양쪽 끝은 어디로 갈까요?</summary>
        <div className={styles.selfCheckBody}>
          <p className={styles.scA}>정답 — 왼쪽 위 ↖, 오른쪽 아래 ↘</p>
          <p className={styles.scHint}>홀수 차수 + 음수 최고차 계수 → 부호 뒤집힘. (§ 4)</p>
        </div>
      </details>
    </section>
  );
}

// ─── 드래그 가능한 점 N개 오버레이 ──────────────────────────
function DraggablePointsOverlay({
  points,
  onChange,
  xRange,
  yRange,
  width,
  height,
}: {
  points: Point[];
  onChange: (i: number, p: Point) => void;
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
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;
      const px = (e.clientX - rect.left) * scaleX;
      const py = (e.clientY - rect.top) * scaleY;
      const xRaw = xRange[0] + (px / width) * (xRange[1] - xRange[0]);
      const yRaw = yRange[1] - (py / height) * (yRange[1] - yRange[0]);
      // 0.25 단위로 스냅
      const xSnap = Math.round(xRaw * 4) / 4;
      const ySnap = Math.round(yRaw * 4) / 4;
      const x = Math.max(xRange[0], Math.min(xRange[1], xSnap));
      const y = Math.max(yRange[0], Math.min(yRange[1], ySnap));
      onChange(draggingIdx, { x, y });
    };
    const onUp = () => setDraggingIdx(null);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [draggingIdx, onChange, xRange, yRange, width, height]);

  return (
    <svg
      ref={svgRef}
      className={styles.dragLayer}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      {points.map((p, i) => (
        <circle
          key={i}
          cx={projX(p.x)}
          cy={projY(p.y)}
          r={11}
          fill="#f87171"
          stroke="white"
          strokeWidth={2}
          opacity={draggingIdx === i ? 0.95 : 0.85}
          style={{ cursor: draggingIdx === i ? 'grabbing' : 'grab' }}
          onPointerDown={(e) => {
            e.preventDefault();
            setDraggingIdx(i);
          }}
        />
      ))}
    </svg>
  );
}
