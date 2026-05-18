# 피타고라스 시각 증명 — 구현 사양

## 스토리

*a² + b² = c²* — 직각삼각형 빗변에 그린 정사각형 넓이가 두 다리에 그린 정사각형 넓이의 합과 같다. 수많은 증명 중 가장 직관적인 *재배치 증명*: 같은 큰 정사각형을 두 가지 방법으로 채우면 *남는 공간 = a²+b² 또는 c²*.

이 퍼즐은 그 *재배치* 를 직접 슬라이드해 보며 양변이 같음을 눈으로 확인.

## 파일 구조

```
src/lib/puzzles/pythagoras.ts             신규
src/app/puzzle/pythagoras/page.tsx        신규
src/app/puzzle/pythagoras/page.module.css 신규
src/lib/puzzles.ts                         카탈로그
```

## 로직 모듈

```ts
/** 직각삼각형의 두 다리 길이로부터 빗변 */
export function hypotenuse(a: number, b: number): number;

/** 4개 직각삼각형의 배치 — t∈[0,1] 보간 (t=0: 'a²+b²' 배치, t=1: 'c²' 배치) */
export interface TriPos {
  /** 큰 정사각형 안에서 삼각형 한 개의 회전과 위치 */
  rotation: number;
  /** 빗변 시작점 (큰 정사각형 좌표계) */
  pivot: { x: number; y: number };
}
export function triangleArrangement(a: number, b: number, t: number): TriPos[];

/** 4 삼각형이 채우지 않은 *흰 공간* 의 면적 (외각 정사각형 면적 = (a+b)² 에서 4 × 삼각형 면적 = 2ab 를 뺀 값) */
export function whiteArea(a: number, b: number): number;
// = (a+b)² - 2ab = a² + b² (어느 배치든)
```

**검증 기준 (B)**:
- `hypotenuse(3, 4) === 5`, `hypotenuse(5, 12) === 13`
- `whiteArea(a, b) === a*a + b*b` (10개 (a,b) 샘플)
- `triangleArrangement(a, b, 0)` 4개 위치 = a²+b² 배치 (직접 좌표 검증)
- `triangleArrangement(a, b, 1)` 4개 위치 = c² 배치

## UI

- 상단: 제목 + 슬라이더 (a, b) — 정수 1~5
- 본체: SVG (400×400) — 큰 정사각형 (a+b) × (a+b)
  - 4개 직각삼각형 (a, b, c) — t 슬라이더로 두 배치 사이 보간
  - *t=0*: 두 다리 정사각형 (왼쪽위 a×a + 오른쪽아래 b×b)
  - *t=1*: 빗변 정사각형 (가운데 c×c, 기울어진 형태)
- 우측: 슬라이더 t (0~1) — *재배치 진행도*
  - 자동 토글 (계속 왕복)
  - 면적 표시:
    - 큰 정사각형 = (a+b)² = X
    - 4 삼각형 = 2ab = Y
    - 흰 공간 = X - Y = Z (a²+b² = c²)
- 하단 `<details>` 도움말:
  - 왜 두 배치 다 같은 흰 면적인가
  - a=3, b=4, c=5 직각삼각형의 특별함

## CSS

- 다크 + 정사각형은 옅은 베이지
- 삼각형 색 4가지 (회전 구분)
- 부드러운 transition (t 슬라이더에 대해 즉시 반응이지만 자동 토글 시 0.4초)
- 768/480 반응형

## 카탈로그

```ts
{
  id: 'pythagoras',
  title: '피타고라스 시각 증명',
  emoji: '📐',
  description: 'a²+b²=c²를 슬라이드해서 직접 확인! 같은 정사각형을 두 가지로 채워 면적이 같음을 발견하세요.',
  difficulty: 'easy',
  href: '/puzzle/pythagoras',
  tag: '기하 증명 📐',
  category: 'puzzle',
}
```

## 검증 (B)

- tsc·eslint·build, 라우트 `/puzzle/pythagoras`
- `hypotenuse` 5개 알려진 피타고라스 수 검증 (3-4-5, 5-12-13, 8-15-17, 7-24-25, 20-21-29)
- `whiteArea(a,b) === a²+b²` 10개 샘플
- `triangleArrangement` 결과 4개 — 각 삼각형이 큰 정사각형 안에 들어옴 (좌표 검사)

## 코딩 가이드

- 외부 라이브러리 없음
- 회전 행렬 직접
- 핵심은 *시각적 일관성* — t 보간이 자연스러워야
