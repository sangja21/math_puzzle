# 커리큘럼 작업 체크리스트

본 문서는 *함수~적분 9단원* 진행을 위한 **실행 단위 TODO**.
README의 진도표가 *상태 요약* 이라면, 본 문서는 *손에 잡히는 작업 항목*.

운영 규칙:
- 한 줄 = 한 작업. 완료 시 `[x]` + 완료일·커밋 해시 짧게 기록.
- 단원 진입은 *공통 선행* 이 끝난 뒤. 매 단원은 *선정 → 계획 확장 → 구현 → 검증 → 커밋* 순.
- 새 작업 발견 시 해당 섹션에 추가하고, 더 이상 필요 없으면 줄로 그어 보존(`~~취소됨~~`).

---

## 0. 공통 선행 작업 (Phase A 진입 전 1회)

- [x] `CoordPlane` 컴포넌트 분리: `src/app/puzzle/linear-function/page.tsx` 의 SVG 좌표평면을 `src/components/CoordPlane.tsx`로 추출 — 2026-04-29
- [x] `linear-function`을 새 `CoordPlane` 사용하도록 마이그레이션 (타입체크 통과, dead code 제거) — 2026-04-29
- [x] `CoordPlane` 옵션 정리: `curves`(샘플 폴리라인) · `points` · `xRange/yRange` · `gridTicks` · `width/height` 입력 + `sampleLine`/`sampleFunction` 헬퍼 — 2026-04-29
- [x] `StoryHeader` 컴포넌트 신설: 책 챕터 인용 카드 표준 — emoji/title/subtitle/story/coreMath 슬롯 + 768·480 반응형 — 2026-04-29
- [x] 적분/도함수 시각화 공통 헬퍼: `src/lib/puzzles/calculus.ts` (수치미분, 사다리꼴 적분, 리만 직사각형, 접선 기울기, 극값 탐색) — 2026-06-04

## 1. 단원별 진행

각 단원은 순서대로 체크. *선정* 이전 단계는 모두 사용자 결정 의존.

### 단원 1 — 이차함수 (`quadratic-function`)
- [x] 안건 선정 — 포탄쏘기 게임 (후보 1) — 2026-04-30
- [x] 선정 안건의 구체 구현 계획서 → `01-quadratic-principle-tab.md` (원리 탭부터)
- [x] `src/lib/puzzles/quadraticFunction.ts` (evaluate / vertex / roots / format) — 2026-04-30
- [x] `src/app/puzzle/quadratic-function/page.tsx` + `page.module.css` (원리 탭 6섹션 + 게임 탭 placeholder) — 2026-04-30
- [x] `src/lib/puzzles.ts` 메타 등록 (`quadratic_function`, `lessonGroup: 함수와 그래프`) — 2026-04-30
- [ ] `principles/page.tsx` 자동 렌더 확인 (lessonGroup 자동)
- [x] 다크모드 / 768·480 반응형 (CSS 미디어쿼리 포함)
- [ ] 시각 검증 (브라우저 — 사용자 확인 필요)
- [x] 포탄쏘기 게임 탭 기획문서 → `01-quadratic-cannon-tab.md` — 2026-04-30
- [x] 포탄쏘기 게임 탭 본구현 (`cannonGame.ts` + `CannonTab.tsx` + 4 레벨) — 2026-04-30
- [x] 커밋 — `55bb04d` (원리 탭) · `9060777` (게임 계획서) · 본 커밋 (게임 구현)

### 단원 2 — 다항함수 (`polynomial`)
- [x] 안건 선정 — 아르키메데스 시라쿠사 방어전 — 2026-05-07
- [x] 구체 구현 계획서
- [x] 라이브러리 — `src/lib/puzzles/polynomial.ts`
- [x] 페이지 + CSS — 원리 탭 6섹션 + 방어전 실습 탭 — 2026-05-07
- [x] 메타 등록
- [x] 반응형 점검
- [x] 시각 검증
- [x] 커밋 — `899b30e` 외

