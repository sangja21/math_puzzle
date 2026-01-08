/**
 * 강 건너기 퍼즐 (River Crossing Puzzle)
 * 
 * 두 가지 모드 지원:
 * 1. 클래식 모드: 농부, 늑대, 양, 양배추
 * 2. 선교사와 식인종 모드: 선교사 3명, 식인종 3명
 */

// 게임 모드
export type GameMode = 'classic' | 'missionary';

// 캐릭터 정의 (확장)
export type Character = 
  | 'farmer' | 'wolf' | 'sheep' | 'cabbage'  // 클래식
  | 'missionary1' | 'missionary2' | 'missionary3'  // 선교사
  | 'cannibal1' | 'cannibal2' | 'cannibal3';  // 식인종

export interface CharacterInfo {
  id: Character;
  emoji: string;
  name: string;
  type?: 'missionary' | 'cannibal';  // 선교사/식인종 구분용
}

// 클래식 모드 캐릭터
export const CLASSIC_CHARACTERS: CharacterInfo[] = [
  { id: 'farmer', emoji: '🧑‍🌾', name: '농부' },
  { id: 'wolf', emoji: '🐺', name: '늑대' },
  { id: 'sheep', emoji: '🐑', name: '양' },
  { id: 'cabbage', emoji: '🥬', name: '양배추' },
];

// 선교사와 식인종 모드 캐릭터
export const MISSIONARY_CHARACTERS: CharacterInfo[] = [
  { id: 'missionary1', emoji: '⛪', name: '선교사1', type: 'missionary' },
  { id: 'missionary2', emoji: '⛪', name: '선교사2', type: 'missionary' },
  { id: 'missionary3', emoji: '⛪', name: '선교사3', type: 'missionary' },
  { id: 'cannibal1', emoji: '🦴', name: '식인종1', type: 'cannibal' },
  { id: 'cannibal2', emoji: '🦴', name: '식인종2', type: 'cannibal' },
  { id: 'cannibal3', emoji: '🦴', name: '식인종3', type: 'cannibal' },
];

// 모드별 설정
export interface ModeConfig {
  id: GameMode;
  name: string;
  description: string;
  characters: CharacterInfo[];
  boatCapacity: number;  // 배 정원
  requiresDriver: boolean;  // 농부(운전자) 필요 여부
  optimalMoves: number;  // 최적 이동 횟수
}

export const MODE_CONFIGS: Record<GameMode, ModeConfig> = {
  classic: {
    id: 'classic',
    name: '🐺 늑대와 양',
    description: '농부가 늑대, 양, 양배추를 안전하게 건너편으로!',
    characters: CLASSIC_CHARACTERS,
    boatCapacity: 1,  // 농부 외 1명
    requiresDriver: true,
    optimalMoves: 7,
  },
  missionary: {
    id: 'missionary',
    name: '⛪ 선교사와 식인종',
    description: '선교사 3명과 식인종 3명을 안전하게 건너편으로!',
    characters: MISSIONARY_CHARACTERS,
    boatCapacity: 2,  // 최대 2명
    requiresDriver: false,
    optimalMoves: 11,
  },
};

// 위치
export type Side = 'left' | 'right';

// 게임 상태
export interface GameState {
  mode: GameMode;
  leftBank: Character[];
  rightBank: Character[];
  boatSide: Side;
  boatPassengers: Character[];  // 복수 승객 지원
  moveCount: number;
  isGameOver: boolean;
  isComplete: boolean;
  gameOverReason: string;
  history: HistoryEntry[];
}

export interface HistoryEntry {
  from: Side;
  to: Side;
  passengers: Character[];
}

/**
 * 초기 게임 상태 생성
 */
export function createInitialState(mode: GameMode = 'classic'): GameState {
  const config = MODE_CONFIGS[mode];
  const allCharacters = config.characters.map(c => c.id);
  
  return {
    mode,
    leftBank: [...allCharacters],
    rightBank: [],
    boatSide: 'left',
    boatPassengers: [],
    moveCount: 0,
    isGameOver: false,
    isComplete: false,
    gameOverReason: '',
    history: [],
  };
}

/**
 * 캐릭터를 배에 태우기/내리기 토글
 */
