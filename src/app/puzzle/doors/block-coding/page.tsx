'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

/**
 * 완전제곱수 판별 함수
 */
function isPerfectSquare(n: number): boolean {
    if (n < 1) return false;
    const sqrt = Math.sqrt(n);
    return sqrt === Math.floor(sqrt);
}

/**
 * 1부터 n까지의 완전제곱수 리스트 생성
 */
function getPerfectSquares(n: number): number[] {
    const result: number[] = [];
    for (let i = 1; i <= n; i++) {
        if (isPerfectSquare(i)) {
            result.push(i);
        }
    }
    return result;
}

export default function BlockCodingPage() {
    const [inputNumber, setInputNumber] = useState<number>(100);
    const [hasExecuted, setHasExecuted] = useState<boolean>(false);
    const [executionKey, setExecutionKey] = useState<number>(0);

    // 결과 계산
    const isPerfectSquareResult = useMemo(() => {
        return isPerfectSquare(inputNumber);
    }, [inputNumber, executionKey]);

    const perfectSquaresList = useMemo(() => {
        return getPerfectSquares(inputNumber);
    }, [inputNumber, executionKey]);

    const handleRun = () => {
        setHasExecuted(true);
        setExecutionKey(prev => prev + 1); // 애니메이션 재실행을 위해 key 변경
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value) || 1;
        setInputNumber(Math.min(Math.max(val, 1), 1000));
        setHasExecuted(false);
    };

    return (
        <div className={styles.container}>
            {/* 뒤로가기 버튼 */}
            <Link href="/puzzle/doors" className={styles.backButton}>
                ← 문 퍼즐로 돌아가기
            </Link>

            {/* 헤더 */}
            <header className={styles.header}>
                <h1 className={styles.title}>🧩 블록코딩으로 배우는 완전제곱수</h1>
                <p className={styles.subtitle}>
                    100개의 문 퍼즐의 핵심 원리를 블록코딩으로 직접 실행해보세요!
                </p>
            </header>

            {/* 입력 섹션 */}
            <section className={styles.inputSection}>
                <span className={styles.inputLabel}>숫자 n =</span>
                <input
                    type="number"
                    className={styles.numberInput}
                    value={inputNumber}
                    onChange={handleInputChange}
                    min={1}
                    max={1000}
                />
                <button className={styles.runButton} onClick={handleRun}>
                    ▶️ 실행하기
                </button>
            </section>

            {/* 블록 코드 영역 */}
            <div className={styles.blocksContainer}>
                {/* 1번: 완전제곱수 판별 */}
                <section className={styles.blockSection}>
                    <h2 className={styles.sectionTitle}>
                        📌 1번: 완전제곱수 판별하기
                    </h2>
                    <div className={styles.blockWrapper} key={`block1-${executionKey}`}>
                        <div className={`${styles.block} ${styles.blockVariable}`}>
                            <span>변수</span>
                            <span className={styles.blockInput}>n</span>
                            <span>을(를)</span>
                            <span className={`${styles.blockInput} ${styles.blockInputHighlight}`}>{inputNumber}</span>
                            <span>(으)로 정하기</span>
                        </div>
                        <div className={`${styles.block} ${styles.blockVariable}`}>
                            <span>변수</span>
                            <span className={styles.blockInput}>sqrt</span>
                            <span>을(를)</span>
                            <span className={styles.blockInput}>√n</span>
                            <span>(으)로 정하기</span>
                        </div>
                        <div className={`${styles.block} ${styles.blockCondition}`}>
                            <span>만약</span>
                            <span className={styles.blockInput}>sqrt</span>
                            <span>=</span>
                            <span className={styles.blockInput}>내림(sqrt)</span>
                            <span>이라면</span>
                        </div>
                        <div className={styles.nestedBlocks}>
                            <div className={`${styles.block} ${styles.blockOutput}`}>
                                <span>💬 말하기</span>
                                <span className={styles.blockInput}>&quot;완전제곱수입니다!&quot;</span>
                            </div>
                        </div>
                        <div className={`${styles.block} ${styles.blockCondition}`}>
                            <span>아니면</span>
                        </div>
                        <div className={styles.nestedBlocks}>
                            <div className={`${styles.block} ${styles.blockOutput}`}>
                                <span>💬 말하기</span>
                                <span className={styles.blockInput}>&quot;완전제곱수가 아닙니다&quot;</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2번: 완전제곱수 리스트 */}
                <section className={styles.blockSection}>
                    <h2 className={styles.sectionTitle}>
                        📌 2번: 완전제곱수 리스트 만들기
                    </h2>
                    <div className={styles.blockWrapper} key={`block2-${executionKey}`}>
                        <div className={`${styles.block} ${styles.blockList}`}>
                            <span>📋 리스트</span>
                            <span className={styles.blockInput}>완전제곱수_리스트</span>
                            <span>생성하기</span>
                        </div>
                        <div className={`${styles.block} ${styles.blockVariable}`}>
                            <span>변수</span>
                            <span className={styles.blockInput}>n</span>
                            <span>을(를)</span>
                            <span className={`${styles.blockInput} ${styles.blockInputHighlight}`}>{inputNumber}</span>
                            <span>(으)로 정하기</span>
                        </div>
                        <div className={`${styles.block} ${styles.blockControl}`}>
                            <span>🔄</span>
                            <span className={styles.blockInput}>i</span>
                            <span>를 1 부터</span>
                            <span className={styles.blockInput}>n</span>
                            <span>까지 반복</span>
                        </div>
                        <div className={styles.nestedBlocks}>
                            <div className={`${styles.block} ${styles.blockVariable}`}>
                                <span>변수</span>
                                <span className={styles.blockInput}>sqrt</span>
                                <span>을(를)</span>
                                <span className={styles.blockInput}>√i</span>
                                <span>(으)로 정하기</span>
                            </div>
                            <div className={`${styles.block} ${styles.blockCondition}`}>
                                <span>만약</span>
                                <span className={styles.blockInput}>sqrt</span>
                                <span>=</span>
                                <span className={styles.blockInput}>내림(sqrt)</span>
                                <span>이라면</span>
                            </div>
                            <div className={styles.nestedBlocks}>
                                <div className={`${styles.block} ${styles.blockList}`}>
                                    <span>➕ 리스트</span>
                                    <span className={styles.blockInput}>완전제곱수_리스트</span>
                                    <span>에</span>
                                    <span className={styles.blockInput}>i</span>
                                    <span>추가하기</span>
                                </div>
                            </div>
                        </div>
                        <div className={`${styles.block} ${styles.blockOutput}`}>
                            <span>💬 리스트 출력하기</span>
                        </div>
                    </div>
                </section>
            </div>

            {/* 실행 결과 */}
            {hasExecuted && (
                <section className={styles.resultSection} key={`result-${executionKey}`}>
                    <h3 className={styles.resultTitle}>🎯 실행 결과</h3>
                    <div className={styles.resultContent}>
                        {/* 1번 결과 */}
                        <div className={styles.resultRow}>
                            <span className={styles.resultLabel}>1번 결과:</span>
                            <span className={`${styles.resultValue} ${isPerfectSquareResult ? styles.resultSuccess : styles.resultFail}`}>
                                {inputNumber}은(는) {isPerfectSquareResult ? '✅ 완전제곱수입니다!' : '❌ 완전제곱수가 아닙니다'}
                                {isPerfectSquareResult && ` (√${inputNumber} = ${Math.sqrt(inputNumber)})`}
                            </span>
                        </div>

                        {/* 2번 결과 */}
                        <div className={styles.resultRow}>
                            <span className={styles.resultLabel}>2번 결과 (1~{inputNumber} 중 완전제곱수):</span>
                            <span className={styles.resultValue}>총 {perfectSquaresList.length}개</span>
                        </div>
                        <div className={styles.listDisplay}>
                            {perfectSquaresList.map((num, idx) => (
                                <span
                                    key={num}
                                    className={`${styles.listItem} ${num === inputNumber ? styles.perfectSquareHighlight : ''}`}
                                    style={{ animationDelay: `${idx * 0.05}s` }}
                                >
                                    {num}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 설명 박스 */}
            <div className={styles.explanationBox}>
                <h3 className={styles.explanationTitle}>💡 왜 이 알고리즘이 중요할까?</h3>
                <p className={styles.explanationText}>
                    <strong>100개의 문 퍼즐</strong>에서 마지막에 열려 있는 문은 바로 <strong>완전제곱수</strong> 번호의 문입니다!<br /><br />
                    그 이유는 각 문이 <strong>자신의 약수 개수</strong>만큼 토글되기 때문인데요,<br />
                    <strong>완전제곱수</strong>만 약수 개수가 <strong>홀수</strong>이기 때문에 열린 채로 남습니다.<br /><br />
                    예: 16의 약수 = 1, 2, 4, 8, 16 → <strong>5개(홀수)</strong> → 열림!<br />
                    12의 약수 = 1, 2, 3, 4, 6, 12 → <strong>6개(짝수)</strong> → 닫힘!
                </p>
            </div>
        </div>
    );
}
