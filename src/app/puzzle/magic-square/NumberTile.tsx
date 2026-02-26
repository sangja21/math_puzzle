/**
 * NumberTile - 드래그 가능한 숫자 블록
 * @dnd-kit의 useDraggable을 사용하여 드래그 기능 제공
 */

'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import styles from './page.module.css';

interface NumberTileProps {
    /** 표시할 숫자 */
    value: number;
    /** 드래그 출발지 */
    source: 'palette' | 'board';
    /** 보드 행 (source가 board일 때) */
    row?: number;
    /** 보드 열 (source가 board일 때) */
    col?: number;
    /** 잠긴 타일 여부 */
    isLocked?: boolean;
    /** 선택됨 여부 (클릭-클릭 이동) */
    isSelected?: boolean;
    /** 클릭 핸들러 */
    onClick?: () => void;
    /** 보드 크기 (타일 크기 조절용) */
    boardSize?: number;
}

function NumberTile({
    value,
    source,
    row,
    col,
    isLocked = false,
    isSelected = false,
    onClick,
    boardSize = 3,
}: NumberTileProps) {
    const id = source === 'palette' ? `palette-${value}` : `board-${row}-${col}`;

    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id,
        data: { value, source, row, col },
        disabled: isLocked,
    });

    const style: React.CSSProperties = {
        ...(transform
            ? {
                transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
            }
            : {}),
        opacity: isDragging ? 0.5 : 1,
        cursor: isLocked ? 'not-allowed' : 'grab',
    };

    const sizeClass =
        source === 'palette'
            ? styles.paletteTile
            : boardSize === 5
                ? styles.tileSm
                : boardSize === 4
                    ? styles.tileMd
                    : styles.tileLg;

    return (
        <div
            ref={setNodeRef}
            className={`${styles.numberTile} ${sizeClass} ${isLocked ? styles.locked : ''} ${isSelected ? styles.selected : ''} ${isDragging ? styles.dragging : ''}`}
            style={style}
            onClick={isLocked ? undefined : onClick}
            {...listeners}
            {...attributes}
        >
            {value}
        </div>
    );
}

export default React.memo(NumberTile);
