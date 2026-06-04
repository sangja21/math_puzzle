'use client';

import { useMemo, useState } from 'react';
import { StoryHeader } from '@/components/StoryHeader';
import { CoordPlane, sampleFunction, type Curve } from '@/components/CoordPlane';
import {
  AREA_MISSIONS,
  AX_MIN,
  AX_MAX,
  N_STEPS,
  midpointSum,
  archTriangles,
  archSum,
} from '@/lib/puzzles/integral';
import { AreaSurvey, AreaSvg } from './AreaSurvey';
import styles from './page.module.css';

type Tab = 'principle' | 'survey';

const HILL = AREA_MISSIONS[1]; // 포물선 언덕 — 원리 탭 공용 예제

const STORY =
  '곧은 변으로 둘러싸인 땅이라면 넓이를 금방 재죠. 그런데 *곡선으로 굽은 땅* 이라면? ' +
  'BC 250년 아르키메데스는 곡선 안에 삼각형을 채우고, 빈틈에 더 작은 삼각형을, ' +
  '또 그 빈틈에 더더 작은 삼각형을… *무한히* 채워 나갔습니다. ' +
  '잘게 쪼갤수록 정답에 가까워진다 — 이 실진법(method of exhaustion)의 정신이 ' +
  '2,000년 뒤 *적분(integral)* 이라는 이름을 얻었습니다.';

export default function IntegralPage() {
  const [tab, setTab] = useState<Tab>('principle');

  return (
    <div className={styles.container}>
      <StoryHeader
        emoji="🏛️"
        title="적분"
        subtitle="잘게 쪼갤수록 정확해진다"
        story={STORY}
        coreMath={['구분구적법', '잘게 쪼개기 → 극한', '아르키메데스 4/3', '미분 ↔ 적분 (FTC)']}
      />

      <nav className={styles.tabs} role="tablist" aria-label="적분 학습 탭">
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
          🎯 면적 측량사
        </button>
      </nav>

      {tab === 'principle' && (
        <main className={styles.principleTab}>
          <Section1OneRect />
          <Section2Refine />
          <Section3Archimedes />
          <Section4Ftc />
          <Section5SelfCheck />
          <CallToGame onClick={() => setTab('survey')} />
        </main>
      )}

      {tab === 'survey' && <AreaSurvey />}
    </div>
  );
}

function CallToGame({ onClick }: { onClick: () => void }) {
  return (
    <div className={styles.cta}>
      <h3>🎯 이제 *면적 측량사* 가 될 시간!</h3>
      <p>
        모눈을 세서 곡선 아래 면적을 추정하고, 직사각형 부대를 출동시켜 검증
        — 잔디밭부터 아르키메데스의 포물선까지.
      </p>
      <button type="button" className={styles.ctaBtn} onClick={onClick}>
        면적 측량사 시작하기
      </button>
    </div>
  );
}

