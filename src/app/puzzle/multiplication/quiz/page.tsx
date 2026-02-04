'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../page.module.css'; // Reuse base styles or create new
import { ALPHABET, generateQuiz, MulQuiz, getMultiplicationTable } from '@/lib/puzzles/multiplication';

export default function MultiplicationQuizPage() {
    const [level, setLevel] = useState(1);
    const [quiz, setQuiz] = useState<MulQuiz | null>(null);
    const [userInput, setUserInput] = useState('');
    const [result, setResult] = useState<'correct' | 'wrong' | null>(null);
    const [showTable, setShowTable] = useState(false);

    // Initialize quiz
    useEffect(() => {
        setQuiz(generateQuiz(level));
    }, [level]);

    if (!quiz) return <div>Loading...</div>;

    const table = getMultiplicationTable(quiz.key);

    const checkAnswer = () => {
        if (userInput.toUpperCase().trim() === quiz.plainText) {
            setResult('correct');
        } else {
            setResult('wrong');
        }
    };

    const nextQuiz = () => {
        setUserInput('');
        setResult(null);
        if (result === 'correct') {
            // Stay on same level or increase? Just random for now.
            setQuiz(generateQuiz(level));
        } else {
            setQuiz(generateQuiz(level));
        }
    };

    return (
        <div className={styles.container}>
            <Link href="/puzzle/multiplication" style={{ textDecoration: 'none', color: '#666', marginBottom: '1rem', display: 'inline-block' }}>
                ← 돌아가기
            </Link>

            <div className={styles.intro}>
                <h1>🕵️ 스파이 암호 해독 (Quiz)</h1>
                <p>암호문을 해독하여 비밀 메시지를 찾아내세요!</p>
            </div>

            <div className={styles.section}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2> intercepted_message_v{quiz.id}.txt </h2>
                    <div style={{
                        fontSize: '3rem',
                        letterSpacing: '0.5rem',
                        fontWeight: 'bold',
                        color: '#d63031',
                        margin: '1rem 0'
                    }}>
                        {quiz.cipherText}
                    </div>

                    <div style={{ background: '#eee', padding: '1rem', borderRadius: '8px', display: 'inline-block' }}>
                        <strong>🔑 암호 키 (Key): {quiz.key}</strong>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="정답 입력 (예: CAT)"
                        style={{
                            fontSize: '1.5rem',
                            padding: '0.5rem',
                            textAlign: 'center',
                            width: '200px',
                            border: '2px solid #6c5ce7',
                            borderRadius: '8px'
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                    />
                    <button
                        onClick={checkAnswer}
                        className={styles.controlButton}
                    >
                        해독하기
                    </button>
                </div>

                {result === 'correct' && (
                    <div style={{ textAlign: 'center', animation: 'popIn 0.5s' }}>
                        <h2 className={styles.statusGood}>🎉 정답입니다!</h2>
                        <p>원본 단어: {quiz.plainText}</p>
                        <button onClick={nextQuiz} className={styles.controlButton} style={{ marginTop: '1rem' }}>
                            다음 문제 →
                        </button>
                    </div>
                )}

                {result === 'wrong' && (
                    <div style={{ textAlign: 'center', color: '#d63031' }}>
                        <p>틀렸습니다. 다시 시도해보세요!</p>
                    </div>
                )}
            </div>

            <div className={styles.section}>
                <h3 className={styles.sectionTitle} style={{ cursor: 'pointer' }} onClick={() => setShowTable(!showTable)}>
                    {showTable ? '🔽 해독 도구 (암호표) 숨기기' : '▶️ 해독 도구 (암호표) 펼치기'}
                </h3>

                {showTable && (
                    <div className={styles.mappingTable}>
                        {table.map((item) => (
                            <div
                                key={item.char}
                                className={styles.mappingItem}
                                style={{
                                    // Highlight clues if cipher text contains this encrypted char
                                    background: quiz.cipherText.includes(item.encryptedChar) ? '#ffeaa7' : 'white',
                                    borderColor: quiz.cipherText.includes(item.encryptedChar) ? '#fdcb6e' : '#dfe6e9'
                                }}
                            >
                                {/* 
                   For decryption, users look at the Encrypted char (Bottom/Blue)
                   and find the Original char (Top/Grey).
                */}
                                <span className={styles.encrypted}>{item.encryptedChar}</span>
                                <span className={styles.arrow}>↑</span>
                                <span className={styles.original}>{item.char}</span>
                            </div>
                        ))}
                    </div>
                )}
                <p className={styles.description}>
                    암호표를 보고 빨간색 암호 글자({quiz.cipherText})가 원래 무슨 글자였는지 찾아보세요!
                    <br />
                    (예: 암호문이 'D'라면, 표에서 파란색 D를 찾고 그 위의 회색 글자를 읽으세요!)
                </p>
            </div>
        </div>
    );
}
