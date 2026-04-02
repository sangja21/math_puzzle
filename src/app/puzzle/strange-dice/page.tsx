'use client';

import React, { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  NORMAL_DIE,
  SICHERMAN_A,
  SICHERMAN_B,
  rollSichermanDice,
  getSumTable,
  validateAnswer,
  RollHistory,
  getFrequencyFromHistory,
} from '@/lib/puzzles/sichermanDice';
import styles from './page.module.css';

type Phase = 'intro' | 'playing' | 'answer' | 'complete';

// 단계별 힌트
const HINTS = [
  {
    title: '힌트 1: 합 분포 표',
    content: '일반 주사위 두 개의 합 분포표를 보세요. 이상한 주사위도 이것과 똑같은 분포를 만들어야 해요!',
    showTable: true,
  },
  {
    title: '힌트 2: 합이 2가 되려면?',
    content: '합이 2가 나오는 경우는 딱 1가지여야 해요.\n두 주사위 모두 최솟값이 1이어야 하겠죠?\n→ 양쪽 주사위 모두 1을 하나씩 가지고 있어요!',
    showTable: false,
  },
  {
    title: '힌트 3: 합이 12가 되려면?',
    content: '합이 12가 나오는 경우도 딱 1가지여야 해요.\n한쪽이 4라면 다른 쪽은 8이 필요하고,\n한쪽이 5라면 다른 쪽은 7이 필요해요.\n→ 두 주사위의 최댓값의 합이 12가 되어야 해요!',
    showTable: false,
  },
  {
    title: '힌트 4: 핵심 단서!',
    content: '주사위 A의 눈의 합을 생각해보세요.\n일반 주사위는 1+2+3+4+5+6 = 21이에요.\n\n이상한 주사위도 각 주사위 눈의 합이 같을 필요는 없지만,\n두 주사위 눈의 총합은 같아야 해요 (21+21 = 42).\n\n만약 A의 최댓값이 4라면? A = {1, ?, ?, ?, ?, 4}\nA의 합이 작으니 B의 합이 커야 하고, B의 최댓값은 8이 될 수 있어요!',
    showTable: false,
  },
  {
    title: '힌트 5: 거의 다 왔어요!',
    content: '주사위 A: {1, 2, 2, 3, 3, 4}\n주사위 B: {1, ?, ?, ?, ?, 8}\n\nB의 나머지 4개 면을 찾아보세요!\n합이 7이 되는 경우가 6가지여야 한다는 걸 이용해보세요.',
    showTable: false,
  },
];

