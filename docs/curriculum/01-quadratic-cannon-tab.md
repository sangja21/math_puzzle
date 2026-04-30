# 이차함수 — 포탄쏘기 게임 탭 구현 계획서

## 컨텍스트

- **소속 단원**: 단원 1 — 이차함수 (`/puzzle/quadratic-function`)
- **이 탭의 역할**: 원리 탭에서 배운 *포물선·꼭짓점·근* 을 직접 조작해 표적을 맞히는 응용·체험 단계.
- **상위 흐름**: `📐 수학의 원리 → 🎯 포탄쏘기` (같은 페이지 가로 탭).
- **읽는 사람**: 초·중등 (a, b, c 식을 못 외워도 슬라이더만으로 명중 가능).

## 결정 사항 (제안 디폴트, 사용자 확정 대기)

- [x] **레벨 수**: 4 (쉬움 → 높이 → 벽 너머 → 먼 곳)
- [x] **컨트롤**: 발사각(°) 슬라이더 + 초속(m/s) 슬라이더, "발사" 버튼
- [x] **물리**: 중력만 (공기저항·바람 없음 v1) — 단순 포물선 보장
- [x] **궤적**: 발사 전 *희미한 미리보기 점선* + 발사 후 *실제 궤적 트레일*
- [x] **수식 표시**: 패널 한쪽에 `y = x·tan θ - g x² / (2v² cos² θ)` 항상 노출 (학습 다리)
- [x] **점수**: 시도 횟수 카운트만 (목숨·게임오버 없음, 실패 시 즉시 재시도)
- [x] **명중 판정**: 궤적이 표적 사각형(bbox) 내부 통과 시 히트
- [x] **명중 효과**: confetti(이미 의존성 있음) + 다음 레벨로 자동 진행
- [x] **장애물**: 3레벨에 *벽 1개* 만 — 궤적이 벽에 닿으면 미스
- [x] **시각**: 자체 SVG 씬 (CoordPlane 아님 — 격자보다 *실세계* 풍경)

## 페이지 와이어 (탭 내부)

```
┌────────────────────────────────────────────────────────┐
│  레벨 2 / 4  · 시도 3                                   │
├────────────────────────────────────────────────────────┤
│                                                        │
│   [SVG 씬 — 600×320]                                   │
│      ╱                                                 │
│   📡  ╲                                ▆ 표적          │
│   대포 ─────────────────────── 지면 ──────             │
│                                                        │
├────────────────────────────────────────────────────────┤
│  발사각 θ = 45°  ▰▰▰▰▰▱▱▱  [10°~80°]                   │
│  초속  v = 15 m/s ▰▰▰▰▱▱▱▱  [5~25]                     │
│                                                        │
│  y = x·tan(45°) - 9.8 x² / (2·15²·cos²(45°))           │
│                                                        │
│             [ 🎯 발사! ]                                │
└────────────────────────────────────────────────────────┘
힌트: "발사각 45°가 보통 가장 멀리 가요."
```

## 상태 머신

```
aiming  ──[fire]──>  flying
                       │
       ┌── hit ───────┤
       │              ├── miss (timeout / 벽 충돌 / 지면 닿음 표적 밖)
       ▼              ▼
 celebrate         shake
   │ (1.2s)         │ (0.8s)
   ▼                ▼
nextLevel  /  back to aiming
   │
   ▼
all levels done → complete
```

```ts
type GameState =
  | { kind: 'aiming' }
  | { kind: 'flying'; t0: number }
  | { kind: 'hit' }
  | { kind: 'miss' }
  | { kind: 'complete' };
```

## 좌표·물리

- 좌표 단위: **미터 (실세계)**
- 지면: y = 0
- 대포: x = 0, y = 0 (포구 끝)
- 중력: g = 9.8 m/s²
- 궤적식: `y(x) = x·tan θ - g x² / (2 v² cos² θ)`
- 매개변수식: `x(t) = v·cos θ · t`, `y(t) = v·sin θ · t - 0.5 g t²`
- SVG 좌표 변환: `viewBox="0 -20 35 22"` (x:0~35m, y:-2~20m)

## 레벨 데이터 (제안)

```ts
interface Level {
  id: number;
  name: string;
  hint: string;
  target: { x: number; y: number; w: number; h: number };  // 좌하단 기준
  obstacles?: { x: number; y: number; w: number; h: number }[];
}

const LEVELS: Level[] = [
  {
    id: 1, name: '쉬움', hint: '발사각 45°가 보통 가장 멀리 가요.',
    target: { x: 12, y: 0, w: 1.5, h: 1.5 },
  },
  {
    id: 2, name: '높이', hint: '표적이 공중에 있어요. 각도를 더 높여보세요.',
    target: { x: 16, y: 4, w: 1.5, h: 1.5 },
  },
  {
    id: 3, name: '벽 너머', hint: '벽에 부딪히지 않게 *높이* 발사하세요.',
    target: { x: 22, y: 0, w: 1.5, h: 1.5 },
    obstacles: [{ x: 10, y: 0, w: 0.8, h: 7 }],
  },
  {
    id: 4, name: '먼 곳', hint: '초속을 충분히 올려야 닿을 수 있어요.',
    target: { x: 28, y: 2, w: 1.5, h: 1.5 },
  },
];
```

