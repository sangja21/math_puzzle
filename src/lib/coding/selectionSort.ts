/**
 * SelectionSortStepper – 순수 로직 (UI 의존 X)
 *
 * 핵심 메커니즘 3줄 요약:
 * 1. currentIndex(i)를 고정하고, scanIndex(j)를 i+1부터 끝까지 순회하며 최소값을 찾는다.
 * 2. 한 pass가 끝나면 currentIndex와 minIndex를 swap하고, 다음 pass로 넘어간다.
 * 3. 버블정렬이 매 비교마다 swap하는 것과 달리, 선택정렬은 pass당 최대 1번 swap한다.
 */

export type SelectionBlock = {
  id: string;
  value: number;
  color: string;
  label?: string;
};

/** step()이 반환하는 단일 프레임의 스냅샷 */
export type SelectionStepResult = {
  /** 배열의 현재 상태 (deep clone) */
  array: SelectionBlock[];
  /** 현재 고정 위치 (pass의 시작 인덱스) */
  currentIndex: number;
  /** 현재 스캔(비교) 위치 */
  scanIndex: number;
  /** 현재까지 찾은 최소값의 인덱스 */
  minIndex: number;
  /** pass 번호 (0-based) */
  pass: number;
  /** 정렬 완료 여부 */
  completed: boolean;
  /** 이 step에서 swap이 발생했는지 */
  didSwap: boolean;
  /** 이 step에서 minIndex가 갱신되었는지 */
  didUpdateMin: boolean;
  /** 비교 대상 두 값 [minIndex 값, scanIndex 값] */
  comparedValues: [number, number];
  /** 이 step이 scan 종료 후 swap 처리 단계인지 */
  isSwapStep: boolean;
  /** 누적 비교 횟수 */
  compareCount: number;
  /** 누적 swap 횟수 */
  swapCount: number;
  /** 설명 텍스트 */
  description: string;
};

const cloneBlocks = (blocks: SelectionBlock[]): SelectionBlock[] =>
  blocks.map((block) => ({ ...block }));

/**
 * Trace 방식: 사전에 모든 step을 계산하여 배열로 반환
 * (기존 bubbleSort.ts의 패턴과 일관성 유지)
 */
export type SelectionSortTrace = {
  steps: SelectionStepResult[];
  sorted: SelectionBlock[];
};

export const createSelectionSortTrace = (
  input: SelectionBlock[],
): SelectionSortTrace => {
  const working = cloneBlocks(input);
  const steps: SelectionStepResult[] = [];
  const n = working.length;
  let compareCount = 0;
  let swapCount = 0;

  for (let i = 0; i < n - 1; i += 1) {
    let minIdx = i;

    // scan 단계: j를 i+1부터 끝까지 순회
    for (let j = i + 1; j < n; j += 1) {
      compareCount += 1;
      const didUpdateMin = working[j].value < working[minIdx].value;

      const description = didUpdateMin
        ? `${working[j].value}과(와) ${working[minIdx].value}을(를) 비교합니다. ${working[j].value}이(가) 더 작으므로 새로운 최소값입니다!`
        : `${working[j].value}과(와) ${working[minIdx].value}을(를) 비교합니다. 현재 최소값을 유지합니다.`;

      if (didUpdateMin) {
        minIdx = j;
      }

      steps.push({
        array: cloneBlocks(working),
        currentIndex: i,
        scanIndex: j,
        minIndex: minIdx,
        pass: i,
        completed: false,
        didSwap: false,
        didUpdateMin,
        comparedValues: [working[minIdx].value, working[j].value],
        isSwapStep: false,
        compareCount,
        swapCount,
        description,
      });
    }

    // swap 단계
    const didSwap = minIdx !== i;
    if (didSwap) {
      swapCount += 1;
      const description = `최소값 ${working[minIdx].value}을(를) ${i}번 위치의 ${working[i].value}과(와) 교환합니다!`;
      [working[i], working[minIdx]] = [working[minIdx], working[i]];

      steps.push({
        array: cloneBlocks(working),
        currentIndex: i,
        scanIndex: -1,
        minIndex: minIdx,
        pass: i,
        completed: false,
        didSwap: true,
        didUpdateMin: false,
        comparedValues: [working[i].value, working[minIdx].value],
        isSwapStep: true,
        compareCount,
        swapCount,
        description,
      });
    } else {
      const description = `${i}번 위치의 ${working[i].value}이(가) 이미 최소값이므로 교환하지 않습니다.`;
      steps.push({
        array: cloneBlocks(working),
        currentIndex: i,
        scanIndex: -1,
        minIndex: minIdx,
        pass: i,
        completed: false,
        didSwap: false,
        didUpdateMin: false,
        comparedValues: [working[i].value, working[i].value],
        isSwapStep: true,
        compareCount,
        swapCount,
        description,
      });
    }
  }

  // 완료 step
  steps.push({
    array: cloneBlocks(working),
    currentIndex: n - 1,
    scanIndex: -1,
    minIndex: n - 1,
    pass: n - 1,
    completed: true,
    didSwap: false,
    didUpdateMin: false,
    comparedValues: [working[n - 1].value, working[n - 1].value],
    isSwapStep: false,
    compareCount,
    swapCount,
    description: '정렬이 완료되었습니다! 🎉',
  });

  return { steps, sorted: working };
};

/** 배열 셔플 (Fisher-Yates) */
export const shuffleBlocks = (blocks: SelectionBlock[]): SelectionBlock[] => {
  const shuffled = cloneBlocks(blocks);
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/** 랜덤 블럭 생성 */
const BLOCK_COLORS = [
  '#f87171', '#fb923c', '#facc15', '#4ade80', '#38bdf8',
  '#818cf8', '#a78bfa', '#f472b6', '#34d399', '#fbbf24',
  '#60a5fa', '#c084fc',
];

export const generateRandomBlocks = (
  count: number,
  allowDuplicates: boolean,
): SelectionBlock[] => {
  const blocks: SelectionBlock[] = [];
  const usedValues = new Set<number>();

  for (let i = 0; i < count; i += 1) {
    let value: number;
    if (allowDuplicates) {
      value = Math.floor(Math.random() * 20) + 1;
    } else {
      do {
        value = Math.floor(Math.random() * 20) + 1;
      } while (usedValues.has(value));
      usedValues.add(value);
    }
    blocks.push({
      id: `block-${i}`,
      value,
      color: BLOCK_COLORS[i % BLOCK_COLORS.length],
    });
  }
  return blocks;
};