export default function StrangeDicePage() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [history, setHistory] = useState<RollHistory[]>([]);
  const [lastRoll, setLastRoll] = useState<{ sum: number } | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [hintLevel, setHintLevel] = useState(-1); // -1: 안 봄, 0~4: 힌트 단계
  const [showCompare, setShowCompare] = useState(false);

  // 정답 입력
  const [userDieA, setUserDieA] = useState<string[]>(['', '', '', '', '', '']);
  const [userDieB, setUserDieB] = useState<string[]>(['', '', '', '', '', '']);
  const [answerResult, setAnswerResult] = useState<{ valid: boolean; reason: string } | null>(null);

  const rollIdRef = useRef(0);

  // 주사위 굴리기
  const handleRoll = useCallback(() => {
    if (isRolling) return;
    setIsRolling(true);
    setAnswerResult(null);

    const animInterval = setInterval(() => {
      setLastRoll({ sum: Math.floor(Math.random() * 11) + 2 });
    }, 80);

    setTimeout(() => {
      clearInterval(animInterval);
      const result = rollSichermanDice();
      rollIdRef.current += 1;
      setLastRoll({ sum: result.sum });
      setHistory((prev) => [{ id: rollIdRef.current, sum: result.sum }, ...prev]);
      setIsRolling(false);
    }, 600);
  }, [isRolling]);

  // 10회 연속 굴리기
  const handleRoll10 = useCallback(() => {
    if (isRolling) return;
    setIsRolling(true);
    setAnswerResult(null);

    const results: RollHistory[] = [];
    for (let i = 0; i < 10; i++) {
      rollIdRef.current += 1;
      const result = rollSichermanDice();
      results.push({ id: rollIdRef.current, sum: result.sum });
    }

    setLastRoll({ sum: results[0].sum });
    setHistory((prev) => [...results, ...prev]);
    setIsRolling(false);
  }, [isRolling]);

  // 정답 확인
  const handleSubmit = useCallback(() => {
    const dieA = userDieA.map((v) => parseInt(v, 10)).sort((a, b) => a - b);
    const dieB = userDieB.map((v) => parseInt(v, 10)).sort((a, b) => a - b);

    if (dieA.some(isNaN) || dieB.some(isNaN)) {
      setAnswerResult({ valid: false, reason: '모든 칸에 숫자를 입력해주세요.' });
      return;
    }

    const result = validateAnswer(dieA, dieB);
    setAnswerResult(result);

    if (result.valid) {
      setTimeout(() => setPhase('complete'), 800);
    }
  }, [userDieA, userDieB]);

  // 주사위 입력 핸들러
  const handleDieInput = (die: 'A' | 'B', index: number, value: string) => {
    const digitsOnly = value.replace(/[^0-9]/g, '');
    if (die === 'A') {
      setUserDieA((prev) => {
        const next = [...prev];
        next[index] = digitsOnly;
        return next;
      });
    } else {
      setUserDieB((prev) => {
        const next = [...prev];
        next[index] = digitsOnly;
        return next;
      });
    }
    setAnswerResult(null);
  };

  // 다음 힌트 보기
  const handleNextHint = useCallback(() => {
    setHintLevel((prev) => Math.min(prev + 1, HINTS.length - 1));
  }, []);

  const frequency = getFrequencyFromHistory(history);
  const normalTable = getSumTable(NORMAL_DIE, NORMAL_DIE);
  const sichermanTable = getSumTable(SICHERMAN_A, SICHERMAN_B);

  // ─── 인트로 화면 ───
  if (phase === 'intro') {
    return (
      <div className={styles.container}>
        <Link href="/puzzles" className={styles.homeButton}>🏠 목록으로</Link>
        <header className={styles.header}>
          <h1 className={styles.title}>🎲 이상한 주사위</h1>
          <p className={styles.subtitle}>눈의 수가 1~6이 아닌 주사위가 있다?!</p>
        </header>
        <div className={styles.storyCard}>
          <p>
            두 개의 주사위를 던지면 나오는 두 눈의 합은 <strong>2부터 12</strong>까지입니다.
          </p>
          <p style={{ marginTop: 12 }}>
            그런데 눈의 수가 <strong>1, …, 6이 아닌</strong> 이상한 두 주사위를 조사해 보니,
            이 둘을 던졌을 때 나오는 두 눈의 합이 2부터 12까지일 뿐 아니라,
            <strong> 그 확률들마저 정상인 두 주사위를 던질 때와 똑같았습니다.</strong>
          </p>
          <p style={{ marginTop: 12 }}>
            두 주사위가 똑같을 필요는 없지만, 주사위의 눈은 모두 <strong>1보다 크거나 같은 자연수</strong>입니다.
          </p>
          <p style={{ marginTop: 16, fontSize: '1.2rem', fontWeight: 700 }}>
            두 주사위의 눈은 과연 무엇이었을까요? 🤔
          </p>
        </div>
        <button className={styles.startButton} onClick={() => setPhase('playing')}>
          🎲 주사위 굴려보기!
        </button>
      </div>
    );
  }

  // ─── 완료 화면 ───
  if (phase === 'complete') {
    return (
      <div className={styles.container}>
        <Link href="/puzzles" className={styles.homeButton}>🏠 목록으로</Link>
        <header className={styles.header}>
          <h1 className={styles.title}>🎲 이상한 주사위</h1>
        </header>
        <div className={styles.completeScreen}>
          <div className={styles.celebrationEmoji}>🎉</div>
          <h2>정답입니다!</h2>
          <p>
            이 주사위는 <strong>시커만 주사위(Sicherman Dice)</strong>라고 불립니다.
          </p>
          <div className={styles.answerReveal}>
            <div className={styles.answerDie}>
              <span className={styles.answerLabel}>주사위 A</span>
              <div className={styles.answerFaces}>
                {SICHERMAN_A.map((v, i) => (
                  <span key={i} className={styles.answerFace}>{v}</span>
                ))}
              </div>
            </div>
            <div className={styles.answerDie}>
              <span className={styles.answerLabel}>주사위 B</span>
              <div className={styles.answerFaces}>
                {SICHERMAN_B.map((v, i) => (
                  <span key={i} className={styles.answerFace}>{v}</span>
                ))}
              </div>
            </div>
          </div>
          <div className={styles.mathExplanation}>
            <h3>왜 이게 가능할까?</h3>
            <p>
              일반 주사위의 확률 생성함수는 <code>x + x² + x³ + x⁴ + x⁵ + x⁶</code>입니다.
            </p>
            <p>
              이걸 인수분해하면 <code>x(1+x)(1+x+x²)(1-x+x²)</code>이 되는데,
              이 인수들을 다르게 조합하면 시커만 주사위가 됩니다!
            </p>
            <p style={{ marginTop: 8 }}>
              <strong>A:</strong> x(1+x)(1+x+x²) = x + 2x² + 2x³ + x⁴ → <strong>{'{'}1, 2, 2, 3, 3, 4{'}'}</strong>
            </p>
            <p>
              <strong>B:</strong> x(1+x)(1-x+x²)(1+x+x²) = x + x³ + x⁴ + x⁵ + x⁶ + x⁸ → <strong>{'{'}1, 3, 4, 5, 6, 8{'}'}</strong>
            </p>
          </div>

          <button
            className={styles.compareButton}
            onClick={() => setShowCompare((v) => !v)}
          >
            {showCompare ? '📊 비교 표 접기' : '📊 합 분포 비교 표 보기'}
          </button>
          {showCompare && (
            <div className={styles.compareSection}>
              <div className={styles.tableWrapper}>
                <h4>일반 주사위 (1~6 vs 1~6)</h4>
                <table className={styles.sumTable}>
                  <thead>
                    <tr>
                      <th></th>
                      {NORMAL_DIE.map((v, i) => (
                        <th key={i} className={styles.dieHeader}>{v}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {normalTable.map((row, ri) => (
                      <tr key={ri}>
                        <th className={styles.dieHeader}>{NORMAL_DIE[ri]}</th>
                        {row.map((val, ci) => (
                          <td key={ci}>{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={styles.tableWrapper}>
                <h4>시커만 주사위</h4>
                <table className={styles.sumTable}>
                  <thead>
                    <tr>
                      <th></th>
                      {SICHERMAN_B.map((v, i) => (
                        <th key={i} className={styles.dieHeader}>{v}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sichermanTable.map((row, ri) => (
                      <tr key={ri}>
                        <th className={styles.dieHeader}>{SICHERMAN_A[ri]}</th>
                        {row.map((val, ci) => (
                          <td key={ci}>{val}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <button
            className={styles.restartButton}
            onClick={() => {
              setPhase('intro');
              setHistory([]);
              setLastRoll(null);
              setHintLevel(-1);
              setShowCompare(false);
              setUserDieA(['', '', '', '', '', '']);
              setUserDieB(['', '', '', '', '', '']);
              setAnswerResult(null);
            }}
          >
            🔄 다시 도전
          </button>
        </div>
      </div>
    );
  }

  // ─── 게임 화면 ───
  return (
    <div className={styles.container}>
      <Link href="/puzzles" className={styles.homeButton}>🏠 목록으로</Link>
      <span className={styles.rollCount}>🎲 {history.length}회 굴림</span>

      <header className={styles.header}>
        <h1 className={styles.title}>🎲 이상한 주사위</h1>
        <p className={styles.subtitle}>주사위를 굴려서 패턴을 파악하세요!</p>
      </header>

      {/* 주사위 영역 */}
      <div className={styles.diceArea}>
        <div className={`${styles.sumDisplay} ${isRolling ? styles.rolling : ''}`}>
          {lastRoll ? lastRoll.sum : '?'}
        </div>
        <p className={styles.sumLabel}>두 눈의 합</p>
      </div>

      {/* 굴리기 버튼 */}
      <div className={styles.controls}>
        <button className={styles.rollButton} onClick={handleRoll} disabled={isRolling}>
          🎲 굴리기
        </button>
        <button className={styles.roll10Button} onClick={handleRoll10} disabled={isRolling}>
          🎲×10 연속 굴리기
        </button>
      </div>

      {/* 빈도 막대 그래프 */}
      {history.length > 0 && (
        <div className={styles.frequencySection}>
          <h3 className={styles.sectionTitle}>합 분포</h3>
          <div className={styles.barChart}>
            {Array.from({ length: 11 }, (_, i) => i + 2).map((sum) => {
              const count = frequency.get(sum) || 0;
              const maxCount = Math.max(...Array.from(frequency.values()), 1);
              const height = (count / maxCount) * 100;
              return (
                <div key={sum} className={styles.barColumn}>
                  <span className={styles.barCount}>{count}</span>
                  <div className={styles.bar} style={{ height: `${Math.max(height, 2)}%` }} />
                  <span className={styles.barLabel}>{sum}</span>
                </div>
              );
            })}
          </div>
          {history.length >= 30 && (
            <p className={styles.frequencyNote}>
              💡 분포가 일반 주사위와 비슷하죠? 그런데 이 주사위의 눈은 1~6이 아니에요!
            </p>
          )}
        </div>
      )}

      {/* 단계별 힌트 */}
      <div className={styles.hintArea}>
        {hintLevel === -1 ? (
          <button className={styles.hintButton} onClick={handleNextHint}>
            💡 힌트가 필요해요!
          </button>
        ) : (
          <>
            {/* 현재까지 열린 힌트들 모두 표시 */}
            {HINTS.slice(0, hintLevel + 1).map((hint, idx) => (
              <div key={idx} className={styles.hintCard}>
                <h4 className={styles.hintTitle}>{hint.title}</h4>
                <p className={styles.hintContent}>{hint.content}</p>
                {hint.showTable && (
                  <div className={styles.tableWrapper}>
                    <table className={styles.sumTable}>
                      <thead>
                        <tr>
                          <th></th>
                          {NORMAL_DIE.map((v, i) => (
                            <th key={i} className={styles.dieHeader}>
                              <span className={styles.dieFace}>{v}</span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {normalTable.map((row, ri) => (
                          <tr key={ri}>
                            <th className={styles.dieHeader}>
                              <span className={styles.dieFace}>{NORMAL_DIE[ri]}</span>
                            </th>
                            {row.map((val, ci) => (
                              <td key={ci} className={styles.sumCell}>{val}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className={styles.tableNote}>
                      합 2: 1가지 &middot; 합 7: 6가지 (최다!) &middot; 합 12: 1가지
                    </p>
                  </div>
                )}
              </div>
            ))}
            {hintLevel < HINTS.length - 1 && (
              <button className={styles.nextHintButton} onClick={handleNextHint}>
                💡 다음 힌트 보기 ({hintLevel + 2}/{HINTS.length})
              </button>
            )}
          </>
        )}
      </div>

      {/* 정답 입력 */}
      {phase === 'playing' && (
        <button className={styles.answerToggle} onClick={() => setPhase('answer')}>
          ✏️ 정답 입력하기
        </button>
      )}

      {phase === 'answer' && (
        <div className={styles.answerSection}>
          <h3 className={styles.sectionTitle}>두 주사위의 눈을 입력하세요</h3>
          <p className={styles.answerHint}>
            각 주사위의 6개 면에 적힌 숫자 (1 이상의 자연수, 같은 숫자 가능)
          </p>

          <div className={styles.dieInputGroup}>
            <label className={styles.dieLabel}>주사위 A</label>
            <div className={styles.dieInputs}>
              {userDieA.map((v, i) => (
                <input
                  key={i}
                  type="text"
                  inputMode="numeric"
                  className={styles.dieInput}
                  value={v}
                  onChange={(e) => handleDieInput('A', i, e.target.value)}
                  maxLength={2}
                  placeholder="?"
                />
              ))}
            </div>
          </div>

          <div className={styles.dieInputGroup}>
            <label className={styles.dieLabel}>주사위 B</label>
            <div className={styles.dieInputs}>
              {userDieB.map((v, i) => (
                <input
                  key={i}
                  type="text"
                  inputMode="numeric"
                  className={styles.dieInput}
                  value={v}
                  onChange={(e) => handleDieInput('B', i, e.target.value)}
                  maxLength={2}
                  placeholder="?"
                />
              ))}
            </div>
          </div>

          {answerResult !== null && !answerResult.valid && (
            <div className={`${styles.resultMessage} ${styles.error}`}>
              ❌ {answerResult.reason}
            </div>
          )}
          {answerResult !== null && answerResult.valid && (
            <div className={`${styles.resultMessage} ${styles.success}`}>
              🎉 정답이에요!
            </div>
          )}

          <div className={styles.controls}>
            <button className={styles.backButton} onClick={() => setPhase('playing')}>
              ← 돌아가기
            </button>
            <button className={styles.submitButton} onClick={handleSubmit}>
              ✅ 정답 확인
            </button>
          </div>
        </div>
      )}

      {/* 최근 기록 */}
      {history.length > 0 && (
        <div className={styles.historySection}>
          <h3 className={styles.sectionTitle}>최근 기록</h3>
          <div className={styles.historyList}>
            {history.slice(0, 20).map((roll) => (
              <span key={roll.id} className={styles.historyItem}>{roll.sum}</span>
            ))}
            {history.length > 20 && (
              <span className={styles.historyMore}>+{history.length - 20}개 더</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
