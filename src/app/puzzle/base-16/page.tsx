'use client';

import React, { useState } from 'react';
import styles from './base.module.css';
import Link from 'next/link';

const SEQUENCE_DATA = [
  { val: "10", base: 16 },
  { val: "11", base: 15 },
  { val: "12", base: 14 },
  { val: "13", base: 13 },
  { val: "14", base: 12 },
  { val: "15", base: 11 },
  { val: "16", base: 10 },
  { val: "17", base: 9 },
  { val: "20", base: 8 },
  { val: "22", base: 7 },
  { val: "24", base: 6 },
  { val: "31", base: 5 },
  { val: "100", base: 4 },
  { val: "121", base: 3 }
];

const TARGET_BASE = 2;
const TARGET_ANSWER = "10000";

export default function Base16SequencePage() {
  const [inputValue, setInputValue] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() === TARGET_ANSWER) {
      setIsSuccess(true);
    } else {
      if (hintLevel < 3) {
        setHintLevel(prev => prev + 1);
      }
    }
  };

  const showBaseHints = hintLevel >= 2;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>🛸 76. 다음에 올 수</h1>
        <p className={styles.subtitle}>
          외계인의 암호처럼 보이는 이 숫자들의 진짜 모습을 찾아보세요!
        </p>
      </header>

      <div className={styles.mainCard}>
        {!isSuccess ? (
          <>
            <div className={styles.sequenceGrid}>
              {SEQUENCE_DATA.map((item, idx) => (
                <div key={idx} className={styles.sequenceItem}>
                  {showBaseHints && <span className={styles.baseLabel}>{item.base}진법</span>}
                  {item.val}
                </div>
              ))}
              <div className={`${styles.sequenceItem} ${styles.questionMark}`}>
                ?
              </div>
            </div>

            <div className={styles.inputSection}>
              <form onSubmit={handleSubmit}>
                <div className={styles.inputLabel}>마지막 빈칸('?')에 들어갈 숫자는 무엇일까요?</div>
                <input
                  type="tel"
                  className={styles.inputField}
                  placeholder="?"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value.replace(/[^0-9]/g, ''))}
                  autoFocus
                />
                <button type="submit" className={styles.submitButton}>정답 확인!</button>
              </form>

              <div className={styles.hintWrapper}>
                {hintLevel === 0 && (
                  <button type="button" className={styles.hintButton} onClick={() => setHintLevel(1)}>
                    💡 힌트 요정 소환하기
                  </button>
                )}
                {hintLevel >= 1 && (
                  <div className={styles.hintText}>
                    힌트 1: 숫자들이 자꾸 모양을 바꾸고 있지만, 사실 모두 **"사탕 16개"**를 의미하고 있답니다! 😲
                  </div>
                )}
                {hintLevel >= 2 && (
                  <div className={styles.hintText} style={{ marginTop: '0.5rem' }}>
                    힌트 2: 각 숫자의 오른쪽 위에 조그만 '힌트 스티커(진법)'가 붙었어요! 확인해볼까요?
                  </div>
                )}
                {hintLevel >= 3 && (
                  <div className={styles.hintText} style={{ marginTop: '0.5rem', backgroundColor: '#e8f8f5', color: '#1abc9c' }}>
                    결정적 힌트: '2진법' 나라에서는 16을 어떻게 표현할까요? (2의 네제곱!)
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className={styles.successScreen}>
            <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🎉</div>
            <h2 className={styles.successTitle}>완벽한 정답입니다! (10000)</h2>
            <p style={{ fontSize: '1.2rem', color: '#7f8c8d', marginBottom: '1rem' }}>
              이 수열의 정체는 <strong>숫자 '16'</strong>을 16진법부터 2진법까지 순서대로 표현한 것이랍니다!
            </p>

            <div className={styles.explanationCard}>
              <div className={styles.explanationTitle}>진법의 마법 🪄</div>
              <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
                우리가 평소에 쓰는 숫자는 <strong>10진법</strong>(10개가 모이면 다음 자리로 넘어감)이에요. 그래서 당연히 <strong>16</strong>이라고 쓰죠!<br />
                하지만 다른 나라(진법)에서는 다르게 말해요:
              </p>
              
              <div className={styles.baseEquation}>
                <strong>8진법의 나라:</strong> 20 👉 (8개가 2묶음, 낱개 0개) = 16
              </div>
              <div className={styles.baseEquation}>
                <strong>3진법의 나라:</strong> 121 👉 (9개가 1묶음, 3개가 2묶음, 낱개 1개) = 16
              </div>
              <div className={styles.baseEquation} style={{ backgroundColor: '#2ecc71', color: 'white' }}>
                <strong>2진법의 나라:</strong> 10000 👉 (16개가 1묶음, 나머지 0개) = 16 !!
              </div>
              
              <p style={{ marginTop: '1.5rem', fontWeight: 'bold', color: '#8e44ad' }}>
                세상의 기준(진법)이 바뀌어 모습이 변해도, 그 본질(사탕 16개)은 변하지 않는답니다. 
                시후는 이 멋진 진법의 세계관을 이해한 거예요!
              </p>
            </div>

            <Link href="/puzzles" className={styles.navButton}>
              다른 수학 퍼즐 풀기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
