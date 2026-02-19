'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from './magic-cookies.module.css';

interface Cookie {
    id: number;
    x: number;
    y: number;
    startX: number;
    startY: number;
    moved: boolean;
    /** 이 과자가 이동해야 하는 별 포인트 인덱스 */
    targetStarIndex: number;
    /** 정답에서 이 과자가 "이동해야 하는" 과자인지 여부 */
    needsToMove: boolean;
}

/**
 * Pentagram 10개 좌표 계산
 * [0..4]: 외접원 꼭짓점 5개 (위쪽부터 시계방향)
 * [5..9]: 내접원 교차점 5개
 */
function computeStarPoints(cx: number, cy: number, outerR: number): { x: number; y: number }[] {
    const innerR = outerR * 0.381966;
    const pts: { x: number; y: number }[] = [];

    for (let i = 0; i < 5; i++) {
        const angle = -Math.PI / 2 + (2 * Math.PI * i) / 5;
        pts.push({ x: cx + outerR * Math.cos(angle), y: cy + outerR * Math.sin(angle) });
    }
    for (let i = 0; i < 5; i++) {
        const angle = -Math.PI / 2 + Math.PI / 5 + (2 * Math.PI * i) / 5;
        pts.push({ x: cx + innerR * Math.cos(angle), y: cy + innerR * Math.sin(angle) });
    }
    return pts;
}

/**
 * 정답에서 이동해야 하는 4개 과자의 ID (인덱스 기준)
 * 나머지 6개는 "원래 자리에 남는다"고 간주.
 * 시각적으로 구분: needsToMove=true인 과자는 다른 애니메이션
 */
const NEEDS_TO_MOVE_IDS = new Set([2, 4, 6, 8]); // 10개 중 4개 지정

