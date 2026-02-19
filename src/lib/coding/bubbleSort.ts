export type BubbleBlock = {
  id: string;
  value: number;
  color: string;
  label?: string;
};

export type BubbleStep = {
  array: BubbleBlock[];
  compare: [number, number];
  swapped: boolean;
  pass: number;
  index: number;
  leftValue: number;
  rightValue: number;
};

export type BubbleSortTrace = {
  steps: BubbleStep[];
  sorted: BubbleBlock[];
};

const cloneBlocks = (blocks: BubbleBlock[]) =>
  blocks.map((block) => ({ ...block }));

export const createBubbleSortTrace = (input: BubbleBlock[]): BubbleSortTrace => {
  const working = cloneBlocks(input);
  const steps: BubbleStep[] = [];

  for (let pass = 0; pass < working.length - 1; pass += 1) {
    let swappedInPass = false;

    for (let i = 0; i < working.length - 1 - pass; i += 1) {
      const left = working[i];
      const right = working[i + 1];
      const swapped = left.value > right.value;

      if (swapped) {
        working[i] = right;
        working[i + 1] = left;
        swappedInPass = true;
      }

      steps.push({
        array: cloneBlocks(working),
        compare: [i, i + 1],
        swapped,
        pass,
        index: i,
        leftValue: left.value,
        rightValue: right.value,
      });
    }

    if (!swappedInPass) {
      break;
    }
  }

  return { steps, sorted: working };
};

export const shuffleBlocks = (blocks: BubbleBlock[]): BubbleBlock[] => {
  const shuffled = cloneBlocks(blocks);
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
