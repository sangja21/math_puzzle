'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { StoryHeader } from '@/components/StoryHeader';
import { CoordPlane, sampleFunction, type Curve } from '@/components/CoordPlane';
import {
  evaluateQuadratic,
  vertex as computeVertex,
  roots as computeRoots,
  formatQuadratic,
  BASIC_TABLE_X,
  ROOT_EXAMPLES,
} from '@/lib/puzzles/quadraticFunction';
import styles from './page.module.css';

type Tab = 'principle' | 'cannon';

const STORY =
  '자기 한계를 모르고 무모하게 도전했다가 결국 큰코다친 청년의 이야기. ' +
  '위로 올라간 것은 반드시 어느 한 점을 정점으로 다시 떨어진다 — ' +
  '이 *최고점* 의 비밀이 곧 이차함수의 핵심입니다.';

export default function QuadraticFunctionPage() {
  const [tab, setTab] = useState<Tab>('principle');

  return (
    <div className={styles.container}>
      <StoryHeader
        emoji="📈"
        title="이차함수의 원리"
        subtitle="큰코다친 청년 이야기"
        story={STORY}
        coreMath={['y = ax² + bx + c', '포물선', '꼭짓점', '근']}
      />

      <nav
        className={styles.tabs}
        role="tablist"
        aria-label="이차함수 학습 탭"
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
          aria-selected={tab === 'cannon'}
          className={`${styles.tab} ${tab === 'cannon' ? styles.tabActive : ''}`}
          onClick={() => setTab('cannon')}
        >
          🎯 포탄쏘기
        </button>
      </nav>

      {tab === 'principle' && (
        <PrincipleTab onGoToCannon={() => setTab('cannon')} />
      )}
      {tab === 'cannon' && <CannonTab />}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 원리 탭
// ════════════════════════════════════════════════════════════════

function PrincipleTab({ onGoToCannon }: { onGoToCannon: () => void }) {
  return (
    <div className={styles.principleTab}>
      <Section1Intro />
      <Section2Basic />
      <Section3SlopeA />
      <Section4ShiftC />
      <Section5Vertex />
      <Section6Roots />
      <CallToCannon onClick={onGoToCannon} />
    </div>
  );
}

// ─── § 1. 포물선이란? ────────────────────────────────────────────
function Section1Intro() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>1. 포물선이란?</h2>
      <p className={styles.lead}>
        공중으로 던진 공이 그리는 자취, 분수에서 솟는 물줄기, 다리의 아치 ─
        이 모양들에는 공통점이 있어요. 모두{' '}
        <strong className={styles.kw}>포물선</strong>이라는 같은 곡선을 따라
        움직입니다.
      </p>
      <div className={styles.iconCardGrid}>
        <IconCard
          label="분수"
          caption="물 입자가 중력 때문에 포물선을 그려요"
          svg={<FountainSvg />}
        />
        <IconCard
          label="농구공"
          caption="던진 공의 궤적은 항상 포물선"
          svg={<BasketballSvg />}
        />
        <IconCard
          label="다리 아치"
          caption="견고한 다리는 포물선 모양으로 설계해요"
          svg={<ArchBridgeSvg />}
        />
        <IconCard
          label="포탄"
          caption="발사된 포탄은 포물선을 그리며 날아갑니다"
          svg={<CannonSvg />}
        />
      </div>
      <SelfCheck
        question="다음 중 포물선이 아닌 것은?"
        choices={[
          '분수에서 솟구치는 물',
          '똑바로 떨어지는 빗방울',
          '던진 농구공',
        ]}
        answerIndex={1}
        hint="포물선은 위로 올라가다 다시 내려오는 곡선이에요. 직선은 포물선이 아니에요."
      />
    </section>
  );
}

function IconCard({
  label,
  caption,
  svg,
}: {
  label: string;
  caption: string;
  svg: React.ReactNode;
}) {
  return (
    <figure className={styles.iconCard}>
      <div className={styles.iconWrap}>{svg}</div>
      <figcaption>
        <strong>{label}</strong>
        <span>{caption}</span>
      </figcaption>
    </figure>
  );
}

