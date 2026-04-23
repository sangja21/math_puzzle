'use client';

import Link from "next/link";
import styles from "./page.module.css";
import { PUZZLES } from "@/lib/puzzles";

export default function Home() {
  // 추천 퍼즐 (Featured Puzzles)
  const featuredIds = ['machin', 'squares', 'hanoi', 'knight'];
  const featuredPuzzles = PUZZLES.filter(p => featuredIds.includes(p.id));

  return (
    <div className={styles.container}>
      {/* 히어로 섹션 */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            어서오세요!<br />
            <span className={styles.highlight}>시후의 수학퍼즐</span>입니다.
          </h1>
          <p className={styles.subtitle}>
            수학적 사고력을 키우는 재미있는 퍼즐과 게임이 가득합니다.<br />
            지금 바로 도전해보세요!
          </p>
          <Link href="/puzzles" className={styles.ctaButton}>
            퍼즐 시작하기 →
          </Link>
        </div>
        {/* Optional: Add a hero image or large emoji here if desired */}
      </header>

      <main className={styles.main}>
        {/* 카테고리 바로가기 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>📚 퍼즐 카테고리</h2>
          </div>
          <div className={styles.categoryGrid}>

            {/* 수학 퍼즐 */}
            <Link href="/puzzles" className={styles.categoryCard}>
              <div className={styles.iconWrapper}>🧩</div>
              <h3 className={styles.categoryTitle}>수학 퍼즐</h3>
              <p className={styles.categoryDesc}>
                하노이의 탑, 기사의 여행 등 논리적 사고를 요하는 다양한 수학 퍼즐에 도전하세요.
              </p>
              <div className={styles.cardFooter}>바로가기 →</div>
            </Link>

            {/* 수학의 원리 */}
            <Link href="/principles" className={styles.categoryCard}>
              <div className={styles.iconWrapper}>📜</div>
              <h3 className={styles.categoryTitle}>수학의 원리</h3>
              <p className={styles.categoryDesc}>
                유클리드 호제법, 에라토스테네스의 체 등 위대한 수학 원리를 게임으로 배워봅니다.
              </p>
              <div className={styles.cardFooter}>바로가기 →</div>
            </Link>


          </div>
        </section>

        {/* 추천 퍼즐 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>🔥 추천 퍼즐</h2>
            <Link href="/puzzles" className={styles.viewAll}>전체 보기 →</Link>
          </div>
          <div className={styles.recentGrid}>
            {featuredPuzzles.map(puzzle => (
              <Link key={puzzle.id} href={puzzle.href} className={styles.miniCard}>
                <div className={styles.miniEmoji}>{puzzle.emoji}</div>
                <div className={styles.miniContent}>
                  <h4 className={styles.miniTitle}>{puzzle.title}</h4>
                  <p className={styles.miniDesc}>{puzzle.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
