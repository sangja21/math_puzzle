'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { BRUTE_FORCE_DATA, decryptString, isCoprime, gcd } from '@/lib/puzzles/multiplication';

export default function BruteForcePage() {
    const [level, setLevel] = useState(0);
    const [isScanning, setIsScanning] = useState(false);
    const [logs, setLogs] = useState<{ key: number; result: string; isError: boolean; isSuccess: boolean; message?: string }[]>([]);
    const [currentKey, setCurrentKey] = useState(1);
    const [found, setFound] = useState(false);

    const quiz = BRUTE_FORCE_DATA[level];
    const terminalRef = useRef<HTMLDivElement>(null);

    // Auto-scroll terminal
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [logs]);

    // Scanning Logic
    useEffect(() => {
        if (!isScanning) return;

        const interval = setInterval(() => {
            // Find next candidate
            let nextKey = currentKey;

            // Loop until we iterate through all keys
            if (nextKey > 25) {
                setIsScanning(false);
                clearInterval(interval);
                return;
            }

            // Check coprime
            const coprime = isCoprime(nextKey, 26);
            let result = '';
            let message = '';
            let isError = false;
            let isSuccess = false;

            if (!coprime) {
                result = '⚠️ 고장난 열쇠';
                // GCD explanation
                const common = gcd(nextKey, 26);
                message = `열쇠 ${nextKey}번은 사용할 수 없어요! (26과 ${common}로 나누어떨어져요)`;
                isError = true;
            } else {
                const decrypted = decryptString(quiz.cipherText, nextKey);
                if (decrypted) {
                    result = decrypted;
                    if (decrypted === quiz.plainText) {
                        message = `와! 열쇠 ${nextKey}번이 딱 맞아요! 암호가 '${decrypted}'로 풀렸어요! 🎉`;
                        isSuccess = true;
                        setFound(true);
                        setIsScanning(false);
                        clearInterval(interval);
                    } else {
                        message = `열쇠 ${nextKey}번으로 돌려보니 '${decrypted}'가 나왔어요. 흠, 무슨 뜻인지 모르겠네요. 🤔`;
                    }
                } else {
                    result = '해독 실패';
                    message = `열쇠 ${nextKey}번은 뭔가 이상해요. 작동하지 않습니다.`;
                    isError = true;
                }
            }

            // Logs now store the friendly message too
            setLogs(prev => [...prev, { key: nextKey, result, message, isError, isSuccess }]);

            // Only increment if not success (if success, we stop here)
            if (!isSuccess) {
                setCurrentKey(prev => prev + 1);
            }

        }, 2500); // 2.5s Scan speed for reading time

        return () => clearInterval(interval);
    }, [isScanning, currentKey, quiz]);

    const startScan = () => {
        setIsScanning(true);
    };

    const nextTask = () => {
        if (level < BRUTE_FORCE_DATA.length - 1) {
            setLevel(prev => prev + 1);
            setLogs([]);
            setCurrentKey(1);
            setFound(false);
            setIsScanning(false);
        } else {
            alert("모든 시스템 해킹 완료! 당신은 천재 해커입니다.");
        }
    };

    return (
        <div className={styles.container}>
            <Link href="/" className={styles.backLink}>
                ← 돌아가기
            </Link>

            <h1 className={styles.title}>🗝️ 만능 열쇠 작전 (Brute Force)</h1>
            <p className={styles.subtitle}>
                해커들은 어떻게 비밀번호를 알아낼까요? <br />
                정답은... <strong>&quot;모든 열쇠를 다 돌려보는 것&quot;</strong>입니다!
            </p>

            <div className={styles.bubble}>
                {isScanning ? (
                    <span>기계 작동 중... 열쇠 {currentKey}번을 시도합니다!</span>
                ) : found ? (
                    <span>야호! <strong>{currentKey - 1}번 열쇠</strong>가 딱 맞아요! 암호가 풀렸습니다! 🎉</span>
                ) : (
                    <span>준비 완료! &quot;작전 시작&quot; 버튼을 눌러주세요.</span>
                )}
            </div>

            <div className={styles.status}>
                작전 목표: {level + 1} / {BRUTE_FORCE_DATA.length}
            </div>

            <div className={styles.cipherDisplay}>
                {quiz.cipherText}
            </div>

            {/* Visualizer */}
            <div className={styles.visualizer}>
                <div className={`${styles.keyCircle} ${isScanning ? styles.rotate : ''}`}>
                    {currentKey}
                </div>
                <div className={styles.processArrow}>➡️</div>
                <div className={styles.resultBox}>
                    {logs.length > 0 ? logs[logs.length - 1].result : '???'}
                </div>
            </div>

            <div className={styles.terminal} ref={terminalRef}>

                {logs.map((log, idx) => (
                    <div key={idx} className={`${styles.logLine} ${log.isSuccess ? styles.successLine : ''}`}>
                        <div style={{ marginBottom: '0.2rem' }}>
                            <span className={styles.keyAttempt}>Running Key {log.key}...</span>
                            <span className={log.isError ? styles.errorText : styles.decryptedText}>
                                {log.result}
                            </span>
                        </div>
                        <div style={{ color: '#dfe6e9', fontSize: '0.9rem' }}>
                            {/* Display our friendly explanation */}
                            👉 {log.message}
                        </div>
                    </div>
                ))}
                {isScanning && <div className={styles.logLine} style={{ color: '#fdcb6e' }}>...다음 열쇠 찾는 중...</div>}
                {!isScanning && !found && logs.length === 0 && (
                    <div className={styles.logLine}>시스템 준비 완료. 명령을 기다립니다.</div>
                )}
            </div>

            <div className={styles.controls}>
                {!found ? (
                    <button
                        className={styles.hackerButton}
                        onClick={startScan}
                        disabled={isScanning}
                    >
                        {isScanning ? '작전 진행 중...' : '🔥 만능 열쇠 작전 시작!'}
                    </button>
                ) : (
                    <button
                        className={styles.hackerButton}
                        onClick={nextTask}
                        style={{ backgroundColor: '#0984e3' }}
                    >
                        다음 암호 풀러 가기 🚀
                    </button>
                )}
            </div>
        </div>
    );
}