// 자체 SVG 일러스트 4종 (단순화)
function FountainSvg() {
  return (
    <svg viewBox="0 0 120 100" aria-hidden="true">
      {/* 수반 */}
      <path
        d="M20 80 L100 80 L90 95 L30 95 Z"
        fill="rgba(96,165,250,0.25)"
        stroke="#60a5fa"
        strokeWidth={1.5}
      />
      {/* 분출 노즐 */}
      <rect x={56} y={70} width={8} height={10} fill="#60a5fa" />
      {/* 두 갈래 물줄기 (포물선) */}
      <path
        d="M60 70 Q40 30 25 60"
        fill="none"
        stroke="#93c5fd"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <path
        d="M60 70 Q80 30 95 60"
        fill="none"
        stroke="#93c5fd"
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      {/* 물방울 */}
      <circle cx={28} cy={56} r={2} fill="#93c5fd" />
      <circle cx={92} cy={56} r={2} fill="#93c5fd" />
      <circle cx={45} cy={42} r={2} fill="#93c5fd" />
      <circle cx={75} cy={42} r={2} fill="#93c5fd" />
    </svg>
  );
}

function BasketballSvg() {
  return (
    <svg viewBox="0 0 120 100" aria-hidden="true">
      {/* 사람 */}
      <circle cx={20} cy={70} r={5} fill="#fbbf24" />
      <line x1={20} y1={75} x2={20} y2={92} stroke="#fbbf24" strokeWidth={2} />
      <line x1={20} y1={80} x2={28} y2={70} stroke="#fbbf24" strokeWidth={2} />
      {/* 골대 */}
      <line
        x1={108}
        y1={45}
        x2={108}
        y2={92}
        stroke="#94a3b8"
        strokeWidth={2}
      />
      <rect
        x={92}
        y={42}
        width={16}
        height={3}
        fill="none"
        stroke="#f87171"
        strokeWidth={2}
      />
      {/* 궤적 (포물선) */}
      <path
        d="M28 70 Q60 15 100 50"
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
      {/* 공 */}
      <circle cx={60} cy={28} r={4} fill="#fb923c" />
      <line x1={60} y1={24} x2={60} y2={32} stroke="#7c2d12" strokeWidth={1} />
      <line x1={56} y1={28} x2={64} y2={28} stroke="#7c2d12" strokeWidth={1} />
    </svg>
  );
}

function ArchBridgeSvg() {
  return (
    <svg viewBox="0 0 120 100" aria-hidden="true">
      {/* 강 */}
      <rect x={0} y={75} width={120} height={25} fill="rgba(96,165,250,0.15)" />
      <path
        d="M0 78 Q30 75 60 78 T120 78"
        fill="none"
        stroke="#60a5fa"
        strokeWidth={1}
      />
      {/* 다리 상판 */}
      <rect x={10} y={32} width={100} height={6} fill="#94a3b8" />
      {/* 아치 */}
      <path
        d="M15 38 Q60 5 105 38"
        fill="none"
        stroke="#cbd5e1"
        strokeWidth={3}
      />
      {/* 기둥 (수직선) */}
      <line x1={30} y1={32} x2={30} y2={75} stroke="#94a3b8" strokeWidth={1} />
      <line x1={60} y1={32} x2={60} y2={75} stroke="#94a3b8" strokeWidth={1} />
      <line x1={90} y1={32} x2={90} y2={75} stroke="#94a3b8" strokeWidth={1} />
    </svg>
  );
}

function CannonSvg() {
  return (
    <svg viewBox="0 0 120 100" aria-hidden="true">
      {/* 지면 */}
      <line
        x1={0}
        y1={92}
        x2={120}
        y2={92}
        stroke="rgba(255,255,255,0.4)"
        strokeWidth={1}
      />
      {/* 대포 받침 */}
      <rect x={5} y={80} width={20} height={12} fill="#475569" />
      <circle cx={10} cy={92} r={3} fill="#1e293b" />
      <circle cx={20} cy={92} r={3} fill="#1e293b" />
      {/* 포신 (각도 30°) */}
      <rect
        x={12}
        y={66}
        width={20}
        height={6}
        fill="#64748b"
        transform="rotate(-30 22 69)"
      />
      {/* 궤적 */}
      <path
        d="M30 60 Q65 15 105 80"
        fill="none"
        stroke="#fbbf24"
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
      {/* 포탄 */}
      <circle cx={65} cy={28} r={4} fill="#f87171" />
      {/* 표적 */}
      <line x1={108} y1={92} x2={108} y2={78} stroke="#dc2626" strokeWidth={2} />
      <circle cx={108} cy={78} r={3} fill="#dc2626" />
    </svg>
  );
}

