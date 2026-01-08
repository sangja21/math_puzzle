'use client';

import React, { useState, useCallback, DragEvent } from 'react';
import { GameState, WeightPosition, getLeftWeight, getRightWeight, calculateTilt } from '@/lib/puzzles/balance';
import styles from './Balance.module.css';

interface BalanceProps {
    gameState: GameState;
    onMoveWeight: (weightValue: number, newPosition: WeightPosition) => void;
}

export default function Balance({ gameState, onMoveWeight }: BalanceProps) {
    const [draggingWeight, setDraggingWeight] = useState<number | null>(null);
    const [dropTarget, setDropTarget] = useState<WeightPosition | null>(null);

    const tilt = calculateTilt(gameState);
    const leftTotal = getLeftWeight(gameState);
    const rightTotal = getRightWeight(gameState);
    const isBalanced = gameState.isComplete;

    // 드래그 시작
    const handleDragStart = useCallback((e: DragEvent<HTMLDivElement>, weightValue: number) => {
        setDraggingWeight(weightValue);
        e.dataTransfer.setData('text/plain', weightValue.toString());
        e.dataTransfer.effectAllowed = 'move';
    }, []);

    // 드래그 종료
    const handleDragEnd = useCallback(() => {
        setDraggingWeight(null);
        setDropTarget(null);
    }, []);

    // 드래그 오버 (drop 허용)
    const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    // 드롭 영역 진입
    const handleDragEnter = useCallback((position: WeightPosition) => {
        setDropTarget(position);
    }, []);

    // 드롭 영역 이탈
    const handleDragLeave = useCallback(() => {
        setDropTarget(null);
    }, []);

    // 드롭
    const handleDrop = useCallback((e: DragEvent<HTMLDivElement>, position: WeightPosition) => {
        e.preventDefault();
        const weightValue = parseInt(e.dataTransfer.getData('text/plain'), 10);
        if (!isNaN(weightValue)) {
            onMoveWeight(weightValue, position);
        }
        setDraggingWeight(null);
        setDropTarget(null);
    }, [onMoveWeight]);

    // 위치별 추 필터링
    const weightsOnLeft = gameState.weights.filter(w => w.position === 'left');
    const weightsOnRight = gameState.weights.filter(w => w.position === 'right');
    const weightsAvailable = gameState.weights.filter(w => w.position === 'none');

    return (
        <div className={styles.balanceWrapper}>
            {/* 저울 본체 */}
            <div className={styles.balance}>
                {/* 저울대 (기울어지는) */}
                <div
                    className={styles.beam}
                    style={{ transform: `rotate(${tilt}deg)` }}
                />

                {/* 중심축 */}
                <div className={styles.pivot} />

                {/* 받침대 */}
                <div className={styles.stand} />
                <div className={styles.standBase} />

                {/* 왼쪽 접시 (물건 + 추) */}
                <div
                    className={`${styles.plate} ${styles.plateLeft}`}
                    style={{ transform: `translateY(${-tilt * 2}px)` }}
                >
                    <div className={styles.rope} />
                    <div
                        className={`${styles.dish} ${dropTarget === 'left' ? styles.dropActive : ''}`}
                        onDragOver={handleDragOver}
                        onDragEnter={() => handleDragEnter('left')}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, 'left')}
                    >
                        {/* 목표 물건 */}
                        <div className={styles.targetItem}>
                            <span className={styles.targetEmoji}>📦</span>
                            <span className={styles.targetWeight}>{gameState.targetWeight}kg</span>
                        </div>

                        {/* 왼쪽 추들 */}
                        {weightsOnLeft.map(w => (
                            <div
                                key={w.value}
                                className={`${styles.weightOnDish} ${draggingWeight === w.value ? styles.dragging : ''}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, w.value)}
                                onDragEnd={handleDragEnd}
                            >
                                {w.value}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 오른쪽 접시 (추만) */}
                <div
                    className={`${styles.plate} ${styles.plateRight}`}
                    style={{ transform: `translateY(${tilt * 2}px)` }}
                >
                    <div className={styles.rope} />
                    <div
                        className={`${styles.dish} ${dropTarget === 'right' ? styles.dropActive : ''}`}
                        onDragOver={handleDragOver}
                        onDragEnter={() => handleDragEnter('right')}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, 'right')}
                    >
                        {/* 오른쪽 추들 */}
                        {weightsOnRight.map(w => (
                            <div
                                key={w.value}
                                className={`${styles.weightOnDish} ${draggingWeight === w.value ? styles.dragging : ''}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, w.value)}
                                onDragEnd={handleDragEnd}
                            >
                                {w.value}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 무게 표시 */}
            <div className={styles.weightDisplay}>
                <span>⬅️ 왼쪽: {leftTotal}kg</span>
                <span>오른쪽: {rightTotal}kg ➡️</span>
            </div>

            {/* 균형 상태 */}
            <div className={`${styles.balanceStatus} ${isBalanced ? styles.balanced : styles.unbalanced}`}>
                {isBalanced
                    ? '🎉 균형이 맞았어요!'
                    : leftTotal > rightTotal
                        ? '⬅️ 왼쪽이 더 무거워요'
                        : rightTotal > leftTotal
                            ? '오른쪽이 더 무거워요 ➡️'
                            : '추를 올려보세요'
                }
            </div>

            {/* 추 보관 영역 */}
            <div
                className={`${styles.weightsArea} ${dropTarget === 'none' ? styles.dropActive : ''}`}
                onDragOver={handleDragOver}
                onDragEnter={() => handleDragEnter('none')}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, 'none')}
            >
                <span className={styles.weightsAreaLabel}>
                    🎯 추를 드래그하여 저울에 올려놓으세요
                </span>
                <div className={styles.weightsContainer}>
                    {weightsAvailable.map(w => (
                        <div
                            key={w.value}
                            className={`${styles.weight} ${draggingWeight === w.value ? styles.dragging : ''}`}
                            draggable
                            onDragStart={(e) => handleDragStart(e, w.value)}
                            onDragEnd={handleDragEnd}
                        >
                            <span className={styles.weightValue}>{w.value}</span>
                            <span className={styles.weightUnit}>kg</span>
                        </div>
                    ))}
                    {weightsAvailable.length === 0 && (
                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                            모든 추가 저울 위에 있어요
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
