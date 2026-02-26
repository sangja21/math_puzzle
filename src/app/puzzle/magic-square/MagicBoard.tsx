/**
 * MagicBoard - N×N 마방진 보드
 * 각 셀은 드롭 가능하며, 행/열/대각선 합을 표시합니다.
 */

'use client';

import React, { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import NumberTile from './NumberTile';
import { ValidationDetail } from '@/lib/puzzles/magicSquare/types';
import styles from './page.module.css';

interface MagicBoardProps {
    /** 보드 상태 */
    board: (number | null)[][];
    /** 잠금 상태 */
    locked: boolean[][];
    /** 잠금 활성화 여부 */
    lockGivens: boolean;
    /** 검증 결과 */
    validation: ValidationDetail;
    /** 셀 클릭 핸들러 */
    onCellClick: (row: number, col: number) => void;
    /** 선택된 타일 */
    selectedTile: { value: number; source: string; row?: number; col?: number } | null;
    /** 힌트 정보 */
    hint: { type: 'row' | 'col' | 'diag'; index: number } | null;
    /** 보드 크기 */
    size: number;
}

/** 개별 셀 컴포넌트 */
function BoardCell({
    row,
    col,
    value,
    isLocked,
    isSelected,
    isHinted,
    onClick,
    boardSize,
}: {
    row: number;
    col: number;
    value: number | null;
    isLocked: boolean;
    isSelected: boolean;
    isHinted: boolean;
    onClick: () => void;
    boardSize: number;
}) {
    const { isOver, setNodeRef } = useDroppable({
        id: `cell-${row}-${col}`,
        data: { type: 'cell', row, col },
    });

    const sizeClass =
        boardSize === 5
            ? styles.cellSm
            : boardSize === 4
                ? styles.cellMd
                : styles.cellLg;

    return (
        <div
            ref={setNodeRef}
            className={`${styles.boardCell} ${sizeClass} ${isOver ? styles.cellOver : ''} ${isHinted ? styles.cellHinted : ''} ${value === null ? styles.cellEmpty : ''}`}
            onClick={onClick}
        >
            {value !== null && (
                <NumberTile
                    value={value}
                    source="board"
                    row={row}
                    col={col}
                    isLocked={isLocked}
                    isSelected={isSelected}
                    boardSize={boardSize}
                />
            )}
        </div>
    );
}

const MemoizedBoardCell = React.memo(BoardCell);

function MagicBoard({
    board,
    locked,
    lockGivens,
    validation,
    onCellClick,
    selectedTile,
    hint,
    size,
}: MagicBoardProps) {
    const n = size;

    /** 셀이 힌트 대상인지 확인 */
    const isHintedCell = useMemo(() => {
        if (!hint) return () => false;
        return (row: number, col: number): boolean => {
            if (hint.type === 'row') return row === hint.index;
            if (hint.type === 'col') return col === hint.index;
            if (hint.type === 'diag' && hint.index === 0) return row === col;
            if (hint.type === 'diag' && hint.index === 1) return row + col === n - 1;
            return false;
        };
    }, [hint, n]);

    /** 합이 올바른지 확인 */
    const isSumCorrect = (sum: number) =>
        validation.isFilled && sum === validation.targetSum;

    /** 합이 0인지 (빈 행/열) */
    const isEmpty = (sum: number) => sum === 0;

    return (
        <div className={styles.boardWrapper}>
            {/* 열 합계 (상단) */}
            <div className={styles.colSumsRow} style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>
                {validation.colSums.map((sum, j) => (
                    <div
                        key={`colsum-${j}`}
                        className={`${styles.sumLabel} ${isEmpty(sum)
                                ? ''
                                : isSumCorrect(sum)
                                    ? styles.sumCorrect
                                    : validation.isFilled
                                        ? styles.sumWrong
                                        : ''
                            }`}
                    >
                        {sum > 0 ? sum : '–'}
                    </div>
                ))}
            </div>

            <div className={styles.boardArea}>
                {/* 반대각선 합 (좌상단) */}
                <div
                    className={`${styles.diagLabel} ${styles.diagAnti} ${isEmpty(validation.antiDiagSum)
                            ? ''
                            : isSumCorrect(validation.antiDiagSum)
                                ? styles.sumCorrect
                                : validation.isFilled
                                    ? styles.sumWrong
                                    : ''
                        }`}
                >
                    ↗ {validation.antiDiagSum > 0 ? validation.antiDiagSum : '–'}
                </div>

                {/* 주대각선 합 (우상단) */}
                <div
                    className={`${styles.diagLabel} ${styles.diagMain} ${isEmpty(validation.mainDiagSum)
                            ? ''
                            : isSumCorrect(validation.mainDiagSum)
                                ? styles.sumCorrect
                                : validation.isFilled
                                    ? styles.sumWrong
                                    : ''
                        }`}
                >
                    ↘ {validation.mainDiagSum > 0 ? validation.mainDiagSum : '–'}
                </div>

                {/* 보드 그리드 */}
                <div
                    className={styles.boardGrid}
                    style={{
                        gridTemplateColumns: `repeat(${n}, 1fr)`,
                        gridTemplateRows: `repeat(${n}, 1fr)`,
                    }}
                >
                    {board.map((row, i) =>
                        row.map((cell, j) => (
                            <MemoizedBoardCell
                                key={`${i}-${j}`}
                                row={i}
                                col={j}
                                value={cell}
                                isLocked={locked[i][j] && lockGivens}
                                isSelected={
                                    selectedTile?.source === 'board' &&
                                    selectedTile?.row === i &&
                                    selectedTile?.col === j
                                }
                                isHinted={isHintedCell(i, j)}
                                onClick={() => onCellClick(i, j)}
                                boardSize={n}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* 행 합계 (우측) */}
            <div className={styles.rowSumsCol}>
                {validation.rowSums.map((sum, i) => (
                    <div
                        key={`rowsum-${i}`}
                        className={`${styles.sumLabel} ${isEmpty(sum)
                                ? ''
                                : isSumCorrect(sum)
                                    ? styles.sumCorrect
                                    : validation.isFilled
                                        ? styles.sumWrong
                                        : ''
                            }`}
                    >
                        {sum > 0 ? sum : '–'}
                    </div>
                ))}
            </div>

            {/* 목표 합 표시 */}
            <div className={styles.targetSum}>
                🎯 목표 합: <strong>{validation.targetSum}</strong>
            </div>
        </div>
    );
}

export default React.memo(MagicBoard);
