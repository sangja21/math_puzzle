'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import Balance from '@/components/Balance';
import {
    GameState,
    DifficultyConfig,
    DIFFICULTIES,
    createInitialState,
    moveWeight,
    getHint,
    EXPLANATION,
    WeightPosition,
} from '@/lib/puzzles/balance';
import styles from './page.module.css';

export default function BalancePuzzlePage() {
    const [difficulty, setDifficulty] = useState<DifficultyConfig>(DIFFICULTIES[1]); // 기본: 보통
    const [gameState, setGameState] = useState<GameState>(() => createInitialState(DIFFICULTIES[1]));
    const [hint, setHint] = useState<string>('');
    const [showExplanation, setShowExplanation] = useState(false);
    const [solvedCount, setSolvedCount] = useState(0);

    // 난이도 변경
    const handleDifficultyChange = useCallback((newDifficulty: DifficultyConfig) => {
        setDifficulty(newDifficulty);
        setGameState(createInitialState(newDifficulty));
        setHint('');
        setShowExplanation(false);
    }, []);

    // 추 이동
    const handleMoveWeight = useCallback((weightValue: number, newPosition: WeightPosition) => {
        setGameState(prev => {
            const newState = moveWeight(prev, weightValue, newPosition);

            // 성공 시 힌트 초기화
            if (newState.isComplete && !prev.isComplete) {
                setHint('🎉 정답이에요! 다음 문제에 도전해보세요!');
                setSolvedCount(c => c + 1);
            }

            return newState;
        });
    }, []);

    // 힌트 요청
    const handleHint = useCallback(() => {
        const newHint = getHint(gameState);
        setHint(newHint);
        setGameState(prev => ({
            ...prev,
            hintsUsed: prev.hintsUsed + 1,
        }));
    }, [gameState]);

    // 다시 시작 (같은 목표)
    const handleRetry = useCallback(() => {
        setGameState(prev => ({
            ...createInitialState(prev.difficulty),
            targetWeight: prev.targetWeight, // 같은 목표 유지
        }));
        setHint('');
    }, []);

    // 새 문제
    const handleNewPuzzle = useCallback(() => {
        setGameState(createInitialState(difficulty));
        setHint('');
    }, [difficulty]);

    return (
        <div className={styles.container}>
            {/* 홈 버튼 */}
            <Link href="/" className={styles.homeButton}>
                🏠 메인으로
            </Link>

            {/* 헤더 */}
            <header className={styles.header}>
                <h1 className={styles.title}>⚖️ 양팔저울 퍼즐</h1>
                <p className={styles.subtitle}>비셰(Bachet)의 클래식 수학 퍼즐</p>
            </header>

            {/* 난이도 선택 */}
            <div className={styles.difficultySelector}>
                {DIFFICULTIES.map(d => (
                    <button
                        key={d.id}
                        className={`${styles.difficultyButton} ${difficulty.id === d.id ? styles.selected : ''}`}
                        onClick={() => handleDifficultyChange(d)}
                    >
                        {d.name}
                    </button>
                ))}
            </div>

            {/* 문제 설명 */}
            <div className={styles.mission}>
                <span className={styles.missionLabel}>🎯 목표</span>
                <span className={styles.missionTarget}>{gameState.targetWeight}kg</span>
                <span className={styles.missionText}>을 정확히 재세요!</span>
            </div>

            {/* 게임 상태 */}
            <div className={styles.stats}>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>이동 횟수</span>
                    <span className={styles.statValue}>{gameState.moveCount}</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>힌트 사용</span>
                    <span className={styles.statValue}>{gameState.hintsUsed}</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>해결한 문제</span>
                    <span className={styles.statValue}>{solvedCount}</span>
                </div>
            </div>

            {/* 양팔저울 */}
            <Balance
                gameState={gameState}
                onMoveWeight={handleMoveWeight}
            />

            {/* 힌트 표시 */}
            {hint && (
                <div className={`${styles.hint} ${gameState.isComplete ? styles.successHint : ''}`}>
                    {hint}
                </div>
            )}

            {/* 액션 버튼 */}
            <div className={styles.actions}>
                <button
                    className={styles.hintButton}
                    onClick={handleHint}
                    disabled={gameState.isComplete}
                >
                    💡 힌트
                </button>
                <button className={styles.retryButton} onClick={handleRetry}>
                    🔄 다시 시도
                </button>
                <button className={styles.newButton} onClick={handleNewPuzzle}>
                    ➡️ 새 문제
                </button>
            </div>

            {/* 해설 보기 */}
            <button
                className={styles.explanationButton}
                onClick={() => setShowExplanation(!showExplanation)}
            >
                {showExplanation ? '📖 해설 숨기기' : '📚 원리 알아보기'}
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
                        }}
                    />
                </div>
            )}

            {/* 게임 방법 */}
            <div className={styles.help}>
                <h3>🎮 게임 방법</h3>
                <ol>
                    <li><strong>추를 드래그</strong>하여 저울 위에 올려놓으세요</li>
                    <li>추는 <strong>양쪽 접시</strong> 모두에 올릴 수 있어요</li>
                    <li>왼쪽 = 물건 무게 + 왼쪽 추들</li>
                    <li>오른쪽 = 오른쪽 추들</li>
                    <li>양쪽 무게가 같으면 <strong>균형 성공!</strong> 🎉</li>
                </ol>
                <p className={styles.tipBox}>
                    💡 <strong>팁:</strong> 추를 물건과 같은 쪽에 놓으면 물건 무게에서 빼는 효과가 있어요!
                </p>
            </div>
        </div>
    );
}
