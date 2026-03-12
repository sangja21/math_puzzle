'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

/**
 * 복합 조건문 학습 체험관
 *
 * 컨셉: 💡 논리 스위치 보드
 * - 3개의 스위치(A, B, C)를 ON/OFF 조작
 * - AND, OR, NOT 조합으로 최종 결과(전구)를 결정
 * - 현재 조건식의 실시간 평가 결과를 시각화
 *
 * 학습 핵심:
 * - ANDCondition: A && B (둘 다 참이어야 참)
 * - OR Condition: A || C (하나라도 참이면 참)
 * - NOT Condition: !B (반전)
 * - 복합: (A && B) || !C
 */

interface SwitchKey {
    key: 'A' | 'B' | 'C';
    label: string;
    emoji: string;
}

const SWITCHES: SwitchKey[] = [
    { key: 'A', label: '스위치 A', emoji: '🔌' },
    { key: 'B', label: '스위치 B', emoji: '🔌' },
    { key: 'C', label: '스위치 C', emoji: '🔌' },
];

type ConditionMode = 'and' | 'or' | 'not' | 'compound';

interface ConditionOption {
    mode: ConditionMode;
    label: string;
    description: string;
    code: (a: boolean, b: boolean, c: boolean) => string;
    evaluate: (a: boolean, b: boolean, c: boolean) => boolean;
}

const CONDITIONS: ConditionOption[] = [
    {
        mode: 'and',
        label: 'AND (&&)',
        description: '두 조건이 모두 참이어야 결과도 참이에요.',
        code: (a, b) => `if (A && B) {\n  // A=${a}, B=${b}\n  // ${a} && ${b} = ${a && b}\n}`,
        evaluate: (a, b) => a && b,
    },
    {
        mode: 'or',
        label: 'OR (||)',
        description: '두 조건 중 하나라도 참이면 결과가 참이에요.',
        code: (a, _b, c) => `if (A || C) {\n  // A=${a}, C=${c}\n  // ${a} || ${c} = ${a || c}\n}`,
        evaluate: (a, _b, c) => a || c,
    },
    {
        mode: 'not',
        label: 'NOT (!)',
        description: '조건의 반대(반전)! 참은 거짓으로, 거짓은 참으로.',
        code: (_a, b) => `if (!B) {\n  // B=${b}\n  // !${b} = ${!b}\n}`,
        evaluate: (_a, b) => !b,
    },
    {
        mode: 'compound',
        label: '복합 조건',
        description: 'AND, OR, NOT을 조합한 복합 조건식이에요.',
        code: (a, b, c) => `if ((A && B) || !C) {\n  // A=${a}, B=${b}, C=${c}\n  // (${a}&&${b})||!${c} = ${(a && b) || !c}\n}`,
        evaluate: (a, b, c) => (a && b) || !c,
    },
];

