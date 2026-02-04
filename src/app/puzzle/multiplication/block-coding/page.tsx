'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from '../page.module.css'; // Reuse base styles
import { BLOCK_PUZZLES } from '@/lib/puzzles/multiplication';

export default function MultiplicationBlockPage() {
    const [level, setLevel] = useState(0);
    // Puzzles defined in lib
    const puzzle = BLOCK_PUZZLES[level] || BLOCK_PUZZLES[0];
    const [currentPos, setCurrentPos] = useState(puzzle.startPos);
    const [message, setMessage] = useState('');
    const [history, setHistory] = useState<number[]>([]);

    // Reset when level changes
    React.useEffect(() => {
        setCurrentPos(puzzle.startPos);
        setHistory([]);
        setMessage('');
    }, [puzzle]);

    const handleMove = (moveAmount: number) => {
        // Animate later? For now just Logic.
        const rawPos = currentPos + moveAmount;
        const nextPos = rawPos % puzzle.modulo;

        setCurrentPos(nextPos);
        setHistory([...history, moveAmount]);

        if (nextPos === puzzle.targetPos) {
            setMessage('🎉 성공! 목표 지점에 도착했습니다.');
        } else {
            setMessage(`이동! 현재 위치: ${nextPos} ( ${currentPos} + ${moveAmount} = ${rawPos} % ${puzzle.modulo} )`);
        }
    };

    const handleReset = () => {
        setCurrentPos(puzzle.startPos);
        setHistory([]);
        setMessage('');
    };

    const nextLevel = () => {
        if (level < BLOCK_PUZZLES.length - 1) {
            setLevel(level + 1);
        } else {
            alert('모든 단계를 완료했습니다!');
        }
    };

    // Visualizing the circular track
    const renderTrack = () => {
        const spots = [];
        const radius = 120;
        const center = 150;

        for (let i = 0; i < puzzle.modulo; i++) {
            const angle = (i * (360 / puzzle.modulo)) - 90; // Start at top
            const radian = angle * (Math.PI / 180);
            const x = center + radius * Math.cos(radian);
            const y = center + radius * Math.sin(radian);

            const isStart = i === puzzle.startPos;
            const isTarget = i === puzzle.targetPos;
            const isCurrent = i === currentPos;

            spots.push(
                <div
                    key={i}
                    style={{
                        position: 'absolute',
                        left: x,
                        top: y,
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: isCurrent ? '#6c5ce7' : (isTarget ? '#ff7675' : '#dfe6e9'),
                        border: isTarget ? '3px solid #d63031' : '1px solid #b2bec3',
                        transform: 'translate(-50%, -50%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        color: isCurrent ? 'white' : '#636e72',
                        boxShadow: isCurrent ? '0 0 15px #6c5ce7' : 'none',
                        zIndex: isCurrent ? 10 : 1
                    }}
                >
                    {i}
                </div>
            );
        }
        return spots;
    };

    return (
        <div className={styles.container}>
            <Link href="/puzzle/multiplication" style={{ textDecoration: 'none', color: '#666', marginBottom: '1rem', display: 'inline-block' }}>
                ← 돌아가기
            </Link>

            <div className={styles.intro} style={{ background: 'linear-gradient(135deg, #a8e6cf 0%, #dcedc1 100%)' }}>
                <h1 style={{ color: '#2d3436' }}>🤖 모듈로 로봇 (Block Coding)</h1>
                <p style={{ color: '#2d3436' }}>로봇에게 명령을 내려 목표 지점으로 이동하세요!</p>
            </div>

            <div className={styles.section}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 className={styles.sectionTitle}>Step {level + 1}</h2>
                    <button className={styles.controlButton} onClick={handleReset} style={{ background: '#b2bec3' }}>
                        🔄 처음부터
                    </button>
                </div>

                <div className={styles.description} style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {puzzle.story} <br />
                    (목표: <span style={{ color: '#d63031' }}>{puzzle.targetPos}번 칸</span>)
                </div>

                <div style={{ position: 'relative', width: '300px', height: '300px', margin: '2rem auto' }}>
                    {renderTrack()}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                        color: '#636e72'
                    }}>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{currentPos}</div>
                        <div>현재 위치</div>
                    </div>
                </div>

                {/* Command Blocks */}
                <div style={{ textAlign: 'center' }}>
                    <h3>명령 블록을 클릭하세요:</h3>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
                        {puzzle.options.map((opt, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleMove(opt)}
                                className={styles.controlButton}
                                style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}
                                disabled={currentPos === puzzle.targetPos}
                            >
                                {opt}칸 이동
                            </button>
                        ))}
                    </div>
                </div>

                {/* Console / Status */}
                <div style={{
                    marginTop: '2rem',
                    padding: '1rem',
                    background: '#2d3436',
                    color: '#55efc4',
                    borderRadius: '8px',
                    minHeight: '60px',
                    fontFamily: 'monospace'
                }}>
                    {history.length > 0 && <div>History: {history.map(h => `+${h}`).join(' ')}</div>}
                    <div>{'>'} {message}</div>
                </div>

                {currentPos === puzzle.targetPos && (
                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <button onClick={nextLevel} className={styles.controlButton} style={{ background: '#00b894' }}>
                            다음 단계 도전! 🚀
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