### 단원 3 — 지수와 로그 (`exp-log`)
- [x] 안건 선정 — 후보 1 체스판 쌀알 시뮬레이터 — 2026-05-12
- [x] 구체 구현 계획서 — `03-exp-log.md` 결정 메모 채움 — 2026-05-12
- [x] 라이브러리 — `src/lib/puzzles/expLog.ts` (BigInt 누적, 비유 임계값, 왕↔현자 대화, 무게/한국어 단위 포맷) — 2026-05-12
- [x] 페이지 + CSS — 원리 탭 6섹션 + 게임 탭 (체스판 + RiceBox 떨어지는 쌀 + 척도 격상 + 챌린지) — 2026-05-12
- [x] 메타 등록 — `exp_log`, 함수와 그래프, ♟️ — 2026-05-12
- [x] 반응형 점검 — 768·480 CSS 포함
- [ ] 시각 검증 (브라우저 — 사용자 확인 필요)
- [x] 커밋 — 본 커밋

### 단원 4 — 벡터 (`vector`)
- [x] 안건 선정 — 제트기류 비행 시뮬 ✈️ — 2026-05-12
- [x] 구체 구현 계획서
- [x] 라이브러리 — `src/lib/puzzles/vector.ts`
- [x] 페이지 + CSS (JetstreamTab) — 2026-05-12
- [ ] ~~`river` 퍼즐 상호 링크 추가~~ (미적용 — 백로그)
- [x] 메타 등록
- [x] 반응형 점검
- [x] 시각 검증
- [x] 커밋 — `01600af`

### 단원 5 — 사인함수 (`sine`)
- [x] 안건 선정 — 음파·화성 체험 🎵 — 2026-05-12
- [x] 구체 구현 계획서
- [x] **공유 자산 신설**: `src/components/UnitCircle.tsx` (단원 6·7 재사용)
- [x] 라이브러리 — `src/lib/puzzles/sine.ts`
- [x] 페이지 + CSS (단위원 + 파동 + SoundLab Web Audio) — 2026-05-18
- [x] 메타 등록
- [x] 반응형 점검
- [x] 시각 검증
- [x] 커밋 — `6506766`

### 단원 6 — 코사인함수 (`cosine`)
- [x] 안건 선정 — 후보 4 관측 미션 (삼각측량 거리 추정) 🔭 + 달 미션으로 책 스토리 연결 — 2026-06-04
- [x] 구체 구현 계획서 — `06-cosine.md` 결정 메모 채움 — 2026-06-04
- [x] 라이브러리 (코사인 법칙 헬퍼 포함) — `src/lib/puzzles/cosine.ts` (lawOfCosines, triangulate, 미션 4종) — 2026-06-04
- [x] 페이지 + CSS (`UnitCircle` 재사용) — 원리 탭 5섹션 + SurveyMission 게임 탭 — 2026-06-04
- [x] 메타 등록 — `cosine`, 함수와 그래프, 🌙 — 2026-06-04
- [x] 반응형 점검 — 768·480 CSS 포함
- [x] 시각 검증 — Playwright 헤드리스 (양 탭 렌더 + 조준 동작 + JS 에러 0)
- [x] 커밋 — 본 커밋

### 단원 7 — 탄젠트함수 (`tangent`)
- [x] 안건 선정 — 후보 1 탈레스 측량가 🌅 (나무→게양대→오벨리스크→쿠푸 피라미드 4미션) — 2026-06-04
- [x] 구체 구현 계획서 — `07-tangent.md` 결정 메모 채움 — 2026-06-04
- [x] 라이브러리 — `src/lib/puzzles/tangent.ts` (특수각 tan, 경사도%, 탈레스 비례, 미션 데이터) — 2026-06-04
- [x] 페이지 + CSS (`UnitCircle` 재사용 + 점근선 처리) — 원리 탭 5섹션 (84°+ 점근선 경고) + ThalesMission 게임 탭 — 2026-06-04
- [x] 메타 등록 — `tangent`, 함수와 그래프, 🌅 — 2026-06-04
- [x] 반응형 점검 — 768·480 CSS 포함
- [x] 시각 검증 — Playwright 헤드리스 (양 탭 + 미션 전체 플로우 ⭐3 + JS 에러 0)
- [x] 커밋 — 본 커밋

