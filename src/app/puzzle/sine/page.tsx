'use client';

import { useMemo, useState } from 'react';
import { StoryHeader } from '@/components/StoryHeader';
import { CoordPlane, sampleFunction, type Curve } from '@/components/CoordPlane';
import { UnitCircle } from '@/components/UnitCircle';
import { NATURE_SINES, SPECIAL_ANGLES } from '@/lib/puzzles/sine';
import { SoundLab } from './SoundLab';
import styles from './page.module.css';

type Tab = 'principle' | 'sound';

const STORY =
  '고대 이집트의 거대한 피라미드 ─ *직접 자로 잴 수 없을 만큼* 거대했죠. ' +
  '하지만 옛 측량가들은 *각도 하나와 한 변 길이* 만으로 그 높이를 알아냈습니다. ' +
  '직각삼각형에서 한 각이 정해지면, *나머지 변들 사이의 비율* 이 늘 똑같이 정해진다는 ' +
  '비밀을 발견한 거예요. 그 비밀의 가장 첫째 이름이 *사인(sine)* 입니다.';

export default function SinePage() {
  const [tab, setTab] = useState<Tab>('principle');

  return (
    <div className={styles.container}>
      <StoryHeader
        emoji="🔺"
        title="사인함수"
        subtitle="피라미드의 높이는?"
        story={STORY}
        coreMath={['sin θ = 대변 / 빗변', '단위원', '주기·진폭', '음파']}
      />

      <nav className={styles.tabs} role="tablist" aria-label="사인함수 학습 탭">
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
          aria-selected={tab === 'sound'}
          className={`${styles.tab} ${tab === 'sound' ? styles.tabActive : ''}`}
          onClick={() => setTab('sound')}
        >
          🎵 음파 실험실
        </button>
      </nav>

      {tab === 'principle' && (
        <main className={styles.principleTab}>
          <Section1Ratio />
          <Section2Angle />
          <Section3UnitCircle />
          <Section4Nature />
          <Section5SelfCheck />
          <CallToGame onClick={() => setTab('sound')} />
        </main>
      )}

      {tab === 'sound' && <SoundLab />}
    </div>
  );
}

function CallToGame({ onClick }: { onClick: () => void }) {
  return (
    <div className={styles.cta}>
      <h3>🎵 이제 진짜 *소리* 로 사인을 들어볼 시간!</h3>
      <p>
        주파수와 진폭을 조절해 단일 사인음을 만들고, 두 사인을 합쳐 화음과
        맥놀이까지 체험해 보세요. 헤드폰을 끼면 더 잘 들려요.
      </p>
      <button type="button" className={styles.ctaBtn} onClick={onClick}>
        음파 실험실 들어가기
      </button>
    </div>
  );
}

