'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import styles from './machin.module.css';

// Constants
// 1000 digits of Pi
const TARGET_PI_STRING = "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989";
const PRECISION_DIGITS = 1000;
const BIG_INT_SCALE = 10n ** BigInt(PRECISION_DIGITS + 20); // Extra precision

// Math Logic: Calculate Pi using Machin's Formula
// Pi/4 = 4 * arctan(1/5) - arctan(1/239)
// Pi = 16 * arctan(1/5) - 4 * arctan(1/239)

// Arctan Taylor Series: arctan(1/x) = 1/x - 1/(3x^3) + 1/(5x^5) - ...
// We use BigInt for fixed-point arithmetic
const calculateMachinPi = (steps: number) => {
    if (steps === 0) return "3.";

    // Real implementation of the series sum
    // term_0 = 1/x
    // term_1 = -1/(3x^3)
    // ...
    // We can optimize: next_val = prev_val / x^2

    const computeArctanScaled = (invX: number, n: number): bigint => {
        const bigInvX = BigInt(invX);
        const bigInvXSq = bigInvX * bigInvX;
        let sum = 0n;
        let currentPower = BIG_INT_SCALE / bigInvX; // First term: 1/x * SCALE

        for (let i = 0; i < n; i++) {
            const denominator = BigInt(2 * i + 1);
            const term = currentPower / denominator; // term = (1/x^(2i+1)) / (2i+1)

            if (i % 2 === 0) {
                sum += term;
            } else {
                sum -= term;
            }

            // Prepare next power: current / x^2
            currentPower = currentPower / bigInvXSq;

            // Optimization: Break if term is 0 (precision limit reached)
            if (currentPower === 0n) break;
        }
        return sum;
    };

    const term1 = computeArctanScaled(5, steps);
    const term2 = computeArctanScaled(239, steps);

    // Pi = 16 * term1 - 4 * term2
    const piBig = (16n * term1) - (4n * term2);

    // Format to string
    let piStr = piBig.toString();
    // Adjust length if leading zeros (unlikely for Pi)
    // The Scale has +10 extra digits, so we slice.
    const integerPart = piStr.slice(0, 1); // "3"
    const decimalPart = piStr.slice(1, 1 + PRECISION_DIGITS);

    return `${integerPart}.${decimalPart}`;
};

