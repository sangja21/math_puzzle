'use client';

import { useMemo, useState } from 'react';
import { StoryHeader } from '@/components/StoryHeader';
import { CoordPlane, sampleFunction, type Curve } from '@/components/CoordPlane';
import { averageRate, numericDerivative, tangentSamples, findExtrema } from '@/lib/puzzles/calculus';
import { rideDistance } from '@/lib/puzzles/differential';
import { CoasterRide } from './CoasterRide';
import styles from './page.module.css';

type Tab = 'principle' | 'coaster';

const STORY =
  '롤러코스터가 첫 언덕을 넘어 곤두박질치는 순간 — 속도계 바늘이 휙휙 움직입니다. ' +
  '"평균 시속 40km" 같은 말로는 *지금 이 순간* 의 짜릿함을 설명할 수 없죠. ' +
  '두 시점 사이의 *평균 빠르기* 를 재는 구간을 한없이 좁혀 가면, 마침내 ' +
  '*순간의 빠르기* 가 모습을 드러냅니다. 이 발상의 이름이 *미분(differential)* — ' +
  '뉴턴과 라이프니츠가 같은 시대에 따로 발견한, 변화를 읽는 수학입니다.';

export default function DifferentialPage() {
  const [tab, setTab] = useState<Tab>('principle');

  return (
    <div className={styles.container}>
      <StoryHeader
        emoji="🎢"
        title="미분"
        subtitle="롤러코스터의 속도"
        story={STORY}
        coreMath={['평균변화율 → 순간변화율', '접선의 기울기', '도함수 f′(x)', 'f′=0 → 극값']}
      />

      <nav className={styles.tabs} role="tablist" aria-label="미분 학습 탭">
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
          aria-selected={tab === 'coaster'}
          className={`${styles.tab} ${tab === 'coaster' ? styles.tabActive : ''}`}
          onClick={() => setTab('coaster')}
        >
          🎢 롤러코스터 챌린지
        </button>
      </nav>

      {tab === 'principle' && (
        <main className={styles.principleTab}>
          <Section1Average />
          <Section2Instant />
          <Section3Derivative />
          <Section4Extrema />
          <Section5SelfCheck />
          <CallToGame onClick={() => setTab('coaster')} />
        </main>
      )}

      {tab === 'coaster' && <CoasterRide />}
    </div>
  );
}

function CallToGame({ onClick }: { onClick: () => void }) {
  return (
    <div className={styles.cta}>
      <h3>🎢 이제 *기울기 헌터* 가 될 시간!</h3>
      <p>
        롤러코스터를 달리게 하고 기울기계를 읽으며 — 가장 가파른 활강 지점과
        봉우리·골짜기를 정확히 잡아내 보세요.
      </p>
      <button type="button" className={styles.ctaBtn} onClick={onClick}>
        롤러코스터 챌린지 시작
      </button>
    </div>
  );
}

