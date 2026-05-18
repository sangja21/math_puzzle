'use client';

import React, { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import {
  type Color,
  type GameState,
  type Guess,
  COLOR_COUNT,
  COLORS,
  createGame,
  submitGuess,
} from '@/lib/puzzles/mastermind';

type CodeLength = 3 | 4 | 5;
const CODE_LENGTHS: CodeLength[] = [3, 4, 5];

// 길이별 최대 라운드 — 정보이론적으로 6색 길이 N 의 탐색공간이 6^N. 라운드는 넉넉히.
const MAX_ROUNDS_BY_LENGTH: Record<CodeLength, number> = {
  3: 8,
  4: 10,
  5: 12,
};

const COLOR_LABEL: Record<Color, string> = {
  0: '빨강',
  1: '주황',
  2: '노랑',
  3: '초록',
  4: '파랑',
  5: '보라',
};

function emptyDraft(length: number): (Color | null)[] {
  return Array.from({ length }, () => null);
}

export default function MastermindPage() {
  const [codeLength, setCodeLength] = useState<CodeLength>(4);
  const [game, setGame] = useState<GameState>(() =>
    createGame(4, MAX_ROUNDS_BY_LENGTH[4]),
  );
  const [draft, setDraft] = useState<(Color | null)[]>(() => emptyDraft(4));
  const [activeIdx, setActiveIdx] = useState(0);

  const isPlaying = game.status === 'playing';
  const draftComplete = draft.every((c) => c !== null);

  const roundsLeft = game.maxRounds - game.history.length;

  // 빈 라운드 개수 (현재 입력 줄 1개 포함하지 않음)
  const emptyRoundCount = useMemo(() => {
    const used = game.history.length + (isPlaying ? 1 : 0);
    return Math.max(0, game.maxRounds - used);
  }, [game.history.length, game.maxRounds, isPlaying]);

  const startNewGame = useCallback((length: CodeLength) => {
    setGame(createGame(length, MAX_ROUNDS_BY_LENGTH[length]));
    setDraft(emptyDraft(length));
    setActiveIdx(0);
  }, []);

  const handleLengthChange = useCallback(
    (len: CodeLength) => {
      if (len === codeLength) return;
      setCodeLength(len);
      startNewGame(len);
    },
    [codeLength, startNewGame],
  );

  const handlePickColor = useCallback(
    (color: Color) => {
      if (!isPlaying) return;
      setDraft((prev) => {
        const next = [...prev];
        // 활성 셀이 비어있지 않더라도 색을 덮어쓰기. 다음 빈 셀로 활성 이동.
        next[activeIdx] = color;
        return next;
      });
      // 다음 빈 셀로 이동 (없으면 그대로)
      setActiveIdx((prevIdx) => {
        const tentative = [...draft];
        tentative[prevIdx] = color;
        for (let i = prevIdx + 1; i < tentative.length; i++) {
          if (tentative[i] === null) return i;
        }
        for (let i = 0; i < tentative.length; i++) {
          if (tentative[i] === null) return i;
        }
        return prevIdx;
      });
    },
    [activeIdx, draft, isPlaying],
  );

  const handleCellClick = useCallback(
    (idx: number) => {
      if (!isPlaying) return;
      setActiveIdx(idx);
    },
    [isPlaying],
  );

  const handleClearCell = useCallback(
    (idx: number) => {
      if (!isPlaying) return;
      setDraft((prev) => {
        const next = [...prev];
        next[idx] = null;
        return next;
      });
      setActiveIdx(idx);
    },
    [isPlaying],
  );

  const handleSubmit = useCallback(() => {
    if (!isPlaying || !draftComplete) return;
    const guess = draft.filter((c): c is Color => c !== null) as Guess;
    if (guess.length !== game.length) return;
    setGame((g) => submitGuess(g, guess));
    setDraft(emptyDraft(game.length));
    setActiveIdx(0);
  }, [draft, draftComplete, game.length, isPlaying]);

  const handleResetDraft = useCallback(() => {
    if (!isPlaying) return;
    setDraft(emptyDraft(game.length));
    setActiveIdx(0);
  }, [game.length, isPlaying]);

  const handleNewGame = useCallback(() => {
    startNewGame(codeLength);
  }, [codeLength, startNewGame]);

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.homeBtn}>🏠 메인으로</Link>

      <header className={styles.header}>
        <h1 className={styles.title}>
          <span>🎯</span> 마스터마인드
        </h1>
        <p className={styles.subtitle}>
          숨겨진 색 코드를 단서만으로 깨라. <strong>검정 페그</strong>는 자리·색 모두 맞음,{' '}
          <strong>흰 페그</strong>는 색만 맞고 자리 틀림.
        </p>
      </header>

      <div className={styles.difficultyRow}>
        {CODE_LENGTHS.map((n) => (
          <button
            key={n}
            type="button"
            className={`${styles.diffChip} ${codeLength === n ? styles.diffChipActive : ''}`}
            onClick={() => handleLengthChange(n)}
          >
            길이 {n}
          </button>
        ))}
        <div className={styles.puzzleIdx}>
          라운드 {game.history.length} / {game.maxRounds}
        </div>
      </div>

      <section className={styles.stage}>
        <div className={styles.statsRow}>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>색 수</span>
            <span className={styles.statValue}>{COLOR_COUNT}</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>남은 라운드</span>
            <span className={styles.statValue}>{roundsLeft}</span>
          </div>
          <div
            className={`${styles.statBox} ${
              game.status === 'won'
                ? styles.statBoxGood
                : game.status === 'lost'
                  ? styles.statBoxBad
                  : ''
            }`}
          >
            <span className={styles.statLabel}>상태</span>
            <span className={styles.statValue}>
              {game.status === 'won' ? '✓ 성공' : game.status === 'lost' ? '✗ 실패' : '진행 중'}
            </span>
          </div>
        </div>

        <div className={styles.board}>
          {/* 비밀 코드 — 끝났을 때만 공개 */}
          <div className={styles.secretRow}>
            <span className={styles.secretLabel}>비밀</span>
            <div className={styles.codeCells}>
              {Array.from({ length: game.length }).map((_, i) => {
                const revealed = !isPlaying;
                return (
                  <div
                    key={i}
                    className={`${styles.codeCell} ${
                      revealed ? styles[`color_${game.secret[i]}`] : styles.codeCellHidden
                    }`}
                    aria-label={revealed ? COLOR_LABEL[game.secret[i]] : '비밀'}
                  >
                    {!revealed && <span className={styles.questionMark}>?</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 과거 라운드들 (오래된 게 위로) */}
          {game.history.map((entry, rowIdx) => (
            <div key={`h-${rowIdx}`} className={styles.row}>
              <span className={styles.rowIdx}>{rowIdx + 1}</span>
              <div className={styles.codeCells}>
                {entry.guess.map((c, i) => (
                  <div
                    key={i}
                    className={`${styles.codeCell} ${styles[`color_${c}`]}`}
                    aria-label={COLOR_LABEL[c]}
                  />
                ))}
              </div>
              <div className={styles.pegBox} aria-label={`검정 ${entry.score.black}, 흰 ${entry.score.white}`}>
                {Array.from({ length: entry.score.black }).map((_, i) => (
                  <span key={`b-${i}`} className={`${styles.peg} ${styles.pegBlack}`} />
                ))}
                {Array.from({ length: entry.score.white }).map((_, i) => (
                  <span key={`w-${i}`} className={`${styles.peg} ${styles.pegWhite}`} />
                ))}
                {Array.from({ length: game.length - entry.score.black - entry.score.white }).map(
                  (_, i) => (
                    <span key={`e-${i}`} className={`${styles.peg} ${styles.pegEmpty}`} />
                  ),
                )}
              </div>
            </div>
          ))}

          {/* 입력 행 */}
          {isPlaying && (
            <div className={`${styles.row} ${styles.rowActive}`}>
              <span className={styles.rowIdx}>{game.history.length + 1}</span>
              <div className={styles.codeCells}>
                {draft.map((c, i) => {
                  const isActive = i === activeIdx;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleCellClick(i)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        handleClearCell(i);
                      }}
                      className={`${styles.codeCell} ${styles.codeCellInput} ${
                        c !== null ? styles[`color_${c}`] : styles.codeCellEmpty
                      } ${isActive ? styles.codeCellActive : ''}`}
                      aria-label={
                        c !== null ? `${i + 1}번 자리: ${COLOR_LABEL[c]}` : `${i + 1}번 자리: 비어있음`
                      }
                    >
                      {c === null && <span className={styles.cellNum}>{i + 1}</span>}
                    </button>
                  );
                })}
              </div>
              <div className={styles.pegBox} aria-hidden="true">
                {Array.from({ length: game.length }).map((_, i) => (
                  <span key={i} className={`${styles.peg} ${styles.pegEmpty}`} />
                ))}
              </div>
            </div>
          )}

          {/* 남은 빈 라운드 — 시각적 진척도 */}
          {Array.from({ length: emptyRoundCount }).map((_, i) => (
            <div key={`e-${i}`} className={`${styles.row} ${styles.rowDisabled}`}>
              <span className={styles.rowIdx}>
                {game.history.length + (isPlaying ? 2 : 1) + i}
              </span>
              <div className={styles.codeCells}>
                {Array.from({ length: game.length }).map((_, j) => (
                  <div key={j} className={`${styles.codeCell} ${styles.codeCellLocked}`} />
                ))}
              </div>
              <div className={styles.pegBox} aria-hidden="true">
                {Array.from({ length: game.length }).map((_, j) => (
                  <span key={j} className={`${styles.peg} ${styles.pegEmpty}`} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {game.status === 'won' && (
          <div className={`${styles.celebrate} ${styles.celebrateWin}`}>
            <span className={styles.celebrateText}>
              🎉 {game.history.length} 라운드 만에 깼다!
            </span>
            <button type="button" className={styles.nextBtn} onClick={handleNewGame}>
              ▶ 새 게임
            </button>
          </div>
        )}
        {game.status === 'lost' && (
          <div className={`${styles.celebrate} ${styles.celebrateLose}`}>
            <span className={styles.celebrateText}>😢 라운드 소진 — 비밀이 공개됐어요</span>
            <button type="button" className={styles.nextBtn} onClick={handleNewGame}>
              ▶ 다시 도전
            </button>
          </div>
        )}
      </section>

      <section className={styles.controlPanel}>
        <div className={styles.palette}>
          {COLORS.map((_, i) => {
            const c = i as Color;
            return (
              <button
                key={c}
                type="button"
                className={`${styles.colorBtn} ${styles[`color_${c}`]}`}
                onClick={() => handlePickColor(c)}
                disabled={!isPlaying}
                aria-label={`색 선택: ${COLOR_LABEL[c]}`}
                title={COLOR_LABEL[c]}
              />
            );
          })}
        </div>

        <div className={styles.btnRow}>
          <button
            type="button"
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={!isPlaying || !draftComplete}
          >
            ✓ 제출
          </button>
          <button
            type="button"
            className={styles.resetBtn}
            onClick={handleResetDraft}
            disabled={!isPlaying}
          >
            🧹 행 지우기
          </button>
          <button type="button" className={styles.newBtn} onClick={handleNewGame}>
            🎲 새 게임
          </button>
        </div>
      </section>

      <details className={styles.help}>
        <summary>마스터마인드, 어떻게 풀까? 🤔</summary>
        <div className={styles.helpBody}>
          <p>
            <strong>규칙:</strong> 컴퓨터가 6가지 색 중 골라 길이 N의 비밀 코드를 만듭니다.
            팔레트에서 색을 골라 자리를 채우고 <strong>제출</strong>하면, 라운드마다 페그로 채점돼요.
          </p>
          <ul>
            <li>
              <span className={`${styles.peg} ${styles.pegBlack} ${styles.pegInline}`} />
              <strong>검정 페그</strong>: 자리와 색이 모두 정확히 맞은 핀의 개수
            </li>
            <li>
              <span className={`${styles.peg} ${styles.pegWhite} ${styles.pegInline}`} />
              <strong>흰 페그</strong>: 색은 포함됐지만 자리가 다른 핀의 개수
            </li>
          </ul>
          <p>
            <strong>팁 — 정보 효율적인 첫 추측:</strong> Knuth(1977)는 4핀 6색에서{' '}
            <em>두 가지 색을 두 칸씩 (예: 빨빨주주)</em> 으로 시작하면 평균 4.5라운드 안에 풀 수
            있음을 보였어요. 첫 라운드는 같은 색을 반복해 단서를 압축하는 게 좋아요.
          </p>
          <p className={styles.helpHint}>
            셀을 <strong>클릭</strong>하면 활성 자리가 바뀝니다. 셀을 <strong>우클릭</strong>하면 그
            자리만 비워져요.
          </p>
        </div>
      </details>
    </div>
  );
}
