'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    NUMBER_PUZZLES,
    WARMUP_STORIES,
    WarmupGameState,
    createWarmupGameState,
} from '@/lib/puzzles/warmup';
import styles from './page.module.css';

export default function WarmupPuzzlePage() {
    const router = useRouter();
    const [gameStarted, setGameStarted] = useState(false);
    const [gameState, setGameState] = useState<WarmupGameState>(createWarmupGameState());
    const [showRule, setShowRule] = useState(false);

    const currentNumberPuzzle = NUMBER_PUZZLES[gameState.currentPuzzleIndex] || NUMBER_PUZZLES[0];

    // 게임 시작
    const handleStart = useCallback(() => {
        setGameStarted(true);
        setGameState(createWarmupGameState());
    }, []);

    // 입력 변경
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const digitsOnly = e.target.value.replace(/[^0-9-]/g, '');
        setGameState((prev) => ({
            ...prev,
            userAnswer: digitsOnly,
            isCorrect: null,
        }));
    }, []);

    // 정답 확인
    const handleCheck = useCallback(() => {
        const userNum = parseInt(gameState.userAnswer, 10);
        const isCorrect = userNum === currentNumberPuzzle.answer;

        setGameState((prev) => ({
            ...prev,
            isCorrect,
            attempts: prev.attempts + 1,
        }));

        if (isCorrect) {
            setShowRule(true);
        }
    }, [gameState, currentNumberPuzzle]);

    // 다음 문제
    const handleNext = useCallback(() => {
        setShowRule(false);

        if (gameState.currentPuzzleIndex < NUMBER_PUZZLES.length - 1) {
            setGameState((prev) => ({
                ...prev,
                currentPuzzleIndex: prev.currentPuzzleIndex + 1,
                userAnswer: '',
                isCorrect: null,
                showHint: false,
                attempts: 0,
            }));
        } else {
            setGameState((prev) => ({
                ...prev,
                completed: true,
            }));
        }
    }, [gameState]);

    // 힌트 토글
    const handleHintToggle = useCallback(() => {
        setGameState((prev) => ({
            ...prev,
            showHint: !prev.showHint,
        }));
    }, []);

    // 자물쇠 퍼즐로 이동
    const handleGoToNumberLock = useCallback(() => {
        router.push('/puzzle/number-lock');
    }, [router]);

    // 완료 체크
    const isCompleted = gameState.completed;

    // 시작 전 화면
    if (!gameStarted) {
        return (
            <div className={styles.container}>
                <Link href="/" className={styles.homeButton}>
                    🏠 목록으로
                </Link>

                <header className={styles.header}>
                    <h1 className={styles.title}>🕵️ 비밀요원 입단 테스트</h1>
                    <p className={styles.subtitle}>카이사르 암호 도전 전, 워밍업!</p>
                </header>

                <div className={styles.storyCard}>
                    <p style={{ whiteSpace: 'pre-line' }}>{WARMUP_STORIES.intro}</p>
                </div>

                <button className={styles.startButton} onClick={handleStart}>
                    🚀 테스트 시작!
                </button>
            </div>
        );
    }

    // 완료 화면
    if (isCompleted) {
        return (
            <div className={styles.container}>
                <Link href="/" className={styles.homeButton}>
                    🏠 목록으로
                </Link>

                <header className={styles.header}>
                    <h1 className={styles.title}>🕵️ 비밀요원 입단 테스트</h1>
                </header>

                <div className={styles.completeScreen}>
                    <div className={styles.celebrationEmoji}>🎖️</div>
                    <h2>입단 테스트 통과!</h2>
                    <p>
                        축하해요! 규칙을 찾아서 암호를 푸는 방법을 배웠어요.
                        <br />
                        <br />
                        이제 <strong>숫자 자물쇠</strong>로 숫자 밀기 감각을 완성해봐요.
                        <br />
                        그 다음이 진짜 <strong>카이사르 암호</strong>에요!
                    </p>
                    <button className={styles.caesarButton} onClick={handleGoToNumberLock}>
                        🔢 숫자 자물쇠 도전하기!
                    </button>
                </div>
            </div>
        );
    }

    // 게임 화면
    return (
        <div className={styles.container}>
            <Link href="/" className={styles.homeButton}>
                🏠 목록으로
            </Link>

            <span className={styles.stageBadge}>
                퍼즐 {gameState.currentPuzzleIndex + 1} / {NUMBER_PUZZLES.length}
            </span>

            <header className={styles.header}>
                <h1 className={styles.title}>🕵️ 비밀요원 입단 테스트</h1>
                <p className={styles.subtitle}>숫자 변신 규칙을 찾아보세요!</p>
            </header>

            {/* 진행 표시 */}
            <div className={styles.progressDots}>
                {NUMBER_PUZZLES.map((_, idx) => (
                    <div
                        key={idx}
                        className={`${styles.dot} ${idx === gameState.currentPuzzleIndex ? styles.active : ''} ${idx < gameState.currentPuzzleIndex ? styles.completed : ''}`}
                    />
                ))}
            </div>

            {/* 스토리 */}
            <div className={styles.storyCard}>
                <p>{WARMUP_STORIES.puzzle}</p>
            </div>

            <div className={styles.numberPuzzle}>
                <div className={styles.examplesBox}>
                    {currentNumberPuzzle.examples.map((ex, idx) => (
                        <div key={idx} className={styles.exampleRow}>
                            <span className={styles.fromNumber}>{ex.from}</span>
                            <span className={styles.arrow}>→</span>
                            <span className={styles.toNumber}>{ex.to}</span>
                        </div>
                    ))}

                    <div className={styles.questionRow}>
                        <span className={styles.questionNumber}>{currentNumberPuzzle.question}</span>
                        <span className={styles.arrow}>→</span>
                        <span className={styles.questionMark}>?</span>
                    </div>
                </div>

                {showRule && gameState.isCorrect && (
                    <div className={styles.ruleExplanation}>
                        📐 규칙: <strong>{currentNumberPuzzle.rule}</strong>
                    </div>
                )}
            </div>

            {/* 입력 */}
            <div className={styles.inputSection}>
                <div className={styles.inputLabel}>정답 숫자를 입력하세요</div>
                <input
                    type="number"
                    className={`${styles.inputBox} ${gameState.isCorrect === true
                            ? styles.correct
                            : gameState.isCorrect === false
                                ? styles.incorrect
                                : ''
                        }`}
                    value={gameState.userAnswer}
                    onChange={handleInputChange}
                    placeholder="숫자 입력"
                    disabled={gameState.isCorrect === true}
                />
            </div>

            {/* 힌트 */}
            {gameState.showHint && (
                <div className={styles.hintBox}>
                    💡 힌트: 앞의 숫자들이 어떻게 변했는지 살펴보세요!
                </div>
            )}

            {/* 결과 메시지 */}
            {gameState.isCorrect === true && (
                <div className={`${styles.resultMessage} ${styles.success}`}>🎉 정답이에요! 대단해요!</div>
            )}
            {gameState.isCorrect === false && (
                <div className={`${styles.resultMessage} ${styles.error}`}>❌ 다시 한번 생각해보세요!</div>
            )}

            {/* 버튼 */}
            <div className={styles.controls}>
                {!gameState.showHint && gameState.isCorrect !== true && (
                    <button className={styles.hintButton} onClick={handleHintToggle}>
                        💡 힌트 보기
                    </button>
                )}
                {gameState.isCorrect !== true ? (
                    <button
                        className={styles.checkButton}
                        onClick={handleCheck}
                        disabled={!gameState.userAnswer.trim()}
                    >
                        ✅ 정답 확인
                    </button>
                ) : (
                    <button className={styles.nextButton} onClick={handleNext}>
                        ➡️ 다음으로
                    </button>
                )}
            </div>
        </div>
    );
}
