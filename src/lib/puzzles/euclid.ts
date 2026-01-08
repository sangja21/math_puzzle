/**
 * Euclidean Game (Euclid's Algorithm Game) implementation
 *
 * 두 정수 a, b (a ≥ b) 가 주어집니다.
 * 한 턴에 현재 큰 수에서 작은 수의 양의 배수를 빼서 새로운 쌍을 만듭니다.
 * 빼는 값은 1·b, 2·b, … , k·b (k·b ≤ a) 중 선택 가능합니다.
 * 어느 한쪽이 0이 되면 그 턴의 플레이어가 승리합니다.
 *
 * 이 퍼즐은 유클리드 호제법을 게임 형태로 체험하게 하며, 최적 전략을 탐구합니다.
 */

export interface EuclidState {
  a: number; // 큰 수 (항상 a >= b)
  b: number; // 작은 수
  turn: number; // 0 = Player, 1 = Opponent (AI)
  history: { a: number; b: number; turn: number }[]; // 진행 기록
  isComplete: boolean;
  winner: number | null; // 0 or 1
}

/** 초기 상태 생성 */
export function createInitialState(a: number, b: number): EuclidState {
  if (a < b) [a, b] = [b, a];
  return {
    a,
    b,
    turn: 0,
    history: [],
    isComplete: false,
    winner: null,
  };
}

/** 가능한 이동 목록 반환 (배수 값들) */
export function getValidMoves(state: EuclidState): number[] {
  const { a, b } = state;
  if (b <= 0) return []; // Safety check
  
  const maxMultiple = Math.floor(a / b);
  // UI 렌더링 부하 방지 및 Array limit 제한 (최대 50개)
  const limit = Math.min(maxMultiple, 50); 
  
  const moves: number[] = [];
  for (let k = 1; k <= limit; k++) {
    moves.push(k * b);
  }
  
  if (limit < maxMultiple) {
    moves.push(maxMultiple * b);
  }
  
  return moves;
}

/** 한 턴 진행 */
export function applyMove(state: EuclidState, subtract: number): EuclidState {
  if (state.isComplete) return state;
  const { a, b, turn } = state;
  const newA = a - subtract;
  const newB = b;
  // 새 쌍을 정렬 (큰 수가 a)
  const [nextA, nextB] = newA >= newB ? [newA, newB] : [newB, newA];
  const completed = nextA === 0 || nextB === 0;
  const winner = completed ? turn : null;
  return {
    a: nextA,
    b: nextB,
    turn: (turn + 1) % 2,
    history: [...state.history, { a, b, turn }],
    isComplete: completed,
    winner,
  };
}

/** 승리 판단 (이론) – 최적 전략 여부 */
// true: 현재 턴의 플레이어가 최적의 수를 두면 이길 수 있음
// false: 상대가 최적의 수를 두면 현재 플레이어는 질 수밖에 없음
export function isWinningPosition(a: number, b: number): boolean {
  if (b === 0) return false;
  // 황금비(phi) 판별법: a > phi * b 이면 승리 위치 (일반적으로 a/b >= 2면 무조건 승리)
  if (a / b >= 2) return true;
  return !isWinningPosition(b, a - b);
}

/** AI 최적수 계산 */
// 반환값: 선택해야 할 k (배수)
export function getBestMove(state: EuclidState): number {
  const { a, b } = state;
  if (b === 0) return 0;

  const maxK = Math.floor(a / b);
  
  // 1. a/b >= 2 라면, 내가 승패를 조절할 수 있음.
  // 상대를 패배 위치(!isWinningPosition)로 보내는 k를 찾는다.
  // (사실 a/b >= 2면, k를 적절히 골라 무조건 상대를 지게 할 수 있음)
  
  for (let k = 1; k <= maxK; k++) {
    const nextA = a - k * b;
    const nextB = b;
    // 정렬
    const [nA, nB] = nextA >= nextB ? [nextA, nextB] : [nextB, nextA];
    
    // 다음 상태가 상대방에게 '패배 위치(false)'라면, 나에게는 이 k가 필승수
    if (!isWinningPosition(nA, nB)) {
      return k;
    }
  }

  // 필승수가 없다면(내가 질 상황이라면), 최대한 버티거나 랜덤
  // 보통은 1 or maxK 등을 선택
  return Math.max(1, Math.floor(maxK / 2));
}

/** 해설 텍스트 */
export const EXPLANATION = `
## Euclidean Game (유클리드 게임)

### 규칙
1. 두 양의 정수 **a ≥ b** 가 주어집니다.
2. 현재 큰 수 **a** 에서 **b** 의 양의 배수(1·b, 2·b, …, k·b ≤ a)를 선택해 **a - k·b** 로 바꿉니다.
3. 새로운 쌍을 정렬해 다시 **a ≥ b** 가 되도록 합니다.
4. 어느 한쪽이 **0** 이 되면 그 턴을 만든 플레이어가 승리합니다.

### 수학적 배경
- **유클리드 호제법**의 시각적 변형입니다.
- **승리 전략**: 
  - 만약 \`a / b ≥ 2\` 라면(즉 직사각형이 충분히 길쭉하면), 당신은 원하는 만큼 잘라내어 상대를 곤란한 상황(\`1 < a'/b' < 2\`)에 빠뜨릴 수 있습니다.
  - 이를 **황금비(Golden Ratio)**와 연결지어 생각할 수 있습니다. \`a/b > ϕ (1.618...)\` 이면 승리할 확률이 높습니다.

### 팁
- **AI 대전**: AI는 항상 최적의 수를 계산합니다. 실수하는 순간 바로 집니다!
- **선공/후공**: 초기 숫자에 따라 승패가 정해져 있습니다. 예를 들어 (32, 12)는 선공 승리, (13, 8)은 후공 승리입니다. 이길 수 없는 판이라면 숫자를 바꿔보세요.
`;
