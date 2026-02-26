/**
 * MagicSquarePage - 마방진 퍼즐 메인 페이지
 *
 * 기능:
 * - 크기 선택 (3×3 / 4×4 / 5×5)
 * - 모드 선택 (자유 제작 / 가이드 퍼즐)
 * - 난이도 선택 (가이드 모드)
 * - 잠금 토글, 힌트, 자동완성
 * - DnD 컨텍스트 관리
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragStartEvent,
    PointerSensor,
    TouchSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';
import MagicBoard from './MagicBoard';
import Palette from './Palette';
import { useMagicSquareGame } from '@/lib/puzzles/magicSquare/useMagicSquareGame';
import { BoardSize, DifficultyLevel, GameMode } from '@/lib/puzzles/magicSquare/types';
import styles from './page.module.css';

const SIZE_OPTIONS: BoardSize[] = [3, 4, 5];
const DIFFICULTY_LABELS = ['쉬움', '보통', '어려움'];

export default function MagicSquarePage() {
    const {
        state,
        validation,
        changeSize,
        changeMode,
        changeDifficulty,
        toggleLockGivens,
        placeFromPalette,
        returnToPalette,
        moveOnBoard,
        resetGame,
        newPuzzle,
        autoSolve,
        getHint,
        selectedTile,
        selectTile,
        clearSelection,
        handleCellClick,
        isReady,
    } = useMagicSquareGame();

    const [activeHint, setActiveHint] = useState<{
        type: 'row' | 'col' | 'diag';
        index: number;
    } | null>(null);

    const [draggingValue, setDraggingValue] = useState<number | null>(null);

    // DnD 센서 설정
    const pointerSensor = useSensor(PointerSensor, {
        activationConstraint: { distance: 5 },
    });
    const touchSensor = useSensor(TouchSensor, {
        activationConstraint: { delay: 150, tolerance: 5 },
    });
    const keyboardSensor = useSensor(KeyboardSensor);

    const sensors = useSensors(pointerSensor, touchSensor, keyboardSensor);

    /** 힌트 표시 토글 */
    const handleHint = useCallback(() => {
        const hint = getHint();
        if (hint) {
            setActiveHint(prev =>
                prev?.type === hint.type && prev?.index === hint.index ? null : hint
            );
        } else {
            setActiveHint(null);
        }
    }, [getHint]);

    /** 드래그 시작 */
    const handleDragStart = useCallback((event: DragStartEvent) => {
        const { value } = event.active.data.current as { value: number };
        setDraggingValue(value);
        clearSelection();
    }, [clearSelection]);

    /** 드래그 종료 */
    const handleDragEnd = useCallback(
        (event: DragEndEvent) => {
            setDraggingValue(null);
            const { active, over } = event;
            if (!over) return;

            const activeData = active.data.current as {
                value: number;
                source: 'palette' | 'board';
                row?: number;
                col?: number;
            };
            const overData = over.data.current as {
                type: 'cell' | 'palette';
                row?: number;
                col?: number;
            };

            if (!overData) return;

            // 팔레트 → 보드 셀
            if (activeData.source === 'palette' && overData.type === 'cell') {
                placeFromPalette(activeData.value, overData.row!, overData.col!);
            }
            // 보드 셀 → 팔레트
            else if (activeData.source === 'board' && overData.type === 'palette') {
                returnToPalette(activeData.row!, activeData.col!);
            }
            // 보드 셀 → 보드 셀
            else if (activeData.source === 'board' && overData.type === 'cell') {
                moveOnBoard(activeData.row!, activeData.col!, overData.row!, overData.col!);
            }
        },
        [placeFromPalette, returnToPalette, moveOnBoard]
    );

    /** 팔레트 타일 클릭 핸들러 */
    const handlePaletteTileClick = useCallback(
        (value: number) => {
            selectTile(value, 'palette');
        },
        [selectTile]
    );

    if (!isReady) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>로딩 중...</div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* 헤더 */}
            <header className={styles.header}>
                <h1 className={styles.title}>
                    <span className={styles.titleEmoji}>✨</span>
                    마방진 퍼즐
                </h1>
                <p className={styles.subtitle}>
                    숫자를 배치하여 모든 행, 열, 대각선의 합을 같게 만드세요!
                </p>
            </header>

            {/* 설정 패널 */}
            <div className={styles.settingsPanel}>
                {/* 크기 선택 */}
                <div className={styles.settingGroup}>
                    <label className={styles.settingLabel}>보드 크기</label>
                    <div className={styles.buttonGroup}>
                        {SIZE_OPTIONS.map(size => (
                            <button
                                key={size}
                                className={`${styles.optionBtn} ${state.size === size ? styles.optionActive : ''}`}
                                onClick={() => changeSize(size)}
                            >
                                {size}×{size}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 모드 선택 */}
                <div className={styles.settingGroup}>
                    <label className={styles.settingLabel}>모드</label>
                    <div className={styles.buttonGroup}>
                        <button
                            className={`${styles.optionBtn} ${state.mode === 'free' ? styles.optionActive : ''}`}
                            onClick={() => changeMode('free')}
                        >
                            🎨 자유 제작
                        </button>
                        <button
                            className={`${styles.optionBtn} ${state.mode === 'guided' ? styles.optionActive : ''}`}
                            onClick={() => changeMode('guided')}
                        >
                            🧩 가이드 퍼즐
                        </button>
                    </div>
                </div>

                {/* 난이도 선택 (가이드 모드만) */}
                {state.mode === 'guided' && (
                    <div className={styles.settingGroup}>
                        <label className={styles.settingLabel}>난이도</label>
                        <div className={styles.buttonGroup}>
                            {DIFFICULTY_LABELS.map((label, idx) => (
                                <button
                                    key={idx}
                                    className={`${styles.optionBtn} ${state.difficulty === idx ? styles.optionActive : ''}`}
                                    onClick={() => changeDifficulty(idx as DifficultyLevel)}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 잠금 토글 (가이드 모드만) */}
                {state.mode === 'guided' && (
                    <div className={styles.settingGroup}>
                        <label className={styles.toggleLabel}>
                            <input
                                type="checkbox"
                                checked={state.lockGivens}
                                onChange={toggleLockGivens}
                                className={styles.toggleInput}
                            />
                            <span className={styles.toggleSwitch} />
                            주어진 숫자 잠금
                        </label>
                    </div>
                )}
            </div>

            {/* 성공 메시지 */}
            {state.solved && (
                <div className={styles.successBanner}>
                    <div className={styles.successContent}>
                        <span className={styles.successEmoji}>🎉</span>
                        <div>
                            <h2 className={styles.successTitle}>완성!</h2>
                            <p className={styles.successMessage}>
                                {state.size}×{state.size} 마방진을 완성했습니다!
                            </p>
                        </div>
                    </div>
                    <div className={styles.successActions}>
                        <button className={styles.actionBtn} onClick={resetGame}>
                            🔄 리셋
                        </button>
                        {state.mode === 'guided' && (
                            <button className={styles.actionBtnPrimary} onClick={newPuzzle}>
                                🧩 새 퍼즐
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* 게임 영역 */}
            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className={styles.gameArea}>
                    <Palette
                        numbers={state.palette}
                        selectedValue={
                            selectedTile?.source === 'palette' ? selectedTile.value : null
                        }
                        onTileClick={handlePaletteTileClick}
                        boardSize={state.size}
                    />

                    <MagicBoard
                        board={state.board}
                        locked={state.locked}
                        lockGivens={state.lockGivens}
                        validation={validation}
                        onCellClick={handleCellClick}
                        selectedTile={selectedTile}
                        hint={activeHint}
                        size={state.size}
                    />
                </div>

                {/* 드래그 오버레이 */}
                <DragOverlay>
                    {draggingValue !== null ? (
                        <div className={`${styles.numberTile} ${styles.draggingOverlay}`}>
                            {draggingValue}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* 하단 액션 바 */}
            <div className={styles.actionBar}>
                <button className={styles.actionBtn} onClick={resetGame}>
                    🔄 리셋
                </button>
                {state.mode === 'guided' && (
                    <button className={styles.actionBtn} onClick={newPuzzle}>
                        🧩 새 퍼즐
                    </button>
                )}
                <button className={styles.actionBtn} onClick={handleHint}>
                    💡 힌트
                </button>
                <button className={styles.actionBtnSecondary} onClick={autoSolve}>
                    🤖 자동완성
                </button>
            </div>

            {/* 도움말 */}
            <div className={styles.helpSection}>
                <details className={styles.helpDetails}>
                    <summary className={styles.helpSummary}>❓ 마방진이란?</summary>
                    <div className={styles.helpContent}>
                        <p>
                            <strong>마방진(Magic Square)</strong>은 N×N 격자에 1부터 N²까지의 숫자를 배치하여,
                            모든 행·열·대각선의 합이 동일하게 만드는 수학 퍼즐입니다.
                        </p>
                        <p>
                            목표 합(Magic Constant)은 <code>M = N × (N² + 1) ÷ 2</code>로 계산됩니다.
                        </p>
                        <ul>
                            <li>3×3: M = <strong>15</strong></li>
                            <li>4×4: M = <strong>34</strong></li>
                            <li>5×5: M = <strong>65</strong></li>
                        </ul>
                        <h4>조작 방법</h4>
                        <ul>
                            <li>🖱️ <strong>드래그 앤 드롭</strong>: 팔레트에서 보드로, 보드 내 이동</li>
                            <li>👆 <strong>클릭-클릭</strong>: 숫자 클릭 → 빈 셀 클릭으로 배치</li>
                            <li>🔄 <strong>스왑</strong>: 숫자가 있는 셀에 드롭하면 위치 교환</li>
                        </ul>
                    </div>
                </details>
            </div>
        </div>
    );
}
