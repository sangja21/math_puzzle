'use client';

import { useState } from 'react';
import { StoryHeader } from '@/components/StoryHeader';
import { UnitCircle } from '@/components/UnitCircle';
import { SPECIAL_TAN, SLOPE_STANDARDS, slopePercent } from '@/lib/puzzles/tangent';
import { ThalesMission } from './ThalesMission';
import styles from './page.module.css';

type Tab = 'principle' | 'thales';

const DEG = Math.PI / 180;

const STORY =
  'BC 6세기, 그리스의 현자 탈레스가 이집트를 여행할 때 파라오가 물었습니다. ' +
  '"저 대피라미드의 높이를 알 수 있겠소?" 탈레스는 사다리도 줄자도 없이 *막대기 하나* 를 ' +
  '땅에 꽂았어요. 그리고 말했죠 — "막대기의 그림자가 막대기 길이와 같아지는 순간, ' +
  '피라미드의 그림자도 피라미드의 높이와 같습니다." *같은 시각, 모든 그림자의 비율은 같다* — ' +
  '이 한 줄의 통찰이 훗날 *탄젠트(tangent)* 가 되었습니다.';

export default function TangentPage() {
  const [tab, setTab] = useState<Tab>('principle');

  return (
    <div className={styles.container}>
      <StoryHeader
        emoji="🔺"
        title="탄젠트함수"
        subtitle="탈레스와 피라미드의 비밀"
        story={STORY}
        coreMath={['tan θ = 대변 / 인접변', '닮음과 비례', 'tan = sin ÷ cos', '경사도(%)']}
      />

      <nav className={styles.tabs} role="tablist" aria-label="탄젠트함수 학습 탭">
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
          aria-selected={tab === 'thales'}
          className={`${styles.tab} ${tab === 'thales' ? styles.tabActive : ''}`}
          onClick={() => setTab('thales')}
        >
          🌅 탈레스 미션
        </button>
      </nav>

      {tab === 'principle' && (
        <main className={styles.principleTab}>
          <Section1Similar />
          <Section2Shadow />
          <Section3SinCos />
          <Section4Slope />
          <Section5SelfCheck />
          <CallToGame onClick={() => setTab('thales')} />
        </main>
      )}

      {tab === 'thales' && <ThalesMission />}
    </div>
  );
}

function CallToGame({ onClick }: { onClick: () => void }) {
  return (
    <div className={styles.cta}>
      <h3>🌅 이제 *탈레스* 가 될 시간!</h3>
      <p>
        마당의 나무부터 쿠푸 대피라미드까지 — 줄자로 그림자만 재서 거대한 것들의
        높이를 알아내 보세요.
      </p>
      <button type="button" className={styles.ctaBtn} onClick={onClick}>
        탈레스 미션 시작하기
      </button>
    </div>
  );
}

// ─── § 1. 닮은 삼각형의 비밀 ────────────────────────────────
function Section1Similar() {
  const [angle, setAngle] = useState(35);
  const tanV = Math.tan(angle * DEG);

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>1. 닮은 삼각형의 *비밀*</h2>
      <p className={styles.lead}>
        같은 각도의 직각삼각형은 크기가 달라도 *같은 모양* (닮음). 그래서{' '}
        <strong>높이 ÷ 밑변</strong> 의 비가 셋 다 *똑같아요*. 이 비율의 이름이{' '}
        <strong className={styles.kw}>tan θ = 대변 / 인접변</strong>.
      </p>

      <div className={styles.graphRow}>
        <div className={styles.triangleBox}>
          <SimilarTriangles angleDeg={angle} />
        </div>
        <div className={styles.controlPanel}>
          <div className={styles.valueBig}>
            tan {angle}° = {tanV.toFixed(3)} — 셋 다 같은 비!
          </div>
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabel}>
              <span>각도 θ</span>
              <span className={styles.sliderValue}>{angle}°</span>
            </div>
            <input
              type="range"
              min={15}
              max={65}
              step={1}
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
          <p className={styles.note}>
            각도가 정해지면 크기와 상관없이 비율이 *하나로* 정해져요 — 탈레스
            마법의 원천.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── § 2. 그림자의 마법 ─────────────────────────────────────
