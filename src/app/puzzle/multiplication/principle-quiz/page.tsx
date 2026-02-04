'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { ALPHABET, getMultiplicationTable, CipherResult } from '@/lib/puzzles/multiplication';

// Define a simple quiz type
interface PrincipleQuiz {
    originalChar: string; // The char to encrypt
    key: number; // The multiplier (e.g. 3)
    correctAnswer: string; // The encrypted char
}

const QUIZZES: PrincipleQuiz[] = [
    { originalChar: 'B', key: 3, correctAnswer: 'D' }, // 1 * 3 = 3 (D)
    { originalChar: 'C', key: 3, correctAnswer: 'G' }, // 2 * 3 = 6 (G)
    { originalChar: 'H', key: 3, correctAnswer: 'V' }, // 7 * 3 = 21 (V)
    { originalChar: 'A', key: 5, correctAnswer: 'A' }, // 0 * 5 = 0 (A)
    { originalChar: 'B', key: 5, correctAnswer: 'F' }, // 1 * 5 = 5 (F)
];

export default function PrincipleQuizPage() {
    const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

    const quiz = QUIZZES[currentQuizIdx];
    const table = getMultiplicationTable(quiz.key);

    // States for line drawing
    const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const originalRef = useRef<HTMLDivElement>(null);
    const encryptedRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Reset state on new quiz
        setUserInput('');
        setIsCorrect(null);
    }, [currentQuizIdx]);

    useEffect(() => {
        // Update SVG dimensions on mount/resize
        const updateSize = () => {
            if (containerRef.current) {
                setSvgDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight
                });
            }
        };
        window.addEventListener('resize', updateSize);
        updateSize();
        // Use a timeout to ensure DOM is fully rendered for refs
        setTimeout(updateSize, 100);
        return () => window.removeEventListener('resize', updateSize);
    }, [currentQuizIdx]);

    const getLineCoordinates = () => {
        if (!originalRef.current || !encryptedRef.current || !containerRef.current) return null;

        const containerRect = containerRef.current.getBoundingClientRect();
        const origRect = originalRef.current.getBoundingClientRect();
        const encRect = encryptedRef.current.getBoundingClientRect();

        return {
            x1: (origRect.left + origRect.width / 2) - containerRect.left,
            y1: (origRect.top + origRect.height / 2) - containerRect.top,
            x2: (encRect.left + encRect.width / 2) - containerRect.left,
            y2: (encRect.top + encRect.height / 2) - containerRect.top,
        };
    };

    const coords = getLineCoordinates();
    // We only show the line if it's correct or for the "Active" mapping in visualization?
    // User wants: arrow connecting original to encrypted.
    // Let's show the arrow for the CURRENT TARGET quiz only? 
    // No, the user has to GUESS the answer. So showing the arrow gives away the answer.
    // Ah, the user request says: "곱셈암호 원리를 이해할 수 있게 표가 나와야 함. 그리고 원문이랑 암호부분 스펠링이랑 화살표로 이어져야함"
    // Maybe it means: Show the full table mapping with arrows to validte/explain?
    // OR: Show the arrow for the specific question AFTER they answer?
    // Let's assume: The table is a tool. We show arrows for ALL mappings? Too messy.
    // Re-reading: "원문이랑 암호부분 스펠링이랑 화살표로 이어져야함"
    // Let's implement: When the user HOVERS or after they ANSWER, we draw the line.
    // BUT: If it's a quiz to "Understand the principle", maybe we ask: "Where does 'B' go?" 
    // And the table is there but the line for 'B' is missing? 
    // Actually, let's show the arrow for the *entire* table but highlight the current question's char?
    // Use case: Teach "B(1) * 3 = 3(D)". 
    // Let's show two columns: Plain Alphabet | Encrypted Alphabet.
    // And draw lines between them.

    // Let's just draw lines for a few sample items to keep it clean, or just the target one if revealed.
    // Let's draw the line for the *Question Char* (Start) -> *Question Char* (End) logic?
    // Wait, if I draw the line, I reveal the answer.
    // So: Initially, only show the "Start" node (Original).
    // Once answered (or if user asks hint), animate the arrow to the "End" node (Encrypted).

    const checkAnswer = () => {
        if (userInput.toUpperCase() === quiz.correctAnswer) {
            setIsCorrect(true);
        } else {
            setIsCorrect(false);
        }
    };

    const handleNext = () => {
        setCurrentQuizIdx((prev) => (prev + 1) % QUIZZES.length);
    };

    // Find index for the current quiz char to highlight
    const originalIndex = ALPHABET.indexOf(quiz.originalChar);
    const correctTargetIndex = ALPHABET.indexOf(quiz.correctAnswer);

    return (
        <div className={styles.quizContainer}>
            <Link href="/puzzle/multiplication" style={{ textDecoration: 'none', color: '#666', marginBottom: '1rem', display: 'inline-block' }}>
                ← 돌아가기
            </Link>

            <h1>📐 곱셈 암호 원리 퀴즈</h1>
            <p>
                알파벳에 <strong>Key({quiz.key})</strong>를 곱하면 어떤 글자가 될까요?
                <br />
                수식: <code>( index × {quiz.key} ) % 26</code>
            </p>

            <div className={styles.inputArea}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                    {quiz.originalChar}
                    <span style={{ fontSize: '1rem', color: '#888' }}>({originalIndex})</span>
                    {' '} × {quiz.key} {' '} → {' '} ?
                </div>
            </div>

            <div className={styles.inputArea}>
                <input
                    className={styles.inputBox}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value.toUpperCase())}
                    placeholder="?"
                    maxLength={1}
                />
                <button className={styles.submitBtn} onClick={checkAnswer}>확인</button>
            </div>

            {/* Message */}
            {isCorrect === true && (
                <div style={{ marginTop: '1rem', color: '#00b894', fontWeight: 'bold' }}>
                    🎉 정답입니다! 화살표를 보세요!
                    <br />
                    <button onClick={handleNext} className={styles.submitBtn} style={{ marginTop: '0.5rem', background: '#0984e3' }}>
                        다음 문제
                    </button>
                </div>
            )}
            {isCorrect === false && <div style={{ marginTop: '1rem', color: '#d63031' }}>❌ 다시 계산해보세요!</div>}


            {/* Visualization Area */}
            <div style={{ position: 'relative', marginTop: '3rem' }} ref={containerRef}>

                {/* SVG Overlay for Arrows */}
                <svg className={styles.svgContainer} style={{ width: '100%', height: '100%' }}>
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#6c5ce7" />
                        </marker>
                    </defs>
                    {/* Draw line only if correct to reveal the path visually */}
                    {isCorrect && coords && (
                        <line
                            x1={coords.x1}
                            y1={coords.y1}
                            x2={coords.x2}
                            y2={coords.y2}
                            className={styles.arrowLine}
                            strokeDasharray="5,5"
                        >
                            <animate attributeName="stroke-dashoffset" from="100" to="0" dur="1s" />
                        </line>
                    )}
                </svg>

                {/* Two Columns: Original vs Encrypted */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '150px' }}>

                    {/* Column 1: Original */}
                    <div className={styles.column}>
                        <h3>원본 (Original)</h3>
                        {ALPHABET.split('').map((char, idx) => (
                            <div
                                key={`orig-${char}`}
                                className={`${styles.cell} ${char === quiz.originalChar ? styles.active : ''}`}
                                ref={char === quiz.originalChar ? originalRef : null}
                            >
                                {char} <span style={{ fontSize: '0.7em', color: '#888', marginLeft: '4px' }}>({idx})</span>
                            </div>
                        ))}
                    </div>

                    {/* Column 2: Encrypted (Mapped by Key) 
                Wait, standard view is usually 0..25 on both sides.
                Let's show 0..25 on right side too.
            */}
                    <div className={styles.column}>
                        <h3>암호 (Encrypted)</h3>
                        {ALPHABET.split('').map((char, idx) => {
                            const isTarget = char === quiz.correctAnswer;
                            return (
                                <div
                                    key={`enc-${char}`}
                                    className={`${styles.cell} ${isTarget && isCorrect ? styles.active : ''}`}
                                    ref={isTarget ? encryptedRef : null}
                                    style={{ backgroundColor: isTarget && isCorrect ? '#81ecec' : 'white' }}
                                >
                                    {char} <span style={{ fontSize: '0.7em', color: '#888', marginLeft: '4px' }}>({idx})</span>
                                </div>
                            );
                        })}
                    </div>

                </div>
            </div>
        </div>
    );
}
