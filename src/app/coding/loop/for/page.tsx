'use client';

import React, { useState, useEffect } from 'react';
import styles from '../loop.module.css';

const NUMBER_BLOCKS = ['1', '2', '3', '5', '10', '20', '30', '50'];
const OPERATOR_BLOCKS = ['+1', '+2', '+3', '+5', '*2', '*3'];

export default function ForLoopPage() {
  const [slotStart, setSlotStart] = useState<string | null>(null);
  const [slotStep, setSlotStep] = useState<string | null>(null);
  const [slotEnd, setSlotEnd] = useState<string | null>(null);

  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [currentI, setCurrentI] = useState<number>(0);
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
      if (!slotStart || !slotStep || !slotEnd) return;
      
      const maxLimit = parseInt(slotEnd);
      
      const timer = setTimeout(() => {
        // for 루프의 조건: i <= end
        if (currentI <= maxLimit) {
          setBoxes((prev) => [...prev, currentI]);
          
          const nextVal = calculateNext(currentI, slotStep);
          
          if (boxes.length >= 30) {
            setErrorMsg('앗! 공장에 과부하가 걸렸습니다! 강제로 멈춥니다!');
            setIsRunning(false);
          } else {
            setCurrentI(nextVal);
          }
        } else {
          // 루프 종료 조건 도달
          setIsRunning(false);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isRunning, currentI, slotStep, slotEnd, boxes.length]);

  const handleStart = () => {
    if (!slotStart || !slotStep || !slotEnd) return;
    
    const startVal = parseInt(slotStart);
    const endVal = parseInt(slotEnd);
    
    if (startVal > endVal) {
      setErrorMsg('논리적 오류: 시작 숫자가 목표 숫자보다 커서 작동할 수 없습니다!');
      return;
    }

    setBoxes([]);
    setErrorMsg(null);
    setCurrentI(startVal);
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
    else if (slotName === 'end' && !isOp) setSlotEnd(value);
    else if (slotName === 'step' && isOp) setSlotStep(value);
  };

  const isReady = slotStart && slotStep && slotEnd;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>🏭 for 문: 정해진 횟수만큼 조립하기</h1>
        <p className={styles.subtitle}>
          (초기화; 조건식; 증감식) 규칙 블록을 마우스로 끌어다 놓고 컨베이어 벨트를 작동시켜봐요!
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
            <span className={styles.slotLabel}>시작 (초기화)</span>
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
            <span className={styles.slotLabel}>목표 (조건식)</span>
            <div 
              className={`${styles.dropZone} ${dragOverSlot === 'end' ? styles.dragOver : ''} ${slotEnd ? styles.filled : ''}`}
              onDragOver={(e) => handleDragOver(e, 'end')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'end')}
            >
              {slotEnd ? <div className={styles.draggableBlock}>{slotEnd}</div> : '이하'}
            </div>
          </div>

          <span className={styles.slotFixedText}> 까지 </span>

          <div className={styles.slotWrapper}>
            <span className={styles.slotLabel}>규칙 (증감식)</span>
            <div 
              className={`${styles.dropZone} ${dragOverSlot === 'step' ? styles.dragOver : ''} ${slotStep ? styles.filled : ''}`}
              onDragOver={(e) => handleDragOver(e, 'step')}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'step')}
            >
              {slotStep ? <div className={`${styles.draggableBlock} ${styles.op}`}>{slotStep}</div> : '배치'}
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
            <span className={styles.comment}>// for (초기화; 조건식; 증감식)</span>
          </div>
          <div className={styles.codeLine}>
            <span className={styles.keyword}>for</span> (
            <span className={styles.keyword}>let</span> i = <span className={styles.number}>{slotStart || '?'}</span>;{' '}
            i {'<='} <span className={styles.number}>{slotEnd || '?'}</span>;{' '}
            i = i <span className={styles.keyword}>{slotStep ? slotStep[0] : '?'}</span> <span className={styles.number}>{slotStep ? slotStep.substring(1) : '?'}</span>) {'{'}
          </div>
          <div className={styles.codeLine} style={{ paddingLeft: '2rem' }}>
            컨베이어_벨트_조립(i); <span className={styles.comment}>// 현재 상자: {isRunning && currentI <= parseInt(slotEnd || '0') ? currentI : '-'}</span>
          </div>
          <div className={styles.codeLine}>{'}'}</div>
        </div>
      </div>
    </div>
  );
}
