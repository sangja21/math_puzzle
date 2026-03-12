import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import styles from './page.module.css';

export default function TokenPalette() {
    const tObj = useDraggable({ id: 'token-True' });
    const fObj = useDraggable({ id: 'token-False' });

    return (
        <div className={styles.palette}>
            <div className={styles.paletteTitle}>논리 토큰</div>
            <div className={styles.paletteTokens}>
                <div
                    ref={tObj.setNodeRef}
                    {...tObj.listeners}
                    {...tObj.attributes}
                    className={`${styles.token} ${styles.tokenTrue}`}
                    style={{ opacity: tObj.isDragging ? 0.3 : 1 }}
                >
                    T
                </div>
                <div
                    ref={fObj.setNodeRef}
                    {...fObj.listeners}
                    {...fObj.attributes}
                    className={`${styles.token} ${styles.tokenFalse}`}
                    style={{ opacity: fObj.isDragging ? 0.3 : 1 }}
                >
                    F
                </div>
            </div>
            <p className={styles.paletteDesc}>드래그 하세요!</p>
        </div>
    );
}
