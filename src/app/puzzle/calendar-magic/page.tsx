'use client';

import React, { useState, useMemo } from 'react';
import styles from './page.module.css';
import {
  generateCalendar,
  isValidCenter,
  get3x3Block,
  get3x3Sum,
  MONTH_NAMES,
  DAY_NAMES,
} from '@/lib/puzzles/calendarMagic';

type Mode = 'magic' | 'discover';

export default function CalendarMagicPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [mode, setMode] = useState<Mode>('discover');
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showReveal, setShowReveal] = useState(false);

  const grid = useMemo(() => generateCalendar(year, month), [year, month]);

  const selectedSum = selected ? get3x3Sum(grid, selected.row, selected.col) : null;
  const selectedCenter = selected ? grid[selected.row][selected.col].date : null;
  const block3x3 = selected ? get3x3Block(grid, selected.row, selected.col) : [];

  function prevMonth() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
    resetSelection();
  }

  function nextMonth() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
    resetSelection();
  }

  function resetSelection() {
    setSelected(null);
    setGuess('');
    setFeedback(null);
    setShowHint(false);
    setShowReveal(false);
  }

  function handleCellClick(row: number, col: number) {
    const cell = grid[row][col];
    if (cell.date === null) return;
    if (!isValidCenter(grid, row, col)) return;
    if (selected?.row === row && selected?.col === col) {
      resetSelection();
      return;
    }
    setSelected({ row, col });
    setGuess('');
    setFeedback(null);
    setShowHint(false);
    setShowReveal(false);
  }

  function checkGuess() {
    if (!selectedSum) return;
    const val = parseInt(guess, 10);
    if (val === selectedSum) {
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }
  }

  function isInBlock(row: number, col: number) {
    if (!selected) return false;
    return Math.abs(row - selected.row) <= 1 && Math.abs(col - selected.col) <= 1;
  }

  function cellClass(row: number, col: number) {
    const cell = grid[row][col];
    if (cell.date === null) return `${styles.cell} ${styles.empty}`;

    const classes = [styles.cell];
    const isCenter = selected?.row === row && selected?.col === col;
    const inBlock = isInBlock(row, col);
    const validCenter = isValidCenter(grid, row, col);

    if (isCenter) classes.push(styles.center);
    else if (inBlock) classes.push(styles.inBlock);

    if (col === 0) classes.push(styles.sunday);
    else if (col === 6) classes.push(styles.saturday);

    if (validCenter) classes.push(styles.clickable);
    else classes.push(styles.disabled);

    return classes.join(' ');
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <span>🗓️</span> 달력 마법
        </h1>
        <p className={styles.subtitle}>
          달력에서 3×3 블록을 선택하면 합계를 단번에 맞출 수 있어요! 비밀을 찾아보세요.
        </p>
      </div>

      <div className={styles.modeToggle}>
        <button
          className={`${styles.modeBtn} ${mode === 'discover' ? styles.active : ''}`}
          onClick={() => { setMode('discover'); resetSelection(); }}
        >
          🔍 비밀 찾기
        </button>
        <button
          className={`${styles.modeBtn} ${mode === 'magic' ? styles.active : ''}`}
          onClick={() => { setMode('magic'); resetSelection(); }}
        >
          🎩 마술 보기
        </button>
      </div>

      <div className={styles.card}>
        <div className={styles.monthNav}>
          <button className={styles.navBtn} onClick={prevMonth}>◀</button>
          <span className={styles.monthLabel}>{year}년 {MONTH_NAMES[month - 1]}</span>
          <button className={styles.navBtn} onClick={nextMonth}>▶</button>
        </div>

        <div className={styles.calendarGrid}>
          {DAY_NAMES.map(d => (
            <div key={d} className={styles.dayHeader}>{d}</div>
          ))}
          {grid.map((week, ri) =>
            week.map((cell, ci) => (
              <div
                key={`${ri}-${ci}`}
                className={cellClass(ri, ci)}
                onClick={() => handleCellClick(ri, ci)}
              >
                {cell.date ?? ''}
              </div>
            ))
          )}
        </div>

        {!selected && (
          <p className={styles.instruction}>
            {mode === 'magic'
              ? '날짜를 클릭하면 주변 9칸 합계를 즉시 알려드립니다!\n(가장자리 날짜는 선택 불가)'
              : '날짜를 클릭하고 9칸 합계를 직접 계산해보세요. 규칙을 찾을 수 있을까요?'}
          </p>
        )}

        {selected && mode === 'magic' && (
          <div className={styles.resultBox}>
            <div className={styles.resultTitle}>9칸 합계</div>
            <div className={styles.resultSum}>{selectedSum}</div>
            <div className={styles.resultHint}>
              중앙 날짜 {selectedCenter} × 9 = {selectedSum}
            </div>
            <div className={styles.magicReveal}>
              <strong>왜 그럴까요?</strong> 중앙을 <strong>n</strong>이라 하면,<br />
              주변 8개 날짜는 <strong>n−8, n−7, n−6, n−1, n+1, n+6, n+7, n+8</strong>이에요.<br />
              모두 더하면 ±차이가 딱 상쇄되어 <strong>9n</strong>이 됩니다! ✨
            </div>
          </div>
        )}

        {selected && mode === 'discover' && (
          <>
            <div className={styles.resultBox}>
              <div className={styles.resultTitle}>선택한 중앙 날짜</div>
              <div className={styles.resultSum}>{selectedCenter}</div>
              <div className={styles.resultHint}>
                9칸을 모두 더하면? 아래에 입력해보세요!
              </div>
            </div>

            <div className={styles.guessSection}>
              <div className={styles.guessLabel}>9칸 합계를 예상해보세요</div>
              <div className={styles.guessRow}>
                <input
                  className={styles.guessInput}
                  type="number"
                  value={guess}
                  onChange={e => { setGuess(e.target.value); setFeedback(null); }}
                  placeholder="합계 입력"
                  onKeyDown={e => e.key === 'Enter' && checkGuess()}
                />
                <button
                  className={styles.guessBtn}
                  onClick={checkGuess}
                  disabled={!guess}
                >
                  확인
                </button>
              </div>

              {feedback === 'correct' && (
                <div className={styles.feedbackCorrect}>
                  🎉 정답! {selectedCenter} × 9 = {selectedSum}
                </div>
              )}
              {feedback === 'wrong' && (
                <div className={styles.feedbackWrong}>
                  아직 아니에요! 9칸을 천천히 다시 더해보세요.
                </div>
              )}

              {!showHint && (
                <button className={styles.hintBtn} onClick={() => setShowHint(true)}>
                  힌트 보기
                </button>
              )}

              {showHint && !showReveal && (
                <>
                  <div className={styles.magicReveal}>
                    💡 <strong>힌트:</strong> 중앙 날짜를 <strong>n</strong>이라 하면,<br />
                    위아래 날짜들은 n에서 얼마씩 차이가 날까요?<br />
                    달력에서 한 주 위는 7 차이, 옆은 1 차이에요!
                  </div>
                  <button className={styles.hintBtn} onClick={() => setShowReveal(true)}>
                    정답 공개
                  </button>
                </>
              )}

              {showReveal && (
                <div className={styles.magicReveal}>
                  <strong>비밀 공개!</strong><br />
                  중앙을 <strong>n</strong>이라 하면 9칸은:<br />
                  {`n−8, n−7, n−6`}<br />
                  {`n−1, n, n+1`}<br />
                  {`n+6, n+7, n+8`}<br /><br />
                  합 = 9n + (−8−7−6−1+0+1+6+7+8) = <strong>9n</strong> ✨
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
