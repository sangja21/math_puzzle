'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import styles from './page.module.css';
import {
  STAGES,
  blankLabel,
  filledA,
  filledB,
  outputOf,
  termProducts,
} from '@/lib/ai/dotProduct';

type Status = 'idle' | 'correct' | 'wrong';

const MAX_LEN = 4; // 부호 제외 자릿수 여유

export default function DotProductPage() {
  const [stageIdx, setStageIdx] = useState(0);
  const [probIdx, setProbIdx] = useState(0);
  const [entry, setEntry] = useState(''); // 키패드로 입력한 문자열 (예: "-6")
  const [status, setStatus] = useState<Status>('idle');
  const [reveal, setReveal] = useState(false);
  const [solved, setSolved] = useState<Set<number>>(new Set());

  const stage = STAGES[stageIdx];
  const problem = stage.problems[probIdx];

  // 문제가 바뀌면 입력/상태 초기화
  useEffect(() => {
    setEntry('');
    setStatus('idle');
    setReveal(false);
  }, [problem]);

  const totalSolved = solved.size;
  const totalProblems = STAGES.reduce((s, st) => s + st.problems.length, 0);

  const goToProblem = useCallback((si: number, pi: number) => {
    setStageIdx(si);
    setProbIdx(pi);
  }, []);

  const handleNext = useCallback(() => {
    if (probIdx + 1 < stage.problems.length) {
      setProbIdx(probIdx + 1);
    } else if (stageIdx + 1 < STAGES.length) {
      setStageIdx(stageIdx + 1);
      setProbIdx(0);
    }
  }, [probIdx, stage.problems.length, stageIdx]);

  const isLast =
    stageIdx === STAGES.length - 1 && probIdx === stage.problems.length - 1;

  // ── 키패드 조작 ──
  const pressDigit = useCallback((d: number) => {
    if (status === 'correct') return;
    setStatus('idle');
    setReveal(false);
    setEntry((e) => {
      const digits = e.replace('-', '');
      if (digits.length >= MAX_LEN) return e;
      if (digits === '0') {
        // 선행 0 정리: "0" 뒤 숫자는 대체, "-0" 도 마찬가지
        return (e.startsWith('-') ? '-' : '') + String(d);
      }
      return e + String(d);
    });
  }, [status]);

  const pressSign = useCallback(() => {
    if (status === 'correct') return;
    setStatus('idle');
    setReveal(false);
    setEntry((e) => (e.startsWith('-') ? e.slice(1) : '-' + e));
  }, [status]);

  const pressDelete = useCallback(() => {
    if (status === 'correct') return;
    setStatus('idle');
    setReveal(false);
    setEntry((e) => e.slice(0, -1));
  }, [status]);

  const entryIsNumber = entry !== '' && entry !== '-';

  const handleCheck = useCallback(() => {
    if (!entryIsNumber) return;
    if (Number(entry) === problem.answer) {
      setStatus('correct');
      setSolved((prev) => {
        const next = new Set(prev);
        next.add(problem.id);
        return next;
      });
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#539bf5', '#57ab5a', '#f0883e'],
      });
    } else {
      setStatus('wrong');
    }
  }, [entry, entryIsNumber, problem.answer, problem.id]);

  const handleReveal = useCallback(() => {
    setReveal(true);
    setEntry(String(problem.answer));
    setStatus('idle');
  }, [problem.answer]);

  // 키보드: 숫자·마이너스·백스페이스·엔터
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') { pressDigit(Number(e.key)); }
      else if (e.key === '-') { pressSign(); }
      else if (e.key === 'Backspace') { e.preventDefault(); pressDelete(); }
      else if (e.key === 'Enter') { if (status === 'correct') handleNext(); else handleCheck(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pressDigit, pressSign, pressDelete, handleCheck, handleNext, status]);

  // 빈칸/디스플레이에 보여줄 값
  const showVal = status === 'correct' || reveal;
  const shownAnswer = showVal ? String(problem.answer) : entry;
  const blankValue: React.ReactNode =
    shownAnswer !== '' && shownAnswer !== '-'
      ? shownAnswer
      : shownAnswer === '-'
        ? '-'
        : <span className={styles.qMark}>?</span>;

  const renderCell = (kind: 'a' | 'b', i: number) => {
    const src = kind === 'a' ? problem.a : problem.b;
    const isBlank = problem.blank.kind === kind && problem.blank.idx === i;
    return (
      <div
        key={`${kind}-${i}`}
        className={[
          styles.cell,
          kind === 'a' ? styles.cellA : styles.cellB,
          isBlank ? styles.cellBlank : '',
          isBlank && status === 'correct' ? styles.cellCorrect : '',
        ].filter(Boolean).join(' ')}
      >
        {isBlank ? blankValue : src[i]}
      </div>
    );
  };

  const resultIsBlank = problem.blank.kind === 'result';

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <Link href="/ai" className={styles.homeBtn}>← AI 딥러닝</Link>
        <div className={styles.progressPill}>
          풀이 {totalSolved} / {totalProblems}
        </div>
      </div>

      <header className={styles.header}>
        <h1 className={styles.title}>
          <span>🧠</span> 뉴런 실험실 · 내적
        </h1>
        <p className={styles.subtitle}>
          딥러닝 뉴런이 하는 일은 결국 <strong>내적</strong>이에요.
          입력 <b className={styles.aColor}>a</b> 와 가중치 <b className={styles.bColor}>b</b> 를 곱해서 더하면
          뉴런의 출력 <b className={styles.outColor}>a·b</b> 가 됩니다.
        </p>
      </header>

      {/* 스테이지 탭 */}
      <div className={styles.stageTabs}>
        {STAGES.map((s, i) => {
          const done = s.problems.every((p) => solved.has(p.id));
          return (
            <button
              key={s.id}
              type="button"
              className={`${styles.stageTab} ${i === stageIdx ? styles.stageTabActive : ''}`}
              onClick={() => goToProblem(i, 0)}
            >
              <span className={styles.stageEmoji}>{s.emoji}</span>
              <span className={styles.stageNum}>{i + 1}</span>
              {done && <span className={styles.stageDone}>✓</span>}
            </button>
          );
        })}
      </div>

      <div className={styles.stageHead}>
        <h2 className={styles.stageTitle}>
          {stage.emoji} {stage.title}
        </h2>
        <p className={styles.stageConcept}>{stage.concept}</p>
      </div>

      {/* 문제 네비게이션 (스테이지 내) */}
      <div className={styles.probNav}>
        {stage.problems.map((p, i) => (
          <button
            key={p.id}
            type="button"
            className={[
              styles.probChip,
              i === probIdx ? styles.probChipActive : '',
              solved.has(p.id) ? styles.probChipSolved : '',
              p.mode === 'weight' ? styles.probChipWeight : '',
            ].filter(Boolean).join(' ')}
            onClick={() => setProbIdx(i)}
            title={p.mode === 'weight' ? '가중치 찾기(학습)' : '출력 계산(순전파)'}
          >
            {p.id}
          </button>
        ))}
      </div>

      {/* 메인 무대 — 워크북 박스 레이아웃 */}
      <section className={styles.stage}>
        <div className={styles.modeBadge}>
          {problem.mode === 'weight' ? (
            <span className={styles.badgeWeight}>🎯 가중치 찾기 — 학습</span>
          ) : (
            <span className={styles.badgeForward}>⚡ 출력 계산 — 순전파</span>
          )}
        </div>

        {/* b 는 출력 박스 위에 정렬, a 는 왼쪽에서 출력 박스로 */}
        <div className={styles.diagram}>
          {/* 윗줄: (a 자리 여백) + b 열 (출력 박스 위) */}
          <div className={styles.topRow}>
            <div className={styles.aSpacer} aria-hidden />
            <div className={styles.bColumn}>
              <div className={styles.vecLabel}>
                b <span className={styles.vecSub}>가중치</span>
              </div>
              <div className={styles.bStack}>
                {problem.b.map((_, i) => renderCell('b', i))}
              </div>
              <div className={styles.downArrow}>↓</div>
            </div>
          </div>

          {/* 아랫줄: a 라벨 + a 박스 + → + 출력 박스 */}
          <div className={styles.aRow}>
            <div className={styles.aSide}>
              <div className={styles.vecLabel}>
                a <span className={styles.vecSub}>입력</span>
              </div>
              <div className={styles.aStack}>
                {problem.a.map((_, i) => renderCell('a', i))}
              </div>
              <span className={styles.rightArrow}>→</span>
            </div>
            <div className={styles.outWrap}>
              <div
                className={[
                  styles.cell,
                  styles.cellOut,
                  resultIsBlank ? styles.cellBlank : '',
                  resultIsBlank && status === 'correct' ? styles.cellCorrect : '',
                ].filter(Boolean).join(' ')}
              >
                {resultIsBlank ? blankValue : problem.result}
              </div>
              <div className={styles.outLabel}>a·b</div>
            </div>
          </div>
        </div>

        {/* 현재 입력 디스플레이 */}
        <div className={styles.dialArea}>
          <div className={styles.dialLabel}>
            <span className={styles.blankTag}>{blankLabel(problem)}</span> 를 맞춰보세요
          </div>
          <div
            className={[
              styles.display,
              status === 'correct' ? styles.displayCorrect : '',
              status === 'wrong' ? styles.displayWrong : '',
              !entryIsNumber && !showVal ? styles.displayIdle : '',
            ].filter(Boolean).join(' ')}
          >
            {showVal ? problem.answer : (entry === '' ? '?' : entry)}
          </div>

          {/* 숫자 키패드 */}
          <div className={styles.keypad}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button
                key={n}
                type="button"
                className={styles.key}
                onClick={() => pressDigit(n)}
                disabled={status === 'correct'}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              className={`${styles.key} ${styles.keySign}`}
              onClick={pressSign}
              disabled={status === 'correct'}
              aria-label="부호 바꾸기"
            >
              ±
            </button>
            <button
              type="button"
              className={styles.key}
              onClick={() => pressDigit(0)}
              disabled={status === 'correct'}
            >
              0
            </button>
            <button
              type="button"
              className={`${styles.key} ${styles.keyDel}`}
              onClick={pressDelete}
              disabled={status === 'correct'}
              aria-label="지우기"
            >
              ⌫
            </button>
          </div>

          {status !== 'correct' ? (
            <button
              type="button"
              className={styles.checkBtn}
              onClick={handleCheck}
              disabled={!entryIsNumber}
            >
              확인
            </button>
          ) : (
            <button
              type="button"
              className={styles.nextBtn}
              onClick={handleNext}
              disabled={isLast}
            >
              {isLast ? '🎉 완주!' : '다음 ▶'}
            </button>
          )}
        </div>

        {status === 'wrong' && (
          <div className={styles.feedbackWrong}>
            아직 아니에요. 각 항을 곱해서 더해보세요.{' '}
            <button type="button" className={styles.revealBtn} onClick={handleReveal}>
              정답 보기
            </button>
          </div>
        )}
        {status === 'correct' && (
          <div className={styles.feedbackCorrect}>
            정답! {problem.id === 30 ? '🏆 마지막 문제까지 완주했어요!' : '뉴런이 제대로 계산했어요. 🧠'}
          </div>
        )}
      </section>

      {/* 딥러닝 해설 — 정답은 숨기고 연산 과정만 */}
      <ExplainPanel problem={problem} showVal={showVal} />

      <details className={styles.help}>
        <summary>내적이 정말 딥러닝의 전부일까? 🤔</summary>
        <div className={styles.helpBody}>
          <p>
            진짜 뉴런은 내적에 두 가지를 더 붙여요:
          </p>
          <ul>
            <li><b>편향(bias)</b>: 가중합에 상수를 더해 기준점을 옮겨요. <code>a·b + b₀</code></li>
            <li><b>활성화 함수</b>: 그 결과를 ReLU·시그모이드 같은 함수에 통과시켜 비선형성을 줘요.</li>
          </ul>
          <p>
            하지만 심장은 언제나 <b>내적</b>이에요. GPT 같은 거대 모델도 수십억 번의 내적을
            행렬 곱셈으로 한꺼번에 계산하는 것뿐이랍니다. 이 워크북 한 장을 다 풀면
            신경망의 가장 기본 연산을 손으로 완전히 이해한 거예요.
          </p>
        </div>
      </details>
    </div>
  );
}

