'use client';

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
    createSquareState,
    getFormula,
    LAYER_COLORS,
    MIN_N,
    MAX_N,
    EXPLANATION,
    OBSERVATION_POINTS,
} from '@/lib/puzzles/squares';
import styles from './page.module.css';

export default function SquaresPuzzlePage() {
    const [n, setN] = useState(1);
    const [isAutoPlaying, setIsAutoPlaying] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [speed, setSpeed] = useState(800); // ms per step
    const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

    // 현재 상태 계산
    const squareState = useMemo(() => createSquareState(n), [n]);
    const formulas = useMemo(() => getFormula(n), [n]);

    // n 변경
    const handleNChange = useCallback((newN: number) => {
        setN(Math.min(Math.max(newN, MIN_N), MAX_N));
    }, []);

    // 자동 재생
    const handleAutoPlay = useCallback(() => {
        if (isAutoPlaying) {
            if (autoPlayRef.current) {
                clearInterval(autoPlayRef.current);
            }
            setIsAutoPlaying(false);
        } else {
            setN(1); // 처음부터 시작
            setIsAutoPlaying(true);
        }
    }, [isAutoPlaying]);

    // 리셋
    const handleReset = useCallback(() => {
        if (autoPlayRef.current) {
            clearInterval(autoPlayRef.current);
        }
        setIsAutoPlaying(false);
        setN(1);
    }, []);

    // 자동 재생 effect
    useEffect(() => {
        if (isAutoPlaying) {
            autoPlayRef.current = setInterval(() => {
                setN(prev => {
                    if (prev >= MAX_N) {
                        setIsAutoPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, speed);
        }

        return () => {
            if (autoPlayRef.current) {
                clearInterval(autoPlayRef.current);
            }
        };
    }, [isAutoPlaying, speed]);

    // n이 MAX에 도달하면 자동 재생 중지
    useEffect(() => {
        if (n >= MAX_N && isAutoPlaying) {
            setIsAutoPlaying(false);
        }
    }, [n, isAutoPlaying]);

    // 해설 HTML 변환
    const explanationHtml = useMemo(() => {
        return EXPLANATION
            .replace(/\n/g, '<br />')
            .replace(/## (.*?)(?=<br|$)/g, '<h2>$1</h2>')
            .replace(/### (.*?)(?=<br|$)/g, '<h3>$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/`([^`]+)`/g, '<code>$1</code>');
    }, []);

    // 그리드 스타일 (n × n)
    const gridStyle = useMemo(() => ({
        gridTemplateColumns: `repeat(${n}, 1fr)`,
        gridTemplateRows: `repeat(${n}, 1fr)`,
    }), [n]);

    return (
        <div className={styles.container}>
            <Link href="/" className={styles.homeButton}>
                🏠 목록으로
            </Link>

            <header className={styles.header}>
                <div className={styles.discoveryTag}>✨ 시후의 발견!</div>
                <h1 className={styles.title}>📐 완전제곱수의 기하학</h1>
                <p className={styles.subtitle}>
                    n²이 어떻게 ㄴ자 블록으로 성장하는지 관찰해보세요!
                </p>
            </header>

            <div className={styles.mainContent}>
                {/* 정사각형 그리드 영역 */}
                <div className={styles.gridSection}>
                    <div className={styles.squareGrid} style={gridStyle}>
                        {squareState.tiles.map((tile, idx) => (
                            <div
                                key={`${tile.x}-${tile.y}`}
                                className={`
                  ${styles.tile}
                  ${tile.isNew ? styles.tileNew : ''}
                  ${tile.isLShape ? styles.tileLShape : ''}
                `}
                                style={{
                                    backgroundColor: LAYER_COLORS[tile.addedAt - 1] || '#666',
                                    animationDelay: tile.isNew ? `${idx * 30}ms` : '0ms',
                                }}
                                title={`(${tile.x + 1}, ${tile.y + 1}) - ${tile.addedAt}단계에서 추가`}
                            />
                        ))}
                    </div>

                    {/* 범례 */}
                    <div className={styles.legend}>
                        {Array.from({ length: n }, (_, i) => (
                            <div key={i} className={styles.legendItem}>
                                <div
                                    className={styles.legendColor}
                                    style={{ backgroundColor: LAYER_COLORS[i] }}
                                />
                                <span>n={i + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 정보 패널 */}
                <div className={styles.infoSection}>
                    {/* 수식 정보 */}
                    <div className={styles.infoCard}>
                        <h3>📊 현재 정보</h3>
                        <div className={styles.formulaGrid}>
                            <div className={styles.formulaRow}>
                                <span className={styles.formulaLabel}>n</span>
                                <span className={styles.formulaValue}>{n}</span>
                            </div>
                            <div className={styles.formulaRow}>
                                <span className={styles.formulaLabel}>n²</span>
                                <span className={styles.formulaValue}>{formulas.squareFormula}</span>
                            </div>
                            <div className={styles.formulaRow}>
                                <span className={styles.formulaLabel}>새로 추가된 타일</span>
                                <span className={`${styles.formulaValue} ${styles.formulaValueNew}`}>
                                    {squareState.newTiles}개 (2×{n}-1)
                                </span>
                            </div>
                            {n < MAX_N && (
                                <div className={styles.formulaRow}>
                                    <span className={styles.formulaLabel}>(n+1)² − n²</span>
                                    <span className={`${styles.formulaValue} ${styles.formulaValueHighlight}`}>
                                        {formulas.differenceFormula}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 홀수 합 시각화 */}
                    <div className={styles.infoCard}>
                        <h3>🔢 연속 홀수의 합</h3>
                        <div className={styles.oddSumContainer}>
                            {squareState.oddSum.map((num, idx) => (
                                <React.Fragment key={idx}>
                                    {idx > 0 && <span className={styles.sumEquals}>+</span>}
                                    <span
                                        className={`
                      ${styles.oddNumber}
                      ${idx === n - 1 ? styles.oddNumberCurrent : ''}
                    `}
                                        style={{ backgroundColor: LAYER_COLORS[idx] }}
                                    >
                                        {num}
                                    </span>
                                </React.Fragment>
                            ))}
                            <span className={styles.sumEquals}>=</span>
                            <span className={styles.sumResult}>{squareState.totalTiles}</span>
                        </div>
                    </div>

                    {/* 컨트롤 */}
                    <div className={`${styles.infoCard} ${styles.controlsCard}`}>
                        <h3>🎮 컨트롤</h3>
                        <div className={styles.sliderContainer}>
                            <div className={styles.sliderLabel}>
                                <span>n 값 조절</span>
                                <span className={styles.sliderValue}>{n}</span>
                            </div>
                            <input
                                type="range"
                                className={styles.slider}
                                min={MIN_N}
                                max={MAX_N}
                                value={n}
                                onChange={(e) => handleNChange(Number(e.target.value))}
                                disabled={isAutoPlaying}
                            />
                        </div>

                        <div className={styles.controlButtons}>
                            <button
                                className={`${styles.autoButton} ${isAutoPlaying ? styles.playing : ''}`}
                                onClick={handleAutoPlay}
                            >
                                {isAutoPlaying ? '⏸️ 일시정지' : '▶️ 자동 재생'}
                            </button>
                            <button className={styles.resetButton} onClick={handleReset}>
                                🔄 처음으로
                            </button>
                        </div>

                        <div className={styles.speedControl}>
                            <label>속도: </label>
                            <input
                                type="range"
                                min="200"
                                max="1500"
                                value={1700 - speed}
                                onChange={(e) => setSpeed(1700 - Number(e.target.value))}
                            />
                            <span>{speed < 500 ? '빠름' : speed < 1000 ? '보통' : '느림'}</span>
                        </div>
                    </div>

                    {/* 관찰 포인트 */}
                    <div className={`${styles.infoCard} ${styles.observationCard}`}>
                        <h3>🔍 관찰 포인트</h3>
                        <ul className={styles.observationList}>
                            {OBSERVATION_POINTS.map((point, idx) => (
                                <li key={idx}>{point}</li>
                            ))}
                        </ul>

                        <button
                            className={styles.explanationButton}
                            onClick={() => setShowExplanation(!showExplanation)}
                        >
                            {showExplanation ? '📖 해설 숨기기' : '💡 해설 보기'}
                        </button>

                        {showExplanation && (
                            <div
                                className={styles.explanation}
                                dangerouslySetInnerHTML={{ __html: explanationHtml }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
