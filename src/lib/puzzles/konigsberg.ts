/** 쾨니히스베르크 다리 — 그래프 이론 모델 */

export interface Node {
  id: string;
  x: number;
  y: number;
  label?: string;
}

export interface Edge {
  id: string;
  /** 양 끝 노드 id */
  a: string;
  b: string;
  /** 시각 곡률 (다중 엣지 구분용) -1.5 ~ 1.5 */
  curve?: number;
  label?: string;
}

export interface Graph {
  id: string;
  name: string;
  nodes: Node[];
  edges: Edge[];
  description?: string;
}

/** 노드별 차수 — 같은 (a,b) 쌍의 다중 엣지도 각각 카운트 (자기 루프는 +2) */
export function degree(g: Graph, nodeId: string): number {
  let d = 0;
  for (const e of g.edges) {
    if (e.a === nodeId && e.b === nodeId) d += 2;
    else if (e.a === nodeId || e.b === nodeId) d += 1;
  }
  return d;
}

/** 엣지를 가진 노드들이 모두 연결되어 있는가 — BFS */
function isConnectedIgnoringIsolated(g: Graph): boolean {
  if (g.edges.length === 0) return true;
  // 인접 리스트
  const adj = new Map<string, string[]>();
  for (const n of g.nodes) adj.set(n.id, []);
  for (const e of g.edges) {
    adj.get(e.a)?.push(e.b);
    adj.get(e.b)?.push(e.a);
  }
  // 엣지가 있는 노드만 도달 대상
  const targets = new Set<string>();
  for (const e of g.edges) {
    targets.add(e.a);
    targets.add(e.b);
  }
  const start = g.edges[0].a;
  const visited = new Set<string>([start]);
  const queue: string[] = [start];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const nb of adj.get(cur) ?? []) {
      if (!visited.has(nb)) {
        visited.add(nb);
        queue.push(nb);
      }
    }
  }
  for (const t of targets) if (!visited.has(t)) return false;
  return true;
}

/** 오일러 회로 가능? — 모든 차수 짝수 + 연결 */
export function hasEulerCircuit(g: Graph): boolean {
  if (!isConnectedIgnoringIsolated(g)) return false;
  for (const n of g.nodes) {
    const d = degree(g, n.id);
    if (d === 0) continue; // 고립 노드는 무시
    if (d % 2 !== 0) return false;
  }
  return true;
}

/** 오일러 경로 가능? — 홀수 차수 노드 0 또는 2 + 연결 */
export function hasEulerPath(g: Graph): boolean {
  if (!isConnectedIgnoringIsolated(g)) return false;
  let odd = 0;
  for (const n of g.nodes) {
    const d = degree(g, n.id);
    if (d === 0) continue;
    if (d % 2 !== 0) odd++;
  }
  return odd === 0 || odd === 2;
}

export interface PathCheck {
  ok: boolean;
  usedAllEdges: boolean;
  reason?: 'invalid_edge' | 'repeated_edge' | 'missing_edges';
  visitedEdges: string[];
  remainingEdges: string[];
}

/**
 * 노드 시퀀스를 따라가며 인접 엣지를 한 번씩만 소비.
 * 두 노드를 잇는 평행 엣지가 여러 개 있으면 그중 아직 안 쓴 것을 선택.
 */