export default function MachinPuzzlePage() {
    // Game State
    const [stage, setStage] = useState<'intro' | 'visualizer'>('intro');
    const [xInput, setXInput] = useState('');
    const [yInput, setYInput] = useState('');
    const [showError, setShowError] = useState(false);

    // Visualization State
    const [iterations, setIterations] = useState(1);
    const [calculatedPi, setCalculatedPi] = useState("3.");
    const [matchingCount, setMatchingCount] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const toggleAutoPlay = () => setIsPlaying(!isPlaying);

    // Auto Play Effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isPlaying && stage === 'visualizer') {
            interval = setInterval(() => {
                setIterations(prev => {
                    if (prev >= 1000) { // Max 1000 iterations
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 20); // Faster animation (20ms)
        }
        return () => clearInterval(interval);
    }, [isPlaying, stage]);

    // Check Solution
    const checkSolution = () => {
        if (xInput === '5' && yInput === '239') {
            setStage('visualizer');
            setShowError(false);
        } else {
            setShowError(true);
            setTimeout(() => setShowError(false), 2000);
        }
    };

    // Update calculation when iterations change
    useEffect(() => {
        if (stage === 'visualizer') {
            const result = calculateMachinPi(iterations);
            setCalculatedPi(result);

            // matches count
            let match = 0;
            // Compare with TARGET_PI_STRING
            // Note: calculated result might be shorter or slightly different due to precision
            // We only compare up to the length of our target string
            for (let i = 0; i < Math.min(result.length, TARGET_PI_STRING.length); i++) {
                if (result[i] === TARGET_PI_STRING[i]) {
                    match++;
                } else {
                    break;
                }
            }
            setMatchingCount(Math.max(0, match - 2)); // Subtract "3." from count
        }
    }, [iterations, stage]);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>The Silent Architect&apos;s Cipher</h1>
                <p className={styles.subtitle}>London, 1706 — John Machin&apos;s Study</p>
            </header>

            <main className={styles.content}>
                {stage === 'intro' ? (
                    <section className={styles.storySection}>
                        <p className={styles.storyText}>
                            비가 추적추적 내리는 런던의 밤. 당신은 왕립학회로 급히 떠난 존 마친의 서재에 홀로 남겨졌습니다.
                            책상 위에는 잉크가 채 마르지 않은 양피지가 놓여 있고, 그 위엔 기묘한 수식과 단서가 적혀 있습니다.
                        </p>
                        <p className={styles.storyText}>
                            &quot;원은 무한하지만, 나는 이 두 숫자로 원을 정복했다.&quot;
                        </p>

                        <div className={styles.formulaContainer}>
                            <span>4 arctan &#40; 1 / </span>
                            <input
                                type="text"
                                className={styles.variableInput}
                                placeholder="x"
                                value={xInput}
                                onChange={(e) => setXInput(e.target.value)}
                                maxLength={3}
                            />
                            <span> &#41; &minus; arctan &#40; 1 / </span>
                            <input
                                type="text"
                                className={styles.variableInput}
                                placeholder="y"
                                value={yInput}
                                onChange={(e) => setYInput(e.target.value)}
                                maxLength={4}
                            />
                            <span> &#41; = &pi; / 4</span>
                        </div>

                        <div className={styles.clueBox}>
                            <p><strong>Clue X (The Hand):</strong> 한 손에 쥔 손가락의 수. 십진법의 절반.</p>
                            <br />
                            <p><strong>Clue Y (The Prime):</strong> 열흘(10 days)의 시간(hours)에서 단 한 시간을 뺀 수. 그것은 고독한 소수(Prime)이다.</p>
                        </div>

                        <button
                            className={styles.checkButton}
                            onClick={checkSolution}
                        >
                            Unlock The Secret ({showError ? "Try Again" : "Verify"})
                        </button>
                    </section>
                ) : (
                    <section className={styles.visualizationSection}>
                        <h2 style={{ color: '#cba135', marginBottom: '1rem', fontFamily: 'Times New Roman' }}>
                            Machin-like Formula Visualization
                        </h2>

                        <div className={styles.piDisplay}>
                            {TARGET_PI_STRING.split('').map((char, idx) => {
                                // Adjust index for "3." prefix
                                const isMatched = idx < (matchingCount + 2); // +2 for "3."

                                // Show calculated digit if matched, otherwise show target digit (dimmed) or ?
                                // For visualization effect: 
                                // We show the CALCULATED string primarily.
                                const calcChar = calculatedPi[idx] || '';
                                const isCorrect = calcChar === char;

                                return (
                                    <span
                                        key={idx}
                                        className={`${styles.piDigit} ${isCorrect ? styles.matched : styles.calculating}`}
                                        style={{ opacity: isCorrect ? 1 : 0.3 }}
                                    >
                                        {isCorrect ? char : (calcChar || char)}
                                    </span>
                                );
                            })}
                        </div>

                        <div className={styles.controls}>
                            <div className={styles.sliderContainer}>
                                <div className={styles.sliderHeader}>
                                    <div className={styles.sliderLabel}>
                                        <span>Recursion Depth (Taylor Terms)</span>
                                        <span>N = {iterations}</span>
                                    </div>
                                    <button
                                        className={`${styles.autoPlayButton} ${isPlaying ? styles.playing : ''}`}
                                        onClick={toggleAutoPlay}
                                    >
                                        {isPlaying ? '❚❚ Pause' : '▶ Auto Play (Max 1000)'}
                                    </button>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="1000"
                                    value={iterations}
                                    onChange={(e) => {
                                        setIterations(parseInt(e.target.value));
                                        setIsPlaying(false);
                                    }}
                                    className={styles.slider}
                                />
                            </div>

                            <div className={styles.statsGrid}>
                                <div className={styles.statItem}>
                                    <div className={styles.statLabel}>Formulas Used</div>
                                    <div className={styles.statValue}>2 (x={xInput}, y={yInput})</div>
                                </div>
                                <div className={styles.statItem}>
                                    <div className={styles.statLabel}>Accurate Digits</div>
                                    <div className={styles.statValue} style={{ color: '#4ade80' }}>
                                        {matchingCount} / {PRECISION_DIGITS}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.explanation}>
                            <h3>🔍 The Mathematics Behind the Curtain</h3>

                            <div className={styles.explanationSection}>
                                <h4>1. Why these numbers? (Tan Addition Formula)</h4>
                                <p>
                                    존 마친은 <strong>탄젠트의 덧셈 정리</strong>를 이용해 {'$\\pi/4$'} (45°)를 쪼개고 싶어했습니다.<br />
                                    {'$\\tan(\\alpha + \\beta) = \\frac{\\tan\\alpha + \\tan\\beta}{1 - \\tan\\alpha\\tan\\beta}$'} 공식을 사용합니다.
                                </p>
                                <div className={styles.mathBlock}>
                                    <p>1. $\arctan(1/5)$를 $\alpha$라고 합시다.</p>
                                    <p>2. 공식을 두 번 써서 $4\alpha$를 계산하면, $\tan(4\alpha) \approx 1.008$이 나옵니다.</p>
                                    <p>3. 이는 1($\tan(\pi/4)$)보다 아주 조금 큽니다!</p>
                                    <p>4. 그 차이(오차)를 계산해보니 정확히 $1/239$이었습니다.</p>
                                    <p className={styles.highlightMath}>
                                        $\therefore 4\arctan(1/5) - \pi/4 = \arctan(1/239)$
                                    </p>
                                </div>
                            </div>

                            <div className={styles.explanationSection}>
                                <h4>2. How does the computer calculate it? (Taylor Series)</h4>
                                <p>
                                    컴퓨터는 각도를 모릅니다. 대신 <strong>무한 급수(Taylor Series)</strong>를 통해 값을 근사합니다.<br />
                                    라이프니츠 급수($\arctan(1)$)는 너무 느리게 수렴하지만, 마친의 공식은 숫자가 작아서($1/5, 1/239$) 매우 빠르게 수렴합니다.
                                </p>
                                <div className={styles.codeBlock}>
                                    <p>arctan(x) = x - x³/3 + x⁵/5 - x⁷/7 ...</p>
                                    <p>------------------------------------------</p>
                                    <p>If x = 1 (Leibniz): 1 - 0.33 + 0.2 - 0.14 ... (Slow 🐢)</p>
                                    <p style={{ color: '#4ade80' }}>If x = 1/5 (Machin): 0.2 - 0.002 + 0.00006 ... (Fast 🐇)</p>
                                </div>
                                <p>
                                    위 슬라이더의 <strong>N</strong>은 이 급수의 항 개수입니다.<br />
                                    단, 50개 항만 계산해도 소수점 100자리까지 정확해집니다!
                                </p>
                            </div>
                        </div>
                    </section>
                )}

                <Link href="/" className={styles.backLink}>
                    ← Back to Puzzle Collection
                </Link>
            </main>
        </div>
    );
}
