'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import {
    GameState,
    Character,
    GameMode,
    createInitialState,
    toggleBoatPassenger,
    crossRiver,
    undoMove,
    getCharacterInfo,
    getHint,
    MODE_CONFIGS,
    CLASSIC_EXPLANATION,
    MISSIONARY_EXPLANATION,
} from '@/lib/puzzles/river';
import styles from './page.module.css';

export default function RiverPuzzlePage() {
    const [mode, setMode] = useState<GameMode>('classic');
    const [gameState, setGameState] = useState<GameState>(() => createInitialState('classic'));
    const [isMoving, setIsMoving] = useState(false);
    const [hint, setHint] = useState('');
    const [showExplanation, setShowExplanation] = useState(false);

    const config = MODE_CONFIGS[mode];

    // 모드 변경
    const handleModeChange = useCallback((newMode: GameMode) => {
        setMode(newMode);
        setGameState(createInitialState(newMode));
        setHint('');
        setShowExplanation(false);
    }, []);

    // 캐릭터 클릭 (배에 태우기/내리기)
    const handleCharacterClick = useCallback((character: Character) => {
        if (isMoving || gameState.isGameOver || gameState.isComplete) return;

        // 클래식 모드에서 농부는 클릭 불가
        if (mode === 'classic' && character === 'farmer') return;

        setGameState(prev => toggleBoatPassenger(prev, character));
    }, [isMoving, gameState.isGameOver, gameState.isComplete, mode]);

    // 배 이동
    const handleCrossRiver = useCallback(() => {
        if (isMoving || gameState.isGameOver || gameState.isComplete) return;

        // 클래식 모드: 농부가 배 위치에 있어야 함
        if (mode === 'classic') {
            const currentBank = gameState.boatSide === 'left' ? gameState.leftBank : gameState.rightBank;
            if (!currentBank.includes('farmer')) return;
        }

        // 선교사 모드: 최소 1명은 배에 있어야 함
        if (mode === 'missionary' && gameState.boatPassengers.length === 0) return;

        setIsMoving(true);

        setTimeout(() => {
            setGameState(prev => crossRiver(prev));
            setIsMoving(false);
            setHint('');
        }, 800);
    }, [isMoving, gameState, mode]);

    // Undo
    const handleUndo = useCallback(() => {
        if (isMoving) return;
        setGameState(prev => undoMove(prev));
        setHint('');
    }, [isMoving]);

    // 다시 시작
    const handleReset = useCallback(() => {
        setGameState(createInitialState(mode));
        setHint('');
        setIsMoving(false);
    }, [mode]);

    // 힌트
    const handleHint = useCallback(() => {
        setHint(getHint(gameState));
    }, [gameState]);

    // 캐릭터가 어디에 있는지 확인
    const getCharacterLocation = (character: Character): 'left' | 'right' | 'boat' => {
        if (gameState.boatPassengers.includes(character)) return 'boat';
        if (gameState.leftBank.includes(character)) return 'left';
        if (gameState.rightBank.includes(character)) return 'right';
        return 'left';
    };

    // 클릭 가능 여부
    const canClick = (character: Character): boolean => {
        if (mode === 'classic' && character === 'farmer') return false;
        if (isMoving || gameState.isGameOver || gameState.isComplete) return false;

        const location = getCharacterLocation(character);

        // 배에 있으면 내릴 수 있음
        if (location === 'boat') return true;

        // 현재 배 위치와 같은 쪽에 있어야 태울 수 있음
        if (location !== gameState.boatSide) return false;

        // 클래식 모드: 농부가 같은 쪽에 있어야 함
        if (mode === 'classic') {
            const farmerLocation = getCharacterLocation('farmer');
            return farmerLocation === location || farmerLocation === 'boat';
        }

        return true;
    };

    // 배 이동 가능 여부
    const canCross = (): boolean => {
        if (isMoving || gameState.isGameOver || gameState.isComplete) return false;

        if (mode === 'classic') {
            const currentBank = gameState.boatSide === 'left' ? gameState.leftBank : gameState.rightBank;
            return currentBank.includes('farmer');
        } else {
            return gameState.boatPassengers.length > 0;
        }
    };

    return (
        <div className={styles.container}>
            {/* 홈 버튼 */}
            <Link href="/" className={styles.homeButton}>
                🏠 메인으로
            </Link>

            {/* 헤더 */}
            <header className={styles.header}>
                <h1 className={styles.title}>🚣 강 건너기 퍼즐</h1>
                <p className={styles.subtitle}>{config.description}</p>
            </header>

            {/* 모드 선택 */}
            <div className={styles.modeSelector}>
                {Object.values(MODE_CONFIGS).map(cfg => (
                    <button
                        key={cfg.id}
                        className={`${styles.modeButton} ${mode === cfg.id ? styles.selected : ''}`}
                        onClick={() => handleModeChange(cfg.id)}
                    >
                        {cfg.name}
                    </button>
                ))}
            </div>

            {/* 게임 상태 */}
            <div className={styles.stats}>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>이동 횟수</span>
                    <span className={styles.statValue}>{gameState.moveCount}</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>최적 해</span>
                    <span className={styles.statValue}>{config.optimalMoves}회</span>
                </div>
                <div className={styles.stat}>
                    <span className={styles.statLabel}>배 정원</span>
                    <span className={styles.statValue}>{config.boatCapacity}명</span>
                </div>
            </div>

            {/* 게임 영역 */}
            <div className={styles.gameArea}>
                {/* 왼쪽 강변 */}
                <div className={styles.bank}>
                    <div className={styles.bankLabel}>🏕️ 이쪽 강변</div>
                    <div className={styles.bankCharacters}>
                        {config.characters.map(char => {
                            const location = getCharacterLocation(char.id);
                            if (location !== 'left') return null;

                            return (
                                <button
                                    key={char.id}
                                    className={`${styles.character} ${canClick(char.id) ? styles.clickable : ''}`}
                                    onClick={() => handleCharacterClick(char.id)}
                                    disabled={!canClick(char.id)}
                                >
                                    <span className={styles.characterEmoji}>{char.emoji}</span>
                                    <span className={styles.characterName}>{char.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 강 */}
                <div className={styles.river}>
                    {/* 배 */}
                    <div
                        className={`${styles.boat} ${isMoving ? styles.moving : ''} ${canCross() ? styles.canCross : ''}`}
                        style={{
                            left: gameState.boatSide === 'left' ? '10%' : '70%',
                        }}
                        onClick={handleCrossRiver}
                    >
                        <div className={styles.boatBody}>
                            <span className={styles.boatEmoji}>🚣</span>

                            {/* 배 위의 캐릭터들 */}
                            <div className={styles.boatPassengers}>
                                {/* 클래식 모드: 농부 표시 */}
                                {mode === 'classic' && (gameState.boatSide === 'left' ? gameState.leftBank : gameState.rightBank).includes('farmer') && (
                                    <span className={styles.passengerEmoji}>🧑‍🌾</span>
                                )}

                                {/* 승객들 */}
                                {gameState.boatPassengers.map(passenger => {
                                    const info = getCharacterInfo(passenger, mode);
                                    return (
                                        <button
                                            key={passenger}
                                            className={styles.passengerEmoji}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCharacterClick(passenger);
                                            }}
                                        >
                                            {info?.emoji}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className={styles.boatHint}>
                            {!isMoving && (canCross() ? '클릭하여 이동' : mode === 'missionary' ? '2명까지 태우세요' : '')}
                        </div>
                    </div>

                    {/* 물결 */}
                    <div className={styles.waves}></div>
                </div>

                {/* 오른쪽 강변 */}
                <div className={styles.bank}>
                    <div className={styles.bankLabel}>🏠 저쪽 강변</div>
                    <div className={styles.bankCharacters}>
                        {config.characters.map(char => {
                            const location = getCharacterLocation(char.id);
                            if (location !== 'right') return null;

                            return (
                                <button
                                    key={char.id}
                                    className={`${styles.character} ${canClick(char.id) ? styles.clickable : ''}`}
                                    onClick={() => handleCharacterClick(char.id)}
                                    disabled={!canClick(char.id)}
                                >
                                    <span className={styles.characterEmoji}>{char.emoji}</span>
                                    <span className={styles.characterName}>{char.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* 선교사 모드 규칙 안내 */}
            {mode === 'missionary' && !gameState.isComplete && !gameState.isGameOver && (
                <div className={styles.ruleReminder}>
                    ⚠️ 어느 쪽이든 식인종 수 &gt; 선교사 수 이면 위험!
                </div>
            )}

            {/* 메시지 */}
            {gameState.isComplete && (
                <div className={styles.successMessage}>
                    🎉 축하합니다! {gameState.moveCount}번 만에 모두 건넜어요!
                    {gameState.moveCount === config.optimalMoves && ' (최적 해!)'}
                </div>
            )}

            {gameState.isGameOver && (
                <div className={styles.errorMessage}>
                    {gameState.gameOverReason}
                </div>
            )}

            {hint && !gameState.isComplete && !gameState.isGameOver && (
                <div className={styles.hintMessage}>
                    {hint}
                </div>
            )}

            {/* 액션 버튼 */}
            <div className={styles.actions}>
                <button
                    className={styles.hintButton}
                    onClick={handleHint}
                    disabled={gameState.isComplete || gameState.isGameOver}
                >
                    💡 힌트
                </button>
                <button
                    className={styles.undoButton}
                    onClick={handleUndo}
                    disabled={gameState.history.length === 0 || isMoving || gameState.isComplete}
                >
                    ↩️ 되돌리기
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
                {showExplanation ? '📖 해설 숨기기' : '📚 해법 보기'}
            </button>

            {showExplanation && (
                <div className={styles.explanation}>
                    <div
                        dangerouslySetInnerHTML={{
                            __html: (mode === 'classic' ? CLASSIC_EXPLANATION : MISSIONARY_EXPLANATION)
                                .replace(/\n/g, '<br />')
                                .replace(/##\s*(.*?)<br \/>/g, '<h3>$1</h3>')
                                .replace(/###\s*(.*?)<br \/>/g, '<h4>$1</h4>')
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        }}
                    />
                </div>
            )}

            {/* 도움말 */}
            <div className={styles.help}>
                <h3>🎮 게임 방법</h3>
                {mode === 'classic' ? (
                    <ol>
                        <li>강변의 <strong>캐릭터를 클릭</strong>하면 배에 태워집니다</li>
                        <li><strong>배를 클릭</strong>하면 반대편으로 이동합니다</li>
                        <li>배에는 농부 + 1명만 탈 수 있어요</li>
                        <li>농부 없이 늑대+양 또는 양+양배추를 두면 안 돼요!</li>
                    </ol>
                ) : (
                    <ol>
                        <li>강변의 <strong>캐릭터를 클릭</strong>하면 배에 태워집니다</li>
                        <li>배에는 <strong>최대 2명</strong>까지 탈 수 있어요</li>
                        <li><strong>배를 클릭</strong>하면 반대편으로 이동합니다</li>
                        <li>어느 쪽이든 <strong>식인종 &gt; 선교사</strong>이면 안 돼요!</li>
                    </ol>
                )}
            </div>
        </div>
    );
}