export function toggleBoatPassenger(state: GameState, character: Character): GameState {
  if (state.isGameOver || state.isComplete) return state;
  
  const config = MODE_CONFIGS[state.mode];
  const currentBank = state.boatSide === 'left' ? state.leftBank : state.rightBank;
  
  // 클래식 모드에서 농부는 자동 탑승
  if (state.mode === 'classic' && character === 'farmer') return state;
  
  // 이미 배에 있으면 내리기
  if (state.boatPassengers.includes(character)) {
    return {
      ...state,
      boatPassengers: state.boatPassengers.filter(c => c !== character),
    };
  }
  
  // 캐릭터가 현재 강변에 있어야 함
  if (!currentBank.includes(character)) return state;
  
  // 클래식 모드: 농부가 같은 쪽에 있어야 함
  if (state.mode === 'classic' && !currentBank.includes('farmer')) return state;
  
  // 배 정원 체크
  if (state.boatPassengers.length >= config.boatCapacity) {
    // 정원 초과 시 첫 번째 승객 교체
    return {
      ...state,
      boatPassengers: [...state.boatPassengers.slice(1), character],
    };
  }
  
  return {
    ...state,
    boatPassengers: [...state.boatPassengers, character],
  };
}

/**
 * 배 이동 (강 건너기)
 */
export function crossRiver(state: GameState): GameState {
  if (state.isGameOver || state.isComplete) return state;
  
  const config = MODE_CONFIGS[state.mode];
  const fromSide = state.boatSide;
  const toSide: Side = fromSide === 'left' ? 'right' : 'left';
  
  let currentBank = fromSide === 'left' ? [...state.leftBank] : [...state.rightBank];
  let oppositeBank = toSide === 'left' ? [...state.leftBank] : [...state.rightBank];
  
  // 클래식 모드: 농부 필수
  if (config.requiresDriver) {
    if (!currentBank.includes('farmer')) return state;
    // 농부 이동
    const farmerIndex = currentBank.indexOf('farmer');
    currentBank.splice(farmerIndex, 1);
    oppositeBank.push('farmer');
  }
  
  // 선교사 모드: 최소 1명은 배에 있어야 함 (노 젓기)
  if (!config.requiresDriver && state.boatPassengers.length === 0) {
    return state;
  }
  
  // 승객들 이동
  const movedPassengers = [...state.boatPassengers];
  for (const passenger of state.boatPassengers) {
    const idx = currentBank.indexOf(passenger);
    if (idx !== -1) {
      currentBank.splice(idx, 1);
      oppositeBank.push(passenger);
    }
  }
  
  // 새 상태 생성
  const newState: GameState = {
    ...state,
    leftBank: fromSide === 'left' ? currentBank : oppositeBank,
    rightBank: fromSide === 'right' ? currentBank : oppositeBank,
    boatSide: toSide,
    boatPassengers: [],
    moveCount: state.moveCount + 1,
    history: [...state.history, {
      from: fromSide,
      to: toSide,
      passengers: movedPassengers,
    }],
  };
  
  // 위험 체크
  const danger = checkDanger(newState);
  if (danger) {
    return {
      ...newState,
      isGameOver: true,
      gameOverReason: danger,
    };
  }
  
  // 승리 체크
  if (checkWin(newState)) {
    return {
      ...newState,
      isComplete: true,
    };
  }
  
  return newState;
}

/**
 * 위험 상황 체크
 */
export function checkDanger(state: GameState): string | null {
  if (state.mode === 'classic') {
    return checkClassicDanger(state);
  } else {
    return checkMissionaryDanger(state);
  }
}

/**
 * 클래식 모드 위험 체크
 */
function checkClassicDanger(state: GameState): string | null {
  const farmerSide = state.leftBank.includes('farmer') ? 'left' : 'right';
  const unsupervisedBank = farmerSide === 'left' ? state.rightBank : state.leftBank;
  
  if (unsupervisedBank.includes('wolf') && unsupervisedBank.includes('sheep')) {
    return '🐺 늑대가 양을 잡아먹었습니다! 🐑💀';
  }
  
  if (unsupervisedBank.includes('sheep') && unsupervisedBank.includes('cabbage')) {
    return '🐑 양이 양배추를 먹어버렸습니다! 🥬💀';
  }
  
  return null;
}

/**
 * 선교사와 식인종 모드 위험 체크
 * 어느 쪽이든 식인종 수 > 선교사 수 이면 위험 (단, 선교사가 0명이면 상관없음)
 */
