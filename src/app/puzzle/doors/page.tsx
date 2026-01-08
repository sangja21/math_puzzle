'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
    GameState,
    createInitialState,
    advanceGuard,
    completeAllGuards,
    countOpenDoors,
    getOpenDoorNumbers,
    isPerfectSquare,
    TOTAL_DOORS,
    TOTAL_GUARDS,
    EXPLANATION,
} from '@/lib/puzzles/doors';
import styles from './page.module.css';

export default function DoorsPuzzlePage() {
    const [gameState, setGameState] = useState<GameState>(() => createInitialState());
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [speed, setSpeed] = useState(100); // ms per guard
    const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

    // 게임 리셋
    const handleReset = useCallback(() => {
        if (autoPlayRef.current) {
            clearTimeout(autoPlayRef.current);
        }
        setIsAutoPlaying(false);
        setShowExplanation(false);
        setGameState(createInitialState());
    }, []);

    // 다음 간수
    const handleNextGuard = useCallback(() => {
        if (gameState.isComplete) return;
        setGameState(prev => advanceGuard(prev));
    }, [gameState.isComplete]);

    // 전체 실행
    const handleCompleteAll = useCallback(() => {
        if (autoPlayRef.current) {
            clearTimeout(autoPlayRef.current);
        }
        setIsAutoPlaying(false);
        setGameState(prev => completeAllGuards(prev));
    }, []);

    // 자동 재생
    const handleAutoPlay = useCallback(() => {
        if (isAutoPlaying) {
            if (autoPlayRef.current) {
                clearTimeout(autoPlayRef.current);
            }
            setIsAutoPlaying(false);
        } else {
            setIsAutoPlaying(true);
        }
    }, [isAutoPlaying]);

    // 자동 재생 effect
    useEffect(() => {
        if (isAutoPlaying && !gameState.isComplete) {
            autoPlayRef.current = setTimeout(() => {
                setGameState(prev => advanceGuard(prev));
            }, speed);
        } else if (gameState.isComplete) {
            setIsAutoPlaying(false);
        }

        return () => {
            if (autoPlayRef.current) {
                clearTimeout(autoPlayRef.current);
            }
        };
    }, [isAutoPlaying, gameState, speed]);

    const openCount = countOpenDoors(gameState);
    const closedCount = TOTAL_DOORS - openCount;

    return (
        <div className={styles.container}>
            {/* 홈 버튼 */}
            <Link href="/" className={styles.homeButton}>
                🏠 메인으로
            </Link>

            {/* 헤더 */}
            <header className={styles.header}>
                <h1 className={styles.title}>🚪 100개의 문 퍼즐</h1>
                <p className={styles.subtitle}>100명의 간수가 문을 열고 닫으면, 마지막엔 어떤 문이 열려있을까?</p>
            </header>

            {/* 게임 상태 */}
            <div className={styles.stats}>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>현재 간수</span>
                    <span className={styles.statValue}>
                        {gameState.currentGuard === 0 ? '시작 전' : `${gameState.currentGuard}번`}
                    </span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>열린 문</span>
                    <span className={`${styles.statValue} ${styles.open}`}>{openCount}개</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>닫힌 문</span>
                    <span className={`${styles.statValue} ${styles.closed}`}>{closedCount}개</span>
                </div>
            </div>

            {/* 진행 바 */}
            <div className={styles.progressContainer}>
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{ width: `${(gameState.currentGuard / TOTAL_GUARDS) * 100}%` }}
                    />
                </div>
                <span className={styles.progressText}>{gameState.currentGuard} / {TOTAL_GUARDS}</span>
            </div>

            {/* 문 그리드 */}
            <div className={styles.doorsGrid}>
                {gameState.doors.map(door => (
                    <div
                        key={door.number}
                        className={`
              ${styles.door}
              ${door.isOpen ? styles.doorOpen : styles.doorClosed}
              ${gameState.highlightedDoors.includes(door.number) ? styles.highlighted : ''}
              ${gameState.isComplete && isPerfectSquare(door.number) ? styles.perfectSquare : ''}
            `}
                        title={`${door.number}번 문 (토글 ${door.toggleCount}회)`}
                    >
                        <span className={styles.doorNumber}>{door.number}</span>
                        <span className={styles.doorIcon}>{door.isOpen ? '🚪' : '🔒'}</span>
                    </div>
                ))}
            </div>

            {/* 컨트롤 */}
            <div className={styles.controls}>
                <button
                    className={styles.nextButton}
                    onClick={handleNextGuard}
                    disabled={gameState.isComplete || isAutoPlaying}
                >
                    ▶️ 다음 간수
                </button>
                <button
                    className={`${styles.autoButton} ${isAutoPlaying ? styles.playing : ''}`}
                    onClick={handleAutoPlay}
                    disabled={gameState.isComplete}
                >
                    {isAutoPlaying ? '⏸️ 일시정지' : '⏩ 자동 재생'}
                </button>
                <button
                    className={styles.completeButton}
                    onClick={handleCompleteAll}
                    disabled={gameState.isComplete || isAutoPlaying}
                >
                    ⏭️ 전체 실행
                </button>
                <button className={styles.resetButton} onClick={handleReset}>
                    🔄 다시 시작
                </button>
            </div>

            {/* 속도 조절 */}
            <div className={styles.speedControl}>
                <label>속도: </label>
                <input
                    type="range"
                    min="20"
                    max="500"
                    value={500 - speed}
                    onChange={(e) => setSpeed(500 - Number(e.target.value))}
                />
                <span>{speed < 100 ? '빠름' : speed < 300 ? '보통' : '느림'}</span>
            </div>

            {/* 결과 및 해설 */}
            {gameState.isComplete && (
                <div className={styles.result}>
                    <h2>🎉 완료!</h2>
                    <p>
                        100명의 간수가 모두 지나갔습니다.<br />
                        최종적으로 <strong>{openCount}개</strong>의 문이 열려 있습니다!
                    </p>
                    <p className={styles.openDoors}>
                        열린 문: {getOpenDoorNumbers(gameState).join(', ')}
                    </p>
                    <button
                        className={styles.explanationButton}
                        onClick={() => setShowExplanation(!showExplanation)}
                    >
                        {showExplanation ? '📖 해설 숨기기' : '💡 왜 이런 결과가 나왔을까?'}
                    </button>

                    {showExplanation && (
                        <div className={styles.explanation}>
                            <div dangerouslySetInnerHTML={{ __html: EXPLANATION.replace(/\n/g, '<br />').replace(/##/g, '<h3>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                        </div>
                    )}
                </div>
            )}

            {/* 도움말 */}
            <div className={styles.help}>
                <h3>🎮 게임 방법</h3>
                <ul>
                    <li><strong>n번 간수</strong>는 n의 배수인 문들을 방문해서 토글합니다</li>
                    <li>문이 열려있으면 닫고, 닫혀있으면 엽니다</li>
                    <li>100명의 간수가 모두 지나간 후 열린 문의 <strong>패턴</strong>을 찾아보세요!</li>
                </ul>
            </div>
        </div>
    );
}
