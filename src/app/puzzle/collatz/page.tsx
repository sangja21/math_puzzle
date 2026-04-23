'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import styles from './page.module.css';
import {
  collatzSequence,
  collatzStats,
  toGraphPoints,
  EVEN_EXAMPLES,
  ODD_EXAMPLES,
  collatzNext,
} from '@/lib/puzzles/collatz';

type Tab = 'discover' | 'explore';

// ── 규칙 발견 탭 ────────────────────────────────
const EVEN_RULE_OPTIONS = [
  { label: '÷ 2', correct: true },
  { label: '× 2', correct: false },
  { label: '× 3 + 1', correct: false },
  { label: '+ 1', correct: false },
];

const ODD_RULE_OPTIONS = [
  { label: '÷ 3', correct: false },
  { label: '× 2 + 1', correct: false },
  { label: '× 3 + 1', correct: true },
  { label: '× 3 − 1', correct: false },
];

// 퀴즈용 문제 목록
const QUIZ_PROBLEMS = [
  { n: 6 }, { n: 3 }, { n: 10 }, { n: 5 }, { n: 16 },
  { n: 8 }, { n: 4 }, { n: 2 },
];

function DiscoverTab() {
  // phase: 0=짝수규칙, 1=홀수규칙, 2=퀴즈, 3=완료
  const [phase, setPhase] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'ok' | 'ng' | null>(null);

  // 퀴즈 상태
  const [quizIdx, setQuizIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [quizFeedback, setQuizFeedback] = useState<'ok' | 'ng' | null>(null);

  function pickRule(idx: number, options: typeof EVEN_RULE_OPTIONS) {
    if (feedback === 'ok') return;
    setSelected(idx);
    setFeedback(options[idx].correct ? 'ok' : 'ng');
  }

  function nextPhase() {
    setSelected(null);
    setFeedback(null);
    setPhase(p => p + 1);
  }

  function checkQuiz() {
    const { n } = QUIZ_PROBLEMS[quizIdx];
    const correct = collatzNext(n);
    if (parseInt(answer, 10) === correct) {
      setQuizFeedback('ok');
    } else {
      setQuizFeedback('ng');
      setAnswer('');
    }
  }

  function nextQuiz() {
    if (quizIdx + 1 >= QUIZ_PROBLEMS.length) {
      setPhase(3);
    } else {
      setQuizIdx(q => q + 1);
      setAnswer('');
      setQuizFeedback(null);
    }
  }

  const currentN = QUIZ_PROBLEMS[quizIdx]?.n;
  const isEven = currentN % 2 === 0;

  return (
    <div className={styles.card}>
      {phase === 0 && (
        <>
          <div className={styles.phaseLabel}>단계 1 / 3 — 짝수 규칙 찾기</div>
          <div className={styles.phaseTitle}>짝수일 때 어떤 규칙이 적용될까요?</div>
          <div className={styles.exampleGrid}>
            {EVEN_EXAMPLES.map(({ input, output }) => (
              <div key={input} className={styles.exampleBox}>
                <span>{input}</span>
                <span className={styles.arrow}>→</span>
                <span className={styles.out}>{output}</span>
              </div>
            ))}
          </div>
          <div className={styles.ruleOptions}>
            {EVEN_RULE_OPTIONS.map((opt, i) => (
              <button
                key={i}
                className={`${styles.ruleBtn} ${
                  selected === i
                    ? opt.correct ? styles.correct : styles.wrong
                    : ''
                }`}
                onClick={() => pickRule(i, EVEN_RULE_OPTIONS)}
              >
                n → n {opt.label}
              </button>
            ))}
          </div>
          {feedback === 'ok' && (
            <div className={`${styles.feedback} ${styles.ok}`}>
              정답! 짝수는 ÷2 합니다 🎉
            </div>
          )}
          {feedback === 'ng' && (
            <div className={`${styles.feedback} ${styles.ng}`}>
              다시 보세요. 6→3, 8→4, 12→6... 무슨 연산일까요?
            </div>
          )}
          {feedback === 'ok' && (
            <button className={styles.nextBtn} onClick={nextPhase}>
              다음 →
            </button>
          )}
        </>
      )}

      {phase === 1 && (
        <>
          <div className={styles.phaseLabel}>단계 2 / 3 — 홀수 규칙 찾기</div>
          <div className={styles.phaseTitle}>홀수일 때는 어떤 규칙이 적용될까요?</div>
          <div className={styles.exampleGrid}>
            {ODD_EXAMPLES.map(({ input, output }) => (
              <div key={input} className={styles.exampleBox}>
                <span>{input}</span>
                <span className={styles.arrow}>→</span>
                <span className={styles.out}>{output}</span>
              </div>
            ))}
          </div>
          <div className={styles.ruleOptions}>
            {ODD_RULE_OPTIONS.map((opt, i) => (
              <button
                key={i}
                className={`${styles.ruleBtn} ${
                  selected === i
                    ? opt.correct ? styles.correct : styles.wrong
                    : ''
                }`}
                onClick={() => pickRule(i, ODD_RULE_OPTIONS)}
              >
                n → n {opt.label}
              </button>
            ))}
          </div>
          {feedback === 'ok' && (
            <div className={`${styles.feedback} ${styles.ok}`}>
              정답! 홀수는 ×3+1 합니다 🎉
            </div>
          )}
          {feedback === 'ng' && (
            <div className={`${styles.feedback} ${styles.ng}`}>
              다시 보세요. 3→10, 5→16, 7→22... 3×n+1 을 계산해보세요!
            </div>
          )}
          {feedback === 'ok' && (
            <button className={styles.nextBtn} onClick={nextPhase}>
              다음 →
            </button>
          )}
        </>
      )}

      {phase === 2 && (
        <>
          <div className={styles.phaseLabel}>단계 3 / 3 — 규칙 적용 퀴즈 ({quizIdx + 1}/{QUIZ_PROBLEMS.length})</div>
          <div className={styles.phaseTitle}>다음 숫자는 무엇일까요?</div>
          <div className={styles.bigNumber}>{currentN}</div>
          <div className={`${styles.parity} ${isEven ? styles.even : styles.odd}`}>
            {isEven ? `짝수 → ÷ 2` : `홀수 → × 3 + 1`}
          </div>
          <div className={styles.inputRow}>
            <input
              className={styles.answerInput}
              type="number"
              value={answer}
              onChange={e => { setAnswer(e.target.value); setQuizFeedback(null); }}
              onKeyDown={e => { if (e.key === 'Enter' && answer && quizFeedback !== 'ok') checkQuiz(); }}
              placeholder="?"
              disabled={quizFeedback === 'ok'}
            />
            <button
              className={styles.checkBtn}
              onClick={checkQuiz}
              disabled={!answer || quizFeedback === 'ok'}
            >
              확인
            </button>
          </div>
          {quizFeedback === 'ok' && (
            <>
              <div className={`${styles.feedback} ${styles.ok}`} style={{ marginTop: 12 }}>
                정답! {currentN} → {collatzNext(currentN)} 🎉
              </div>
              <button className={styles.nextBtn} onClick={nextQuiz}>
                {quizIdx + 1 >= QUIZ_PROBLEMS.length ? '완료!' : '다음 →'}
              </button>
            </>
          )}
          {quizFeedback === 'ng' && (
            <div className={`${styles.feedback} ${styles.ng}`} style={{ marginTop: 12 }}>
              틀렸어요! {isEven ? `힌트: ${currentN} ÷ 2` : `힌트: ${currentN} × 3 + 1`} 을 다시 계산해보세요.
            </div>
          )}
        </>
      )}

      {phase === 3 && (
        <>
          <div className={styles.phaseTitle} style={{ textAlign: 'center', marginBottom: 24 }}>
            🎉 규칙을 완전히 익혔어요!
          </div>
          <div className={styles.ruleReveal}>
            <h3>콜라츠 추측의 규칙</h3>
            <div className={styles.ruleRow}>
              <span className={`${styles.ruleTag} ${styles.even}`}>짝수</span>
              <span>n → n ÷ 2</span>
            </div>
            <div className={styles.ruleRow}>
              <span className={`${styles.ruleTag} ${styles.odd}`}>홀수</span>
              <span>n → n × 3 + 1</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#768390', marginTop: 14, lineHeight: 1.7 }}>
              이 규칙을 반복하면 <strong style={{ color: '#cdd9e5' }}>어떤 자연수든 결국 1에 도달한다</strong>고 알려져 있어요.
              하지만 수학자들은 아직 이걸 완벽하게 증명하지 못했습니다!
              오른쪽 탭에서 직접 탐험해보세요 🚀
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// ── 탐험 탭 ─────────────────────────────────────
const W = 540, H = 220, PAD = 28;

function ExploreTab() {
  const [inputVal, setInputVal] = useState('');
  const [seq, setSeq] = useState<number[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => seq.length > 0 ? collatzStats(seq) : null, [seq]);

  const visibleSeq = seq.slice(0, visibleCount);
  const points = useMemo(
    () => visibleSeq.length > 1 ? toGraphPoints(visibleSeq, W, H, PAD) : '',
    [visibleSeq]
  );
  const maxVal = visibleSeq.length > 0 ? Math.max(...visibleSeq) : 1;

  function start() {
    const n = parseInt(inputVal, 10);
    if (!n || n < 1) return;
    if (intervalRef.current) clearInterval(intervalRef.current);

    const newSeq = collatzSequence(n);
    setSeq(newSeq);
    setVisibleCount(1);

    // 짧은 수열은 빠르게, 긴 수열은 느리게
    const delay = newSeq.length > 100 ? 20 : newSeq.length > 30 ? 40 : 80;
    intervalRef.current = setInterval(() => {
      setVisibleCount(c => {
        if (c >= newSeq.length) {
          clearInterval(intervalRef.current!);
          return c;
        }
        return c + 1;
      });
    }, delay);
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [visibleCount]);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return (
    <div className={styles.card}>
      <div className={styles.explorerSection}>
        <div>
          <div className={styles.sectionLabel}>자연수 입력</div>
          <div className={styles.inputSection}>
            <input
              className={styles.numberInput}
              type="number"
              min={1}
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && start()}
              placeholder="숫자를 입력하세요"
            />
            <button
              className={styles.startBtn}
              onClick={start}
              disabled={!inputVal || parseInt(inputVal) < 1}
            >
              탐험 시작!
            </button>
          </div>
        </div>

        {stats && visibleCount >= seq.length && (
          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <div className={styles.statValue}>{stats.steps}</div>
              <div className={styles.statLabel}>총 단계 수</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statValue}>{stats.max.toLocaleString()}</div>
              <div className={styles.statLabel}>최댓값</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statValue}>{stats.maxStep}</div>
              <div className={styles.statLabel}>최댓값 도달 단계</div>
            </div>
          </div>
        )}

        {visibleSeq.length > 1 && (
          <div>
            <div className={styles.sectionLabel}>궤적 그래프</div>
            <div className={styles.graphWrap}>
              <svg viewBox={`0 0 ${W} ${H}`} className={styles.graphSvg}>
                {/* 그리드 라인 */}
                {[0.25, 0.5, 0.75].map(t => (
                  <line
                    key={t}
                    x1={PAD} y1={PAD + (1 - t) * (H - PAD * 2)}
                    x2={W - PAD} y2={PAD + (1 - t) * (H - PAD * 2)}
                    stroke="rgba(99,120,160,0.15)" strokeWidth={1}
                  />
                ))}
                {/* 폴리라인 */}
                <polyline
                  points={points}
                  fill="none"
                  stroke="#539bf5"
                  strokeWidth={1.8}
                  strokeLinejoin="round"
                />
                {/* 최댓값 점 */}
                {visibleSeq.length > 1 && (() => {
                  const mi = visibleSeq.indexOf(maxVal);
                  const x = PAD + (mi / (visibleSeq.length - 1)) * (W - PAD * 2);
                  const y = PAD;
                  return (
                    <circle cx={x} cy={y} r={4} fill="#a78bfa" />
                  );
                })()}
                {/* 마지막 점 */}
                {visibleSeq.length > 1 && (() => {
                  const last = visibleSeq[visibleSeq.length - 1];
                  const x = PAD + ((visibleSeq.length - 1) / (visibleSeq.length - 1)) * (W - PAD * 2);
                  const y = PAD + (1 - last / maxVal) * (H - PAD * 2);
                  return <circle cx={x} cy={y} r={4} fill="#4ade80" />;
                })()}
              </svg>
            </div>
          </div>
        )}

        <div>
          <div className={styles.sectionLabel}>
            수열 ({visibleCount} / {seq.length || '—'} 단계)
          </div>
          {visibleSeq.length === 0 ? (
            <div className={styles.emptyHint}>숫자를 입력하고 탐험을 시작하세요!</div>
          ) : (
            <div className={styles.sequenceScroll} ref={scrollRef}>
              {visibleSeq.map((n, i) => (
                <span key={i} className={styles.seqChip}>
                  <span
                    className={`${styles.seqNum} ${
                      n === 1 ? styles.isOne :
                      n % 2 === 0 ? styles.isEven : styles.isOdd
                    }`}
                  >
                    {n}
                  </span>
                  {i < visibleSeq.length - 1 && (
                    <span className={styles.seqArrow}>→</span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 메인 페이지 ──────────────────────────────────
export default function CollatzPage() {
  const [tab, setTab] = useState<Tab>('discover');

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <span>🌀</span> 콜라츠 추측
        </h1>
        <p className={styles.subtitle}>
          어떤 자연수도 짝수면 ÷2, 홀수면 ×3+1을 반복하면 결국 1에 도달한다?
          <br />수학자들도 아직 증명 못 한 미스터리를 직접 탐험해보세요!
        </p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${tab === 'discover' ? styles.active : ''}`}
          onClick={() => setTab('discover')}
        >
          🔍 규칙 발견
        </button>
        <button
          className={`${styles.tab} ${tab === 'explore' ? styles.active : ''}`}
          onClick={() => setTab('explore')}
        >
          🚀 숫자 탐험
        </button>
      </div>

      {tab === 'discover' ? <DiscoverTab /> : <ExploreTab />}
    </div>
  );
}
