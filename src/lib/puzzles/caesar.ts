/**
 * 카이사르 암호 퍼즐 게임 로직
 *
 * 핵심 메커니즘:
 * 1. 알파벳을 특정 칸수(shift)만큼 밀어서 암호화
 * 2. 암호화된 문자열을 보고 원래 문자열을 추측
 * 3. 단계별로 난이도가 상승 (힌트 감소, shift 범위 증가)
 */

// 알파벳 배열
export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// 단계별 설정
export interface StageConfig {
  level: number;
  stars: number;
  shiftRange: [number, number]; // [min, max]
  showShift: boolean; // shift 값을 보여줄지
  showWheelHint: boolean; // 휠 조작 힌트
  showFrequencyHint: boolean; // 빈도수 힌트
  storyText: string;
  storyEmoji: string;
}

export const STAGES: StageConfig[] = [
  {
    level: 1,
    stars: 1,
    shiftRange: [3, 3], // 고정 +3 (카이사르가 실제 사용)
    showShift: true,
    showWheelHint: true,
    showFrequencyHint: false,
    storyText:
      '기원전 50년, 로마의 장군 율리우스 카이사르는 적에게 메시지가 들키지 않도록 비밀 암호를 사용했어요. 그가 실제로 사용한 방법은 알파벳을 딱 3칸씩 밀어서 쓰는 것이었죠!',
    storyEmoji: '🏛️',
  },
  {
    level: 2,
    stars: 2,
    shiftRange: [1, 5],
    showShift: true,
    showWheelHint: true,
    showFrequencyHint: false,
    storyText:
      '이 암호는 너무 유명해서 "카이사르 암호"라는 이름이 붙었어요! 전 세계 모든 나라에서 암호학을 배울 때 가장 먼저 배우는 암호랍니다.',
    storyEmoji: '📜',
  },
  {
    level: 3,
    stars: 3,
    shiftRange: [1, 10],
    showShift: false,
    showWheelHint: true,
    showFrequencyHint: false,
    storyText:
      '로마 군대의 장군들만 이 암호를 풀 수 있었대요. 적군이 편지를 가로채도 내용을 알 수 없었죠. 너도 장군처럼 암호를 풀 수 있을까?',
    storyEmoji: '⚔️',
  },
  {
    level: 4,
    stars: 4,
    shiftRange: [1, 15],
    showShift: false,
    showWheelHint: true,
    showFrequencyHint: true,
    storyText:
      '알고 있니? 영어에서 가장 많이 쓰이는 글자는 E야! 암호문에서 가장 많이 나오는 글자가 뭔지 찾아보면 힌트가 될 수 있어.',
    storyEmoji: '🔍',
  },
  {
    level: 5,
    stars: 5,
    shiftRange: [1, 25],
    showShift: false,
    showWheelHint: true, // 휠은 보여주되, 힌트는 없음 (마스터 모드)
    showFrequencyHint: false,
    storyText:
      '축하해! 2000년이 넘는 시간이 지났지만 이 암호 방식은 여전히 암호학의 기초로 배운답니다. 너는 이제 진정한 카이사르 암호 해독 마스터야!',
    storyEmoji: '🎖️',
  },
];

// 문제 데이터
export interface Problem {
  plainText: string; // 원문
  hint: string; // 힌트 (한글 번역 또는 설명)
  difficulty: number; // 1-5
}

