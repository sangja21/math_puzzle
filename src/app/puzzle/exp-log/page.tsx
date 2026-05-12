'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { StoryHeader } from '@/components/StoryHeader';
import { CoordPlane, sampleFunction, type Curve } from '@/components/CoordPlane';
import {
  LOG_EXAMPLES,
  SELF_CHECKS,
  powersOfTwo,
  tenToN,
} from '@/lib/puzzles/expLog';
import { RiceBox } from './RiceBox';
import { RiceBoxGame } from './RiceBoxGame';
import styles from './page.module.css';

type Tab = 'principle' | 'game';

const STORY =
  '옛 인도, 체스를 헌상받은 왕은 발명자에게 *원하는 무엇이든* 주겠다 약속했습니다. ' +
  '노현자는 겸손히 청했죠 ─ *체스판 첫 칸에 쌀 한 톨, 다음 칸엔 두 톨, 그 다음엔 네 톨… 64칸까지 두 배씩만요.* ' +
  '왕은 가소로워 웃었지만, 신하들이 돌아온 답은 *왕국 전체의 곡식을 다 합쳐도 모자란다* 였습니다. ' +
  '한 줌도 안 될 듯한 두 배가, 단 64번 만에 왕국을 넘어선 그 비밀을 만나봅시다.';

export default function ExpLogPage() {
  const [tab, setTab] = useState<Tab>('principle');

  return (
    <div className={styles.container}>
      <StoryHeader
        emoji="♟️"
        title="지수와 로그"
        subtitle="두 배의 두 배의 두 배"
        story={STORY}
        coreMath={['2ⁿ', '로그 log', '자연상수 e', '로그 스케일']}
      />

      <nav className={styles.tabs} role="tablist" aria-label="지수와 로그 학습 탭">
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
          aria-selected={tab === 'game'}
          className={`${styles.tab} ${tab === 'game' ? styles.tabActive : ''}`}
          onClick={() => setTab('game')}
        >
          ♟️ 체스판 쌀알 전설
        </button>
      </nav>

      {tab === 'principle' && (
        <main className={styles.principleTab}>
          <Section1Intro onJumpToGame={() => setTab('game')} />
          <Section2Doubling />
          <Section3Logarithm />
          <Section4Bases />
          <Section5InNature />
          <Section6SelfCheck />
          <CallToGame onClick={() => setTab('game')} />
        </main>
      )}

      {tab === 'game' && <RiceBoxGame />}
    </div>
  );
}

function CallToGame({ onClick }: { onClick: () => void }) {
  return (
    <div
      style={{
        marginTop: 12,
        padding: '20px 22px',
        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.12), rgba(167, 139, 250, 0.1))',
        border: '1px solid rgba(251, 191, 36, 0.3)',
        borderRadius: 14,
        textAlign: 'center',
      }}
    >
      <h3 style={{ margin: 0, marginBottom: 8, fontSize: '1.15rem' }}>
        ♟️ 이제 체스판을 직접 채울 시간
      </h3>
      <p style={{ margin: 0, marginBottom: 14, color: 'rgba(248,250,252,0.78)', fontSize: '0.92rem' }}>
        한 칸씩 진행하며 쌀이 어떻게 박스를 가득 채우는지 직접 보세요. 척도가 어떻게 격상되는지도요.
      </p>
      <button type="button" className={styles.primaryBtn} onClick={onClick}>
        체스판 쌀알 전설 →
      </button>
    </div>
  );
}