### 단원 8 — 미분 (`differential`)
- [x] 안건 선정 — 후보 2 롤러코스터 챌린지 🎢 (+후보 5 극값 사냥 = 라운드 2) — 2026-06-04
- [x] 구체 구현 계획서 — `08-differential.md` 결정 메모 채움 — 2026-06-04
- [x] **공유 자산 신설**: `src/lib/puzzles/calculus.ts` (단원 9 공유) — 2026-06-04
- [x] 라이브러리 — `src/lib/puzzles/differential.ts` (트랙 3종, 최급강하·극값 탐색, 채점) — 2026-06-04
- [x] 페이지 + CSS (할선→접선 Δ 수렴 시연) — 원리 탭 5섹션 + CoasterRide 게임 탭 — 2026-06-04
- [x] 메타 등록 — `differential`, 함수와 그래프, 🎢 — 2026-06-04
- [x] 반응형 점검 — 768·480 CSS 포함
- [x] 시각 검증 — Playwright 헤드리스 (양 탭 + 라운드1 ⭐3 + JS 에러 0)
- [x] 커밋 — 본 커밋

### 단원 9 — 적분 (`integral`)
- [ ] 안건 선정
- [ ] 구체 구현 계획서
- [ ] 라이브러리 (`calculus.ts` 재사용)
- [ ] 페이지 + CSS (분할 슬라이더 / FTC 시각화)
- [ ] 단원 8 ↔ 9 상호 링크
- [ ] 메타 등록
- [ ] 반응형 점검
- [ ] 시각 검증
- [ ] 커밋

## 2. 마무리 작업 (모든 단원 완료 후)

- [ ] README.md 본문 갱신: 퍼즐 카운트(28→실제), 신규 9단원 표 추가
- [ ] `principles/page.tsx` 함수 카테고리 섹션 정리
- [ ] 사이드바 그룹화 점검 (함수 9개가 한 그룹으로 묶이는지)
- [ ] `implementation_plan.md` 정리 (이미 폐기된 라이트 테마 계획서)
- [ ] `src/debug_sum.ts` 제거 검토
- [ ] 전체 다크모드 회귀 점검

## 3. 백로그 / 잠재 작업

- [x] 사이트 전체 라우팅 점검 → `docs/curriculum/routing-review.md` (4개 옵션 비교, 추천 B). 실제 적용은 사용자 옵션 결정 대기 — 2026-04-29
- [x] 책 본문 인용 톤 가이드 문서화 (저작권 회피) → `docs/curriculum/quotation-guidelines.md` — 2026-04-29
- [x] 모바일 슬라이더 UX 표준 → `docs/curriculum/slider-ux-standard.md` (5개 페이지 표본 조사, CSS 템플릿, 자가점검 체크리스트). 기존 페이지 마이그레이션은 결정 대기 — 2026-04-29
- [x] 단원별 *학습 시간 안내* 메타 표준 → `docs/curriculum/learning-time-meta.md` (3안 비교, 9단원 추정 초안). 인터페이스·렌더링 적용은 결정 대기 — 2026-04-29

---

## 진행 로그

| 날짜 | 작업 | 커밋 |
|------|------|------|
| 2026-04-29 | 커리큘럼 기획서 하네스 10개 추가 | `7ad6fb1` |
| 2026-04-29 | TODO 문서 추가 | `52796f2` |
| 2026-04-29 | CoordPlane 공유 컴포넌트 추출 + linear-function 마이그레이션 | `351882f` |
| 2026-04-29 | StoryHeader 공유 컴포넌트 신설 | `7687be4` |
| 2026-04-29 | 책 본문 인용 톤 가이드 문서 추가 | `21622a5` |
| 2026-04-29 | 신규 9단원 라우팅·카테고리 검토 문서 추가 | `d25ad68` |
| 2026-04-29 | 슬라이더 UX 표준 문서 추가 | `23fb8c6` |
| 2026-04-29 | 학습 시간 메타 표준 문서 추가 | `b9bc0c7` |
| 2026-05-12 | 단원 3 (지수와 로그) — 체스판 쌀알 시뮬레이터 본구현 | (이번 커밋) |
