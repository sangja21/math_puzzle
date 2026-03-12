'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

/**
 * if-else문 학습 체험관
 *
 * 컨셉: 🏹 갈림길 (Fork Road)
 * - 슬라이더로 '점수(score)' 값을 조절
 * - if (score >= 60) { 합격 } else { 불합격 }
 * - 두 갈림길 중 하나가 하이라이트 되며 결과를 시각화
 */
export default function IfElsePage() {
    const [score, setScore] = useState<number>(45);
    const threshold = 60;
    const isPassed = score >= threshold;

    return (
        <div className={styles.container}>
            <Link href="/coding" className={styles.backButton}>
                ← 코딩의 원리
            </Link>

            <header className={styles.header}>
                <h1 className={styles.title}>🏹 갈림길 조건문 (if-else)</h1>
                <p className={styles.subtitle}>
                    조건이 <strong>참이면 A길</strong>, <strong>거짓이면 B길</strong>로! 반드시 둘 중 하나를 선택합니다.
                </p>
            </header>

            <div className={styles.mainContent}>

                {/* 왼쪽: 설명 + 코드 패널 */}
                <div className={styles.explainPanel}>
                    <h3>📝 if-else 문이란?</h3>
                    <p>
                        <strong>if-else 문</strong>은 조건에 따라 두 갈래의 길 중 하나를 선택합니다.
                        <br /><br />
                        조건이 <span className={styles.highlightTrue}>참(True)</span>이면 <code>if</code> 블록을,
                        <span className={styles.highlightFalse}> 거짓(False)</span>이면 반드시 <code>else</code> 블록을 실행해요.
                        한쪽이 실행되면 다른 쪽은 절대 실행되지 않습니다!
                    </p>

                    <div className={styles.conceptGrid}>
                        <div className={`${styles.conceptBlock} ${isPassed ? styles.activeBlock : ''}`}>
                            <div className={styles.conceptBlockTitle}>if 블록 (합격)</div>
                            <div className={styles.conceptBlockCond}>score &gt;= 60</div>
                            <div className={styles.conceptBlockArrow}>↓</div>
                            <div className={styles.conceptBlockResult}>🎉 실행됨</div>
                        </div>
                        <div className={styles.conceptDivider}>VS</div>
                        <div className={`${styles.conceptBlock} ${styles.elseBlock} ${!isPassed ? styles.activeElseBlock : ''}`}>
                            <div className={styles.conceptBlockTitle}>else 블록 (불합격)</div>
                            <div className={styles.conceptBlockCond}>그 외 나머지</div>
                            <div className={styles.conceptBlockArrow}>↓</div>
                            <div className={styles.conceptBlockResult}>😢 실행됨</div>
                        </div>
                    </div>

                    <div className={styles.codeBlock}>
                        <span className={styles.codeKeyword}>let </span>
                        <span className={styles.codeVar}>score</span>
                        {' = '}
                        <span className={styles.codeValue}>{score}</span>
                        {';\n\n'}
                        <span className={styles.codeKeyword}>if </span>
                        {'('}
                        <span className={styles.codeVar}>score</span>
                        {' >= '}
                        <span className={styles.codeValue}>{threshold}</span>
                        {') {\n  '}
                        <span className={`${styles.codeString} ${isPassed ? styles.executing : styles.skipped}`}>
                            {"console.log('합격! 🎉')"}
                        </span>
                        {'\n} '}
                        <span className={styles.codeKeyword}>else</span>
                        {' {\n  '}
                        <span className={`${styles.codeString} ${!isPassed ? styles.executing : styles.skipped}`}>
                            {"console.log('불합격 😢')"}
                        </span>
                        {'\n}'}
                    </div>
                </div>

                {/* 오른쪽: 인터랙티브 영역 */}
                <div className={styles.interactiveArea}>

                    {/* 갈림길 시각화 */}
                    <div className={styles.forkStage}>

                        {/* 입력 흐름 */}
                        <div className={styles.flowIn}>
                            <div className={styles.scoreNode}>
                                <span className={styles.scoreLabel}>score</span>
                                <span className={`${styles.scoreValue} ${isPassed ? styles.scorePass : styles.scoreFail}`}>
                                    {score}
                                </span>
                            </div>
                            <div className={styles.flowArrow}>▼</div>
                        </div>

                        {/* 조건 분기점 */}
                        <div className={styles.conditionDiamond}>
                            <div className={styles.diamondInner}>
                                score &gt;= 60
                                <br />
                                <span className={isPassed ? styles.trueTag : styles.falseTag}>
                                    {isPassed ? 'TRUE' : 'FALSE'}
                                </span>
                            </div>
                        </div>

                        {/* 두 갈래 결과 */}
                        <div className={styles.outcomes}>
                            <div className={`${styles.outcomePath} ${isPassed ? styles.activePassPath : styles.inactivePath}`}>
                                <span className={styles.pathLabel}>if 블록</span>
                                <div className={styles.pathArrow}>▼</div>
                                <div className={`${styles.outcomeBox} ${styles.passBox}`}>
                                    🎉 합격!
                                </div>
                            </div>
                            <div className={`${styles.outcomePath} ${!isPassed ? styles.activeFailPath : styles.inactivePath}`}>
                                <span className={styles.pathLabel}>else 블록</span>
                                <div className={styles.pathArrow}>▼</div>
                                <div className={`${styles.outcomeBox} ${styles.failBox}`}>
                                    😢 불합격
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className={styles.divider} />

                    {/* 슬라이더 */}
                    <div className={styles.sliderArea}>
                        <div className={styles.sliderHeader}>
                            <span>🎚️ <strong>score</strong> 값을 조절해보세요</span>
                            <span className={`${styles.scoreDisplay} ${isPassed ? styles.scoreDisplayPass : styles.scoreDisplayFail}`}>
                                {score}점
                            </span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={100}
                            value={score}
                            onChange={(e) => setScore(Number(e.target.value))}
                            className={`${styles.slider} ${isPassed ? styles.sliderPass : styles.sliderFail}`}
                        />
                        <div className={styles.sliderLabels}>
                            <span>0점</span>
                            <span className={styles.thresholdLabel}>← 기준: {threshold}점</span>
                            <span>100점</span>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
