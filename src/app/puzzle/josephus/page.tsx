'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import {
    JosephusState,
    createInitialState,
    nextRemoval,
    resetState,
    getRemaining,
    getSurvivor,
    EXPLANATION,
} from '@/lib/puzzles/josephus';
import styles from './page.module.css';

export default function JosephusPuzzlePage() {
    const [totalInput, setTotalInput] = useState(7);
    const [stepInput, setStepInput] = useState(3);
    const [gameState, setGameState] = useState<JosephusState | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);

    // 시작 버튼
    const handleStart = useCallback(() => {
        if (totalInput < 1 || stepInput < 1) return;
        setGameState(createInitialState(totalInput, stepInput));
    }, [totalInput, stepInput]);

    // 다음 제거
    const handleNext = useCallback(() => {
        if (!gameState) return;
        setGameState(prev => nextRemoval(prev!));
    }, [gameState]);

    // 다시 시작 (다중 라운드)
    const handleReset = useCallback(() => {
        if (!gameState) return;
        setGameState(resetState(gameState.total, gameState.step));
    }, [gameState]);

    // 입력 변경
    const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTotalInput(parseInt(e.target.value, 10) || 0);
    };
    const handleStepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStepInput(parseInt(e.target.value, 10) || 0);
    };

    // 원형 레이아웃 계산 (CSS 변수 사용)
    const radius = 120; // px
    const angleStep = gameState ? 360 / gameState.circle.length : 0;

    return (
        <div className={styles.container}>
            {/* 홈 버튼 */}
            <Link href="/" className={styles.homeButton}>
                🏠 메인으로
            </Link>

            {/* 헤더 */}
            <header className={styles.header}>
                <h1 className={styles.title}>🌀 요세푸스 퍼즐</h1>
                <p className={styles.subtitle}>원형에서 k번째 사람을 제거하고 마지막 생존자를 찾으세요.</p>
            </header>

            {/* 입력 폼 */}
            {!gameState && (
                <div className={styles.inputForm}>
                    <label className={styles.inputLabel}>
                        인원 수 (n):
                        <input type="number" min={1} value={totalInput} onChange={handleTotalChange} className={styles.inputField} />
                    </label>
                    <label className={styles.inputLabel}>
                        제거 간격 (k):
                        <input type="number" min={1} value={stepInput} onChange={handleStepChange} className={styles.inputField} />
                    </label>
                    <button className={styles.startButton} onClick={handleStart} disabled={totalInput < 1 || stepInput < 1}>
                        시작하기
                    </button>
                </div>
            )}

            {/* 게임 UI */}
            {gameState && (
                <>
                    {/* 통계 */}
                    <div className={styles.stats}>
                        <div className={styles.stat}>
                            <span className={styles.statLabel}>남은 인원</span>
                            <span className={styles.statValue}>{getRemaining(gameState)}</span>
                        </div>
                        <div className={styles.stat}>
                            <span className={styles.statLabel}>제거 순서</span>
                            <span className={styles.statValue}>{gameState.removed.length}</span>
                        </div>
                        {gameState.isComplete && (
                            <div className={styles.stat}>
                                <span className={styles.statLabel}>생존자</span>
                                <span className={styles.statValue}>{getSurvivor(gameState)}</span>
                            </div>
                        )}
                    </div>

                    {/* 원형 배치 */}
                    <div className={styles.circleContainer}>
                        {gameState.circle.map((person, idx) => {
                            const angle = idx * angleStep;
                            const x = radius * Math.cos((angle * Math.PI) / 180);
                            const y = radius * Math.sin((angle * Math.PI) / 180);
                            return (
                                <div
                                    key={person}
                                    className={styles.person}
                                    style={{
                                        transform: `translate(${x}px, ${y}px)`,
                                    }}
                                >
                                    <span className={styles.personIcon}>💂</span>
                                    <span className={styles.personNumber}>{person}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* 액션 버튼 */}
                    <div className={styles.actions}>
                        <button className={styles.nextButton} onClick={handleNext} disabled={gameState.isComplete}>
                            다음 제거
                        </button>
                        <button className={styles.resetButton} onClick={handleReset}>
                            🔄 다시 시작
                        </button>
                    </div>

                    {/* 히스토리 */}
                    {gameState.removed.length > 0 && (
                        <div className={styles.history}>
                            <h3 className={styles.historyTitle}>제거 순서</h3>
                            <ol className={styles.historyList}>
                                {gameState.removed.map((p, i) => (
                                    <li key={i}>#{i + 1}: {p}번</li>
                                ))}
                            </ol>
                        </div>
                    )}
                </>
            )}

            {/* 해설 토글 */}
            <button className={styles.explanationButton} onClick={() => setShowExplanation(!showExplanation)}>
                {showExplanation ? '📖 해설 숨기기' : '📚 왜 요세푸스인가?'}
            </button>
            {showExplanation && (
                <div className={styles.explanation}>
                    <div
                        dangerouslySetInnerHTML={{
                            __html: EXPLANATION
                                .replace(/\n/g, '<br />')
                                .replace(/##\s*(.*?)<br \/>/g, '<h3>$1</h3>')
                                .replace(/###\s*(.*?)<br \/>/g, '<h4>$1</h4>')
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/`([^`]+)`/g, '<code>$1</code>'),
                        }}
                    />
                </div>
            )}
        </div>
    );
}