function Section2Shadow() {
  const [sunDeg, setSunDeg] = useState(30);
  const tanV = Math.tan(sunDeg * DEG);
  const myH = 1.6;
  const treeH = 8;
  const myShadow = myH / tanV;
  const treeShadow = treeH / tanV;

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>2. 그림자의 마법 — *탈레스의 통찰*</h2>
      <p className={styles.lead}>
        해는 너무 멀어서 *모두에게 같은 각도* 로 빛을 보내요. 그래서 같은 시각엔
        사람이든 나무든 <strong>높이 ÷ 그림자</strong> 비가 똑같죠. 내 그림자만
        재면 나무의 키를 알 수 있는 이유!
      </p>

      <div className={styles.graphRow}>
        <div className={styles.triangleBox}>
          <ShadowScene sunDeg={sunDeg} myH={myH} treeH={treeH} />
        </div>
        <div className={styles.controlPanel}>
          <div className={styles.valueBig}>
            {myH}m / {myShadow.toFixed(1)}m = {treeH}m / {treeShadow.toFixed(1)}m
            = {tanV.toFixed(2)}
          </div>
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabel}>
              <span>☀️ 태양 고도</span>
              <span className={styles.sliderValue}>{sunDeg}°</span>
            </div>
            <input
              type="range"
              min={15}
              max={70}
              step={1}
              value={sunDeg}
              onChange={(e) => setSunDeg(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
          <p className={styles.note}>
            아침·저녁(낮은 해)엔 그림자가 길고 정오(높은 해)엔 짧아요 — 하지만
            *비는 언제나 같이* 변해요.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── § 3. tan = sin ÷ cos + 점근선 ─────────────────────────
function Section3SinCos() {
  const [angle, setAngle] = useState(45);
  const rad = angle * DEG;
  const sinV = Math.sin(rad);
  const cosV = Math.cos(rad);
  const tanV = Math.tan(rad);
  const nearAsymptote = angle >= 84;

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>3. 탄젠트 = 사인 ÷ 코사인</h2>
      <p className={styles.lead}>
        대변/인접변 = (대변/빗변) ÷ (인접변/빗변) — 그래서{' '}
        <strong className={styles.kw}>tan θ = sin θ ÷ cos θ</strong>. 단위원에선
        반지름을 *오른쪽 벽(x=1)까지 연장* 했을 때 닿는 높이가 tan θ 예요.
      </p>

      <div className={styles.graphRow}>
        <div className={styles.graphBox}>
          <UnitCircle angleDeg={angle} size={280} showSin showCos showTan />
        </div>
        <div className={styles.controlPanel}>
          <div className={styles.valueBig}>
            tan {angle}° = {sinV.toFixed(3)} ÷ {cosV.toFixed(3)} ={' '}
            {tanV > 999 ? '∞?!' : tanV.toFixed(3)}
          </div>
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabel}>
              <span>각도 θ</span>
              <span className={styles.sliderValue}>{angle}°</span>
            </div>
            <input
              type="range"
              min={0}
              max={89}
              step={1}
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
          {nearAsymptote ? (
            <div className={styles.warnBanner}>
              ⚠️ 90°에 가까워지면 cos θ → 0. *0으로 나누기 직전* — tan 이
              하늘로 폭발해요! (이 벽을 <strong>점근선</strong> 이라 불러요)
            </div>
          ) : (
            <table className={styles.specialTable}>
              <thead>
                <tr>
                  <th>θ</th>
                  <th>tan θ</th>
                </tr>
              </thead>
              <tbody>
                {SPECIAL_TAN.map((s) => {
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
          )}
        </div>
      </div>
    </section>
  );
}

// ─── § 4. 일상 속 탄젠트 — 경사도 ──────────────────────────
function Section4Slope() {
  const [angle, setAngle] = useState(5);
  const pct = slopePercent(angle);

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>4. 일상 속 탄젠트 — *경사도(%)*</h2>
      <p className={styles.lead}>
        도로 표지판의 <strong>8%</strong> 는 *100m 가면 8m 올라간다* 는 뜻 —
        바로 <span className={styles.eq}>tan θ × 100</span> 이에요. 각도를
        바꿔가며 어떤 시설까지 통과할 수 있는지 확인해 보세요.
      </p>

      <div className={styles.graphRow}>
        <div className={styles.triangleBox}>
          <SlopeRamp angleDeg={angle} pct={pct} />
        </div>
        <div className={styles.controlPanel}>
          <div className={styles.valueBig}>
            tan {angle}° × 100 = 경사 {pct.toFixed(1)}%
          </div>
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabel}>
              <span>경사각 θ</span>
              <span className={styles.sliderValue}>{angle}°</span>
            </div>
            <input
              type="range"
              min={1}
              max={50}
              step={1}
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
          <div className={styles.slopeCards}>
            {SLOPE_STANDARDS.map((s) => {
              const ok = pct <= s.maxPct;
              return (
                <div
                  key={s.name}
                  className={`${styles.slopeCard} ${ok ? styles.slopeOk : styles.slopeNo}`}
                  title={s.desc}
                >
                  <span>
                    {s.emoji} {s.name} ({s.maxPct}%)
                  </span>
                  <span>{ok ? '✅ 통과' : '🚫 초과'}</span>
                </div>
              );
            })}
          </div>
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
        <summary>Q1. tan 45° = ?</summary>
        <div className={styles.selfCheckBody}>
          <p className={styles.scA}>정답 — 1</p>
          <p className={styles.scHint}>
            45° 직각삼각형은 대변 = 인접변 (§ 1). 그림자와 키가 같아지는 탈레스의
            바로 그 순간!
          </p>
        </div>
      </details>

      <details className={styles.selfCheck}>
        <summary>Q2. 8% 경사도는 약 몇 도일까?</summary>
        <div className={styles.selfCheckBody}>
          <p className={styles.scA}>정답 — 약 4.6°</p>
          <p className={styles.scHint}>
            tan θ = 0.08 인 θ (§ 4). 생각보다 *훨씬 완만* 하죠 — 그런데도
            고속도로에선 오르막 차로가 생겨요.
          </p>
        </div>
      </details>

      <details className={styles.selfCheck}>
        <summary>
          Q3. 내 키 1m, 내 그림자 2m. 나무 그림자가 12m 라면 나무의 키는?
        </summary>
        <div className={styles.selfCheckBody}>
          <p className={styles.scA}>정답 — 6m</p>
          <p className={styles.scHint}>
            높이/그림자 비가 같으니 1/2 = ?/12 (§ 2). 탈레스 미션에서 직접 해
            보세요!
          </p>
        </div>
      </details>
    </section>
  );
}

// ─── 닮은 직각삼각형 3개 SVG ────────────────────────────────
function SimilarTriangles({ angleDeg }: { angleDeg: number }) {
  const W = 320;
  const H = 230;
  const PAD = 26;
  const tanV = Math.tan(angleDeg * DEG);
  // 가장 큰 삼각형의 밑변을 영역에 맞춤
  const maxBase = (W - PAD * 2) / 1;
  const maxHeight = H - PAD * 2;
  const baseBig = Math.min(maxBase, maxHeight / tanV);
  const sizes = [1, 0.62, 0.34];
  const colors = ['#fb923c', '#fbbf24', '#fde68a'];
  const x0 = PAD;
  const y0 = H - PAD;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {sizes.map((s, i) => {
        const b = baseBig * s;
        const h = b * tanV;
        return (
          <g key={i}>
            <polygon
              points={`${x0},${y0} ${x0 + b},${y0} ${x0 + b},${y0 - h}`}
              fill={`${colors[i]}22`}
              stroke={colors[i]}
              strokeWidth={2.2}
              strokeLinejoin="round"
            />
            <text
              x={x0 + b + 4}
              y={y0 - h / 2}
              fill={colors[i]}
              fontSize={11}
              fontWeight="bold"
            >
              {(h / b).toFixed(2)}
            </text>
          </g>
        );
      })}
      {/* 공통 각도 호 */}
      <path
        d={(() => {
          const r = 30;
          const a = angleDeg * DEG;
          return `M ${x0 + r} ${y0} A ${r} ${r} 0 0 0 ${x0 + r * Math.cos(a)} ${y0 - r * Math.sin(a)}`;
        })()}
        fill="none"
        stroke="#fb923c"
        strokeWidth={2}
      />
      <text x={x0 + 36} y={y0 - 9} fill="#fb923c" fontSize={12} fontWeight="bold">
        θ {angleDeg}°
      </text>
      <text
        x={x0}
        y={PAD - 6}
        fill="rgba(248,250,252,0.65)"
        fontSize={11}
      >
        높이÷밑변 — 세 삼각형 모두 같은 값
      </text>
    </svg>
  );
}

