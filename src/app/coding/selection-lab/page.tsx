'use client';

import Link from 'next/link';
import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import SelectionSortStage from '@/components/SelectionSortStage';
import {
    SelectionBlock,
    createSelectionSortTrace,
    shuffleBlocks,
    generateRandomBlocks,
} from '@/lib/coding/selectionSort';
import styles from './page.module.css';

/**
 * 선택정렬 체험 모드 페이지
 *
 * 핵심 메커니즘 3줄 요약:
 * 1. 사용자가 블럭 개수/중복 여부를 설정하면 랜덤 블럭을 생성하고 trace를 재계산한다.
 * 2. Play 모드에서는 setInterval로 stepIndex를 자동 증가시키고, 속도도 슬라이더로 조절 가능하다.
 * 3. 진행 로그 패널이 매 step의 비교/교환 이벤트를 실시간으로 기록한다.
 */
export default function SelectionLabPage() {
    const [blockCount, setBlockCount] = useState(7);
    const [allowDuplicates, setAllowDuplicates] = useState(false);

    // Hydration fix: Initialize with empty state, populate on client mount
    const [blocks, setBlocks] = useState<SelectionBlock[]>([]);
    const [trace, setTrace] = useState(() => ({ steps: [] as any[] }));

    const [stepIndex, setStepIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState(450);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const logEndRef = useRef<HTMLDivElement>(null);

    const steps = trace.steps;
    const step = steps[stepIndex];
    const isComplete = step?.completed ?? false;

    const totalComparisons = step?.compareCount ?? 0;
    const totalSwaps = step?.swapCount ?? 0;
    const progress =
        steps.length > 1
            ? Math.round((stepIndex / (steps.length - 1)) * 100)
            : 100;

    // ── 블럭 재생성 ──
    const regenerate = useCallback(
        (count: number, dupAllowed: boolean) => {
            const newBlocks = shuffleBlocks(generateRandomBlocks(count, dupAllowed));
            setBlocks(newBlocks);
            setTrace(createSelectionSortTrace(newBlocks));
            setStepIndex(0);
            setIsPlaying(false);
        },
        [],
    );

    // blockCount 또는 allowDuplicates 변경 시 재생성
    useEffect(() => {
        regenerate(blockCount, allowDuplicates);
    }, [blockCount, allowDuplicates, regenerate]);

    const handleShuffle = useCallback(() => {
        regenerate(blockCount, allowDuplicates);
    }, [blockCount, allowDuplicates, regenerate]);

    const handleStep = useCallback(() => {
        if (isComplete) return;
        setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    }, [isComplete, steps.length]);

    const handleToggle = useCallback(() => {
        if (isComplete) return;
        setIsPlaying((prev) => !prev);
    }, [isComplete]);

    const handleReset = useCallback(() => {
        setStepIndex(0);
        setIsPlaying(false);
    }, []);

    // ── 자동 재생 ──
    useEffect(() => {
        if (!isPlaying) {
            if (timerRef.current) clearTimeout(timerRef.current);
            return;
        }
        if (stepIndex >= steps.length - 1) {
            setIsPlaying(false);
            return;
        }
        timerRef.current = setTimeout(() => {
            setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
        }, speed);
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [isPlaying, stepIndex, speed, steps.length]);

    // ── 키보드 단축키 ──
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

            if (event.code === 'Space') {
                event.preventDefault();
                handleToggle();
            } else if (event.key === 'n' || event.key === 'N') {
                handleStep();
            } else if (event.key === 'r' || event.key === 'R') {
                handleReset();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleToggle, handleStep, handleReset]);

    // ── 로그 자동 스크롤 ──
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [stepIndex]);

    // ── 진행 로그 생성 ──
    const logEntries = useMemo(() => {
        const entries: { id: string; text: string; type: string }[] = [];
        for (let i = 0; i <= stepIndex && i < steps.length; i += 1) {
            const s = steps[i];
            if (s.completed) {
                entries.push({
                    id: `log-${i}`,
                    text: '✅ 정렬 완료!',
                    type: 'complete',
                });
            } else if (s.isSwapStep) {
                if (s.didSwap) {
                    entries.push({
                        id: `log-${i}`,
                        text: `${s.pass + 1}번째 패스: ${s.currentIndex}번과 ${s.minIndex}번 블록을 서로 바꿈`,
                        type: 'swap',
                    });
                } else {
                    entries.push({
                        id: `log-${i}`,
                        text: `${s.pass + 1}번째 패스: 교환 안 함 (이미 제자리에 있음)`,
                        type: 'info',
                    });
                }
            } else {
                const action = s.didUpdateMin ? '→ 새로운 최소값!' : '→ 유지';
                entries.push({
                    id: `log-${i}`,
                    text: `${s.pass + 1}번째 패스: [${s.array[s.minIndex]?.value ?? '?'}]와 [${s.array[s.scanIndex]?.value ?? '?'}] 비교 ${action}`,
                    type: s.didUpdateMin ? 'newmin' : 'compare',
                });
            }
        }
        return entries;
    }, [stepIndex, steps]);

    return (
        <div className={styles.container}>
            <Link href="/coding" className={styles.backButton}>
                ← 코딩의 원리
            </Link>

            <header className={styles.header}>
                <h1 className={styles.title}>🔬 선택정렬 체험관</h1>
                <p className={styles.subtitle}>
                    랜덤 블럭을 이용하여 선택정렬이 최소값을 찾아 교환하는 과정을
                    관찰해보세요.
                </p>
            </header>

            {/* 통계 */}
            <div className={styles.stats}>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>진행률</span>
                    <span className={styles.statValue}>{progress}%</span>
                </div>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>패스</span>
                    <span className={styles.statValue}>
                        {step ? step.pass + 1 : 1}
                    </span>
                </div>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>비교 횟수</span>
                    <span className={styles.statValue}>{totalComparisons}</span>
                </div>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>교환 횟수</span>
                    <span className={styles.statValue}>{totalSwaps}</span>
                </div>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>현재 위치 (기준)</span>
                    <span className={styles.statValue}>
                        {step && !step.completed ? step.currentIndex : '-'}
                    </span>
                </div>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>탐색 위치 (비교)</span>
                    <span className={styles.statValue}>
                        {step && step.scanIndex >= 0 ? step.scanIndex : '-'}
                    </span>
                </div>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>최소값 위치</span>
                    <span className={styles.statValue}>
                        {step && !step.completed ? step.minIndex : '-'}
                    </span>
                </div>
            </div>

            {/* 시각화 */}
            <SelectionSortStage step={step ?? null} blocks={blocks} />

            {/* 설정 패널 */}
            <div className={styles.settingsRow}>
                <label className={styles.sliderLabel}>
                    블럭 수: {blockCount}
                    <input
                        type="range"
                        min={5}
                        max={12}
                        step={1}
                        value={blockCount}
                        onChange={(event) => setBlockCount(Number(event.target.value))}
                    />
                </label>
                <label className={styles.toggleLabel}>
                    <input
                        type="checkbox"
                        checked={allowDuplicates}
                        onChange={(event) => setAllowDuplicates(event.target.checked)}
                    />
                    중복 허용
                </label>
            </div>

            {/* 컨트롤 */}
            <div className={styles.controls}>
                <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={handleShuffle}
                >
                    🔀 섞기
                </button>
                <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={handleStep}
                    disabled={isComplete}
                >
                    ⏭ 한 단계
                </button>
                <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={handleToggle}
                    disabled={isComplete}
                >
                    {isPlaying ? '⏸ 일시정지' : '▶ 재생'}
                </button>
                <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={handleReset}
                >
                    🔄 처음으로
                </button>
                <label className={styles.speedControl}>
                    속도
                    <input
                        type="range"
                        min={100}
                        max={900}
                        step={50}
                        value={speed}
                        onChange={(event) => setSpeed(Number(event.target.value))}
                    />
                    <span>{speed}ms</span>
                </label>
            </div>

            {/* 설명 + 로그 */}
            <div className={styles.bottomGrid}>
                <div className={styles.explainBox}>
                    <h3 className={styles.explainTitle}>💡 현재 설명</h3>
                    <p className={styles.explainText}>{step?.description}</p>
                    {isComplete && (
                        <p className={styles.completeText}>
                            🎉 모든 블럭이 작은 값부터 큰 값 순으로 정렬되었습니다!
                        </p>
                    )}
                </div>

                <div className={styles.logPanel}>
                    <h3 className={styles.logTitle}>📋 진행 로그</h3>
                    <div className={styles.logList}>
                        {logEntries.map((entry) => (
                            <div
                                key={entry.id}
                                className={`${styles.logItem} ${entry.type === 'swap'
                                    ? styles.logSwap
                                    : entry.type === 'newmin'
                                        ? styles.logNewMin
                                        : entry.type === 'complete'
                                            ? styles.logComplete
                                            : ''
                                    }`}
                            >
                                {entry.text}
                            </div>
                        ))}
                        <div ref={logEndRef} />
                    </div>
                </div>
            </div>

            <div className={styles.shortcutHint}>
                <span>
                    ⌨️ 단축키: <kbd>Space</kbd> 재생/정지 · <kbd>N</kbd> 한 단계 ·{' '}
                    <kbd>R</kbd> 처음으로
                </span>
            </div>
        </div>
    );
}
