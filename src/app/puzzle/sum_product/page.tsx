'use client';

import { useState, useMemo, useEffect, Fragment } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { solvePuzzle, DEFAULT_MAX_NUM, MAX_RANGE_LIMIT, MIN_RANGE_LIMIT } from '@/lib/puzzles/sum_product';

export default function SumProductPage() {
    const [maxNum, setMaxNum] = useState(DEFAULT_MAX_NUM);
    const [step, setStep] = useState(0);
    const [hoveredCell, setHoveredCell] = useState<{ x: number, y: number, s: number, p: number } | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    // 퍼즐 해결 로직 실행 (MaxNum 변경 시에만 재계산)
    const solutions = useMemo(() => {
        // 너무 큰 값 방지
        const safeMax = Math.min(Math.max(maxNum, MIN_RANGE_LIMIT), MAX_RANGE_LIMIT);
        return solvePuzzle(safeMax);
    }, [maxNum]);

    // 현재 단계의 유효 후보군 Set
    const activeCandidates = useMemo(() => {
        let currentList;
        switch (step) {
            case 0: currentList = solutions.initial; break;
            case 1: currentList = solutions.step1; break;
            case 2: currentList = solutions.step2; break;
            case 3: currentList = solutions.step3; break;
            case 4: currentList = solutions.step4; break;
            default: currentList = solutions.initial;
        }
        return new Set(currentList.map(c => c.id));
    }, [step, solutions]);

    // 정답(최종 생존자) 확인
    const finalSolutionIds = useMemo(() => {
        return new Set(solutions.step4.map(c => c.id));
    }, [solutions]);

    const handleMouseMove = (e: React.MouseEvent, cellData: { x: number, y: number, s: number, p: number }) => {
        setHoveredCell(cellData);
        setTooltipPos({ x: e.clientX + 15, y: e.clientY + 15 });
    };

    const maxRange = Math.min(Math.max(maxNum, MIN_RANGE_LIMIT), MAX_RANGE_LIMIT);

    // 디버깅: (2,6) 및 S=8 분석
    const debugInfo = useMemo(() => {
        const targetId = '2-6';
        const inInit = solutions.initial.some(c => c.id === targetId);
        const inS1 = solutions.step1.some(c => c.id === targetId);
        const inS2 = solutions.step2.some(c => c.id === targetId);

        let reason = '';
        if (inS1 && !inS2) {
            // S=8인 후보들 분석
            const s8 = solutions.initial.filter(c => c.s === 8);
            const s8Details = s8.map(c => {
                const passedS1 = solutions.step1.some(s1 => s1.id === c.id);
                // 곱의 빈도 (Step 1에서 쓰인)
                const pCount = solutions.initial.filter(i => i.p === c.p).length;
                return `(${c.x},${c.y}) P=${c.p} Count=${pCount} => Passed S1? ${passedS1}`;
            }).join('\n');
            reason = `\n[Analysis for Sum=8]\n${s8Details}`;
        }

        return `Debug (2,6): Init=${inInit} S1=${inS1} S2=${inS2}${reason}`;
    }, [solutions]);

    return (
        <div className={styles.container}>
            {/* 헤더 */}
            <header className={styles.header}>
                <h1 className={styles.title}>Mr.P와 Mr.S (The Impossible Puzzle)</h1>
                <div className={styles.controls}>
                    <div className={styles.controlGroup}>
                        <label>범위 (Max):</label>
                        <input
                            type="number"
                            className={styles.input}
                            value={maxNum}
                            onChange={(e) => {
                                const val = parseInt(e.target.value) || 20;
                                setMaxNum(val);
                                setStep(0); // 리셋
                            }}
                            min={MIN_RANGE_LIMIT}
                            max={MAX_RANGE_LIMIT}
                        />
                    </div>

                    <div className={styles.buttons}>
                        <button
                            className={styles.button}
                            onClick={() => setStep(Math.max(0, step - 1))}
                            disabled={step === 0}
                        >
                            Back
                        </button>
                        <span className={styles.controlGroup}>Step {step} / 4</span>
                        <button
                            className={`${styles.button} ${styles.primary}`}
                            onClick={() => setStep(Math.min(4, step + 1))}
                            disabled={step === 4}
                        >
                            Next Step
                        </button>
                        <button
                            className={styles.button}
                            onClick={() => setStep(0)}
                        >
                            Reset
                        </button>
                    </div>

                    <Link href="/" className={styles.button}>🏠 홈으로</Link>
                </div>
            </header>

            <main className={styles.main}>
                {/* 설명 패널 */}
                <section className={styles.dialogue}>
                    <div className={`${styles.message} ${step >= 0 ? styles.active : ''}`}>
                        <span className={styles.speaker}>System:</span>
                        <span className={styles.text}>
                            2부터 {maxRange}까지 정수 x, y (x ≤ y)를 뽑습니다.<br />
                            <small>총 후보: {solutions.initial.length}개</small>
                        </span>
                    </div>

                    <div className={`${styles.message} ${step >= 1 ? styles.active : ''}`}>
                        <span className={styles.speaker}>Mr.P (Product):</span>
                        <span className={styles.text}>
                            "나는 두 수를 모르겠어요."<br />
                            <small>(곱이 유일하게 분해되지 않음 → 생존: {solutions.step1.length}개)</small>
                        </span>
                    </div>

                    <div className={`${styles.message} ${step >= 2 ? styles.active : ''}`}>
                        <span className={styles.speaker}>Mr.S (Sum):</span>
                        <span className={styles.text}>
                            "당신이 모른다는 걸 이미 알고 있었어요."<br />
                            <small>(합을 나누는 모든 경우의 수가 모호함 → 생존: {solutions.step2.length}개)</small>
                        </span>
                    </div>

                    <div className={`${styles.message} ${step >= 3 ? styles.active : ''}`}>
                        <span className={styles.speaker}>Mr.P (Product):</span>
                        <span className={styles.text}>
                            "아! 이제 두 수를 알겠어요."<br />
                            <small>(남은 후보 중 내 곱을 가진 게 유일함 → 생존: {solutions.step3.length}개)</small>
                        </span>
                    </div>

                    <div className={`${styles.message} ${step >= 4 ? styles.active : ''}`}>
                        <span className={styles.speaker}>Mr.S (Sum):</span>
                        <span className={styles.text}>
                            "그럼 저도 두 수를 알겠군요."<br />
                            <small>(남은 후보 중 내 합을 가진 게 유일함 → 생존: {solutions.step4.length}개)</small>
                        </span>
                    </div>
                </section>

                {/* 그리드 시각화 */}
                <section className={styles.visualization}>
                    <div className={styles.status}>
                        {step === 4 && solutions.step4.length === 1 ? '🎉 정답을 찾았습니다!' : '후보군 시각화'}
                    </div>

                    <div className={styles.gridContainer}>
                        <div
                            className={styles.grid}
                            style={{ gridTemplateColumns: `auto repeat(${maxRange - 1}, 40px)` }}
                        >
                            {/* Header Row */}
                            <div className={`${styles.cell} ${styles.cellHeader} ${styles.row} ${styles.col}`}>X\Y</div>
                            {Array.from({ length: maxRange - 1 }, (_, i) => i + 2).map(y => (
                                <div key={`head-y-${y}`} className={`${styles.cell} ${styles.cellHeader} ${styles.col}`}>{y}</div>
                            ))}

                            {/* Rows */}
                            {Array.from({ length: maxRange - 1 }, (_, i) => i + 2).map(x => (
                                <Fragment key={`row-${x}`}>
                                    {/* Row Header */}
                                    <div key={`head-x-${x}`} className={`${styles.cell} ${styles.cellHeader} ${styles.row}`}>{x}</div>

                                    {/* Cells */}
                                    {Array.from({ length: maxRange - 1 }, (_, j) => j + 2).map(y => {
                                        const id = `${x}-${y}`;
                                        const isActive = activeCandidates.has(id);
                                        const isSolution = step === 4 && finalSolutionIds.has(id);
                                        // 대칭 제거 (x <= y)만 표시
                                        if (x > y) return <div key={id} style={{ background: '#f1f5f9' }} />;

                                        return (
                                            <div
                                                key={id}
                                                className={`${styles.cell} ${isActive ? styles.active : ''} ${isSolution ? styles.solution : ''}`}
                                                onMouseEnter={(e) => handleMouseMove(e, { x, y, s: x + y, p: x * y })}
                                                onMouseLeave={() => setHoveredCell(null)}
                                            >
                                                {isActive ? 'O' : ''}
                                            </div>
                                        );
                                    })}
                                </Fragment>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            {/* 툴팁 */}
            {hoveredCell && (
                <div
                    className={styles.tooltip}
                    style={{ left: tooltipPos.x, top: tooltipPos.y }}
                >
                    X: {hoveredCell.x}, Y: {hoveredCell.y}<br />
                    Sum: {hoveredCell.s}<br />
                    Product: {hoveredCell.p}
                </div>
            )}

            {/* 디버그 출력 */}
            <pre id="debug-output" style={{ padding: '20px', background: '#333', color: '#fff', marginTop: '50px', whiteSpace: 'pre-wrap' }}>
                {debugInfo}
            </pre>
        </div>
    );
}
