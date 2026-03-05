'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

type LogicalOp = 'AND' | 'OR' | 'NOT';

export default function LogicalPage() {
    const [operator, setOperator] = useState<LogicalOp>('AND');
    const [switchA, setSwitchA] = useState(false);
    const [switchB, setSwitchB] = useState(false);

    // 논리 연산 계산
    let isLightOn = false;
    let explanation = '';

    if (operator === 'AND') {
        isLightOn = switchA && switchB;
        explanation = isLightOn
            ? 'A와 B가 모두 켜져서 전구에 불이 들어옵니다!'
            : 'A와 B가 모두 켜져야만 불이 들어옵니다.';
    } else if (operator === 'OR') {
        isLightOn = switchA || switchB;
        explanation = isLightOn
            ? 'A 또는 B 중 하나라도 켜져서 전구에 불이 들어옵니다!'
            : 'A 또는 B 중 적어도 하나는 켜야 불이 들어옵니다.';
    } else if (operator === 'NOT') {
        // NOT 모드에서는 switchA 하나만 사용 (결과 반전)
        isLightOn = !switchA;
        explanation = switchA
            ? '스위치를 켜면 전구가 꺼집니다! (결과 반대)'
            : '스위치를 끄면 전구가 켜집니다! (결과 반대)';
    }

    // 회로도 렌더링 도우미 (CSS 클래스 관리용)
    const renderCircuit = () => {
        if (operator === 'NOT') {
            return (
                <div className={styles.circuitContainer}>
                    <div className={`${styles.wire} ${switchA ? styles.wireOff : styles.wireOn}`} />
                    <div
                        className={`${styles.switch} ${switchA ? styles.switchOn : styles.switchOff}`}
                        onClick={() => setSwitchA(!switchA)}
                    >
                        A
                    </div>
                    <div className={`${styles.wire} ${!switchA ? styles.wireOn : styles.wireOff}`} />
                    <div className={`${styles.bulb} ${!switchA ? styles.bulbOn : styles.bulbOff}`}>💡</div>
                </div>
            );
        }

        if (operator === 'AND') {
            return (
                <div className={styles.circuitContainer}>
                    <div className={`${styles.wire} ${styles.wireOn}`} />
                    <div
                        className={`${styles.switch} ${switchA ? styles.switchOn : styles.switchOff}`}
                        onClick={() => setSwitchA(!switchA)}
                    >
                        A
                    </div>
                    <div className={`${styles.wire} ${switchA ? styles.wireOn : styles.wireOff}`} />
                    <div
                        className={`${styles.switch} ${switchB ? styles.switchOn : styles.switchOff}`}
                        onClick={() => setSwitchB(!switchB)}
                    >
                        B
                    </div>
                    <div className={`${styles.wire} ${switchA && switchB ? styles.wireOn : styles.wireOff}`} />
                    <div className={`${styles.bulb} ${switchA && switchB ? styles.bulbOn : styles.bulbOff}`}>💡</div>
                </div>
            );
        }

        // OR 회로 (병렬 구조)
        return (
            <div className={styles.circuitParallel}>
                <div className={`${styles.wire} ${styles.wireOn} ${styles.wireVertical}`} />
                <div className={styles.parallelBranches}>
                    <div className={styles.branch}>
                        <div className={`${styles.wireVertical} ${styles.wireOn}`} />
                        <div
                            className={`${styles.switch} ${switchA ? styles.switchOn : styles.switchOff}`}
                            onClick={() => setSwitchA(!switchA)}
                        >
                            A
                        </div>
                        <div className={`${styles.wireVertical} ${switchA ? styles.wireOn : styles.wireOff}`} />
                    </div>

                    <div className={styles.branch}>
                        <div className={`${styles.wireVertical} ${styles.wireOn}`} />
                        <div
                            className={`${styles.switch} ${switchB ? styles.switchOn : styles.switchOff}`}
                            onClick={() => setSwitchB(!switchB)}
                        >
                            B
                        </div>
                        <div className={`${styles.wireVertical} ${switchB ? styles.wireOn : styles.wireOff}`} />
                    </div>
                </div>
                <div className={`${styles.wire} ${styles.wireOn} ${styles.wireVerticalDown}`} />
                <div className={`${styles.bulb} ${switchA || switchB ? styles.bulbOn : styles.bulbOff}`}>💡</div>
            </div>
        );
    };

    return (
        <div className={styles.container}>
            <Link href="/coding" className={styles.backButton}>
                ← 코딩의 원리
            </Link>

            <header className={styles.header}>
                <h1 className={styles.title}>💡 논리 회로 (논리 연산자)</h1>
                <p className={styles.subtitle}>
                    두 개 이상의 조건을 조합할 때 사용해요! 스위치를 클릭해 불을 켜보세요.
                </p>
            </header>

            <div className={styles.mainContent}>

                {/* 코드 / 설명 영역 */}
                <div className={styles.explainPanel}>
                    <h3>📝 논리 연산자란?</h3>
                    <p>
                        조건(True/False) 여러 개를 합칠 때 사용하는 규칙입니다.<br />
                        <strong>AND (&&)</strong>: 두 가지를 모두 만족해야 참!<br />
                        <strong>OR (||)</strong>: 둘 중 하나라도 만족하면 참!<br />
                        <strong>NOT (!)</strong>: 참이면 거짓, 거짓이면 참으로 뒤집기!
                    </p>
                    <div className={styles.codeBlock}>
                        <code>
                            {operator !== 'NOT' && (
                                <>
                                    let a = <span className={switchA ? styles.boolTrue : styles.boolFalse}>{String(switchA)}</span>;<br />
                                    let b = <span className={switchB ? styles.boolTrue : styles.boolFalse}>{String(switchB)}</span>;<br />
                                    let result = a {operator === 'AND' ? '&&' : '||'} b;<br />
                                </>
                            )}
                            {operator === 'NOT' && (
                                <>
                                    let a = <span className={switchA ? styles.boolTrue : styles.boolFalse}>{String(switchA)}</span>;<br />
                                    let result = !a;<br />
                                </>
                            )}

                            <span className={styles.codeComment}>
                                {`// result 에는 `}<span className={isLightOn ? styles.boolTrue : styles.boolFalse}>{String(isLightOn)}</span>{` 값이 들어갑니다.`}
                            </span>
                        </code>
                    </div>
                </div>

                {/* 인터랙티브 회로 영역 */}
                <div className={styles.interactiveArea}>

                    <div className={styles.circuitBoard}>

                        {/* 연산자 탭 */}
                        <div className={styles.operatorTabs}>
                            <button
                                className={`${styles.opTab} ${operator === 'AND' ? styles.activeTab : ''}`}
                                onClick={() => setOperator('AND')}
                            >
                                AND (&&) 직렬 접속
                            </button>
                            <button
                                className={`${styles.opTab} ${operator === 'OR' ? styles.activeTab : ''}`}
                                onClick={() => setOperator('OR')}
                            >
                                OR (||) 병렬 접속
                            </button>
                            <button
                                className={`${styles.opTab} ${operator === 'NOT' ? styles.activeTab : ''}`}
                                onClick={() => setOperator('NOT')}
                            >
                                NOT (!) 반전 스위치
                            </button>
                        </div>

                        <div className={styles.circuitCanvas}>
                            {renderCircuit()}
                        </div>

                        <div className={`${styles.resultBanner} ${isLightOn ? styles.bannerTrue : styles.bannerFalse}`}>
                            {isLightOn ? '💡 전원 ON (참)' : '🔌 전원 OFF (거짓)'}
                        </div>

                        <p className={styles.explanationText}>📝 {explanation}</p>

                    </div>

                </div>

            </div>
        </div>
    );
}
