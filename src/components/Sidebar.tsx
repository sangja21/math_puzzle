'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './sidebar.module.css';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const toggleSidebar = () => setIsOpen(!isOpen);
    const closeSidebar = () => setIsOpen(false);

    const isActive = (path: string) => pathname === path;

    return (
        <>
            <button
                className={`${styles.mobileToggle} ${isOpen ? styles.open : ''}`}
                onClick={toggleSidebar}
                aria-label={isOpen ? "메뉴 닫기" : "메뉴 열기"}
            >
                <div className={styles.hamburgerLine} />
                <div className={styles.hamburgerLine} />
                <div className={styles.hamburgerLine} />
            </button>

            <div
                className={`${styles.overlay} ${isOpen ? styles.open : ''}`}
                onClick={closeSidebar}
            />

            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <div className={styles.logo}>
                    <span>🧮</span>
                    <span>시후의 수학퍼즐</span>
                </div>

                <nav className={styles.nav}>
                    <Link href="/" onClick={closeSidebar}>
                        <div className={`${styles.navLink} ${isActive('/') ? styles.active : ''}`}>
                            <span>🏠</span> HOME
                        </div>
                    </Link>

                    <Link href="/puzzles" onClick={closeSidebar}>
                        <div className={`${styles.navLink} ${isActive('/puzzles') || pathname.startsWith('/puzzle/') ? styles.active : ''}`}>
                            <span>🧩</span> 수학 퍼즐
                        </div>
                    </Link>

                    <Link href="/principles" onClick={closeSidebar}>
                        <div className={`${styles.navLink} ${isActive('/principles') ? styles.active : ''}`}>
                            <span>📜</span> 수학의 원리
                        </div>
                    </Link>

                    <Link href="/alice" onClick={closeSidebar}>
                        <div className={`${styles.navLink} ${isActive('/alice') ? styles.active : ''}`}>
                            <span>🐰</span> 퍼즐나라의 앨리스
                        </div>
                    </Link>
                </nav>

                <div className={styles.footer}>
                    © 2024 Math Puzzle<br />by Lee Junyeol
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
