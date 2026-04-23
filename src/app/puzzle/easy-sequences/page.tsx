'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './sequences.module.css';
import Link from 'next/link';

const STAGES = [
  { 
    id: 1, 
    name: '개구리의 일정형 점프', 
    emoji: '🐸',
    seq: [3, 7, 11, 15, 19], 
    answer: '23', 
    hint: '숫자 사이의 간격을 살펴보세요! (힌트: 모두 +4 씩 늘어나요!)' 
  },
  { 
    id: 2, 
    name: '마법 세포 무한 분열', 
    emoji: '🦠',
    seq: [2, 6, 18, 54], 
    answer: '162', 
    hint: '앞의 숫자에 얼마를 곱하면 다음 숫자가 될까요? (힌트: x3 씩 곱해져요!)' 
  },
  { 
    id: 3, 
    name: '점점 커지는 달리기 보폭', 
    emoji: '🏃‍♂️',
    seq: [1, 2, 4, 7, 11, 16], 
    answer: '22', 
    hint: '차이가 어떻게 변하는지 적어보세요! (힌트: 차이가 +1, +2, +3... 처럼 1씩 더 커져요!)' 
  },
  { 
    id: 4, 
    name: '자연의 신비 토끼 번식', 
    emoji: '🐰',
    seq: [1, 1, 2, 3, 5, 8, 13], 
    answer: '21', 
    hint: '가장 마법 같은 수열! 앞의 "두 숫자"를 어떻게 하면 다음 숫자가 될까요? (예: 1+1=2, 1+2=3)' 
  },
  { 
    id: 5, 
    name: '속임수 교대 돌다리', 
    emoji: '🎭',
    seq: [1, 10, 2, 9, 3, 8, 4], 
    answer: '7', 
    hint: '홀수 번째 숫자(1, 2, 3...)와 짝수 번째 숫자(10, 9, 8...)가 각자 다른 규칙으로 움직여요!' 
  }
];

export default function EasySequencesPage() {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [inputs, setInputs] = useState<Record<number, string>>({});
  const [visibleHints, setVisibleHints] = useState<Record<number, boolean>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 스테이지가 바뀔 때마다 스크롤을 맨 아래로
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentStageIndex]);

  const handleInputChange = (stageId: number, value: string) => {
    setInputs(prev => ({ ...prev, [stageId]: value.replace(/[^0-9]/g, '') }));
    setErrorMsg(null);
  };

  const handleCheck = (stageIndex: number) => {
    const stage = STAGES[stageIndex];
    const userVal = inputs[stage.id] || '';

    if (userVal === stage.answer) {
      setErrorMsg(null);
      setCurrentStageIndex(Math.max(currentStageIndex, stageIndex + 1));
    } else {
      setErrorMsg('틀렸어요! 다시 한 번 규칙을 생각해보세요.');
    }
  };

  const toggleHint = (stageId: number) => {
    setVisibleHints(prev => ({ ...prev, [stageId]: !prev[stageId] }));
  };

  const isAllClear = currentStageIndex >= STAGES.length;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>🧩 기초 수열 퍼즐 5연전</h1>
        <p className={styles.subtitle}>
          단계별로 진화하는 수열의 규칙을 파악하고 정답을 맞춰보세요!
        </p>
      </header>

      <div className={styles.mainArea}>
        {STAGES.map((stage, index) => {
          // 현재 도달하지 않은 스테이지는 렌더링하지 않음
          if (index > currentStageIndex) return null;

          const isCompleted = index < currentStageIndex;
          const isActive = index === currentStageIndex;
          
          let cardClass = styles.stageCard;
          if (isActive) cardClass += ` ${styles.active}`;
          if (isCompleted) cardClass += ` ${styles.completed}`;

          return (
            <div key={stage.id} className={cardClass}>
              <div className={styles.stageHeader}>
                <div className={styles.stageTitle}>
                  <span className={styles.stageBadge}>Stage {stage.id}</span>
                  {stage.emoji} {stage.name}
                </div>
                {isCompleted && <div className={styles.stageStatus}>✅ 통과</div>}
                {isActive && <div className={styles.stageStatus} style={{ color: '#3498db' }}>진행 중...</div>}
              </div>

              <div className={styles.numbersBox}>
                {stage.seq.map((num, i) => (
                  <React.Fragment key={i}>
                    <div className={styles.numberBadge}>{num}</div>
                    <div className={styles.arrow}>→</div>
                  </React.Fragment>
                ))}
                
                <input
                  type="tel"
                  className={styles.inputBadge}
                  placeholder="?"
                  value={inputs[stage.id] || ''}
                  onChange={(e) => handleInputChange(stage.id, e.target.value)}
                  disabled={isCompleted}
                  autoFocus={isActive}
                />
              </div>

              {isActive && (
                <>
                  <button 
                    className={styles.checkButton}
                    onClick={() => handleCheck(index)}
                    disabled={!inputs[stage.id]}
                  >
                    정답 확인
                  </button>

                  <div className={styles.hintWrapper}>
                    <button className={styles.hintButton} onClick={() => toggleHint(stage.id)}>
                      💡 모르겠다면? 힌트 요정 부르기
                    </button>
                    {visibleHints[stage.id] && (
                      <div className={styles.hintText}>
                        {stage.hint}
                      </div>
                    )}
                  </div>
                </>
              )}

              {isActive && errorMsg && (
                <div style={{ color: '#e74c3c', fontWeight: 'bold', textAlign: 'center', marginTop: '1rem' }}>
                  {errorMsg}
                </div>
              )}
            </div>
          );
        })}

        <div ref={endRef} />

        {isAllClear && (
          <div className={styles.successScreen}>
            <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🏆</div>
            <h2 style={{ fontSize: '2.5rem', color: '#f39c12', marginBottom: '1rem' }}>수열 마스터 탄생!</h2>
            <p style={{ fontSize: '1.2rem', color: '#7f8c8d', lineHeight: '1.6' }}>
              등차, 등비부터 피보나치와 교대수열까지!<br/>
              모든 기초 수열의 원리를 완벽하게 깨우치다니 정말 대단해요!<br/>
              이제 세상의 어떤 패턴도 두렵지 않을 거예요.
            </p>
            <Link href="/puzzles" className={styles.navButton}>
              다른 퍼즐 풀러 가기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