// 단계별 문제 목록
export const PROBLEMS: Problem[][] = [
  // Level 1 - 매우 쉬움 (짧은 단어)
  [
    { plainText: 'CAT', hint: '야옹~ 🐱', difficulty: 1 },
    { plainText: 'DOG', hint: '멍멍! 🐕', difficulty: 1 },
    { plainText: 'SUN', hint: '하늘에서 빛나요 ☀️', difficulty: 1 },
    { plainText: 'STAR', hint: '밤하늘에 반짝반짝 ⭐', difficulty: 1 },
    { plainText: 'MOON', hint: '밤에 뜨는 동그란 것 🌙', difficulty: 1 },
  ],
  // Level 2 - 쉬움 (두 단어)
  [
    { plainText: 'HELLO', hint: '반가워! 👋', difficulty: 2 },
    { plainText: 'APPLE', hint: '빨간 과일 🍎', difficulty: 2 },
    { plainText: 'HAPPY', hint: '기쁜 기분 😊', difficulty: 2 },
    { plainText: 'PIZZA', hint: '맛있는 동그란 음식 🍕', difficulty: 2 },
    { plainText: 'CANDY', hint: '달콤해요 🍬', difficulty: 2 },
  ],
  // Level 3 - 보통 (짧은 문장)
  [
    { plainText: 'HELLO WORLD', hint: '전 세계에 인사해요!', difficulty: 3 },
    { plainText: 'I LOVE YOU', hint: '사랑해 💕', difficulty: 3 },
    { plainText: 'GOOD MORNING', hint: '아침 인사 🌅', difficulty: 3 },
    { plainText: 'NICE TO MEET YOU', hint: '처음 만났을 때 하는 인사', difficulty: 3 },
    { plainText: 'HAVE A GOOD DAY', hint: '좋은 하루 보내세요!', difficulty: 3 },
  ],
  // Level 4 - 어려움 (긴 문장)
  [
    { plainText: 'THE SECRET MESSAGE', hint: '비밀 메시지', difficulty: 4 },
    { plainText: 'KNOWLEDGE IS POWER', hint: '아는 것이 힘이다', difficulty: 4 },
    { plainText: 'PRACTICE MAKES PERFECT', hint: '연습이 완벽을 만든다', difficulty: 4 },
    { plainText: 'TIME IS GOLD', hint: '시간은 금이다', difficulty: 4 },
    { plainText: 'NEVER GIVE UP', hint: '절대 포기하지 마!', difficulty: 4 },
  ],
  // Level 5 - 매우 어려움 (마스터)
  [
    { plainText: 'CAESAR WAS A GREAT GENERAL', hint: '카이사르는 위대한 장군이었다', difficulty: 5 },
    {
      plainText: 'ROME WAS NOT BUILT IN A DAY',
      hint: '로마는 하루아침에 이루어지지 않았다',
      difficulty: 5,
    },
    { plainText: 'VENI VIDI VICI', hint: '왔노라, 보았노라, 이겼노라! (카이사르의 명언)', difficulty: 5 },
    {
      plainText: 'ALL ROADS LEAD TO ROME',
      hint: '모든 길은 로마로 통한다',
      difficulty: 5,
    },
    {
      plainText: 'FORTUNE FAVORS THE BOLD',
      hint: '행운은 용감한 자의 편이다',
      difficulty: 5,
    },
  ],
];

// 게임 상태
export interface CaesarGameState {
  currentLevel: number; // 1-5
  currentProblemIndex: number;
  problem: Problem;
  shift: number;
  cipherText: string;
  userInput: string;
  isCorrect: boolean | null;
  showHint: boolean;
  userShiftGuess: number; // 사용자가 추측한 shift 값
  attempts: number;
  completedLevels: number[];
}

/**
 * 알파벳 문자인지 확인
 */
export function isAlpha(char: string): boolean {
  return /^[A-Za-z]$/.test(char);
}

/**
 * 암호화 함수 (shift만큼 알파벳 이동)
 */
export function encrypt(plainText: string, shift: number): string {
  return plainText
    .toUpperCase()
    .split('')
    .map((char) => {
      if (!isAlpha(char)) return char;
      const index = ALPHABET.indexOf(char);
      const newIndex = (index + shift) % 26;
      return ALPHABET[newIndex];
    })
    .join('');
}

/**
 * 복호화 함수 (shift만큼 역으로 이동)
 */
export function decrypt(cipherText: string, shift: number): string {
  return cipherText
    .toUpperCase()
    .split('')
    .map((char) => {
      if (!isAlpha(char)) return char;
      const index = ALPHABET.indexOf(char);
      const newIndex = (index - shift + 26) % 26;
      return ALPHABET[newIndex];
    })
    .join('');
}

/**
 * 알파벳 대응 테이블 생성
 */
export function getAlphabetMapping(shift: number): Record<string, string> {
  const mapping: Record<string, string> = {};
  for (let i = 0; i < 26; i++) {
    const originalChar = ALPHABET[i];
    const encryptedChar = ALPHABET[(i + shift) % 26];
    mapping[originalChar] = encryptedChar;
  }
  return mapping;
}

/**
 * 문자 빈도수 분석 (힌트용)
 */
