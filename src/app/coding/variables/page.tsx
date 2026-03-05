'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

/**
 * 변수 학습 체험관 (Variables)
 * 
 * 컨셉: 빈 '상자'에 '값'을 할당하고 재할당(Re-assign)하는 체험.
 * 1. 숫자 버튼(값)을 클릭하여 현재 선택(들고 있는) 값으로 지정
 * 2. 상자(Box)를 클릭하면 들고 있던 값이 상자에 들어감
 * 3. 할당된 값을 기반으로 간단한 덧셈 결과를 하단에서 보여줌
 */
export default function VariablesPage() {
    const [holdingValue, setHoldingValue] = useState<number | null>(null);

    // 상자 상태 관리 (a, b)
    const [boxA, setBoxA] = useState<number | null>(null);
    const [boxB, setBoxB] = useState<number | null>(null);

    const selectableValues = [3, 5, 8, 12, 50];

    const handleBoxClick = (boxName: 'A' | 'B') => {
        if (holdingValue === null) {
            alert('먼저 아래 숫자 중에서 넣을 값을 클릭해주세요!');
            return;
        }

        if (boxName === 'A') setBoxA(holdingValue);
        if (boxName === 'B') setBoxB(holdingValue);

        // 할당 후 손에 들고 있는 값은 비움
        setHoldingValue(null);
    };

    const isReadyToCalculate = boxA !== null && boxB !== null;
    const result = isReadyToCalculate ? boxA + boxB : '?';

    return (
        <div className={styles.container}>
            <Link href="/coding" className={styles.backButton}>
                ← 코딩의 원리
            </Link>

            <header className={styles.header}>
                <h1 className={styles.title}>📦 마법 상자 (변수)</h1>
                <p className={styles.subtitle}>
                    상자는 값을 보관하는 공간이에요. 원하는 값을 상자에 담아보고 어떤 일이 일어나는지 관찰해봐요!
                </p>
            </header>

            <div className={styles.mainContent}>

                {/* 설명 및 코드 매핑 섹션 */}
                <div className={styles.explainPanel}>
                    <h3>📝 변수란?</h3>
                    <p>
                        변수(Variable)는 데이터를 담아둘 수 있는 이름표가 붙은 상자입니다.<br />
                        안에 들어있는 값을 언제든지 다른 값으로 <strong>바꿔치기(재할당)</strong> 할 수 있어요.
                    </p>
                    <div className={styles.codeBlock}>
                        <code>
                            let a = <span className={styles.codeValue}>{boxA !== null ? boxA : '?'}</span>;<br />
                            let b = <span className={styles.codeValue}>{boxB !== null ? boxB : '?'}</span>;
                        </code>
                    </div>
                </div>

                <div className={styles.interactiveArea}>

                    {/* 상자 영역 */}
                    <div className={styles.boxesStage}>
                        <div
                            className={`${styles.boxContainer} ${boxA !== null ? styles.hasValue : ''}`}
                            onClick={() => handleBoxClick('A')}
                        >
                            <div className={styles.boxLabel}>상자 A</div>
                            <div className={styles.boxContent}>
                                {boxA !== null ? boxA : '비어있음'}
                            </div>
                        </div>

                        <div className={styles.operatorIcon}>+</div>

                        <div
                            className={`${styles.boxContainer} ${boxB !== null ? styles.hasValue : ''}`}
                            onClick={() => handleBoxClick('B')}
                        >
                            <div className={styles.boxLabel}>상자 B</div>
                            <div className={styles.boxContent}>
                                {boxB !== null ? boxB : '비어있음'}
                            </div>
                        </div>

                        <div className={styles.operatorIcon}>=</div>

                        {/* 결과 상자 (계산된 결과) */}
                        <div className={`${styles.boxContainer} ${styles.resultBox} ${isReadyToCalculate ? styles.hasResult : ''}`}>
                            <div className={styles.boxLabel}>결과</div>
                            <div className={styles.boxContent}>
                                {result}
                            </div>
                        </div>
                    </div>

                    <div className={styles.divider} />

                    {/* 값 선택 영역 */}
                    <div className={styles.valueSelectionArea}>
                        <h3 className={styles.selectionTitle}>
                            {holdingValue !== null
                                ? `현재 선택한 값: [ ${holdingValue} ] 👇 이제 넣을 상자를 클릭하세요!`
                                : '1️⃣ 아래에서 상자에 넣을 숫자를 클릭하세요'}
                        </h3>

                        <div className={styles.valueChipsRow}>
                            {selectableValues.map((val) => (
                                <button
                                    key={val}
                                    type="button"
                                    className={`${styles.valueChip} ${holdingValue === val ? styles.holding : ''}`}
                                    onClick={() => setHoldingValue(val)}
                                >
                                    {val}
                                </button>
                            ))}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