// ─── § 1. 평균 변화율 ───────────────────────────────────────
function Section1Average() {
  const [b, setB] = useState(3);
  const a = 1;
  const avg = averageRate(rideDistance, a, b);

  const curves = useMemo<Curve[]>(() => {
    const main = sampleFunction(rideDistance, 0, 4.2, 200);
    const secant = [
      { x: a - 0.6, y: rideDistance(a) + avg * -0.6 },
      { x: b + 0.6, y: rideDistance(b) + avg * 0.6 },
    ];
    return [
      { samples: main, color: '#a78bfa', width: 3 },
      { samples: secant, color: '#f472b6', width: 2, dashed: true },
    ];
  }, [b, avg]);

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>1. 평균 변화율 = *평균 빠르기*</h2>
      <p className={styles.lead}>
        자전거로 <span className={styles.eq}>t</span>시간 동안{' '}
        <span className={styles.eq}>t²</span> km 를 갔어요 (점점 빨라지는 중!).
        1시간째부터 <span className={styles.eq}>{b}</span>시간째까지의{' '}
        <strong>평균 속도</strong> 는 — 간 거리 ÷ 걸린 시간. 그래프에선 두 점을
        잇는 <strong className={styles.kw}>할선의 기울기</strong> 예요.
      </p>

      <div className={styles.graphRow}>
        <div className={styles.graphBox}>
          <CoordPlane
            width={360}
            height={260}
            xRange={[0, 4.4]}
            yRange={[0, 18]}
            gridTicks={[1, 2, 3, 4]}
            curves={curves}
            points={[
              { x: a, y: rideDistance(a), color: '#fbbf24', radius: 6, label: '1h' },
              { x: b, y: rideDistance(b), color: '#fbbf24', radius: 6, label: `${b}h` },
            ]}
          />
        </div>
        <div className={styles.controlPanel}>
          <div className={styles.valueBig}>
            ({rideDistance(b).toFixed(2)} − 1) ÷ ({b} − 1) = 시속 {avg.toFixed(2)}km
          </div>
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabel}>
              <span>끝 시각 b</span>
              <span className={styles.sliderValue}>{b}h</span>
            </div>
            <input
              type="range"
              min={1.5}
              max={4}
              step={0.25}
              value={b}
              onChange={(e) => setB(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
          <p className={styles.note}>
            구간을 바꾸면 평균 속도도 변해요 — 평균은 *구간 전체* 를 뭉뚱그린
            값이니까요.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── § 2. 할선 → 접선 (순간 변화율) ─────────────────────────
const DELTAS = [2, 1, 0.5, 0.25, 0.1, 0.01] as const;

function Section2Instant() {
  const [di, setDi] = useState(0);
  const t0 = 2;
  const delta = DELTAS[di];
  const slope = averageRate(rideDistance, t0, t0 + delta);
  const converged = delta <= 0.01;

  const curves = useMemo<Curve[]>(() => {
    const main = sampleFunction(rideDistance, 0, 4.4, 200);
    const y0 = rideDistance(t0);
    const secant = [
      { x: t0 - 1.2, y: y0 + slope * -1.2 },
      { x: t0 + delta + 1.0, y: y0 + slope * (delta + 1.0) },
    ];
    return [
      { samples: main, color: '#a78bfa', width: 3 },
      { samples: secant, color: converged ? '#34d399' : '#f472b6', width: 2.4 },
    ];
  }, [delta, slope, converged]);

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>2. 구간을 좁히면 — *순간* 이 보여요</h2>
      <p className={styles.lead}>
        &ldquo;2시간째 *바로 그 순간* 의 속도는?&rdquo; 두 점 사이 간격{' '}
        <span className={styles.eq}>Δ</span> 를 한없이 줄여 보세요. 할선이 점점
        한 점에 *착 달라붙은 직선* — <strong className={styles.kw}>접선</strong>
        이 되고, 그 기울기가 <strong>순간 변화율</strong> 이에요.
      </p>

      <div className={styles.graphRow}>
        <div className={styles.graphBox}>
          <CoordPlane
            width={360}
            height={260}
            xRange={[0, 4.6]}
            yRange={[0, 20]}
            gridTicks={[1, 2, 3, 4]}
            curves={curves}
            points={[
              { x: t0, y: rideDistance(t0), color: '#fbbf24', radius: 6, label: '2h' },
              {
                x: t0 + delta,
                y: rideDistance(t0 + delta),
                color: '#f472b6',
                radius: 5,
              },
            ]}
          />
        </div>
        <div className={styles.controlPanel}>
          <div className={styles.valueBig}>
            Δ = {delta} → 기울기 {slope.toFixed(2)}
          </div>
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabel}>
              <span>두 점 사이 간격 Δ</span>
              <span className={styles.sliderValue}>{delta}</span>
            </div>
            <input
              type="range"
              min={0}
              max={DELTAS.length - 1}
              step={1}
              value={di}
              onChange={(e) => setDi(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
          {converged ? (
            <div className={styles.matchBanner}>
              🎉 접선이 됐어요! 2시간째 순간 속도 ={' '}
              <span className={styles.eqLight}>시속 4km</span> — 이게 바로 미분값
              f′(2) = 4
            </div>
          ) : (
            <p className={styles.note}>
              Δ가 줄어들수록 기울기가 4 + Δ → <strong>4</strong> 로 다가가요.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── § 3. 도함수 — 모든 점의 변화율 ────────────────────────
const f3 = (x: number) => (x * x * x) / 3 - 3 * x;

function Section3Derivative() {
  const [x, setX] = useState(1.2);
  const dV = numericDerivative(f3, x);

  const curves = useMemo<Curve[]>(() => {
    return [
      { samples: sampleFunction(f3, -3.4, 3.4, 240), color: '#a78bfa', width: 3 },
      {
        samples: sampleFunction((t) => t * t - 3, -3.4, 3.4, 240),
        color: '#34d399',
        width: 2.2,
        dashed: true,
      },
    ];
  }, []);

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>3. 도함수 — 변화율을 *통째로 함수로*</h2>
      <p className={styles.lead}>
        모든 점의 순간 변화율을 *한 번에* 담은 함수가{' '}
        <strong className={styles.kw}>도함수 f′(x)</strong>.{' '}
        <span className={styles.eq}>보라 곡선이 f</span>,{' '}
        <span className={styles.cosEq}>초록 점선이 f′</span> 예요. 점을 움직이며
        — f 가 *오르막일 때 f′ 는 양수*, 내리막일 때 음수임을 확인해 보세요.
      </p>

      <div className={styles.graphRow}>
        <div className={styles.graphBox}>
          <CoordPlane
            width={360}
            height={280}
            xRange={[-3.6, 3.6]}
            yRange={[-6.5, 6.5]}
            gridTicks={[-3, -2, -1, 1, 2, 3]}
            curves={curves}
            points={[
              { x, y: f3(x), color: '#fbbf24', radius: 6 },
              { x, y: x * x - 3, color: '#34d399', radius: 5 },
            ]}
          />
        </div>
        <div className={styles.controlPanel}>
          <div className={styles.valueBig}>
            f′({x.toFixed(1)}) = {dV.toFixed(2)} —{' '}
            {dV > 0.1 ? '오르막 ↗' : dV < -0.1 ? '내리막 ↘' : '평지 →'}
          </div>
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabel}>
              <span>위치 x</span>
              <span className={styles.sliderValue}>{x.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={-3.2}
              max={3.2}
              step={0.1}
              value={x}
              onChange={(e) => setX(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
          <p className={styles.note}>
            노란 점(f 위)과 초록 점(f′ 위)이 같은 x 에서 함께 움직여요 — 초록
            점의 *높이* 가 노란 점의 *기울기*.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── § 4. f′ = 0 — 극값 ────────────────────────────────────
function Section4Extrema() {
  const [x, setX] = useState(0);
  const dV = numericDerivative(f3, x);
  const flat = Math.abs(dV) < 0.18;
  const extrema = useMemo(() => findExtrema(f3, -3.4, 3.4), []);

  const curves = useMemo<Curve[]>(() => {
    return [
      { samples: sampleFunction(f3, -3.4, 3.4, 240), color: '#a78bfa', width: 3 },
      {
        samples: tangentSamples(f3, x, x - 1.6, x + 1.6),
        color: flat ? '#34d399' : '#fbbf24',
        width: 2.4,
      },
    ];
  }, [x, flat]);

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>4. f′ = 0 — *봉우리와 골짜기*</h2>
      <p className={styles.lead}>
        접선을 끌고 다니다 보면, 봉우리 꼭대기와 골짜기 바닥에서 접선이{' '}
        <strong>완전히 수평</strong> 이 돼요 — 더는 오르지도 내리지도 않는 순간,{' '}
        <strong className={styles.kw}>f′ = 0</strong>. 페르마가 최대·최소를 찾던
        바로 그 방법!
      </p>

      <div className={styles.graphRow}>
        <div className={styles.graphBox}>
          <CoordPlane
            width={360}
            height={280}
            xRange={[-3.6, 3.6]}
            yRange={[-6.5, 6.5]}
            gridTicks={[-3, -2, -1, 1, 2, 3]}
            curves={curves}
            points={[
              { x, y: f3(x), color: '#fbbf24', radius: 6 },
              ...extrema.map((e) => ({
                x: e.x,
                y: e.y,
                color: '#34d399',
                radius: 4,
                label: e.kind === 'max' ? '봉우리' : '골짜기',
              })),
            ]}
          />
        </div>
        <div className={styles.controlPanel}>
          <div className={styles.valueBig}>
            접선 기울기 = {dV.toFixed(2)}
          </div>
          <div className={styles.sliderGroup}>
            <div className={styles.sliderLabel}>
              <span>위치 x</span>
              <span className={styles.sliderValue}>{x.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min={-3.2}
              max={3.2}
              step={0.1}
              value={x}
              onChange={(e) => setX(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
          {flat ? (
            <div className={styles.matchBanner}>
              📏 수평 접선! 여기가 {x < 0 ? '봉우리 (극대)' : '골짜기 (극소)'} —
              f′ = 0
            </div>
          ) : (
            <p className={styles.note}>
              x ≈ −1.7 과 +1.7 근처에서 접선이 수평이 되는지 확인해 보세요.
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
        <summary>Q1. 직선 y = 2x + 3 의 미분(기울기)은?</summary>
        <div className={styles.selfCheckBody}>
          <p className={styles.scA}>정답 — 2 (어느 점에서나!)</p>
          <p className={styles.scHint}>
            직선은 어디서나 같은 기울기 — 그래서 도함수가 상수 (§ 3). 1차함수
            단원의 기울기가 미분의 *원형* 이에요.
          </p>
        </div>
      </details>

      <details className={styles.selfCheck}>
        <summary>Q2. y = x² 에서 x = 3 일 때 순간 변화율은?</summary>
        <div className={styles.selfCheckBody}>
          <p className={styles.scA}>정답 — 6</p>
          <p className={styles.scHint}>
            x² 의 도함수는 2x (§ 2 에서 t=2 일 때 4 였던 것처럼). 2 × 3 = 6.
          </p>
        </div>
      </details>

      <details className={styles.selfCheck}>
        <summary>Q3. 봉우리·골짜기에서 접선의 기울기는?</summary>
        <div className={styles.selfCheckBody}>
          <p className={styles.scA}>정답 — 0 (수평)</p>
          <p className={styles.scHint}>
            오르막이 끝나고 내리막이 시작되는 *순간 정지* 지점 (§ 4). 롤러코스터
            챌린지 2라운드의 핵심!
          </p>
        </div>
      </details>
    </section>
  );
}
