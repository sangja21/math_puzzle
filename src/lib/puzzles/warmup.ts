/**
 * 워밍업 퍼즐 - 카이사르 암호 전 준비 운동
 *
 * 숫자 규칙 찾기 미션으로 패턴 감각을 깨워요.
 */

// 1단계: 숫자 변신 문제
export interface NumberPuzzle {
  examples: Array<{ from: number; to: number }>;
  question: number;
  answer: number;
  rule: string; // 규칙 설명
}

export const NUMBER_PUZZLES: NumberPuzzle[] = [
  {
    examples: [
      { from: 1, to: 2 },
      { from: 5, to: 6 },
      { from: 10, to: 11 },
    ],
    question: 100,
    answer: 101,
    rule: '+1 (모든 숫자에 1을 더해요!)',
  },
  {
    examples: [
      { from: 2, to: 4 },
      { from: 5, to: 7 },
      { from: 10, to: 12 },
    ],
    question: 50,
    answer: 52,
    rule: '+2 (모든 숫자에 2를 더해요!)',
  },
  {
    examples: [
      { from: 3, to: 6 },
      { from: 5, to: 8 },
      { from: 10, to: 13 },
    ],
    question: 20,
    answer: 23,
    rule: '+3 (모든 숫자에 3을 더해요!)',
  },
];

// 게임 상태
export interface WarmupGameState {
  currentPuzzleIndex: number;
  userAnswer: string;
  isCorrect: boolean | null;
  showHint: boolean;
  attempts: number;
  completed: boolean;
}

// 초기 상태
export function createWarmupGameState(): WarmupGameState {
  return {
    currentPuzzleIndex: 0,
    userAnswer: '',
    isCorrect: null,
    showHint: false,
    attempts: 0,
    completed: false,
  };
}

// 정답 체크 (숫자)
export function checkNumberAnswer(state: WarmupGameState, puzzleIndex: number): boolean {
  const puzzle = NUMBER_PUZZLES[puzzleIndex];
  const userNum = parseInt(state.userAnswer, 10);
  return userNum === puzzle.answer;
}

// 스토리 텍스트
export const WARMUP_STORIES = {
  intro: `🕵️ **비밀요원 입단 테스트**

로마 시대 장군 카이사르의 암호를 풀기 전에,
먼저 간단한 테스트를 통과해야 해요!

규칙을 찾아서 암호를 풀 수 있는지 확인해볼게요.`,

  puzzle: `🔢 **숫자 변신 퀴즈**

숫자들이 어떤 규칙으로 변했는지 찾아보세요!
규칙을 찾으면 물음표에 들어갈 숫자도 알 수 있어요.`,

  complete: `🎉 **입단 테스트 통과!**

축하해요! 이제 숫자 자물쇠 미션으로 "규칙을 찾아 밀기" 감각을 더 단단히 만들어봐요!`,
};
