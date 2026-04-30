# 포탄쏘기 — 대결 모드 (난이도 추가) 기획서

> **2026-04-30 변경**: 라운드 제한 → **체력 시스템**.
> 양쪽 HP 100, 명중 시 −25 데미지, 먼저 적 HP 0 만들면 승리. 라운드 제한 없음.
> 적 정확도는 *누적 발사 횟수* 기준으로 점차 정확해짐.

## 컨텍스트

- **소속**: 단원 1 — 이차함수 / 포탄쏘기 게임 탭의 *서브 모드*
- **추가 이유**: 기본 4레벨(표적 맞히기) 클리어 후 더 도전적인 컨텐츠 필요
- **컨셉**: 좌측 사용자 vs 우측 적(AI) 의 포탄 듀얼. 양쪽 체력바, 한 번 명중 시 -25, 먼저 0 되는 쪽이 KO.

## 게임 탭 구조 변경

게임 탭 진입 시 *모드 선택* 추가:

```
┌──────────────────────────────────┐
│ 🎯 표적 맞히기 (4 레벨, 기존)    │
│ ⚔️ 대결 모드 (5 라운드, 신규)    │
└──────────────────────────────────┘
```

선택 후 해당 모드로 진입. 모드 변경 가능한 *되돌아가기* 버튼 제공.

## 대결 모드 룰

1. **셋업**: 사용자 대포는 화면 좌측 (x=0), 적 대포는 우측 (x=30). 둘 다 지면(y=0).
2. **5 라운드 턴제**:
   - 매 라운드마다:
     a. 사용자가 발사각·초속 슬라이더 조정 후 **발사**
     b. 사용자 포탄이 비행 → 명중/실패 결정
     c. 0.6s 지연 후 **적이 자동 발사**
     d. 적 포탄이 비행 → 명중/실패 결정
3. **승부 판정**:
   - 사용자 포탄이 적 대포 bbox 안에 들어가면 → **사용자 승리**
   - 적 포탄이 사용자 대포 bbox 안에 들어가면 → **적 승리**
   - 둘 다 빗나가면 → 다음 라운드
   - 동시 명중 (라운드 내) 시 → **무승부** (또는 사용자 우선)
   - 5 라운드 종료까지 결판 없으면 → **무승부**

## 적 AI 디자인

적은 *완벽한 조준* 을 시도하지만 라운드별 *노이즈* 가 들어감:

```ts
function computeEnemyShot(round: number): { angleDeg: number; speed: number } {
  // 정답 (사용자 대포 정확히 맞히는 발사):
  //   적 위치 (30, 0) → 사용자 위치 (0, 0)
  //   포탄을 *왼쪽으로* 쏘기 위해 각도는 보각으로 계산
  //   거리 30m 를 어떤 각도/초속으로 정확히 맞히려면:
  //   v² · sin(2θ) / g = 30  → 무한히 많은 (θ, v) 조합
  //   기본 풀이: θ = 45°, v = sqrt(30·9.8) ≈ 17.15 m/s
  
  const baseAngle = 45;    // 좌측을 향한 45° (수평 대칭)
  const baseSpeed = Math.sqrt(30 * 9.8);  // ≈ 17.15
  
  // 라운드별 노이즈 (라운드 1: ±20°/±5m·s, 라운드 5: ±4°/±1m·s)
  const noiseScale = Math.max(0, 1 - (round - 1) / 4);
  const angleNoise = (Math.random() - 0.5) * 2 * 20 * noiseScale;
  const speedNoise = (Math.random() - 0.5) * 2 * 5  * noiseScale;
  
  return {
    angleDeg: baseAngle + angleNoise,
    speed: baseSpeed + speedNoise,
  };
}
```

**난이도 곡선**:
| 라운드 | 노이즈 스케일 | 적 정확도 |
|--------|--------------|----------|
| 1 | 1.0 | 빗나갈 확률 매우 높음 |
| 2 | 0.75 | |
| 3 | 0.5 | 아슬아슬 |
| 4 | 0.25 | |
| 5 | 0.0 | 거의 정확 — 사용자가 미리 맞혀야! |

→ 사용자가 *빨리 맞힐수록* 유리. 시간 압박 효과.

## 적의 포탄 궤적 (좌측 발사)

물리식이 좌향이라 약간 다름:
```ts
// 적 위치 (xE, 0), 포구가 왼쪽 향함 (수평 보각)
function enemyTrajectoryAt(angleDeg, speed, t): Vec2 {
  const rad = angleDeg * Math.PI / 180;
  return {
    x: xE - speed * Math.cos(rad) * t,  // 좌측으로 이동
    y: speed * Math.sin(rad) * t - 0.5 * G * t * t,
  };
}
```

