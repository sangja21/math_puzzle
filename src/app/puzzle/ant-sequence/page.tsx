'use client';

import React, { useState } from 'react';
import styles from './ant.module.css';
import Link from 'next/link';

const ANT_SEQUENCE = [
  "1",
  "11",
  "21",
  "1211",
  "111221",
  "312211",
  "13112221",
  "1113213211", // 8단계 정답
];

export default function AntSequencePage() {
  const [visibleSteps, setVisibleSteps] = useState(1);
  const [inputValue, setInputValue] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);

  const handleNext = () => {
    if (visibleSteps < 7) {
      setVisibleSteps(prev => prev + 1);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inputValue.trim() === ANT_SEQUENCE[7]) {
      setIsSuccess(true);
    } else {
      setWrongCount(prev => prev + 1);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>🐜 개미수열의 비밀</h1>
        <p className={styles.subtitle}>
          위에서부터 차례대로 규칙을 찾아보세요! 베르나르 베르베르의 소설에 등장하는 유명한 수열입니다.
        </p>
      </header>

      <div className={styles.mainCard}>
        {!isSuccess ? (
          <>
            <div className={styles.sequenceContainer}>
              {ANT_SEQUENCE.slice(0, visibleSteps).map((seq, index) => (
                <div key={index} className={styles.sequenceRow}>
                  <div className={styles.stepLabel}>{index + 1}단계:</div>
                  <div className={styles.sequenceValue}>{seq}</div>
                </div>
              ))}
            </div>

            {visibleSteps < 7 && (
              <button 
                className={styles.nextButton} 
                onClick={handleNext}
              >
                다음 힌트 열기 (클릭!)
              </button>
            )}

            {visibleSteps === 7 && (
              <div className={styles.inputSection}>
                <div className={styles.inputTitle}>
                  과연 8단계의 숫자는 무엇일까요?
                </div>
                <form onSubmit={handleSubmit}>
                  <input
                    type="tel"
                    className={styles.inputField}
                    placeholder="숫자를 입력하세요"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value.replace(/[^0-9]/g, ''))}
                    maxLength={15}
                    autoFocus
                  />
                  <br />
                  <button type="submit" className={styles.submitButton}>
                    정답 확인!
                  </button>
                </form>

                {wrongCount > 0 && (
                  <div className={styles.hintBox}>
                    💡 틀렸어요! 힌트: 이전 단계를 천천히 "소리내어" 읽어보세요.<br/>
                    (예: '1'이 세 개면 31, '2'가 두 개면 22)
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className={styles.successScreen}>
            <div className={styles.successIcon}>🎉</div>
            <h2 className={styles.successTitle}>정답입니다! 완벽해요!</h2>
            <p className={styles.successText}>
              맞아요! 7단계 (13112221)를 읽어보면:<br/>
              1이 1개, 3이 1개, 1이 2개, 2가 3개, 1이 1개<br/>
              👉 <strong>11 13 21 32 11</strong> 이 된답니다!<br/><br/>
              패턴을 정확히 파악하는 멋진 능력을 가졌군요!
            </p>

            <Link href="/puzzles" style={{ display: 'inline-block', marginTop: '2rem', textDecoration: 'none' }}>
              <button className={styles.submitButton}>다른 퍼즐 풀러 가기</button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
