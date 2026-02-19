'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import styles from './selectionSortStage.module.css';
import type { SelectionBlock, SelectionStepResult } from '@/lib/coding/selectionSort';

export type SelectionSortStageProps = {
    step: SelectionStepResult | null;
    blocks: SelectionBlock[];
};

/**
 * SelectionSortStage – 선택정렬 시각화 스테이지
 *
 * 핵심 메커니즘 3줄 요약:
 * 1. 블럭 배열을 flex로 렌더링하고, ref를 통해 각 블럭의 DOM 위치를 추적한다.
 * 2. step 상태에 따라 current/scan/min/swap/complete CSS 클래스를 동적 적용한다.
 * 3. 저울 커서는 scanIndex 블럭의 중심 좌표를 기반으로 absolute 위치를 계산한다.
 */
const SelectionSortStage = ({ step, blocks }: SelectionSortStageProps) => {
    const rowRef = useRef<HTMLDivElement>(null);
    const blockRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [cursorLeft, setCursorLeft] = useState<number | null>(null);
    const [showNewMin, setShowNewMin] = useState(false);
    const [showSwap, setShowSwap] = useState(false);

    const displayBlocks = step ? step.array : blocks;
    const isCompleted = step?.completed ?? false;

    // 저울 커서 위치 계산
    const updateCursorPosition = useCallback(() => {
        if (!step || step.scanIndex < 0 || !rowRef.current) {
            setCursorLeft(null);
            return;
        }
        const blockElement = blockRefs.current[step.scanIndex];
        if (blockElement && rowRef.current) {
            const rowRect = rowRef.current.getBoundingClientRect();
            const blockRect = blockElement.getBoundingClientRect();
            const left = blockRect.left - rowRect.left + blockRect.width / 2;
            setCursorLeft(left);
        }
    }, [step]);

    useEffect(() => {
        updateCursorPosition();
    }, [updateCursorPosition]);

    // NEW MIN 애니메이션
    useEffect(() => {
        if (step?.didUpdateMin && !step.isSwapStep) {
            setShowNewMin(true);
            const timer = setTimeout(() => setShowNewMin(false), 700);
            return () => clearTimeout(timer);
        }
        setShowNewMin(false);
    }, [step?.didUpdateMin, step?.isSwapStep, step?.scanIndex, step?.pass]);

    // SWAP 애니메이션
    useEffect(() => {
        if (step?.isSwapStep && step?.didSwap) {
            setShowSwap(true);
            const timer = setTimeout(() => setShowSwap(false), 800);
            return () => clearTimeout(timer);
        }
        setShowSwap(false);
    }, [step?.isSwapStep, step?.didSwap, step?.pass]);

    const getBlockClasses = (index: number): string => {
        const classes = [styles.block];

        if (isCompleted) {
            classes.push(styles.blockComplete);
            return classes.join(' ');
        }

        if (!step) return classes.join(' ');

        // 이미 정렬된 영역 (currentIndex 이전)
        if (index < step.currentIndex) {
            classes.push(styles.blockSorted);
        }

        // swap 단계에서 교환 대상 하이라이트
        if (step.isSwapStep && step.didSwap) {
            if (index === step.currentIndex || index === step.minIndex) {
                classes.push(styles.blockSwapping);
            }
        }

        // 현재 위치 i → 두꺼운 테두리
        if (index === step.currentIndex && !step.isSwapStep) {
            classes.push(styles.blockCurrent);
        }

        // 스캔 위치 j → 하이라이트
        if (index === step.scanIndex && !step.isSwapStep) {
            classes.push(styles.blockScanning);
        }

        // 현재 최소값 → glow
        if (index === step.minIndex && !step.isSwapStep && step.scanIndex >= 0) {
            classes.push(styles.blockMin);
        }

        return classes.filter(Boolean).join(' ');
    };

    return (
        <div className={styles.stage}>
            {/* 저울 커서 */}
            {cursorLeft !== null && step && !step.isSwapStep && !isCompleted && (
                <div
                    className={styles.scaleCursor}
                    style={{ left: `${cursorLeft}px`, transform: 'translateX(-50%)' }}
                >
                    <span className={styles.scaleIcon}>⚖️</span>
                    <span className={styles.scaleLabel}>비교 중</span>
                    <div className={styles.scaleLine} />
                </div>
            )}

            {/* NEW MIN 오버레이 */}
            {showNewMin && (
                <div className={styles.newMinOverlay}>✨ NEW MIN!</div>
            )}

            {/* SWAP 오버레이 */}
            {showSwap && (
                <div className={styles.swapOverlay}>🔄 SWAP!</div>
            )}

            {/* 완료 오버레이 */}
            {isCompleted && (
                <div className={styles.completeOverlay}>정렬 완료 🎉</div>
            )}

            {/* 블럭 행 */}
            <div className={styles.blocksRow} ref={rowRef}>
                {displayBlocks.map((block, index) => (
                    <div
                        key={block.id}
                        ref={(element) => { blockRefs.current[index] = element; }}
                        className={getBlockClasses(index)}
                        style={{ backgroundColor: block.color }}
                    >
                        <span className={styles.blockValue}>{block.value}</span>
                        <span className={styles.blockIndex}>[{index}]</span>

                        {/* 최소값 배지 */}
                        {step &&
                            !isCompleted &&
                            !step.isSwapStep &&
                            step.scanIndex >= 0 &&
                            index === step.minIndex && (
                                <span className={styles.minBadge}>MIN</span>
                            )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SelectionSortStage;