## 화면 와이어 (대결 모드)

```
┌──────────────────────────────────────────────┐
│ ⚔️ 대결 모드  ·  라운드 2/5  ·  결과: -      │
│                              [← 모드 선택]   │
├──────────────────────────────────────────────┤
│  [SVG 씬 — 600×320]                          │
│                                              │
│   📡            ╲              ╱        📡   │
│   사용자 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 적     │
│                                              │
├──────────────────────────────────────────────┤
│  [컨트롤 — 사용자 턴]                        │
│  발사각 θ = 45°  /  초속 v = 17 m/s           │
│  [ 🎯 발사! ]                                │
│                                              │
│  [상태 메시지: "사용자 포탄 비행 중..."]      │
└──────────────────────────────────────────────┘
```

## State Machine 확장 (DuelMode)

```ts
type DuelPhase =
  | { kind: 'aiming' }                // 사용자 조준
  | { kind: 'user-flying' }           // 사용자 포탄 비행 중
  | { kind: 'enemy-aiming' }          // 적이 조준 (0.6s)
  | { kind: 'enemy-flying'; shot: { angle: number; speed: number } }
  | { kind: 'round-result'; result: 'user-hit' | 'enemy-hit' | 'both-miss' | 'both-hit' }
  | { kind: 'final'; outcome: 'win' | 'lose' | 'draw' };
```

진행:
- `aiming` ─[발사]→ `user-flying` ─[궤적 끝]→
- `enemy-aiming` ─[0.6s]→ `enemy-flying` ─[궤적 끝]→
- `round-result` ─[1.5s]→ `aiming` (다음 라운드) 또는 `final`

## 결정 사항 (제안 디폴트)

- [x] **모드 선택 위치**: 게임 탭 진입 직후 (모드 안 골랐으면 선택 화면)
- [x] **라운드 수**: 5
- [x] **턴 순서**: 사용자 먼저
- [x] **적 위치**: 우측 (x=30)
- [x] **적의 사거리 식**: 30m 표준 (각도/속도 무한히 많은 해 중 v=√(30g) 기본)
- [x] **노이즈 감소**: 선형 (라운드 1 → 5 사이 ±20°/±5m·s → 0/0)
- [x] **승부 우선**: 사용자 우선 (동시 명중 시 사용자 승)
- [x] **무승부 처리**: 5 라운드 끝까지 결판 없으면 draw 화면

## 라이브러리 추가 (`cannonGame.ts`)

```ts
// 적 발사 계산
export const ENEMY_X = 30;
export interface EnemyShot { angleDeg: number; speed: number; }
export function computeEnemyShot(round: number): EnemyShot;

// 적 궤적 (좌향)
export function enemyTrajectoryAt(
  angleDeg: number, speed: number, t: number, originX?: number
): Vec2;
export function enemyTrajectorySamples(
  angleDeg: number, speed: number,
  options?: { dt?: number; maxT?: number; minY?: number; originX?: number }
): Vec2[];

// 사용자 대포 bbox (적 포탄 명중 검사용)
export const USER_BBOX: Rect;   // { x: -0.7, y: 0, w: 1.4, h: 1.2 }
export const ENEMY_BBOX: Rect;  // { x: ENEMY_X - 0.7, y: 0, w: 1.4, h: 1.2 }

// 듀얼 진행 상수
export const DUEL_ROUNDS = 5;
```

## 컴포넌트·파일 구조

옵션 A — `CannonTab.tsx` 안에서 모드 분기 (single file 확장):
```
CannonTab.tsx
  ├── ModeSelect (신규)
  ├── TargetMode (기존 로직 추출)
  └── DuelMode (신규)
```

옵션 B — 별도 파일:
```
quadratic-function/
  ├── CannonTab.tsx       (모드 분기 셀)
  ├── TargetMode.tsx      (신규: 기존 로직 추출)
  └── DuelMode.tsx        (신규)
```

**옵션 B 채택** — 파일별 책임 명확.

## 단계별 작업 (다음 커밋)

1. 라이브러리 확장 (cannonGame.ts) — 적 AI / 좌향 궤적 / bbox / DUEL_ROUNDS
2. CannonTab.tsx 리팩터: ModeSelect + 기존 로직을 TargetMode.tsx 로 분리
3. DuelMode.tsx 신구현: 사용자 턴 / 적 턴 / round-result / final
4. 적 시각: 우측 대포 SVG, 좌향 발사
5. 결과 화면: 승리/패배/무승부 배너 + 다시 시작
6. CSS: DuelMode 전용 스타일 (모드 선택 카드, HUD, 결과 배너)

## 결정 메모 (사용자 채움)

- 변경 사항:
- 추가 라운드 수:
- 적 AI 난이도 조정:
- 구현 시작일:
