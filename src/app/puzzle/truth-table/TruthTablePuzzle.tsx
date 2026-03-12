'use client';

import React, { useState } from 'react';
import {
    DndContext,
    useSensor,
    useSensors,
    PointerSensor,
    TouchSensor,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
} from '@dnd-kit/core';
import { TruthTablePuzzleDef } from '@/lib/puzzles/truthTable/truthTable';
import TruthTableCell from './TruthTableCell';
import TokenPalette from './TokenPalette';
import styles from './page.module.css';

interface Props {
    puzzle: TruthTablePuzzleDef;
}

export default function TruthTablePuzzle({ puzzle }: Props) {
    const numPeople = puzzle.people.length;
    const numRows = Math.pow(2, numPeople);

    const [board, setBoard] = useState<(boolean | null)[][]>(() =>
        Array(numRows).fill(null).map(() => Array(numPeople + 1).fill(null))
    );
    const [rowStatus, setRowStatus] = useState<(boolean | null)[]>(Array(numRows).fill(null));
    const [message, setMessage] = useState('');
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 100, tolerance: 5 } })
    );

    const handleAutoFill = () => {
        const newBoard = [...board];
        for (let i = 0; i < numRows; i++) {
            const rowArr = [...board[i]];
            for (let col = 0; col < numPeople; col++) {
                const bit = (i >> (numPeople - 1 - col)) & 1;
                rowArr[col] = (bit === 0);
            }
            newBoard[i] = rowArr;
        }
        setBoard(newBoard);
        setRowStatus(Array(numRows).fill(null));
        setMessage('');
    };

    const handleReset = () => {
        setBoard(Array(numRows).fill(null).map(() => Array(numPeople + 1).fill(null)));
        setRowStatus(Array(numRows).fill(null));
        setMessage('');
    };

    const checkAnswer = () => {
        let allCorrect = true;
        let hasEmpty = false;
        let filledValidCount = 0;
        const newRowStatus = board.map(() => null as boolean | null);
        const combos = new Set<string>();

        for (let r = 0; r < numRows; r++) {
            const rowArr = board[r];
            if (rowArr.some(v => v === null)) {
                hasEmpty = true;
                allCorrect = false;
                continue;
            }

            const comboKey = rowArr.slice(0, numPeople).join(',');
            combos.add(comboKey);

            const env: Record<string, boolean> = {};
            puzzle.people.forEach((p, idx) => {
                env[p.name] = rowArr[idx] as boolean;
            });

            let isLogicallyPossible = true;
            for (const p of puzzle.people) {
                if (p.evaluate !== null) {
                    if (env[p.name] !== p.evaluate(env)) {
                        isLogicallyPossible = false;
                        break;
                    }
                }
            }

            const userPossible = rowArr[numPeople] as boolean;
            if (isLogicallyPossible === userPossible) {
                newRowStatus[r] = true;
                if (userPossible) filledValidCount++;
            } else {
                allCorrect = false;
                newRowStatus[r] = false;
            }
        }

        setRowStatus(newRowStatus);

        if (hasEmpty) {
            setMessage('아직 빈 칸이 있습니다. 모든 진리표를 채워주세요!');
        } else if (combos.size < numRows) {
            setMessage('용의자들의 T/F 조합이 중복되었습니다. 모든 가능한 경우의 수를 등록해주세요!');
        } else if (allCorrect) {
            setMessage(`🎉 축하합니다! 완벽하게 진리표를 완성했습니다. 조건을 100% 만족하는 경우(T)는 ${filledValidCount}가지입니다.`);
        } else {
            setMessage('틀린 부분이 있습니다. 붉게 표시된 행의 논리를 다시 확인해보세요.');
        }
    };

    const handleDragStart = (e: DragStartEvent) => {
        setActiveId(e.active.id as string);
    };

    const handleDragEnd = (e: DragEndEvent) => {
        setActiveId(null);
        const { over, active } = e;
        if (over && over.id.toString().startsWith('cell-')) {
            const [, rStr, cStr] = over.id.toString().split('-');
            const row = parseInt(rStr);
            const col = parseInt(cStr);
            const isTruth = active.id.toString() === 'token-True';

            setBoard(prev => {
                const next = [...prev];
                next[row] = [...prev[row]];
                next[row][col] = isTruth;
                return next;
            });

            setRowStatus(prev => {
                const next = [...prev];
                next[row] = null;
                return next;
            });
            setMessage('');
        }
    };

    const handleCellClick = (r: number, c: number) => {
        if (board[r][c] !== null) {
            setBoard(prev => {
                const next = [...prev];
                next[r] = [...prev[r]];
                next[r][c] = null;
                return next;
            });
            setRowStatus(prev => {
                const next = [...prev];
                next[r] = null;
                return next;
            });
            setMessage('');
        }
    };

    const activeIsTruth = activeId === 'token-True';

    return (
        <div className={styles.gameContainer}>
            <div className={styles.statementPanel}>
                <h3 className={styles.panelTitle}>📂 사건 진술 (Statement)</h3>
                <div className={styles.statements}>
                    {puzzle.people.map((p, i) => (
                        <div key={p.name} className={styles.statementItem}>
                            <span className={styles.personBadge}>{p.name}</span>
                            <span className={styles.statementText}>{p.statementStr}</span>
                        </div>
                    ))}
                </div>
            </div>

            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className={styles.boardArea}>
                    <TokenPalette />

                    <div className={styles.tableWrapper}>
                        <table className={styles.truthTable}>
                            <thead>
                                <tr>
                                    {puzzle.people.map(p => <th key={p.name}>{p.name}의 진실성</th>)}
                                    <th className={styles.possibleHeader}>가능 여부 (논리성)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {board.map((rowArr, rowIndex) => {
                                    let rowClass = '';
                                    if (rowStatus[rowIndex] === true) rowClass = styles.rowCorrect;
                                    else if (rowStatus[rowIndex] === false) rowClass = styles.rowWrong;

                                    return (
                                        <tr key={rowIndex} className={`${styles.tableRow} ${rowClass}`}>
                                            {rowArr.map((val, colIndex) => (
                                                <td key={`${rowIndex}-${colIndex}`}>
                                                    <TruthTableCell
                                                        id={`cell-${rowIndex}-${colIndex}`}
                                                        value={val}
                                                        onClick={() => handleCellClick(rowIndex, colIndex)}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <DragOverlay>
                    {activeId ? (
                        <div className={`${styles.token} ${activeIsTruth ? styles.tokenTrue : styles.tokenFalse} ${styles.draggingOverlay}`}>
                            {activeIsTruth ? 'T' : 'F'}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {message && (
                <div className={`${styles.messageBanner} ${message.includes('축하') ? styles.messageSuccess : styles.messageWarning}`}>
                    {message}
                </div>
            )}

            <div className={styles.actionBar}>
                <button className={styles.actionBtnSecondary} onClick={handleAutoFill}>✨ 조합 자동 채우기</button>
                <button className={styles.actionBtnSecondary} onClick={handleReset}>🔄 모든 칸 비우기</button>
                <button className={styles.actionBtnPrimary} onClick={checkAnswer}>✅ 정답 확인</button>
            </div>
        </div>
    )
}
