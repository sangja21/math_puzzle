'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import {
  Assignment,
  AdditionPuzzle,
  LEVEL1_PUZZLES,
  LEVEL2_PUZZLE,
  LEVEL3_PUZZLE,
  hasDuplicate,
  validateAddition,
  validateReversal,
  buildLevel3Number,
  buildLevel3Reversed,
  getLevel3Letters,
  getLevel3ResultLetters,
} from '@/lib/puzzles/cryptarithmetic';

// ─── Shared helpers ──────────────────────────────────────────────
function getLetters(puzzle: AdditionPuzzle): string[] {
  const all = [...puzzle.operands.flat(), ...puzzle.result];
  return [...new Set(all)];
}

function makeEmpty(letters: string[]): Assignment {
  return Object.fromEntries(letters.map((l) => [l, null]));
}

// ─── Letter Cell ─────────────────────────────────────────────────
function LetterCell({
  letter,
  value,
  selected,
  correct,
  wrong,
  onClick,
}: {
  letter: string;
  value: number | null;
  selected: boolean;
  correct?: boolean;
  wrong?: boolean;
  onClick: () => void;
}) {
  let cls = styles.letterCell;
  if (selected) cls += ' ' + styles.letterCellSelected;
  else if (correct) cls += ' ' + styles.letterCellCorrect;
  else if (wrong) cls += ' ' + styles.letterCellWrong;

  return (
    <div className={cls} onClick={onClick}>
      <span className={styles.letterLabel}>{letter}</span>
      {value !== null ? (
        <span className={styles.letterValue}>{value}</span>
      ) : (
        <span className={`${styles.letterValue} ${styles.letterValueEmpty}`}>?</span>
      )}
    </div>
  );
}

// ─── Digit Palette ────────────────────────────────────────────────
function DigitPalette({
  assignment,
  selectedLetter,
  onDigitClick,
}: {
  assignment: Assignment;
  selectedLetter: string | null;
  onDigitClick: (d: number) => void;
}) {
  const usedVals = Object.entries(assignment)
    .filter(([, v]) => v !== null)
    .map(([l, v]) => ({ letter: l, val: v as number }));

  return (
    <div className={styles.palette}>
      {Array.from({ length: 10 }, (_, d) => {
        const users = usedVals.filter((x) => x.val === d);
        const isUsed = users.length > 0;
        const isDuplicate = users.length > 1;
        let cls = styles.digitChip;
        if (isDuplicate) cls += ' ' + styles.digitChipDuplicate;
        else if (isUsed) cls += ' ' + styles.digitChipUsed;

        return (
          <button
            key={d}
            className={cls}
            onClick={() => onDigitClick(d)}
            disabled={!selectedLetter}
          >
            {d}
          </button>
        );
      })}
    </div>
  );
}

