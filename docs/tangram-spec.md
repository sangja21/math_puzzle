# 탱그램 — 구현 사양

> A·B·C 3 에이전트가 공유하는 단일 출처.

## 스토리

7세기 중국에서 비롯된 7조각 분할 퍼즐. 큰 정사각형 한 개를 *큰 직각이등변삼각형 2개 · 중간 1개 · 작은 2개 · 정사각형 1개 · 평행사변형 1개* 로 나눈 게 *탕그람*. 목표 실루엣(고양이·새·집…)에 맞게 7조각을 모두 사용해 빈틈없이 채우는 게임.

초등 *기하/공간 감각* 영역이 카탈로그에 빈 상태 — 탱그램이 그 자리를 채움.

## 파일 구조

```
src/lib/puzzles/tangram.ts              신규 (조각 정의·회전·충돌·매칭)
src/app/puzzle/tangram/page.tsx         신규
src/app/puzzle/tangram/page.module.css  신규
src/lib/puzzles.ts                       카탈로그 1줄 추가
```

## 로직 모듈 (`src/lib/puzzles/tangram.ts`)

좌표계: 단순화를 위해 단위 격자(`unit = 1`). 큰 정사각형 = 4×4. 모든 꼭짓점이 격자 위에 떨어지도록 디자인.

```ts
export type PieceId =
  | 'large1' | 'large2'   // 큰 직각이등변삼각형 (다리=4)
  | 'medium'              // 중간 직각이등변삼각형 (다리=2√2 → 격자 좌표상 다리=2 회전)
  | 'small1' | 'small2'   // 작은 직각이등변삼각형 (다리=2)
  | 'square'              // 정사각형 (변=√2 → 격자상 다리=대각선)
  | 'parallelogram';      // 평행사변형

export interface Piece {
  id: PieceId;
  /** 조각의 표준 꼭짓점들 (회전 0°, 평행이동 (0,0) 기준) */
  vertices: { x: number; y: number }[];
  color: string;
  /** 평행사변형은 좌우 반전(mirror) 가능 */
  flippable?: boolean;
}

/** 7조각의 정식 정의 — 큰 정사각형(4×4) 한 변 = 4 단위 */
export const PIECES: Record<PieceId, Piece>;

/** 사용자 배치 상태 — 한 조각의 현재 좌표 */
export interface Placement {
  id: PieceId;
  /** 회전 0/45/90/135/180/225/270/315° */
  rotation: 0 | 45 | 90 | 135 | 180 | 225 | 270 | 315;
  /** 평행사변형이면 -1 가능, 나머지는 1 */
  mirror: 1 | -1;
  /** 보드 위 평행이동 */
  tx: number;
  ty: number;
}

/** 표준 vertices → 회전·미러·평행이동 적용한 실제 꼭짓점 */
export function transformedVertices(p: Placement): { x: number; y: number }[];

/** 두 조각이 *겹치는지* (면적 교차 > epsilon) */
export function overlap(a: Placement, b: Placement): boolean;

/** 목표 실루엣과 7조각의 합집합이 일치하는지 (면적·외곽 동일성). 허용 오차 grid * 0.1 */
export function matchesTarget(
  placements: Placement[],
  target: { vertices: { x: number; y: number }[] },
): boolean;

/** 사전 정의된 목표 실루엣들 — 4~5단계 (정사각형 자체 / 삼각형 / 새 / 고양이 / 집) */
export interface Silhouette {
  id: string;
  name: string;
  emoji: string;
  /** 시계방향 외곽 꼭짓점 (격자 좌표) */
  outline: { x: number; y: number }[];
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;
}
export const SILHOUETTES: readonly Silhouette[];
```

**검증 기준 (B)**:
- `PIECES` 7개 모두 정의됨
- 모든 표준 조각의 면적 합 = 16 (4×4 정사각형 면적)
- `transformedVertices` 가 회전·미러·평행이동을 정확히 반영 — 회전 90°×4 = 원위치 (꼭짓점 동일)
- `overlap` — 동일 조각 두 개 같은 위치 → true; 멀리 떨어진 두 조각 → false
- 각 실루엣의 외곽 면적 = 16

