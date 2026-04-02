// 함수 기계 (Function Machine) 퍼즐 로직

export interface Stage {
  id: number;
  title: string;
  description: string;
  fn: (x: number) => number;
  // 정답 수식 토큰: 예) ['입력', '+', '3']
  answerTokens: string[];
  // 테스트용 입력 숫자들
  testInputs: number[];
  hint: string;
}

export const STAGES: Stage[] = [
  {
    id: 1,
    title: '1단계: 워밍업',
    description: '규칙이 두 개 숨어있어요!',
    fn: (x) => x * 3 + 2,
    answerTokens: ['입력', '×', '3', '+', '2'],
    testInputs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    hint: '먼저 곱하기를 찾고, 그 다음 더하기를 생각해보세요!',
  },
  {
    id: 2,
    title: '2단계: 자기 자신',
    description: '이번엔 숫자가 엄청 커지네요!',
    fn: (x) => x * x,
    answerTokens: ['입력', '×', '입력'],
    testInputs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    hint: '"입력" 블록은 여러 번 쓸 수 있어요! 1→1, 2→4, 3→9 를 보세요...',
  },
  {
    id: 3,
    title: '3단계: 제곱 + α',
    description: '제곱에 뭔가 더해졌어요!',
    fn: (x) => x * x + 1,
    answerTokens: ['입력', '×', '입력', '+', '1'],
    testInputs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    hint: '2단계 결과에서 뭐가 달라졌는지 비교해보세요!',
  },
  {
    id: 4,
    title: '4단계: 제곱 - 자기 자신',
    description: '이번엔 빼기도 등장합니다!',
    fn: (x) => x * x - x,
    answerTokens: ['입력', '×', '입력', '-', '입력'],
    testInputs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    hint: '1→0, 2→2, 3→6... 제곱에서 뭘 빼면 이 숫자가 될까요?',
  },
  {
    id: 5,
    title: '5단계: 최종 보스',
    description: '모든 걸 합쳐볼 시간!',
    fn: (x) => x * x + x + 1,
    answerTokens: ['입력', '×', '입력', '+', '입력', '+', '1'],
    testInputs: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    hint: '제곱 + 자기 자신 + 상수... 세 가지가 합쳐져 있어요!',
  },
];

// 수식 토큰 팔레트에 제공할 블록들
export const FORMULA_BLOCKS = {
  variable: ['입력'],
  operators: ['+', '-', '×', '÷'],
  numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
};

// 사용자가 조립한 수식 토큰을 평가
export function evaluateFormula(tokens: string[], x: number): number | null {
  if (tokens.length === 0) return null;

  // 토큰을 숫자/연산자로 변환
  const values: number[] = [];
  const ops: string[] = [];

  for (const token of tokens) {
    if (token === '입력') {
      values.push(x);
    } else if (['+', '-', '×', '÷'].includes(token)) {
      ops.push(token);
    } else {
      const num = parseInt(token, 10);
      if (isNaN(num)) return null;
      values.push(num);
    }
  }

  if (values.length === 0) return null;
  if (values.length - 1 !== ops.length) return null;

  // 곱셈/나눗셈 우선 처리
  const valStack = [values[0]];
  const opStack: string[] = [];

  for (let i = 0; i < ops.length; i++) {
    if (ops[i] === '×' || ops[i] === '÷') {
      const prev = valStack.pop()!;
      if (ops[i] === '×') {
        valStack.push(prev * values[i + 1]);
      } else {
        if (values[i + 1] === 0) return null;
        valStack.push(prev / values[i + 1]);
      }
    } else {
      opStack.push(ops[i]);
      valStack.push(values[i + 1]);
    }
  }

  // 덧셈/뺄셈 처리
  let result = valStack[0];
  for (let i = 0; i < opStack.length; i++) {
    if (opStack[i] === '+') {
      result += valStack[i + 1];
    } else {
      result -= valStack[i + 1];
    }
  }

  return result;
}

// 수식이 정답과 동일한 함수인지 검증 (여러 입력으로 테스트)
export function validateFormula(tokens: string[], stage: Stage): boolean {
  for (const x of stage.testInputs) {
    const userResult = evaluateFormula(tokens, x);
    const expected = stage.fn(x);
    if (userResult !== expected) return false;
  }
  return true;
}
