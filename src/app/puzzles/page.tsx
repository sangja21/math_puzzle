'use client';

import Link from "next/link";
import styles from "./puzzles.module.css";
import { PUZZLES, difficultyColors, difficultyLabels } from "@/lib/puzzles";

export default function PuzzlesPage() {
    const mathPuzzles = PUZZLES.filter(p => p.category === 'puzzle');

    return (
        <div className={styles.container}>
            {/* 히어로 섹션 */}
            <header className={styles.hero}>
                <h1 className={styles.title}>
                    🧩 수학 퍼즐
                </h1>
                <p className={styles.subtitle}>
                    흥미로운 수학 퍼즐을 통해 논리적 사고력을 키워보세요!
                </p>
            </header>

            {/* 퍼즐 그리드 */}
            <main className={styles.main}>
                <div className={styles.puzzleGrid}>
                    {mathPuzzles.map((puzzle) => (
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