// ─── § 1. 사인은 *비율* ────────────────────────────────────
function Section1Ratio() {
  const [scale, setScale] = useState(1);
  // 30-60-90 직각삼각형: 빗변 6, 대변 3, 인접 3√3
  const baseAngle = 30; // °
  const hyp = 6 * scale;
  const opp = hyp * Math.sin((baseAngle * Math.PI) / 180);
  const adj = hyp * Math.cos((baseAngle * Math.PI) / 180);

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>1. 사인은 *비율* 이에요</h2>
      <p className={styles.lead}>
        직각삼각형에서 한 각{' '}
        <span className={styles.eq}>θ = {baseAngle}°</span> 를 골라요. 그 각의{' '}
        <strong>맞은편 변</strong>(대변) 길이를 <strong>빗변</strong> 길이로
        나눈 값이 <strong className={styles.kw}>sin θ</strong>. 삼각형을 키우거나
        줄여도 *비율은 똑같이* 유지돼요 (닮음).
      </p>

      <div className={styles.graphRow}>
        <div className={styles.triangleBox}>
          <RightTriangle hyp={hyp} opp={opp} adj={adj} angleDeg={baseAngle} />
        </div>
        <div className={styles.controlPanel}>
          <div className={styles.valueBig}>
            sin {baseAngle}° = {opp.toFixed(2)} / {hyp.toFixed(2)} ={' '}
            {(opp / hyp).toFixed(3)}
          </div>
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabel}>
              <span>삼각형 크기</span>
              <span className={styles.sliderValue}>×{scale.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={1.6}
              step={0.1}
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
          <p className={styles.note}>
            크기를 바꿔도 <span className={styles.eq}>sin 30° = 0.5</span> 그대로!
            각도가 같으면 변의 비율은 변하지 않아요.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── § 2. 각도가 바뀌면 비율도 바뀐다 ─────────────────────
function Section2Angle() {
  const [angle, setAngle] = useState(45);
  const rad = (angle * Math.PI) / 180;
  const sinV = Math.sin(rad);
  const hyp = 4;
  const opp = hyp * sinV;
  const adj = hyp * Math.cos(rad);

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>2. 각도가 바뀌면 *비율* 도 바뀌어요</h2>
      <p className={styles.lead}>
        같은 빗변(<span className={styles.eq}>4</span>)이지만 각도가 커지면
        대변이 길어지고, sin 값도 같이 커져요. 0°일 때는 0, 90°일 때는 1까지.
      </p>

      <div className={styles.graphRow}>
        <div className={styles.triangleBox}>
          <RightTriangle hyp={hyp} opp={opp} adj={adj} angleDeg={angle} />
        </div>
        <div className={styles.controlPanel}>
          <div className={styles.valueBig}>
            sin {angle}° = {sinV.toFixed(3)}
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
                <th>sin θ</th>
              </tr>
            </thead>
            <tbody>
              {SPECIAL_ANGLES.map((s) => {
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
        </div>
      </div>
    </section>
  );
}

// ─── § 3. 단위원의 마법 (보너스) ────────────────────────────
function Section3UnitCircle() {
  const [angle, setAngle] = useState(60);
  const sinV = Math.sin((angle * Math.PI) / 180);

  const wave = useMemo<Curve[]>(() => {
    const samples = sampleFunction((x) => Math.sin(x), -Math.PI, 3 * Math.PI, 360);
    return [{ samples, color: '#f472b6', width: 2.6 }];
  }, []);

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        3. 단위원이 만드는 *파동* (보너스)
      </h2>
      <p className={styles.lead}>
        반지름 1짜리 단위원 위에서 점을 *돌리면*, 그 점의 *세로 좌표(y)* 가
        바로 sin θ. 각도가 0°→360°로 도는 동안 y좌표는{' '}
        <span className={styles.eq}>0 → 1 → 0 → −1 → 0</span> 의 파동을 그려요 —
        이게 *사인 곡선* 의 정체.
      </p>

      <div className={styles.graphRow}>
        <div className={styles.graphBox}>
          <UnitCircle
            angleDeg={angle}
            size={280}
            showSin
            showTrail
          />
        </div>
        <div className={styles.controlPanel}>
          <div className={styles.valueBig}>
            θ = {angle}° → sin θ = {sinV.toFixed(3)}
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
            90° 넘으면 점이 *위쪽에서 왼쪽* 으로 가요. 180°에서 다시 0,
            270°에서는 −1까지 내려갑니다.
          </p>
        </div>
      </div>

      <div className={styles.graphRow}>
        <div className={styles.graphBox} style={{ flex: '1 1 100%' }}>
          <CoordPlane
            width={640}
            height={220}
            xRange={[-Math.PI, 3 * Math.PI]}
            yRange={[-1.4, 1.4]}
            gridTicks={[]}
            curves={wave}
            points={[
              {
                x: (angle * Math.PI) / 180,
                y: sinV,
                color: '#fbbf24',
                radius: 7,
              },
            ]}
          />
        </div>
      </div>
    </section>
  );
}

// ─── § 4. 자연 속의 사인 ────────────────────────────────────
function Section4Nature() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>4. 자연 속 어디나 *사인*</h2>
      <p className={styles.lead}>
        파도·소리·시계추·전기 ─ 위아래로 반복하는 거의 모든 것은 사인 곡선의
        모양이거나, 사인 여러 개의 합이에요.
      </p>
      <div className={styles.natureGrid}>
        {NATURE_SINES.map((n) => (
          <div
            key={n.title}
            className={styles.natureCard}
            style={{ borderColor: `${n.accent}55` }}
          >
            <span className={styles.natureEmoji}>{n.emoji}</span>
            <span className={styles.natureTitle} style={{ color: n.accent }}>
              {n.title}
            </span>
            <span className={styles.natureDesc}>{n.desc}</span>
          </div>
        ))}
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
        <summary>Q1. 빗변이 10, 대변이 5인 직각삼각형의 sin θ 는?</summary>
        <div className={styles.selfCheckBody}>
          <p className={styles.scA}>정답 — 0.5 (= 5/10)</p>
          <p className={styles.scHint}>
            sin = 대변/빗변. θ 는 30°. § 1 의 정의.
          </p>
        </div>
      </details>

      <details className={styles.selfCheck}>
        <summary>Q2. sin 90° = ?</summary>
        <div className={styles.selfCheckBody}>
          <p className={styles.scA}>정답 — 1</p>
          <p className={styles.scHint}>
            직각삼각형에서 한 각이 90°에 다가가면 대변 = 빗변, 비율 1. 단위원에선
            점이 가장 위로 (§ 2 · § 3)
          </p>
        </div>
      </details>

      <details className={styles.selfCheck}>
        <summary>Q3. 사인 곡선이 0이 되는 각도는? (한 주기에서 두 번)</summary>
        <div className={styles.selfCheckBody}>
          <p className={styles.scA}>정답 — 0°, 180° (그리고 360° 에서 다시 0)</p>
          <p className={styles.scHint}>
            단위원에서 점이 x축 위에 있을 때 y좌표 = 0. § 3 의 사인 곡선이 가로축을
            끊는 지점.
          </p>
        </div>
      </details>
    </section>
  );
}

