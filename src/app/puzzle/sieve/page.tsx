'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
    SieveState,
    createInitialState,
    advanceStep,
    completeAll,
    countPrimes,
    getPrimeNumbers,
    LIMIT_PRESETS,
    DEFAULT_LIMIT,
    EXPLANATION,
} from '@/lib/puzzles/sieve';
import styles from './page.module.css';

export default function SievePuzzlePage() {
    const [selectedLimit, setSelectedLimit] = useState(DEFAULT_LIMIT);
    const [gameState, setGameState] = useState<SieveState | null>(null);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [speed, setSpeed] = useState(300); // ms per step
    const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

    // 게임 시작
    const handleStart = useCallback(() => {
        if (autoPlayRef.current) {
            clearTimeout(autoPlayRef.current);
        }
        setIsAutoPlaying(false);
        setShowExplanation(false);
        setGameState(createInitialState(selectedLimit));
    }, [selectedLimit]);

    // 게임 리셋
    const handleReset = useCallback(() => {
        if (autoPlayRef.current) {
            clearTimeout(autoPlayRef.current);
        }
        setIsAutoPlaying(false);
        setShowExplanation(false);
        setGameState(null);
    }, []);

    // 다음 단계
    const handleNextStep = useCallback(() => {
        if (!gameState || gameState.isComplete) return;
        setGameState(prev => prev ? advanceStep(prev) : null);
    }, [gameState]);

    // 전체 실행
    const handleCompleteAll = useCallback(() => {
        if (autoPlayRef.current) {
            clearTimeout(autoPlayRef.current);
        }
        setIsAutoPlaying(false);
        setGameState(prev => prev ? completeAll(prev) : null);
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
        if (isAutoPlaying && gameState && !gameState.isComplete) {
            autoPlayRef.current = setTimeout(() => {
                setGameState(prev => prev ? advanceStep(prev) : null);
            }, speed);
        } else if (gameState?.isComplete) {
            setIsAutoPlaying(false);
        }

        return () => {
            if (autoPlayRef.current) {
                clearTimeout(autoPlayRef.current);
            }
        };
    }, [isAutoPlaying, gameState, speed]);

    // 그리드 클래스 계산
    const getGridClass = useMemo(() => {
        if (!gameState) return '';
        const limit = gameState.limit;
        if (limit <= 50) return styles.gridSmall;
        if (limit <= 100) return styles.gridMedium;
        if (limit <= 500) return styles.gridLarge;
        return styles.gridXLarge;
    }, [gameState?.limit]);

    // 해설 HTML 변환
    const explanationHtml = useMemo(() => {
        return EXPLANATION
            .replace(/\n/g, '<br />')
            .replace(/## (.*?)(?=<br|$)/g, '<h2>$1</h2>')
            .replace(/### (.*?)(?=<br|$)/g, '<h3>$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\| (.*?) \| (.*?) \| (.*?) \|/g, '<tr><td>$1</td><td>$2</td><td>$3</td></tr>')
            .replace(/\|---.*?\|/g, '')
            .replace(/(<tr>.*?<\/tr>)+/g, '<table><thead><tr>$&</tr></thead><tbody></tbody></table>');
    }, []);

    // 게임 시작 전 화면
    if (!gameState) {
        return (
            <div className={styles.container}>
                <Link href="/" className={styles.homeButton}>
                    🏠 목록으로
                </Link>

                <header className={styles.header}>
                    <h1 className={styles.title}>🔢 에라토스테네스의 체</h1>
                    <p className={styles.subtitle}>
                        고대 그리스의 소수 찾기 알고리즘을 시각적으로 체험해보세요!
                    </p>
                </header>

                <div className={styles.settingsPanel}>
                    <span className={styles.settingsLabel}>범위 선택:</span>
                    <select
                        className={styles.rangeSelect}
                        value={selectedLimit}
                        onChange={(e) => setSelectedLimit(Number(e.target.value))}
                    >
                        {LIMIT_PRESETS.map(preset => (
                            <option key={preset} value={preset}>
                                2 ~ {preset}
                            </option>
                        ))}
                    </select>
                    <button className={styles.startButton} onClick={handleStart}>
                        🚀 시작하기
                    </button>
                </div>

                <div className={styles.help}>
                    <h3>🎮 게임 방법</h3>
                    <ul>
                        <li><strong>에라토스테네스의 체</strong>는 소수를 찾는 가장 오래된 알고리즘입니다</li>
                        <li>2부터 시작해서 각 소수의 <strong>배수를 제거</strong>합니다</li>
                        <li>제거되지 않고 남은 수가 바로 <strong>소수</strong>입니다!</li>
                        <li>√N까지만 확인하면 충분합니다</li>
                    </ul>
                </div>
            </div>
        );
    }

    const primeCount = countPrimes(gameState);
    const eliminatedCount = gameState.numbers.filter(n => n.isEliminated).length;
    const sqrtLimit = Math.floor(Math.sqrt(gameState.limit));

    return (
        <div className={styles.container}>
            <Link href="/" className={styles.homeButton}>
                🏠 목록으로
            </Link>

            <header className={styles.header}>
                <h1 className={styles.title}>🔢 에라토스테네스의 체</h1>
                <p className={styles.subtitle}>
                    2부터 {gameState.limit}까지의 소수를 찾아보세요!
                </p>
            </header>

            {/* 게임 상태 */}
            <div className={styles.stats}>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>현재 소수</span>
                    <span className={styles.statValue}>
                        {gameState.currentPrime === 0 ? '시작 전' : gameState.currentPrime}
                    </span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>발견된 소수</span>
                    <span className={`${styles.statValue} ${styles.prime}`}>{primeCount}개</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>제거된 수</span>
                    <span className={`${styles.statValue} ${styles.eliminated}`}>{eliminatedCount}개</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>확인 범위</span>
                    <span className={styles.statValue}>√{gameState.limit} = {sqrtLimit}</span>
                </div>
            </div>

            {/* 진행 바 */}
            <div className={styles.progressContainer}>
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{ width: `${(gameState.currentStep / gameState.totalSteps) * 100}%` }}
                    />
                </div>
                <span className={styles.progressText}>
                    {gameState.currentStep} / {gameState.totalSteps} 단계
                </span>
            </div>

            {/* 숫자 그리드 */}
            <div className={`${styles.numbersGrid} ${getGridClass}`}>
                {gameState.numbers.map(num => (
                    <div
                        key={num.value}
                        className={`
              ${styles.number}
              ${num.isEliminated ? styles.numberEliminated : styles.numberPrime}
              ${num.value === gameState.currentPrime ? styles.numberCurrentPrime : ''}
              ${gameState.highlightedNumbers.includes(num.value) ? styles.highlighted : ''}
            `}
                        title={
                            num.isEliminated
                                ? `${num.value} (${num.eliminatedBy}의 배수로 제거됨)`
                                : `${num.value} (소수)`
                        }
                    >
                        {num.value}
                    </div>
                ))}
            </div>

            {/* 컨트롤 */}
            <div className={styles.controls}>
                <button
                    className={styles.nextButton}
                    onClick={handleNextStep}
                    disabled={gameState.isComplete || isAutoPlaying}
                >
                    ▶️ 다음 단계
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
                    min="50"
                    max="1000"
                    value={1050 - speed}
                    onChange={(e) => setSpeed(1050 - Number(e.target.value))}
                />
                <span>{speed < 200 ? '빠름' : speed < 500 ? '보통' : '느림'}</span>
            </div>

            {/* 결과 및 해설 */}
            {gameState.isComplete && (
                <div className={styles.result}>
                    <h2>🎉 완료!</h2>
                    <p>
                        2부터 {gameState.limit}까지 에라토스테네스의 체를 완료했습니다.<br />
                        총 <strong>{primeCount}개</strong>의 소수를 찾았습니다!
                    </p>
                    <div className={styles.primesList}>
                        <strong>소수 목록:</strong> {getPrimeNumbers(gameState).join(', ')}
                    </div>
                    <button
                        className={styles.explanationButton}
                        onClick={() => setShowExplanation(!showExplanation)}
                    >
                        {showExplanation ? '📖 해설 숨기기' : '💡 알고리즘 원리 알아보기'}
                    </button>

                    {showExplanation && (
                        <div
                            className={styles.explanation}
                            dangerouslySetInnerHTML={{ __html: explanationHtml }}
                        />
                    )}
                </div>
            )}

            {/* 도움말 */}
            {!gameState.isComplete && (
                <div className={styles.help}>
                    <h3>🎮 현재 진행 상황</h3>
                    <ul>
                        <li>
                            <strong>노란색 숫자</strong>: 현재 처리 중인 소수
                        </li>
                        <li>
                            <strong>빨간색 하이라이트</strong>: 이번 단계에서 제거되는 배수들
                        </li>
                        <li>
                            <strong>초록색 숫자</strong>: 아직 남아있는 수 (잠재적 소수)
                        </li>
                        <li>
                            <strong>취소선</strong>: 제거된 합성수
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}
