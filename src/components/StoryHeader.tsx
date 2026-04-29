'use client';

import Link from 'next/link';
import styles from './StoryHeader.module.css';

export interface StoryHeaderProps {
  emoji?: string;
  title: string;
  subtitle?: string;
  story: string;
  coreMath: string[];
  storyLabel?: string;
  homeHref?: string;
  homeLabel?: string;
  className?: string;
}

export function StoryHeader({
  emoji,
  title,
  subtitle,
  story,
  coreMath,
  storyLabel = '책 속 이야기',
  homeHref = '/',
  homeLabel = '🏠 목록으로',
  className,
}: StoryHeaderProps) {
  return (
    <header className={`${styles.header} ${className ?? ''}`.trim()}>
      <Link href={homeHref} className={styles.homeButton}>
        {homeLabel}
      </Link>

      <div className={styles.titleRow}>
        {emoji && <span className={styles.emoji}>{emoji}</span>}
        <div className={styles.titleStack}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
      </div>

      <section className={styles.storyCard} aria-label={storyLabel}>
        <div className={styles.storyLabelText}>{storyLabel}</div>
        <p className={styles.storyText}>{story}</p>
      </section>

      {coreMath.length > 0 && (
        <div className={styles.mathRow} aria-label="핵심 수학">
          {coreMath.map((m, i) => (
            <span key={i} className={styles.mathBadge}>
              {m}
            </span>
          ))}
        </div>
      )}
    </header>
  );
}
