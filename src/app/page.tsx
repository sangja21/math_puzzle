import Link from "next/link";
import styles from "./page.module.css";

interface PuzzleCard {
  id: string;
  title: string;
  emoji: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  href: string;
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
          Math Puzzle
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