## UI (`page.tsx`)

### 레이아웃
- 상단: 제목 + 1줄 안내 + 현재 실루엣 이름·난이도 chip
- 본체: SVG 보드 (600×600 데스크탑, viewBox 단위로는 8×8 정도)
  - 배경: 목표 실루엣 (희미한 회색 채움)
  - 격자: 옅게
  - 조각 7개: 보드 옆 *트레이* 영역에서 초기 배치, 사용자가 보드로 드래그
- 우측 패널:
  - 실루엣 선택 (드롭다운 또는 chip 그리드)
  - 회전 버튼: 선택된 조각 ↻ 45° / ↺ 45°
  - 미러 버튼: 평행사변형 선택 시 활성
  - 리셋 버튼
  - 진행 상태: "맞춘 면적 X / 16" 또는 fill rate %
- 하단: `<details>` 도움말

### 인터랙션
- **클릭**: 조각 선택 (강조)
- **드래그**: 선택된 조각 이동 — 격자 0.5 단위 스냅
- **R / ↻↺ 버튼**: 회전 (선택된 조각)
- **F / 미러 버튼**: 평행사변형만 좌우 반전
- **터치**: 모바일에서도 동일 (pointer events 사용)
- **매칭 성공**: `matchesTarget` true → 축하 메시지 + 다음 실루엣 버튼

### 실루엣 단계 (최소 4개)
1. **정사각형** (4×4 자기 자신) — easy. 7조각 그대로
2. **큰 직각삼각형** — easy. 정사각형을 반으로 자른 모양
3. **고양이** 또는 **새** — medium. 검증된 클래식 실루엣 1개
4. **집** 또는 **돛단배** — medium. 다른 클래식 실루엣 1개

> 정확한 vertices 좌표는 A가 결정 (격자 위 정수/반정수 좌표 사용). 면적 = 16 보장.

## CSS

- 다크 그래디언트 배경 (`#020617` 베이스, 따뜻한 갈색 톤 살짝 — 7세기 중국 분위기)
- 조각 색상 7가지 distinct (대비 충분, 색약 고려)
- 보드 SVG는 width: 100% max-width: 600px
- 모바일(768/480): 트레이 영역을 보드 위/아래로 재배치
- 회전·미러 버튼 충분히 크게 (44px 이상)

## 카탈로그 등록

```ts
{
  id: 'tangram',
  title: '탱그램',
  emoji: '🧩',
  description: '큰 정사각형을 자른 7조각! 회전·뒤집어 새, 고양이, 집을 만들어보세요.',
  difficulty: 'medium',
  href: '/puzzle/tangram',
  tag: '기하 직관 📐',
  category: 'puzzle',
}
```

위치: `monty_hall` 다음 또는 `strange_dice` 근처 (기하/공간 영역).

## 검증 자동화 (B 에이전트)

1. tsc·eslint·next build (route `/puzzle/tangram` 생성)
2. tsx 스크립트로 로직 검증:
   - `Object.keys(PIECES).length === 7`
   - 각 piece의 표준 면적 합 = 16 (Shoelace 공식)
   - `transformedVertices(rotation=90×4)` 결과 = 표준 vertices (회전 4번 = 원위치)
   - `overlap` 자기 자신 = true
   - `SILHOUETTES.length >= 4`, 각 실루엣 외곽 면적 = 16
3. dev 서버 200 확인 + 한국어 키워드 grep ("탱그램", "회전", "리셋")

## 코딩 가이드

- 외부 라이브러리 금지 — 회전·매칭·외곽 면적 모두 직접 구현 (Shoelace, polygon clipping)
- 회전 = 표준 변환 행렬 + 격자 스냅 (반올림)
- 매칭은 *면적 동등성* 기준으로 단순화 — 외곽 정확도는 grid * 0.1 허용
- 주석은 WHY만 (왜 회전 단위가 45°인지 등)
- 모바일 pointer events
