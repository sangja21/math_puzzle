/**
 * 요세푸스 퍼즐 (Josephus Problem) 구현
 *
 * - 클릭 방식: 원형에 사람 아이콘을 배치하고 "다음 제거" 버튼으로 순차 제거
 * - 기본 난이도: 인원 수와 k(제거 간격) 입력
 * - 고급 옵션: 제거 순서(히스토리) 기록, 다중 라운드(재시작) 지원
 */

export interface JosephusState {
  total: number; // 전체 인원
  step: number; // k 값
  circle: number[]; // 현재 살아있는 사람 번호 (1‑based)
  currentIdx: number; // 다음 제거를 시작할 인덱스
  removed: number[]; // 제거된 순서 (역사 기록)
  isComplete: boolean; // 마지막 한 사람 남았는가
}

/** 초기 상태 생성 */
export function createInitialState(total: number, step: number): JosephusState {
  const circle = Array.from({ length: total }, (_, i) => i + 1);
  return {
    total,
    step,
    circle,
    currentIdx: 0,
    removed: [],
    isComplete: false,
  };
}

/** 한 번 제거 수행 */
export function nextRemoval(state: JosephusState): JosephusState {
  if (state.isComplete) return state;
  const len = state.circle.length;
  const removeIdx = (state.currentIdx + state.step - 1) % len;
  const removedPerson = state.circle.splice(removeIdx, 1)[0];
  const newRemoved = [...state.removed, removedPerson];
  const nextIdx = removeIdx % (len - 1); // 다음 시작 인덱스
  const complete = state.circle.length === 1;
  return {
    ...state,
    circle: state.circle,
    currentIdx: nextIdx,
    removed: newRemoved,
    isComplete: complete,
  };
}

/** 라운드 재시작 (다중 라운드) */
export function resetState(total: number, step: number): JosephusState {
  return createInitialState(total, step);
}

/** 남은 인원 수 */
export function getRemaining(state: JosephusState): number {
  return state.circle.length;
}

/** 최종 생존자 */
export function getSurvivor(state: JosephusState): number | null {
  return state.isComplete ? state.circle[0] : null;
}

/** 해설 텍스트 */
export const EXPLANATION = `
## 요세푸스 문제 (Josephus Problem)

### 역사적 배경
서기 1세기(AD 67년경), **제1차 유대-로마 전쟁** 당시 역사가 **플라비우스 요세푸스(Flavius Josephus)**가 겪은 일화에서 유래했습니다.
요타파타(Yodfat) 요새가 함락될 위기에 처하자, 요세푸스와 40명의 **유대인 저항군**들은 로마군에 투항하는 대신 동굴 안에서 원형으로 둘러앉아 자결하기로 결의했습니다.
규칙은 **"매 3번째 사람을 죽인다"**는 것이었습니다. 요세푸스는 수학적 직관을 발휘해 **마지막까지 살아남는 자리**를 계산해내었고, 결국 로마군에 투항하여 훗날 위대한 역사서를 남기게 되었습니다.

### 수학적 원리
- 재귀식: \`J(n, k) = (J(n-1, k) + k) mod n\`
- 1-based 인덱스로 변환하면 최종 생존자는 \`J(n, k) + 1\`이 됩니다.
- 이 알고리즘은 O(n) 시간에 해결 가능하지만, 직접 시뮬레이션을 하면 제거 순서를 시각적으로 체험할 수 있습니다.
`;