// ─── Addition Puzzle Panel ────────────────────────────────────────
function AdditionPanel({ puzzle }: { puzzle: AdditionPuzzle }) {
  const letters = getLetters(puzzle);
  const [assignment, setAssignment] = useState<Assignment>(() => makeEmpty(letters));
  const [selected, setSelected] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const assign = useCallback(
    (digit: number) => {
      if (!selected) return;
      setAssignment((prev) => ({ ...prev, [selected]: digit }));
      // move to next unassigned letter
      const idx = letters.indexOf(selected);
      const next = letters.slice(idx + 1).find((l) => assignment[l] === null);
      if (next) setSelected(next);
    },
    [selected, letters, assignment]
  );

  const reset = () => {
    setAssignment(makeEmpty(letters));
    setSelected(null);
    setRevealed(false);
    setShowHint(false);
  };

  const reveal = () => {
    setAssignment({ ...puzzle.solution });
    setRevealed(true);
    setSelected(null);
  };

  const { isComplete, isCorrect, columnStatuses } = validateAddition(
    puzzle.operands,
    puzzle.result,
    assignment
  );
  const dup = hasDuplicate(assignment);

  // Align operands right
  const len = puzzle.result.length;
  const alignedOps = puzzle.operands.map((op) => {
    return Array(len - op.length).fill(null).concat(op);
  });

  function colStatus(letter: string | null, colIdx: number) {
    if (!letter) return undefined;
    const s = columnStatuses[colIdx];
    if (!s) return undefined;
    return s;
  }

  return (
    <>
      {/* Equation */}
      <div className={styles.equationArea}>
        {alignedOps.map((row, ri) => (
          <div key={ri} className={styles.equationRow}>
            <span className={styles.eqSign}>{ri === 0 ? '' : '+'}</span>
            {row.map((letter, ci) =>
              letter === null ? (
                <div key={ci} style={{ width: '2.4rem' }} />
              ) : (
                <LetterCell
                  key={`${ri}-${ci}`}
                  letter={letter}
                  value={assignment[letter] ?? null}
                  selected={selected === letter}
                  correct={columnStatuses[ci]?.correct}
                  wrong={columnStatuses[ci]?.partial}
                  onClick={() => setSelected(letter)}
                />
              )
            )}
          </div>
        ))}
        <div className={styles.eqDivider} style={{ width: `${len * 2.8}rem` }} />
        <div className={styles.equationRow}>
          <span className={styles.eqSign} />
          {puzzle.result.map((letter, ci) => (
            <LetterCell
              key={`r-${ci}`}
              letter={letter}
              value={assignment[letter] ?? null}
              selected={selected === letter}
              correct={columnStatuses[ci]?.correct}
              wrong={columnStatuses[ci]?.partial}
              onClick={() => setSelected(letter)}
            />
          ))}
        </div>
      </div>

      {/* Selected indicator */}
      <div className={styles.selectedIndicator}>
        {selected
          ? `"${selected}" 에 넣을 숫자를 아래에서 선택하세요`
          : '글자 칸을 클릭해서 선택하세요'}
      </div>

      {/* Palette */}
      <DigitPalette
        assignment={assignment}
        selectedLetter={selected}
        onDigitClick={assign}
      />

      {/* Duplicate warning */}
      {dup && (
        <p className={styles.duplicateWarning} style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
          ⚠️ 같은 숫자를 두 글자에 사용할 수 없어요!
        </p>
      )}

      {/* Result Banner */}
      {isComplete && !dup && (
        <div className={`${styles.resultBanner} ${isCorrect ? styles.resultCorrect : styles.resultWrong}`}>
          {isCorrect ? (
            <>
              🎉 정답입니다! <br />
              {puzzle.operands
                .map((op) => op.map((l) => assignment[l]).join(''))
                .join(' + ')}{' '}
              = {puzzle.result.map((l) => assignment[l]).join('')}
            </>
          ) : (
            <>❌ 아직 틀렸어요. 다시 확인해보세요!</>
          )}
        </div>
      )}

      {/* Hint */}
      {showHint && <div className={styles.hintBox}>💡 힌트: {puzzle.hint}</div>}

      {/* Actions */}
      <div className={styles.actions}>
        <button className={styles.btnSecondary} onClick={() => setShowHint((v) => !v)}>
          {showHint ? '힌트 숨기기' : '힌트 보기'}
        </button>
        {!revealed && (
          <button className={styles.btnSecondary} onClick={reveal}>
            정답 보기
          </button>
        )}
        <button className={styles.btnPrimary} onClick={reset}>
          다시 풀기
        </button>
      </div>
    </>
  );
}

// ─── Level 1 ─────────────────────────────────────────────────────
function Level1Panel() {
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const puzzle = LEVEL1_PUZZLES[puzzleIdx];

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>쉬운 복면산</h2>
        <p className={styles.cardDesc}>
          각 알파벳은 0~9 중 서로 다른 한 자리 숫자입니다. 등식이 성립하도록 채워보세요!
        </p>
      </div>

      <div className={styles.puzzleSelector}>
        {LEVEL1_PUZZLES.map((p, i) => (
          <button
            key={p.id}
            className={`${styles.puzzleTab} ${i === puzzleIdx ? styles.puzzleTabActive : ''}`}
            onClick={() => setPuzzleIdx(i)}
          >
            {p.title}
          </button>
        ))}
      </div>

      <div className={styles.cardDesc} style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
        {puzzle.description}
      </div>

      <AdditionPanel key={puzzle.id} puzzle={puzzle} />
    </div>
  );
}

