'use client';

import Link from 'next/link';
import { useMemo, useState, useCallback, useEffect } from 'react';
import SelectionSortStage from '@/components/SelectionSortStage';
import {
    SelectionBlock,
    createSelectionSortTrace,
} from '@/lib/coding/selectionSort';
import styles from './page.module.css';

/** 고정 배열: [5, 1, 4, 2, 8] */
const STEP_BLOCKS: SelectionBlock[] = [
    { id: 'red', value: 5, color: '#f87171' },
    { id: 'orange', value: 1, color: '#fb923c' },
    { id: 'yellow', value: 4, color: '#facc15' },
    { id: 'green', value: 2, color: '#4ade80' },
    { id: 'blue', value: 8, color: '#38bdf8' },
];

/**
 * 선택정렬 한 칸씩 설명 페이지
 *
 * 핵심 메커니즘 3줄 요약:
 * 1. 고정 배열 [5,1,4,2,8]에 대해 사전에 모든 step을 trace로 계산한다.
 * 2. 사용자가 다음/이전 버튼으로 stepIndex를 조작하면 해당 step의 상태를 시각화한다.
 * 3. 각 step마다 동적 설명 텍스트로 "왜 이 비교가 일어나는지"를 교육적으로 보여준다.
 */
export default function SelectionStepsPage() {
    const trace = useMemo(() => createSelectionSortTrace(STEP_BLOCKS), []);
    const [stepIndex, setStepIndex] = useState(0);

    const steps = trace.steps;
    const step = steps[stepIndex];
    const isLastStep = stepIndex === steps.length - 1;

    const handlePrev = useCallback(() => {
        setStepIndex((prev) => Math.max(prev - 1, 0));
    }, []);

    const handleNext = useCallback(() => {
        setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    }, [steps.length]);

    const handleReset = useCallback(() => {
        setStepIndex(0);
    }, []);

    // 키보드 단축키
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'n' || event.key === 'N') {
                handleNext();
            } else if (event.key === 'r' || event.key === 'R') {
                handleReset();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, handleReset]);

    /** 개념 설명 — pass별로 다른 메시지 */
    const conceptText = step
        ? step.completed
            ? '모든 위치에 최소값이 배치되었습니다. 정렬이 완료되었습니다!'
            : step.isSwapStep
                ? step.didSwap
                    ? `${step.pass}번 패스 완료: 최소값을 찾아 ${step.currentIndex}번 위치에 배치합니다.`
                    : `${step.pass}번 패스 완료: 이미 최소값이 올바른 위치에 있어 교환이 필요 없습니다.`
                : `현재 ${step.currentIndex}번 위치에 들어갈 최소값을 찾는 중입니다. (패스 ${step.pass + 1})`
        : '시작하려면 다음 단계를 눌러주세요.';

    /** 진행 순서 리스트 */
    const stepSummaries = steps.map((item, index) => {
        let text: string;
        if (item.completed) {
            text = `${index + 1}단계: 정렬 완료 🎉`;
        } else if (item.isSwapStep) {
            text = item.didSwap
                ? `${index + 1}단계: 패스${item.pass + 1} — [${item.currentIndex}]↔[${item.minIndex}] 교환`
                : `${index + 1}단계: 패스${item.pass + 1} — 교환 없음`;
        } else {
            text = `${index + 1}단계: 패스${item.pass + 1}, [${item.scanIndex}]과 최소값 비교 → ${item.didUpdateMin ? '갱신!' : '유지'}`;
        }
        return { id: `step-${index}`, text };
    });

    return (
        <div className={styles.container}>
            <Link href="/coding" className={styles.backButton}>
                ← 코딩의 원리
            </Link>

            <header className={styles.header}>
                <h1 className={styles.title}>🔍 선택정렬: 한 칸씩 설명</h1>
                <p className={styles.subtitle}>
                    고정 위치 i에서 오른쪽 구간의 최소값을 찾아 한 번에 교환하는
                    선택정렬의 원리를 한 단계씩 따라가 봅시다.
                </p>
            </header>

            {/* 상태 표시 */}
            <div className={styles.stats}>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>현재 단계</span>
                    <span className={styles.statValue}>
                        {stepIndex + 1} / {steps.length}
                    </span>
                </div>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>패스</span>
                    <span className={styles.statValue}>
                        {step ? step.pass + 1 : 1}
                    </span>
                </div>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>현재 위치 (i)</span>
                    <span className={styles.statValue}>
                        {step ? step.currentIndex : '-'}
                    </span>
                </div>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>탐색 위치 (j)</span>
                    <span className={styles.statValue}>
                        {step && step.scanIndex >= 0 ? step.scanIndex : '-'}
                    </span>
                </div>
                <div className={styles.statBox}>
                    <span className={styles.statLabel}>최소값 위치</span>
                    <span className={styles.statValue}>
                        {step ? step.minIndex : '-'}
                    </span>
                </div>
            </div>

            <div className={styles.mainGrid}>
                <section className={styles.stageSection}>
                    <SelectionSortStage
                        step={step ?? null}
                        blocks={STEP_BLOCKS}
                    />

                    <div className={styles.controls}>
                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={handlePrev}
                            disabled={stepIndex === 0}
                        >
                            ← 이전 단계
                        </button>
                        <button
                            type="button"
                            className={styles.primaryButton}
                            onClick={handleNext}
                            disabled={isLastStep}
                        >
                            다음 단계 →
                        </button>
                        <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={handleReset}
                            disabled={stepIndex === 0}
                        >
                            처음으로
                        </button>
                    </div>

                    {/* 개념 설명 */}
                    <div className={styles.explainBox}>
                        <h3 className={styles.explainTitle}>💡 현재 설명</h3>
                        <p className={styles.explainText}>{step?.description}</p>
                        <p className={styles.conceptText}>{conceptText}</p>
                        {isLastStep && (
                            <p className={styles.completeText}>
                                🎉 모든 블럭이 작은 값부터 큰 값 순으로 정렬되었습니다!
                            </p>
                        )}
                    </div>

                    {/* 버블 vs 선택 비교 */}
                    <div className={styles.compareBox}>
                        <h3 className={styles.compareTitle}>🆚 버블정렬과 선택정렬의 차이</h3>
                        <div className={styles.compareGrid}>
                            <div className={styles.compareCard}>
                                <h4>🫧 버블정렬</h4>
                                <ul>
                                    <li>인접한 두 요소를 매번 비교</li>
                                    <li>비교할 때마다 즉시 교환</li>
                                    <li>교환 횟수가 많음</li>
                                    <li>큰 값이 오른쪽으로 &quot;떠오름&quot;</li>
                                </ul>
                            </div>
                            <div className={styles.compareCard}>
                                <h4>🔍 선택정렬</h4>
                                <ul>
                                    <li>고정 위치에서 최소값을 탐색</li>
                                    <li>패스당 최대 1번 교환</li>
                                    <li>교환 횟수가 적음</li>
                                    <li>작은 값을 왼쪽에 &quot;배치&quot;</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 진행 순서 사이드바 */}
                <aside className={styles.listSection}>
                    <h3 className={styles.listTitle}>📋 진행 순서</h3>
                    <div className={styles.stepList}>
                        {stepSummaries.map((item, index) => (
                            <div
                                key={item.id}
                                className={`${styles.stepItem} ${index === stepIndex ? styles.stepActive : ''
                                    }`}
                            >
                                {item.text}
                            </div>
                        ))}
                    </div>
                </aside>
            </div>

            <div className={styles.shortcutHint}>
                <span>⌨️ 단축키: <kbd>N</kbd> 다음 단계 · <kbd>R</kbd> 처음으로</span>
            </div>
        </div>
    );
}
