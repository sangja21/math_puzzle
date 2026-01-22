'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
    CaesarGameState,
    StageConfig,
    ALPHABET,
    STAGES,
    createInitialGameState,
    checkAnswer,
    updateUserInput,
    toggleHint,
    nextProblem,
    nextLevel,
    getStageConfig,
    getStarsString,
    getAlphabetMapping,
    getFrequencyAnalysis,
    HISTORY_STORIES,
} from '@/lib/puzzles/caesar';
import styles from './page.module.css';

export default function CaesarPuzzlePage() {
    // 게임 시작 전 상태
    const [gameStarted, setGameStarted] = useState(false);
    const [selectedLevel, setSelectedLevel] = useState(1);
    const [gameState, setGameState] = useState<CaesarGameState | null>(null);
    const [showLevelComplete, setShowLevelComplete] = useState(false);
    const [problemsCompleted, setProblemsCompleted] = useState(0);

    const PROBLEMS_PER_LEVEL = 3; // 레벨당 문제 수

    // 게임 시작
    const handleStart = useCallback(() => {
        setGameState(createInitialGameState(selectedLevel));
        setGameStarted(true);
        setShowLevelComplete(false);
        setProblemsCompleted(0);
    }, [selectedLevel]);

    // 게임 리셋
    const handleReset = useCallback(() => {
        setGameStarted(false);
        setGameState(null);
        setShowLevelComplete(false);
        setProblemsCompleted(0);
    }, []);

    // 정답 확인
    const handleCheck = useCallback(() => {
        if (!gameState) return;
        const newState = checkAnswer(gameState);
        setGameState(newState);

        // 정답인 경우
        if (newState.isCorrect) {
            const newCompleted = problemsCompleted + 1;
            setProblemsCompleted(newCompleted);

            // 레벨 완료 체크
            if (newCompleted >= PROBLEMS_PER_LEVEL) {
                setTimeout(() => {
                    setShowLevelComplete(true);
                }, 1000);
            }
        }
    }, [gameState, problemsCompleted]);

    // 다음 문제
    const handleNextProblem = useCallback(() => {
        if (!gameState) return;
        setGameState(nextProblem(gameState));
    }, [gameState]);

    // 다음 레벨
    const handleNextLevel = useCallback(() => {
        if (!gameState) return;
        setGameState(nextLevel(gameState));
        setShowLevelComplete(false);
        setProblemsCompleted(0);
    }, [gameState]);

    // 입력 변경
    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!gameState) return;
            setGameState(updateUserInput(gameState, e.target.value));
        },
        [gameState]
    );

    // Shift 조절 (참고용, 입력은 직접 해야 함)
    const handleShiftChange = useCallback(
        (delta: number) => {
            if (!gameState) return;
            const newShift = (gameState.userShiftGuess + delta + 26) % 26;
            // 입력은 건드리지 않고 shift 값만 변경
            setGameState({
                ...gameState,
                userShiftGuess: newShift,
            });
        },
        [gameState]
    );

    // 힌트 토글
    const handleHintToggle = useCallback(() => {
        if (!gameState) return;
        setGameState(toggleHint(gameState));
    }, [gameState]);

    // 현재 스테이지 설정
    const stageConfig: StageConfig | null = useMemo(() => {
        if (!gameState) return null;
        return getStageConfig(gameState.currentLevel);
    }, [gameState]);

    // 알파벳 매핑
    const alphabetMapping = useMemo(() => {
        if (!gameState || !stageConfig) return {};
        const shiftToShow = stageConfig.showShift ? gameState.shift : gameState.userShiftGuess;
        return getAlphabetMapping(shiftToShow);
    }, [gameState, stageConfig]);

    // 빈도수 분석
    const frequencyData = useMemo(() => {
        if (!gameState) return [];
        return getFrequencyAnalysis(gameState.cipherText).slice(0, 8);
    }, [gameState]);

    // 미리보기 기능 제거 - 직접 풀어야 진정한 퍼즐!

    // 게임 시작 전 화면
    if (!gameStarted || !gameState) {
        return (
            <div className={styles.container}>
                <Link href="/" className={styles.homeButton}>
                    🏠 목록으로
                </Link>

                <header className={styles.header}>
                    <h1 className={styles.title}>🔐 카이사르 암호</h1>
                    <p className={styles.subtitle}>
                        로마 장군 카이사르의 비밀 편지를 해독하라!
                    </p>
                </header>

                <div className={styles.introScreen}>
                    <div className={styles.introStory}>
                        <h3>🏛️ 카이사르 암호의 탄생</h3>
                        <p>{HISTORY_STORIES.intro}</p>
                    </div>

                    <div className={styles.introStory}>
                        <h3>🔐 이렇게 작동해요!</h3>
                        <p>{HISTORY_STORIES.howItWorks}</p>
                    </div>

                    <h3 style={{ color: '#ffd700', marginBottom: '16px' }}>
                        🎯 레벨 선택
                    </h3>
                    <div className={styles.levelSelector}>
                        {STAGES.map((stage) => (
                            <button
                                key={stage.level}
                                className={`${styles.levelButton} ${selectedLevel === stage.level ? styles.active : ''}`}
                                onClick={() => setSelectedLevel(stage.level)}
                            >
                                <span>레벨 {stage.level}</span>
                                <span className={styles.levelStars}>
                                    {getStarsString(stage.stars)}
                                </span>
                            </button>
                        ))}
                    </div>

                    <button className={styles.startButton} onClick={handleStart}>
                        🚀 암호 해독 시작!
                    </button>
                </div>
            </div>
        );
    }

    // 레벨 완료 화면
    if (showLevelComplete) {
        const isLastLevel = gameState.currentLevel >= 5;

        return (
            <div className={styles.container}>
                <Link href="/" className={styles.homeButton}>
                    🏠 목록으로
                </Link>

                <header className={styles.header}>
                    <h1 className={styles.title}>🔐 카이사르 암호</h1>
                </header>

                <div className={styles.levelComplete}>
                    <div className={styles.celebrationEmoji}>
                        {isLastLevel ? '🎖️' : '🎉'}
                    </div>
                    <h2>
                        {isLastLevel ? '🏆 마스터 달성!' : `레벨 ${gameState.currentLevel} 완료!`}
                    </h2>
                    <p>{stageConfig?.storyText}</p>
                    <p>
                        {getStarsString(gameState.currentLevel)} 획득!
                    </p>

                    <div className={styles.controls}>
                        {!isLastLevel && (
                            <button className={styles.nextButton} onClick={handleNextLevel}>
                                ➡️ 레벨 {gameState.currentLevel + 1}로 가기
                            </button>
                        )}
                        <button className={styles.resetButton} onClick={handleReset}>
                            🔄 처음부터
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 게임 화면
    return (
        <div className={styles.container}>
            <Link href="/" className={styles.homeButton}>
                🏠 목록으로
            </Link>

            <span className={styles.levelBadge}>
                레벨 {gameState.currentLevel} {getStarsString(stageConfig?.stars || 1)}
            </span>

            <header className={styles.header}>
                <h1 className={styles.title}>🔐 카이사르 암호</h1>
                <p className={styles.subtitle}>비밀 메시지를 해독하세요!</p>
            </header>

            {/* 진행 상황 */}
            <div className={styles.progressSection}>
                <div className={styles.progressLabel}>
                    <span>진행: {problemsCompleted} / {PROBLEMS_PER_LEVEL}</span>
                    <span>시도: {gameState.attempts}회</span>
                </div>
                <div className={styles.progressBar}>
                    <div
                        className={styles.progressFill}
                        style={{ width: `${(problemsCompleted / PROBLEMS_PER_LEVEL) * 100}%` }}
                    />
                </div>
            </div>

            {/* 스토리 카드 */}
            <div className={styles.storyCard}>
                <span className={styles.storyEmoji}>{stageConfig?.storyEmoji}</span>
                <p className={styles.storyText}>{stageConfig?.storyText}</p>
            </div>

            {/* 암호문 */}
            <div className={styles.cipherSection}>
                <div className={styles.sectionLabel}>📜 카이사르의 비밀 편지</div>
                <div className={styles.cipherBox}>{gameState.cipherText}</div>
            </div>

            {/* 알파벳 휠 (showWheelHint가 true일 때) */}
            {stageConfig?.showWheelHint && (
                <div className={styles.wheelSection}>
                    <div className={styles.sectionLabel}>
                        🔄 알파벳 대응표 (◀▶로 돌려서 맞는 이동값을 찾아보세요!)
                    </div>
                    <div className={styles.wheelContainer}>
                        {/* 휠 조작 버튼 - 모든 레벨에서 표시 */}
                        <div className={styles.wheelControls}>
                            <button
                                className={`${styles.wheelButton} ${styles.wheelButtonLeft}`}
                                onClick={() => handleShiftChange(-1)}
                            >
                                ◀
                            </button>
                            <div className={styles.shiftDisplay}>
                                이동: <span className={styles.shiftNumber}>+{gameState.userShiftGuess}</span>
                            </div>
                            <button
                                className={`${styles.wheelButton} ${styles.wheelButtonRight}`}
                                onClick={() => handleShiftChange(1)}
                            >
                                ▶
                            </button>
                        </div>

                        {/* 정답 힌트 (레벨 1-2에서만 표시) */}
                        {stageConfig.showShift && (
                            <div style={{
                                marginTop: '8px',
                                padding: '8px 16px',
                                background: 'rgba(74, 222, 128, 0.2)',
                                borderRadius: '8px',
                                color: '#4ade80',
                                fontSize: '0.9rem'
                            }}>
                                💡 힌트: 정답은 <strong>+{gameState.shift}</strong>칸이에요!
                                (휠을 돌려서 +{gameState.shift}에 맞춰보세요)
                            </div>
                        )}

                        {/* 대응표 - 사용자가 선택한 이동값에 따라 변경 */}
                        <div className={styles.alphabetMapping}>
                            {ALPHABET.split('').map((char) => (
                                <div key={char} className={styles.letterPair}>
                                    <span className={styles.originalLetter}>{char}</span>
                                    <span className={styles.arrowDown}>↓</span>
                                    <span className={styles.encryptedLetter}>
                                        {ALPHABET[(ALPHABET.indexOf(char) + gameState.userShiftGuess) % 26]}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* 맞는지 피드백 - 레벨 5는 알려주지 않음 (진정한 마스터 모드!) */}
                        {stageConfig.showShift || stageConfig.showFrequencyHint ? (
                            // 레벨 1-4: 피드백 표시
                            gameState.userShiftGuess === gameState.shift ? (
                                <div style={{ marginTop: '12px', color: '#4ade80', fontWeight: '600' }}>
                                    ✅ 맞는 이동값을 찾았어요! 이제 암호문을 해독해보세요!
                                </div>
                            ) : (
                                <div style={{ marginTop: '12px', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                                    🔍 암호문과 대응표를 비교해서 맞는 이동값을 찾아보세요!
                                </div>
                            )
                        ) : (
                            // 레벨 5: 피드백 없음 - 스스로 판단해야 함!
                            <div style={{ marginTop: '12px', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                                🎖️ 마스터 모드! 스스로 맞는 이동값인지 판단하세요!
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 빈도수 분석 (showFrequencyHint가 true일 때) */}
            {stageConfig?.showFrequencyHint && (
                <div className={styles.frequencySection}>
                    <div className={styles.sectionLabel}>
                        📊 글자 빈도수 (힌트: 영어에서 가장 많이 쓰이는 글자는 E, T, A 순이에요!)
                    </div>
                    <div className={styles.frequencyGrid}>
                        {frequencyData.map((item) => (
                            <div key={item.char} className={styles.frequencyItem}>
                                <span className={styles.frequencyChar}>{item.char}</span>
                                <div className={styles.frequencyBar}>
                                    <div
                                        className={styles.frequencyFill}
                                        style={{ width: `${item.percentage}%` }}
                                    />
                                </div>
                                <span className={styles.frequencyPercent}>{item.percentage}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 입력 */}
            <div className={styles.inputSection}>
                <div className={styles.sectionLabel}>✏️ 해독한 메시지를 입력하세요</div>
                <input
                    type="text"
                    className={`${styles.inputBox} ${gameState.isCorrect === true
                        ? styles.correct
                        : gameState.isCorrect === false
                            ? styles.incorrect
                            : ''
                        }`}
                    value={gameState.userInput}
                    onChange={handleInputChange}
                    placeholder="여기에 입력..."
                    disabled={gameState.isCorrect === true}
                />
            </div>

            {/* 힌트 */}
            {gameState.showHint && (
                <div className={styles.hintBox}>
                    💡 힌트: {gameState.problem.hint}
                </div>
            )}

            {/* 결과 메시지 */}
            {gameState.isCorrect === true && (
                <div className={`${styles.resultMessage} ${styles.success}`}>
                    🎉 정답이에요! 대단해요!
                </div>
            )}
            {gameState.isCorrect === false && (
                <div className={`${styles.resultMessage} ${styles.error}`}>
                    ❌ 다시 한번 생각해보세요!
                </div>
            )}

            {/* 컨트롤 버튼 */}
            <div className={styles.controls}>
                {!gameState.showHint && gameState.isCorrect !== true && (
                    <button className={styles.hintButton} onClick={handleHintToggle}>
                        💡 힌트 보기
                    </button>
                )}
                {gameState.isCorrect !== true ? (
                    <button
                        className={styles.checkButton}
                        onClick={handleCheck}
                        disabled={!gameState.userInput.trim()}
                    >
                        ✅ 정답 확인
                    </button>
                ) : (
                    <button className={styles.nextButton} onClick={handleNextProblem}>
                        ➡️ 다음 문제
                    </button>
                )}
                <button className={styles.resetButton} onClick={handleReset}>
                    🔄 처음부터
                </button>
            </div>

            {/* 도움말 */}
            <div className={styles.helpBox}>
                <h3>🎮 게임 방법</h3>
                <ul>
                    <li><strong>암호문</strong>의 각 글자를 대응표에서 찾아 원래 글자를 알아내세요</li>
                    {stageConfig?.showShift ? (
                        <li>알파벳이 <strong>+{gameState.shift}칸</strong> 밀려있어요! (예: A→{ALPHABET[(ALPHABET.indexOf('A') + gameState.shift) % 26]})</li>
                    ) : (
                        <li>◀▶ 버튼으로 <strong>이동 값</strong>을 조절해서 맞는 대응을 찾아보세요</li>
                    )}
                    <li>모르겠으면 <strong>힌트</strong>를 눌러보세요</li>
                    <li>{PROBLEMS_PER_LEVEL}문제를 맞추면 다음 레벨로!</li>
                </ul>
            </div>
        </div>
    );
}
