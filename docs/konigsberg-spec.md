# 쾨니히스베르크 다리 — 구현 사양

## 스토리

1736년, 동프로이센 *쾨니히스베르크* 도시는 강이 흐르고 7개의 다리가 있었음. 시민들은 *모든 다리를 정확히 한 번씩 건너 출발점으로 돌아오는 산책로* 가 있는지 궁금했다. 수학자 *오일러* 가 "불가능하다" 증명했고, 그 과정에서 **그래프 이론** 이 탄생.

핵심 정리:
- 모든 다리를 한 번씩 건너기 (**오일러 회로**) = *모든 꼭짓점의 차수(degree)가 짝수*
- 출발·도착이 달라도 됨 (**오일러 경로**) = *홀수 차수 꼭짓점이 정확히 0개 또는 2개*

쾨니히스베르크는 4개 꼭짓점 모두 홀수 → 불가능.

## 파일 구조

```
src/lib/puzzles/konigsberg.ts                  신규
src/app/puzzle/konigsberg/page.tsx             신규
src/app/puzzle/konigsberg/page.module.css      신규
src/lib/puzzles.ts                              카탈로그
```

## 로직 모듈

```ts
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

/** 노드별 차수 */
export function degree(g: Graph, nodeId: string): number;

/** 오일러 회로 가능? (모든 차수 짝수 + 연결됨) */
export function hasEulerCircuit(g: Graph): boolean;

/** 오일러 경로 가능? (홀수 차수 노드 0 또는 2) */
export function hasEulerPath(g: Graph): boolean;

/** 사용자 경로의 유효성 — 인접 노드끼리 + 엣지 한 번씩만 + 모든 엣지 사용 */
export interface PathCheck {
  ok: boolean;
  usedAllEdges: boolean;
  reason?: 'invalid_edge' | 'repeated_edge' | 'missing_edges';
  visitedEdges: string[];
  remainingEdges: string[];
}
export function checkPath(g: Graph, nodeSequence: string[]): PathCheck;

/** 사전 정의된 그래프들 */
export const GRAPHS: readonly Graph[];
// 최소 5개:
// 1. 쾨니히스베르크 (4 노드, 7 엣지, 모두 홀수 → 불가능) — 역사 원형
// 2. 한붓 가능 — 봉투 모양 (5 노드, 8 엣지, 홀수 2)
// 3. 한붓 회로 가능 — 정삼각형/사각형 (모든 차수 짝수)
// 4. 도전 그래프 1 (medium)
// 5. 도전 그래프 2 (hard, 노드 8+)
```

**검증 기준 (B)**:
- 쾨니히스베르크 그래프 → `hasEulerCircuit === false`, `hasEulerPath === false`
- 봉투 그래프 → `hasEulerPath === true`, `hasEulerCircuit === false`
- 정삼각형 그래프 → 둘 다 true
- `degree` 합 = 2 × 엣지 수 (악수 정리)
- 알려진 정답 경로 입력 → `checkPath.ok === true && usedAllEdges === true`
- 같은 엣지 두 번 → `ok === false, reason === 'repeated_edge'`

## UI

- 상단: 제목 + 그래프 선택 칩 (5개)
- 본체: SVG (600×400 데스크탑)
  - 노드: 원 + 라벨
  - 엣지: 곡선 (다중 엣지 곡률 다르게)
  - 사용자가 *방금 지난 엣지* 는 색 변화 (회색 → 강조색)
- 우측 패널:
  - 노드별 차수 표 (홀수 노드 빨강 강조)
  - "오일러 회로 가능: ✓/✗" / "오일러 경로 가능: ✓/✗" — 즉시 판정
  - 진행 표시: "사용된 다리 X / 총 N"
  - 리셋 버튼
- 인터랙션:
  - 노드 클릭 → 경로에 추가 (직전 노드와 인접해야 함, 안 그러면 거부 + 흔들림)
  - 같은 엣지 두 번 → 거부 (이미 지난 엣지 표시)
  - 모든 엣지 사용 + 시작점 복귀 → *오일러 회로 클리어*
  - 모든 엣지 사용 + 다른 점 끝 → *오일러 경로 클리어*
- 하단 `<details>` 도움말:
  - 차수의 정의, 홀수/짝수 의미
  - 왜 쾨니히스베르크는 불가능했나

## CSS

- 다크 배경 + 강 푸른 톤
- 엣지 색: 미사용 회색, 사용 후 강조색
- 노드 차수 표 — 홀수 노드 빨강

## 카탈로그

```ts
{
  id: 'konigsberg',
  title: '쾨니히스베르크의 다리',
  emoji: '🌉',
  description: '7개 다리를 모두 정확히 한 번씩 건너 보세요. 오일러가 그래프 이론을 탄생시킨 그 문제!',
  difficulty: 'medium',
  href: '/puzzle/konigsberg',
  tag: '그래프 이론 🌉',
  category: 'puzzle',
}
```

## 검증

- tsc·eslint·build, 라우트 `/puzzle/konigsberg`
- 쾨니히스베르크: `hasEulerCircuit===false, hasEulerPath===false`
- 봉투: `hasEulerPath===true, hasEulerCircuit===false`
- 삼각형(또는 사각형): 둘 다 true
- 악수 정리: 모든 그래프에서 `sum(degrees) === 2 * edges.length`
- 정답 경로 입력 → `checkPath.ok===true, usedAllEdges===true`

## 코딩 가이드

- 외부 라이브러리 금지
- 엣지 id 는 unique, 다중 엣지 가능 (쾨니히스베르크는 2개 다리 = 2 엣지)
- 시각화 단순화: 그래프 좌표를 직접 정의 (자동 layout 알고리즘 안 씀)