// ─── § 2. y = x² ───────────────────────────────────────────────
function Section2Basic() {
  const [hoverX, setHoverX] = useState<number | null>(null);
  const curve: Curve = useMemo(
    () => ({
      samples: sampleFunction((x) => x * x, -5, 5, 100),
      color: '#60a5fa',
      width: 3,
    }),
    [],
  );
  const points = useMemo(
    () =>
      BASIC_TABLE_X.map((x) => ({
        x,
        y: x * x,
        color: hoverX === x ? '#fbbf24' : '#93c5fd',
        radius: hoverX === x ? 8 : 5,
      })),
    [hoverX],
  );

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        2. <span className={styles.eq}>y = x²</span> ─ 가장 단순한 포물선
      </h2>
      <p className={styles.lead}>
        모든 포물선의 원형은 <strong className={styles.kw}>y = x²</strong>.
        x에 어떤 수를 넣든 y는 그 수의 *제곱*. -3을 넣어도 +3을 넣어도 y는 9.
        그래서 그래프가 y축을 기준으로 <strong>좌우 대칭</strong>이 됩니다.
      </p>
      <div className={styles.graphRow}>
        <div className={styles.graphBox}>
          <CoordPlane
            curves={[curve]}
            points={points}
            xRange={[-5, 5]}
            yRange={[-2, 12]}
            gridTicks={[-4, -2, 2, 4, 6, 8, 10]}
            width={340}
            height={300}
          />
        </div>
        <div className={styles.tableBox}>
          <table className={styles.fnTable}>
            <thead>
              <tr>
                <th>x</th>
                <th>y = x²</th>
              </tr>
            </thead>
            <tbody>
              {BASIC_TABLE_X.map((x) => (
                <tr
                  key={x}
                  onMouseEnter={() => setHoverX(x)}
                  onMouseLeave={() => setHoverX(null)}
                  className={hoverX === x ? styles.rowHover : ''}
                >
                  <td>{x}</td>
                  <td>{x * x}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <SelfCheck
        question="y = x² 그래프에서 (-3, ?) 의 ? 는 얼마일까요?"
        answerText="9 — (-3) × (-3) = 9 (음수 두 개를 곱하면 양수)"
      />
    </section>
  );
}

// ─── § 3. a 가 바꾸는 것 ─────────────────────────────────────────
function Section3SlopeA() {
  const [a, setA] = useState(1);

  const curves: Curve[] = useMemo(() => {
    const base: Curve = {
      samples: sampleFunction((x) => x * x, -5, 5, 100),
      color: 'rgba(255,255,255,0.25)',
      width: 1.5,
      dashed: true,
    };
    const aLine: Curve = {
      samples: sampleFunction((x) => a * x * x, -5, 5, 100),
      color: '#60a5fa',
      width: 3,
    };
    return [base, aLine];
  }, [a]);

  const direction =
    a > 0 ? '위로 볼록 (∪)' : a < 0 ? '아래로 볼록 (∩)' : '직선!';

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        3. <span className={styles.eq}>a</span> 가 바꾸는 것
      </h2>
      <p className={styles.lead}>
        <span className={styles.eq}>y = ax²</span> 의 <strong>a</strong> 는
        포물선의 <strong>가파름</strong>을 정해요. a 가 클수록 가파르고,
        a 가 0보다 작으면 그래프가 <strong>뒤집혀</strong> 아래로 떨어져요.
      </p>
      <div className={styles.graphRow}>
        <div className={styles.graphBox}>
          <CoordPlane
            curves={curves}
            xRange={[-5, 5]}
            yRange={[-12, 12]}
            gridTicks={[-10, -5, 5, 10]}
            width={340}
            height={300}
          />
        </div>
        <div className={styles.controlPanel}>
          <div className={styles.equationBig}>{formatQuadratic(a, 0, 0)}</div>
          <SliderRow
            label="a"
            value={a}
            setValue={setA}
            min={-3}
            max={3}
            step={0.5}
          />
          <div className={styles.directionChip}>{direction}</div>
          <p className={styles.note}>
            점선은 <span className={styles.kw}>y = x²</span> (a=1) 비교용.
          </p>
        </div>
      </div>
      <SelfCheck
        question="a = -2 일 때 그래프는 어느 쪽으로 볼록할까요?"
        answerText="아래로 (∩ 모양). a < 0 이면 그래프가 뒤집혀요."
      />
    </section>
  );
}

// ─── § 4. c 가 바꾸는 것 ─────────────────────────────────────────
function Section4ShiftC() {
  const [c, setC] = useState(0);

  const curves: Curve[] = useMemo(() => {
    const base: Curve = {
      samples: sampleFunction((x) => x * x, -5, 5, 100),
      color: 'rgba(255,255,255,0.25)',
      width: 1.5,
      dashed: true,
    };
    const cLine: Curve = {
      samples: sampleFunction((x) => x * x + c, -5, 5, 100),
      color: '#34d399',
      width: 3,
    };
    return [base, cLine];
  }, [c]);

  const points = useMemo(
    () => [
      { x: 0, y: c, color: '#fbbf24', label: `(0, ${c})` },
    ],
    [c],
  );

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        4. <span className={styles.eq}>c</span> 가 바꾸는 것
      </h2>
      <p className={styles.lead}>
        <span className={styles.eq}>y = x² + c</span> 의 <strong>c</strong> 는
        그래프 <strong>전체</strong> 를 위·아래로 옮겨요. c 가 +3 이면 위로 3칸,
        -2 이면 아래로 2칸. 모양은 그대로, 자리만 달라집니다.
      </p>
      <div className={styles.graphRow}>
        <div className={styles.graphBox}>
          <CoordPlane
            curves={curves}
            points={points}
            xRange={[-5, 5]}
            yRange={[-8, 12]}
            gridTicks={[-6, -4, -2, 2, 4, 6, 8, 10]}
            width={340}
            height={300}
          />
        </div>
        <div className={styles.controlPanel}>
          <div className={styles.equationBig}>{formatQuadratic(1, 0, c)}</div>
          <SliderRow
            label="c"
            value={c}
            setValue={setC}
            min={-5}
            max={5}
            step={1}
          />
          <p className={styles.note}>
            노란 점은 <strong>y절편</strong> ─ 그래프가 y축과 만나는 점이에요.
          </p>
        </div>
      </div>
      <SelfCheck
        question="y = x² + 4 가 y축과 만나는 점은?"
        answerText="(0, 4) — x=0 을 넣으면 y = 0 + 4 = 4"
      />
    </section>
  );
}

