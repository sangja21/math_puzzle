'use client';

import React, { useState, useEffect } from 'react';
import styles from '../loop.module.css';

const NUMBER_BLOCKS = ['1', '2', '3', '5', '10', '20', '30', '50'];
const OPERATOR_BLOCKS = ['+1', '+2', '+3', '+5', '*2', '*3'];

export default function SequenceWhilePage() {
  const [slotStart, setSlotStart] = useState<string | null>(null);
  const [slotOp, setSlotOp] = useState<string | null>(null);
  const [slotMax, setSlotMax] = useState<string | null>(null);

  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [boxes, setBoxes] = useState<number[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const calculateNext = (val: number, op: string) => {
    if (op.startsWith('+')) {
      return val + parseInt(op.substring(1));
    } else if (op.startsWith('*')) {
      return val * parseInt(op.substring(1));
    }
    return val;
  };

  useEffect(() => {
    if (isRunning) {
      if (!slotStart || !slotOp || !slotMax) return;
      
      const maxLimit = parseInt(slotMax);
      
      const timer = setTimeout(() => {
        setBoxes((prev) => [...prev, currentValue]);
        
        const nextVal = calculateNext(currentValue, slotOp);
        
        if (nextVal > maxLimit || boxes.length >= 30) {
          if (boxes.length >= 30) {
            setErrorMsg('앗! 컨베이어 벨트가 꽉 차서 강제로 멈춥니다!');
          }
          setIsRunning(false);
        } else {
          setCurrentValue(nextVal);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isRunning, currentValue, slotOp, slotMax, boxes.length]);

  const handleStart = () => {
    if (!slotStart || !slotOp || !slotMax) return;
    setBoxes([]);
    setErrorMsg(null);
    setCurrentValue(parseInt(slotStart));
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const handleDragStart = (e: React.DragEvent, value: string) => {
    if (isRunning) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', value);
  };

  const handleDragOver = (e: React.DragEvent, slotName: string) => {
    e.preventDefault();
    if (!isRunning) {
      setDragOverSlot(slotName);
    }
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent, slotName: string) => {
    e.preventDefault();
    setDragOverSlot(null);
    if (isRunning) return;

    const value = e.dataTransfer.getData('text/plain');
    if (!value) return;

    // Type checking
    const isOp = value.startsWith('+') || value.startsWith('*');
    
    if (slotName === 'start' && !isOp) setSlotStart(value);
    else if (slotName === 'max' && !isOp) setSlotMax(value);
    else if (slotName === 'op' && isOp) setSlotOp(value);
  };

  const isReady = slotStart && slotOp && slotMax;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>🏭 while 문: 수열 공장 조립하기</h1>
        <p className={styles.subtitle}>
          숫자와 수식 블록을 드래그하여 공장을 직접 프로그래밍 해보세요!
        </p>
      </header>

      <div className={styles.card}>
        
        <div className={styles.partsBox}>
          <div className={styles.slotLabel}>부품 상자 (원하는 블록을 끌어다 놓으세요!)</div>
          <div className={styles.partsRow}>
            {NUMBER_BLOCKS.map(num => (
              <div 
                key={`num-${num}`} 
                className={styles.draggableBlock} 
                draggable={!isRunning}
                onDragStart={(e) => handleDragStart(e, num)}
              >
                {num}
              </div>
            ))}
          </div>
          <div className={styles.partsRow}>
            {OPERATOR_BLOCKS.map(op => (
              <div 
                key={`op-${op}`} 
                className={`${styles.draggableBlock} ${styles.op}`} 
                draggable={!isRunning}
                onDragStart={(e) => handleDragStart(e, op)}
              >
                {op}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.slotsContainer}>
          <div className={styles.slotWrapper}>
            <span className={styles.slotLabel}>시작 숫자</span>
            <div 
              className={`${styles.dropZone} ${dragOverSlot === 'start' ? styles.dragOver : ''} ${slotStart ? styles.filled : ''}`}
              onDragOver={(e) => handleDragOver(e, 'start')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'start')}
            >
              {slotStart ? <div className={styles.draggableBlock}>{slotStart}</div> : '배치'}
            </div>
          </div>

          <span className={styles.slotFixedText}> 부터 </span>

          <div className={styles.slotWrapper}>
            <span className={styles.slotLabel}>생산 규칙</span>
            <div 
              className={`${styles.dropZone} ${dragOverSlot === 'op' ? styles.dragOver : ''} ${slotOp ? styles.filled : ''}`}
              onDragOver={(e) => handleDragOver(e, 'op')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'op')}
            >
              {slotOp ? <div className={`${styles.draggableBlock} ${styles.op}`}>{slotOp}</div> : '배치'}
            </div>
          </div>

          <span className={styles.slotFixedText}> 면서 </span>

          <div className={styles.slotWrapper}>
            <span className={styles.slotLabel}>제한 조건 (이하)</span>
            <div 
              className={`${styles.dropZone} ${dragOverSlot === 'max' ? styles.dragOver : ''} ${slotMax ? styles.filled : ''}`}
              onDragOver={(e) => handleDragOver(e, 'max')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'max')}
            >
              {slotMax ? <div className={styles.draggableBlock}>{slotMax}</div> : '배치'}
            </div>
          </div>
        </div>

        <div className={styles.controlPanel}>
          {errorMsg && (
            <div style={{ color: '#e74c3c', fontWeight: 'bold', textAlign: 'center', marginBottom: '1rem' }}>
              {errorMsg}
            </div>
          )}
          <div className={styles.buttonGroup}>
            <button
              className={styles.startButton}
              onClick={handleStart}
              disabled={isRunning || !isReady}
            >
              생산 시작
            </button>
            <button
              className={styles.stopButton}
              onClick={handleStop}
              disabled={!isRunning}
            >
              정지
            </button>
          </div>
        </div>

        <div className={styles.machineArea}>
          <div className={styles.conveyorBelt}>
            <div className={`${styles.beltLine} ${isRunning ? styles.running : ''}`} />
            {boxes.map((boxNum, idx) => (
              <div key={idx} className={styles.box}>
                {boxNum}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.codeArea}>
          <div className={styles.codeLine}>
            <span className={styles.keyword}>let</span> 숫자 = <span className={styles.number}>{slotStart || '?'}</span>;
          </div>
          <div className={styles.codeLine}>
            <span className={styles.keyword}>while</span> (숫자 {'<='} <span className={styles.number}>{slotMax || '?'}</span>) {'{'}
          </div>
          <div className={styles.codeLine} style={{ paddingLeft: '2rem' }}>
            컨베이어_벨트_출력(숫자);
            <br />
            <span className={styles.comment} style={{ marginLeft: '1rem' }}>// 현재 진행중인 숫자: {isRunning ? currentValue : (boxes.length > 0 ? boxes[boxes.length-1] : '-')}</span>
          </div>
          <div className={styles.codeLine} style={{ paddingLeft: '2rem' }}>
            <span className={styles.comment}>// 다음 숫자를 준비해요!</span>
          </div>
          <div className={styles.codeLine} style={{ paddingLeft: '2rem' }}>
            숫자 = 숫자 <span className={styles.keyword}>{slotOp ? slotOp[0] : '?'}</span> <span className={styles.number}>{slotOp ? slotOp.substring(1) : '?'}</span>;
          </div>
          <div className={styles.codeLine}>{'}'}</div>
        </div>
      </div>
    </div>
  );
}
