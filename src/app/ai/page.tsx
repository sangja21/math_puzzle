import Link from 'next/link';
import type { Metadata } from 'next';
import styles from './ai.module.css';

export const metadata: Metadata = {
  title: 'AI 딥러닝 수학 퍼즐 | 시후의 수학퍼즐',
  description:
    '내적, 행렬, 경사하강법까지 — 딥러닝을 움직이는 수학을 손으로 풀어보는 인터랙티브 퍼즐 시리즈.',
};

interface Chapter {
  no: string;
  id: string;
  title: string;
  emoji: string;
  concept: string;
  description: string;
  href?: string;
  status: 'ready' | 'soon';
}

const CHAPTERS: Chapter[] = [
  {
    no: '01',
    id: 'dot-product',
    title: '내적 — 뉴런의 가중합',
    emoji: '🧠',
    concept: 'Dot Product',
    description:
      '뉴런 하나가 하는 일은 결국 내적이에요. 입력 × 가중치를 더해 출력을 만드는 30개의 워크북 문제를, 순전파와 가중치 찾기(학습)로 직접 풀어봅니다.',
    href: '/ai/dot-product',
    status: 'ready',
  },
  {
    no: '02',
    id: 'matrix',
    title: '행렬 곱셈 — 한 층 전체',
    emoji: '🔢',
    concept: 'Matrix Multiplication',
    description:
      '뉴런 여러 개를 한꺼번에! 내적을 격자로 쌓으면 신경망의 한 층이 됩니다.',
    status: 'soon',
  },
  {
    no: '03',
    id: 'gradient',
    title: '경사하강법 — 학습의 원리',
    emoji: '⛰️',
    concept: 'Gradient Descent',
    description:
      '틀린 만큼 가중치를 조금씩 고쳐 내려가는 길. 신경망이 "배우는" 방법을 손으로 따라가 봅니다.',
    status: 'soon',
  },
];

export default function AiLandingPage() {
  return (
    <div className={styles.container}>
      <Link href="/" className={styles.homeBtn}>🏠 메인으로</Link>

      <header className={styles.hero}>
        <div className={styles.heroBadge}>AI · Deep Learning</div>
        <h1 className={styles.heroTitle}>
          <span className={styles.heroEmoji}>🤖</span> AI 딥러닝 수학 퍼즐
        </h1>
        <p className={styles.heroSub}>
          GPT도, 이미지 생성 AI도 그 밑바닥은 <strong>고등학교 수준의 수학</strong>이에요.
          딥러닝을 움직이는 연산을 하나씩, 손으로 풀며 완전히 이해해봅시다.
        </p>
      </header>

      <div className={styles.grid}>
        {CHAPTERS.map((ch) => {
          const card = (
            <div
              className={[
                styles.card,
                ch.status === 'soon' ? styles.cardSoon : '',
              ].filter(Boolean).join(' ')}
            >
              <div className={styles.cardTop}>
                <span className={styles.chapterNo}>{ch.no}</span>
                <span className={styles.cardEmoji}>{ch.emoji}</span>
                {ch.status === 'soon' && <span className={styles.soonBadge}>준비 중</span>}
                {ch.status === 'ready' && <span className={styles.readyBadge}>▶ 시작하기</span>}
              </div>
              <div className={styles.concept}>{ch.concept}</div>
              <h2 className={styles.cardTitle}>{ch.title}</h2>
              <p className={styles.cardDesc}>{ch.description}</p>
            </div>
          );
          return ch.href ? (
            <Link key={ch.id} href={ch.href} className={styles.cardLink}>
              {card}
            </Link>
          ) : (
            <div key={ch.id} className={styles.cardLink} aria-disabled>
              {card}
            </div>
          );
        })}
      </div>

      <section className={styles.why}>
        <h3 className={styles.whyTitle}>왜 내적부터 시작할까?</h3>
        <p className={styles.whyBody}>
          딥러닝의 거의 모든 계산은 <b>내적(dot product)</b>의 반복이에요.
          뉴런 하나 = 내적 하나, 한 층 = 내적의 격자(행렬 곱), 학습 = 그 내적이
          원하는 값을 내도록 가중치를 조정하는 일. 그래서 <b>01 내적</b>을 완전히
          이해하면 그 위의 모든 것이 쉬워집니다.
        </p>
      </section>
    </div>
  );
}
