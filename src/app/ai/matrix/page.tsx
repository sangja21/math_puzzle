'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import styles from './page.module.css';
import {
  STAGES,
  type Blank,
  type Puzzle,
  type Where,
  blankLabel,
  cols,
  explainFor,
  rows,
  shapeLabel,
  sub,
} from '@/lib/ai/matrixMul';

type Status = 'idle' | 'correct' | 'wrong';

const MAX_LEN = 4; // 부호 제외 자릿수 여유

const TOTAL_BLANKS = STAGES.reduce(
  (s, st) => s + st.puzzles.reduce((t, p) => t + p.blanks.length, 0),
  0,
);

export default function MatrixMulPage() {
  const [stageIdx, setStageIdx] = useState(0);
  const [puzIdx, setPuzIdx] = useState(0);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [entry, setEntry] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [solved, setSolved] = useState<Set<number>>(new Set());
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  const stage = STAGES[stageIdx];
  const puzzle = stage.puzzles[puzIdx];

  // 퍼즐이 바뀌면 첫 번째 미해결 빈칸으로
  useEffect(() => {
    const next = puzzle.blanks.find((b) => !solved.has(b.id)) ?? puzzle.blanks[0];
    setActiveId(next.id);
    setEntry('');
    setStatus('idle');
    // solved 는 의도적으로 의존성에서 제외 — 정답 직후 퍼즐이 리셋되지 않도록
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puzzle]);

  const active: Blank | null =
    puzzle.blanks.find((b) => b.id === activeId) ?? null;

  const puzzleDone = puzzle.blanks.every((b) => solved.has(b.id));

  const isLast =
    stageIdx === STAGES.length - 1 && puzIdx === stage.puzzles.length - 1;

  const handleNext = useCallback(() => {
    if (puzIdx + 1 < stage.puzzles.length) setPuzIdx(puzIdx + 1);
    else if (stageIdx + 1 < STAGES.length) {
      setStageIdx(stageIdx + 1);
      setPuzIdx(0);
    }
  }, [puzIdx, stage.puzzles.length, stageIdx]);

  const selectBlank = useCallback((id: number) => {
    setActiveId(id);
    setEntry('');
    setStatus('idle');
  }, []);

  // ── 키패드 ──
  const editable = active !== null && !solved.has(active.id);

  const pressDigit = useCallback((d: number) => {
    if (!editable) return;
    setStatus('idle');
    setEntry((e) => {
      const digits = e.replace('-', '');
      if (digits.length >= MAX_LEN) return e;
      if (digits === '0') return (e.startsWith('-') ? '-' : '') + String(d);
      return e + String(d);
    });
  }, [editable]);

  const pressSign = useCallback(() => {
    if (!editable) return;
    setStatus('idle');
    setEntry((e) => (e.startsWith('-') ? e.slice(1) : '-' + e));
  }, [editable]);

  const pressDelete = useCallback(() => {
    if (!editable) return;
    setStatus('idle');
    setEntry((e) => e.slice(0, -1));
  }, [editable]);

  const entryIsNumber = entry !== '' && entry !== '-';

  const handleCheck = useCallback(() => {
    if (!active || !entryIsNumber) return;
    if (Number(entry) !== active.answer) {
      setStatus('wrong');
      return;
    }
    const nextSolved = new Set(solved);
    nextSolved.add(active.id);
    setSolved(nextSolved);
    setStatus('correct');

    const remaining = puzzle.blanks.filter((b) => !nextSolved.has(b.id));
    confetti({
      particleCount: remaining.length === 0 ? 110 : 55,
      spread: remaining.length === 0 ? 80 : 55,
      origin: { y: 0.7 },
      colors: ['#539bf5', '#57ab5a', '#f0883e'],
    });
    if (remaining.length > 0) {
      // 같은 퍼즐의 다음 빈칸으로 자동 이동
      window.setTimeout(() => {
        setActiveId(remaining[0].id);
        setEntry('');
        setStatus('idle');
      }, 550);
    }
  }, [active, entry, entryIsNumber, puzzle.blanks, solved]);

  const handleReveal = useCallback(() => {
    if (!active) return;
    setRevealed((prev) => new Set(prev).add(active.id));
    setEntry(String(active.answer));
    setStatus('idle');
  }, [active]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') pressDigit(Number(e.key));
      else if (e.key === '-') pressSign();
      else if (e.key === 'Backspace') { e.preventDefault(); pressDelete(); }
      else if (e.key === 'Enter') {
        if (puzzleDone) handleNext();
        else handleCheck();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pressDigit, pressSign, pressDelete, handleCheck, handleNext, puzzleDone]);

  /** 어떤 칸에 무엇을 그릴지 */
  const shown = useCallback(
    (where: Where, r: number, c: number) => {
      const grid = where === 'left' ? puzzle.left : where === 'top' ? puzzle.top : puzzle.out;
      const raw = grid[r][c];
      if (raw !== null) return { blank: null, text: String(raw) };
      const b = puzzle.blanks.find((x) => x.where === where && x.r === r && x.c === c)!;
      const isActive = b.id === activeId;
      if (solved.has(b.id) || revealed.has(b.id)) return { blank: b, text: String(b.answer) };
      if (isActive && entry !== '') return { blank: b, text: entry };
      return { blank: b, text: '?' };
    },
    [puzzle, activeId, entry, solved, revealed],
  );

  /** 이미 값을 아는 빈칸이면 그 값을, 아니면 null (해설 패널용) */
  const knownBlankValue = useCallback(
    (where: Where, r: number, c: number): number | null => {
      const b = puzzle.blanks.find((x) => x.where === where && x.r === r && x.c === c);
      if (!b) return null;
      return solved.has(b.id) || revealed.has(b.id) ? b.answer : null;
    },
    [puzzle, solved, revealed],
  );

  // 칸 크기: 가로로 늘어선 총 칸 수에 맞춰 축소
  const totalCols = cols(puzzle.left) + cols(puzzle.top);
  const cellPx = totalCols >= 9 ? 36 : totalCols >= 7 ? 42 : 50;

  const renderGrid = (where: Where) => {
    const grid = where === 'left' ? puzzle.left : where === 'top' ? puzzle.top : puzzle.out;
    return (
      <div
        className={styles.grid}
        style={{ gridTemplateColumns: `repeat(${grid[0].length}, var(--cell))` }}
      >
        {grid.map((row, r) =>
          row.map((_, c) => {
            const { blank, text } = shown(where, r, c);
            const isActive = blank !== null && blank.id === activeId;
            const isSolved = blank !== null && solved.has(blank.id);
            const className = [
              styles.cell,
              where === 'left' ? styles.cellLeft : where === 'top' ? styles.cellTop : styles.cellOut,
              blank ? styles.cellBlank : '',
              isActive ? styles.cellActive : '',
              isSolved ? styles.cellSolved : '',
              isActive && status === 'wrong' ? styles.cellWrong : '',
            ].filter(Boolean).join(' ');

            if (!blank) {
              return <div key={`${where}-${r}-${c}`} className={className}>{text}</div>;
            }
            return (
              <button
                key={`${where}-${r}-${c}`}
                type="button"
                className={className}
                onClick={() => selectBlank(blank.id)}
                title={`워크북 ${blank.id}번`}
              >
                <span className={styles.blankNo}>{blank.id}</span>
                <span className={text === '?' ? styles.qMark : undefined}>{text}</span>
              </button>
            );
          }),
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <Link href="/ai" className={styles.homeBtn}>← AI 딥러닝</Link>
        <div className={styles.progressPill}>풀이 {solved.size} / {TOTAL_BLANKS}</div>
      </div>

      <header className={styles.header}>
        <h1 className={styles.title}>
          <span>🔢</span> 층 조립소 · 행렬 곱셈
        </h1>
        <p className={styles.subtitle}>
          뉴런 하나가 <strong>내적</strong>이었다면, 신경망의 <strong>한 층</strong>은{' '}
          <strong>행렬 곱셈</strong>이에요. 왼쪽 행렬의 <b className={styles.leftColor}>행</b> 과
          위쪽 행렬의 <b className={styles.topColor}>열</b> 이 만나는 자리에{' '}
          <b className={styles.outColor}>출력 한 칸</b> 이 생깁니다.
        </p>
      </header>

      {/* 스테이지 탭 */}
      <div className={styles.stageTabs}>
        {STAGES.map((s, i) => {
          const done = s.puzzles.every((p) => p.blanks.every((b) => solved.has(b.id)));
          return (
            <button
              key={s.id}
              type="button"
              className={`${styles.stageTab} ${i === stageIdx ? styles.stageTabActive : ''}`}
              onClick={() => { setStageIdx(i); setPuzIdx(0); }}
            >
              <span className={styles.stageEmoji}>{s.emoji}</span>
              <span className={styles.stageNum}>{i + 1}</span>
              {done && <span className={styles.stageDone}>✓</span>}
            </button>
          );
        })}
      </div>

      <div className={styles.stageHead}>
        <h2 className={styles.stageTitle}>{stage.emoji} {stage.title}</h2>
        <p className={styles.stageConcept}>{stage.concept}</p>
      </div>

      {/* 퍼즐 네비게이션 */}
      <div className={styles.probNav}>
        {stage.puzzles.map((p, i) => {
          const done = p.blanks.every((b) => solved.has(b.id));
          const ids = p.blanks.map((b) => b.id);
          const label = ids.length === 1 ? `${ids[0]}` : `${ids[0]}–${ids[ids.length - 1]}`;
          return (
            <button
              key={p.key}
              type="button"
              className={[
                styles.probChip,
                i === puzIdx ? styles.probChipActive : '',
                done ? styles.probChipSolved : '',
                p.blanks.some((b) => b.where !== 'out') ? styles.probChipWeight : '',
              ].filter(Boolean).join(' ')}
              onClick={() => setPuzIdx(i)}
              title={`워크북 ${label}번`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* 메인 무대 */}
      <section className={styles.stage}>
        <div className={styles.badgeRow}>
          <span className={styles.shapeBadge}>{shapeLabel(puzzle)}</span>
          {puzzle.blanks.some((b) => b.where !== 'out') && (
            <span className={styles.badgeWeight}>🎯 안쪽 빈칸 = 가중치 역추적</span>
          )}
        </div>

        <div className={styles.boardScroll}>
          <div
            className={styles.board}
            style={{ ['--cell' as string]: `${cellPx}px`, ['--fs' as string]: `${cellPx * 0.42}px` }}
          >
            <div className={styles.corner} aria-hidden />

            <div className={styles.topArea}>
              <div className={`${styles.matLabel} ${styles.matLabelTop}`}>{puzzle.topName}</div>
              {renderGrid('top')}
              <div
                className={styles.arrowRow}
                style={{ gridTemplateColumns: `repeat(${cols(puzzle.top)}, var(--cell))` }}
                aria-hidden
              >
                {Array.from({ length: cols(puzzle.top) }, (_, i) => (
                  <span key={i} className={styles.downArrow}>↓</span>
                ))}
              </div>
            </div>

            <div className={styles.leftArea}>
              <div className={`${styles.matLabel} ${styles.matLabelLeft}`}>{puzzle.leftName}</div>
              {renderGrid('left')}
              <div className={styles.arrowCol} aria-hidden>
                {Array.from({ length: rows(puzzle.left) }, (_, i) => (
                  <span key={i} className={styles.rightArrow}>→</span>
                ))}
              </div>
            </div>

            <div className={styles.outArea}>
              {renderGrid('out')}
              <div className={styles.outLabel}>{puzzle.leftName}·{puzzle.topName}</div>
            </div>
          </div>
        </div>

        {/* 입력부 */}
        <div className={styles.dialArea}>
          <div className={styles.dialLabel}>
            {active ? (
              <>
                <span className={styles.blankTag}>{blankLabel(puzzle, active)}</span>
                {' '}<span className={styles.blankNoInline}>({active.id}번)</span> 을 맞춰보세요
              </>
            ) : '빈칸을 골라주세요'}
          </div>
          <div
            className={[
              styles.display,
              status === 'correct' ? styles.displayCorrect : '',
              status === 'wrong' ? styles.displayWrong : '',
              !entryIsNumber ? styles.displayIdle : '',
            ].filter(Boolean).join(' ')}
          >
            {entry === '' ? '?' : entry}
          </div>

          <div className={styles.keypad}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button key={n} type="button" className={styles.key} onClick={() => pressDigit(n)} disabled={!editable}>
                {n}
              </button>
            ))}
            <button type="button" className={`${styles.key} ${styles.keySign}`} onClick={pressSign} disabled={!editable} aria-label="부호 바꾸기">±</button>
            <button type="button" className={styles.key} onClick={() => pressDigit(0)} disabled={!editable}>0</button>
            <button type="button" className={`${styles.key} ${styles.keyDel}`} onClick={pressDelete} disabled={!editable} aria-label="지우기">⌫</button>
          </div>

          {puzzleDone ? (
            <button type="button" className={styles.nextBtn} onClick={handleNext} disabled={isLast}>
              {isLast ? '🎉 완주!' : '다음 문제 ▶'}
            </button>
          ) : (
            <button type="button" className={styles.checkBtn} onClick={handleCheck} disabled={!entryIsNumber || !editable}>
              확인
            </button>
          )}
        </div>

        {status === 'wrong' && (
          <div className={styles.feedbackWrong}>
            아직 아니에요. <b>같은 행</b> 과 <b>같은 열</b> 을 짝지어 곱한 뒤 더해보세요.{' '}
            <button type="button" className={styles.revealBtn} onClick={handleReveal}>정답 보기</button>
          </div>
        )}
        {status === 'correct' && (
          <div className={styles.feedbackCorrect}>
            {puzzleDone
              ? (isLast ? '🏆 50개 빈칸을 전부 채웠어요 — 한 층을 통째로 계산할 수 있게 됐어요!' : '이 퍼즐 완성! 층 하나를 다 채웠어요. 🔢')
              : '정답! 다음 빈칸으로 갈게요.'}
          </div>
        )}
      </section>

      <ExplainPanel
        puzzle={puzzle}
        blank={active}
        solvedIt={active !== null && (solved.has(active.id) || revealed.has(active.id))}
        knownBlankValue={knownBlankValue}
      />

      <details className={styles.help}>
        <summary>왜 딥러닝은 전부 행렬 곱셈일까? 🤔</summary>
        <div className={styles.helpBody}>
          <p>
            신경망 층 하나의 계산은 <code>Y = X · W + b</code> 예요.
            <code>X</code> 는 입력들을 행마다 쌓은 행렬, <code>W</code> 는 가중치 행렬입니다.
          </p>
          <ul>
            <li><b>결과의 한 행</b> = 데이터 한 벌에 대한 층의 출력</li>
            <li><b>결과의 한 열</b> = 뉴런 하나가 모든 데이터에 대해 내놓은 값</li>
            <li><b>가운데 차원 n</b> 이 맞아야 곱할 수 있어요 — 그게 곧 &ldquo;입력 개수&rdquo;</li>
          </ul>
          <p>
            GPU가 딥러닝에 쓰이는 이유도 여기 있어요. 수천 개의 내적을 한 번에 계산하는 데
            최적화돼 있거든요. 여러분이 손으로 한 칸씩 채운 이 표를, GPU는 초당 수조 번 채웁니다.
          </p>
          <p className={styles.helpFoot}>
            📖 출처: 톰 예(Tom Yeh), 『연필과 종이로 풀어보는 AI 딥러닝 수학 워크북』 02장 (문제 1~50)
          </p>
        </div>
      </details>
    </div>
  );
}

/**
 * 해설 패널 — 지금 고른 빈칸이 어떤 "행 × 열" 내적에서 나오는지 보여준다.
 * 아직 모르는 값은 ? 로 가려 정답이 새어나가지 않게 한다.
 */
function ExplainPanel({
  puzzle,
  blank,
  solvedIt,
  knownBlankValue,
}: {
  puzzle: Puzzle;
  blank: Blank | null;
  solvedIt: boolean;
  knownBlankValue: (where: Where, r: number, c: number) => number | null;
}) {
  const ex = useMemo(() => (blank ? explainFor(puzzle, blank) : null), [puzzle, blank]);
  if (!blank || !ex) return null;

  const n = cols(puzzle.left);
  const isOutBlank = blank.where === 'out';

  // 각 항의 표시값: 이미 아는 값이면 숫자, 모르면 ?
  const termText = (k: number, side: 'left' | 'top') => {
    const raw = side === 'left' ? ex.terms[k].left : ex.terms[k].top;
    if (raw !== null) return fmt(raw);
    const known = side === 'left'
      ? knownBlankValue('left', ex.r, k)
      : knownBlankValue('top', k, ex.c);
    return known !== null ? fmt(known) : '?';
  };

  // 등호 오른쪽: 결과가 원래 주어졌으면 그 값, 아니면 풀기 전엔 숨김
  const rhs = ex.known !== null ? fmt(ex.known) : solvedIt ? fmt(ex.value) : '?';
  const rhsKnown = ex.known !== null || solvedIt;

  return (
    <section className={styles.explain}>
      <h3 className={styles.explainTitle}>💡 이 칸은 어디서 왔을까?</h3>
      <p className={styles.explainLead}>
        결과의 <b className={styles.outColor}>{ex.r + 1}행 {ex.c + 1}열</b> 칸은{' '}
        <b className={styles.leftColor}>{puzzle.leftName}의 {ex.r + 1}행</b> 과{' '}
        <b className={styles.topColor}>{puzzle.topName}의 {ex.c + 1}열</b> 의 내적이에요.
        {!isOutBlank && ' 이 식을 거꾸로 풀면 빈칸의 값이 나옵니다.'}
      </p>

      <div className={styles.equation}>
        <span className={styles.cLabel}>C{sub(ex.r + 1)}{sub(ex.c + 1)}</span>
        <span className={styles.plus}>=</span>
        {Array.from({ length: n }, (_, k) => (
          <React.Fragment key={k}>
            {k > 0 && <span className={styles.plus}>+</span>}
            <span className={styles.term}>
              <span className={styles.paren}>(</span>
              <span className={styles.termLeft}>{termText(k, 'left')}</span>
              <span className={styles.times}>×</span>
              <span className={styles.termTop}>{termText(k, 'top')}</span>
              <span className={styles.paren}>)</span>
            </span>
          </React.Fragment>
        ))}
        <span className={styles.plus}>=</span>
        <span className={rhsKnown ? styles.termOut : styles.termOutHidden}>{rhs}</span>
      </div>

      <p className={styles.explainNote}>
        {isOutBlank
          ? '왼쪽 행렬의 행을 손가락으로 훑고, 위쪽 행렬의 열을 동시에 훑으면서 짝끼리 곱해 더하세요. 이게 뉴런 하나가 하는 일 전부예요.'
          : '결과값은 이미 알고 있어요. 나머지 항을 먼저 계산해 빼면, 물음표 자리에 들어갈 가중치가 드러납니다.'}
      </p>
    </section>
  );
}

function fmt(n: number): string {
  return n < 0 ? `(${n})` : String(n);
}
