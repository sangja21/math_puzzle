'use client';

import Link from "next/link";
import styles from "./principles.module.css";
import { PUZZLES, difficultyColors, difficultyLabels } from "@/lib/puzzles";

export default function PrinciplesPage() {
    const mathPrinciples = PUZZLES.filter(p => p.category === 'principle');

    return (
        <div className={styles.container}>
            {/* 히어로 섹션 */}
            <header className={styles.hero}>
                <h1 className={styles.title}>
                    📜 수학의 원리
                </h1>
                <p className={styles.subtitle}>
                    위대한 수학자들의 발견과 정리를 인터랙티브하게 탐구해보세요.
                </p>
            </header>

            {/* 퍼즐 그리드 */}
            <main className={styles.main}>
                <div className={styles.puzzleGrid}>
                    {mathPrinciples.map((puzzle) => (
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
            </main>
        </div>
    );
}
