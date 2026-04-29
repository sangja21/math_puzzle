# 슬라이더 UX 표준 (모바일·데스크톱 공통)

함수~적분 9단원은 모두 *슬라이더 헤비* (계수, 각도, 분할 N 등). 기존
사이트의 슬라이더가 단원·페이지마다 색·크기·thumb 모양이 제각각이라
신규 단원에서 *표준* 을 따르면 즉시 일관성 회복. 본 문서는 그 표준 정의.

## 현황 (5개 페이지 표본 조사)

| 페이지 | 트랙색 | accent | thumb | 비고 |
|--------|--------|--------|-------|------|
| linear-function | 네이티브 | `#60a5fa` 블루 | 네이티브 | 컨테이너에 `rgba(255,255,255,0.05)` 박스 |
| squares | `#1c2333` 짙은 슬레이트 | `#ffd700` 골드 | `::-webkit-slider-thumb` 24×24 골드 그라디언트 + hover scale 1.2 | 커스텀 thumb 정도가 가장 공들임 |
| sieve | 네이티브 | `#ffd700` 골드 | 네이티브 | width 120px 짧은 슬라이더 |
| machin | `#e2e8f0` 라이트 그레이 | `#cba135` 다크 골드 | 네이티브 | **다크 전환 시 누락** — 트랙색이 라이트 잔재 |
| cryptarithmetic | (관찰 안 됨) | — | — | 모듈 CSS 내 슬라이더 정의 미발견 |

**진단**:
- accent 색상 3종 혼재 (블루 / 골드 / 다크 골드)
- thumb 커스터마이즈 비대칭 (1개 페이지만 정성껏)
- machin 은 `41d3f7e` 다크 일괄 전환 누락 가능성
- 모바일 터치 타겟에 대한 *명시적 처리 부재* (네이티브 thumb는 ~16px 디폴트)

## 표준 (신규 단원·기존 단원 점진 적용)

### 시각 토큰

| 토큰 | 값 | 사용처 |
|------|-----|--------|
| `--slider-track-bg` | `rgba(255, 255, 255, 0.08)` | 트랙 배경 (다크 테마 통일) |
| `--slider-track-h` | `8px` | 트랙 높이 |
| `--slider-thumb-bg` | `#60a5fa` (페이지가 다른 accent 쓰면 그 값) | thumb 색 |
| `--slider-thumb-size-d` | `18px` | 데스크톱 thumb |
| `--slider-thumb-size-m` | `26px` | 모바일 thumb (≤768px) |
| `--slider-thumb-shadow` | `0 2px 6px rgba(0,0,0,0.35)` | thumb 입체감 |

### accent 결정 규칙
- **기본**: `#60a5fa` (linear-function 과 동일, 사이트 기본 블루)
- 단원별 색 변형이 필요하면 *오직 `--slider-thumb-bg`* 만 단원에서 오버라이드 (트랙·hover 효과는 그대로 유지)

### 기준 CSS 템플릿 (CSS Modules)

신규 단원의 `page.module.css` 또는 컴포넌트 모듈에 그대로 복사:

```css
.sliderGroup {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 14px 16px;
}

.sliderRow {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sliderLabel {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

.sliderVal {
  font-size: 1.1rem;
  font-weight: 700;
  color: #60a5fa;
  min-width: 32px;
  text-align: right;
}

.slider {
  width: 100%;
  height: 8px;
  appearance: none;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  outline: none;
  cursor: pointer;
}

.slider::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #60a5fa;
  border: 2px solid #0f172a;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
  cursor: pointer;
  transition: transform 0.15s ease;
}
.slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
}
.slider::-webkit-slider-thumb:active {
  transform: scale(1.1);
}

.slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #60a5fa;
  border: 2px solid #0f172a;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
  cursor: pointer;
}

.slider:focus-visible::-webkit-slider-thumb {
  outline: 2px solid #93c5fd;
  outline-offset: 2px;
}

.sliderHint {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.45);
}

/* 모바일: thumb 확대 (터치 타겟) */
@media (max-width: 768px) {
  .slider::-webkit-slider-thumb {
    width: 26px;
    height: 26px;
  }
  .slider::-moz-range-thumb {
    width: 26px;
    height: 26px;
  }
}
```

### 색 오버라이드 패턴

단원이 고유 accent 를 쓰고 싶다면 같은 모듈에 보조 클래스 추가:

```css
.sliderAccentGold::-webkit-slider-thumb { background: #fbbf24; }
.sliderAccentGold::-moz-range-thumb { background: #fbbf24; }
```

JSX 에서 `<input className={`${styles.slider} ${styles.sliderAccentGold}`} ... />` 와 같이 합성.

## 모바일·접근성 체크리스트

신규 단원에서 슬라이더 추가 시 자가점검:

- [ ] thumb 크기가 모바일(≤768px)에서 26px 이상
- [ ] `accent-color` 또는 커스텀 thumb 가 페이지 테마와 일치
- [ ] 트랙 색이 `rgba(255,255,255,0.08)` (다크) 인가 — 라이트 잔재 없음
- [ ] `:focus-visible` 처리 (키보드 접근)
- [ ] 슬라이더 옆에 *현재 값* 이 시각적으로 노출 (`.sliderVal`)
- [ ] 슬라이더 *step* 이 적절 (정수면 1, 연속이면 0.1 또는 0.05)
- [ ] 모바일에서 슬라이더 폭이 100% 또는 충분 (`width: 100%`)
- [ ] aria-label 또는 연결된 `<label>` 존재 (스크린리더)

## 후속 작업 (옵션, 본 표준이 정착한 뒤)

- `globals.css` 에 CSS 변수 토큰 정의 → 페이지에서 `var(--slider-thumb-bg)` 식 사용 (현재는 모듈 CSS 만으로도 충분)
- `src/components/Slider.tsx` 공유 컴포넌트로 추출 — 슬라이더 + 라벨 + 현재 값 한 묶음. *9단원에서 같은 패턴이 누적되면* 그때 추출
- 기존 페이지 마이그레이션:
  - **machin** — 다크 잔재 트랙색 정정 (우선순위 높음)
  - **squares** — 골드 thumb 유지하되 트랙색 통일
  - **sieve** — 짧은 width(120px) 그대로 두되 thumb 가시성만 보정
  - **linear-function** — 이미 표준에 가까움, 그대로 OK

## 결정 메모 (사용자 채움)

- 표준 채택 여부:
- 기존 페이지 마이그레이션 범위:
- accent 색 토큰을 globals.css 에 올릴지:
- 결정일:
