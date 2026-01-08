'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import Hourglass from '@/components/Hourglass';
import {
    GameState,
    PuzzleConfig,
    PUZZLES,
    createInitialState,
    flipHourglass,
    advanceTime,
    hasRunningHourglass,
    isGameOver,
    isOptimalSolution,
} from '@/lib/puzzles/hourglass';
import styles from './page.module.css';

export default function HourglassPuzzlePage() {
    const [selectedPuzzle, setSelectedPuzzle] = useState<PuzzleConfig>(PUZZLES[0]);
    const [gameState, setGameState] = useState<GameState>(() =>
        createInitialState(PUZZLES[0])
    );
    const [animatingId, setAnimatingId] = useState<string | null>(null);
    const [isAdvancing, setIsAdvancing] = useState(false);
    const [message, setMessage] = useState<string>('');

    // 퍼즐 선택
    const handlePuzzleSelect = useCallback((puzzle: PuzzleConfig) => {
        setSelectedPuzzle(puzzle);
        setGameState(createInitialState(puzzle));
        setMessage('');
        setAnimatingId(null);
    }, []);

    // 게임 리셋
    const handleReset = useCallback(() => {
        setGameState(createInitialState(selectedPuzzle));
        setMessage('');
        setAnimatingId(null);
    }, [selectedPuzzle]);

    // 모래시계 뒤집기
    const handleFlip = useCallback((hourglassId: string) => {
        if (isAdvancing || animatingId || gameState.isComplete) return;

        setAnimatingId(hourglassId);

        setTimeout(() => {
            setGameState(prev => flipHourglass(prev, hourglassId));
            setAnimatingId(null);
            setMessage(`🔄 ${hourglassId === 'hourglass-0' ? selectedPuzzle.hourglasses[0].capacity : selectedPuzzle.hourglasses[1].capacity}분 시계를 뒤집었어요!`);
        }, 400);
    }, [isAdvancing, animatingId, gameState.isComplete, selectedPuzzle]);

    // 시간 진행
    const handleAdvance = useCallback(() => {
        if (isAdvancing || animatingId || gameState.isComplete) return;
        if (!hasRunningHourglass(gameState)) {
            setMessage('⚠️ 흐르고 있는 시계가 없어요! 먼저 시계를 뒤집어주세요.');
            return;
        }

        setIsAdvancing(true);

        const [newState, timeAdvanced] = advanceTime(gameState);

        setTimeout(() => {
            setGameState(newState);
            setIsAdvancing(false);

            if (newState.isComplete) {
                const isOptimal = isOptimalSolution(newState, selectedPuzzle);
                setMessage(isOptimal
                    ? `🏆 완벽해요! ${newState.moveCount}번 만에 ${selectedPuzzle.targetTime}분을 정확히 잴 수 있었어요!`
                    : `🎉 성공! ${selectedPuzzle.targetTime}분을 재는데 성공했어요! (${newState.moveCount}번 뒤집음)`
                );
            } else if (isGameOver(newState)) {
                setMessage(`💥 아이고! ${newState.elapsedTime}분이 되어버렸어요. 목표는 ${selectedPuzzle.targetTime}분이었는데...`);
            } else {
                setMessage(`⏱️ ${timeAdvanced}분이 흘렀어요! (총 ${newState.elapsedTime}분)`);
            }
        }, 500);
    }, [isAdvancing, animatingId, gameState, selectedPuzzle]);

    const isOver = isGameOver(gameState);

    return (
        <div className={styles.container}>
            {/* 홈 버튼 */}
            <Link href="/" className={styles.homeButton}>
                🏠 메인으로
            </Link>

            {/* 헤더 */}
            <header className={styles.header}>
                <h1 className={styles.title}>⏳ 모래시계 퍼즐</h1>
                <p className={styles.subtitle}>마틴 가드너의 클래식 퍼즐</p>
            </header>

            {/* 퍼즐 선택 */}
            <div className={styles.puzzleSelector}>
                {PUZZLES.map(puzzle => (
                    <button
                        key={puzzle.id}
                        className={`${styles.puzzleButton} ${selectedPuzzle.id === puzzle.id ? styles.selected : ''}`}
                        onClick={() => handlePuzzleSelect(puzzle)}
                    >
                        {puzzle.name}
                    </button>
                ))}
            </div>

            {/* 퍼즐 설명 */}
            <div className={styles.description}>
                <p>{selectedPuzzle.description}</p>
            </div>

            {/* 게임 상태 */}
            <div className={styles.stats}>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>경과 시간</span>
                    <span className={`${styles.statValue} ${isOver ? styles.error : gameState.isComplete ? styles.success : ''}`}>
                        {gameState.elapsedTime}분
                    </span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>목표</span>
                    <span className={styles.statValue}>{selectedPuzzle.targetTime}분</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>뒤집기</span>
                    <span className={styles.statValue}>{gameState.moveCount}회</span>
                </div>
            </div>

            {/* 모래시계들 */}
            <div className={styles.hourglasses}>
                {gameState.hourglasses.map((hg, index) => (
                    <Hourglass
                        key={hg.id}
                        capacity={hg.capacity}
                        topSand={hg.topSand}
                        isRunning={hg.isRunning}
                        isAnimating={animatingId === hg.id}
                        onClick={() => handleFlip(hg.id)}
                        disabled={isAdvancing || gameState.isComplete || isOver}
                    />
                ))}
            </div>

            {/* 액션 버튼 */}
            <div className={styles.actions}>
                <button
                    className={`${styles.advanceButton} ${isAdvancing ? styles.advancing : ''}`}
                    onClick={handleAdvance}
                    disabled={isAdvancing || !hasRunningHourglass(gameState) || gameState.isComplete || isOver}
                >
                    {isAdvancing ? '⏳ 시간이 흐르는 중...' : '▶️ 시간 진행'}
                </button>
                <button className={styles.resetButton} onClick={handleReset}>
                    🔄 다시 시작
                </button>
            </div>

            {/* 메시지 */}
            {message && (
                <div className={`${styles.message} ${gameState.isComplete ? styles.successMessage : isOver ? styles.errorMessage : ''}`}>
                    {message}
                </div>
            )}

            {/* 도움말 */}
            <div className={styles.help}>
                <h3>🎮 게임 방법</h3>
                <ol>
                    <li><strong>시간 진행</strong> → 가장 먼저 비는 시계까지 시간이 흘러요</li>
                    <li><strong>모래시계 클릭</strong> → 뒤집어서 위아래 모래가 바뀌어요</li>
                    <li><strong>목표 시간</strong>을 정확히 재면 성공! 🎉</li>
                </ol>
                <p className={styles.hint}>
                    💡 힌트: 모래시계를 언제 뒤집을지가 핵심이에요!
                </p>
            </div>
        </div>
    );
}
