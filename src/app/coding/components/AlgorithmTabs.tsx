'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './AlgorithmTabs.module.css';

interface AlgorithmTabsProps {
    basePath: string;
}

export default function AlgorithmTabs({ basePath }: AlgorithmTabsProps) {
    const pathname = usePathname();

    return (
        <div className={styles.tabContainer}>
            <Link
                href={`${basePath}/steps`}
                className={`${styles.tab} ${pathname.includes('/steps') ? styles.active : ''}`}
            >
                한 칸씩 보기
            </Link>
            <Link
                href={`${basePath}/lab`}
                className={`${styles.tab} ${pathname.includes('/lab') ? styles.active : ''}`}
            >
                체험관
            </Link>
        </div>
    );
}
