'use client';

import { useMemo, useState } from 'react';
import { StoryHeader } from '@/components/StoryHeader';
import { CoordPlane, type ArrowSpec } from '@/components/CoordPlane';
import { add, fromPolarDeg, mag, type Vec2 } from '@/lib/puzzles/vector';
import { JetstreamTab } from './JetstreamTab';
import styles from './page.module.css';

type Tab = 'principle' | 'jetstream';

const STORY =
  '하늘 위 *시속 200km* 가 넘는 강한 바람이 흐른다는 사실, 알고 있나요? ' +
  '비행기는 정직하게 동쪽을 향해 날아도, 옆에서 미는 *제트기류* 때문에 ' +
  '엉뚱한 곳에 도착해 버리곤 합니다. 내가 가려는 방향과 흘러가는 방향이 다를 때, ' +
  '두 화살표를 어떻게 *합쳐서* 진짜 항로를 만들 수 있을까요?';

export default function VectorPage() {
  const [tab, setTab] = useState<Tab>('principle');

  return (
    <div className={styles.container}>
      <StoryHeader
        emoji="✈️"
        title="벡터"
        subtitle="심술궂은 제트기류"
        story={STORY}
        coreMath={['크기 + 방향', '벡터 합', '벡터 분해', '평행사변형 법칙']}
      />

      <nav className={styles.tabs} role="tablist" aria-label="벡터 학습 탭">
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
          aria-selected={tab === 'jetstream'}
          className={`${styles.tab} ${tab === 'jetstream' ? styles.tabActive : ''}`}
          onClick={() => setTab('jetstream')}
        >
          ✈️ 제트기류 비행
        </button>
      </nav>

      {tab === 'principle' && (
        <main className={styles.principleTab}>
          <Section1Intro />
          <Section2Sum />
          <Section3Decompose />
          <Section4Equilibrium />
          <Section5SelfCheck />
          <CallToGame onClick={() => setTab('jetstream')} />
        </main>
      )}

      {tab === 'jetstream' && <JetstreamTab />}
    </div>
  );
}

function CallToGame({ onClick }: { onClick: () => void }) {
  return (
    <div className={styles.cta}>
      <h3>✈️ 이제 진짜 항로를 잡아볼 시간!</h3>
      <p>
        제트기류가 부는 하늘에서 비행기 방향을 직접 보정해 목적지에 정확히
        착륙시켜 보세요. 풍속이 셀수록 더 큰 각도로 보정해야 해요.
      </p>
      <button type="button" className={styles.ctaBtn} onClick={onClick}>
        제트기류 비행 시작
      </button>
    </div>
  );
}

