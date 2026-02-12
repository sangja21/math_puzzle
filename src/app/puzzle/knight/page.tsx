
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import {
    KnightState,
    BoardSize,
    Position,
    initializeGame,
    isValidMove,
    getValidMoves,
    solveKnightTour,
} from '@/lib/puzzles/knight';
import { playSound } from '@/lib/sound';

export default function KnightTourPuzzle() {
    const [size, setSize] = useState<BoardSize>(5);
    const [gameState, setGameState] = useState<KnightState>(initializeGame(5));
    const [validMoves, setValidMoves] = useState<Position[]>([]);
    const [isSolving, setIsSolving] = useState<boolean>(false);
    const [explanation, setExplanation] = useState<string>('시작할 위치를 클릭하세요!');

    const solveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isSolvingRef = useRef<boolean>(false);

    // Initialize game on size change
    useEffect(() => {
        handleReset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [size]);

    // Update valid moves whenever current position changes
    useEffect(() => {
        if (gameState.currentPos && !gameState.isComplete) {
            const moves = getValidMoves(gameState, gameState.currentPos);
            setValidMoves(moves);

            if (moves.length === 0 && gameState.stepCount < size * size - 1) {
                setExplanation('앗! 더 이상 갈 곳이 없어요. 재시작해보세요!');
                playSound('error');
            } else if (gameState.stepCount === size * size - 1) {
                setExplanation('축하합니다! 모든 칸을 정복했어요! 🎉');
                playSound('success');
            } else {
                setExplanation('다음 위치를 선택하세요.');
            }
        } else if (!gameState.currentPos) {
            setValidMoves([]);
            setExplanation('시작할 위치를 클릭하세요!');
        }
    }, [gameState, size]);

    const handleReset = () => {
        stopAutoSolve();
        setGameState(initializeGame(size));
        setValidMoves([]);
        setExplanation('시작할 위치를 클릭하세요!');
        playSound('select');
    };

    const handleCellClick = (row: number, col: number) => {
        if (isSolving || gameState.isComplete) return;

        // Case 1: First move (placing the knight)
        if (!gameState.currentPos) {
            const newPos = { row, col };
            updateGameState(newPos);
            playSound('move');
            return;
        }

        // Case 2: Subsequent moves
        const isMoveValid = validMoves.some(
            (m) => m.row === row && m.col === col
        );

        if (isMoveValid) {
            updateGameState({ row, col });
            playSound('move');
        } else {
            // Invalid move shake affect or sound
            playSound('error');
        }
    };

    const updateGameState = (newPos: Position) => {
        setGameState((prev) => {
            const newBoard = prev.board.map((r) => [...r]);
            const newStepCount = prev.currentPos ? prev.stepCount + 1 : 0; // 0 for start

            newBoard[newPos.row][newPos.col] = newStepCount;

            return {
                ...prev,
                board: newBoard,
                currentPos: newPos,
                stepCount: newStepCount,
                isComplete: newStepCount === size * size - 1,
                history: [...prev.history, newPos],
            };
        });
    };

    const handleAutoSolve = async () => {
        if (isSolving) return;

        // If game hasn't started, pick a random start or (0,0)
        let startPos = gameState.currentPos;
        if (!startPos) {
            startPos = { row: 0, col: 0 };
            // We need to 'place' the knight first visually
        }

        // Reset board but keep start position if it exists, otherwise full reset
        const cleanState = initializeGame(size);
        // Logic: warnsdorff needs a clean board. 
        // If user is stuck in middle, auto-solve from middle is hard (NP-hard).
        // So we restart from the User's start position or (0,0).

        // Let's restart from scratch for simplicity and guarantee
        setGameState(cleanState);
        startPos = { row: 0, col: 0 }; // Always start at 0,0 for auto-solve consistency or random?
        // Let's make it start at 0,0 for now.

        setExplanation('AI가 최적의 경로를 계산 중입니다...');

        // Small delay to let UI render the reset
        await new Promise(r => setTimeout(r, 100));

        const solutionPath = solveKnightTour(size, startPos);

        if (!solutionPath) {
            setExplanation('이 크기/위치에서는 해법을 찾을 수 없습니다.');
            return;
        }

        setIsSolving(true);
        isSolvingRef.current = true;
        setExplanation(`자동 풀이 시작! (Warnsdorff 알고리즘)`);

        // Execute moves
        // First place knight
        updateGameState(solutionPath[0]);
        await new Promise(r => setTimeout(r, 400));

        for (let i = 1; i < solutionPath.length; i++) {
            if (!isSolvingRef.current) break;

            await new Promise<void>((resolve) => {
                solveTimeoutRef.current = setTimeout(() => {
                    updateGameState(solutionPath[i]);
                    playSound('move');
                    resolve();
                }, 300); // Speed of auto solve
            });
        }

        setIsSolving(false);
        isSolvingRef.current = false;
        if (isSolvingRef.current) {
            setExplanation('완성! 모든 칸을 방문했습니다.');
            playSound('success');
        }
    };

    const stopAutoSolve = () => {
        if (solveTimeoutRef.current) {
            clearTimeout(solveTimeoutRef.current);
        }
        isSolvingRef.current = false;
        setIsSolving(false);
    };

    // Helper to determine cell color
    const getCellColor = (row: number, col: number) => {
        return (row + col) % 2 === 0 ? styles.light : styles.dark;
    };

    const getCellStatusClass = (row: number, col: number) => {
        if (gameState.currentPos?.row === row && gameState.currentPos?.col === col) {
            return styles.current; // Current Knight Position
        }
        if (gameState.board[row][col] !== -1) {
            return styles.visited; // Already visited
        }
        if (validMoves.some(m => m.row === row && m.col === col)) {
            return styles.validMove; // Possible move
        }
        return '';
    };

    return (
        <div className={styles.container}>
            <Link href="/" className={styles.backButton}>
                ← 돌아가기
            </Link>

            <header className={styles.header}>
                <h1 className={styles.title}>Knight&apos;s Tour</h1>
                <p className={styles.subtitle}>
                    체스 나이트(🐴)를 움직여 모든 칸을 한 번씩만 방문하세요!
                </p>
            </header>

            <div className={styles.gameArea}>
                <div className={styles.controls}>
                    <div className={styles.sizeSelector}>
                        {[5, 6, 7, 8].map((s) => (
                            <button
                                key={s}
                                className={`${styles.sizeBtn} ${size === s ? styles.active : ''}`}
                                onClick={() => !isSolving && setSize(s as BoardSize)}
                                disabled={isSolving}
                            >
                                {s} × {s}
                            </button>
                        ))}
                    </div>

                    <div className={styles.statusBar}>
                        <div>
                            <span className={styles.statusLabel}>설명</span>
                            <div style={{ fontWeight: '600', color: '#4a5568' }}>{explanation}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span className={styles.statusLabel}>방문 / 전체</span>
                            <div className={styles.statusValue}>
                                {gameState.stepCount + (gameState.currentPos ? 1 : 0)} / {size * size}
                            </div>
                        </div>
                    </div>

                    <div className={styles.boardContainer}>
                        <div
                            className={styles.board}
                            style={{
                                gridTemplateColumns: `repeat(${size}, 1fr)`,
                            }}
                        >
                            {gameState.board.map((row, r) => (
                                row.map((cellValue, c) => (
                                    <div
                                        key={`${r}-${c}`}
                                        className={`${styles.cell} ${getCellColor(r, c)} ${getCellStatusClass(r, c)}`}
                                        onClick={() => handleCellClick(r, c)}
                                    >
                                        <div className={styles.cellContent}>
                                            {/* Show Knight if current pos */}
                                            {gameState.currentPos?.row === r && gameState.currentPos?.col === c && (
                                                <div className={styles.knightWrapper}>
                                                    <Image
                                                        src="/chess.png"
                                                        alt="Knight"
                                                        width={40}
                                                        height={40}
                                                        className={styles.knightImage}
                                                    />
                                                </div>
                                            )}

                                            {/* Show step number if visited but not current */}
                                            {cellValue !== -1 && !(gameState.currentPos?.row === r && gameState.currentPos?.col === c) && (
                                                <span className={styles.stepNumber}>{cellValue + 1}</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ))}
                        </div>
                    </div>

                    <div className={styles.buttonGroup} style={{ marginTop: '2rem' }}>
                        <button
                            className={`${styles.button} ${styles.btnSecondary}`}
                            onClick={handleReset}
                        >
                            다시 하기
                        </button>
                        <button
                            className={`${styles.button} ${styles.btnPrimary}`}
                            onClick={handleAutoSolve}
                            disabled={isSolving || gameState.isComplete}
                        >
                            {isSolving ? 'AI가 푸는 중...' : '자동 풀이 (AI)'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