function checkMissionaryDanger(state: GameState): string | null {
  const countOnBank = (bank: Character[], type: 'missionary' | 'cannibal'): number => {
    return bank.filter(c => {
      const info = MISSIONARY_CHARACTERS.find(mc => mc.id === c);
      return info?.type === type;
    }).length;
  };
  
  // 왼쪽 강변 체크
  const leftMissionaries = countOnBank(state.leftBank, 'missionary');
  const leftCannibals = countOnBank(state.leftBank, 'cannibal');
  
  if (leftMissionaries > 0 && leftCannibals > leftMissionaries) {
    return '🦴 왼쪽 강변에서 식인종이 선교사를 잡아먹었습니다! ⛪💀';
  }
  
  // 오른쪽 강변 체크
  const rightMissionaries = countOnBank(state.rightBank, 'missionary');
  const rightCannibals = countOnBank(state.rightBank, 'cannibal');
  
  if (rightMissionaries > 0 && rightCannibals > rightMissionaries) {
    return '🦴 오른쪽 강변에서 식인종이 선교사를 잡아먹었습니다! ⛪💀';
  }
  
  return null;
}

/**
 * 승리 조건 체크
 */
export function checkWin(state: GameState): boolean {
  const config = MODE_CONFIGS[state.mode];
  return state.rightBank.length === config.characters.length;
}

/**
 * Undo - 마지막 이동 취소
 */
export function undoMove(state: GameState): GameState {
  if (state.history.length === 0) return state;
  if (state.isComplete) return state;
  
  const config = MODE_CONFIGS[state.mode];
  const newHistory = [...state.history];
  const lastMove = newHistory.pop()!;
  
  const fromSide = lastMove.to;
  const toSide = lastMove.from;
  
  let fromBank = fromSide === 'left' ? [...state.leftBank] : [...state.rightBank];
  let toBank = toSide === 'left' ? [...state.leftBank] : [...state.rightBank];
  
  // 클래식 모드: 농부 이동
  if (config.requiresDriver) {
    const farmerIdx = fromBank.indexOf('farmer');
    if (farmerIdx !== -1) fromBank.splice(farmerIdx, 1);
    toBank.push('farmer');
  }
  
  // 승객들 이동
  for (const passenger of lastMove.passengers) {
    const idx = fromBank.indexOf(passenger);
    if (idx !== -1) fromBank.splice(idx, 1);
    toBank.push(passenger);
  }
  
  return {
    ...state,
    leftBank: fromSide === 'left' ? fromBank : toBank,
    rightBank: fromSide === 'right' ? fromBank : toBank,
    boatSide: toSide,
    boatPassengers: [],
    moveCount: state.moveCount - 1,
    isGameOver: false,
    gameOverReason: '',
    history: newHistory,
  };
}

/**
 * 캐릭터 정보 조회
 */
export function getCharacterInfo(id: Character, mode: GameMode): CharacterInfo | undefined {
  const config = MODE_CONFIGS[mode];
  return config.characters.find(c => c.id === id);
}

/**
 * 힌트 생성
 */
export function getHint(state: GameState): string {
  if (state.mode === 'classic') {
    return getClassicHint(state);
  } else {
    return getMissionaryHint(state);
  }
}

// 클래식 모드 최적 해법
const CLASSIC_SOLUTION: HistoryEntry[] = [
  { from: 'left', to: 'right', passengers: ['sheep'] },
  { from: 'right', to: 'left', passengers: [] },
  { from: 'left', to: 'right', passengers: ['wolf'] },
  { from: 'right', to: 'left', passengers: ['sheep'] },
  { from: 'left', to: 'right', passengers: ['cabbage'] },
  { from: 'right', to: 'left', passengers: [] },
  { from: 'left', to: 'right', passengers: ['sheep'] },
];

function getClassicHint(state: GameState): string {
  const step = state.moveCount;
  
  if (step >= CLASSIC_SOLUTION.length) {
    return '🤔 최적 경로에서 벗어났어요. 다시 시작해보세요!';
  }
  
  const nextMove = CLASSIC_SOLUTION[step];
  const passenger = nextMove.passengers[0];
  
  if (passenger) {
    const info = getCharacterInfo(passenger, 'classic');
    return `💡 ${info?.emoji} ${info?.name}을(를) 데리고 ${nextMove.to === 'right' ? '건너세요' : '돌아오세요'}!`;
  } else {
    return `💡 혼자서 ${nextMove.to === 'right' ? '건너세요' : '돌아오세요'}!`;
  }
}

