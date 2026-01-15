/**
 * 완전제곱수 기하 시각화 로직
 * 
 * 핵심 메커니즘:
 * 1. n²은 한 변의 길이가 n인 정사각형의 넓이
 * 2. (n+1)² 로 확장할 때 ㄴ자 모양의 블록이 추가됨
 * 3. 추가되는 블록 개수 = 2n + 1 (항상 홀수)
 * 4. 따라서 n² = 1 + 3 + 5 + ... + (2n-1)
 */

export interface TileInfo {
  x: number;           // x 좌표 (0-indexed)
  y: number;           // y 좌표 (0-indexed)
  addedAt: number;     // 몇 번째 단계에서 추가되었는지 (1-indexed)
  isNew: boolean;      // 현재 단계에서 새로 추가된 타일인지
  isLShape: boolean;   // ㄴ자 블록의 일부인지
}

export interface SquareState {
  n: number;           // 현재 정사각형 크기
  tiles: TileInfo[];   // 모든 타일 정보
  totalTiles: number;  // 총 타일 수 = n²
  newTiles: number;    // 새로 추가된 타일 수 = 2n - 1
  oddSum: number[];    // 홀수 합 배열: [1, 3, 5, ...]
}

export const MIN_N = 1;
export const MAX_N = 10;

// 단계별 색상 (무지개 그라데이션)
export const LAYER_COLORS = [
  '#ef4444', // n=1: 빨강
  '#f97316', // n=2: 주황
  '#eab308', // n=3: 노랑
  '#84cc16', // n=4: 라임
  '#22c55e', // n=5: 초록
  '#14b8a6', // n=6: 청록
  '#06b6d4', // n=7: 시안
  '#3b82f6', // n=8: 파랑
  '#8b5cf6', // n=9: 보라
  '#ec4899', // n=10: 핑크
];

/**
 * n x n 정사각형의 타일 정보 생성
 */
export function createSquareState(n: number): SquareState {
  const safeN = Math.min(Math.max(n, MIN_N), MAX_N);
  const tiles: TileInfo[] = [];
  
  // 모든 타일 생성 및 소속 단계 계산
  for (let y = 0; y < safeN; y++) {
    for (let x = 0; x < safeN; x++) {
      // 이 타일이 몇 번째 단계에서 추가되었는지 계산
      // (x, y) 타일은 max(x, y) + 1 단계에서 추가됨
      const addedAt = Math.max(x, y) + 1;
      
      tiles.push({
        x,
        y,
        addedAt,
        isNew: addedAt === safeN,
        isLShape: addedAt === safeN && (x === safeN - 1 || y === safeN - 1),
      });
    }
  }
  
  // 홀수 합 배열 생성
  const oddSum: number[] = [];
  for (let i = 1; i <= safeN; i++) {
    oddSum.push(2 * i - 1);
  }
  
  return {
    n: safeN,
    tiles,
    totalTiles: safeN * safeN,
    newTiles: safeN === 1 ? 1 : 2 * safeN - 1,
    oddSum,
  };
}

/**
 * ㄴ자 블록의 타일들만 반환
 */
export function getLShapeTiles(state: SquareState): TileInfo[] {
  return state.tiles.filter(t => t.isNew);
}

/**
 * 특정 단계까지의 타일들만 반환 (애니메이션용)
 */
export function getTilesUpTo(n: number, currentN: number): TileInfo[] {
  const state = createSquareState(n);
  return state.tiles.filter(t => t.addedAt <= currentN);
}

/**
 * 수식 텍스트 생성
 */
export function getFormula(n: number): {
  squareFormula: string;
  differenceFormula: string;
  sumFormula: string;
} {
  const nSquared = n * n;
  const nextSquared = (n + 1) * (n + 1);
  const difference = 2 * n + 1;
  
  // 홀수 합 수식
  const oddNumbers = [];
  for (let i = 1; i <= n; i++) {
    oddNumbers.push(2 * i - 1);
  }
  const sumFormula = oddNumbers.length > 0 
    ? `${oddNumbers.join(' + ')} = ${nSquared}`
    : '0';
  
  return {
    squareFormula: `${n}² = ${nSquared}`,
    differenceFormula: `(${n + 1})² − ${n}² = ${nextSquared} − ${nSquared} = ${difference}`,
    sumFormula,
  };
}

/**
 * 해설 텍스트
 */
export const EXPLANATION = `
## 🎯 완전제곱수의 기하학적 비밀

### 📐 ㄴ자 블록의 원리

n×n 정사각형에서 (n+1)×(n+1) 정사각형으로 확장할 때,
**ㄴ자 모양의 블록**이 추가됩니다.

이 ㄴ자 블록은:
- **오른쪽 열**: n개의 타일
- **아래 행**: n개의 타일  
- **모서리**: 1개의 타일 (오른쪽 아래)

하지만 오른쪽 열과 아래 행이 모서리에서 겹치므로:
**n + n + 1 - 0 = 2n + 1** 개의 타일이 추가됩니다!

### 🔢 왜 항상 홀수일까?

**2n + 1**은 n이 어떤 자연수든:
- n=1: 2(1)+1 = **3**
- n=2: 2(2)+1 = **5**
- n=3: 2(3)+1 = **7**
- ...

**항상 홀수**가 됩니다!

### 📊 연속 홀수의 합 = 제곱수

따라서:
- 1² = **1**
- 2² = 1 + **3** = 4
- 3² = 1 + 3 + **5** = 9
- 4² = 1 + 3 + 5 + **7** = 16
- ...
- **n² = 1 + 3 + 5 + ... + (2n-1)**

### 💡 대수적 증명

\`\`\`
(n+1)² = n² + 2n + 1
\`\`\`

이 공식이 기하적으로:
- n² = 기존 정사각형
- 2n = 오른쪽 열(n개) + 아래 행(n개)
- 1 = 오른쪽 아래 모서리

### ✨ 교육적 의미

이 시각화는 **대수**와 **기하**가 어떻게 연결되는지 보여줍니다.
수식 (n+1)² = n² + 2n + 1 은 단순한 공식이 아니라,
**실제로 정사각형이 어떻게 자라나는지**를 표현한 것입니다!
`;

/**
 * 관찰 포인트
 */
export const OBSERVATION_POINTS = [
  '왜 항상 추가되는 블록의 개수가 홀수인가?',
  '왜 제곱수는 연속된 홀수의 합으로 표현되는가?',
  '대수적 식 (n+1)² = n² + 2n + 1 이 기하적으로 어떻게 구현되는가?',
];