export default function CompoundIfPage() {
    const [switches, setSwitches] = useState<Record<'A' | 'B' | 'C', boolean>>({
        A: false,
        B: false,
        C: true,
    });
    const [mode, setMode] = useState<ConditionMode>('and');

    const currentCondition = CONDITIONS.find((c) => c.mode === mode)!;
    const result = currentCondition.evaluate(switches.A, switches.B, switches.C);

    /** 스위치 토글 */
    const handleToggle = (key: 'A' | 'B' | 'C') => {
        setSwitches((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className={styles.container}>
            <Link href="/coding" className={styles.backButton}>
                ← 코딩의 원리
            </Link>

            <header className={styles.header}>
                <h1 className={styles.title}>💡 논리 스위치 보드 (복합 조건문)</h1>
                <p className={styles.subtitle}>
                    AND, OR, NOT을 조합하면 더 복잡한 조건을 표현할 수 있어요. 스위치를 켜고 꺼보세요!
                </p>
            </header>

            <div className={styles.mainContent}>

                {/* 왼쪽: 설명 + 코드 패널 */}
                <div className={styles.explainPanel}>
                    <h3>📝 복합 조건문이란?</h3>
                    <p>
                        실제 프로그래밍에서는 조건 하나만으로 부족할 때가 많아요.
                        <strong> &&(AND)</strong>, <strong>||(OR)</strong>, <strong>!(NOT)</strong>을 조합하면
                        훨씬 정교한 조건을 만들 수 있습니다.
                    </p>

                    <div className={styles.operatorGuide}>
                        <div className={styles.opItem}>
                            <code className={styles.opCode}>A &amp;&amp; B</code>
                            <span className={styles.opDesc}>둘 다 참 → 참</span>
                        </div>
                        <div className={styles.opItem}>
                            <code className={styles.opCode}>A || B</code>
                            <span className={styles.opDesc}>하나라도 참 → 참</span>
                        </div>
                        <div className={styles.opItem}>
                            <code className={styles.opCode}>!A</code>
                            <span className={styles.opDesc}>참 → 거짓, 거짓 → 참</span>
                        </div>
                    </div>

                    {/* 조건 선택 탭 */}
                    <div className={styles.modeSelector}>
                        {CONDITIONS.map((c) => (
                            <button
                                key={c.mode}
                                type="button"
                                className={`${styles.modeBtn} ${mode === c.mode ? styles.modeBtnActive : ''}`}
                                onClick={() => setMode(c.mode)}
                            >
                                {c.label}
                            </button>
                        ))}
                    </div>

                    <p className={styles.modeDescription}>{currentCondition.description}</p>

                    <div className={styles.codeBlock}>
                        <pre>
                            {currentCondition.code(switches.A, switches.B, switches.C)}
                        </pre>
                    </div>
                </div>

                {/* 오른쪽: 인터랙티브 영역 */}
                <div className={styles.interactiveArea}>

                    {/* 전구 결과 */}
                    <div className={styles.bulbStage}>
                        <div className={`${styles.bulb} ${result ? styles.bulbOn : styles.bulbOff}`}>
                            {result ? '💡' : '🌑'}
                        </div>
                        <div className={`${styles.bulbLabel} ${result ? styles.bulbLabelOn : styles.bulbLabelOff}`}>
                            {result ? '전구 ON — 조건 참(True)!' : '전구 OFF — 조건 거짓(False)'}
                        </div>
                    </div>

                    <div className={styles.divider} />

                    {/* 스위치 패널 */}
                    <div className={styles.switchPanel}>
                        <h3 className={styles.switchPanelTitle}>스위치 조작판</h3>
                        <div className={styles.switchesRow}>
                            {SWITCHES.map(({ key, label }) => (
                                <div key={key} className={styles.switchUnit}>
                                    <div className={styles.switchLabel}>{label}</div>
                                    <button
                                        type="button"
                                        className={`${styles.switchBtn} ${switches[key] ? styles.switchOn : styles.switchOff}`}
                                        onClick={() => handleToggle(key)}
                                    >
                                        <div className={styles.switchKnob} />
                                    </button>
                                    <div className={`${styles.switchStatus} ${switches[key] ? styles.statusTrue : styles.statusFalse}`}>
                                        {switches[key] ? 'true' : 'false'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.divider} />

                    {/* 평가 흐름 */}
                    <div className={styles.evalFlow}>
                        <h3 className={styles.evalTitle}>🔍 조건 평가 흐름</h3>
                        <div className={styles.evalSteps}>
                            {mode === 'and' && (
                                <>
                                    <EvalChip label="A" value={switches.A} />
                                    <span className={styles.opSign}>&amp;&amp;</span>
                                    <EvalChip label="B" value={switches.B} />
                                    <span className={styles.opSign}>=</span>
                                    <EvalChip label="결과" value={result} isResult />
                                </>
                            )}
                            {mode === 'or' && (
                                <>
                                    <EvalChip label="A" value={switches.A} />
                                    <span className={styles.opSign}>||</span>
                                    <EvalChip label="C" value={switches.C} />
                                    <span className={styles.opSign}>=</span>
                                    <EvalChip label="결과" value={result} isResult />
                                </>
                            )}
                            {mode === 'not' && (
                                <>
                                    <span className={styles.opSign}>!</span>
                                    <EvalChip label="B" value={switches.B} />
                                    <span className={styles.opSign}>=</span>
                                    <EvalChip label="결과" value={result} isResult />
                                </>
                            )}
                            {mode === 'compound' && (
                                <>
                                    <span className={styles.groupStart}>(</span>
                                    <EvalChip label="A" value={switches.A} />
                                    <span className={styles.opSign}>&amp;&amp;</span>
                                    <EvalChip label="B" value={switches.B} />
                                    <span className={styles.groupEnd}>)</span>
                                    <span className={styles.opSign}>||</span>
                                    <span className={styles.opSign}>!</span>
                                    <EvalChip label="C" value={switches.C} />
                                    <span className={styles.opSign}>=</span>
                                    <EvalChip label="결과" value={result} isResult />
                                </>
                            )}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

/** 평가 흐름 칩 컴포넌트 */
interface EvalChipProps {
    label: string;
    value: boolean;
    isResult?: boolean;
}

function EvalChip({ label, value, isResult = false }: EvalChipProps) {
    return (
        <div className={`${styles['evalChip']} ${isResult ? styles.evalChipResult : ''} ${value ? styles.evalChipTrue : styles.evalChipFalse}`}>
            <span>{label}</span>
            <strong>{value ? 'T' : 'F'}</strong>
        </div>
    );
}
