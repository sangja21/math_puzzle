'use client';

import Link from 'next/link';
import { useMemo, useRef, useState, useEffect } from 'react';
import BubbleSortStage from '@/components/BubbleSortStage';
import {
  BubbleBlock,
  createBubbleSortTrace,
  shuffleBlocks,
} from '@/lib/coding/bubbleSort';
import styles from './page.module.css';

const BASE_BLOCKS: BubbleBlock[] = [
  { id: 'red', value: 1, color: '#f87171' },
  { id: 'orange', value: 2, color: '#fb923c' },
  { id: 'yellow', value: 3, color: '#facc15' },
  { id: 'green', value: 4, color: '#4ade80' },
  { id: 'blue', value: 5, color: '#38bdf8' },
  { id: 'indigo', value: 6, color: '#818cf8' },
  { id: 'purple', value: 7, color: '#a78bfa' },
];

export default function BubbleLabPage() {
  // Hydration fix: Initialize with sorted state, shuffle on client mount
  const [blocks, setBlocks] = useState(BASE_BLOCKS);
  const [trace, setTrace] = useState(() => ({ steps: [] as any[] }));

  useEffect(() => {
    const shuffled = shuffleBlocks(BASE_BLOCKS);
    setBlocks(shuffled);
    setTrace(createBubbleSortTrace(shuffled));
  }, []);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(450);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const steps = trace.steps;
  const step = steps[stepIndex];

  const tilt = step
    ? step.leftValue > step.rightValue
      ? 'left'
      : step.leftValue < step.rightValue
        ? 'right'
        : 'level'
    : 'level';

  const sortedFromIndex = step
    ? BASE_BLOCKS.length - step.pass
    : BASE_BLOCKS.length;

  const totalSwaps = useMemo(
    () => steps.filter((item) => item.swapped).length,
    [steps]
  );

  const progress =
    steps.length > 1
      ? Math.round((stepIndex / (steps.length - 1)) * 100)
      : 100;

  const description = step
    ? step.swapped
      ? `왼쪽 블럭(${step.leftValue})이 무거워서 교환합니다.`
      : `왼쪽(${step.leftValue})이 가벼워서 그대로 둡니다.`
    : '정렬을 시작해보세요.';

  const handleShuffle = () => {
    const shuffled = shuffleBlocks(BASE_BLOCKS);
    setBlocks(shuffled);
    setTrace(createBubbleSortTrace(shuffled));
    setStepIndex(0);
    setIsPlaying(false);
  };

  const handleNext = () => {
    setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleToggle = () => {
    setIsPlaying((prev) => !prev);
  };

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      return;
    }

    if (stepIndex >= steps.length - 1) {
      setIsPlaying(false);
      return;
    }

    timerRef.current = setTimeout(() => {
      setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    }, speed);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, stepIndex, speed, steps.length]);

  const isComplete = stepIndex >= steps.length - 1;

  return (
    <div className={styles.container}>
      <Link href="/coding" className={styles.backButton}>
        ← 코딩의 원리
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>⚖️ 버블정렬 체험관</h1>
        <p className={styles.subtitle}>
          색깔 블럭을 저울이 순회하며 비교하고 자동으로 정렬하는 모습을
          관찰하세요.
        </p>
      </header>

      <div className={styles.stats}>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>진행률</span>
          <span className={styles.statValue}>{progress}%</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>비교 횟수</span>
          <span className={styles.statValue}>{steps.length}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>교환 횟수</span>
          <span className={styles.statValue}>{totalSwaps}</span>
        </div>
      </div>

      <BubbleSortStage
        blocks={step ? step.array : blocks}
        compare={step ? step.compare : null}
        tilt={tilt}
        swapHighlight={step?.swapped}
        sortedFromIndex={sortedFromIndex}
      />

      <div className={styles.controls}>
        <button type="button" className={styles.secondaryButton} onClick={handleShuffle}>
          다시 섞기
        </button>
        <button
          type="button"
          className={styles.secondaryButton}
          onClick={handleNext}
          disabled={isComplete}
        >
          한 단계
        </button>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={handleToggle}
          disabled={isComplete}
        >
          {isPlaying ? '일시정지' : '자동 정렬'}
        </button>
        <label className={styles.speedControl}>
          속도
          <input
            type="range"
            min={200}
            max={900}
            step={50}
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
          />
          <span>{speed}ms</span>
        </label>
      </div>

      <div className={styles.explainBox}>
        <h3 className={styles.explainTitle}>현재 설명</h3>
        <p className={styles.explainText}>{description}</p>
        {isComplete && (
          <p className={styles.completeText}>
            🎉 모든 블럭이 작은 값부터 큰 값 순으로 정렬되었습니다!
          </p>
        )}
      </div>
    </div>
  );
}