export function checkPath(g: Graph, nodeSequence: string[]): PathCheck {
  const visited: string[] = [];
  const usedSet = new Set<string>();
  const allEdgeIds = g.edges.map((e) => e.id);

  if (nodeSequence.length <= 1) {
    return {
      ok: true,
      usedAllEdges: g.edges.length === 0,
      visitedEdges: [],
      remainingEdges: allEdgeIds,
    };
  }

  for (let i = 1; i < nodeSequence.length; i++) {
    const from = nodeSequence[i - 1];
    const to = nodeSequence[i];
    // from-to 사이의 모든 평행 엣지
    const candidates = g.edges.filter(
      (e) => (e.a === from && e.b === to) || (e.a === to && e.b === from),
    );
    if (candidates.length === 0) {
      return {
        ok: false,
        usedAllEdges: false,
        reason: 'invalid_edge',
        visitedEdges: visited,
        remainingEdges: allEdgeIds.filter((id) => !usedSet.has(id)),
      };
    }
    const pick = candidates.find((e) => !usedSet.has(e.id));
    if (!pick) {
      return {
        ok: false,
        usedAllEdges: false,
        reason: 'repeated_edge',
        visitedEdges: visited,
        remainingEdges: allEdgeIds.filter((id) => !usedSet.has(id)),
      };
    }
    usedSet.add(pick.id);
    visited.push(pick.id);
  }

  const usedAll = usedSet.size === g.edges.length;
  return {
    ok: true,
    usedAllEdges: usedAll,
    reason: usedAll ? undefined : 'missing_edges',
    visitedEdges: visited,
    remainingEdges: allEdgeIds.filter((id) => !usedSet.has(id)),
  };
}

