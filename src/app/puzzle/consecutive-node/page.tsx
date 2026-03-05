'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

// ----------------------------------------------------------------------
// 1. 코어 데이터 모델
// ----------------------------------------------------------------------

// 노드 정의 (0~7)
type NodeId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

// 위치 좌표 (SVG viewBox: 0 0 400 400 기준)
// 0: top, 1: left-upper, 2: center, 3: right-upper
// 4: left-lower, 5: center-lower, 6: right-lower, 7: bottom
// 이미지와 동일한 좌표 배치 (viewBox: 0 0 420 460)
// 상단 꼭지점 → 좌/우 + 중앙 상단 행 → 좌/우 + 중앙 하단 행 → 하단 꼭지점
const NODES: Record<NodeId, { x: number; y: number; label: string }> = {
    0: { x: 210, y: 35, label: 'Top' },      // top
    1: { x: 60, y: 175, label: 'L-U' },     // left-upper
    2: { x: 210, y: 175, label: 'C' },        // center
    3: { x: 360, y: 175, label: 'R-U' },     // right-upper
    4: { x: 60, y: 285, label: 'L-L' },     // left-lower
    5: { x: 210, y: 285, label: 'C-L' },     // center-lower
    6: { x: 360, y: 285, label: 'R-L' },     // right-lower
    7: { x: 210, y: 425, label: 'Bottom' },  // bottom
};

// 간선(Edge) 정의
const EDGES: [NodeId, NodeId][] = [
    [0, 1], [0, 2], [0, 3],
    [1, 2], [2, 3],
    [1, 4], [2, 5], [3, 6],
    [4, 5], [5, 6],
    [4, 2], [6, 2],
    [4, 7], [5, 7], [6, 7]
];

// 사용할 숫자 블록 (1~8)
const AVAILABLE_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8];

// ----------------------------------------------------------------------
// 2. 메인 컴포넌트
// ----------------------------------------------------------------------