export default function MagicCookies() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [showSolution, setShowSolution] = useState(false);
    const [cookies, setCookies] = useState<Cookie[]>([]);
    const [moveCount, setMoveCount] = useState(0);

    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);

    const getCenter = useCallback(() => {
        const w = containerRef.current?.clientWidth || 800;
        const h = containerRef.current?.clientHeight || 600;
        return { cx: w / 2, cy: h / 2 };
    }, []);

    const STAR_RADIUS = 170;
    const COOKIE_SIZE = 30; // 과자 크기 절반 (보정용)

    /** 초기화: 5개씩 2줄로 배치 */
    const initializePuzzle = () => {
        const { cx, cy } = getCenter();

        // 5개 × 2줄, 가로 간격 100px, 세로 간격 180px
        const spacing = 100;
        const rowGap = 180;
        const rowY1 = cy - rowGap / 2 - COOKIE_SIZE;
        const rowY2 = cy + rowGap / 2 - COOKIE_SIZE;
        const startX = cx - (spacing * 2) - COOKIE_SIZE;

        const positions: { x: number; y: number }[] = [];
        for (let i = 0; i < 5; i++) positions.push({ x: startX + i * spacing, y: rowY1 });
        for (let i = 0; i < 5; i++) positions.push({ x: startX + i * spacing, y: rowY2 });

        // 별 포인트도 미리 계산 (targetStarIndex 배정)
        const starPts = computeStarPoints(cx - COOKIE_SIZE, cy - COOKIE_SIZE, STAR_RADIUS);

        // 10개 과자 → 10개 별 포인트 1:1 매핑 (순서대로)
        const newCookies: Cookie[] = positions.map((pos, i) => ({
            id: i,
            x: pos.x,
            y: pos.y,
            startX: pos.x,
            startY: pos.y,
            moved: false,
            targetStarIndex: i,
            needsToMove: NEEDS_TO_MOVE_IDS.has(i),
        }));

        setCookies(newCookies);
        setMoveCount(0);
        setShowSolution(false);
        setIsPlaying(true);
    };

    const [draggingId, setDraggingId] = useState<number | null>(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const handlePointerDown = (e: React.PointerEvent, id: number) => {
        e.preventDefault();
        const cookie = cookies.find(c => c.id === id);
        if (!cookie) return;
        setDraggingId(id);
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
        setOffset({ x: e.clientX - cookie.x, y: e.clientY - cookie.y });
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (draggingId === null) return;
        e.preventDefault();
        const newX = e.clientX - offset.x;
        const newY = e.clientY - offset.y;
        setCookies(prev => prev.map(c => c.id === draggingId ? { ...c, x: newX, y: newY } : c));
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (draggingId === null) return;

        setCookies(prev => {
            const next = [...prev];
            const idx = next.findIndex(c => c.id === draggingId);
            if (idx !== -1) {
                const c = next[idx];
                const dist = Math.hypot(c.x - c.startX, c.y - c.startY);
                if (dist > 20 && !c.moved) next[idx] = { ...c, moved: true };
            }
            return next;
        });

        const cur = cookies.find(c => c.id === draggingId);
        if (cur && !cur.moved) {
            const dx = e.clientX - offset.x - cur.startX;
            const dy = e.clientY - offset.y - cur.startY;
            if (Math.hypot(dx, dy) > 20) setMoveCount(p => p + 1);
        }

        setDraggingId(null);
    };

    /**
     * 정답 보기:
     * - 전체 10개를 펜타그램 위치로 이동
     * - needsToMove=true 과자: bouncy 애니메이션 + 강조색
     * - needsToMove=false 과자: 부드럽게 이동 (이미 "정답에 가까운" 위치)
     */
    const handleSolveClick = () => {
        const { cx, cy } = getCenter();
        const starPts = computeStarPoints(cx - COOKIE_SIZE, cy - COOKIE_SIZE, STAR_RADIUS);

        setCookies(prev => prev.map(cookie => ({
            ...cookie,
            x: starPts[cookie.targetStarIndex].x,
            y: starPts[cookie.targetStarIndex].y,
        })));
        setShowSolution(true);
    };

    const handleReset = () => {
        setShowSolution(false);
        initializePuzzle();
    };

    // SVG 별 좌표 (과자 보정 없이, 선 표시용)
    const getSvgStarPoints = () => {
        const { cx, cy } = getCenter();
        return computeStarPoints(cx, cy, STAR_RADIUS);
    };

    const getSvgStarPath = () => {
        const pts = getSvgStarPoints();
        const order = [0, 2, 4, 1, 3];
        return order.map((idx, i) => `${i === 0 ? 'M' : 'L'} ${pts[idx].x} ${pts[idx].y}`).join(' ') + ' Z';
    };

    return (
        <div className={styles.container}>
            {/* ── 화면 크기 가드 (960px 미만 차단) ── */}
            <div className={styles.screenGuard}>
                <div className={styles.sgIcon}>🍪</div>
                <div className={styles.sgTitle}>이 퍼즐은 넓은 화면이 필요해요!</div>
                <div className={styles.sgDesc}>
                    마법 과자 퍼즐은 드래그 인터랙션을 포함해<br />
                    데스크탑 또는 가로 모드 태블릿에서만 즐길 수 있어요.
                </div>
                <div className={styles.sgBadge}>🖥️ 최소 권장: 960 × 600px 이상</div>
                <button className={styles.sgBackBtn} onClick={() => router.push('/alice')}>← 뒤로가기</button>
            </div>

            {!isPlaying && (
                <div className={styles.storySection}>
                    <div className={styles.title}>01. 앨리스와 마법과자</div>
                    <div className={styles.storyContent}>
                        <p>
                            이상한 나라의 앨리스에서는 온갖 이상한 일들이 일어납니다.<br />
                            앨리스가 들고 있던 조약돌이 바닥에 떨어지자, <br />
                            놀랍게도 맛있는 <strong>마법 과자</strong>로 변해버렸어요! 🍪
                        </p>
                        <br />
                        <p>
                            앨리스는 이것을 보고 이렇게 생각했습니다.<br />
                            &quot;과자 10개가 <strong>5개씩 두 줄로</strong> 나란히 있네.<br />
                            이걸 재배열해서 <strong>5줄</strong>로 만들 수 있을까?<br />
                            단, <strong>한 줄에는 꼭 4개의 과자</strong>가 있어야 하고,<br />
                            <strong>과자 4개만</strong> 움직여야 해!&quot;
                        </p>
                        <br />
                        <div className={styles.hintBox}>
                            💡 힌트: 줄을 꼭 나란히 세울 필요는 없어요. 교차점을 생각해보세요!<br />
                            (과자 하나가 여러 줄에 포함될 수 있습니다)
                        </div>
                    </div>
                    <button className={styles.startButton} onClick={() => {
                        setIsPlaying(true);
                        setTimeout(initializePuzzle, 100);
                    }}>
                        문제 풀어보기 🧩
                    </button>
                </div>
            )}

            {isPlaying && (
                <div
                    className={styles.puzzleArea}
                    ref={containerRef}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                >
                    <div className={styles.moveCounter}>
                        이동한 과자: {moveCount} / 4
                    </div>

                    <div className={styles.controls}>
                        <button className={styles.controlBtn} onClick={handleReset}>다시하기 🔄</button>
                        <button className={styles.controlBtn} onClick={handleSolveClick}>정답 보기 🔑</button>
                    </div>

                    {/* 정답 가이드라인 SVG */}
                    {showSolution && (
                        <svg className={styles.solutionOverlay}>
                            <path
                                d={getSvgStarPath()}
                                fill="none"
                                stroke="#f1c40f"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                opacity="0.65"
                            />
                            {getSvgStarPoints().map((pt, i) => (
                                <circle key={i} cx={pt.x} cy={pt.y}
                                    r={i < 5 ? 12 : 9}
                                    fill={i < 5 ? '#e67e22' : '#f39c12'}
                                    opacity="0.45"
                                />
                            ))}
                        </svg>
                    )}

                    {/* 과자 렌더링 */}
                    {cookies.map(cookie => (
                        <div
                            key={cookie.id}
                            className={`${styles.cookie} ${showSolution && cookie.needsToMove ? styles.cookieMoved : ''}`}
                            style={{
                                transform: `translate(${cookie.x}px, ${cookie.y}px)`,
                                left: 0,
                                top: 0,
                                transition: showSolution
                                    ? cookie.needsToMove
                                        ? 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' // bounce
                                        : 'transform 0.5s ease-in-out' // 부드럽게
                                    : 'none',
                            }}
                            onPointerDown={(e) => handlePointerDown(e, cookie.id)}
                        >
                            🍪
                        </div>
                    ))}

                    {showSolution && (
                        <div className={styles.toast}>
                            ⭐ 반짝이는 🍪 4개를 움직이면 5줄 × 4개 완성!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