/** SVG 좌표는 0..600 x 0..400 기준. 노드 라벨은 한국어. */
export const GRAPHS: readonly Graph[] = [
  // 1. 역사 원형 — 4개 꼭짓점 모두 홀수, 불가능
  {
    id: 'konigsberg',
    name: '쾨니히스베르크 (1736)',
    description: '오일러가 "불가능" 을 증명한 그 다리. 모든 꼭짓점의 차수가 홀수입니다.',
    nodes: [
      { id: 'N', x: 300, y: 60, label: '북쪽 강변' },
      { id: 'S', x: 300, y: 340, label: '남쪽 강변' },
      { id: 'E', x: 520, y: 200, label: '동쪽 섬' },
      { id: 'C', x: 300, y: 200, label: '가운데 섬' },
    ],
    edges: [
      // 북-가운데 다리 2개 (평행)
      { id: 'b1', a: 'N', b: 'C', curve: -0.6, label: '다리 1' },
      { id: 'b2', a: 'N', b: 'C', curve: 0.6, label: '다리 2' },
      // 남-가운데 다리 2개 (평행)
      { id: 'b3', a: 'S', b: 'C', curve: -0.6, label: '다리 3' },
      { id: 'b4', a: 'S', b: 'C', curve: 0.6, label: '다리 4' },
      // 가운데-동 다리 1개
      { id: 'b5', a: 'C', b: 'E', label: '다리 5' },
      // 북-동, 남-동 다리 각 1개
      { id: 'b6', a: 'N', b: 'E', label: '다리 6' },
      { id: 'b7', a: 'S', b: 'E', label: '다리 7' },
    ],
  },

  // 2. 봉투 — 5 노드, 8 엣지, 홀수 2개 (오일러 경로만 가능)
  {
    id: 'envelope',
    name: '봉투 (한붓 가능)',
    description: '편지 봉투 모양. 아래 두 꼭짓점이 홀수 차수 → 시작·끝이 다른 한붓그리기.',
    nodes: [
      { id: 'T', x: 300, y: 60, label: '꼭대기' },
      { id: 'TL', x: 120, y: 160, label: '좌상' },
      { id: 'TR', x: 480, y: 160, label: '우상' },
      { id: 'BL', x: 120, y: 340, label: '좌하' },
      { id: 'BR', x: 480, y: 340, label: '우하' },
    ],
    edges: [
      { id: 'e1', a: 'TL', b: 'T' },
      { id: 'e2', a: 'T', b: 'TR' },
      { id: 'e3', a: 'TL', b: 'TR' }, // 봉투 안쪽 가로
      { id: 'e4', a: 'TL', b: 'BL' },
      { id: 'e5', a: 'TR', b: 'BR' },
      { id: 'e6', a: 'BL', b: 'BR' },
      { id: 'e7', a: 'TL', b: 'BR' }, // 대각
      { id: 'e8', a: 'TR', b: 'BL' }, // 대각
    ],
  },

  // 3. 정삼각형 — 모든 차수 짝수, 오일러 회로 가능
  {
    id: 'triangle',
    name: '정삼각형 (회로 가능)',
    description: '세 꼭짓점 모두 차수 2 — 오일러 회로 + 경로 둘 다 가능.',
    nodes: [
      { id: 'A', x: 300, y: 80, label: 'A' },
      { id: 'B', x: 120, y: 320, label: 'B' },
      { id: 'C', x: 480, y: 320, label: 'C' },
    ],
    edges: [
      { id: 't1', a: 'A', b: 'B' },
      { id: 't2', a: 'B', b: 'C' },
      { id: 't3', a: 'C', b: 'A' },
    ],
  },

  // 4. 도전 1 — 6 노드, 모든 차수 짝수 (별 + 외곽 사이클)
  {
    id: 'wheel6',
    name: '바퀴 그래프 (도전 1)',
    description: '중심 + 5각형. 중심 차수 4, 외곽 모두 차수 4 — 회로 가능.',
    nodes: [
      { id: 'H', x: 300, y: 200, label: '중심' },
      { id: 'P0', x: 300, y: 60, label: 'P0' },
      { id: 'P1', x: 433, y: 143, label: 'P1' },
      { id: 'P2', x: 382, y: 320, label: 'P2' },
      { id: 'P3', x: 218, y: 320, label: 'P3' },
      { id: 'P4', x: 167, y: 143, label: 'P4' },
    ],
    edges: [
      // 외곽 5각형
      { id: 'w1', a: 'P0', b: 'P1' },
      { id: 'w2', a: 'P1', b: 'P2' },
      { id: 'w3', a: 'P2', b: 'P3' },
      { id: 'w4', a: 'P3', b: 'P4' },
      { id: 'w5', a: 'P4', b: 'P0' },
      // 중심에서 P0, P2 로 평행 엣지 2개씩 — 모든 차수 짝수 유지
      { id: 'w6', a: 'H', b: 'P0', curve: -0.4 },
      { id: 'w7', a: 'H', b: 'P0', curve: 0.4 },
      { id: 'w8', a: 'H', b: 'P2', curve: -0.4 },
      { id: 'w9', a: 'H', b: 'P2', curve: 0.4 },
    ],
  },

  // 5. 도전 2 — 8 노드, 홀수 2개 (오일러 경로만)
  {
    id: 'octogrid',
    name: '8-노드 격자 (도전 2)',
    description: '8개 꼭짓점, 홀수 차수 2개 — 양 끝에서 시작·끝나는 한붓그리기.',
    nodes: [
      { id: 'A', x: 100, y: 80, label: 'A' },
      { id: 'B', x: 300, y: 80, label: 'B' },
      { id: 'C', x: 500, y: 80, label: 'C' },
      { id: 'D', x: 100, y: 200, label: 'D' },
      { id: 'E', x: 300, y: 200, label: 'E' },
      { id: 'F', x: 500, y: 200, label: 'F' },
      { id: 'G', x: 200, y: 340, label: 'G' },
      { id: 'H', x: 400, y: 340, label: 'H' },
    ],
    edges: [
      // 상단 가로
      { id: 'g1', a: 'A', b: 'B' },
      { id: 'g2', a: 'B', b: 'C' },
      // 중단 가로
      { id: 'g3', a: 'D', b: 'E' },
      { id: 'g4', a: 'E', b: 'F' },
      // 세로 좌·중·우
      { id: 'g5', a: 'A', b: 'D' },
      { id: 'g6', a: 'B', b: 'E' },
      { id: 'g7', a: 'C', b: 'F' },
      // 하단 삼각 + 중앙으로 연결
      { id: 'g8', a: 'D', b: 'G' },
      { id: 'g9', a: 'F', b: 'H' },
      { id: 'g10', a: 'G', b: 'H', curve: -0.4 },
      { id: 'g11', a: 'E', b: 'G' },
      { id: 'g12', a: 'E', b: 'H' },
      // 평행 엣지 2개로 차수 보정 — 결과: 홀수는 D, F 단 2개
      { id: 'g13', a: 'B', b: 'E', curve: 0.6 },
      { id: 'g14', a: 'G', b: 'H', curve: 0.4 },
    ],
  },
];

/** id 로 그래프 조회 */
export function getGraph(id: string): Graph | undefined {
  return GRAPHS.find((g) => g.id === id);
}