export default function ConsecutiveNodePuzzle() {
    // 현재 각 노드에 배치된 숫자 (null이면 비어있음)
    const [nodeValues, setNodeValues] = useState<Record<NodeId, number | null>>({
        0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null
    });

    // 드래그 중인 숫자
    const [draggingNumber, setDraggingNumber] = useState<number | null>(null);

    // 검증 결과 상태
    const [validationResult, setValidationResult] = useState<{ status: 'idle' | 'success' | 'error'; msg: string }>({ status: 'idle', msg: '' });

    // 위반된 간선 목록을 저장하여 UI(빨간 선)로 표시
    const [violatingEdges, setViolatingEdges] = useState<[NodeId, NodeId][]>([]);

    // 자동 풀이 진행 상태 (UI 잠금 목적)
    const [isAutoSolving, setIsAutoSolving] = useState(false);

    // 현재 사용 중인(노드에 배치된) 숫자들 목록 도출
    const usedNumbers = Object.values(nodeValues).filter(v => v !== null) as number[];

    // --- 드래그 핸들러 (HTML5 Drag & Drop) ---
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, num: number) => {
        // 풀이 진행 중엔 드래그 금지
        if (isAutoSolving) {
            e.preventDefault();
            return;
        }
        setDraggingNumber(num);
        // 모바일/일부 환경 지원용 DataTransfer 세팅
        e.dataTransfer.setData('text/plain', num.toString());
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<SVGGElement>) => {
        e.preventDefault(); // 필수: drop 이벤트를 받기 위해
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDropToNode = (e: React.DragEvent<SVGGElement>, nodeId: NodeId) => {
        e.preventDefault();
        if (draggingNumber === null || isAutoSolving) return;

        // 만약 해당 노드에 이미 숫자가 있었다면 덮어쓰고, 기존 숫자는 다시 리스트로 돌아갑니다.
        setNodeValues(prev => ({
            ...prev,
            [nodeId]: draggingNumber
        }));

        setDraggingNumber(null);
        setValidationResult({ status: 'idle', msg: '' });
        setViolatingEdges([]);
    };

    // 노드 클릭 시: 숫자를 빼서 아래 리스트로 원복
    const handleNodeClick = (nodeId: NodeId) => {
        if (isAutoSolving || nodeValues[nodeId] === null) return;

        setNodeValues(prev => ({
            ...prev,
            [nodeId]: null
        }));
        setValidationResult({ status: 'idle', msg: '' });
        setViolatingEdges([]);
    };

    // 노드 리셋
    const handleReset = () => {
        if (isAutoSolving) return;
        setNodeValues({
            0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null
        });
        setValidationResult({ status: 'idle', msg: '' });
        setViolatingEdges([]);
        console.clear();
    };

    // --- 1. 수동 검증 기능 ---
    const handleValidate = () => {
        if (usedNumbers.length < 8) {
            setValidationResult({ status: 'error', msg: '모든 노드에 숫자를 채워주세요!' });
            return;
        }

        const currentViolations: [NodeId, NodeId][] = [];

        // 모든 간선을 순회하며 조건 체크: abs(a - b) == 1 이면 위반
        for (const [u, v] of EDGES) {
            const valU = nodeValues[u];
            const valV = nodeValues[v];
            if (valU !== null && valV !== null) {
                if (Math.abs(valU - valV) === 1) {
                    currentViolations.push([u, v]);
                }
            }
        }

        if (currentViolations.length > 0) {
            setViolatingEdges(currentViolations);
            setValidationResult({ status: 'error', msg: `규칙 위반! 연결된 노드에 연속된 숫자가 들어갈 수 없습니다.` });
            console.log(`❌ 사용자 검증 실패. 위반 간선 수: ${currentViolations.length}`);
        } else {
            setViolatingEdges([]);
            setValidationResult({ status: 'success', msg: '✨ 정답입니다! 모든 조건을 완벽하게 만족했어요!' });
            console.log('✅ 사용자 검증 성공! 모든 제약 조건 통과.');
        }
    };


    // --- 2. 자동 풀이 백트래킹(DFS) 기능 비동기 구현 ---
    const autoSolveAsync = async () => {
        if (isAutoSolving) return;
        setIsAutoSolving(true);
        setValidationResult({ status: 'idle', msg: '자동 탐색 중...' });
        setViolatingEdges([]);

        console.clear();
        console.log("=== 🚀 자동 풀이(DFS Backtracking) 시작 ===");

        // DFS를 위한 내부 Data Structure
        const solverState: Record<NodeId, number | null> = {
            0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null
        };

        let isFound = false;
        let attemptCount = 0;

        // 잠시 비동기 지연을 주는 Helper
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

        // 유효성 체크 함수
        const isValid = (node: NodeId, num: number, state: Record<NodeId, number | null>): boolean => {
            // 1. 이미 사용된 숫자인지 체크
            if (Object.values(state).includes(num)) return false;

            // 2. 인접 노드 중 연속된 숫자가 있는지 체크
            for (const [u, v] of EDGES) {
                if (u === node && state[v] !== null) {
                    if (Math.abs(state[v]! - num) === 1) return false;
                }
                if (v === node && state[u] !== null) {
                    if (Math.abs(state[u]! - num) === 1) return false;
                }
            }
            return true;
        };

        // DFS 재귀 함수
        const dfs = async (nodeIndex: number): Promise<boolean> => {
            // 무한 루프 방지 긴급 종료
            attemptCount++;
            if (attemptCount > 50000) return false;

            // 8개 모두 채웠으면 성공
            if (nodeIndex === 8) {
                return true;
            }

            // 현재 탐색할 노드 ID (단순 0~7 맵핑)
            const currentNodeId = nodeIndex as NodeId;

            for (const num of AVAILABLE_NUMBERS) {
                if (isValid(currentNodeId, num, solverState)) {
                    // 상태 업데이트 및 UI 렌더링 강제 (애니메이션 효과)
                    solverState[currentNodeId] = num;
                    setNodeValues({ ...solverState });
                    console.log(`[Attempt ${attemptCount}] Node ${currentNodeId}에 숫자 ${num} 배치 시도`);

                    await delay(20); // 시각화를 위해 20ms 딜레이 부여

                    // 다음 노드로 재귀
                    const result = await dfs(nodeIndex + 1);
                    if (result) return true; // 뒤에서 완성되어 돌아오면 즉시 종료

                    // 실패해서 돌아왔으므로 백트래킹 (원상복구)
                    console.log(`[Backtrack] Node ${currentNodeId}의 숫자 ${num} 제거`);
                    solverState[currentNodeId] = null;
                    setNodeValues({ ...solverState });
                    await delay(10);
                }
            }
            return false; // 이 분기에는 답이 없음
        };

        try {
            isFound = await dfs(0);

            if (isFound) {
                console.log(`\n=== ✅ 해답 탐색 성공! (총 시도 횟수: ${attemptCount}) ===`);
                console.log("최종 노드 상태:", solverState);
                setValidationResult({ status: 'success', msg: `자동 풀이 완료! (총 ${attemptCount}회 시도)` });
            } else {
                console.log("\n=== ❌ 해답을 찾을 수 없습니다. ===");
                setValidationResult({ status: 'error', msg: '풀이 불가능 (규칙상 해가 없거나 탐색 임계치 초과)' });
            }
        } catch (e) {
            console.error(e);
            setValidationResult({ status: 'error', msg: '알 수 없는 오류 발생' });
        } finally {
            setIsAutoSolving(false);
        }
    };


    return (
        <div className={styles.container}>
            <Link href="/puzzle" className={styles.backButton}>
                ← 퍼즐 목록
            </Link>

            <header className={styles.header}>
                <h1 className={styles.title}>🛑 연속 번호 배치 제약 퍼즐</h1>
                <p className={styles.subtitle}>
                    그래프 이론과 CSP(Constraint Satisfaction Problem)의 기초.<br />
                    <strong>규칙:</strong> 모든 노드에 1부터 8까지의 숫자를 하나씩 넣으세요. 단, <strong>선으로 연결된 두 노드 안에는 연속된 숫자(예: 3과 4)가 들어갈 수 없습니다!</strong>
                </p>
            </header>

            <main className={styles.mainContent}>

                {/* 그래프 UI 영역 (SVG Canvas) */}
                <section className={styles.canvasSection}>
                    <div className={styles.svgWrapper}>
                        <svg
                            viewBox="0 0 420 460"
                            className={styles.svgCanvas}
                            preserveAspectRatio="xMidYMid meet"
                        >
                            {/* 간선(Edge) 그리기 */}
                            {EDGES.map(([u, v], idx) => {
                                const nodeU = NODES[u];
                                const nodeV = NODES[v];

                                // 이 간선이 위반된 간선인지 체크
                                const isViolated = violatingEdges.some(
                                    edge => (edge[0] === u && edge[1] === v) || (edge[0] === v && edge[1] === u)
                                );

                                return (
                                    <line
                                        key={`edge-${idx}`}
                                        x1={nodeU.x}
                                        y1={nodeU.y}
                                        x2={nodeV.x}
                                        y2={nodeV.y}
                                        className={`${styles.edge} ${isViolated ? styles.edgeViolated : ''}`}
                                    />
                                );
                            })}

                            {/* 노드(Node) 그리기 */}
                            {(Object.keys(NODES) as unknown as NodeId[]).map(nodeId => {
                                const { x, y } = NODES[nodeId];
                                const val = nodeValues[nodeId];
                                const isFilled = val !== null;

                                return (
                                    <g
                                        key={nodeId}
                                        transform={`translate(${x}, ${y})`}
                                        className={`${styles.nodeGroup} ${isFilled ? styles.nodeFilled : ''}`}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDropToNode(e, nodeId)}
                                        onClick={() => handleNodeClick(nodeId)}
                                    >
                                        <circle r="30" className={styles.nodeCircle} />
                                        <text
                                            className={styles.nodeText}
                                            dy="0.35em" /* 수직 중앙 정렬 보정 */
                                        >
                                            {isFilled ? val : '?'}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                </section>

                {/* 컨트롤 및 알림 패널 영역 */}
                <aside className={styles.controlSection}>

                    <div className={styles.msgPanel}>
                        {validationResult.status === 'success' && (
                            <div className={`${styles.alert} ${styles.alertSuccess}`}>
                                {validationResult.msg}
                            </div>
                        )}
                        {validationResult.status === 'error' && (
                            <div className={`${styles.alert} ${styles.alertError}`}>
                                {validationResult.msg}
                            </div>
                        )}
                        {validationResult.status === 'idle' && (
                            <div className={`${styles.alert} ${styles.alertInfo}`}>
                                {validationResult.msg || '블록을 드래그해서 ? 영역에 채우세요. (다시 클릭하면 빠집니다)'}
                            </div>
                        )}
                    </div>

                    <div className={styles.numberTray}>
                        <h3 className={styles.trayTitle}>남은 숫자 (Drag & Drop)</h3>
                        <div className={styles.blocksRow}>
                            {AVAILABLE_NUMBERS.map(num => {
                                const isUsed = usedNumbers.includes(num);
                                return (
                                    <div
                                        key={num}
                                        draggable={!isUsed && !isAutoSolving}
                                        onDragStart={(e) => handleDragStart(e, num)}
                                        className={`${styles.numBlock} ${isUsed ? styles.numBlockUsed : ''}`}
                                    >
                                        {num}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className={styles.actionButtons}>
                        <button
                            className={`${styles.btn} ${styles.btnValidate}`}
                            onClick={handleValidate}
                            disabled={isAutoSolving}
                        >
                            ✓ 사용자 검증 버튼
                        </button>
                        <button
                            className={`${styles.btn} ${styles.btnAutoSolve}`}
                            onClick={autoSolveAsync}
                            disabled={isAutoSolving}
                        >
                            {isAutoSolving ? '⏳ 백트래킹(DFS) 연산 중...' : '🤖 자동 풀이 로직 작동 (DFS)'}
                        </button>
                        <button
                            className={`${styles.btn} ${styles.btnReset}`}
                            onClick={handleReset}
                            disabled={isAutoSolving}
                        >
                            🔄 초기화
                        </button>
                    </div>

                    <div className={styles.devHint}>
                        <p><strong>개발자 노트:</strong> 자동 풀이 클릭 후 브라우저 개발자 도구의 <strong>Console(F12)</strong>을 열어 DFS 백트래킹 진행 과정을 확인하세요!</p>
                    </div>
                </aside>

            </main>
        </div>
    );
}
