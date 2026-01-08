'use client';

import React from 'react';
import styles from './Hourglass.module.css';

interface HourglassProps {
    capacity: number;
    topSand: number;
    isRunning: boolean;
    isAnimating: boolean;
    onClick: () => void;
    disabled?: boolean;
}

/**
 * 모래시계 컴포넌트 - 실제 모래시계 형태
 * 
 * 핵심 메커니즘:
 * 1. SVG로 모래시계 형태 구현 (위아래 삼각형 + 중앙 좁은 목)
 * 2. topSand / capacity 비율로 상단 모래 높이 결정
 * 3. isAnimating일 때 뒤집기 애니메이션 재생
 */
export default function Hourglass({
    capacity,
    topSand,
    isRunning,
    isAnimating,
    onClick,
    disabled = false,
}: HourglassProps) {
    const topPercent = (topSand / capacity) * 100;
    const bottomPercent = ((capacity - topSand) / capacity) * 100;

    return (
        <div
            className={`${styles.container} ${disabled ? styles.disabled : ''}`}
            onClick={disabled ? undefined : onClick}
        >
            <div className={styles.label}>{capacity}분</div>

            <div className={`${styles.hourglassWrapper} ${isAnimating ? styles.flipping : ''}`}>
                <svg
                    className={styles.hourglass}
                    viewBox="0 0 100 160"
                    width="120"
                    height="192"
                >
                    {/* 프레임 - 상단 */}
                    <rect x="10" y="0" width="80" height="8" rx="2" fill="url(#frameGradient)" />

                    {/* 프레임 - 하단 */}
                    <rect x="10" y="152" width="80" height="8" rx="2" fill="url(#frameGradient)" />

                    {/* 유리 외곽선 - 상단 삼각형 */}
                    <path
                        d="M15 10 L85 10 L55 75 L45 75 Z"
                        fill="rgba(200, 230, 255, 0.15)"
                        stroke="rgba(255, 255, 255, 0.3)"
                        strokeWidth="1.5"
                    />

                    {/* 유리 외곽선 - 하단 삼각형 */}
                    <path
                        d="M45 85 L55 85 L85 150 L15 150 Z"
                        fill="rgba(200, 230, 255, 0.15)"
                        stroke="rgba(255, 255, 255, 0.3)"
                        strokeWidth="1.5"
                    />

                    {/* 중앙 목 */}
                    <rect x="45" y="75" width="10" height="10" fill="rgba(200, 230, 255, 0.1)" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1" />

                    {/* 상단 모래 - clipPath로 삼각형 안에만 표시 */}
                    <defs>
                        <clipPath id={`topClip-${capacity}`}>
                            <path d="M16 11 L84 11 L54.5 74 L45.5 74 Z" />
                        </clipPath>
                        <clipPath id={`bottomClip-${capacity}`}>
                            <path d="M45.5 86 L54.5 86 L84 149 L16 149 Z" />
                        </clipPath>
                        <linearGradient id="sandGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#f4d03f" />
                            <stop offset="50%" stopColor="#e9a825" />
                            <stop offset="100%" stopColor="#c4820e" />
                        </linearGradient>
                        <linearGradient id="frameGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#a08060" />
                            <stop offset="50%" stopColor="#6d5840" />
                            <stop offset="100%" stopColor="#4a3c2a" />
                        </linearGradient>
                    </defs>

                    {/* 상단 모래 */}
                    <g clipPath={`url(#topClip-${capacity})`}>
                        <rect
                            x="15"
                            y={11 + (63 * (100 - topPercent) / 100)}
                            width="70"
                            height={63 * topPercent / 100}
                            fill="url(#sandGradient)"
                            className={styles.sand}
                        />
                    </g>

                    {/* 하단 모래 */}
                    <g clipPath={`url(#bottomClip-${capacity})`}>
                        <rect
                            x="15"
                            y={149 - (63 * bottomPercent / 100)}
                            width="70"
                            height={63 * bottomPercent / 100}
                            fill="url(#sandGradient)"
                            className={styles.sand}
                        />
                    </g>

                    {/* 떨어지는 모래 */}
                    {isRunning && topSand > 0 && (
                        <g className={styles.fallingStream}>
                            <line
                                x1="50" y1="75"
                                x2="50" y2="85"
                                stroke="#e9a825"
                                strokeWidth="2"
                                strokeDasharray="2 2"
                            />
                        </g>
                    )}

                    {/* 반짝임 효과 */}
                    <ellipse cx="30" cy="30" rx="8" ry="4" fill="rgba(255, 255, 255, 0.2)" transform="rotate(-30 30 30)" />
                </svg>
            </div>

            <div className={styles.status}>
                {isRunning && topSand > 0 ? '⏳ 흐르는 중' : topSand > 0 ? '⏸️ 대기' : '✅ 비었음'}
            </div>

            <div className={styles.sandInfo}>
                <span className={styles.sandLabel}>위</span> {topSand}분
                <span className={styles.divider}>|</span>
                <span className={styles.sandLabel}>아래</span> {capacity - topSand}분
            </div>

            <div className={styles.flipHint}>👆 클릭해서 뒤집기</div>
        </div>
    );
}
