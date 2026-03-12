'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

/**
 * if문 학습 체험관
 *
 * 컨셉: 🚦 신호등 조건문
 * - 슬라이더로 '나이(age)' 값을 조절
 * - if (age >= 18) 조건이 참이면 초록불(입장 가능), 거짓이면 빨간불(입장 불가)
 * - 실시간 코드 미리보기로 조건문이 어떻게 평가되는지 시각화
 */
export default function IfPage() {
    const [age, setAge] = useState<number>(15);
    const threshold = 18;
    const isAllowed = age >= threshold;

    return (
        <div className={styles.container}>
            <Link href="/coding" className={styles.backButton}>
                ← 코딩의 원리
            </Link>

            <header className={styles.header}>
                <h1 className={styles.title}>🚦 신호등 조건문 (if)</h1>
                <p className={styles.subtitle}>
                    조건이 <strong>참(True)</strong>이면 코드를 실행하고, 거짓이면 그냥 지나쳐요!
                </p>
            </header>

            <div className={styles.mainContent}>

                {/* 왼쪽: 설명 + 코드 패널 */}
                <div className={styles.explainPanel}>
                    <h3>📝 if 문이란?</h3>
                    <p>
                        <strong>if 문</strong>은 조건을 검사해서, 그 결과가{' '}
                        <span className={styles.highlight}>참(True)</span>일 때만 안쪽 코드를 실행합니다.
                        <br /><br />
                        마치 놀이공원 입구의 신호등처럼, 조건을 만족해야만 통과할 수 있어요!
                    </p>

                    <div className={styles.conceptBox}>
                        <div className={styles.conceptRow}>
                            <span className={styles.conceptIcon}>✅</span>
                            <span>조건이 <strong>참(True)</strong> → 블록 실행</span>
                        </div>
                        <div className={styles.conceptRow}>
                            <span className={styles.conceptIcon}>⏭️</span>
                            <span>조건이 <strong>거짓(False)</strong> → 건너뜀</span>
                        </div>
                    </div>

                    <div className={styles.codeBlock}>
                        <span className={styles.codeKeyword}>let </span>
                        <span className={styles.codeVar}>age</span>
                        {' = '}
                        <span className={styles.codeValue}>{age}</span>
                        {';\n\n'}
                        <span className={styles.codeKeyword}>if </span>
                        {'('}
                        <span className={styles.codeVar}>age</span>
                        {' >= '}
                        <span className={styles.codeValue}>{threshold}</span>
                        {') {\n  '}
                        <span className={`${styles.codeString} ${isAllowed ? styles.executing : ''}`}>
                            {"console.log('입장 가능! 🎉')"}
                        </span>
                        {'\n}'}
                        <br />
                        <span className={styles.codeComment}>
                            {'// 조건: '}
                            {age}
                            {' >= '}
                            {threshold}
                            {' → '}
                            <span className={isAllowed ? styles.trueColor : styles.falseColor}>
                                {isAllowed ? 'true ✅' : 'false ❌'}
                            </span>
                        </span>
                    </div>
                </div>

                {/* 오른쪽: 인터랙티브 영역 */}
                <div className={styles.interactiveArea}>

                    {/* 신호등 */}
                    <div className={styles.trafficLightStage}>
                        <div className={styles.trafficLight}>
                            <div className={`${styles.lightBulb} ${styles.red} ${!isAllowed ? styles.activeRed : ''}`} />
                            <div className={`${styles.lightBulb} ${styles.yellow}`} />
                            <div className={`${styles.lightBulb} ${styles.green} ${isAllowed ? styles.activeGreen : ''}`} />
                        </div>
                        <div className={`${styles.signBoard} ${isAllowed ? styles.signAllowed : styles.signDenied}`}>
                            {isAllowed ? '🎉 입장 가능!' : '🚫 입장 불가'}
                        </div>
                    </div>

                    <div className={styles.divider} />

                    {/* 슬라이더 영역 */}
                    <div className={styles.sliderArea}>
                        <div className={styles.sliderHeader}>
                            <span>🎚️ <strong>age</strong> 값을 조절해보세요</span>
                            <span className={`${styles.ageDisplay} ${isAllowed ? styles.ageAllowed : styles.ageDenied}`}>
                                {age}세
                            </span>
                        </div>
                        <input
                            type="range"
                            min={1}
                            max={30}
                            value={age}
                            onChange={(e) => setAge(Number(e.target.value))}
                            className={styles.slider}
                        />
                        <div className={styles.sliderLabels}>
                            <span>1세</span>
                            <span className={styles.thresholdLabel}>← 기준: {threshold}세</span>
                            <span>30세</span>
                        </div>
                    </div>

                    <div className={styles.resultExplain}>
                        {isAllowed ? (
                            <p className={styles.resultText}>
                                <strong>age({age}) &gt;= 18</strong>이(가) <span className={styles.trueColor}>참(True)</span>이에요.
                                <br />if 블록 안의 코드가 실행됩니다!
                            </p>
                        ) : (
                            <p className={styles.resultText}>
                                <strong>age({age}) &gt;= 18</strong>이(가) <span className={styles.falseColor}>거짓(False)</span>이에요.
                                <br />if 블록을 건너뜁니다.
                            </p>
                        )}
                    </div>

                </div>

            </div>
        </div>
    );
}