// ─── § 1. Intro ─────────────────────────────────────
function Section1Intro({ onJumpToGame }: { onJumpToGame: () => void }) {
  const [autoCell, setAutoCell] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }
    timerRef.current = setInterval(() => {
      setAutoCell((c) => {
        if (c >= 32) {
          setRunning(false);
          return c;
        }
        return c + 1;
      });
    }, 600);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running]);

  const start = () => {
    if (autoCell >= 32) setAutoCell(0);
    setRunning(true);
  };
  const reset = () => {
    setRunning(false);
    setAutoCell(0);
  };

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>1. 두 배는 작아 보입니다, 처음엔</h2>
      <div className={styles.introRow}>
        <div className={styles.introText}>
          <p className={styles.lead}>
            <strong>1 → 2 → 4 → 8 → 16.</strong> 손바닥에 다 잡힙니다.
          </p>
          <p className={styles.introMessage}>
            그런데 <em>두 배의 두 배의 두 배</em>를 64번 반복하면 마지막 칸에는{' '}
            약 <strong className={styles.kw}>9,223,000,000,000,000,000톨</strong>의 쌀이 쌓입니다 ─ 인류가 지금까지 수확한 쌀을 다 합쳐도 모자라는 양이에요.
          </p>
          <div className={styles.bigNumber}>2⁶³ ≈ 9.22 × 10¹⁸</div>
          <p className={styles.introMessage}>
            이 단원의 <em>지수</em>는 그렇게 *예상보다 훨씬 큰 숫자*를 만드는 규칙이고,{' '}
            <em>로그</em>는 그 숫자에서 *몇 번 곱했는지*를 거꾸로 꺼내는 도구입니다.
          </p>
          <div className={styles.autoControl}>
            <button type="button" className={styles.smallBtn} onClick={start} disabled={running}>
              {autoCell === 0 ? '▶ 32칸 자동 재생' : running ? '재생 중…' : '▶ 다시 재생'}
            </button>
            {autoCell > 0 && (
              <button type="button" className={styles.smallBtn} onClick={reset}>
                ⟲ 처음으로
              </button>
            )}
            <button type="button" className={styles.smallBtn} onClick={onJumpToGame}>
              🎮 직접 해보기
            </button>
          </div>
        </div>
        <RiceBox cell={autoCell} width={240} height={300} />
      </div>
    </section>
  );
}

// ─── § 2. 두 배의 폭증 (막대 그래프 + linear/log 토글) ─────
function Section2Doubling() {
  const [logScale, setLogScale] = useState(false);
  const maxExp = 12; // 0..12 → 2⁰ … 2¹² (4096)
  const values = useMemo(() => powersOfTwo(maxExp), []);
  const maxVal = values[values.length - 1];
  const maxLog = Math.log2(maxVal + 1);

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>2. 두 배의 폭증</h2>
      <p className={styles.lead}>
        n번째 막대는 <span className={styles.eq}>2ⁿ</span>입니다. 처음 몇 개는 보이지만,
        뒤로 가면 앞쪽 막대들이 <strong>찌부러져 사라져 보여요</strong>. 척도를{' '}
        <strong className={styles.kw}>로그</strong>로 바꾸면 — 정확히 직선이 됩니다.
      </p>
      <div className={styles.barChartWrap}>
        <div className={styles.scaleToggle}>
          <button
            type="button"
            className={`${styles.scaleBtn} ${!logScale ? styles.scaleActive : ''}`}
            onClick={() => setLogScale(false)}
          >
            보통 축 (linear)
          </button>
          <button
            type="button"
            className={`${styles.scaleBtn} ${logScale ? styles.scaleActive : ''}`}
            onClick={() => setLogScale(true)}
          >
            로그 축 (log₂)
          </button>
        </div>
        <div className={styles.barRow} aria-hidden="true">
          {values.map((v, i) => {
            const h = logScale
              ? (Math.log2(v + 1) / maxLog) * 100
              : (v / maxVal) * 100;
            return <div key={i} className={styles.bar} style={{ height: `${h}%` }} />;
          })}
        </div>
        <div className={styles.barLabels}>
          {values.map((_, i) => (
            <span key={i}>{i}</span>
          ))}
        </div>
      </div>
      <p className={styles.note}>
        보통 축에선 0~10번 막대가 거의 안 보이지만, 로그 축에선 같은 보폭으로 차곡차곡
        ─ 이게 *지수가 사실은 직선*이라는 뜻이에요. 컴퓨터·생물·돈 모두 같은 원리.
      </p>
    </section>
  );
}

// ─── § 3. 로그 = 거꾸로 ─────────────────────────────
function Section3Logarithm() {
  const [n, setN] = useState(3);
  const value = tenToN(n);
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>3. 로그 = &ldquo;몇 번 곱했나&rdquo;</h2>
      <p className={styles.lead}>
        <strong>10을 n번 곱한 결과</strong>가 지수. 그 결과를 보고{' '}
        <strong>거꾸로 n을 알아내는 게</strong> 로그예요. 슬라이더로 n을 움직여 보세요.
      </p>
      <div className={styles.sliderGroup}>
        <div className={styles.sliderRow}>
          <span style={{ color: 'rgba(248,250,252,0.85)' }}>
            n = <strong className={styles.kw}>{n}</strong>
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={9}
          step={1}
          value={n}
          onChange={(e) => setN(Number(e.target.value))}
          className={styles.slider}
        />
        <div className={styles.sliderHint}>0 ≤ n ≤ 9</div>
      </div>
      <div className={styles.tenToNDisplay}>
        <span className={styles.lhs}>10{toSuper(n)}</span>
        <span className={styles.arrow}>=</span>
        <span className={styles.rhs}>{value.toLocaleString('ko-KR')}</span>
        <span className={styles.logForm}>
          ⇄ log<sub>10</sub>({value.toLocaleString('ko-KR')}) = {n}
        </span>
      </div>
      <p className={styles.note}>
        로그는 *큰 수의 자릿수*와 거의 같아요. 1,000,000은 log = 6, 자릿수 7개.
      </p>
    </section>
  );
}

