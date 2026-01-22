'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NUMBER_LOCK_STAGES, NUMBER_LOCK_STORY } from '@/lib/puzzles/numberLock';
import styles from './page.module.css';

export default function NumberLockPuzzlePage() {
    const router = useRouter();
    const [gameStarted, setGameStarted] = useState(false);
    const [stageIndex, setStageIndex] = useState(0);
    const [dialValues, setDialValues] = useState<string[]>(NUMBER_LOCK_STAGES[0].encrypted.split(''));
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [showHint, setShowHint] = useState(false);
    const [showRule, setShowRule] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const currentStage = NUMBER_LOCK_STAGES[stageIndex];
    const totalStages = NUMBER_LOCK_STAGES.length;

    const progressPercent = useMemo(() => {
        const completedStages = stageIndex + (isCorrect ? 1 : 0);
        return Math.min(100, (completedStages / totalStages) * 100);
    }, [isCorrect, stageIndex, totalStages]);

    const handleStart = useCallback(() => {
        setGameStarted(true);
        setStageIndex(0);
        setDialValues(NUMBER_LOCK_STAGES[0].encrypted.split(''));
        setIsCorrect(null);
        setShowHint(false);
        setShowRule(false);
        setIsComplete(false);
    }, []);

    const rotateDigit = useCallback((digit: string, delta: number) => {
        const value = parseInt(digit, 10);
        const next = (value + delta + 10) % 10;
        return next.toString();
    }, []);

    const handleDialShift = useCallback(
        (dialIndex: number, delta: number) => {
            if (isCorrect) return;
            setDialValues((prev) => {
                const updated = [...prev];
                updated[dialIndex] = rotateDigit(updated[dialIndex], delta);
                return updated;
            });
            setIsCorrect(null);
        },
        [rotateDigit, isCorrect],
    );

    const handleCheck = useCallback(() => {
        if (!currentStage) return;
        const attempt = dialValues.join('');
        const isMatch = attempt === currentStage.answer;

        setIsCorrect(isMatch);

        if (isMatch) {
            setShowRule(true);
        } else {
            setShowRule(false);
        }
    }, [currentStage, dialValues]);

    const handleNext = useCallback(() => {
        if (stageIndex < totalStages - 1) {
            const nextIndex = stageIndex + 1;
            setStageIndex(nextIndex);
            setDialValues(NUMBER_LOCK_STAGES[nextIndex].encrypted.split(''));
            setIsCorrect(null);
            setShowHint(false);
            setShowRule(false);
        } else {
            setIsComplete(true);
        }
    }, [stageIndex, totalStages]);

    const handleHintToggle = useCallback(() => {
        setShowHint((prev) => !prev);
    }, []);

    const handleGoToCaesar = useCallback(() => {
        router.push('/puzzle/caesar');
    }, [router]);

    const handleGoBackToWarmup = useCallback(() => {
        router.push('/puzzle/warmup');
    }, [router]);

    if (!gameStarted) {
        return (
            <div className={styles.container}>
                <Link href="/" className={styles.homeButton}>
                    🏠 목록으로
                </Link>

                <header className={styles.header}>
                    <h1 className={styles.title}>🔢 암호 자물쇠 훈련</h1>
                    <p className={styles.subtitle}>숫자를 밀고 당겨 3단계 보안 잠금을 해제하세요.</p>
                </header>

                <div className={styles.storyCard}>
                    <p style={{ whiteSpace: 'pre-line' }}>{NUMBER_LOCK_STORY.intro}</p>
                </div>

                <div className={styles.startActions}>
                    <button className={styles.startButton} onClick={handleStart}>
                        🚀 자물쇠 해제 시작!
                    </button>
                    <button className={styles.secondaryButton} onClick={handleGoBackToWarmup}>
                        ↩️ 워밍업 복습
                    </button>
                </div>
            </div>
        );
    }

    if (isComplete) {
        return (
            <div className={styles.container}>
                <Link href="/" className={styles.homeButton}>
                    🏠 목록으로
                </Link>

                <div className={styles.completeScreen}>
                    <div className={styles.celebrationEmoji}>🔓</div>
                    <h2>모든 자물쇠 해제!</h2>
                    <p style={{ whiteSpace: 'pre-line' }}>{NUMBER_LOCK_STORY.complete}</p>
                    <button className={styles.caesarButton} onClick={handleGoToCaesar}>
                        🔐 카이사르 암호 실전에 투입
                    </button>
                    <button className={styles.secondaryButton} onClick={handleStart}>
                        🔁 다시 해보기
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Link href="/" className={styles.homeButton}>
                🏠 목록으로
            </Link>

            <span className={styles.stageBadge}>Stage {stageIndex + 1} / {totalStages}</span>

            <header className={styles.header}>
                <h1 className={styles.title}>🔢 암호 자물쇠 훈련</h1>
                <p className={styles.subtitle}>카이사르 암호 핵심 - 일정 간격으로 숫자 밀기</p>
            </header>

            <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
            </div>

            <div className={styles.stageSteps}>
                {NUMBER_LOCK_STAGES.map((stage, idx) => (
                    <div
                        key={stage.id}
                        className={`${styles.stageDot} ${idx < stageIndex ? styles.completed : ''} ${idx === stageIndex ? styles.active : ''}`}
                    >
                        {stage.id}
                    </div>
                ))}
            </div>

            <div className={styles.stageCard}>
                <div className={styles.stageHeader}>
                    <h2>{currentStage.title}</h2>
                    <p>{currentStage.description}</p>
                </div>

                <div className={styles.recordPanel}>
                    <div className={styles.recordLabel}>감시 기록</div>
                    <div className={styles.recordDigits}>{currentStage.encrypted}</div>
                </div>

                <div className={styles.lockDisplay}>
                    {dialValues.map((digit, idx) => (
                        <div key={`dial-${idx}`} className={`${styles.lockDial} ${isCorrect ? styles.unlocked : ''}`}>
                            <button
                                className={styles.dialButton}
                                onClick={() => handleDialShift(idx, 1)}
                                disabled={isCorrect === true}
                                aria-label={`다이얼 ${idx + 1} 올리기`}
                            >
                                ▲
                            </button>
                            <div className={styles.dialBody}>
                                <span className={styles.dialNumber}>{digit}</span>
                                <span className={styles.dialLabel}>다이얼 {idx + 1}</span>
                            </div>
                            <button
                                className={styles.dialButton}
                                onClick={() => handleDialShift(idx, -1)}
                                disabled={isCorrect === true}
                                aria-label={`다이얼 ${idx + 1} 내리기`}
                            >
                                ▼
                            </button>
                        </div>
                    ))}
                </div>

                <div className={styles.storyStrip}>{currentStage.story}</div>

                {showHint && (
                    <div className={styles.hintBox}>
                        💡 힌트: {currentStage.hint}
                    </div>
                )}

                {showRule && isCorrect && (
                    <div className={styles.ruleBox}>
                        <div className={styles.ruleTitle}>🔐 규칙</div>
                        <p className={styles.ruleText}>{currentStage.rule}</p>
                        <div className={styles.ruleExamples}>
                            {currentStage.examples.map((ex) => (
                                <div key={ex.from} className={styles.exampleChip}>
                                    {ex.from} → {ex.to}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {isCorrect === true && <div className={styles.successMessage}>🎉 정확해요! 자물쇠가 풀리고 있어요.</div>}
                {isCorrect === false && <div className={styles.errorMessage}>❌ 아직 잠금이 풀리지 않아요.</div>}

                <div className={styles.controls}>
                    {!showHint && isCorrect !== true && (
                        <button className={styles.hintButton} onClick={handleHintToggle}>
                            💡 힌트 보기
                        </button>
                    )}
                    {isCorrect !== true && (
                        <button className={styles.checkButton} onClick={handleCheck}>
                            ✅ 잠금 해제 시도
                        </button>
                    )}
                    {isCorrect === true && (
                        <button className={styles.nextButton} onClick={handleNext}>
                            {stageIndex === totalStages - 1 ? '🎯 미션 완료' : '➡️ 다음 자물쇠'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
