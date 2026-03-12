'use client';

import React, { useState } from 'react';
import TruthTablePuzzle from './TruthTablePuzzle';
import { truthTablePuzzles } from '@/lib/puzzles/truthTable/truthTable';
import styles from './page.module.css';

export default function TruthTablePage() {
    const [currentLevel, setCurrentLevel] = useState(0);

    const puzzle = truthTablePuzzles[currentLevel];

    const handleLevelChange = (index: number) => {
        setCurrentLevel(index);
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <h1 className={styles.title}>
                    <span className={styles.titleEmoji}>📝</span>
                    {puzzle.title}
                </h1>
                <p className={styles.subtitle}>{puzzle.desc}</p>
            </header>

            {/* Level Selection */}
            <div className={styles.settingsPanel}>
                <div className={styles.settingGroup}>
                    <label className={styles.settingLabel}>레벨 선택</label>
                    <div className={styles.buttonGroup}>
                        {truthTablePuzzles.map((p, idx) => (
                            <button
                                key={p.id}
                                onClick={() => handleLevelChange(idx)}
                                className={`${styles.optionBtn} ${currentLevel === idx ? styles.optionActive : ''
                                    }`}
                            >
                                레벨 {idx + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Puzzle Component */}
            <TruthTablePuzzle key={puzzle.id} puzzle={puzzle} />

            {/* Help Instructions */}
            <div className={styles.helpSection}>
                <details className={styles.helpDetails}>
                    <summary className={styles.helpSummary}>❓ 진리표 푸는 방법</summary>
                    <div className={styles.helpContent}>
                        <p>
                            <strong>진리표(Truth Table)</strong>은 모든 가능한 진실/거짓의 경우를 나열하여
                            논리적 모순을 찾는 도구입니다.
                        </p>
                        <ul>
                            <li><strong>T (TRUE)</strong>: 항상 참인 진술을 하는 사람</li>
                            <li><strong>F (FALSE)</strong>: 항상 거짓인 진술을 하는 사람</li>
                        </ul>
                        <h4>조작 방법</h4>
                        <ul>
                            <li>마우스나 터치로 토큰을 집어서(드래그) 빈 칸에 내려놓으세요.</li>
                            <li><strong>조합 자동 채우기</strong>를 누르면 용의자들의 모든 T/F 경우의 수가 등록됩니다.</li>
                            <li>마지막 열의 <strong>가능 여부</strong>를 찾아 올바르게 배치해보세요.</li>
                            <li>지우고 싶다면 입력된 칸을 한 번 <strong>클릭</strong>하면 됩니다.</li>
                        </ul>
                    </div>
                </details>
            </div>
        </div>
    );
}