// ─── § 1. 곡선 아래 면적 — 어떻게 잴까? ────────────────────
function Section1OneRect() {
  const oneRect = midpointSum(HILL, 1);
  const errPct = ((oneRect - HILL.exact) / HILL.exact) * 100;

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>1. 곡선 아래 면적 — *어떻게 잴까?*</h2>
      <p className={styles.lead}>
        직사각형이면 <span className={styles.eq}>가로 × 세로</span> 로 끝. 그런데
        포물선 언덕처럼 *위가 굽어 있으면*? 일단 거칠게 — 직사각형{' '}
        <strong>딱 1개</strong> 로 어림해 봅시다.
      </p>

      <div className={styles.graphRow}>
        <div className={styles.graphBox}>
          <AreaSvg mission={HILL} n={1} showGrid={false} />
        </div>
        <div className={styles.controlPanel}>
          <div className={styles.valueBig}>
            직사각형 1개 = 8 × 4 = {oneRect.toFixed(0)} (실제: {HILL.exact.toFixed(2)})
          </div>
          <p className={styles.note}>
            가운데 높이(4)로 세운 직사각형은 언덕 밖까지 *불룩 튀어나와서* 무려{' '}
            <strong>{errPct.toFixed(0)}%</strong> 나 크게 어림해요. 더 좋은 방법이
            필요하다!
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── § 2. 잘게 쪼개면 정확 ─────────────────────────────────
function Section2Refine() {
  const [ni, setNi] = useState(1);
  const n = N_STEPS[ni];
  const sum = midpointSum(HILL, n);
  const errPct = (Math.abs(sum - HILL.exact) / HILL.exact) * 100;
  const fine = n >= 64;

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>2. *잘게 쪼갤수록* 정확해진다</h2>
      <p className={styles.lead}>
        직사각형을 2개, 4개, 8개… 점점 가늘게 쪼개 보세요. 튀어나온 부분과 모자란
        부분이 서로 메워지며 오차가 *눈에 띄게* 줄어요. 무한히 잘게 = 그게 바로{' '}
        <strong className={styles.kw}>적분</strong>.
      </p>

      <div className={styles.graphRow}>
        <div className={styles.graphBox}>
          <AreaSvg mission={HILL} n={n} showGrid={false} />
        </div>
        <div className={styles.controlPanel}>
          <div className={styles.valueBig}>
            N = {n} → 합 {sum.toFixed(3)} (오차 {errPct.toFixed(2)}%)
          </div>
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabel}>
              <span>직사각형 개수 N</span>
              <span className={styles.sliderValue}>{n}</span>
            </div>
            <input
              type="range"
              min={0}
              max={N_STEPS.length - 1}
              step={1}
              value={ni}
              onChange={(e) => setNi(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
          {fine ? (
            <div className={styles.matchBanner}>
              🎉 오차 {errPct.toFixed(2)}% — 한없이 쪼개면 정확히{' '}
              <span className={styles.eqLight}>64/3 ≈ 21.333</span> 이 돼요!
            </div>
          ) : (
            <p className={styles.note}>
              N 을 끝까지 올려 보세요 — 오차가 어디까지 줄어들까요?
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── § 3. 아르키메데스의 실진법 ────────────────────────────
function Section3Archimedes() {
  const [stage, setStage] = useState(0);
  const sum = archSum(stage);
  const ratio = sum / 16;
  const converged = stage >= 5;

  const triangles = archTriangles(stage); // stage ≤ 6 — 충분히 가벼움

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>3. 아르키메데스의 통찰 — *4/3 의 발견*</h2>
      <p className={styles.lead}>
        2,300년 전, 직사각형 대신 <strong>삼각형</strong> 으로! 큰 삼각형을 넣고,
        빈틈마다 작은 삼각형을, 또 그 빈틈에 더 작은 삼각형을… 단계마다 넓이가{' '}
        <span className={styles.eq}>직전의 1/4</span> 씩 더해져서 — 포물선 면적은
        정확히 내접 삼각형의 <strong className={styles.kw}>4/3 배</strong>.
      </p>

      <div className={styles.graphRow}>
        <div className={styles.graphBox}>
          <ArchFigure triangles={triangles} />
        </div>
        <div className={styles.controlPanel}>
          <div className={styles.valueBig}>
            누적 = 16 × {ratio.toFixed(4)} = {sum.toFixed(3)}
          </div>
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabel}>
              <span>삼각형 채우기 단계</span>
              <span className={styles.sliderValue}>{stage}</span>
            </div>
            <input
              type="range"
              min={0}
              max={6}
              step={1}
              value={stage}
              onChange={(e) => setStage(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
          {converged ? (
            <div className={styles.matchBanner}>
              🏛️ 1 + ¼ + ¹⁄₁₆ + … = <span className={styles.eqLight}>4/3</span> —
              포물선 면적 = 16 × 4/3 = 64/3. § 2 의 직사각형 답과 일치!
            </div>
          ) : (
            <p className={styles.note}>
              단계마다 *직전 추가분의 1/4* 만 더해져요: 16 → +4 → +1 → +0.25 → …
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── § 4. 미분 ↔ 적분 (FTC) ────────────────────────────────
const fLine = (x: number) => x / 2;
const FArea = (x: number) => (x * x) / 4;

function Section4Ftc() {
  const [x, setX] = useState(4);

  const fCurves = useMemo<Curve[]>(
    () => [
      { samples: sampleFunction(FArea, 0, 8.2, 200), color: '#2dd4bf', width: 3 },
    ],
    [],
  );

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>4. 미분과 적분은 *짝꿍* (기본정리)</h2>
      <p className={styles.lead}>
        위 그림의 비탈(<span className={styles.eq}>f = x/2</span>) 아래 면적을 x
        까지 *모은 값* 이 아래의{' '}
        <span className={styles.cosEq}>면적 함수 F(x) = x²/4</span>. 그런데 F 를{' '}
        <strong>미분하면 다시 f</strong> 가 돼요 — 모으기(적분)와 쪼개기(미분)는
        서로 *반대 연산*. 롤러코스터 단원과 이 단원이 만나는 지점!
      </p>

      <div className={styles.graphRow}>
        <div className={styles.graphBox}>
          <AreaSvg mission={{ f: fLine, yMax: 4.6 }} n={0} showGrid={false} fillToX={x} />
        </div>
        <div className={styles.controlPanel}>
          <div className={styles.valueBig}>
            모은 면적 F({x.toFixed(1)}) = {FArea(x).toFixed(2)}
          </div>
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabel}>
              <span>어디까지 모을까 x</span>
              <span className={styles.sliderValue}>{x.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={8}
              step={0.1}
              value={x}
              onChange={(e) => setX(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
          <p className={styles.note}>
            아래 곡선 F 위의 점이 함께 움직여요 — F 의 *높이* 가 모은 면적, F 의{' '}
            *기울기* 가 비탈의 높이 f(x) = {fLine(x).toFixed(2)}.
          </p>
        </div>
      </div>

      <div className={styles.graphRow}>
        <div className={styles.graphBox} style={{ flex: '1 1 100%' }}>
          <CoordPlane
            width={620}
            height={200}
            xRange={[0, 8.4]}
            yRange={[0, 17.5]}
            gridTicks={[2, 4, 6, 8]}
            curves={fCurves}
            points={[{ x, y: FArea(x), color: '#fbbf24', radius: 7, label: 'F(x)' }]}
          />
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
        <summary>Q1. 가로 5, 세로 3의 직사각형 면적은?</summary>
        <div className={styles.selfCheckBody}>
          <p className={styles.scA}>정답 — 15</p>
          <p className={styles.scHint}>
            가로 × 세로. 적분의 모든 것이 이 한 줄에서 출발해요 (§ 1).
          </p>
        </div>
      </details>

      <details className={styles.selfCheck}>
        <summary>Q2. 곡선 아래 면적을 어림하려면 무엇을 잘게 쪼개나?</summary>
        <div className={styles.selfCheckBody}>
          <p className={styles.scA}>정답 — 직사각형 (또는 삼각형 같은 쉬운 도형)</p>
          <p className={styles.scHint}>
            잘게 쪼갤수록 오차가 줄어요 (§ 2). 아르키메데스는 삼각형으로 했죠 (§
            3).
          </p>
        </div>
      </details>

      <details className={styles.selfCheck}>
        <summary>Q3. 아르키메데스가 발견한 포물선 면적 : 내접 삼각형 비는?</summary>
        <div className={styles.selfCheckBody}>
          <p className={styles.scA}>정답 — 4 : 3</p>
          <p className={styles.scHint}>
            1 + ¼ + ¹⁄₁₆ + … = 4/3 (§ 3). 무한급수의 가장 오래된 명장면!
          </p>
        </div>
      </details>
    </section>
  );
}

// ─── 아르키메데스 삼각형 그림 ───────────────────────────────
const STAGE_COLORS = ['#2dd4bf', '#fbbf24', '#f472b6', '#a78bfa', '#38bdf8', '#34d399', '#fb923c'];

function ArchFigure({
  triangles,
}: {
  triangles: { pts: [number, number][]; stage: number }[];
}) {
  const W = 360;
  const H = 250;
  const PX = 24;
  const PT = 22;
  const PB = 30;
  const kx = (W - 2 * PX) / (AX_MAX - AX_MIN);
  const ky = (H - PT - PB) / 4.6;
  const sx = (x: number) => PX + x * kx;
  const sy = (y: number) => H - PB - y * ky;

  const f = AREA_MISSIONS[1].f;
  const curvePath = useMemo(() => {
    const N = 120;
    const pts: string[] = [];
    for (let i = 0; i <= N; i++) {
      const x = AX_MIN + ((AX_MAX - AX_MIN) * i) / N;
      pts.push(`${i === 0 ? 'M' : 'L'}${sx(x).toFixed(1)},${sy(f(x)).toFixed(1)}`);
    }
    return pts.join(' ');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      {/* 바닥 */}
      <line
        x1={PX - 6}
        y1={sy(0)}
        x2={W - PX + 6}
        y2={sy(0)}
        stroke="rgba(248,250,252,0.45)"
        strokeWidth={2}
      />
      {/* 삼각형들 (단계 색) */}
      {triangles.map((t, i) => (
        <polygon
          key={i}
          points={t.pts.map(([x, y]) => `${sx(x)},${sy(y)}`).join(' ')}
          fill={`${STAGE_COLORS[t.stage % STAGE_COLORS.length]}33`}
          stroke={STAGE_COLORS[t.stage % STAGE_COLORS.length]}
          strokeWidth={1.2}
        />
      ))}
      {/* 포물선 */}
      <path d={curvePath} fill="none" stroke="#f8fafc" strokeWidth={2.4} />
    </svg>
  );
}
