'use client';

import Link from "next/link";
import styles from "./principles.module.css";
import { PUZZLES, difficultyColors, difficultyLabels } from "@/lib/puzzles";

export default function PrinciplesPage() {
    const allPrinciples = PUZZLES.filter(p => p.category === 'principle');

    // 일반 원리 (lessonGroup 없음) vs 수업별 섹션 (lessonGroup 있음)
    const generalPrinciples = allPrinciples.filter(p => !p.lessonGroup);

    // lessonGroup별로 그룹핑
    const lessonGroups: Record<string, typeof allPrinciples> = {};
    allPrinciples.filter(p => p.lessonGroup).forEach(p => {
        const group = p.lessonGroup!;
        if (!lessonGroups[group]) lessonGroups[group] = [];
        lessonGroups[group].push(p);
    });

    return (
        <div className={styles.container}>
            <header className={styles.hero}>
                <h1 className={styles.title}>📜 수학의 원리</h1>
                <p className={styles.subtitle}>
                    위대한 수학자들의 발견과 정리를 인터랙티브하게 탐구해보세요.
                </p>
            </header>

            <main className={styles.main}>
                {/* 수학 원리 일반 */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span className={styles.sectionIcon}>🔬</span> 수학적 원리 탐구
                    </h2>
                    <div className={styles.puzzleGrid}>
                        {generalPrinciples.map((puzzle) => (
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
                    </div>
                </section>

                {/* 수업별 탐구 섹션 */}
                {Object.entries(lessonGroups).map(([groupName, puzzles]) => (
                    <section key={groupName} className={styles.section}>
                        <div className={styles.sectionDivider} />
                        <h2 className={styles.sectionTitle}>
                            <span className={styles.sectionIcon}>📚</span> {groupName}
                            <span className={styles.sectionBadge}>수업 연계</span>
                        </h2>
                        <div className={styles.puzzleGrid}>
                            {puzzles.map((puzzle) => (
                                <Link key={puzzle.id} href={puzzle.href} className={`${styles.puzzleCard} ${styles.lessonCard}`}>
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
                        </div>
                    </section>
                ))}
            </main>
        </div>
    );
}
