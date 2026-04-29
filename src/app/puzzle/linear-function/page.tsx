'use client';

import { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  generateQuizQuestion,
  generateGameTarget,
  formatEquation,
  OBSERVATION_POINTS,
  CODING_TABLE_X_VALUES,
  QuizQuestion,
} from '@/lib/puzzles/linearFunction';
import { CoordPlane, sampleLine, type Curve } from '@/components/CoordPlane';
import styles from './page.module.css';

type Tab = 'explorer' | 'quiz' | 'coding';
type QuizPhase = 'slope' | 'intercept' | 'done';

type LineSpec = { a: number; b: number; color: string; dashed?: boolean; width?: number };

function linesToCurves(lines: LineSpec[]): Curve[] {
  return lines.map((l) => ({
    samples: sampleLine(l.a, l.b),
    color: l.color,
    dashed: l.dashed,
    width: l.width,
  }));
}

// ─── 탭 1: 직선 탐험기 ───────────────────────────────────────────
function ExplorerTab() {
  const [userA, setUserA] = useState(1);
  const [userB, setUserB] = useState(0);
  const [isGameMode, setIsGameMode] = useState(false);
  const [target, setTarget] = useState(() => generateGameTarget());
  const [isMatched, setIsMatched] = useState(false);
  const [showObs, setShowObs] = useState(false);

  const matched = Math.abs(userA - target.a) < 0.055 && Math.abs(userB - target.b) < 0.055;

  const newTarget = useCallback(() => {
    setTarget(generateGameTarget());
    setUserA(0);
    setUserB(0);
    setIsMatched(false);
  }, []);

  const handleCheck = useCallback(() => {
    if (matched) setIsMatched(true);
  }, [matched]);

  const lines = useMemo(() => {
    const result: { a: number; b: number; color: string; dashed?: boolean; width?: number }[] = [
      { a: userA, b: userB, color: '#60a5fa', width: 3 },
    ];
    if (isGameMode) {
      result.push({ a: target.a, b: target.b, color: '#f87171', dashed: true, width: 2 });
    }
    return result;
  }, [userA, userB, isGameMode, target]);

  return (
    <div className={styles.tabContent}>
      <div className={styles.twoCol}>
        {/* 그래프 */}
        <div className={styles.graphBox}>
          <CoordPlane curves={linesToCurves(lines)} />
          {isGameMode && (
            <div className={styles.legend}>
              <span><span className={styles.dot} style={{ background: '#60a5fa' }} /> 내 직선</span>
              <span><span className={styles.dot} style={{ background: '#f87171', outline: '2px dashed #f87171' }} /> 목표 직선</span>
            </div>
          )}
        </div>

        {/* 컨트롤 */}
        <div className={styles.controlPanel}>
          {/* 수식 표시 */}
          <div className={styles.equationDisplay}>
            <span className={styles.equationLabel}>내 직선:</span>
            <span className={styles.equationValue}>{formatEquation(userA, userB)}</span>
          </div>
          {isGameMode && (
            <div className={styles.equationDisplay}>
              <span className={styles.equationLabel}>목표:</span>
              <span className={styles.equationValueTarget}>
                {isMatched ? formatEquation(target.a, target.b) : '???'}
              </span>
            </div>
          )}

          {/* 슬라이더 */}
          <div className={styles.sliderGroup}>
            <div className={styles.sliderRow}>
              <label className={styles.sliderLabel}>
                기울기 <strong className={styles.varName}>a</strong>
              </label>
              <span className={styles.sliderVal}>{userA}</span>
            </div>
            <input
              type="range" min={-5} max={5} step={0.1}
              value={userA}
              onChange={(e) => setUserA(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderHint}>
              {userA > 0 ? '오른쪽으로 올라가요 ↗' : userA < 0 ? '오른쪽으로 내려가요 ↘' : '수평선이에요 →'}
            </div>
          </div>

          <div className={styles.sliderGroup}>
            <div className={styles.sliderRow}>
              <label className={styles.sliderLabel}>
                y절편 <strong className={styles.varName}>b</strong>
              </label>
              <span className={styles.sliderVal}>{userB}</span>
            </div>
            <input
              type="range" min={-10} max={10} step={0.1}
              value={userB}
              onChange={(e) => setUserB(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderHint}>
              y축을 ({0}, {userB})에서 만나요
            </div>
          </div>

          {/* 모드 전환 */}
          <div className={styles.modeButtons}>
            <button
              className={`${styles.modeBtn} ${!isGameMode ? styles.modeBtnActive : ''}`}
              onClick={() => { setIsGameMode(false); setIsMatched(false); }}
            >
              자유 탐험
            </button>
            <button
              className={`${styles.modeBtn} ${isGameMode ? styles.modeBtnActive : ''}`}
              onClick={() => { setIsGameMode(true); setIsMatched(false); setUserA(0); setUserB(0); }}
            >
              게임 모드
            </button>
          </div>

          {/* 게임 모드 액션 */}
          {isGameMode && (
            <div className={styles.gameActions}>
              {isMatched ? (
                <div className={styles.matchedBox}>
                  <div className={styles.matchedEmoji}>🎉</div>
                  <div>정답이에요!</div>
                  <div className={styles.matchedEq}>{formatEquation(target.a, target.b)}</div>
                  <button className={styles.nextBtn} onClick={newTarget}>다음 문제 →</button>
                </div>
              ) : (
                <button
                  className={`${styles.checkBtn} ${matched ? styles.checkBtnReady : ''}`}
                  onClick={handleCheck}
                >
                  {matched ? '✅ 일치! 확인하기' : '맞춰보기'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 관찰 포인트 */}
      <div className={styles.observationCard}>
        <button className={styles.obsToggle} onClick={() => setShowObs(!showObs)}>
          {showObs ? '🔼 관찰 포인트 접기' : '🔍 관찰 포인트 보기'}
        </button>
        {showObs && (
          <ul className={styles.obsList}>
            {OBSERVATION_POINTS.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        )}
      </div>
    </div>
  );
}

// ─── 탭 2: 두 점 → 식 찾기 ──────────────────────────────────────
function QuizTab() {
  const [question, setQuestion] = useState<QuizQuestion>(() => generateQuizQuestion());
  const [phase, setPhase] = useState<QuizPhase>('slope');
  const [slopeInput, setSlopeInput] = useState('');
  const [interceptInput, setInterceptInput] = useState('');
  const [slopeOk, setSlopeOk] = useState<boolean | null>(null);
  const [interceptOk, setInterceptOk] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showLine, setShowLine] = useState(false);

  const { p1, p2, a, b } = question;

  const resetQuiz = useCallback(() => {
    setQuestion(generateQuizQuestion());
    setPhase('slope');
    setSlopeInput('');
    setInterceptInput('');
    setSlopeOk(null);
    setInterceptOk(null);
    setShowHint(false);
    setShowLine(false);
  }, []);

  const checkSlope = useCallback(() => {
    const val = parseInt(slopeInput, 10);
    if (val === a) {
      setSlopeOk(true);
      setPhase('intercept');
      setShowHint(false);
    } else {
      setSlopeOk(false);
    }
  }, [slopeInput, a]);

  const checkIntercept = useCallback(() => {
    const val = parseInt(interceptInput, 10);
    if (val === b) {
      setInterceptOk(true);
      setPhase('done');
      setShowLine(true);
    } else {
      setInterceptOk(false);
    }
  }, [interceptInput, b]);

  const lines = useMemo(() => {
    if (!showLine) return [];
    return [{ a, b, color: '#34d399', width: 3 }];
  }, [showLine, a, b]);

  const points = useMemo(() => [
    { x: p1.x, y: p1.y, color: '#fbbf24', label: `A(${p1.x}, ${p1.y})` },
    { x: p2.x, y: p2.y, color: '#a78bfa', label: `B(${p2.x}, ${p2.y})` },
  ], [p1, p2]);

  return (
    <div className={styles.tabContent}>
      <div className={styles.twoCol}>
        {/* 그래프 */}
        <div className={styles.graphBox}>
          <CoordPlane curves={linesToCurves(lines)} points={points} />
        </div>

        {/* 퀴즈 패널 */}
        <div className={styles.controlPanel}>
          <div className={styles.quizIntro}>
            <div className={styles.quizPointRow}>
              <span className={styles.pointBadge} style={{ background: '#fbbf24' }}>A</span>
              <span>({p1.x}, {p1.y})</span>
              <span className={styles.pointBadge} style={{ background: '#a78bfa' }}>B</span>
              <span>({p2.x}, {p2.y})</span>
            </div>
            <p className={styles.quizDesc}>두 점을 지나는 직선의 식을 구해보세요!</p>
          </div>

          {/* 단계 1: 기울기 */}
          <div className={`${styles.phaseCard} ${phase === 'slope' ? styles.phaseActive : ''} ${slopeOk ? styles.phaseOk : ''}`}>
            <div className={styles.phaseTitle}>단계 1 — 기울기 구하기</div>
            <div className={styles.formula}>
              a = (y₂ − y₁) ÷ (x₂ − x₁)
            </div>
            {phase === 'slope' && (
              <>
                <div className={styles.inputRow}>
                  <span>a =</span>
                  <input
                    type="number"
                    className={`${styles.numInput} ${slopeOk === false ? styles.inputError : ''}`}
                    value={slopeInput}
                    onChange={(e) => { setSlopeInput(e.target.value); setSlopeOk(null); }}
                    placeholder="?"
                  />
                  <button className={styles.confirmBtn} onClick={checkSlope}>확인</button>
                </div>
                {slopeOk === false && <div className={styles.wrongMsg}>다시 계산해봐요! 😅</div>}
                <button className={styles.hintBtn} onClick={() => setShowHint(!showHint)}>
                  {showHint ? '힌트 숨기기' : '💡 힌트 보기'}
                </button>
                {showHint && (
                  <div className={styles.hintBox}>
                    ({p2.y} − {p1.y}) ÷ ({p2.x} − {p1.x}) = {p2.y - p1.y} ÷ {p2.x - p1.x} = <strong>{a}</strong>
                  </div>
                )}
              </>
            )}
            {slopeOk && <div className={styles.okMsg}>✅ a = {a} 정답!</div>}
          </div>

          {/* 단계 2: y절편 */}
          <div className={`${styles.phaseCard} ${phase === 'intercept' ? styles.phaseActive : ''} ${interceptOk ? styles.phaseOk : ''} ${phase === 'slope' ? styles.phaseLocked : ''}`}>
            <div className={styles.phaseTitle}>단계 2 — y절편 구하기</div>
            <div className={styles.formula}>
              b = y₁ − a × x₁
            </div>
            {phase === 'intercept' && (
              <>
                <div className={styles.inputRow}>
                  <span>b =</span>
                  <input
                    type="number"
                    className={`${styles.numInput} ${interceptOk === false ? styles.inputError : ''}`}
                    value={interceptInput}
                    onChange={(e) => { setInterceptInput(e.target.value); setInterceptOk(null); }}
                    placeholder="?"
                  />
                  <button className={styles.confirmBtn} onClick={checkIntercept}>확인</button>
                </div>
                {interceptOk === false && <div className={styles.wrongMsg}>다시 계산해봐요! 😅</div>}
                <button className={styles.hintBtn} onClick={() => setShowHint(!showHint)}>
                  {showHint ? '힌트 숨기기' : '💡 힌트 보기'}
                </button>
                {showHint && (
                  <div className={styles.hintBox}>
                    {p1.y} − {a} × {p1.x} = {p1.y} − ({a * p1.x}) = <strong>{b}</strong>
                  </div>
                )}
              </>
            )}
            {interceptOk && <div className={styles.okMsg}>✅ b = {b} 정답!</div>}
          </div>

          {/* 완성 */}
          {phase === 'done' && (
            <div className={styles.doneCard}>
              <div className={styles.doneEmoji}>🎉</div>
              <div className={styles.doneEq}>{formatEquation(a, b)}</div>
              <p>그래프에서 확인해보세요!</p>
              <button className={styles.nextBtn} onClick={resetQuiz}>다음 문제 →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── 탭 3: 코딩으로 보기 ─────────────────────────────────────────
function CodingTab() {
  const [a, setA] = useState(2);
  const [b, setB] = useState(3);

  const lines = useMemo(() => [{ a, b, color: '#a78bfa', width: 3 }], [a, b]);

  const fmtN = (n: number) => parseFloat(n.toFixed(1)).toString();
  const aStr = a === 1 ? '' : a === -1 ? '-' : fmtN(a);
  const bStr = b === 0 ? '' : b > 0 ? ` + ${fmtN(b)}` : ` - ${fmtN(Math.abs(b))}`;

  return (
    <div className={styles.tabContent}>
      <div className={styles.codingLayout}>
        {/* 상단: 수학 ↔ 코딩 비교 */}
        <div className={styles.compareRow}>
          <div className={styles.compareBox}>
            <div className={styles.compareTitle}>📐 수학 표현</div>
            <div className={styles.mathExpr}>
              f(x) = {aStr}x{bStr}
            </div>
            <div className={styles.compareDesc}>
              x를 넣으면 y(결과)가 나오는 규칙
            </div>
          </div>

          <div className={styles.compareSep}>↔</div>

          <div className={styles.compareBox}>
            <div className={styles.compareTitle}>💻 코딩 표현</div>
            <div className={styles.codeBlock}>
              <div><span className={styles.kw}>function</span> <span className={styles.fn}>f</span>(<span className={styles.param}>x</span>) {'{'}</div>
              <div className={styles.indent}>
                <span className={styles.kw}>return</span>{' '}
                <span className={styles.num}>{fmtN(a)}</span> * <span className={styles.param}>x</span>{' '}
                {b !== 0 && (<><span className={styles.op}>{b > 0 ? '+' : '-'}</span> <span className={styles.num}>{fmtN(Math.abs(b))}</span></>)}
                ;
              </div>
              <div>{'}'}</div>
            </div>
          </div>
        </div>

        {/* 슬라이더 */}
        <div className={styles.codingSliders}>
          <div className={styles.sliderGroup}>
            <div className={styles.sliderRow}>
              <label className={styles.sliderLabel}>기울기 <strong className={styles.varName}>a</strong></label>
              <span className={styles.sliderVal}>{a}</span>
            </div>
            <input type="range" min={-5} max={5} step={0.1} value={a}
              onChange={(e) => setA(Number(e.target.value))} className={styles.slider} />
          </div>
          <div className={styles.sliderGroup}>
            <div className={styles.sliderRow}>
              <label className={styles.sliderLabel}>y절편 <strong className={styles.varName}>b</strong></label>
              <span className={styles.sliderVal}>{b}</span>
            </div>
            <input type="range" min={-10} max={10} step={0.1} value={b}
              onChange={(e) => setB(Number(e.target.value))} className={styles.slider} />
          </div>
        </div>

        {/* 하단: 표 + 그래프 */}
        <div className={styles.twoCol}>
          <div className={styles.graphBox}>
            <CoordPlane curves={linesToCurves(lines)} />
          </div>

          <div className={styles.tableBox}>
            <div className={styles.tableTitle}>f(x) 계산표</div>
            <table className={styles.funcTable}>
              <thead>
                <tr>
                  <th>x</th>
                  <th>f(x) = {aStr || ''}x{bStr}</th>
                  <th>결과</th>
                </tr>
              </thead>
              <tbody>
                {CODING_TABLE_X_VALUES.map((x) => (
                  <tr key={x}>
                    <td>{x}</td>
                    <td className={styles.calcCell}>
                      {a}×{x} {b !== 0 ? (b > 0 ? `+ ${b}` : `- ${Math.abs(b)}`) : ''}
                    </td>
                    <td className={styles.resultCell}>{a * x + b}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.insightBox}>
              <div className={styles.insightTitle}>핵심 연결</div>
              <ul className={styles.insightList}>
                <li>수학의 <strong>f(3)</strong> = 코딩의 <strong>f(3)</strong> 호출</li>
                <li><strong>a</strong>는 x가 1 늘 때 결과가 얼마나 변하는지</li>
                <li><strong>b</strong>는 x = 0일 때의 시작값</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 메인 페이지 ─────────────────────────────────────────────────
export default function LinearFunctionPage() {
  const [activeTab, setActiveTab] = useState<Tab>('explorer');

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.homeButton}>🏠 목록으로</Link>

      <header className={styles.header}>
        <h1 className={styles.title}>📈 1차함수의 원리</h1>
        <p className={styles.subtitle}>
          기울기와 절편을 직접 조작하며 직선의 비밀을 발견하세요!
        </p>
      </header>

      {/* 탭 */}
      <div className={styles.tabs}>
        {(['explorer', 'quiz', 'coding'] as Tab[]).map((tab) => (
          <button
            key={tab}
            className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'explorer' && '📊 직선 탐험기'}
            {tab === 'quiz' && '🔍 두 점 → 식 찾기'}
            {tab === 'coding' && '💻 코딩으로 보기'}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <div className={styles.tabWrapper}>
        {activeTab === 'explorer' && <ExplorerTab />}
        {activeTab === 'quiz' && <QuizTab />}
        {activeTab === 'coding' && <CodingTab />}
      </div>
    </div>
  );
}
