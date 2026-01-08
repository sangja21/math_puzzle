'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
    EuclidState,
    createInitialState,
    applyMove,
    getBestMove,
    EXPLANATION,
} from '@/lib/puzzles/euclid';
import styles from './page.module.css';

export default function EuclidGamePage() {
    const [aInput, setAInput] = useState(32);
    const [bInput, setBInput] = useState(12);
    const [gameState, setGameState] = useState<EuclidState | null>(null);
    const [hoverK, setHoverK] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);

    // 게임 시작
    const handleStart = useCallback(() => {
        if (aInput <= 0 || bInput <= 0) return;
        setGameState(createInitialState(aInput, bInput));
    }, [aInput, bInput]);

    // 플레이어 이동 실행
    const handleMove = useCallback((k: number) => {
        if (!gameState || gameState.turn !== 0 || gameState.isComplete) return;
        const moveValue = k * gameState.b;
        setGameState(prev => applyMove(prev!, moveValue));
        setHoverK(null);
    }, [gameState]);

    // AI 턴 처리
    useEffect(() => {
        if (!gameState || gameState.isComplete || gameState.turn !== 1) return;

        const timer = setTimeout(() => {
            const bestK = getBestMove(gameState);
            const moveValue = bestK * gameState.b;
            setGameState(prev => applyMove(prev!, moveValue));
        }, 1000); // 1초 생각하는 척

        return () => clearTimeout(timer);
    }, [gameState]);

    // 다시 시작
    const handleReset = useCallback(() => {
        setGameState(null);
    }, []);

    // 렌더링을 위한 스타일 계산
    const getRectStyle = () => {
        if (!gameState) return {};
        const { a, b } = gameState;
        const aspectRatio = a / b;

        let width, height;
        if (aspectRatio > 1.5) {
            width = 600;
            height = 600 / aspectRatio;
        } else {
            height = 300;
            width = 300 * aspectRatio;
        }

        return {
            width: `${width}px`,
            height: `${height}px`,
            position: 'relative' as const,
            border: '4px solid white',
            background: 'rgba(255,255,255,0.1)',
            margin: '20px auto',
            transition: 'all 0.5s ease'
        };
    };

    // 자를 수 있는 정사각형 렌더링
    const renderSquareGuidelines = () => {
        if (!gameState) return null;
        const { a, b, turn } = gameState;
        const maxK = Math.floor(a / b);

        // AI 턴일 때는 클릭 방지
        const isPlayerTurn = turn === 0;

        const squares = [];
        for (let k = 1; k <= maxK; k++) {
            const sizePct = (b / a) * 100;
            const leftPct = (k - 1) * sizePct;
            const isHovered = isPlayerTurn && hoverK !== null && k <= hoverK;

            squares.push(
                <div
                    key={k}
                    className={`${styles.squareGuide} ${isHovered ? styles.hovered : ''} ${!isPlayerTurn ? styles.disabled : ''}`}
                    style={{
                        left: `${leftPct}%`,
                        width: `${sizePct}%`,
                        height: '100%',
                    }}
                    onMouseEnter={() => isPlayerTurn && setHoverK(k)}
                    onMouseLeave={() => isPlayerTurn && setHoverK(null)}
                    onClick={() => isPlayerTurn && handleMove(k)}
                >
                    {isPlayerTurn && (
                        <div className={styles.cutText}>
                            ✂️ {k}
                        </div>
                    )}
                </div>
            );
        }
        return squares;
    };

    return (
        <div className={styles.container}>
            <Link href="/" className={styles.homeButton}>🏠 메인으로</Link>

            <header className={styles.header}>
                <h1 className={styles.title}>🧮 유클리드 직사각형</h1>
                <p className={styles.subtitle}>
                    직사각형을 정사각형으로 잘라내세요! <br />
                    상대(AI)와 번갈아 자르며 마지막 조각을 가져가면 승리합니다.
                </p>
            </header>

            {/* 설정 영역 */}
            {!gameState && (
                <div className={styles.inputForm}>
                    <div className={styles.inputGroup}>
                        <label>긴 변 (A)</label>
                        <input type="number" value={aInput} onChange={e => setAInput(Number(e.target.value))} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>짧은 변 (B)</label>
                        <input type="number" value={bInput} onChange={e => setBInput(Number(e.target.value))} />
                    </div>
                    <button onClick={handleStart} className={styles.startButton}>⬜️ 게임 시작</button>
                </div>
            )}

            {/* 게임 영역 */}
            {gameState && (
                <div className={styles.gameArea}>
                    <div className={styles.status}>
                        <div className={styles.playerTurn}>
                            현재 턴: <span className={gameState.turn === 0 ? styles.p1 : styles.p2}>
                                {gameState.turn === 0 ? '🔵 플레이어' : '🔴 AI (생각 중...)'}
                            </span>
                        </div>
                        <div className={styles.dimensions}>
                            현재 크기: <strong>{gameState.a} x {gameState.b}</strong>
                        </div>
                    </div>

                    {gameState.isComplete ? (
                        <div className={styles.result}>
                            🎉 <strong>{gameState.winner === 0 ? '플레이어' : 'AI'}</strong> 승리!
                            <button onClick={handleReset} className={styles.restartButton}>🔄 다시 하기</button>
                        </div>
                    ) : (
                        <div className={styles.visualizer} style={getRectStyle()}>
                            {/* 남은 영역 */}
                            <div
                                className={styles.remainArea}
                                style={{
                                    left: `${(gameState.b * Math.floor(gameState.a / gameState.b)) / gameState.a * 100}%`,
                                    width: `${(gameState.a % gameState.b) / gameState.a * 100}%`
                                }}
                            >
                                <span className={styles.remainLabel}>남는 부분</span>
                            </div>

                            {/* 가이드 */}
                            {renderSquareGuidelines()}
                        </div>
                    )}

                    {/* 힌트: 남는 부분 설명 */}
                    {!gameState.isComplete && gameState.turn === 0 && (
                        <p className={styles.instruction}>
                            마우스로 <strong>정사각형 영역</strong>을 선택해서 잘라내세요.
                        </p>
                    )}
                </div>
            )}

            {/* 해설 */}
            <button className={styles.explanationButton} onClick={() => setShowExplanation(!showExplanation)}>
                {showExplanation ? '📖 해설 닫기' : '📚 원리 보기'}
            </button>

            {showExplanation && (
                <div className={styles.explanation} dangerouslySetInnerHTML={{
                    __html: EXPLANATION.replace(/\n/g, '<br/>')
                }} />
            )}
        </div>
    );
}
