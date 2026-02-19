'use client';

import React from 'react';
import styles from './bubbleSortStage.module.css';
import type { BubbleBlock } from '@/lib/coding/bubbleSort';

export type BubbleSortStageProps = {
  blocks: BubbleBlock[];
  compare: [number, number] | null;
  tilt?: 'left' | 'right' | 'level';
  swapHighlight?: boolean;
  sortedFromIndex?: number;
};

const BubbleSortStage = ({
  blocks,
  compare,
  tilt = 'level',
  swapHighlight = false,
  sortedFromIndex,
}: BubbleSortStageProps) => {
  const tiltClass =
    tilt === 'left'
      ? styles.tiltLeft
      : tilt === 'right'
        ? styles.tiltRight
        : styles.tiltLevel;

  const gridTemplateColumns = `repeat(${blocks.length}, minmax(44px, 72px))`;

  return (
    <div className={styles.stage}>
      <div className={styles.grid} style={{ gridTemplateColumns }}>
        {compare && (
          <div
            className={`${styles.scale} ${tiltClass}`}
            style={{ gridColumn: `${compare[0] + 1} / span 2` }}
          >
            <div className={styles.scaleTop}>
              <span className={styles.scaleIcon}>⚖️</span>
              <span className={styles.scaleLabel}>저울 비교</span>
            </div>
            <div className={styles.scaleBeam}>
              <span className={styles.scalePan} />
              <span className={styles.scalePan} />
            </div>
          </div>
        )}
        {blocks.map((block, index) => {
          const isCompared =
            compare && (index === compare[0] || index === compare[1]);
          const isSorted =
            sortedFromIndex !== undefined && index >= sortedFromIndex;
          return (
            <div
              key={block.id}
              className={[
                styles.block,
                isCompared ? styles.blockActive : '',
                swapHighlight && isCompared ? styles.blockSwap : '',
                isSorted ? styles.blockSorted : '',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{ backgroundColor: block.color, gridRow: 2 }}
            >
              <span className={styles.blockValue}>{block.value}</span>
              {block.label && (
                <span className={styles.blockLabel}>{block.label}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BubbleSortStage;
