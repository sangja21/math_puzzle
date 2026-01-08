'use client';

import React, { useState, useCallback, DragEvent } from 'react';
import Link from 'next/link';
import {
    GameState,
    DifficultyConfig,
    DIFFICULTIES,
    createInitialState,
    moveCoin,
    measure,
    selectFakeCoin,
    getRemainingCandidates,
    getHint,
    EXPLANATION,
} from '@/lib/puzzles/fakecoin';
import styles from './page.module.css';

type DropZone = 'pool' | 'left' | 'right';

export default function FakeCoinPuzzlePage() {
    const [difficulty, setDifficulty] = useState<DifficultyConfig>(DIFFICULTIES[1]);
    const [gameState, setGameState] = useState<GameState>(() => createInitialState(DIFFICULTIES[1]));
    const [hint, setHint] = useState('');
    const [showExplanation, setShowExplanation] = useState(false);
    const [isSelecting, setIsSelecting] = useState(false);
    const [draggingCoin, setDraggingCoin] = useState<number | null>(null);
    const [dropTarget, setDropTarget] = useState<DropZone | null>(null);

    // 난이도 변경
    const handleDifficultyChange = useCallback((newDifficulty: DifficultyConfig) => {
        setDifficulty(newDifficulty);
        setGameState(createInitialState(newDifficulty));
        setHint('');
        setIsSelecting(false);
    }, []);

    // 드래그 시작
    const handleDragStart = useCallback((e: DragEvent<HTMLDivElement>, coinId: number) => {
        if (gameState.isComplete) return;

        const coin = gameState.coins.find(c => c.id === coinId);
        if (!coin || coin.isEliminated) return;

        setDraggingCoin(coinId);
        e.dataTransfer.setData('text/plain', coinId.toString());
        e.dataTransfer.effectAllowed = 'move';
    }, [gameState.coins, gameState.isComplete]);

    // 드래그 종료
    const handleDragEnd = useCallback(() => {
        setDraggingCoin(null);
        setDropTarget(null);
    }, []);

    // 드래그 오버
    const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    // 드롭 영역 진입
    const handleDragEnter = useCallback((zone: DropZone) => {
        setDropTarget(zone);
    }, []);

    // 드롭 영역 이탈
    const handleDragLeave = useCallback(() => {
        setDropTarget(null);
    }, []);

    // 드롭
    const handleDrop = useCallback((e: DragEvent<HTMLDivElement>, zone: DropZone) => {
        e.preventDefault();
        const coinId = parseInt(e.dataTransfer.getData('text/plain'), 10);

        if (!isNaN(coinId)) {
            setGameState(prev => moveCoin(prev, coinId, zone));
        }

        setDraggingCoin(null);
        setDropTarget(null);
        setHint('');
    }, []);

    // 정답 선택 클릭
    const handleCoinClick = useCallback((coinId: number) => {
        if (!isSelecting || gameState.isComplete) return;

        const coin = gameState.coins.find(c => c.id === coinId);
        if (!coin || coin.isEliminated) return;

        setGameState(prev => selectFakeCoin(prev, coinId));
        setIsSelecting(false);
    }, [isSelecting, gameState.isComplete, gameState.coins]);

    // 측정
    const handleMeasure = useCallback(() => {
        setGameState(prev => measure(prev));
        setHint('');
    }, []);

    // 정답 선택 모드 토글
    const handleSelectMode = useCallback(() => {
        setIsSelecting(prev => !prev);
        setHint(isSelecting ? '' : '🎯 가짜 동전이라고 생각되는 동전을 클릭하세요!');
    }, [isSelecting]);

    // 다시 시작
    const handleReset = useCallback(() => {
        setGameState(createInitialState(difficulty));
        setHint('');
        setIsSelecting(false);
    }, [difficulty]);

    // 힌트
    const handleHint = useCallback(() => {
        setHint(getHint(gameState));
    }, [gameState]);

    const leftCoins = gameState.coins.filter(c => c.position === 'left');
    const rightCoins = gameState.coins.filter(c => c.position === 'right');
    const poolCoins = gameState.coins.filter(c => c.position === 'pool');
    const remainingCandidates = getRemainingCandidates(gameState);

    // 동전 렌더링 함수
    const renderCoin = (coin: { id: number; isEliminated: boolean; position: string }, isOnScale: boolean = false) => (
        <div
            key={coin.id}
            className={`${styles.coin} ${isOnScale ? styles.onScale : ''} ${coin.isEliminated ? styles.eliminated : ''} ${draggingCoin === coin.id ? styles.dragging : ''} ${isSelecting && !coin.isEliminated ? styles.selectable : ''}`}
            draggable={!coin.isEliminated && !gameState.isComplete && !isSelecting}
            onDragStart={(e) => handleDragStart(e, coin.id)}
            onDragEnd={handleDragEnd}
            onClick={() => handleCoinClick(coin.id)}
        >
            🪙
            <span className={styles.coinNumber}>{coin.id + 1}</span>
            {coin.isEliminated && <span className={styles.eliminatedMark}>✓진짜</span>}
        </div>
    );

    return (
        <div className={styles.container}>
            {/* 홈 버튼 */}
            <Link href="/" className={styles.homeButton}>
                🏠 메인으로
            </Link>

            {/* 헤더 */}
            <header className={styles.header}>
                <h1 className={styles.title}>🪙 가짜 동전 찾기</h1>
                <p className={styles.subtitle}>삼진 탐색의 효율성을 체험하세요!</p>
            </header>

            {/* 난이도 선택 */}
            <div className={styles.difficultySelector}>
                {DIFFICULTIES.map(d => (
                    <button
                        key={d.id}
                        className={`${styles.difficultyButton} ${difficulty.id === d.id ? styles.selected : ''}`}
                        onClick={() => handleDifficultyChange(d)}
                    >
                        {d.name} ({d.coinCount}개)
                    </button>
                ))}
            </div>

            {/* 게임 상태 */}
            <div className={styles.stats}>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>측정 횟수</span>
                    <span className={styles.statValue}>{gameState.measureCount}</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>최적 해</span>
                    <span className={styles.statValue}>{difficulty.optimalMeasures}회</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>용의자</span>
                    <span className={styles.statValue}>{remainingCandidates}개</span>
                </div>
            </div>

            {/* 저울 영역 */}
            <div className={styles.scaleArea}>
                {/* 왼쪽 접시 */}
                <div
                    className={`${styles.scalePlate} ${dropTarget === 'left' ? styles.dropActive : ''}`}
                    onDragOver={handleDragOver}
                    onDragEnter={() => handleDragEnter('left')}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'left')}
                >
                    <div className={styles.plateLabel}>⬅️ 왼쪽</div>
                    <div className={styles.plateCoins}>
                        {leftCoins.map(coin => renderCoin(coin, true))}
                        {leftCoins.length === 0 && (
                            <span className={styles.emptyPlate}>드래그하여 올리기</span>
                        )}
                    </div>
                    <div className={styles.coinCount}>({leftCoins.length}개)</div>
                </div>

                {/* 저울 중심 */}
                <div className={styles.scaleCenter}>
                    <div className={styles.scaleIcon}>⚖️</div>
                    <button
                        className={styles.measureButton}
                        onClick={handleMeasure}
                        disabled={gameState.isComplete || leftCoins.length === 0 || rightCoins.length === 0}
                    >
                        측정하기
                    </button>
                </div>

                {/* 오른쪽 접시 */}
                <div
                    className={`${styles.scalePlate} ${dropTarget === 'right' ? styles.dropActive : ''}`}
                    onDragOver={handleDragOver}
                    onDragEnter={() => handleDragEnter('right')}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'right')}
                >
                    <div className={styles.plateLabel}>오른쪽 ➡️</div>
                    <div className={styles.plateCoins}>
                        {rightCoins.map(coin => renderCoin(coin, true))}
                        {rightCoins.length === 0 && (
                            <span className={styles.emptyPlate}>드래그하여 올리기</span>
                        )}
                    </div>
                    <div className={styles.coinCount}>({rightCoins.length}개)</div>
                </div>
            </div>

            {/* 동전 보관소 */}
            <div
                className={`${styles.coinPool} ${dropTarget === 'pool' ? styles.dropActive : ''}`}
                onDragOver={handleDragOver}
                onDragEnter={() => handleDragEnter('pool')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'pool')}
            >
                <div className={styles.poolLabel}>
                    🪙 동전 보관소 (드래그하여 저울에 올리기)
                </div>
                <div className={styles.poolCoins}>
                    {poolCoins.map(coin => renderCoin(coin, false))}
                    {poolCoins.length === 0 && (
                        <span className={styles.emptyPool}>모든 동전이 저울 위에 있어요</span>
                    )}
                </div>
            </div>

            {/* 메시지 */}
            {gameState.message && (
                <div className={`${styles.message} ${gameState.isComplete ? (gameState.selectedCoin === gameState.fakeCoinId ? styles.success : styles.error) : ''}`}>
                    {gameState.message}
                </div>
            )}

            {hint && !gameState.message && (
                <div className={styles.hintMessage}>
                    {hint}
                </div>
            )}

            {/* 측정 기록 */}
            {gameState.history.length > 0 && (
                <div className={styles.history}>
                    <div className={styles.historyLabel}>📋 측정 기록</div>
                    {gameState.history.map((h, i) => (
                        <div key={i} className={styles.historyItem}>
                            <span>#{i + 1}: [{h.leftCoins.map(id => id + 1).join(',')}] vs [{h.rightCoins.map(id => id + 1).join(',')}] → </span>
                            <span className={
                                h.result === 'equal' ? styles.resultEqual :
                                    h.result === 'left-heavy' ? styles.resultLeft : styles.resultRight
                            }>
                                {h.result === 'equal' ? '균형 ⚖️' : h.result === 'left-heavy' ? '왼쪽 무거움 ⬅️' : '오른쪽 무거움 ➡️'}
                            </span>
                        </div>
                    ))}
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
                <button
                    className={`${styles.selectButton} ${isSelecting ? styles.selecting : ''}`}
                    onClick={handleSelectMode}
                    disabled={gameState.isComplete}
                >
                    {isSelecting ? '❌ 취소' : '🎯 정답 선택'}
                </button>
                <button className={styles.resetButton} onClick={handleReset}>
                    🔄 다시 시작
                </button>
            </div>

            {/* 해설 */}
            <button
                className={styles.explanationButton}
                onClick={() => setShowExplanation(!showExplanation)}
            >
                {showExplanation ? '📖 해설 숨기기' : '📚 왜 3그룹이 효율적일까?'}
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
                                .replace(/\|.*\|/g, (match) => `<code>${match}</code>`)
                        }}
                    />
                </div>
            )}

            {/* 도움말 */}
            <div className={styles.help}>
                <h3>🎮 게임 방법</h3>
                <ol>
                    <li><strong>동전을 드래그</strong>하여 저울 위에 올려놓으세요</li>
                    <li>양쪽에 <strong>같은 수</strong>의 동전을 올리고 <strong>측정</strong>하세요</li>
                    <li>가벼운 쪽에 가짜 동전이 있어요!</li>
                    <li>용의자가 줄어들면 <strong>정답 선택</strong>으로 가짜 동전을 지목하세요</li>
                </ol>
                <p className={styles.tipBox}>
                    💡 <strong>팁:</strong> 동전을 3그룹으로 나눠 2그룹만 저울에 올리면 효율적이에요!
                </p>
            </div>
        </div>
    );
}
