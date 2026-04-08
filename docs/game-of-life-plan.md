# 존 콘웨이의 생명 게임 (Game of Life) 구현 계획서

## 개요
- **퍼즐 ID**: `game_of_life`
- **카테고리**: `puzzle`
- **난이도**: `medium`
- **경로**: `/puzzle/game-of-life`
- **학습 목표**: 단순한 규칙에서 복잡한 패턴이 탄생하는 창발(Emergence) 체험. "구경 게임" — 직접 풀 필요 없이 패턴이 살아 움직이는 걸 관찰.

## 페이지 구성 (4페이지)

### 페이지 1: 룰 설명 (`/puzzle/game-of-life`)
- **목적**: 생명 게임의 4가지 규칙을 직관적으로 이해
- **구성 요소**:
  - 타이틀 + 존 콘웨이 소개 (한 줄)
  - 핵심 규칙 4가지 카드:
    1. **탄생**: 죽은 셀 주변에 정확히 3개의 살아있는 이웃 → 살아남
    2. **생존**: 살아있는 셀 주변에 2~3개의 이웃 → 계속 생존
    3. **과밀**: 살아있는 셀 주변에 4개 이상 이웃 → 사망
    4. **고독**: 살아있는 셀 주변에 1개 이하 이웃 → 사망
  - 인터랙티브 미니 데모: 5×5 격자에서 셀 배치 후 한 세대씩 진행하며 규칙 확인
  - "패턴 보러가기" 버튼

### 페이지 2: 주요 패턴 소개 (`/puzzle/game-of-life/patterns`)
- **목적**: 대표 패턴 유형을 카드 형태로 소개
- **패턴 유형**:
  | 유형 | 패턴 이름 | 설명 |
  |------|-----------|------|
  | 정물(Still Life) | Block, Beehive, Loaf | 변하지 않는 안정 패턴 |
  | 진동자(Oscillator) | Blinker, Toad, Beacon | 주기적으로 반복 |
  | 우주선(Spaceship) | Glider, LWSS | 이동하는 패턴 |
  | 무한성장 | Glider Gun(Gosper) | 끝없이 글라이더를 발사 |
- **구성 요소**:
  - 패턴 카드: 이름 + 미니 격자 미리보기 + 설명
  - 카드 클릭 → 미니 애니메이션으로 패턴 동작 확인
  - "직접 구경하기" 버튼 → 패턴 구경 페이지로 이동

### 페이지 3: 패턴 구경 (`/puzzle/game-of-life/playground`)
- **목적**: 프리셋 패턴을 로드하거나 직접 그려서 시뮬레이션 관찰
- **구성 요소**:
  - 격자 보드 (30×30 정도, 셀 클릭으로 토글)
  - 컨트롤 바:
    - 재생/일시정지 버튼
    - 한 세대 진행 버튼 (스텝)
    - 속도 조절 (느림/보통/빠름)
    - 클리어 버튼
    - 세대 카운터
    - 살아있는 셀 수
  - 프리셋 패턴 선택 드롭다운/버튼:
    - Block, Beehive, Blinker, Toad, Beacon, Glider, LWSS, Glider Gun, R-pentomino, Diehard, Acorn
  - 프리셋 선택 시 보드 중앙에 패턴 배치
- **상호작용**:
  - 일시정지 상태에서 셀 클릭으로 편집
  - 재생 중에도 셀 클릭 가능 (자유 실험)

### 페이지 4: 수학적 원리 (`/puzzle/game-of-life/math`)
- **목적**: 생명 게임 뒤의 수학·컴퓨터과학 개념 소개
- **구성 요소**:
  - **셀룰러 오토마타**: 격자 + 규칙 + 동시 업데이트 = 셀룰러 오토마타
  - **창발(Emergence)**: 단순한 규칙 → 복잡한 행동 (개미 한 마리는 단순, 개미 군집은 복잡)
  - **튜링 완전성**: 생명 게임으로 컴퓨터를 만들 수 있다! (간단히 소개)
  - **이웃 수 분석**: 인터랙티브 — 셀 하나를 선택하면 8방향 이웃이 하이라이트되고, 다음 세대 상태를 규칙에 따라 예측

## 파일 구조

```
src/
├── app/puzzle/game-of-life/
│   ├── page.tsx              # 룰 설명
│   ├── page.module.css
│   ├── patterns/
│   │   ├── page.tsx          # 주요 패턴 소개
│   │   └── page.module.css
│   ├── playground/
│   │   ├── page.tsx          # 패턴 구경 (시뮬레이터)
│   │   └── page.module.css
│   └── math/
│       ├── page.tsx          # 수학적 원리
│       └── page.module.css
└── lib/puzzles/
    └── gameOfLife.ts         # 생명 게임 로직 + 프리셋 패턴 데이터
```

## 게임 로직 (`gameOfLife.ts`)

### 핵심 함수
- `createEmptyGrid(rows, cols)`: 빈 격자 생성
- `nextGeneration(grid)`: 다음 세대 계산 (8방향 이웃 카운트 + 4규칙 적용)
- `countNeighbors(grid, row, col)`: 특정 셀의 살아있는 이웃 수
- `placePattern(grid, pattern, centerRow, centerCol)`: 프리셋 패턴 배치

### 프리셋 패턴 데이터
```typescript
interface Pattern {
  name: string;
  type: 'still' | 'oscillator' | 'spaceship' | 'other';
  description: string;
  cells: [number, number][];  // 상대 좌표
}
```

## 스타일 가이드
- 기존 프로젝트 라이트 테마
- 살아있는 셀: `#037dd6` (primary) + 약한 glow
- 죽은 셀: `#f1f5f9` 배경
- 격자선: `#e2e8f0`
- 반응형: 768px, 480px 브레이크포인트
- 모바일에서 격자 크기 축소, 컨트롤 세로 배치
