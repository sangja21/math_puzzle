import Link from "next/link";
import styles from "./page.module.css";

interface PuzzleCard {
  id: string;
  title: string;
  emoji: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  href: string;
  tag?: string;
}

const PUZZLES: PuzzleCard[] = [
  {
    id: 'hourglass',
    title: '모래시계 퍼즐',
    emoji: '⏳',
    description: '7분과 11분 모래시계로 정확히 15분을 재세요!',
    difficulty: 'medium',
    href: '/puzzle/hourglass',
  },
  {
    id: 'doors',
    title: '100개의 문',
    emoji: '🚪',
    description: '100명의 간수가 문을 토글하면 최종적으로 열린 문은?',
    difficulty: 'easy',
    href: '/puzzle/doors',
  },
  {
    id: 'balance',
    title: '양팔저울',
    emoji: '⚖️',
    description: '3의 거듭제곱 추로 모든 무게를 재는 비셰의 퍼즐!',
    difficulty: 'medium',
    href: '/puzzle/balance',
  },
  {
    id: 'river',
    title: '강 건너기',
    emoji: '🚣',
    description: '늑대, 양, 양배추를 모두 안전하게 건너편으로!',
    difficulty: 'easy',
    href: '/puzzle/river',
  },
  {
    id: 'fakecoin',
    title: '가짜 동전 찾기',
    emoji: '🪙',
    description: '삼진 탐색으로 가짜 동전을 찾아라! O(log₃N)',
    difficulty: 'medium',
    href: '/puzzle/fakecoin',
  },
  {
    id: 'josephus',
    title: '요세푸스 퍼즐',
    emoji: '🌀',
    description: '원형에서 k번째 사람을 제거하고 마지막 생존자를 찾으세요.',
    difficulty: 'medium',
    href: '/puzzle/josephus',
  },
  {
    id: 'euclid',
    title: 'Euclidean Game',
    emoji: '🧮',
    description: '유클리드 호제법을 게임으로 체험하세요.',
    difficulty: 'medium',
    href: '/puzzle/euclid',
  },
  {
    id: 'sum_product',
    title: 'Mr.P와 Mr.S',
    emoji: '🕵️',
    description: '정보의 부재가 정보가 되는 역설! (The Impossible Puzzle)',
    difficulty: 'hard',
    href: '/puzzle/sum_product',
  },
  {
    id: 'sieve',
    title: '에라토스테네스의 체',
    emoji: '🔢',
    description: '고대 그리스의 소수 찾기 알고리즘을 시각적으로 체험하세요!',
    difficulty: 'easy',
    href: '/puzzle/sieve',
  },
  {
    id: 'squares',
    title: '완전제곱수의 기하학',
    emoji: '📐',
    description: 'n²이 ㄴ자 블록으로 성장하는 과정을 관찰하세요!',
    difficulty: 'easy',
    href: '/puzzle/squares',
    tag: '시후의 발견! 🚀',
  },
  {
    id: 'warmup',
    title: '비밀요원 입단 테스트',
    emoji: '🕵️',
    description: '카이사르 암호 전 워밍업! 규칙 찾기 연습!',
    difficulty: 'easy',
    href: '/puzzle/warmup',
    tag: '워밍업! 🔥',
  },
  {
    id: 'number_lock',
    title: '숫자 자물쇠',
    emoji: '🔢',
    description: '숫자를 밀어 3단계 보안 잠금을 해제하세요!',
    difficulty: 'easy',
    href: '/puzzle/number-lock',
    tag: '중간 미션! 🧩',
  },
  {
    id: 'caesar',
    title: '카이사르 암호',
    emoji: '🔐',
    description: '로마 장군 카이사르의 비밀 편지를 해독하라!',
    difficulty: 'easy',
    href: '/puzzle/caesar',
    tag: '역사 스토리! 🏛️',
  },
  {
    id: 'multiplication',
    title: '곱셈 암호 원리',
    emoji: '🎡',
    description: '회전목마와 블록으로 곱셈 암호의 수학적 비밀을 배워보세요!',
    difficulty: 'medium',
    href: '/puzzle/multiplication',
    tag: '개념 학습 📚',
  },
  {
    id: 'multiplication_quiz',
    title: '스파이 암호 해독',
    emoji: '🕵️',
    description: '암호표를 사용하여 스파이의 비밀 메시지를 해독하세요!',
    difficulty: 'hard',
    href: '/puzzle/multiplication/quiz',
    tag: '실전 퀴즈 🧩',
  },
  {
    id: 'multiplication_robot',
    title: '모듈로 로봇',
    emoji: '🤖',
    description: '시계 세상에 갇힌 로봇을 블록코딩으로 구해주세요!',
    difficulty: 'easy',
    href: '/puzzle/multiplication/block-coding',
    tag: '미니 게임 🎮',
  },
  {
    id: 'multiplication_brute',
    title: '해커 모드 (Brute Force)',
    emoji: '💻',
    description: '모든 암호 키를 대입하여 시스템을 해킹하세요!',
    difficulty: 'hard',
    href: '/puzzle/multiplication/brute-force',
    tag: '시스템 해킹 🕵️‍♂️',
  },
];

const difficultyColors = {
  easy: '#4ade80',
  medium: '#fbbf24',
  hard: '#f87171',
};

const difficultyLabels = {
  easy: '쉬움',
  medium: '보통',
  hard: '어려움',
};

export default function Home() {
  return (
    <div className={styles.container}>
      {/* 히어로 섹션 */}
      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span className={styles.emoji}>🧮</span>
          시후의 수학퍼즐
        </h1>
        <p className={styles.subtitle}>
          주시후와 함께하는 수학퍼즐<br />
          인터랙티브 게임으로 풀어보세요!
        </p>
      </header>

      {/* 퍼즐 그리드 */}
      <main className={styles.main}>
        <h2 className={styles.sectionTitle}>🎮 퍼즐 목록</h2>
        <div className={styles.puzzleGrid}>
          {PUZZLES.map((puzzle) => (
            <Link key={puzzle.id} href={puzzle.href} className={styles.puzzleCard}>
              {puzzle.tag && <span className={styles.puzzleTag}>{puzzle.tag}</span>}
              <div className={styles.cardEmoji}>{puzzle.emoji}</div>
              <h3 className={styles.cardTitle}>{puzzle.title}</h3>
              <p className={styles.cardDescription}>{puzzle.description}</p>
              <span
                className={styles.difficulty}
                style={{ backgroundColor: difficultyColors[puzzle.difficulty] }}
              >
                {difficultyLabels[puzzle.difficulty]}
              </span>
            </Link>
          ))}

          {/* 추후 추가될 퍼즐 플레이스홀더 */}
          <div className={styles.comingSoon}>
            <div className={styles.cardEmoji}>🔜</div>
            <h3 className={styles.cardTitle}>Coming Soon...</h3>
            <p className={styles.cardDescription}>더 많은 퍼즐이 추가될 예정입니다!</p>
          </div>
        </div>
      </main>

      {/* 푸터 */}
      <footer className={styles.footer}>
        <p>Inspired by Martin Gardner&apos;s Mathematical Puzzles</p>
      </footer>
    </div>
  );
}