// 선교사 모드 최적 해법 (11단계)
const MISSIONARY_SOLUTION: HistoryEntry[] = [
  { from: 'left', to: 'right', passengers: ['cannibal1', 'cannibal2'] },
  { from: 'right', to: 'left', passengers: ['cannibal1'] },
  { from: 'left', to: 'right', passengers: ['cannibal1', 'cannibal3'] },
  { from: 'right', to: 'left', passengers: ['cannibal1'] },
  { from: 'left', to: 'right', passengers: ['missionary1', 'missionary2'] },
  { from: 'right', to: 'left', passengers: ['missionary1', 'cannibal1'] },
  { from: 'left', to: 'right', passengers: ['missionary1', 'missionary3'] },
  { from: 'right', to: 'left', passengers: ['cannibal2'] },
  { from: 'left', to: 'right', passengers: ['cannibal1', 'cannibal2'] },
  { from: 'right', to: 'left', passengers: ['cannibal1'] },
  { from: 'left', to: 'right', passengers: ['cannibal1', 'cannibal3'] },
];

function getMissionaryHint(state: GameState): string {
  const step = state.moveCount;
  
  if (step >= MISSIONARY_SOLUTION.length) {
    return '🤔 최적 경로에서 벗어났어요. 다시 시작해보세요!';
  }
  
  const nextMove = MISSIONARY_SOLUTION[step];
  const passengers = nextMove.passengers;
  
  const names = passengers.map(p => {
    const info = getCharacterInfo(p, 'missionary');
    return info?.type === 'missionary' ? '선교사' : '식인종';
  });
  
  const count = { missionary: 0, cannibal: 0 };
  passengers.forEach(p => {
    const info = getCharacterInfo(p, 'missionary');
    if (info?.type === 'missionary') count.missionary++;
    else count.cannibal++;
  });
  
  let hint = '💡 ';
  if (count.missionary > 0) hint += `선교사 ${count.missionary}명`;
  if (count.missionary > 0 && count.cannibal > 0) hint += ' + ';
  if (count.cannibal > 0) hint += `식인종 ${count.cannibal}명`;
  hint += `을 ${nextMove.to === 'right' ? '건너세요' : '돌아오세요'}!`;
  
  return hint;
}

/**
 * 해설
 */
export const CLASSIC_EXPLANATION = `
## 강 건너기 퍼즐 해법 (클래식)

### 핵심 통찰
이 퍼즐의 핵심은 **양**입니다!
- 양은 늑대에게도 위험하고, 양배추에게도 위험합니다.
- 따라서 양을 먼저 건너편에 데려다 놓아야 합니다.

### 최적 해법 (7단계)

1. 🐑 **양**을 데리고 건넌다
2. 혼자 돌아온다
3. 🐺 **늑대**를 데리고 건넌다
4. 🐑 **양**을 다시 데리고 돌아온다
5. 🥬 **양배추**를 데리고 건넌다
6. 혼자 돌아온다
7. 🐑 **양**을 데리고 건넌다 → 완료! 🎉
`;

export const MISSIONARY_EXPLANATION = `
## 선교사와 식인종 퍼즐 해법

### 핵심 규칙
- 배에는 **최대 2명**까지 탑승 가능
- 어느 쪽이든 **식인종 수 > 선교사 수**이면 선교사가 위험!
- 단, 선교사가 0명인 곳은 상관없음

### 최적 해법 (11단계)

1. 식인종 2명 → 오른쪽
2. 식인종 1명 ← 왼쪽
3. 식인종 2명 → 오른쪽
4. 식인종 1명 ← 왼쪽
5. 선교사 2명 → 오른쪽
6. 선교사1 + 식인종1 ← 왼쪽
7. 선교사 2명 → 오른쪽
8. 식인종 1명 ← 왼쪽
9. 식인종 2명 → 오른쪽
10. 식인종 1명 ← 왼쪽
11. 식인종 2명 → 오른쪽 → 완료! 🎉

### 핵심 전략
먼저 식인종들을 최대한 건너편에 보내놓고,
선교사들이 건널 때 항상 수적 우위를 유지해야 합니다!
`;
