'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import {
  type Graph,
  GRAPHS,
  checkPath,
  degree,
  hasEulerCircuit,
  hasEulerPath,
} from '@/lib/puzzles/konigsberg';

const SVG_W = 600;
const SVG_H = 400;
const NODE_R = 22;

/** 두 노드 사이 곡선 path d — curve 가 0 이면 직선, 아니면 수직 이등분선 방향으로 볼록 */
function edgePath(
  x1: number, y1: number, x2: number, y2: number, curve = 0,
): string {
  if (curve === 0) return `M ${x1} ${y1} L ${x2} ${y2}`;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  // 수직 단위벡터
  const nx = -dy / len;
  const ny = dx / len;
  const offset = curve * 60;
  const cx = mx + nx * offset;
  const cy = my + ny * offset;
  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

const DEFAULT_MSG = '노드를 클릭해 출발점을 정하고, 인접한 노드로 이동하세요.';

export default function KonigsbergPage() {
  const [graphId, setGraphId] = useState<string>(GRAPHS[0].id);
  const [path, setPath] = useState<string[]>([]);
  const [shakeNodeId, setShakeNodeId] = useState<string | null>(null);
  const [userMsg, setUserMsg] = useState<{ text: string; kind: 'info' | 'good' | 'bad' } | null>(null);

  const graph: Graph = useMemo(
    () => GRAPHS.find((g) => g.id === graphId) ?? GRAPHS[0],
    [graphId],
  );

  const handleSelectGraph = useCallback((nextId: string) => {
    if (nextId === graphId) return;
    setGraphId(nextId);
    setPath([]);
    setShakeNodeId(null);
    setUserMsg(null);
  }, [graphId]);

  const eulerCircuit = useMemo(() => hasEulerCircuit(graph), [graph]);
  const eulerPath = useMemo(() => hasEulerPath(graph), [graph]);

  const degrees = useMemo(() => {
    const m = new Map<string, number>();
    for (const n of graph.nodes) m.set(n.id, degree(graph, n.id));
    return m;
  }, [graph]);

  // 현재까지 사용된 엣지 id 와 마지막 엣지
  const pathCheck = useMemo(() => checkPath(graph, path), [graph, path]);
  const visitedEdges = pathCheck.visitedEdges;
  const visitedSet = useMemo(() => new Set(visitedEdges), [visitedEdges]);
  const lastEdge = visitedEdges[visitedEdges.length - 1];

  const currentNodeId = path[path.length - 1];
  const startNodeId = path[0];

  const totalEdges = graph.edges.length;
  const usedCount = visitedEdges.length;
  const allUsed = usedCount === totalEdges && totalEdges > 0;
  const isCircuitClear = allUsed && currentNodeId === startNodeId;
  const isPathClear = allUsed && !isCircuitClear;

  // 표시할 메시지 — 클리어 시 자동 우선, 그 외엔 사용자 액션 메시지 또는 안내
  const displayMsg: { text: string; kind: 'info' | 'good' | 'bad' } = isCircuitClear
    ? { text: '오일러 회로 완성! 모든 다리를 한 번씩 건너 출발점으로 돌아왔습니다.', kind: 'good' }
    : isPathClear
      ? { text: '오일러 경로 완성! 모든 다리를 한 번씩 건넜습니다.', kind: 'good' }
      : (userMsg ?? { text: DEFAULT_MSG, kind: 'info' });

  const handleNodeClick = useCallback((nodeId: string) => {
    if (allUsed) return; // 이미 클리어면 무시
    if (path.length === 0) {
      setPath([nodeId]);
      setUserMsg({ text: `출발점 선택 — 인접한 노드를 클릭하세요.`, kind: 'info' });
      return;
    }
    // 인접한 사용 가능 엣지가 있는지 확인
    const from = path[path.length - 1];
    if (nodeId === from) {
      // 같은 노드 다시 클릭 — 자기 루프가 없으면 무시
      const hasLoop = graph.edges.some(
        (e) => e.a === from && e.b === from && !visitedSet.has(e.id),
      );
      if (!hasLoop) return;
    }
    const candidates = graph.edges.filter(
      (e) => (e.a === from && e.b === nodeId) || (e.a === nodeId && e.b === from),
    );
    if (candidates.length === 0) {
      setShakeNodeId(nodeId);
      setUserMsg({ text: '인접하지 않은 노드입니다. 직접 연결된 노드만 선택할 수 있어요.', kind: 'bad' });
      return;
    }
    const unused = candidates.find((e) => !visitedSet.has(e.id));
    if (!unused) {
      setShakeNodeId(nodeId);
      setUserMsg({ text: '이미 건넌 다리입니다. 같은 다리는 한 번만 건널 수 있어요.', kind: 'bad' });
      return;
    }
    setPath((prev) => [...prev, nodeId]);
    setUserMsg({ text: `다리 건넜습니다 — ${usedCount + 1}/${totalEdges}`, kind: 'info' });
  }, [allUsed, path, graph, visitedSet, usedCount, totalEdges]);

  // shake 자동 해제
  useEffect(() => {
    if (!shakeNodeId) return;
    const t = setTimeout(() => setShakeNodeId(null), 420);
    return () => clearTimeout(t);
  }, [shakeNodeId]);

  const handleUndo = useCallback(() => {
    if (path.length === 0) return;
    setPath((prev) => prev.slice(0, -1));
    setUserMsg({ text: '한 단계 되돌렸습니다.', kind: 'info' });
  }, [path.length]);

  const handleReset = useCallback(() => {
    setPath([]);
    setShakeNodeId(null);
    setUserMsg({ text: '경로를 초기화했습니다.', kind: 'info' });
  }, []);

  // 노드 좌표 빠른 조회
  const nodeMap = useMemo(() => {
    const m = new Map<string, { x: number; y: number; label?: string }>();
    for (const n of graph.nodes) m.set(n.id, { x: n.x, y: n.y, label: n.label });
    return m;
  }, [graph]);

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.homeBtn}>🏠 메인으로</Link>

      <header className={styles.header}>
        <h1 className={styles.title}>
          <span>🌉</span> 쾨니히스베르크의 다리
        </h1>
        <p className={styles.subtitle}>
          1736년, 오일러가 풀어낸 그 문제. 모든 다리를 <strong>정확히 한 번씩</strong> 건너세요.
          가능할지 불가능할지 — 꼭짓점의 차수를 살펴보면 알 수 있습니다.
        </p>
      </header>

      <div className={styles.graphRow}>
        {GRAPHS.map((g) => (
          <button
            key={g.id}
            type="button"
            className={`${styles.graphChip} ${graphId === g.id ? styles.graphChipActive : ''}`}
            onClick={() => handleSelectGraph(g.id)}
          >
            {g.name}
          </button>
        ))}
      </div>

      <div className={styles.mainGrid}>
        <section className={styles.stage}>
          <div>
            <h2 className={styles.graphName}>{graph.name}</h2>
            {graph.description && <p className={styles.graphDesc}>{graph.description}</p>}
          </div>

          <div className={styles.svgWrap}>
            <svg
              className={styles.boardSvg}
              viewBox={`0 0 ${SVG_W} ${SVG_H}`}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* 엣지: 사용된 것은 위로 올라오도록 정렬 */}
              {graph.edges.map((e) => {
                const a = nodeMap.get(e.a);
                const b = nodeMap.get(e.b);
                if (!a || !b) return null;
                const used = visitedSet.has(e.id);
                const isLast = e.id === lastEdge;
                const cls = isLast
                  ? `${styles.edge} ${styles.edgeUsed} ${styles.edgeLast}`
                  : used
                    ? `${styles.edge} ${styles.edgeUsed}`
                    : styles.edge;
                return (
                  <path
                    key={e.id}
                    d={edgePath(a.x, a.y, b.x, b.y, e.curve ?? 0)}
                    className={cls}
                  />
                );
              })}

              {/* 노드 */}
              {graph.nodes.map((n) => {
                const d = degrees.get(n.id) ?? 0;
                const odd = d % 2 !== 0 && d > 0;
                const isStart = n.id === startNodeId;
                const isCurrent = n.id === currentNodeId && currentNodeId !== startNodeId;
                let circleCls = styles.nodeCircle;
                if (odd) circleCls += ` ${styles.nodeOdd}`;
                if (isStart) circleCls += ` ${styles.nodeStart}`;
                else if (isCurrent) circleCls += ` ${styles.nodeCurrent}`;
                const groupCls = `${styles.nodeGroup} ${shakeNodeId === n.id ? styles.nodeShake : ''}`;
                return (
                  <g
                    key={n.id}
                    className={groupCls}
                    onClick={() => handleNodeClick(n.id)}
                  >
                    <circle cx={n.x} cy={n.y} r={NODE_R} className={circleCls} />
                    <text x={n.x} y={n.y - 4} className={styles.nodeLabel}>
                      {n.label ?? n.id}
                    </text>
                    <text
                      x={n.x}
                      y={n.y + 11}
                      className={`${styles.nodeDegree} ${odd ? styles.nodeDegreeOdd : ''}`}
                    >
                      차수 {d}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className={styles.progressRow}>
            <div className={`${styles.progressBox} ${allUsed ? styles.progressBoxGood : ''}`}>
              <span className={styles.progressLabel}>건넌 다리</span>
              <span className={styles.progressValue}>{usedCount} / {totalEdges}</span>
            </div>
            <div className={styles.progressBox}>
              <span className={styles.progressLabel}>출발점</span>
              <span className={styles.progressValue}>
                {startNodeId ? (nodeMap.get(startNodeId)?.label ?? startNodeId) : '—'}
              </span>
            </div>
            <div className={styles.progressBox}>
              <span className={styles.progressLabel}>현재</span>
              <span className={styles.progressValue}>
                {currentNodeId ? (nodeMap.get(currentNodeId)?.label ?? currentNodeId) : '—'}
              </span>
            </div>
          </div>

          <div
            className={`${styles.messageBox} ${
              displayMsg.kind === 'good'
                ? styles.messageGood
                : displayMsg.kind === 'bad'
                  ? styles.messageBad
                  : ''
            }`}
          >
            {displayMsg.text}
          </div>
        </section>

        <aside className={styles.panel}>
          <div className={styles.panelCard}>
            <h3 className={styles.panelTitle}>이론상 판정</h3>
            <div className={styles.statusItem}>
              <span>오일러 회로</span>
              <span className={eulerCircuit ? styles.statusYes : styles.statusNo}>
                {eulerCircuit ? '✓ 가능' : '✗ 불가능'}
              </span>
            </div>
            <div className={styles.statusItem}>
              <span>오일러 경로</span>
              <span className={eulerPath ? styles.statusYes : styles.statusNo}>
                {eulerPath ? '✓ 가능' : '✗ 불가능'}
              </span>
            </div>
          </div>

          <div className={styles.panelCard}>
            <h3 className={styles.panelTitle}>차수 (홀수 = 빨강)</h3>
            <div className={styles.degreeTable}>
              {graph.nodes.map((n) => {
                const d = degrees.get(n.id) ?? 0;
                const odd = d % 2 !== 0 && d > 0;
                return (
                  <div
                    key={n.id}
                    className={`${styles.degreeRow} ${odd ? styles.degreeRowOdd : ''}`}
                  >
                    <span className={styles.degreeKey}>{n.label ?? n.id}</span>
                    <span className={styles.degreeValue}>{d}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.panelCard}>
            <h3 className={styles.panelTitle}>경로</h3>
            <div className={styles.pathPreview}>
              {path.length === 0
                ? '출발점을 클릭하세요.'
                : path
                  .map((id) => nodeMap.get(id)?.label ?? id)
                  .join(' → ')}
            </div>
            <div className={styles.actionRow}>
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.undoBtn}`}
                onClick={handleUndo}
                disabled={path.length === 0}
              >
                ↶ 한 단계 취소
              </button>
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.resetBtn}`}
                onClick={handleReset}
                disabled={path.length === 0}
              >
                🔄 리셋
              </button>
            </div>
          </div>
        </aside>
      </div>

      <details className={styles.help}>
        <summary>차수가 뭐길래 — 오일러는 어떻게 증명했을까? 🤔</summary>
        <div className={styles.helpBody}>
          <p>
            <strong>차수 (degree)</strong> 는 한 꼭짓점에 연결된 다리(엣지)의 개수예요.
            예를 들어 쾨니히스베르크의 <em>가운데 섬</em> 은 5개 다리가 모이니 차수 5.
          </p>
          <p>
            모든 다리를 한 번씩 건너려면, 한 꼭짓점에 <strong>들어가는 횟수와 나가는 횟수</strong> 가 같아야 합니다.
            그래서 출발·도착이 아닌 꼭짓점은 차수가 <em>짝수</em> 여야 해요.
          </p>
          <ul>
            <li>모든 꼭짓점 차수 <strong>짝수</strong> → <em>오일러 회로</em> 가능 (출발점 = 도착점)</li>
            <li>홀수 차수 꼭짓점이 <strong>정확히 2개</strong> → <em>오일러 경로</em> 가능 (그 두 점이 시작·끝)</li>
            <li>홀수 차수 꼭짓점이 <strong>그 외</strong> (1개 또는 3개 이상) → 한붓그리기 <em>불가능</em></li>
          </ul>
          <p>
            <strong>쾨니히스베르크는 왜 불가능?</strong> 네 꼭짓점 모두 홀수 차수입니다.
            홀수 차수 꼭짓점이 4개이니 위 조건을 만족할 수 없어요 — 오일러가 1736년에 이렇게 증명했고,
            바로 이 논문에서 <em>그래프 이론</em> 이 시작됐습니다.
          </p>
          <p>
            <strong>악수 정리</strong>도 알아두세요 — 모든 꼭짓점 차수의 합은 항상 엣지 개수의 2배.
            그래서 홀수 차수 꼭짓점의 개수는 반드시 짝수입니다.
          </p>
        </div>
      </details>
    </div>
  );
}
