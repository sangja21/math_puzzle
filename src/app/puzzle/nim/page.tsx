'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

/**
 * NIM Game 핵심 라이브러리 (NIM-sum 전략 공유)
 */
const INITIAL_PILES = [3, 4, 5];

/**
 * NIM Game 전략 설명 (JSDoc)
 * 
 * 1. NIM-sum (XOR 합): 모든 더미의 돌 개수를 2진수로 변환하여 각 자릿수별로 XOR 합을 구한 것.
 * 2. 승리 전략: 자신의 턴이 끝날 때 NIM-sum을 0으로 만들면 승리 확률이 매우 높음 (Normal Play 기준).
 * 3. 계산 방법: xor = piles[0] ^ piles[1] ^ piles[2]
 *    - xor != 0 이면, xor ^ piles[i] < piles[i] 인 더미 i를 찾아 piles[i] - (xor ^ piles[i]) 개를 가져가면 됨.
 */

export default function NimGamePage() {
    const [piles, setPiles] = useState<number[]>(INITIAL_PILES);
    const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
    const [isAiThinking, setIsAiThinking] = useState(false);

    // 게임 종료 및 승자 계산 (파생 상태)
    const isGameOver = piles.every(p => p === 0);
    const winner = isGameOver ? (isPlayerTurn ? 'AI' : 'Player') : null;

    // AI 이동 로직 (전략 적용)
    const handleAiMove = useCallback(() => {
        setIsAiThinking(true);

        // NIM-sum 계산
        const nimSum = piles.reduce((acc, curr) => acc ^ curr, 0);

        let targetPile = -1;
        let removeCount = 0;

        // "쉬움" 모드: 70% 확률로 실수(랜덤 이동), 30% 확률로 최적 이동
        const isEasyMove = Math.random() < 0.7;

        if (nimSum !== 0 && !isEasyMove) {
            // 최적 전략: Nim-sum을 0으로 만드는 한 수 찾기
            for (let i = 0; i < piles.length; i++) {
                const targetCount = piles[i] ^ nimSum;
                if (targetCount < piles[i]) {
                    targetPile = i;
                    removeCount = piles[i] - targetCount;
                    break;
                }
            }
        }

        // 최적 전략을 찾지 못했거나 랜덤 모드인 경우: 랜덤하게 1개 이상의 돌이 있는 더미 선택
        if (targetPile === -1) {
            const availablePiles = piles.map((p, i) => p > 0 ? i : -1).filter(i => i !== -1);
            targetPile = availablePiles[Math.floor(Math.random() * availablePiles.length)];
            // 랜덤하게 1개에서 전체 개수 사이로 가져감
            removeCount = Math.floor(Math.random() * piles[targetPile]) + 1;
        }

        // 실제 돌 제거
        setTimeout(() => {
            setPiles(prev => {
                const next = [...prev];
                next[targetPile] -= removeCount;
                return next;
            });
            setIsAiThinking(false);
            setIsPlayerTurn(true);
        }, 500);
    }, [piles]);

    // AI 턴 처리
    useEffect(() => {
        if (!isPlayerTurn && !winner && !isAiThinking) {
            const aiTimer = setTimeout(() => {
                handleAiMove();
            }, 1000); // 1초 생각하는 척
            return () => clearTimeout(aiTimer);
        }
    }, [isPlayerTurn, winner, isAiThinking, handleAiMove]);

    // 돌 제거 로직
    const removeStones = (pileIndex: number, count: number) => {
        if (winner || isAiThinking) return;
        if (count <= 0 || piles[pileIndex] < count) return;

        const nextPiles = [...piles];
        nextPiles[pileIndex] -= count;
        setPiles(nextPiles);
        setIsPlayerTurn(!isPlayerTurn);
    };

    const handleReset = () => {
        setPiles(INITIAL_PILES);
        setIsPlayerTurn(true);
        setIsAiThinking(false);
    };

    return (
        <div className={styles.container}>
            <Link href="/puzzles" className={styles.backButton}>
                ← 수학 퍼즐 목록
            </Link>

            <header className={styles.header}>
                <h1 className={styles.title}>NIM Game</h1>
                <p className={styles.subtitle}>
                    돌 더미에서 돌을 가져가세요. 마지막 돌을 가져가는 사람이 승리합니다!
                </p>
            </header>

            <div className={styles.gameBoard}>
                {winner && (
                    <div className={styles.winnerOverlay}>
                        <h2 className={styles.winnerTitle}>
                            {winner === 'Player' ? '🎉 You Win!' : '🤖 AI Wins!'}
                        </h2>
                        <button className={`${styles.actionButton} ${styles.resetBtn}`} onClick={handleReset}>
                            다시 시작하기
                        </button>
                    </div>
                )}

                <div className={styles.statusPanel}>
                    <div className={`${styles.turnIndicator} ${isPlayerTurn ? styles.turnActive : ''}`}>
                        <span className={styles.turnDot}></span>
                        {isPlayerTurn ? '당신의 차례입니다' : 'AI가 생각 중입니다...'}
                    </div>
                    <button className={styles.resetBtn} onClick={handleReset} disabled={isAiThinking}>
                        초기화
                    </button>
                </div>

                <div className={styles.pilesContainer}>
                    {piles.map((count, idx) => (
                        <div key={idx} className={`${styles.pile} ${isPlayerTurn && count > 0 ? styles.pileActive : ''}`}>
                            <span className={styles.pileTitle}>Pile {idx + 1}</span>
                            <div className={styles.stonesDisplay}>
                                {Array.from({ length: count }).map((_, sIdx) => (
                                    <div key={sIdx} className={styles.stone}></div>
                                ))}
                            </div>
                            <div className={styles.controls}>
                                <button
                                    className={styles.removeButton}
                                    onClick={() => removeStones(idx, 1)}
                                    disabled={!isPlayerTurn || count === 0 || isAiThinking}
                                >
                                    돌 1개 가져오기
                                </button>
                                {count > 1 && (
                                    <button
                                        className={styles.removeButton}
                                        onClick={() => {
                                            const amount = prompt(`Pile ${idx + 1}에서 몇 개의 돌을 가져갈까요? (1~${count}개)`, "1");
                                            if (amount) {
                                                const n = parseInt(amount);
                                                if (!isNaN(n) && n >= 1 && n <= count) {
                                                    removeStones(idx, n);
                                                } else {
                                                    alert(`1에서 ${count} 사이의 숫자를 입력해주세요.`);
                                                }
                                            }
                                        }}
                                        disabled={!isPlayerTurn || isAiThinking}
                                    >
                                        직접 입력해서 가져오기
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.strategyBox}>
                    <h3 className={styles.strategyTitle}>📖 수학적 필승 전략 (NIM-sum)</h3>
                    <p className={styles.strategyText}>
                        {`이 게임의 비밀은 'XOR(배타적 논리합)' 연산에 있습니다.
            모든 더미의 돌 개수를 2진수로 바꾼 뒤 각 자리의 XOR 합을 구한 것을 'NIM-sum'이라고 합니다.
            
            내 턴이 끝났을 때 이 NIM-sum을 0으로 만들 수 있다면, 상대방이 어떤 수를 두더라도 나는 다시 0으로 만들 수 있는 수가 존재하게 되어 결국 승리하게 됩니다!
            
            (지금의 AI는 아기도 이길 수 있도록 아주 쉬운 난이도로 설정되어 있어요 😉)`}
                    </p>
                </div>
            </div>
        </div>
    );
}