// ─── Level 2 ─────────────────────────────────────────────────────
function Level2Panel() {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>SEND + MORE = MONEY</h2>
        <p className={styles.cardDesc}>{LEVEL2_PUZZLE.description}</p>
      </div>

      <div style={{ marginBottom: '1.25rem' }} />
      <AdditionPanel key={LEVEL2_PUZZLE.id} puzzle={LEVEL2_PUZZLE} />
    </div>
  );
}

// ─── Level 3 ─────────────────────────────────────────────────────
function Level3Panel() {
  const allLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const [assignment, setAssignment] = useState<Assignment>(() => makeEmpty(allLetters));
  const [selected, setSelected] = useState<string | null>(null);
  const [repeat, setRepeat] = useState(LEVEL3_PUZZLE.defaultRepeat);
  const [showHint, setShowHint] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const leftLetters = getLevel3Letters(repeat);
  const rightLetters = getLevel3ResultLetters(repeat);

  const assign = useCallback(
    (digit: number) => {
      if (!selected) return;
      setAssignment((prev) => ({ ...prev, [selected]: digit }));
      const idx = allLetters.indexOf(selected);
      const next = allLetters.slice(idx + 1).find((l) => assignment[l] === null);
      if (next) setSelected(next);
    },
    [selected, allLetters, assignment]
  );

  const reset = () => {
    setAssignment(makeEmpty(allLetters));
    setSelected(null);
    setRevealed(false);
    setShowHint(false);
  };

  const reveal = () => {
    setAssignment({ ...LEVEL3_PUZZLE.solution });
    setRevealed(true);
    setSelected(null);
  };

  const { isComplete, isCorrect } = validateReversal(repeat, assignment);
  const dup = hasDuplicate(assignment);

  const leftNum = buildLevel3Number(repeat, assignment);
  const rightNum = buildLevel3Reversed(repeat, assignment);
  const F = assignment['F'];

  // Check if solution works for current repeat (discover moment)
  const isSolutionForAnyRepeat =
    isComplete && isCorrect && !dup;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>ABC···CDE × F = EDC···CBA</h2>
        <p className={styles.cardDesc}>{LEVEL3_PUZZLE.description}</p>
      </div>

      {/* Repeat slider */}
      <div className={styles.repeatSlider}>
        <span className={styles.repeatLabel}>가운데 C 개수:</span>
        <input
          type="range"
          min={2}
          max={6}
          value={repeat}
          onChange={(e) => setRepeat(Number(e.target.value))}
        />
        <span className={styles.repeatValue}>{repeat}개</span>
      </div>

      {/* Equation display */}
      <div className={styles.level3Area}>
        {/* Left: ABCC...CDE */}
        <div className={styles.level3Row}>
          {leftLetters.map((letter, i) => (
            <LetterCell
              key={`l-${i}`}
              letter={letter}
              value={assignment[letter] ?? null}
              selected={selected === letter}
              onClick={() => setSelected(letter)}
            />
          ))}
          <span className={styles.multiSignCell}>×</span>
          <LetterCell
            letter="F"
            value={assignment['F'] ?? null}
            selected={selected === 'F'}
            onClick={() => setSelected('F')}
          />
        </div>

        {/* Divider */}
        <div
          className={styles.eqDivider}
          style={{ width: `${(leftLetters.length + 2) * 2.8}rem` }}
        />

        {/* Right: EDC...CBA */}
        <div className={styles.level3Row}>
          {rightLetters.map((letter, i) => (
            <LetterCell
              key={`r-${i}`}
              letter={letter}
              value={assignment[letter] ?? null}
              selected={selected === letter}
              onClick={() => setSelected(letter)}
            />
          ))}
        </div>
      </div>

      {/* Numeric preview (if partially filled) */}
      {(leftNum !== null || rightNum !== null || F !== null) && (
        <div className={styles.verifyRow} style={{ marginBottom: '1rem' }}>
          <span className={styles.verifyNum}>{leftNum ?? '?'}</span>
          <span className={styles.verifyOp}>×</span>
          <span className={styles.verifyNum}>{F ?? '?'}</span>
          <span className={styles.verifyOp}>=</span>
          <span
            className={
              isComplete && !dup
                ? isCorrect
                  ? styles.verifyResult
                  : styles.verifyResultWrong
                : styles.verifyNum
            }
          >
            {leftNum !== null && F !== null ? leftNum * F : '?'}
          </span>
          <span className={styles.verifyOp}>→ 뒤집으면</span>
          <span className={styles.verifyNum}>{rightNum ?? '?'}</span>
        </div>
      )}

      {/* Selected indicator */}
      <div className={styles.selectedIndicator}>
        {selected
          ? `"${selected}" 에 넣을 숫자를 아래에서 선택하세요`
          : '글자 칸을 클릭해서 선택하세요'}
      </div>

      {/* Palette */}
      <DigitPalette
        assignment={assignment}
        selectedLetter={selected}
        onDigitClick={assign}
      />

      {dup && (
        <p className={styles.duplicateWarning} style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
          ⚠️ 같은 숫자를 두 글자에 사용할 수 없어요!
        </p>
      )}

      {/* Result */}
      {isComplete && !dup && (
        <div
          className={`${styles.resultBanner} ${
            isCorrect ? styles.resultCorrect : styles.resultWrong
          }`}
        >
          {isCorrect ? (
            <>
              🎉 정답! {leftNum} × {F} = {leftNum! * F!} = {rightNum} (뒤집힌 수!)
              <br />
              <span style={{ fontSize: '0.9rem', marginTop: '0.4rem', display: 'block' }}>
                슬라이더로 C 개수를 바꿔봐도 여전히 성립하나요? 🔍
              </span>
            </>
          ) : (
            <>❌ 아직 틀렸어요. 다시 확인해보세요!</>
          )}
        </div>
      )}

      {/* Discovery banner when correct and user tries different repeats */}
      {isSolutionForAnyRepeat && repeat !== LEVEL3_PUZZLE.defaultRepeat && (
        <div className={`${styles.resultBanner} ${styles.resultLevel3Discovery}`}>
          ✨ 신기하다! C가 {repeat}개여도 똑같이 성립해요!<br />
          <span style={{ fontSize: '0.85rem' }}>
            이 패턴은 C의 개수가 몇 개든 항상 성립합니다. 수학적 무한 패턴이에요!
          </span>
        </div>
      )}

      {showHint && (
        <div className={styles.hintBox}>
          💡 힌트: F = 4, C = 9 부터 시작해보세요. 9 × 4 = 36, 올림 4, 또 9 × 4 = 36 + 4 = 40... 같은 패턴이 반복돼요!
        </div>
      )}

      <div className={styles.actions}>
        <button className={styles.btnSecondary} onClick={() => setShowHint((v) => !v)}>
          {showHint ? '힌트 숨기기' : '힌트 보기'}
        </button>
        {!revealed && (
          <button className={styles.btnSecondary} onClick={reveal}>
            정답 보기
          </button>
        )}
        <button className={styles.btnPrimary} onClick={reset}>
          다시 풀기
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function CryptarithmeticPage() {
  const [level, setLevel] = useState<1 | 2 | 3>(1);

  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <Link href="/puzzle" className={styles.backLink}>
          ← 퍼즐 목록
        </Link>
        <h1 className={styles.title}>🔤 복면산 (Cryptarithmetic)</h1>
        <p className={styles.subtitle}>
          알파벳이 숫자를 가리고 있어요! 등식이 성립하도록 각 글자에 숫자를 대입하세요.
        </p>
      </header>

      {/* Level tabs */}
      <div className={styles.levelTabs}>
        {([1, 2, 3] as const).map((l) => (
          <button
            key={l}
            className={`${styles.levelTab} ${level === l ? styles.levelTabActive : ''}`}
            onClick={() => setLevel(l)}
          >
            {l === 1 ? '레벨 1 · 입문' : l === 2 ? '레벨 2 · 클래식' : '레벨 3 · 탐구'}
          </button>
        ))}
      </div>

      {level === 1 && <Level1Panel />}
      {level === 2 && <Level2Panel />}
      {level === 3 && <Level3Panel />}
    </div>
  );
}
