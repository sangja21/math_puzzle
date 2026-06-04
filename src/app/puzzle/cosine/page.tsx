'use client';

import { useMemo, useState } from 'react';
import { StoryHeader } from '@/components/StoryHeader';
import { CoordPlane, sampleFunction, type Curve } from '@/components/CoordPlane';
import { UnitCircle } from '@/components/UnitCircle';
import { SPECIAL_COS, lawOfCosines } from '@/lib/puzzles/cosine';
import { SurveyMission } from './SurveyMission';
import styles from './page.module.css';

type Tab = 'principle' | 'survey';

const DEG = Math.PI / 180;

const STORY =
  '달까지의 거리를 *자로 잴 수 있을까요?* 물론 불가능하죠. 하지만 옛 천문학자들은 ' +
  '지구 위 *멀리 떨어진 두 곳* 에서 같은 순간 달을 바라본 *각도의 미세한 차이* 만으로 ' +
  '그 거리를 알아냈습니다. 두 관측점 사이 거리(기선)와 각도 두 개 — 삼각형 하나가 ' +
  '완성되면 나머지는 *비율의 마법* 이 해결해요. 그 마법의 둘째 이름이 *코사인(cosine)* 입니다.';

export default function CosinePage() {
  const [tab, setTab] = useState<Tab>('principle');

  return (
    <div className={styles.container}>
      <StoryHeader
        emoji="🌙"
        title="코사인함수"
        subtitle="지구에서 달까지의 거리"
        story={STORY}
        coreMath={['cos θ = 인접변 / 빗변', 'sin과 90° 차이', 'cos²+sin²=1', '코사인 법칙']}
      />

      <nav className={styles.tabs} role="tablist" aria-label="코사인함수 학습 탭">
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
          aria-selected={tab === 'survey'}
          className={`${styles.tab} ${tab === 'survey' ? styles.tabActive : ''}`}
          onClick={() => setTab('survey')}
        >
          🔭 관측 미션
        </button>
      </nav>

      {tab === 'principle' && (
        <main className={styles.principleTab}>
          <Section1Ratio />
          <Section2Sibling />
          <Section3UnitCircle />
          <Section4LawOfCosines />
          <Section5SelfCheck />
          <CallToGame onClick={() => setTab('survey')} />
        </main>
      )}

      {tab === 'survey' && <SurveyMission />}
    </div>
  );
}

function CallToGame({ onClick }: { onClick: () => void }) {
  return (
    <div className={styles.cta}>
      <h3>🔭 이제 *진짜 측량사* 가 될 시간!</h3>
      <p>
        운동장의 깃발부터 지구에서 달까지 — 망원경으로 각도 두 개만 재서 직접 잴
        수 없는 거리를 알아내 보세요.
      </p>
      <button type="button" className={styles.ctaBtn} onClick={onClick}>
        관측 미션 시작하기
      </button>
    </div>
  );
}

