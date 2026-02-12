'use client';

import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';
import {
    HanoiState,
    initializeGame,
    isValidMove,
    solveHanoi,
    Move,
} from '@/lib/puzzles/hanoi';
import { playSound } from '@/lib/sound';

const DISK_COLORS = [
    'linear-gradient(to right, #ff9a9e 0%, #fecfef 100%)', // 1 (Smallest)
    'linear-gradient(to right, #a18cd1 0%, #fbc2eb 100%)', // 2
    'linear-gradient(to right, #fad0c4 0%, #ffd1ff 100%)', // 3
    'linear-gradient(to right, #ffecd2 0%, #fcb69f 100%)', // 4
    'linear-gradient(to right, #84fab0 0%, #8fd3f4 100%)', // 5
    'linear-gradient(to right, #a1c4fd 0%, #c2e9fb 100%)', // 6
    'linear-gradient(to right, #e0c3fc 0%, #8ec5fc 100%)', // 7
    'linear-gradient(to right, #f093fb 0%, #f5576c 100%)', // 8 (Largest)
];

export default function HanoiPuzzle() {
    const [numDisks, setNumDisks] = useState<number>(3);
    const [gameState, setGameState] = useState<HanoiState>(initializeGame(3));
    const [selectedTower, setSelectedTower] = useState<number | null>(null);
    const [isSolving, setIsSolving] = useState<boolean>(false);
    const [explanation, setExplanation] = useState<string>('탑을 옮겨보세요!');

    // Auto-solve refs to handle cancellation
    const solveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isSolvingRef = useRef<boolean>(false);

    useEffect(() => {
        handleReset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [numDisks]);

    const handleReset = () => {
        stopAutoSolve();
        setGameState(initializeGame(numDisks));
        setSelectedTower(null);
        setExplanation('탑을 옮겨보세요!');
    };

    const handleTowerClick = (towerIndex: number) => {
        if (isSolving) return;

        // Case 1: Select a tower
        if (selectedTower === null) {
            if (gameState.towers[towerIndex].length === 0) {
                setExplanation('이 기둥에는 옮길 원판이 없어요.');
                return;
            }
            setSelectedTower(towerIndex);
            setExplanation('어디로 옮길까요?');
            playSound('select');
            return;
        }

        // Case 2: Deselect (click same tower)
        if (selectedTower === towerIndex) {
            setSelectedTower(null);
            setExplanation('선택을 취소했어요.');
            return;
        }

        // Case 3: Move disk
        if (isValidMove(gameState, selectedTower, towerIndex)) {
            moveDisk(selectedTower, towerIndex);
            setSelectedTower(null);
            setExplanation('성공! 다음은 어디로 옮길까요?');
            playSound('move');
        } else {
            setExplanation('앗! 큰 원판은 작은 원판 위에 올릴 수 없어요.');
            setSelectedTower(null); // Reset selection on invalid move for better UX
            playSound('error');
        }
    };

    const moveDisk = (from: number, to: number) => {
        setGameState((prev) => {
            const newTowers = prev.towers.map((t) => [...t]);
            const disk = newTowers[from].pop();
            if (disk !== undefined) {
                newTowers[to].push(disk);
            }
            return {
                towers: newTowers as [number[], number[], number[]],
                moves: prev.moves + 1,
            };
        });
    };

    const handleAutoSolve = async () => {
        if (isSolving) return;

        // Reset first to ensure clean state
        const cleanState = initializeGame(numDisks);
        setGameState(cleanState);

        setIsSolving(true);
        isSolvingRef.current = true;

        const moves = solveHanoi(numDisks);
        setExplanation(`자동 풀이 시작! 총 ${moves.length}번 이동합니다.`);

        // Execute moves with delay
        for (let i = 0; i < moves.length; i++) {
            if (!isSolvingRef.current) break; // Check for cancellation

            await new Promise<void>((resolve) => {
                solveTimeoutRef.current = setTimeout(() => {
                    const move = moves[i];
                    moveDisk(move.from, move.to);
                    setExplanation(`[${i + 1}/${moves.length}] ${move.explanation}`);
                    playSound('move');
                    resolve();
                }, 600); // 600ms Delay per move
            });
        }

        setIsSolving(false);
        isSolvingRef.current = false;
        if (isSolvingRef.current) { // Only show completion if not cancelled
            setExplanation('완성! 재귀 알고리즘의 힘, 멋지죠?');
        }
    };

    const stopAutoSolve = () => {
        if (solveTimeoutRef.current) {
            clearTimeout(solveTimeoutRef.current);
        }
        isSolvingRef.current = false;
        setIsSolving(false);
    };

    const isComplete = gameState.towers[2].length === numDisks;
    const minMoves = Math.pow(2, numDisks) - 1;

    useEffect(() => {
        if (isComplete && gameState.moves > 0) {
            playSound('success');
        }
    }, [isComplete, gameState.moves]);

    return (
        <div className={styles.container}>
            <Link href="/" className={styles.backButton}>
                ← 돌아가기
            </Link>
            <header className={styles.header}>
                <h1 className={styles.title}>Tower of Hanoi</h1>
                <p className={styles.subtitle}>
                    전설의 하노이 탑! 모든 원판을 오른쪽 끝으로 옮겨보세요.
                </p>
            </header>

            <div className={styles.gameArea}>
                {/* Render Towers (Background & Click Targets) */}
                {[0, 1, 2].map((towerIndex) => (
                    <div
                        key={towerIndex}
                        className={`${styles.towerContainer} ${selectedTower === towerIndex ? styles.selectedTower : ''
                            }`}
                        onClick={() => handleTowerClick(towerIndex)}
                    >
                        <div className={styles.rod} />
                        <div className={styles.base} />
                    </div>
                ))}

                {/* Render Disks (Absolute Overlay for Animation) */}
                {Array.from({ length: numDisks }, (_, i) => i + 1).map((diskId) => {
                    // Find position in state
                    let towerIndex = -1;
                    let diskIndex = -1;

                    gameState.towers.forEach((tower, tIdx) => {
                        const dIdx = tower.indexOf(diskId);
                        if (dIdx !== -1) {
                            towerIndex = tIdx;
                            diskIndex = dIdx; // 0 is bottom
                        }
                    });

                    if (towerIndex === -1) return null; // Should not happen

                    // Calculate visual properties
                    // Grid columns are 3. Centers are at 16.666%, 50%, 83.333%
                    const leftPercent = [16.666, 50, 83.333][towerIndex];

                    // Bottom position: Base height + (index * diskHeight)
                    // Base is at 12px from bottom. Rod starts there.
                    let bottomPx = 25 + (gameState.towers[towerIndex].length - 1 - diskIndex) * 32;

                    // OLD LOGIC WAS REVERSED IN RENDERING, BUT STATE IS [3,2,1] (0 is BOTTOM in state? No push(i) means n at 0?)
                    // Check initializeGame: push(i) where i goes n down to 1.
                    // sourceTower = [n, n-1, ..., 1]. 
                    // 1 is at end (TOP). n is at 0 (BOTTOM).
                    // So diskIndex 0 is BOTTOM.
                    // WAIT. My previous fix was .slice().reverse() to render.
                    // So towers[0] is the BOTTOM disk.
                    // So visual index IS the array index.

                    // Re-verify logic:
                    // initializeGame: for (i=n; i>=1; i--) sourceTower.push(i). 
                    // n=3 -> push 3, push 2, push 1. Tower: [3, 2, 1].
                    // 3 is at index 0. 1 is at index 2.
                    // Physically: 3 is largest (bottom), 1 is smallest (top).
                    // So index 0 (3) should be at BOTTOM.
                    // index 2 (1) should be at TOP.
                    // So bottomPx = 25 + diskIndex * 32.

                    bottomPx = 25 + diskIndex * 32;

                    // Float if selected and is the top disk
                    const isTopDisk =
                        diskIndex === gameState.towers[towerIndex].length - 1;

                    if (selectedTower === towerIndex && isTopDisk && !isSolving) {
                        bottomPx += 40; // Float height
                    }

                    return (
                        <div
                            key={diskId}
                            className={styles.disk}
                            style={{
                                left: `${leftPercent}%`,
                                bottom: `${bottomPx}px`,
                                width: `${40 + diskId * 24}px`, // Dynamic width
                                background: DISK_COLORS[(diskId - 1) % DISK_COLORS.length],
                            }}
                        />
                    );
                })}
            </div>

            <div className={styles.controls}>
                <div className={styles.controlGroup}>
                    <span className={styles.label}>설명</span>
                    <span className={styles.value} style={{ color: '#667eea' }}>
                        {isComplete ? '축하합니다! 퍼즐을 풀었어요! 🎉' : explanation}
                    </span>
                </div>

                <div className={styles.stats}>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>이동 횟수</span>
                        <span className={styles.statValue}>{gameState.moves}</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>최소 이동 (2ⁿ-1)</span>
                        <span className={styles.statValue}>{minMoves}</span>
                    </div>
                </div>

                <div className={styles.controlGroup} style={{ flexDirection: 'column', alignItems: 'center' }}>
                    <span className={styles.label} style={{ marginBottom: '0.5rem' }}>원판 개수 (난이도)</span>
                    <div className={styles.numberControl}>
                        <button
                            className={styles.numBtn}
                            onClick={() => setNumDisks(Math.max(3, numDisks - 1))}
                            disabled={numDisks <= 3 || isSolving}
                        >
                            −
                        </button>
                        <span className={styles.numDisplay}>{numDisks}</span>
                        <button
                            className={styles.numBtn}
                            onClick={() => setNumDisks(Math.min(8, numDisks + 1))}
                            disabled={numDisks >= 8 || isSolving}
                        >
                            +
                        </button>
                    </div>
                </div>

                <div className={styles.buttonGroup}>
                    <button
                        className={`${styles.button} ${styles.btnSecondary}`}
                        onClick={handleReset}
                    >
                        다시 하기
                    </button>
                    <button
                        className={`${styles.button} ${styles.btnPrimary}`}
                        onClick={handleAutoSolve}
                        disabled={isSolving || isComplete}
                    >
                        {isSolving ? '푸는 중...' : '자동 풀이 보기'}
                    </button>
                </div>
            </div>
        </div>
    );
}
