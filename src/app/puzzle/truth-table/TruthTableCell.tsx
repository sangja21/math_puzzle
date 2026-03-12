import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import styles from './page.module.css';

interface Props {
    id: string;
    value: boolean | null;
    onClick: () => void;
}

export default function TruthTableCell({ id, value, onClick }: Props) {
    const { isOver, setNodeRef } = useDroppable({ id });

    let className = styles.cell;
    if (isOver) className += ` ${styles.cellOver}`;

    return (
        <div ref={setNodeRef} className={className} onPointerDown={onClick}>
            {value === true && <div className={`${styles.token} ${styles.tokenTrue} ${styles.tokenInCell}`}>T</div>}
            {value === false && <div className={`${styles.token} ${styles.tokenFalse} ${styles.tokenInCell}`}>F</div>}
            {value === null && <div className={styles.emptyPlaceholder}></div>}
        </div>
    );
}