// ─── § 5. 꼭짓점 (마우스 드래그) ──────────────────────────────────
function Section5Vertex() {
  const [a, setA] = useState(1);
  const [v, setV] = useState({ x: 0, y: 0 });

  const curves: Curve[] = useMemo(
    () => [
      {
        samples: sampleFunction((x) => a * (x - v.x) ** 2 + v.y, -10, 10, 200),
        color: '#a78bfa',
        width: 3,
      },
    ],
    [a, v.x, v.y],
  );

  const points = useMemo(
    () => [
      {
        x: v.x,
        y: v.y,
        color: '#f87171',
        label: `꼭짓점 (${v.x}, ${v.y})`,
        radius: 8,
      },
    ],
    [v.x, v.y],
  );

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        5. 꼭짓점 ─ 가장 높거나 낮은 자리
      </h2>
      <p className={styles.lead}>
        포탄이 <strong>가장 높이</strong> 올라간 그 한 점을{' '}
        <strong className={styles.kw}>꼭짓점</strong>이라고 해요.
        a &gt; 0 이면 꼭짓점은 <strong>최저점</strong>, a &lt; 0 이면{' '}
        <strong>최고점</strong>이 됩니다. 빨간 점을 마우스로 드래그해
        포물선을 옮겨보세요.
      </p>
      <div className={styles.graphRow}>
        <div className={styles.graphBoxRel}>
          <CoordPlane
            curves={curves}
            points={points}
            xRange={[-10, 10]}
            yRange={[-10, 10]}
            width={380}
            height={380}
          />
          <DraggableVertexOverlay
            value={v}
            onChange={setV}
            xRange={[-10, 10]}
            yRange={[-10, 10]}
            width={380}
            height={380}
            step={1}
          />
        </div>
        <div className={styles.controlPanel}>
          <div className={styles.equationBig}>
            y = {a === 1 ? '' : a === -1 ? '−' : `${a}`}
            (x {v.x >= 0 ? `− ${v.x}` : `+ ${-v.x}`})²{' '}
            {v.y === 0 ? '' : v.y > 0 ? `+ ${v.y}` : `− ${-v.y}`}
          </div>
          <SliderRow
            label="a"
            value={a}
            setValue={setA}
            min={-2}
            max={2}
            step={0.5}
          />
          <p className={styles.note}>
            빨간 점을 드래그해 꼭짓점 (h, k) 위치를 바꿔보세요.
          </p>
        </div>
      </div>
      <SelfCheck
        question="y = x² + 4 의 꼭짓점은 어디일까요?"
        answerText="(0, 4) — x² = (x − 0)² 이고 +4 만큼 위로 이동했으니 꼭짓점은 (0, 4)"
      />
    </section>
  );
}