/**
 * 연산 과정 해설.
 * - 풀기 전: (a₁×b₁) + (a₂×b₂) + ... 꼴로 "무엇을 곱해 더하는지"만 보여주고
 *   빈칸(모르는 값)은 ?, 곱셈 결과와 최종합은 숨긴다(정답 노출 방지).
 * - 정답/공개 후: 곱셈 결과와 최종 합계까지 모두 채워 보여준다.
 */
function ExplainPanel({
  problem,
  showVal,
}: {
  problem: (typeof STAGES)[number]['problems'][number];
  showVal: boolean;
}) {
  const products = useMemo(() => termProducts(problem), [problem]);
  const output = useMemo(() => outputOf(problem), [problem]);
  const aFilled = useMemo(() => filledA(problem), [problem]);
  const bFilled = useMemo(() => filledB(problem), [problem]);

  const isBlankA = (i: number) => problem.blank.kind === 'a' && problem.blank.idx === i;
  const isBlankB = (i: number) => problem.blank.kind === 'b' && problem.blank.idx === i;

  // 표시용: 풀기 전엔 원본(빈칸=?), 풀고 나면 채워진 값
  const showA = (i: number) =>
    !showVal && isBlankA(i) ? '?' : formatNum(aFilled[i]);
  const showB = (i: number) =>
    !showVal && isBlankB(i) ? '?' : formatNum(bFilled[i]);

  // 최종합: weight 유형은 결과가 이미 주어짐, forward 유형은 풀기 전 숨김
  const finalText = showVal
    ? formatNum(output)
    : problem.mode === 'weight'
      ? formatNum(problem.result as number)
      : '?';

  return (
    <section className={styles.explain}>
      <h3 className={styles.explainTitle}>💡 연산 과정 — 이게 왜 딥러닝일까?</h3>
      <p className={styles.explainLead}>
        뉴런의 출력은 <b>각 입력 × 가중치를 모두 더한 값</b>(가중합)이에요.
        지금 문제는 이렇게 계산해요:
      </p>

      <div className={styles.equation}>
        {aFilled.map((_, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className={styles.plus}>+</span>}
            <span className={styles.term}>
              <span className={styles.paren}>(</span>
              <span className={styles.termA}>{showA(i)}</span>
              <span className={styles.times}>×</span>
              <span className={styles.termB}>{showB(i)}</span>
              <span className={styles.paren}>)</span>
              {showVal && (
                <>
                  <span className={styles.eq}>=</span>
                  <span className={styles.termP}>{formatNum(products[i])}</span>
                </>
              )}
            </span>
          </React.Fragment>
        ))}
        <span className={styles.plus}>=</span>
        <span className={showVal ? styles.termOut : styles.termOutHidden}>{finalText}</span>
      </div>

      <p className={styles.explainNote}>
        {showVal
          ? '입력값이 클수록, 그리고 가중치가 클수록 그 입력이 출력에 크게 기여해요. 신경망 학습이란 결국 이 가중치들을 잘 고르는 일이에요.'
          : '각 괄호를 곱한 뒤 모두 더하면 뉴런의 출력이 나와요. (음수끼리 곱하면 +, 음수 항은 출력을 끌어내려요.)'}
      </p>
    </section>
  );
}

function formatNum(n: number): string {
  return n < 0 ? `(${n})` : String(n);
}
