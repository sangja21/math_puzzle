'use client';

import Link from "next/link";
import styles from "./alice.module.css";
import { PUZZLES, difficultyColors, difficultyLabels } from "@/lib/puzzles";

export default function AlicePage() {
    const alicePuzzles = PUZZLES.filter(p => p.category === 'alice');

    return (
        <div className={styles.container}>
            {/* 히어로 섹션 */}
            <header className={styles.hero}>
                <h1 className={styles.title}>
                    🐇 퍼즐나라의 앨리스
                </h1>
                <p className={styles.subtitle}>
                    이상하고 신비로운 수학 퍼즐의 세계로 초대합니다.
                </p>
            </header>

            <main className={styles.main}>
                {/* 퍼즐 그리드 */}
                <div className={styles.puzzleGrid}>
                    {alicePuzzles.map((puzzle) => (
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

                {/* Coming Soon 섹션 */}
                <div className={styles.comingSoonWrapper}>
                    <div className={styles.comingSoon}>
                        <div className={styles.rabbit}>⏱️</div>
                        <h2 className={styles.message}>새로운 모험 준비 중...</h2>
                        <p className={styles.description}>
                            앨리스가 토끼굴 깊숙한 곳에서<br />
                            더 신기한 퍼즐을 찾고 있어요!
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
