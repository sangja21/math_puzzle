'use client';

import Link from 'next/link';
import styles from './coding.module.css';

const CODING_ITEMS = [
  {
    id: 'bubble-steps',
    title: '버블정렬 한 칸씩 보기',
    emoji: '🫧',
    description:
      '저울이 한 칸씩 이동하며 비교하고, 필요한 순간에 교환하는 과정을 따라가요.',
    href: '/coding/bubble-steps',
    tag: '순서 해설',
  },
  {
    id: 'bubble-lab',
    title: '버블정렬 체험관',
    emoji: '⚖️',
    description:
      '임의로 섞인 색깔 블럭을 저울이 순회하며 자동으로 정렬해요.',
    href: '/coding/bubble-lab',
    tag: '자동 정렬',
  },
  {
    id: 'selection-steps',
    title: '선택정렬 한 칸씩 보기',
    emoji: '🔍',
    description:
      '고정 위치에서 최소값을 찾아 한 번에 교환하는 선택정렬의 원리를 따라가요.',
    href: '/coding/selection-steps',
    tag: '순서 해설',
  },
  {
    id: 'selection-lab',
    title: '선택정렬 체험관',
    emoji: '🔬',
    description:
      '랜덤 블럭에서 최소값을 순회하며 위치를 확정하는 과정을 체험해요.',
    href: '/coding/selection-lab',
    tag: '자동 정렬',
  },
];

export default function CodingPage() {
  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <h1 className={styles.title}>💻 코딩의 원리</h1>
        <p className={styles.subtitle}>
          알고리즘을 눈으로 보고 손으로 조작하며 이해해보는 공간입니다.
        </p>
      </header>

      <main className={styles.main}>
        <div className={styles.cardGrid}>
          {CODING_ITEMS.map((item) => (
            <Link key={item.id} href={item.href} className={styles.card}>
              <span className={styles.cardTag}>{item.tag}</span>
              <div className={styles.cardEmoji}>{item.emoji}</div>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardDesc}>{item.description}</p>
              <span className={styles.cardCta}>체험 시작하기 →</span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
