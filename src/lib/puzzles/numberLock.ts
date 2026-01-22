/**
 * 숫자 밀기 자물쇠 퍼즐 데이터와 유틸리티
 */

export interface NumberLockStage {
  id: number;
  title: string;
  description: string;
  answer: string;
  shift: number;
  hint: string;
  story: string;
  rule: string;
  encrypted: string;
  examples: Array<{ from: number; to: number }>;
}

const DIGIT_BASE = 10;

function shiftDigit(digit: string, shift: number): string {
  const value = parseInt(digit, 10);
  if (Number.isNaN(value)) return digit;

  const offset = (value + shift + DIGIT_BASE) % DIGIT_BASE;
  return offset.toString();
}

export function applyDigitShift(code: string, shift: number): string {
  return code
    .split('')
    .map((digit) => (/[0-9]/.test(digit) ? shiftDigit(digit, shift) : digit))
    .join('');
}

interface StageConfig {
  id: number;
  title: string;
  description: string;
  answer: string;
  shift: number;
  hint: string;
  story: string;
  exampleDigits?: number[];
}

function createLockStage(config: StageConfig): NumberLockStage {
  const direction = config.shift >= 0 ? '앞으로' : '뒤로';
  const steps = Math.abs(config.shift);
  const encrypted = applyDigitShift(config.answer, config.shift);
  const exampleDigits = config.exampleDigits ?? [1, 8];

  return {
    id: config.id,
    title: config.title,
    description: config.description,
    answer: config.answer,
    shift: config.shift,
    hint: config.hint,
    story: config.story,
    rule: `다이얼 숫자를 ${direction} ${steps}칸 돌린 값이에요. (mod 10)`,
    encrypted,
    examples: exampleDigits.map((digit) => ({
      from: digit,
      to: parseInt(shiftDigit(`${digit}`, config.shift), 10),
    })),
  };
}

export const NUMBER_LOCK_STAGES: NumberLockStage[] = [
  createLockStage({
    id: 1,
    title: '1단계 · 현관 자물쇠',
    description: '카메라에는 4252가 찍혔는데, 장난꾸러기가 모든 다이얼을 한 칸 더 돌려놨어요.',
    answer: '3141',
    shift: 1,
    hint: '숫자가 모두 한 칸 “앞으로” 움직였다고 생각해 보세요!',
    story: '연구실 문을 열어야 해요. 경비 로봇이 “모든 숫자가 +1이 되어 있었어요!”라고 말했어요.',
    exampleDigits: [3, 9],
  }),
  createLockStage({
    id: 2,
    title: '2단계 · 발전실 금고',
    description: '측정기에는 1397이 보이지만, 엔지니어가 다이얼이 세 칸이나 밀렸다고 알려줬어요.',
    answer: '8064',
    shift: 3,
    hint: '0이 3이 되고, 6이 9가 되니까 모두 +3이죠?',
    story: '커다란 발전기를 켜려면 이 금고를 열어야 해요. 기계가 빨리 돌아가면서 숫자들이 전부 +3이 되었다네요.',
    exampleDigits: [0, 6],
  }),
  createLockStage({
    id: 3,
    title: '3단계 · 비상 통신실',
    description: '경고등은 2460을 비추지만, 이번에는 두 칸씩 “뒤로” 돌려야 맞는 숫자가 나와요.',
    answer: '4682',
    shift: -2,
    hint: '6이 4가 되고, 2가 0이 되는 느낌! 모두 -2예요.',
    story: '마지막 문이에요! 비상무전기가 거꾸로 돌아가면서 모든 숫자가 -2칸으로 움직였어요.',
    exampleDigits: [2, 6],
  }),
];

export const NUMBER_LOCK_STORY = {
  intro: `🔒 **암호 자물쇠 미션**

카이사르 암호를 배우기 전에, 숫자를 살짝 밀어 여는 연습을 해요.
모든 자물쇠는 “같은 만큼” 숫자가 움직였다는 사실만 기억하면 돼요!`,
  complete: `🎯 **보안 통로 확보 완료!**

숫자를 밀고 당기는 법을 몸으로 느꼈어요.
이제 진짜 카이사르 암호 통신 채널도 문제없겠죠?`,
};
