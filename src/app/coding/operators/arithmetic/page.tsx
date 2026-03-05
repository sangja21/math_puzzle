'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

type Operator = '+' | '-' | '*' | '/' | '%';

const OPERATORS: { op: Operator; name: string; desc: string }[] = [
    { op: '+', name: '더하기', desc: '두 수를 합칩니다.' },
    { op: '-', name: '빼기', desc: '앞의 수에서 뒤의 수를 뺍니다.' },
    { op: '*', name: '곱하기', desc: '두 수를 곱합니다.' },
    { op: '/', name: '나누기', desc: '소수점 이하를 버리고 나눈 몫을 구합니다.' },
    { op: '%', name: '나머지', desc: '앞의 수를 뒤의 수로 나누고 남은 나머지를 구합니다.' },
];

export default function ArithmeticPage() {
    const [leftOperand, setLeftOperand] = useState(15);
    const [rightOperand, setRightOperand] = useState(4);
    const [operator, setOperator] = useState<Operator>('%');

    let result = 0;
    let calculationNote = '';

    switch (operator) {
        case '+':
            result = leftOperand + rightOperand;
            calculationNote = `${leftOperand}과 ${rightOperand}을 더하면 ${result}이 됩니다.`;
            break;
        case '-':
            result = leftOperand - rightOperand;
            calculationNote = `${leftOperand}에서 ${rightOperand}을 빼면 ${result}이 남습니다.`;
            break;
        case '*':
            result = leftOperand * rightOperand;
            calculationNote = `${leftOperand}을 ${rightOperand}번 반복해서 더하면 ${result}이 됩니다.`;
            break;
        case '/':
            result = Math.floor(leftOperand / rightOperand);
            calculationNote = `${leftOperand}안에 ${rightOperand}이 온전히 ${result}번 들어갑니다. (나머지 버림)`;
            break;
        case '%':
            result = leftOperand % rightOperand;
            calculationNote = `${leftOperand}을 ${rightOperand}씩 덜어내면 마지막에 ${result}이 남습니다.`;
            break;
    }

    // 수학 퍼즐처럼 표현하는 시각화 도우미(예: 피자 조각 방식)
    const renderVisualizer = () => {
        // 너무 큰 숫자는 시각화를 생략
        if (leftOperand > 50 || leftOperand < 0 || rightOperand <= 0 || rightOperand > 50) {
            return <div className={styles.visualizerMsg}>숫자가 너무 크거나 작아서 그림으로 그리기 어려워요! (1~50 권장)</div>;
        }

        const items = Array.from({ length: leftOperand }, (_, i) => i);

        if (operator === '+') {
            const rightItems = Array.from({ length: rightOperand }, (_, i) => i);
            return (
                <div className={styles.visualizer}>
                    <div className={styles.group}>
                        {items.map(i => <div key={`l-${i}`} className={styles.dot}></div>)}
                    </div>
                    <div className={styles.opMark}>+</div>
                    <div className={styles.group}>
                        {rightItems.map(i => <div key={`r-${i}`} className={`${styles.dot} ${styles.dotAlt}`}></div>)}
                    </div>
                </div>
            );
        }

        if (operator === '%') {
            const groups = Math.floor(leftOperand / rightOperand);
            const remainders = leftOperand % rightOperand;

            return (
                <div className={styles.visualizer}>
                    {Array.from({ length: groups }).map((_, gIdx) => (
                        <div key={`group-${gIdx}`} className={styles.chunk}>
                            {Array.from({ length: rightOperand }).map((_, idx) => (
                                <div key={`c-${gIdx}-${idx}`} className={styles.dot}></div>
                            ))}
                        </div>
                    ))}
                    {remainders > 0 && (
                        <div className={styles.chunkRemain}>
                            {Array.from({ length: remainders }).map((_, idx) => (
                                <div key={`rem-${idx}`} className={`${styles.dot} ${styles.dotRemain}`}></div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        return <div className={styles.visualizerMsg}>현재 수식의 결과를 상상해보세요! (퍼센트(%) 기호를 눌러보세요)</div>;
    };

    return (
        <div className={styles.container}>
            <Link href="/coding" className={styles.backButton}>
                ← 코딩의 원리
            </Link>

            <header className={styles.header}>
                <h1 className={styles.title}>⚙️ 톱니바퀴 연산기 (산술 연산자)</h1>
                <p className={styles.subtitle}>
                    숫자를 넣고 연산 기호를 바꿔보세요. 특히 퍼센트(%) 연산자가 어떻게 동작하는지 관찰해보세요!
                </p>
            </header>

            <div className={styles.mainContent}>

                {/* 코드 / 설명 영역 */}
                <div className={styles.explainPanel}>
                    <h3>📝 산술 연산자란?</h3>
                    <p>
                        우리가 학교에서 배운 더하기, 빼기 기호와 똑같아요! <br />
                        추가로 코딩에서는 <strong>나누기(`{"/"}`)</strong>와 <strong>나머지(`{"%"}`)</strong> 연산자가 매우 중요하게 쓰입니다.
                    </p>
                    <div className={styles.codeBlock}>
                        <code>
                            let a = {leftOperand};<br />
                            let b = {rightOperand};<br />
                            let result = a {operator} b;<br />
                            <span className={styles.codeComment}>{'// result에는 '}{result}{' 가 들어갑니다.'}</span>
                        </code>
                    </div>
                </div>

                {/* 인터랙티브 계산기 영역 */}
                <div className={styles.calculatorArea}>

                    <div className={styles.mathEquation}>
                        <input
                            type="number"
                            value={leftOperand}
                            onChange={e => setLeftOperand(parseInt(e.target.value) || 0)}
                            className={styles.numInput}
                        />

                        <div className={styles.operatorGear}>
                            {operator}
                        </div>

                        <input
                            type="number"
                            value={rightOperand}
                            onChange={e => setRightOperand(parseInt(e.target.value) || 0)}
                            className={styles.numInput}
                        />

                        <div className={styles.equals}>=</div>

                        <div className={styles.resultDisplay}>
                            {result}
                        </div>
                    </div>

                    <div className={styles.explanationText}>
                        💡 {calculationNote}
                    </div>

                    {/* 연산자 선택기 */}
                    <div className={styles.operatorSelector}>
                        <p>연산자를 바꿔보세요:</p>
                        <div className={styles.opButtons}>
                            {OPERATORS.map(opObj => (
                                <button
                                    key={opObj.op}
                                    className={`${styles.opBtn} ${operator === opObj.op ? styles.active : ''}`}
                                    onClick={() => setOperator(opObj.op)}
                                    title={opObj.desc}
                                >
                                    {opObj.op} <span className={styles.opLabel}>{opObj.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.visualizerContainer}>
                        <h4>🎨 시각화</h4>
                        {renderVisualizer()}
                    </div>

                </div>
            </div>
        </div>
    );
}