// ─── § 1. 코사인은 사인의 형제 ──────────────────────────────
function Section1Ratio() {
  const [angle, setAngle] = useState(60);
  const rad = angle * DEG;
  const hyp = 4;
  const opp = hyp * Math.sin(rad);
  const adj = hyp * Math.cos(rad);

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>1. 코사인은 사인의 *형제* 예요</h2>
      <p className={styles.lead}>
        사인이 <strong>맞은편 변</strong>(대변)을 빗변으로 나눈 값이라면, 코사인은
        각에 <strong>붙어 있는 변</strong>(인접변)을 빗변으로 나눈 값.{' '}
        <strong className={styles.kw}>cos θ = 인접변 / 빗변</strong>. 같은
        삼각형에서 sin·cos 이 *형제처럼 나란히* 사는 거죠.
      </p>

      <div className={styles.graphRow}>
        <div className={styles.triangleBox}>
          <RightTriangleCos hyp={hyp} opp={opp} adj={adj} angleDeg={angle} />
        </div>
        <div className={styles.controlPanel}>
          <div className={styles.valueBig}>
            cos {angle}° = {adj.toFixed(2)} / {hyp.toFixed(2)} ={' '}
            {(adj / hyp).toFixed(3)}
          </div>
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabel}>
              <span>각도 θ</span>
              <span className={styles.sliderValue}>{angle}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={90}
              step={1}
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
          <table className={styles.specialTable}>
            <thead>
              <tr>
                <th>θ</th>
                <th>cos θ</th>
              </tr>
            </thead>
            <tbody>
              {SPECIAL_COS.map((s) => {
                const match = Math.abs(s.deg - angle) <= 2;
                return (
                  <tr key={s.deg}>
                    <td className={match ? styles.match : ''}>{s.deg}°</td>
                    <td className={match ? styles.match : ''}>{s.label}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className={styles.note}>
            사인과 *반대로* — 각도가 커질수록 인접변이 짧아져서 cos 값은 1에서
            0으로 *줄어들어요*.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── § 2. 사인과 90° 차이 ──────────────────────────────────
function Section2Sibling() {
  const [shift, setShift] = useState(0);
  const matched = shift === 90;

  const curves = useMemo<Curve[]>(() => {
    const cosCurve = sampleFunction((x) => Math.cos(x), -Math.PI, 3 * Math.PI, 360);
    const sinShift = sampleFunction(
      (x) => Math.sin(x + shift * DEG),
      -Math.PI,
      3 * Math.PI,
      360,
    );
    return [
      { samples: cosCurve, color: '#34d399', width: 3 },
      { samples: sinShift, color: '#f472b6', width: 2.2 },
    ];
  }, [shift]);

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>2. 사인을 *90° 밀면* 코사인</h2>
      <p className={styles.lead}>
        <span className={styles.cosEq}>초록 곡선이 코사인</span>,{' '}
        <span className={styles.eq}>분홍 곡선이 사인</span>. 사인 곡선을 슬라이더로
        왼쪽으로 밀어 보세요. 정확히 <strong>90°</strong> 밀면 코사인과 *완전히
        포개져요* — 두 함수는 같은 파동의 *출발점만 다른* 형제니까요.
      </p>

      <div className={styles.graphRow}>
        <div className={styles.graphBox} style={{ flex: '1 1 100%' }}>
          <CoordPlane
            width={640}
            height={220}
            xRange={[-Math.PI, 3 * Math.PI]}
            yRange={[-1.4, 1.4]}
            gridTicks={[]}
            curves={curves}
          />
        </div>
      </div>

      <div className={styles.graphRow}>
        <div className={styles.controlPanel} style={{ flex: '1 1 100%' }}>
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabel}>
              <span>사인 곡선 밀기</span>
              <span className={styles.sliderValue}>{shift}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={180}
              step={5}
              value={shift}
              onChange={(e) => setShift(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
          {matched ? (
            <div className={styles.matchBanner}>
              🎉 일치! <span className={styles.eqLight}>cos x = sin(x + 90°)</span>
            </div>
          ) : (
            <p className={styles.note}>
              현재 <span className={styles.eq}>sin(x + {shift}°)</span> — 아직
              코사인과 어긋나 있어요.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── § 3. 단위원 — cos²+sin²=1 ─────────────────────────────
function Section3UnitCircle() {
  const [angle, setAngle] = useState(40);
  const rad = angle * DEG;
  const cosV = Math.cos(rad);
  const sinV = Math.sin(rad);

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        3. 단위원 위의 점은 *(cos θ, sin θ)*
      </h2>
      <p className={styles.lead}>
        반지름 1짜리 단위원 위 점의 <strong>가로 좌표(x)가 cos θ</strong>,
        세로 좌표(y)가 sin θ. 그런데 단위원의 정의가{' '}
        <span className={styles.eq}>x² + y² = 1</span> 이니까 —{' '}
        <strong className={styles.kw}>cos²θ + sin²θ = 1</strong> 이 *공짜로*
        따라와요. 피타고라스 정리의 친척이죠.
      </p>

      <div className={styles.graphRow}>
        <div className={styles.graphBox}>
          <UnitCircle angleDeg={angle} size={280} showSin showCos />
        </div>
        <div className={styles.controlPanel}>
          <div className={styles.valueBig}>
            ({cosV.toFixed(3)})² + ({sinV.toFixed(3)})² ={' '}
            {(cosV * cosV + sinV * sinV).toFixed(3)}
          </div>
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabel}>
              <span>각도 θ</span>
              <span className={styles.sliderValue}>{angle}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              step={5}
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
          <p className={styles.note}>
            어떤 각도에서도 합은 늘 <strong>1</strong>. 초록(cos)이 줄면
            분홍(sin)이 늘어나며 *정확히 보충* 해요.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── § 4. 코사인 법칙 ──────────────────────────────────────
function Section4LawOfCosines() {
  const [a, setA] = useState(5);
  const [b, setB] = useState(7);
  const [gamma, setGamma] = useState(60);
  const c = lawOfCosines(a, b, gamma);
  const isRight = gamma === 90;

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>4. 코사인 법칙 — *삼각형 풀기*</h2>
      <p className={styles.lead}>
        직각이 없는 삼각형도 두 변 <span className={styles.eq}>a, b</span> 와
        사잇각 <span className={styles.eq}>C</span> 만 알면 나머지 변을 구할 수
        있어요: <strong className={styles.kw}>c² = a² + b² − 2ab·cos C</strong>.
        삼각측량의 심장이 되는 식이에요.
      </p>

      <div className={styles.graphRow}>
        <div className={styles.triangleBox}>
          <SasTriangle a={a} b={b} gammaDeg={gamma} c={c} />
        </div>
        <div className={styles.controlPanel}>
          <div className={styles.valueBig}>
            c² = {a}² + {b}² − 2·{a}·{b}·cos {gamma}° → c ≈ {c.toFixed(2)}
          </div>
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabel}>
              <span>변 a</span>
              <span className={styles.sliderValue}>{a}</span>
            </div>
            <input
              type="range"
              min={2}
              max={9}
              step={1}
              value={a}
              onChange={(e) => setA(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabel}>
              <span>변 b</span>
              <span className={styles.sliderValue}>{b}</span>
            </div>
            <input
              type="range"
              min={2}
              max={9}
              step={1}
              value={b}
              onChange={(e) => setB(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabel}>
              <span>사잇각 C</span>
              <span className={styles.sliderValue}>{gamma}°</span>
            </div>
            <input
              type="range"
              min={20}
              max={160}
              step={5}
              value={gamma}
              onChange={(e) => setGamma(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
          {isRight ? (
            <div className={styles.matchBanner}>
              📐 C = 90° → cos 90° = 0 → <span className={styles.eqLight}>c² = a² + b²</span>{' '}
              피타고라스 정리!
            </div>
          ) : (
            <p className={styles.note}>
              C 를 90°에 맞춰 보세요 — 익숙한 정리가 *숨어* 있어요.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── § 5. 자가 점검 ──────────────────────────────────────────
function Section5SelfCheck() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>5. 자가 점검</h2>

      <details className={styles.selfCheck}>
        <summary>Q1. cos 60° = ?</summary>
        <div className={styles.selfCheckBody}>
          <p className={styles.scA}>정답 — 0.5 (= 1/2)</p>
          <p className={styles.scHint}>
            § 1 의 특수각 표. sin 30° 와 같은 값 — 형제 관계의 증거이기도 해요.
          </p>
        </div>
      </details>

      <details className={styles.selfCheck}>
        <summary>Q2. sin θ = 0.6 일 때, cos θ 가 될 수 있는 값은?</summary>
        <div className={styles.selfCheckBody}>
          <p className={styles.scA}>정답 — ±0.8</p>
          <p className={styles.scHint}>
            cos²θ = 1 − 0.6² = 0.64 (§ 3 의 cos²+sin²=1). 단위원의 왼쪽 절반에선
            음수도 가능해요.
          </p>
        </div>
      </details>

      <details className={styles.selfCheck}>
        <summary>
          Q3. 두 변이 5, 7 이고 사잇각이 60° 인 삼각형의 나머지 변은?
        </summary>
        <div className={styles.selfCheckBody}>
          <p className={styles.scA}>정답 — √39 ≈ 6.24</p>
          <p className={styles.scHint}>
            c² = 25 + 49 − 2·5·7·cos 60° = 74 − 35 = 39 (§ 4 코사인 법칙). § 4 의
            기본 슬라이더 값과 같은 삼각형!
          </p>
        </div>
      </details>
    </section>
  );
}

// ─── 직각삼각형 SVG (인접변 강조) ───────────────────────────
function RightTriangleCos({
  hyp,
  opp,
  adj,
  angleDeg,
}: {
  hyp: number;
  opp: number;
  adj: number;
  angleDeg: number;
}) {
  const W = 300;
  const H = 220;
  const PAD = 28;
  const maxLen = Math.max(adj, opp, 4);
  const scale = Math.min((W - PAD * 2) / maxLen, (H - PAD * 2) / maxLen);
  const adjPx = adj * scale;
  const oppPx = opp * scale;
  // θ 꼭짓점을 왼쪽 아래에 — 인접변이 수평으로 붙도록
  const x0 = PAD; // θ 꼭짓점
  const y0 = H - PAD;
  const xR = x0 + adjPx; // 직각 꼭짓점 (오른쪽 아래)
  const yR = y0;
  const xT = xR; // 위 꼭짓점
  const yT = y0 - oppPx;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {/* 직각 표시 (오른쪽 아래) */}
      <rect
        x={xR - 12}
        y={yR - 12}
        width={12}
        height={12}
        fill="none"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth={1.2}
      />

      {/* 인접변 (수평, 초록 — 주인공) */}
      <line
        x1={x0}
        y1={y0}
        x2={xR}
        y2={yR}
        stroke="#34d399"
        strokeWidth={4}
        strokeLinecap="round"
      />
      <text
        x={(x0 + xR) / 2}
        y={y0 + 16}
        fill="#34d399"
        fontSize={12}
        fontWeight="bold"
        textAnchor="middle"
      >
        인접변 {adj.toFixed(1)}
      </text>

      {/* 대변 (수직, 회색) */}
      <line
        x1={xR}
        y1={yR}
        x2={xT}
        y2={yT}
        stroke="#94a3b8"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <text
        x={xR + 8}
        y={(yR + yT) / 2}
        fill="#94a3b8"
        fontSize={12}
        fontWeight="bold"
        dominantBaseline="middle"
      >
        대변 {opp.toFixed(1)}
      </text>

      {/* 빗변 (노랑) */}
      <line
        x1={x0}
        y1={y0}
        x2={xT}
        y2={yT}
        stroke="#fbbf24"
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      <text
        x={(x0 + xT) / 2 - 14}
        y={(y0 + yT) / 2 - 10}
        fill="#fbbf24"
        fontSize={12}
        fontWeight="bold"
        textAnchor="end"
      >
        빗변 {hyp.toFixed(1)}
      </text>

      {/* 각도 호 (θ 꼭짓점) */}
      <path
        d={(() => {
          const r = 24;
          const start = { x: x0 + r, y: y0 };
          const aR = angleDeg * DEG;
          const end = { x: x0 + r * Math.cos(aR), y: y0 - r * Math.sin(aR) };
          return `M ${start.x} ${start.y} A ${r} ${r} 0 0 0 ${end.x} ${end.y}`;
        })()}
        fill="none"
        stroke="#34d399"
        strokeWidth={1.8}
        opacity={0.85}
      />
      <text x={x0 + 30} y={y0 - 8} fill="#34d399" fontSize={12} fontWeight="bold">
        θ {angleDeg}°
      </text>
    </svg>
  );
}

// ─── SAS 삼각형 SVG (코사인 법칙) ───────────────────────────
function SasTriangle({
  a,
  b,
  gammaDeg,
  c,
}: {
  a: number;
  b: number;
  gammaDeg: number;
  c: number;
}) {
  const W = 300;
  const H = 230;
  const PAD = 30;
  const gRad = gammaDeg * DEG;
  // C 꼭짓점 원점, 변 b 가 +x 방향 → A, 변 a 가 각 C 방향 → B
  const A = { x: b, y: 0 };
  const B = { x: a * Math.cos(gRad), y: a * Math.sin(gRad) };
  const minX = Math.min(0, A.x, B.x);
  const maxX = Math.max(0, A.x, B.x);
  const maxY = Math.max(A.y, B.y, 0.1);
  const scale = Math.min((W - PAD * 2) / (maxX - minX), (H - PAD * 2) / maxY);
  const tx = (x: number) => PAD + (x - minX) * scale;
  const ty = (y: number) => H - PAD - y * scale;

  const Cp = { x: tx(0), y: ty(0) };
  const Ap = { x: tx(A.x), y: ty(A.y) };
  const Bp = { x: tx(B.x), y: ty(B.y) };

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {/* 변 b (C–A, 초록) */}
      <line
        x1={Cp.x}
        y1={Cp.y}
        x2={Ap.x}
        y2={Ap.y}
        stroke="#34d399"
        strokeWidth={3.2}
        strokeLinecap="round"
      />
      <text
        x={(Cp.x + Ap.x) / 2}
        y={Cp.y + 16}
        fill="#34d399"
        fontSize={12}
        fontWeight="bold"
        textAnchor="middle"
      >
        b = {b}
      </text>

      {/* 변 a (C–B, 분홍) */}
      <line
        x1={Cp.x}
        y1={Cp.y}
        x2={Bp.x}
        y2={Bp.y}
        stroke="#f472b6"
        strokeWidth={3.2}
        strokeLinecap="round"
      />
      <text
        x={(Cp.x + Bp.x) / 2 - 10}
        y={(Cp.y + Bp.y) / 2 - 6}
        fill="#f472b6"
        fontSize={12}
        fontWeight="bold"
        textAnchor="end"
      >
        a = {a}
      </text>

      {/* 변 c (A–B, 노랑 — 구하는 변) */}
      <line
        x1={Ap.x}
        y1={Ap.y}
        x2={Bp.x}
        y2={Bp.y}
        stroke="#fbbf24"
        strokeWidth={3.6}
        strokeLinecap="round"
        strokeDasharray="7 5"
      />
      <text
        x={(Ap.x + Bp.x) / 2 + 10}
        y={(Ap.y + Bp.y) / 2}
        fill="#fbbf24"
        fontSize={13}
        fontWeight="bold"
      >
        c ≈ {c.toFixed(2)}
      </text>

      {/* 사잇각 호 */}
      <path
        d={(() => {
          const r = 22;
          const start = { x: Cp.x + r, y: Cp.y };
          const end = {
            x: Cp.x + r * Math.cos(gRad),
            y: Cp.y - r * Math.sin(gRad),
          };
          return `M ${start.x} ${start.y} A ${r} ${r} 0 ${gammaDeg > 180 ? 1 : 0} 0 ${end.x} ${end.y}`;
        })()}
        fill="none"
        stroke="#a78bfa"
        strokeWidth={2}
        opacity={0.9}
      />
      <text
        x={Cp.x + 28}
        y={Cp.y - 10}
        fill="#a78bfa"
        fontSize={12}
        fontWeight="bold"
      >
        C = {gammaDeg}°
      </text>

      {/* 꼭짓점 */}
      {[Cp, Ap, Bp].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4.5} fill="#e2e8f0" />
      ))}
    </svg>
  );
}
