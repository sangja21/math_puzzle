'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import {
    ALPHABET,
    getEuclidTiling,
    gcd,
    isCoprime,
    getMultiplicationTable,
    analyzeCollisions,
    EuclidRect,
    CipherResult
} from '@/lib/puzzles/multiplication';

// --- Components ---

// 1. Modulo Carousel
const Carousel = () => {
    const [number, setNumber] = useState(0);
    const [rotation, setRotation] = useState(0);

    const handleAdd = (val: number) => {
        const next = number + val;
        setNumber(next);
        // 각 숫자당 360/26도 회전. 음수 방향으로 회전해야 시계방향 증가 효과
        setRotation(rotation - val * (360 / 26));
    };

    const currentMod = ((number % 26) + 26) % 26; // handle negative
    const currentLetter = ALPHABET[currentMod];

    return (
        <div className={styles.carouselContainer}>
            <div className={styles.activeNumber}>
                {number} = <span style={{ color: '#d63031' }}>{currentLetter}</span> ({currentMod})
            </div>

            <div className={styles.canvasWrapper}>
                <div className={styles.pointer} />
                <div
                    className={styles.wheel}
                    style={{ transform: `rotate(${rotation}deg)` }}
                >
                    {ALPHABET.split('').map((char, i) => {
                        const angle = i * (360 / 26);
                        // 숫자를 정방향으로 보이게 하기 위해 역회전 적용
                        return (
                            <div
                                key={i}
                                className={styles.wheelNumber}
                                style={{
                                    transform: `rotate(${angle}deg) translate(0, -130px) rotate(${-angle}deg)`
                                }}
                            >
                                {char}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className={styles.controls}>
                <button className={styles.controlButton} onClick={() => handleAdd(1)}>+1칸</button>
                <button className={styles.controlButton} onClick={() => handleAdd(5)}>+5칸</button>
                <button className={styles.controlButton} onClick={() => handleAdd(26)}>+26칸 (한바퀴)</button>
                <button className={styles.controlButton} onClick={() => { setNumber(0); setRotation(0); }}>초기화</button>
            </div>
            <p style={{ marginTop: '1rem', color: '#666' }}>
                숫자가 아무리 커져도, 26칸을 돌면 제자리로 돌아와요! <br />
                이것을 수학에서는 <strong>나머지 연산 (Modulo)</strong> 이라고 해요.
            </p>
        </div>
    );
};

// 2. Euclid Tiling Block
const MagicBlock = () => {
    const [width, setWidth] = useState(26); // Default 26 (Alphabet count)
    const [height, setHeight] = useState(8);

    const rects = useMemo(() => getEuclidTiling(width, height), [width, height]);
    const currentGCD = useMemo(() => gcd(width, height), [width, height]);
    const isSafe = currentGCD === 1;

    // Colors based on loop index
    const colors = ['#ffeaa7', '#81ecec', '#fab1a0', '#74b9ff', '#a29bfe'];

    return (
        <div className={styles.section}>
            <h2 className={styles.sectionTitle}>🧩 마법의 블록 (서로소 확인)</h2>

            <div className={styles.description}>
                <p>
                    <strong>목표:</strong> 직사각형을 최대한 큰 <strong>정사각형</strong>으로 채워보세요.
                    <br />마지막에 남는 정사각형이 <strong>1칸(1x1)</strong> 크기여야 좋은 암호 키(서로소)입니다!
                </p>
            </div>

            <div className={styles.inputGroup} style={{ justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: '#666' }}>알파벳 개수 (가로)</label>
                    <input type="number" value={width} readOnly style={{ background: '#eee', fontSize: '1.2rem', padding: '0.5rem', width: '80px', textAlign: 'center', border: '1px solid #ddd', borderRadius: '4px' }} />
                </div>
                <div style={{ fontSize: '1.5rem', color: '#b2bec3' }}>&times;</div>
                <div style={{ textAlign: 'center' }}>
                    <label style={{ display: 'block', fontSize: '0.9rem', color: '#666' }}>나의 암호 키 (세로)</label>
                    <input
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(Math.max(1, parseInt(e.target.value) || 1))}
                        style={{ fontSize: '1.2rem', padding: '0.5rem', width: '80px', textAlign: 'center', border: '2px solid #6c5ce7', borderRadius: '4px', color: '#6c5ce7', fontWeight: 'bold' }}
                    />
                </div>
            </div>

            <div className={styles.tilingContainer} style={{ background: '#f5f6fa', height: 'auto', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                {/* Canvas-like scaling logic inside render */}
                <AutoScaledTiling width={width} height={height} rects={rects} colors={colors} />
            </div>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <h3>
                    마지막 블록 크기 = <span style={{ color: '#d63031', fontSize: '1.5em' }}>{currentGCD}</span>
                </h3>
                {isSafe ? (
                    <div className={styles.statusGood} style={{ fontSize: '1.1rem' }}>
                        ✨ 빙고! 1칸짜리로 딱 떨어집니다! (서로소 O) <br />
                        이 숫자는 암호 키로 <strong>사용할 수 있어요.</strong>
                    </div>
                ) : (
                    <div className={styles.statusBad} style={{ fontSize: '1.1rem' }}>
                        💥 앗! {currentGCD}칸짜리 덩어리가 남았어요. (서로소 X) <br />
                        이 숫자는 겹치는 글자가 생겨서 <strong>사용할 수 없어요!</strong>
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper component for scaling
const AutoScaledTiling = ({ width, height, rects, colors }: { width: number, height: number, rects: EuclidRect[], colors: string[] }) => {
    // Determine scale to fit in a 600x300 box (approx)
    const MAX_W = 600;
    const MAX_H = 300;

    // Calculate raw aspect ratio
    const scaleX = MAX_W / width;
    const scaleY = MAX_H / height;
    const scale = Math.min(scaleX, scaleY, 40); // Cap max scale so small numbers aren't huge

    const totalW = width * scale;
    const totalH = height * scale;

    return (
        <div style={{
            position: 'relative',
            width: totalW,
            height: totalH,
            border: '2px solid #2d3436',
            background: 'white',
            boxShadow: '5px 5px 15px rgba(0,0,0,0.1)'
        }}>
            {/* Dimension Labels */}
            <div style={{ position: 'absolute', top: '-25px', left: '0', width: '100%', textAlign: 'center', fontWeight: 'bold', color: '#2d3436' }}>
                {width}
            </div>
            <div style={{ position: 'absolute', left: '-30px', top: '0', height: '100%', display: 'flex', alignItems: 'center', fontWeight: 'bold', color: '#6c5ce7' }}>
                {height}
            </div>

            {rects.map((r, i) => (
                <div
                    key={i}
                    className={styles.tile} // utilizing existing CSS animation
                    style={{
                        left: r.x * scale,
                        top: r.y * scale,
                        width: r.size * scale,
                        height: r.size * scale,
                        backgroundColor: colors[r.colorIndex % colors.length],
                        border: '1px solid rgba(0,0,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(0,0,0,0.4)',
                        fontSize: scale > 20 ? '0.8rem' : '0'
                    }}
                >
                    {/* Only show number if block is big enough */}
                    {scale * r.size > 25 && r.size}
                </div>
            ))}
        </div>
    );
};
// 3. Cipher Machine
const CipherMachine = () => {
    const [key, setKey] = useState(3);
    const table = useMemo(() => getMultiplicationTable(key), [key]);
    const collisions = useMemo(() => analyzeCollisions(key), [key]);
    const hasCollisions = collisions.size > 0;

    return (
        <div className={styles.section}>
            <h2 className={styles.sectionTitle}>🔐 곱셈 암호 기계</h2>
            <div className={styles.description}>
                이제 실제로 암호를 만들어볼까요? <br />
                나의 마법 숫자(Key)를 입력하면: <code>(원래 숫자 × Key) % 26</code> <br />
                규칙으로 글자가 바뀝니다.
            </div>

            <div className={styles.cipherContainer}>
                <div className={styles.cipherControls}>
                    <div className={styles.rangeInputs}>
                        <label>마법 숫자 (Key) 조절: {key}</label>
                        <input
                            type="range"
                            min="1"
                            max="25"
                            value={key}
                            onChange={(e) => setKey(parseInt(e.target.value))}
                            style={{ width: '100%', marginTop: '0.5rem' }}
                        />
                    </div>
                    <div className={styles.keyDisplay}>
                        <h3>Key = {key}</h3>
                        {hasCollisions ? (
                            <span className={styles.statusBad}>사용 불가! (충돌 발생)</span>
                        ) : (
                            <span className={styles.statusGood}>사용 가능! (완벽함)</span>
                        )}
                    </div>
                </div>

                {hasCollisions && (
                    <div className={styles.collisionAlert}>
                        ⚠️ 경고! 같은 글자로 변하는 친구들이 있어요. 이러면 해독할 수 없어요!
                        <br />
                        (26과 {key}의 공약수: {gcd(26, key)})
                    </div>
                )}

                <div className={styles.mappingTable}>
                    {table.map((item) => {
                        const isCollided = collisions.has(item.encryptedChar);
                        return (
                            <div
                                key={item.char}
                                className={`${styles.mappingItem} ${isCollided ? styles.collision : ''}`}
                            >
                                <span className={styles.original}>{item.char}</span>
                                <span className={styles.arrow}>↓</span>
                                <span className={styles.encrypted}>{item.encryptedChar}</span>
                            </div>
                        );
                    })}
                </div>

                {hasCollisions && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: '#ffeaa7', borderRadius: '8px' }}>
                        <strong>💡 힌트:</strong> 짝수(2, 4...)나 13의 배수를 피해보세요!
                        홀수 중에서도 13을 제외한 숫자를 찾아보세요 (1, 3, 5, 7, 9, 11...).
                    </div>
                )}
            </div>
        </div>
    );
};

export default function MultiplicationPage() {
    return (
        <div className={styles.container}>
            <Link href="/" style={{ textDecoration: 'none', color: '#666', marginBottom: '1rem', display: 'inline-block' }}>
                ← 메인으로 돌아가기
            </Link>

            <div className={styles.intro}>
                <h1>🚀 곱셈 암호 탐험대</h1>
                <p>
                    단순한 더하기 암호(카이사르)는 이제 그만! <br />
                    더 강력한 <strong>곱하기 암호</strong>를 만들기 위한 모험을 떠나요.
                </p>
            </div>

            {/* Chapter 1 */}
            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>🎠 1장: 회전목마의 비밀 (Modulo)</h2>
                <div className={styles.description}>
                    알파벳은 A부터 Z까지 26개밖에 없어요. <br />
                    숫자가 26보다 커지면 어떻게 해야 할까요? <br />
                    회전목마처럼 뱅글뱅글 돌아서 다시 처음으로 돌아오면 된답니다!
                </div>
                <Carousel />
            </div>

            {/* Chapter 2 */}
            <MagicBlock />

            {/* Chapter 3 */}
            <CipherMachine />

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>🎯 실전 도전! (Challenge Modes)</h2>
                <div className={styles.description}>
                    지금까지 배운 내용을 바탕으로 퀴즈를 풀어보세요!
                </div>
                <div className={styles.challengeContainer} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                    <Link href="/puzzle/multiplication/principle-quiz" className={styles.challengeCard}>
                        <div style={{ fontSize: '3rem' }}>📏</div>
                        <h3>원리 퀴즈</h3>
                        <p>화살표를 따라가며 곱셈 암호의 원리를 익혀보세요!</p>
                    </Link>
                    <Link href="/puzzle/multiplication/quiz" className={styles.challengeCard}>
                        <div style={{ fontSize: '3rem' }}>🕵️</div>
                        <h3>스파이 암호 해독</h3>
                        <p>암호문을 해독하여 비밀 메시지를 찾으세요!</p>
                    </Link>
                    <Link href="/puzzle/multiplication/block-coding" className={styles.challengeCard}>
                        <div style={{ fontSize: '3rem' }}>🤖</div>
                        <h3>모듈로 로봇</h3>
                        <p>블록코딩으로 로봇을 목표 지점으로 옮기세요!</p>
                    </Link>
                    <Link href="/puzzle/multiplication/brute-force" className={styles.challengeCard} style={{ borderColor: '#00ff00', background: '#e0ffe0' }}>
                        <div style={{ fontSize: '3rem' }}>💻</div>
                        <h3>해커 모드</h3>
                        <p>모든 키를 대입하여(Brute Force) 암호를 뚫으세요!</p>
                    </Link>
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>🎉 결론</h2>
                <div className={styles.description}>
                    곱셈 암호를 만들 때는 <strong>26과 서로소인 숫자</strong>만 Key로 써야 해요! <br />
                    그래야 모든 알파벳이 겹치지 않고 골고루 바뀐답니다. <br />
                    이제 친구에게 오직 나만 아는 '마법 숫자'로 비밀 편지를 보내보세요!
                </div>
            </div>
        </div>
    );
}