// ─── 사람·나무 그림자 SVG ───────────────────────────────────
function ShadowScene({
  sunDeg,
  myH,
  treeH,
}: {
  sunDeg: number;
  myH: number;
  treeH: number;
}) {
  const W = 320;
  const H = 230;
  const PAD = 22;
  const tanV = Math.tan(sunDeg * DEG);
  const myShadow = myH / tanV;
  const treeShadow = treeH / tanV;
  // 장면 폭: 나무(원점) 그림자 + 사람 위치 + 사람 그림자
  const personX = treeShadow + 2.5;
  const sceneW = personX + myShadow + 1.5;
  const sceneH = treeH * 1.18;
  const k = Math.min((W - PAD * 2) / sceneW, (H - PAD * 2) / sceneH);
  const sx = (x: number) => PAD + x * k;
  const groundY = H - PAD;
  const sy = (y: number) => groundY - y * k;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {/* 해 */}
      <text x={W - 30} y={26} fontSize={20}>
        ☀️
      </text>
      {/* 지면 */}
      <line
        x1={PAD - 8}
        y1={groundY}
        x2={W - PAD + 8}
        y2={groundY}
        stroke="rgba(248,250,252,0.45)"
        strokeWidth={2}
      />
      {/* 나무 그림자 */}
      <line
        x1={sx(0)}
        y1={groundY + 3}
        x2={sx(treeShadow)}
        y2={groundY + 3}
        stroke="rgba(15,23,42,0.85)"
        strokeWidth={5}
        strokeLinecap="round"
      />
      {/* 나무 */}
      <line
        x1={sx(0)}
        y1={groundY}
        x2={sx(0)}
        y2={sy(treeH * 0.62)}
        stroke="#92400e"
        strokeWidth={5}
      />
      <circle cx={sx(0)} cy={sy(treeH * 0.78)} r={treeH * 0.24 * k} fill="#16a34a" />
      {/* 빛줄기 (나무 꼭대기 → 그림자 끝) */}
      <line
        x1={sx(0)}
        y1={sy(treeH)}
        x2={sx(treeShadow)}
        y2={groundY}
        stroke="#fbbf24"
        strokeWidth={1.4}
        strokeDasharray="5 4"
        opacity={0.8}
      />
      {/* 사람 그림자 */}
      <line
        x1={sx(personX)}
        y1={groundY + 3}
        x2={sx(personX + myShadow)}
        y2={groundY + 3}
        stroke="rgba(15,23,42,0.85)"
        strokeWidth={4}
        strokeLinecap="round"
      />
      {/* 사람 */}
      <text x={sx(personX)} y={groundY - 2} fontSize={Math.max(myH * k, 12)} textAnchor="middle">
        🧍
      </text>
      {/* 빛줄기 (머리 → 그림자 끝) */}
      <line
        x1={sx(personX)}
        y1={sy(myH)}
        x2={sx(personX + myShadow)}
        y2={groundY}
        stroke="#fbbf24"
        strokeWidth={1.4}
        strokeDasharray="5 4"
        opacity={0.8}
      />
      {/* 라벨 */}
      <text
        x={sx(treeShadow / 2)}
        y={groundY + 16}
        fill="#fca5a5"
        fontSize={10}
        textAnchor="middle"
      >
        {treeShadow.toFixed(1)}m
      </text>
      <text
        x={sx(personX + myShadow / 2)}
        y={groundY + 16}
        fill="#fca5a5"
        fontSize={10}
        textAnchor="middle"
      >
        {myShadow.toFixed(1)}m
      </text>
    </svg>
  );
}