## 컴포넌트·파일 구조

```
src/
├── app/puzzle/quadratic-function/
│   ├── page.tsx              ← CannonTab 임포트로 placeholder 교체
│   ├── CannonTab.tsx         ← 신규: 게임 메인 컴포넌트
│   └── CannonTab.module.css  ← 신규
└── lib/puzzles/
    └── cannonGame.ts         ← 신규: 물리 + 레벨 + 충돌 함수
```

`page.tsx` 의 변경은 한 줄 — placeholder 컴포넌트를 새 `CannonTab` import 로 교체.

## 라이브러리 시그니처 (`cannonGame.ts`)

```ts
export const G = 9.8;

export interface Vec2 { x: number; y: number; }
export interface Rect { x: number; y: number; w: number; h: number; }

export function trajectoryAt(angleDeg: number, speed: number, t: number): Vec2;
export function trajectorySamples(
  angleDeg: number, speed: number,
  options?: { dt?: number; maxT?: number; minY?: number }
): Vec2[];

export function pointInRect(p: Vec2, r: Rect): boolean;
export function rectIntersectsPath(path: Vec2[], r: Rect): boolean;

export function checkLevel(
  path: Vec2[],
  target: Rect,
  obstacles: Rect[] | undefined,
): 'hit' | 'miss-obstacle' | 'miss';

export interface Level {
  id: number;
  name: string;
  hint: string;
  target: Rect;
  obstacles?: Rect[];
}

export const LEVELS: Level[];
```

## 인터랙션 플로우

1. **레벨 시작**: `state = aiming`. 슬라이더 활성, 미리보기 궤적(점선) 즉시 갱신.
2. **사용자 슬라이더 조작**: 미리보기 갱신.
3. **발사 클릭**: `state = flying`. requestAnimationFrame 으로 t=0~5초 추적. 매 프레임 위치 업데이트, 트레일 누적.
4. **충돌 검사 (매 프레임)**:
   - 장애물 사각형 안 → `state = miss` (충돌 위치에서 정지, 0.8초 후 aiming)
   - 표적 사각형 안 → `state = hit` (1.2초 confetti 후 다음 레벨)
   - 지면(y < 0) 닿고 표적 밖 → `state = miss`
   - t > 5 초과 → `state = miss`
5. **다음 레벨**: `level + 1`, `state = aiming`. 마지막 레벨이면 `complete`.

## SVG 시각 요소

- 배경: 옅은 그라디언트(하늘 → 지면) — `<linearGradient>`
- 지면: 갈색 직사각형 (y < 0 영역)
- 대포: 받침(직사각형) + 포신(angle 만큼 회전)
- 표적: 빨간 사각형 + 중심 동그라미 (bullseye)
- 장애물: 회색 직사각형
- 미리보기 궤적: 점선 연한 노랑
- 실제 궤적: 진한 노랑 폴리라인 + 끝에 포탄 (원)
- 시도 카운터·레벨 표시: 상단 HUD

## 자가 검증 / 학습 다리

- 패널 하단에 *현재 식* 노출:
  `y = x·tan(θ) - g x² / (2 v² cos² θ)` 자리에 실제 값 대입
- 명중 후 modal 또는 토스트 한 줄: "이 궤적의 꼭짓점은 (xV, yV) 였어요."
  - xV = v² sin(2θ) / (2g) — 사거리의 절반
  - yV = (v sin θ)² / (2g)
  - 원리 탭 § 5 (꼭짓점) 와 매핑

## 단계별 작업 순서

1. **[준비]** `src/lib/puzzles/cannonGame.ts` — 물리·충돌·레벨 데이터 (다음 커밋)
2. **[UI 골격]** `CannonTab.tsx` + 전 placeholder 교체 + 슬라이더 + SVG 씬 + 미리보기 궤적
3. **[애니메이션]** rAF 루프 + 발사·트레일·충돌
4. **[명중·실패 효과]** confetti + 다음 레벨 전환 + 흔들기
5. **[HUD·힌트·식 표시]** 레벨/시도 카운터 + 힌트 문구 + 동적 수식
6. **[반응형 점검]** 768/480 슬라이더 thumb 확대, 씬 viewBox 자동 스케일

위 1~6 을 *한 커밋* 으로 묶을 예정 (구현은 단일 PR 단위로 깔끔히).

## 결정 메모 (사용자 채움)

- 레벨 구성 변경:
- 추가 장애물·표적 패턴:
- 발사 후 다음 레벨 자동 vs 수동:
- 마지막 레벨 완료 후 endgame:
