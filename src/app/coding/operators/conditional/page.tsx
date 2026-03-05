'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

type ConditionalOp = '>' | '<' | '>=' | '<=' | '==' | '!=';

const OPERATORS: { op: ConditionalOp; name: string; desc: string }[] = [
    { op: '>', name: '크다 (초과)', desc: '왼쪽이 오른쪽보다 무거우면 참' },
    { op: '<', name: '작다 (미만)', desc: '왼쪽이 오른쪽보다 가벼우면 참' },
    { op: '>=', name: '크거나 같다 (이상)', desc: '왼쪽이 무겁거나 양쪽이 같으면 참' },
    { op: '<=', name: '작거나 같다 (이하)', desc: '왼쪽이 가볍거나 양쪽이 같으면 참' },
    { op: '==', name: '같다', desc: '양쪽 무게가 완전히 같으면 참' },
    { op: '!=', name: '다르다', desc: '양쪽 무게가 서로 다르면 참' },
];

export default function ConditionalPage() {
    const [leftWeight, setLeftWeight] = useState(10);
    const [rightWeight, setRightWeight] = useState(5);
    const [operator, setOperator] = useState<ConditionalOp>('>');

    let result = false;
    let explanation = '';

    switch (operator) {
        case '>':
            result = leftWeight > rightWeight;
            explanation = result ? '왼쪽이 더 무거워서 통과입니다!' : '왼쪽이 더 무겁지 않아서 실패입니다.';
            break;
        case '<':
            result = leftWeight < rightWeight;
            explanation = result ? '오른쪽이 더 무거워서 통과입니다!' : '오른쪽이 더 무겁지 않아서 실패입니다.';
            break;
        case '>=':
            result = leftWeight >= rightWeight;
            explanation = result ? '왼쪽이 더 무겁거나 같아서 통과입니다!' : '오른쪽이 더 무거워서 실패입니다.';
            break;
        case '<=':
            result = leftWeight <= rightWeight;
            explanation = result ? '오른쪽이 더 무겁거나 같아서 통과입니다!' : '왼쪽이 더 무거워서 실패입니다.';
            break;
        case '==':
            result = leftWeight === rightWeight;
            explanation = result ? '양쪽 무게가 같아서 통과입니다!' : '양쪽 무게가 달라서 실패입니다.';
            break;
        case '!=':
            result = leftWeight !== rightWeight;
            explanation = result ? '양쪽 무게가 달라서 통과입니다!' : '양쪽 무게가 같아서 실패입니다.';
            break;
    }

    // 저울 애니메이션 각도 계산 (임의치)
    let tiltAngle = 0;
    if (leftWeight > rightWeight) tiltAngle = -15; // 왼쪽으로 기움
    if (leftWeight < rightWeight) tiltAngle = 15;  // 오른쪽으로 기움

    return (
        <div className={styles.container}>
            <Link href="/coding" className={styles.backButton}>
                ← 코딩의 원리
            </Link>

            <header className={styles.header}>
                <h1 className={styles.title}>⚖️ 판별 저울 (조건 연산자)</h1>
                <p className={styles.subtitle}>
                    저울 양쪽의 무게를 설정하고, 참/거짓을 가려내는 조건을 변경해보세요!
                </p>
            </header>

            <div className={styles.mainContent}>

                {/* 코드 / 설명 영역 */}
                <div className={styles.explainPanel}>
                    <h3>📝 조건 연산자란?</h3>
                    <p>
                        결과가 숫자가 아니라, <strong>맞다(True) / 틀리다(False)</strong> 로만 나오는 마법의 저울입니다.<br />
                        컴퓨터에게 <code>&quot;왼쪽이 더 크니?&quot;</code> 하고 질문을 던지는 것과 같아요.
                    </p>
                    <div className={styles.codeBlock}>
                        <code>
                            let a = {leftWeight};<br />
                            let b = {rightWeight};<br />
                            let isPass = a {operator} b;<br />
                            <span className={styles.codeComment}>
                                {`// isPass 에는 `}<span className={result ? styles.boolTrue : styles.boolFalse}>{String(result)}</span>{` 값이 들어갑니다.`}
                            </span>
                        </code>
                    </div>
                </div>

                {/* 인터랙티브 저울 영역 */}
                <div className={styles.interactiveArea}>

                    <div className={styles.scaleContainer}>
                        {/* 결과 표시기 */}
                        <div className={`${styles.resultBanner} ${result ? styles.bannerTrue : styles.bannerFalse}`}>
                            {result ? '✅ TRUE (참)' : '❌ FALSE (거짓)'}
                        </div>

                        <p className={styles.explanationText}>💡 {explanation}</p>

                        {/* 조건 선택 버튼들 */}
                        <div className={styles.operatorSelector}>
                            {OPERATORS.map(opObj => (
                                <button
                                    key={opObj.op}
                                    className={`${styles.opBtn} ${operator === opObj.op ? styles.active : ''}`}
                                    onClick={() => setOperator(opObj.op)}
                                    title={opObj.desc}
                                >
                                    <span className={styles.opSymbol}>{opObj.op}</span>
                                    <span className={styles.opName}>{opObj.name}</span>
                                </button>
                            ))}
                        </div>

                        {/* 물리 저울 시각화 */}
                        <div className={styles.physicalScale}>
                            <div
                                className={styles.beamBox}
                                style={{ transform: `rotate(${tiltAngle}deg)` }}
                            >
                                <div className={styles.beam}></div>

                                <div className={styles.panLeft}>
                                    <div className={styles.weightItem} style={{ transform: `scale(${Math.min(1 + leftWeight / 50, 2)})` }}>
                                        {leftWeight}kg
                                    </div>
                                    <div className={styles.plate}></div>
                                </div>

                                <div className={styles.panRight}>
                                    <div className={styles.weightItem} style={{ transform: `scale(${Math.min(1 + rightWeight / 50, 2)})` }}>
                                        {rightWeight}kg
                                    </div>
                                    <div className={styles.plate}></div>
                                </div>
                            </div>
                            <div className={styles.base}></div>
                        </div>

                        {/* 무게 조절기 */}
                        <div className={styles.weightControls}>
                            <div className={styles.controlGroup}>
                                <label>왼쪽 무게: {leftWeight}</label>
                                <input
                                    type="range"
                                    min="1" max="50"
                                    value={leftWeight}
                                    onChange={(e) => setLeftWeight(parseInt(e.target.value))}
                                />
                            </div>
                            <div className={styles.controlGroup}>
                                <label>오른쪽 무게: {rightWeight}</label>
                                <input
                                    type="range"
                                    min="1" max="50"
                                    value={rightWeight}
                                    onChange={(e) => setRightWeight(parseInt(e.target.value))}
                                />
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
}
