# 몬티 홀 퍼즐 — 구현 사양 (파일럿)

> A·B·C 3 에이전트가 공유하는 단일 출처. 변경 시 본 문서가 진실.

## 스토리

미국 게임쇼 *Let's Make a Deal* 의 사회자 몬티 홀에서 유래. 문 3개 중 하나 뒤에 *차*, 나머지 둘 뒤에 *염소*. 참가자가 한 문을 고르면 사회자가 *남은 두 문 중 염소가 있는 문* 을 열어 보여주고, 참가자에게 **선택을 바꿀 기회** 를 줌. 바꿔야 할까, 유지해야 할까?

직관: 50:50 같음. 실제: **바꾸면 2/3, 유지하면 1/3**. 초등·중학교 확률 직관의 고전 반례.

## 파일 구조

```
src/lib/puzzles/montyHall.ts          신규
src/app/puzzle/monty-hall/page.tsx    신규
src/app/puzzle/monty-hall/page.module.css  신규
src/lib/puzzles.ts                     카탈로그 1줄 추가
```

## 로직 모듈 (`src/lib/puzzles/montyHall.ts`)

```ts
export type Strategy = 'stay' | 'switch';

/** 차가 든 문 인덱스(0~2)를 무작위로 두고, 첫 선택도 무작위로 한 뒤 strategy 대로 행동. true=차 획득 */
export function simulateOne(strategy: Strategy, rng?: () => number): boolean;

/** n회 반복. { wins, total, rate } 반환 (rate = wins/total). rng 주입 가능 (테스트용) */
export function simulateMany(
  strategy: Strategy,
  n: number,
  rng?: () => number,
): { wins: number; total: number; rate: number };

/** 같은 seed로 두 전략 동시 시뮬 — 표시·비교용 */
export function simulateBoth(n: number, rng?: () => number): {
  stay: { wins: number; total: number; rate: number };
  switch: { wins: number; total: number; rate: number };
};

/** 단계별 진행을 명시적으로 추적해야 할 때 사용. 결정성 보장(rng 주입 가능) */
export interface RoundState {
  carDoor: 0 | 1 | 2;
  firstPick: 0 | 1 | 2;
  hostOpens: 0 | 1 | 2;        // 사회자가 연 염소 문 (carDoor도 firstPick도 아님)
  switchTarget: 0 | 1 | 2;     // 바꿀 경우의 최종 선택
}
export function playRound(firstPick: 0 | 1 | 2, rng?: () => number): RoundState;
```

**검증 기준 (B가 확인)**:
- `simulateMany('switch', 100_000)` → rate ∈ [0.66, 0.67] (≈ 0.667 ± 0.005)
- `simulateMany('stay', 100_000)` → rate ∈ [0.33, 0.34]
- `playRound` 의 `hostOpens` 는 절대 `carDoor` 도 `firstPick` 도 아님
- `switchTarget` 은 `firstPick` 도 `hostOpens` 도 아님

## UI (`page.tsx`)

### 레이아웃
- 상단: 제목 + 짧은 스토리 (3~4문장)
- 중앙: 문 3개 (SVG 또는 div). 상태별 모양:
  - **닫힘**: 회색 + 번호
  - **염소 공개**: 🐐 + 회색
  - **차 공개**: 🚗 + 강조색
  - **내 선택**: 노란 테두리
- 하단 좌: 인터랙티브 단계 진행
- 하단 우: 통계 패널

### 인터랙티브 모드 (수동)
1. **문 고르기** — 문 클릭 → firstPick 결정
2. **사회자가 염소 공개** — 자동, 0.5초 딜레이 + 페이드
3. **바꿀까 유지할까?** — 두 버튼
4. **결과 공개** — 차/염소, 누적 통계에 +1
5. *다시 하기* 버튼 → 단계 1로

### 자동 시뮬 모드
- 버튼 3개: *바꾸기 100회* · *유지 100회* · *둘 다 1000회*
- 두 전략의 누적 승률 바·숫자 동시 표시
- 결과 보여줄 때 막대 그래프 (수평 진행률) — 33%·67% 기준선

### 통계 패널
- 표:

  | 전략 | 시도 | 차 획득 | 승률 |
  |------|------|---------|------|
  | 유지 | n   | k       | k/n  |
  | 바꿈 | n   | k       | k/n  |
- *초기화* 버튼

### 도움말 (`<details>`)
- 직관: "두 문 남았으니 50:50?" → 왜 틀린지
- 핵심: 사회자가 *알고 있다* 는 정보가 확률을 바꿔놓음
- 자가 확인: 100회 자동 돌려보면 67% 가까이 수렴

## CSS (`page.module.css`)

- 다크 그래디언트 배경 (다른 퍼즐과 톤 통일 — `#020617` 베이스)
- 문 SVG/Div: 200x300px 데스크탑, 모바일은 가로 스크롤 또는 80x140 축소
- 768px / 480px 반응형 분기 필수
- 버튼·통계 패널 dark theme

## 카탈로그 등록 (`src/lib/puzzles.ts`)

기존 `PUZZLES` 배열에 추가 — 위치는 `strange_dice` 근처 (확률 영역 인접):

```ts
{
  id: 'monty_hall',
  title: '몬티 홀의 역설',
  emoji: '🚪',
  description: '문 3개 중 차는 하나. 사회자가 염소를 보여줬을 때, 바꿔야 할까 유지해야 할까?',
  difficulty: 'medium',
  href: '/puzzle/monty-hall',
  tag: '확률 직관 🎲',
  category: 'puzzle',
}
```

## 검증 자동화 (B 에이전트가 수행)

1. `npx tsc --noEmit` — 에러 0
2. `npx eslint src/app/puzzle/monty-hall src/lib/puzzles/montyHall.ts` — 에러 0
3. `npx next build` — 라우트 `/puzzle/monty-hall` 가 빌드 출력에 포함
4. Node 임시 스크립트로 로직 검증:
   ```bash
   node -e "
   const m = require('./src/lib/puzzles/montyHall.ts');
   /* 또는 tsx 사용 */
   const sw = m.simulateMany('switch', 100000);
   const st = m.simulateMany('stay', 100000);
   if (Math.abs(sw.rate - 2/3) > 0.01) process.exit(1);
   if (Math.abs(st.rate - 1/3) > 0.01) process.exit(2);
   console.log('OK', sw.rate, st.rate);
   "
   ```
   (tsx 또는 npx ts-node 로 ts 파일 직접 실행)
5. dev 서버 띄워 `curl /puzzle/monty-hall` → HTTP 200

## 코딩 가이드 (기존 사이트와 일관성)

- 다크모드 고정. 한국어 UI
- StoryHeader 컴포넌트는 *수학의 원리* 단원 전용 — 본 퍼즐은 사용 안 함
- 단순 페이지 헤더(제목+짧은 글) 직접 작성
- 주석은 *WHY가 비명백한 곳만*. WHAT 주석 금지
- `useState`·`useMemo` 만으로 충분. 외부 라이브러리 추가 금지
- 모바일 터치 친화: 슬라이더·버튼 충분히 크게 (`docs/curriculum/slider-ux-standard.md` 참고)
