'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import BubbleSortStage from '@/components/BubbleSortStage';
import {
  BubbleBlock,
  createBubbleSortTrace,
} from '@/lib/coding/bubbleSort';
import AlgorithmTabs from '@/app/coding/components/AlgorithmTabs';
import styles from './page.module.css';

const STEP_BLOCKS: BubbleBlock[] = [
  { id: 'red', value: 5, color: '#f87171' },
  { id: 'orange', value: 2, color: '#fb923c' },
  { id: 'yellow', value: 6, color: '#facc15' },
  { id: 'green', value: 3, color: '#4ade80' },
  { id: 'blue', value: 1, color: '#38bdf8' },
  { id: 'purple', value: 4, color: '#a78bfa' },
];

export default function BubbleStepsPage() {
  const trace = useMemo(() => createBubbleSortTrace(STEP_BLOCKS), []);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = trace.steps;
  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  const sortedFromIndex = step
    ? STEP_BLOCKS.length - step.pass
    : STEP_BLOCKS.length;

  const tilt = step
    ? step.leftValue > step.rightValue
      ? 'left'
      : step.leftValue < step.rightValue
        ? 'right'
        : 'level'
    : 'level';

  const description = step
    ? step.swapped
      ? `왼쪽 블럭(${step.leftValue})이 더 무거워서 자리를 바꿉니다.`
      : `왼쪽(${step.leftValue})이 더 가볍거나 같아서 그대로 둡니다.`
    : '시작하려면 다음 단계를 눌러주세요.';

  const stepSummaries = steps.map((item, index) => {
    const action = item.swapped ? '교환' : '유지';
    return {
      id: `step-${index}`,
      text: `${index + 1}단계: ${item.pass + 1}번째 패스, 위치 ${item.compare[0] + 1
        }↔${item.compare[1] + 1} 비교 → ${action}`,
    };
  });

  return (
    <div className={styles.container}>
      <Link href="/coding" className={styles.backButton}>
        ← 코딩의 원리
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>🫧 버블정렬 한 칸씩 보기</h1>
        <p className={styles.subtitle}>
          저울이 한 칸씩 이동하며 비교하고, 필요한 순간에만 교환하는 과정을
          따라가 봅시다.
        </p>
      </header>

      <AlgorithmTabs basePath="/coding/bubble" />

      <div className={styles.stats}>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>현재 단계</span>
          <span className={styles.statValue}>
            {stepIndex + 1} / {steps.length}
          </span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>패스</span>
          <span className={styles.statValue}>{step ? step.pass + 1 : 1}</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statLabel}>비교 위치</span>
          <span className={styles.statValue}>
            {step ? `${step.compare[0] + 1} ↔ ${step.compare[1] + 1}` : '-'}
          </span>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <section className={styles.stageSection}>
          <BubbleSortStage
            blocks={step ? step.array : STEP_BLOCKS}
            compare={step ? step.compare : null}
            tilt={tilt}
            swapHighlight={step?.swapped}
            sortedFromIndex={sortedFromIndex}
          />

          <div className={styles.controls}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => setStepIndex((prev) => Math.max(prev - 1, 0))}
              disabled={stepIndex === 0}
            >
              이전 단계
            </button>
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() =>
                setStepIndex((prev) => Math.min(prev + 1, steps.length - 1))
              }
              disabled={isLastStep}
            >
              다음 단계
            </button>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => setStepIndex(0)}
              disabled={stepIndex === 0}
            >
              처음으로
            </button>
          </div>

          <div className={styles.explainBox}>
            <h3 className={styles.explainTitle}>현재 설명</h3>
            <p className={styles.explainText}>{description}</p>
            {isLastStep && (
              <p className={styles.completeText}>
                🎉 모든 비교가 끝나 정렬이 완료되었습니다!
              </p>
            )}
          </div>
        </section>

        <aside className={styles.listSection}>
          <h3 className={styles.listTitle}>진행 순서</h3>
          <div className={styles.stepList}>
            {stepSummaries.map((item, index) => (
              <div
                key={item.id}
                className={`${styles.stepItem} ${index === stepIndex ? styles.stepActive : ''
                  }`}
              >
                {item.text}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