export function getFrequencyAnalysis(text: string): Array<{ char: string; count: number; percentage: number }> {
  const freq: Record<string, number> = {};
  let totalLetters = 0;

  for (const char of text.toUpperCase()) {
    if (isAlpha(char)) {
      freq[char] = (freq[char] || 0) + 1;
      totalLetters++;
    }
  }

  return Object.entries(freq)
    .map(([char, count]) => ({
      char,
      count,
      percentage: totalLetters > 0 ? Math.round((count / totalLetters) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 랜덤 shift 값 생성
 */
export function getRandomShift(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 랜덤 문제 선택
 */
export function getRandomProblem(level: number): Problem {
  const problems = PROBLEMS[level - 1] || PROBLEMS[0];
  const randomIndex = Math.floor(Math.random() * problems.length);
  return problems[randomIndex];
}

/**
 * 초기 게임 상태 생성
 */
export function createInitialGameState(level: number = 1): CaesarGameState {
  const stageConfig = STAGES[level - 1] || STAGES[0];
  const problem = getRandomProblem(level);
  const shift = getRandomShift(stageConfig.shiftRange[0], stageConfig.shiftRange[1]);
  const cipherText = encrypt(problem.plainText, shift);

  return {
    currentLevel: level,
    currentProblemIndex: 0,
    problem,
    shift,
    cipherText,
    userInput: '',
    isCorrect: null,
    showHint: false,
    userShiftGuess: 0,
    attempts: 0,
    completedLevels: [],
  };
}

/**
 * 다음 문제로 진행
 */
export function nextProblem(state: CaesarGameState): CaesarGameState {
  const stageConfig = STAGES[state.currentLevel - 1] || STAGES[0];
  const problem = getRandomProblem(state.currentLevel);
  const shift = getRandomShift(stageConfig.shiftRange[0], stageConfig.shiftRange[1]);
  const cipherText = encrypt(problem.plainText, shift);

  return {
    ...state,
    currentProblemIndex: state.currentProblemIndex + 1,
    problem,
    shift,
    cipherText,
    userInput: '',
    isCorrect: null,
    showHint: false,
    userShiftGuess: 0,
    attempts: 0,
  };
}

/**
 * 다음 레벨로 진행
 */
export function nextLevel(state: CaesarGameState): CaesarGameState {
  const newLevel = Math.min(state.currentLevel + 1, 5);
  const completedLevels = [...state.completedLevels];
  if (!completedLevels.includes(state.currentLevel)) {
    completedLevels.push(state.currentLevel);
  }

  return {
    ...createInitialGameState(newLevel),
    completedLevels,
  };
}

/**
 * 정답 체크
 */
export function checkAnswer(state: CaesarGameState): CaesarGameState {
  const userAnswer = state.userInput.toUpperCase().trim();
  const correctAnswer = state.problem.plainText.toUpperCase().trim();
  const isCorrect = userAnswer === correctAnswer;

  return {
    ...state,
    isCorrect,
    attempts: state.attempts + 1,
  };
}

/**
 * 사용자 입력 업데이트
 */
export function updateUserInput(state: CaesarGameState, input: string): CaesarGameState {
  return {
    ...state,
    userInput: input.toUpperCase(),
    isCorrect: null, // 입력 변경 시 결과 초기화
  };
}

/**
 * shift 추측 업데이트
 */
export function updateShiftGuess(state: CaesarGameState, shift: number): CaesarGameState {
  const decryptedPreview = decrypt(state.cipherText, shift);
  return {
    ...state,
    userShiftGuess: shift,
    userInput: decryptedPreview,
  };
}

/**
 * 힌트 토글
 */
export function toggleHint(state: CaesarGameState): CaesarGameState {
  return {
    ...state,
    showHint: !state.showHint,
  };
}

/**
 * 스테이지 설정 가져오기
 */
export function getStageConfig(level: number): StageConfig {
  return STAGES[level - 1] || STAGES[0];
}

/**
 * 별 문자열 생성
 */
export function getStarsString(count: number): string {
  return '⭐'.repeat(count);
}

/**
 * 역사 스토리 콘텐츠
 */
export const HISTORY_STORIES = {
  intro: `🏛️ **카이사르 암호의 탄생**

기원전 50년경, 로마 제국의 위대한 장군 율리우스 카이사르(Julius Caesar)는 
전쟁터에서 비밀 메시지를 보내야 했어요.

적군이 메시지를 가로채도 내용을 알 수 없게 하기 위해,
그는 알파벳을 밀어서 쓰는 간단하지만 효과적인 방법을 생각해냈죠!`,

  howItWorks: `🔐 **이렇게 작동해요!**

예를 들어, 알파벳을 3칸 밀면:
• A → D
• B → E
• C → F
• ...
• Z → C (다시 처음으로!)

그래서 "HELLO"는 "KHOOR"가 돼요!`,

  historical: `📚 **역사적 사실**

• 카이사르는 실제로 +3 이동을 가장 많이 사용했대요
• 이 암호는 약 2000년 전에 만들어졌어요
• 지금도 암호학의 기초로 전 세계에서 배운답니다
• 현대의 복잡한 암호들도 이런 원리에서 시작됐어요!`,

  funFacts: `🎯 **재미있는 사실들**

• 카이사르의 조카 아우구스투스는 +1 이동을 사용했대요
• 알파벳이 26개니까, 가능한 암호 방법은 25가지예요
• "VENI, VIDI, VICI" (왔노라, 보았노라, 이겼노라)는 카이사르의 유명한 말이에요!`,
};
