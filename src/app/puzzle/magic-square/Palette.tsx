/**
 * Palette - 아직 배치되지 않은 숫자 블록들의 영역
 * 드롭 영역으로도 동작 (보드 → 팔레트 반환)
 */

'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import NumberTile from './NumberTile';
import styles from './page.module.css';

interface PaletteProps {
    /** 팔레트에 있는 숫자 목록 */
    numbers: number[];
    /** 선택된 타일의 값 (클릭-클릭 이동) */
    selectedValue: number | null;
    /** 타일 클릭 핸들러 */
    onTileClick: (value: number) => void;
    /** 보드 크기 */
    boardSize: number;
}

function Palette({ numbers, selectedValue, onTileClick, boardSize }: PaletteProps) {
    const { isOver, setNodeRef } = useDroppable({
        id: 'palette-drop',
        data: { type: 'palette' },
    });

    return (
        <div
            ref={setNodeRef}
            className={`${styles.palette} ${isOver ? styles.paletteOver : ''}`}
        >
            <h3 className={styles.paletteTitle}>
                🎲 숫자 팔레트
                {numbers.length > 0 && (
                    <span className={styles.paletteCount}>{numbers.length}개 남음</span>
                )}
            </h3>
            <div className={styles.paletteGrid}>
                {numbers.length === 0 ? (
                    <div className={styles.paletteEmpty}>모든 숫자가 배치되었습니다!</div>
                ) : (
                    numbers.map(num => (
                        <NumberTile
                            key={`palette-${num}`}
                            value={num}
                            source="palette"
                            isSelected={selectedValue === num}
                            onClick={() => onTileClick(num)}
                            boardSize={boardSize}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

export default React.memo(Palette);