// ─── 경사로 SVG ─────────────────────────────────────────────
function SlopeRamp({ angleDeg, pct }: { angleDeg: number; pct: number }) {
  const W = 320;
  const H = 200;
  const PAD = 26;
  const runPx = W - PAD * 2;
  const risePx = Math.min(runPx * Math.tan(angleDeg * DEG), H - PAD * 2);
  const x0 = PAD;
  const y0 = H - PAD;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {/* 경사면 */}
      <polygon
        points={`${x0},${y0} ${x0 + runPx},${y0} ${x0 + runPx},${y0 - risePx}`}
        fill="rgba(251,146,60,0.16)"
        stroke="#fb923c"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {/* 수평 100 */}
      <text
        x={x0 + runPx / 2}
        y={y0 + 16}
        fill="rgba(248,250,252,0.7)"
        fontSize={11}
        textAnchor="middle"
      >
        수평 100
      </text>
      {/* 수직 상승 */}
      <text
        x={x0 + runPx + 6}
        y={y0 - risePx / 2}
        fill="#fbbf24"
        fontSize={11}
        fontWeight="bold"
      >
        ↑ {pct.toFixed(1)}
      </text>
      {/* 휠체어/차 이모지 — 경사면 위 */}
      <text
        x={x0 + runPx * 0.45}
        y={y0 - runPx * 0.45 * Math.tan(angleDeg * DEG) - 8}
        fontSize={18}
        textAnchor="middle"
        transform={`rotate(${-angleDeg} ${x0 + runPx * 0.45} ${y0 - runPx * 0.45 * Math.tan(angleDeg * DEG) - 8})`}
      >
        {pct <= 8 ? '♿' : pct <= 48 ? '🚂' : '🎢'}
      </text>
      <text x={x0 + 34} y={y0 - 8} fill="#fb923c" fontSize={12} fontWeight="bold">
        θ {angleDeg}°
      </text>
    </svg>
  );
}