// 마우스 드래그 가능한 꼭짓점 오버레이 (CoordPlane 위에 절대 배치)
function DraggableVertexOverlay({
  value,
  onChange,
  xRange,
  yRange,
  width,
  height,
  step,
}: {
  value: { x: number; y: number };
  onChange: (v: { x: number; y: number }) => void;
  xRange: [number, number];
  yRange: [number, number];
  width: number;
  height: number;
  step: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);

  const projX = (x: number) =>
    ((x - xRange[0]) / (xRange[1] - xRange[0])) * width;
  const projY = (y: number) =>
    height - ((y - yRange[0]) / (yRange[1] - yRange[0])) * height;

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const scaleX = width / rect.width;
      const scaleY = height / rect.height;
      const px = (e.clientX - rect.left) * scaleX;
      const py = (e.clientY - rect.top) * scaleY;
      const xRaw = xRange[0] + (px / width) * (xRange[1] - xRange[0]);
      const yRaw = yRange[1] - (py / height) * (yRange[1] - yRange[0]);
      const xSnap = Math.round(xRaw / step) * step;
      const ySnap = Math.round(yRaw / step) * step;
      const x = Math.max(xRange[0], Math.min(xRange[1], xSnap));
      const y = Math.max(yRange[0], Math.min(yRange[1], ySnap));
      onChange({ x, y });
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging, onChange, xRange, yRange, width, height, step]);

  return (
    <svg
      ref={svgRef}
      className={styles.dragLayer}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
    >
      <circle
        cx={projX(value.x)}
        cy={projY(value.y)}
        r={12}
        fill="#f87171"
        stroke="white"
        strokeWidth={2}
        opacity={dragging ? 0.95 : 0.85}
        style={{ cursor: dragging ? 'grabbing' : 'grab' }}
        onMouseDown={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
      />
    </svg>
  );
}

// ─── § 6. x절편(근) ────────────────────────────────────────────
function Section6Roots() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>6. x절편 ─ 포탄이 떨어지는 자리</h2>
      <p className={styles.lead}>
        포탄이 <strong>땅에 떨어지는 자리</strong> ─ 그래프가 x축과 만나는 점을{' '}
        <strong className={styles.kw}>x절편</strong> 또는{' '}
        <strong className={styles.kw}>근</strong>이라고 해요. 한 번도 안 닿을
        수도, 살짝 스칠 수도, 두 번 닿을 수도 있어요.
      </p>
      <div className={styles.rootCardGrid}>
        {ROOT_EXAMPLES.map((ex) => (
          <RootCard key={ex.label} a={ex.a} b={ex.b} c={ex.c} title={ex.label} />
        ))}
      </div>
      <SelfCheck
        question="y = x² + 4 의 근은 몇 개일까요?"
        answerText="0개 — 그래프가 x축 위에만 있어서 만나지 않아요."
      />
    </section>
  );
}