// ─── § 1. 벡터는 화살표 ─────────────────────────────────────
function Section1Intro() {
  const arrows: ArrowSpec[] = [
    { x1: 0, y1: 0, x2: 4, y2: 3, color: '#38bdf8', label: '벡터 a', width: 3 },
    { x1: 0, y1: 0, x2: -3, y2: 2, color: '#f472b6', label: '벡터 b', width: 3 },
    { x1: 0, y1: 0, x2: 1, y2: -4, color: '#fbbf24', label: '벡터 c', width: 3 },
  ];

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>1. 벡터는 *화살표* 예요</h2>
      <p className={styles.lead}>
        벡터(vector)는 <strong className={styles.kw}>크기</strong>와{' '}
        <strong className={styles.kw}>방향</strong>을 동시에 가진 양이에요.
        화살표 하나로 깔끔하게 그릴 수 있죠 ─ 길이 = 크기, 향한 쪽 = 방향.
      </p>
      <div className={styles.graphRow}>
        <div className={styles.graphBox}>
          <CoordPlane
            width={380}
            height={300}
            xRange={[-6, 6]}
            yRange={[-5, 5]}
            gridTicks={[-4, -2, 2, 4]}
            arrows={arrows}
          />
        </div>
        <div className={styles.controlPanel}>
          <div className={styles.directionChip}>크기 + 방향</div>
          <p className={styles.note}>
            <strong>벡터</strong>: <span className={styles.eq}>(4, 3)</span> →
            오른쪽으로 4, 위로 3.
            <br />
            <strong>스칼라</strong>: <span className={styles.eq}>30°C</span>,{' '}
            <span className={styles.eq}>5kg</span> 같은 단순 수치는 *방향이 없어* 벡터가
            아니에요.
          </p>
          <p className={styles.note}>
            세 화살표 모두 시작점은 (0, 0). 끝점만 다르게 찍어도 다른 벡터가
            됩니다.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── § 2. 두 화살표의 합 ─────────────────────────────────────
type SumMethod = 'tipToTail' | 'parallelogram';

function Section2Sum() {
  const [aAngle, setAAngle] = useState(30);
  const [aMag, setAMag] = useState(4);
  const [bAngle, setBAngle] = useState(110);
  const [bMag, setBMag] = useState(3);
  const [method, setMethod] = useState<SumMethod>('tipToTail');

  const a = useMemo(() => fromPolarDeg(aMag, aAngle), [aMag, aAngle]);
  const b = useMemo(() => fromPolarDeg(bMag, bAngle), [bMag, bAngle]);
  const sum = useMemo(() => add(a, b), [a, b]);

  const arrows = useMemo<ArrowSpec[]>(() => {
    const base: ArrowSpec[] = [
      { x1: 0, y1: 0, x2: a.x, y2: a.y, color: '#38bdf8', width: 3, label: 'a' },
      { x1: 0, y1: 0, x2: b.x, y2: b.y, color: '#f472b6', width: 3, label: 'b' },
    ];
    if (method === 'tipToTail') {
      // b를 a 끝점에서 다시 그림
      base.push({
        x1: a.x,
        y1: a.y,
        x2: a.x + b.x,
        y2: a.y + b.y,
        color: '#f472b6',
        width: 2.5,
        dashed: true,
        opacity: 0.7,
      });
    } else {
      // 평행사변형: a 끝에서 b, b 끝에서 a (점선)
      base.push(
        {
          x1: a.x,
          y1: a.y,
          x2: a.x + b.x,
          y2: a.y + b.y,
          color: '#f472b6',
          width: 2,
          dashed: true,
          opacity: 0.55,
        },
        {
          x1: b.x,
          y1: b.y,
          x2: a.x + b.x,
          y2: a.y + b.y,
          color: '#38bdf8',
          width: 2,
          dashed: true,
          opacity: 0.55,
        },
      );
    }
    base.push({
      x1: 0,
      y1: 0,
      x2: sum.x,
      y2: sum.y,
      color: '#fbbf24',
      width: 3.6,
      label: 'a+b',
    });
    return base;
  }, [a, b, sum, method]);

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>2. 두 화살표를 *합치면* 새 화살표</h2>
      <p className={styles.lead}>
        합치는 방법은 두 가지가 있어요. <strong>이어 붙이기</strong>(끝과 머리)와{' '}
        <strong>평행사변형</strong>(대각선). 결과는 항상 같은 화살표 — 합벡터예요.
      </p>

      <div className={styles.graphRow}>
        <div className={styles.graphBox}>
          <CoordPlane
            width={380}
            height={360}
            xRange={[-6, 8]}
            yRange={[-2, 8]}
            gridTicks={[-4, -2, 2, 4, 6]}
            arrows={arrows}
          />
        </div>

        <div className={styles.controlPanel}>
          <div className={styles.toggleRow}>
            <button
              type="button"
              className={`${styles.toggleBtn} ${method === 'tipToTail' ? styles.toggleActive : ''}`}
              onClick={() => setMethod('tipToTail')}
            >
              이어 붙이기
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${method === 'parallelogram' ? styles.toggleActive : ''}`}
              onClick={() => setMethod('parallelogram')}
            >
              평행사변형
            </button>
          </div>

          <div className={styles.equationBig}>
            |a+b| = {mag(sum).toFixed(2)}
          </div>

          <div className={styles.sliderGroup}>
            <div className={styles.sliderRow}>
              <span className={styles.sliderLabel}>
                <span className={styles.varName}>a</span> 크기 = {aMag}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={0.5}
              value={aMag}
              onChange={(e) => setAMag(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderRow}>
              <span className={styles.sliderLabel}>
                <span className={styles.varName}>a</span> 각도 = {aAngle}°
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={180}
              step={5}
              value={aAngle}
              onChange={(e) => setAAngle(Number(e.target.value))}
              className={styles.slider}
            />
          </div>

          <div className={styles.sliderGroup}>
            <div className={styles.sliderRow}>
              <span className={styles.sliderLabel}>
                <span className={styles.varName}>b</span> 크기 = {bMag}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              step={0.5}
              value={bMag}
              onChange={(e) => setBMag(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderRow}>
              <span className={styles.sliderLabel}>
                <span className={styles.varName}>b</span> 각도 = {bAngle}°
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={180}
              step={5}
              value={bAngle}
              onChange={(e) => setBAngle(Number(e.target.value))}
              className={styles.slider}
            />
          </div>

          <p className={styles.note}>
            *이어 붙이기*: a 끝점에 b의 시작을 붙이면, 처음 0부터 마지막 b 끝까지의
            화살표가 합. *평행사변형*: 같은 위치에서 두 화살표로 그린 평행사변형의
            대각선이 합.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── § 3. 벡터 분해 ──────────────────────────────────────────
function Section3Decompose() {
  const [angle, setAngle] = useState(35);
  const [magnitude, setMag] = useState(5);

  const v = useMemo(() => fromPolarDeg(magnitude, angle), [magnitude, angle]);
  const arrows = useMemo<ArrowSpec[]>(
    () => [
      // x 성분 (수평)
      {
        x1: 0,
        y1: 0,
        x2: v.x,
        y2: 0,
        color: '#34d399',
        width: 2.5,
        label: `x ${v.x.toFixed(1)}`,
      },
      // y 성분 (수직) — x 성분 끝점에서 위로
      {
        x1: v.x,
        y1: 0,
        x2: v.x,
        y2: v.y,
        color: '#a78bfa',
        width: 2.5,
        label: `y ${v.y.toFixed(1)}`,
      },
      // 원본 벡터
      {
        x1: 0,
        y1: 0,
        x2: v.x,
        y2: v.y,
        color: '#fbbf24',
        width: 3.4,
        label: 'v',
      },
    ],
    [v],
  );

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>
        3. 한 화살표를 *나누어* 보기 (분해)
      </h2>
      <p className={styles.lead}>
        비스듬한 화살표는 <strong>가로(x)</strong>와 <strong>세로(y)</strong>의
        두 화살표로 쪼갤 수 있어요. 「북동쪽 5걸음 = 동쪽 ?걸음 + 북쪽 ?걸음」을
        시각으로 확인해 보세요.
      </p>

      <div className={styles.graphRow}>
        <div className={styles.graphBox}>
          <CoordPlane
            width={380}
            height={300}
            xRange={[-1, 6]}
            yRange={[-1, 5]}
            gridTicks={[1, 2, 3, 4, 5]}
            arrows={arrows}
          />
        </div>
        <div className={styles.controlPanel}>
          <div className={styles.equationBig}>
            v = ({v.x.toFixed(1)}, {v.y.toFixed(1)})
          </div>
          <div className={styles.sliderGroup}>
            <div className={styles.sliderRow}>
              <span className={styles.sliderLabel}>
                <span className={styles.varName}>|v|</span> = {magnitude}
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={6}
              step={0.5}
              value={magnitude}
              onChange={(e) => setMag(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderRow}>
              <span className={styles.sliderLabel}>
                <span className={styles.varName}>각도</span> = {angle}°
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={85}
              step={5}
              value={angle}
              onChange={(e) => setAngle(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderHint}>0° ≤ θ ≤ 85°</div>
          </div>
          <p className={styles.note}>
            <span className={styles.eq}>x = |v|·cosθ</span>,{' '}
            <span className={styles.eq}>y = |v|·sinθ</span> ─ 비스듬한 화살표를
            가로/세로 두 막대로 펼친 게 *벡터 분해* 입니다.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── § 4. 합이 0 이면 균형 ──────────────────────────────────
function Section4Equilibrium() {
  // 세 줄이 한 점에서 당김. 합이 0이 되도록 미리 설정한 3개.
  // 120°씩 떨어진 같은 크기 → 합 0
  const a: Vec2 = fromPolarDeg(3, 30);
  const b: Vec2 = fromPolarDeg(3, 150);
  const c: Vec2 = fromPolarDeg(3, 270);

  const arrows: ArrowSpec[] = [
    { x1: 0, y1: 0, x2: a.x, y2: a.y, color: '#38bdf8', width: 3, label: 'a' },
    { x1: 0, y1: 0, x2: b.x, y2: b.y, color: '#f472b6', width: 3, label: 'b' },
    { x1: 0, y1: 0, x2: c.x, y2: c.y, color: '#fbbf24', width: 3, label: 'c' },
  ];

  // 합이 0임을 시각화: a→b→c 이어붙이기, 원점으로 되돌아옴 (얇은 회색 점선)
  arrows.push(
    {
      x1: a.x,
      y1: a.y,
      x2: a.x + b.x,
      y2: a.y + b.y,
      color: '#94a3b8',
      width: 1.5,
      dashed: true,
      opacity: 0.7,
    },
    {
      x1: a.x + b.x,
      y1: a.y + b.y,
      x2: a.x + b.x + c.x,
      y2: a.y + b.y + c.y,
      color: '#94a3b8',
      width: 1.5,
      dashed: true,
      opacity: 0.7,
    },
  );

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>4. 합이 *0* 이면 균형이에요</h2>
      <p className={styles.lead}>
        세 명이 줄다리기 하는데 줄이 한 점에 묶여 있어요. 화살표 세 개를 *이어
        붙여서 출발점으로 정확히 되돌아오면* 그 점은 절대 움직이지 않습니다 ─
        합벡터가 0.
      </p>

      <div className={styles.graphRow}>
        <div className={styles.graphBox}>
          <CoordPlane
            width={380}
            height={360}
            xRange={[-4, 6]}
            yRange={[-5, 5]}
            gridTicks={[-2, 2, 4]}
            arrows={arrows}
          />
        </div>
        <div className={styles.controlPanel}>
          <div className={styles.directionChip}>a + b + c = 0</div>
          <p className={styles.note}>
            세 화살표는 모두 크기 3, 방향만 120° 씩 다르게 잡았어요. 회색 점선을
            따라가면 마지막엔 정확히 원점으로 돌아옵니다. *비행기 정지 비행*,
            *교차로의 균형* 같은 실생활 균형이 모두 이 원리입니다.
          </p>
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
        <summary>Q1. 동쪽 3걸음 + 북쪽 4걸음의 합벡터 크기는?</summary>
        <div className={styles.selfCheckBody}>
          <p className={styles.scA}>정답 — 5</p>
          <p className={styles.scHint}>
            (3, 4)의 크기 = √(3² + 4²) = √25 = 5. 익숙한 3-4-5 직각삼각형. (§ 3
            분해의 역방향)
          </p>
        </div>
      </details>

      <details className={styles.selfCheck}>
        <summary>
          Q2. 두 화살표의 크기가 같고 방향이 정확히 반대면, 합은?
        </summary>
        <div className={styles.selfCheckBody}>
          <p className={styles.scA}>정답 — 0 (영벡터)</p>
          <p className={styles.scHint}>
            서로 정확히 상쇄. § 4 균형의 가장 단순한 예. 줄다리기 둘이서 똑같이
            당기는 상황.
          </p>
        </div>
      </details>

      <details className={styles.selfCheck}>
        <summary>
          Q3. 비행기가 동쪽을 향해 정직하게 가는데, 북쪽으로 미는 바람이 불면
          실제 항로는 어느 쪽으로 휘어요?
        </summary>
        <div className={styles.selfCheckBody}>
          <p className={styles.scA}>정답 — 북동쪽</p>
          <p className={styles.scHint}>
            동쪽 벡터 + 북쪽 벡터 = 북동쪽 합벡터. 똑바로 가려면 비행기를 살짝
            *남쪽으로 기울여* 보정해야 해요. (§ 2 합벡터)
          </p>
        </div>
      </details>
    </section>
  );
}