function toSuper(n: number): string {
  const map: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    '-': '⁻',
  };
  return n.toString().split('').map((c) => map[c] ?? c).join('');
}

// ─── § 4. 밑 비교 (2ⁿ / 10ⁿ / eⁿ) ──────────────────
function Section4Bases() {
  const xRange: [number, number] = [0, 8];
  const yRange: [number, number] = [0, 100];
  const curves: Curve[] = useMemo(
    () => [
      { samples: sampleFunction((x) => Math.pow(2, x), 0, 8, 80), color: '#60a5fa', width: 2.6 },
      { samples: sampleFunction((x) => Math.E ** x, 0, 8, 80), color: '#a78bfa', width: 2.6 },
      { samples: sampleFunction((x) => Math.pow(10, x), 0, 8, 80), color: '#fbbf24', width: 2.6 },
    ],
    [],
  );

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>4. 밑(base)이 바뀌면</h2>
      <p className={styles.lead}>
        <strong>2배씩</strong>(컴퓨터, 박테리아), <strong>10배씩</strong>(과학·자릿수),
        <strong> e배씩</strong>(자연의 연속 성장). 같은 x인데 셋 다 *터지는 시점*이 다릅니다.
      </p>
      <div className={styles.compareLegend}>
        <span className={styles.compareItem}>
          <span className={styles.legendDot} style={{ background: '#60a5fa' }} />
          y = 2ˣ
        </span>
        <span className={styles.compareItem}>
          <span className={styles.legendDot} style={{ background: '#a78bfa' }} />
          y = eˣ (e ≈ 2.72)
        </span>
        <span className={styles.compareItem}>
          <span className={styles.legendDot} style={{ background: '#fbbf24' }} />
          y = 10ˣ
        </span>
      </div>
      <CoordPlane
        width={420}
        height={300}
        xRange={xRange}
        yRange={yRange}
        gridTicks={[2, 4, 6, 8, 20, 40, 60, 80]}
        curves={curves}
      />
      <p className={styles.note}>
        밑이 클수록 같은 x에서 *훨씬 더 많이 곱해진* 결과. 그래프 위쪽 끝(y=100)에 닿는 시점이
        10ˣ는 x=2, eˣ는 x≈4.6, 2ˣ는 x≈6.6.
      </p>
    </section>
  );
}

// ─── § 5. 자연 속의 로그 ──────────────────────────
function Section5InNature() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>5. 자연 속에 숨은 로그</h2>
      <p className={styles.lead}>
        세상의 많은 *세기·강도·자극*은 두 배·열 배가 너무 잦아서, *직접 비례*로 다루기가
        어려워요. 그래서 사람들은 <strong className={styles.kw}>로그 단위</strong>를 씁니다.
      </p>
      <div className={styles.exampleGrid}>
        {LOG_EXAMPLES.map((ex) => (
          <div key={ex.title} className={styles.exampleCard}>
            <div className={styles.exampleHeader}>
              <span className={styles.exampleEmoji}>{ex.emoji}</span>
              <span className={styles.exampleTitle}>{ex.title}</span>
            </div>
            <div className={styles.exampleFormula}>{ex.formula}</div>
            <div
              className={styles.exampleInsight}
              dangerouslySetInnerHTML={{ __html: insightHTML(ex.insight) }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function insightHTML(s: string): string {
  // *...* 를 <em>으로
  return s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

// ─── § 6. 자가 점검 ───────────────────────────────
function Section6SelfCheck() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>6. 자가 점검</h2>
      <p className={styles.lead}>
        스스로 답해보고 펼쳐서 확인해요. *답이 안 떠올라도 괜찮음* ─ 게임 탭에서 직접
        체스판을 채우다 보면 자연스럽게 익숙해져요.
      </p>
      {SELF_CHECKS.map((sc, i) => (
        <details key={i} className={styles.selfCheck}>
          <summary>
            Q{i + 1}. {sc.question}
          </summary>
          <div className={styles.selfCheckBody}>
            <p className={styles.scA}>→ {sc.answer}</p>
            {sc.hint && <p className={styles.scHint}>💡 {sc.hint}</p>}
          </div>
        </details>
      ))}
    </section>
  );
}