function RootCard({
  a,
  b,
  c,
  title,
}: {
  a: number;
  b: number;
  c: number;
  title: string;
}) {
  const r = computeRoots(a, b, c);
  const curve: Curve = {
    samples: sampleFunction((x) => evaluateQuadratic(a, b, c, x), -5, 5, 100),
    color: '#60a5fa',
    width: 2.5,
  };
  const points: { x: number; y: number; color: string; label?: string }[] = [];
  if (r.count === 1) {
    points.push({ x: r.x, y: 0, color: '#fbbf24', label: `${r.x}` });
  } else if (r.count === 2) {
    points.push({ x: r.x1, y: 0, color: '#fbbf24', label: `${r.x1}` });
    points.push({ x: r.x2, y: 0, color: '#fbbf24', label: `${r.x2}` });
  }
  return (
    <div className={styles.rootCard}>
      <div className={styles.rootCardHeader}>
        <span className={styles.rootCardTitle}>{title}</span>
        <span className={styles.rootCardEq}>{formatQuadratic(a, b, c)}</span>
      </div>
      <CoordPlane
        curves={[curve]}
        points={points}
        xRange={[-5, 5]}
        yRange={[-5, 8]}
        gridTicks={[-4, -2, 2, 4, 6]}
        width={220}
        height={180}
      />
    </div>
  );
}

// ─── 게임 탭 진입 CTA ─────────────────────────────────────────
function CallToCannon({ onClick }: { onClick: () => void }) {
  return (
    <section className={styles.cta}>
      <h3>이제 직접 해볼 시간!</h3>
      <p>
        포탄을 발사해서 표적을 맞혀보세요. 발사각과 초속을 바꾸면 포탄의 궤적이
        어떻게 변할까요? 꼭짓점은 어디가 될까요?
      </p>
      <button className={styles.ctaBtn} onClick={onClick}>
        🎯 포탄쏘기 시작
      </button>
    </section>
  );
}

// ════════════════════════════════════════════════════════════════
// 포탄쏘기 게임 탭 (다음 단계에서 구현)
// ════════════════════════════════════════════════════════════════

function CannonTab() {
  return (
    <div className={styles.cannonTab}>
      <div className={styles.placeholder}>
        <span className={styles.placeholderEmoji}>🚧</span>
        <h2>포탄쏘기 게임 — 준비 중</h2>
        <p>
          기획문서{' '}
          <code>docs/curriculum/01-quadratic-function.md</code> 의 *후보 1
          포탄 표적 맞히기* 컨셉으로 구현 예정입니다. 지금은 원리 탭에서
          포물선의 비밀을 먼저 익혀보세요.
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 공통 위젯
// ════════════════════════════════════════════════════════════════

function SliderRow({
  label,
  value,
  setValue,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  setValue: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <div className={styles.sliderGroup}>
      <div className={styles.sliderRow}>
        <span className={styles.sliderLabel}>
          <span className={styles.varName}>{label}</span> = {value}
        </span>
      </div>
      <input
        type="range"
        className={styles.slider}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
      />
      <div className={styles.sliderHint}>
        {min} ~ {max} (간격 {step})
      </div>
    </div>
  );
}

function SelfCheck({
  question,
  choices,
  answerIndex,
  answerText,
  hint,
}: {
  question: string;
  choices?: string[];
  answerIndex?: number;
  answerText?: string;
  hint?: string;
}) {
  return (
    <details className={styles.selfCheck}>
      <summary>🔍 자가 점검 — 클릭해서 정답 보기</summary>
      <div className={styles.selfCheckBody}>
        <p className={styles.scQ}>
          <strong>Q.</strong> {question}
        </p>
        {choices && (
          <ul className={styles.scChoices}>
            {choices.map((c, i) => (
              <li
                key={i}
                className={i === answerIndex ? styles.scAnswer : ''}
              >
                {c}
                {i === answerIndex && (
                  <span className={styles.scAnswerTag}>← 정답</span>
                )}
              </li>
            ))}
          </ul>
        )}
        {answerText && (
          <p className={styles.scA}>
            <strong>A.</strong> {answerText}
          </p>
        )}
        {hint && <p className={styles.scHint}>💡 {hint}</p>}
      </div>
    </details>
  );
}
