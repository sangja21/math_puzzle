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
  // 추후 퍼즐 추가
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
          마틴 가드너의 클래식 수학 퍼즐을<br />
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