// ─── 직각삼각형 SVG ─────────────────────────────────
function RightTriangle({
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
  // 스케일: adj와 opp 의 px 길이
  const maxLen = Math.max(adj, opp, 4);
  const scale = Math.min((W - PAD * 2) / maxLen, (H - PAD * 2) / maxLen);
  const adjPx = adj * scale;
  const oppPx = opp * scale;
  // 왼쪽 아래 (직각)
  const x0 = PAD;
  const y0 = H - PAD;
  const xA = x0 + adjPx; // 오른쪽 아래
  const yA = y0;
  const xB = x0; // 왼쪽 위 (수직 위로)
  const yB = y0 - oppPx;
  // 빗변 끝점 = (xA, yA) 와 (xB, yB) — angleDeg 는 (xA에서의 각도)

  // 빗변 표시점은 (xA, yA) 와 (xB, yB) 사이
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <pattern id="rightAngle" width="8" height="8" patternUnits="userSpaceOnUse" />
      </defs>

      {/* 직각 표시 (작은 정사각형) */}
      <rect
        x={x0}
        y={y0 - 12}
        width={12}
        height={12}
        fill="none"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth={1.2}
      />

      {/* 대변 (수직, 분홍) */}
      <line
        x1={xB}
        y1={yB}
        x2={x0}
        y2={y0}
        stroke="#f472b6"
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      <text
        x={x0 - 8}
        y={(yB + y0) / 2}
        fill="#f472b6"
        fontSize={12}
        fontWeight="bold"
        textAnchor="end"
        dominantBaseline="middle"
      >
        대변 {opp.toFixed(1)}
      </text>

      {/* 인접변 (수평) */}
      <line
        x1={x0}
        y1={y0}
        x2={xA}
        y2={yA}
        stroke="#94a3b8"
        strokeWidth={3}
        strokeLinecap="round"
      />
      <text
        x={(x0 + xA) / 2}
        y={y0 + 16}
        fill="#94a3b8"
        fontSize={12}
        fontWeight="bold"
        textAnchor="middle"
      >
        인접변 {adj.toFixed(1)}
      </text>

      {/* 빗변 (노랑) */}
      <line
        x1={xA}
        y1={yA}
        x2={xB}
        y2={yB}
        stroke="#fbbf24"
        strokeWidth={3.5}
        strokeLinecap="round"
      />
      <text
        x={(xA + xB) / 2 + 14}
        y={(yA + yB) / 2 - 8}
        fill="#fbbf24"
        fontSize={12}
        fontWeight="bold"
      >
        빗변 {hyp.toFixed(1)}
      </text>

      {/* 각도 호 (오른쪽 아래 꼭짓점 xA, yA) */}
      <path
        d={(() => {
          const r = 22;
          const start = { x: xA - r, y: yA };
          const a = (angleDeg * Math.PI) / 180;
          const end = {
            x: xA - r * Math.cos(a),
            y: yA - r * Math.sin(a),
          };
          return `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`;
        })()}
        fill="none"
        stroke="#fbbf24"
        strokeWidth={1.8}
        opacity={0.85}
      />
      <text
        x={xA - 28}
        y={yA - 8}
        fill="#fbbf24"
        fontSize={12}
        fontWeight="bold"
      >
        θ {angleDeg}°
      </text>
    </svg>
  );
}
