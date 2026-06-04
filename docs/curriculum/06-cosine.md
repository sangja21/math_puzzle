# 코사인함수 — 지구에서 달까지의 거리

## 개요

| 항목 | 내용 |
|------|------|
| **책 챕터** | 코사인함수 — *지구에서 달까지의 거리* |
| **스토리 요약** | (※ 원문 확인 필요) 직접 자로 잴 수 없는 *천문학적 거리* 를 두 관측점의 각도와 한 변 만으로 추정. 시차·삼각측량의 이야기. |
| **핵심 수학** | cos θ = 인접변/빗변 · 사인과의 위상 차 (π/2) · **코사인 법칙** c² = a² + b² − 2ab·cos C · 시차(parallax) |

## 교과 맥락

- **한국 정규 교과**: 코사인 정의 = 중3 (삼각비), 코사인 법칙·삼각측량 = **고1~고2** ([나무위키 — 코사인 법칙](https://namu.wiki/w/%EC%BD%94%EC%82%AC%EC%9D%B8%20%EB%B2%95%EC%B9%99))
- **초등·중학교**: 코사인 자체는 정규 외. 그러나 *비율 추론* 만으로 일부 응용 가능
- **결론**: 식·법칙은 고등 수준. 천문 거리 *체험·시연* 은 초등도 가능.

## 학습 목표

1. 코사인은 *직각삼각형의 인접변 / 빗변* 비율
2. 두 관측점의 각도로 *직접 못 재는 거리* 를 알아내는 기적의 발상 (삼각측량)
3. 사인과 *위상 90° 차이* 의 형제 관계

## 관련 사이트 내 퍼즐

- (사인) — 동일 단위원 자산 재사용
- `knight` — 격자 거리. 코사인 거리(코사인 유사도)와 약하게 연결

## 기존 검증된 외부 자산 (참고)

| 자료 | 강점 | 우리에게 시사점 |
|------|------|----------------|
| [PhET Trig Tour](https://phet.colorado.edu/sims/html/trig-tour/latest/trig-tour_en.html) | 사인·코사인·탄젠트 단위원 통합 | 단원 5·6·7 공통 자산 |
| [GeoGebra — Sin Cos Tan animated](https://www.geogebra.org/m/cNEtsbvC) | 단위원 회전 + 세 함수 동시 | 동일 |
| [MiniWebTool Law of Cosines Calculator](https://miniwebtool.com/law-of-cosines-calculator/) | SAS·SSS 입력 → 삼각형 자동 시각화 | 후보 3 (도구박스) 의 강력한 사례 |
| [NASA Spacemath — Right Triangle Trigonometry](https://spacemath.gsfc.nasa.gov/algebra2/CH13v3.pdf) | 천문 거리 계산 워크시트 | 후보 2 (천문 삼각측량) 학술 출처 |
| [Plus Magazine — Sun, Moon and Trigonometry](https://plus.maths.org/content/sun-moon-and-trigonometry) | Aristarchus 의 ES/EM = 1/cos(α) | 책 스토리 직접 매칭 |
| [Direct triangulation to the Moon (ResearchGate)](https://www.researchgate.net/publication/231098247_Determining_the_instantaneous_distance_to_the_moon_by_direct_triangulation) | 두 관측점 각도로 5% 정확도 | 후보 2 의 정확도 근거 |
| [Khan Academy 한국어 — 사인·코사인 법칙](https://ko.khanacademy.org/math/trigonometry/trig-with-general-triangles/solving-general-triangles/a/laws-of-sines-and-cosines-review) | 한국어 강의 | 보조 학습 링크 |
| [EBSMath — 삼각측량](https://www.ebsmath.co.kr/resource/rscView?cate=132200&cate2=132220&cate3=132221&rscTpDscd=RTP10&grdCd=HGRD02&sno=29298&type=S&historyYn=study) | 한국 고1~2 자료 | 한국 교과 톤 참고 |

## 수학퍼즐 후보 조사

### 후보 1 — 코사인 그래프 + 단위원 (사인 자매) ⭕📉
- **퍼즐 정의**: 사인 페이지의 단위원·파동 자산을 *재사용*. 단위원 위 회전점의 *x좌표* 가 코사인 → 파동.
- **풀이 흐름**: 사인 곡선과 코사인 곡선을 *동일 화면에 겹쳐* → π/2 차이 발견
- **선례**: PhET Trig Tour, GeoGebra. 사인·코사인 통합 표준 자산.
- **초등 적합성 ★★**: 부분 적합. 사인 단원이 선행되어야 함. 6학년 + 도움말이면 *형제 관계* 만 시각 학습 가능.

### 후보 2 — 천문 삼각측량 시뮬 🌙
- **퍼즐 정의**: 두 관측점에서 같은 천체(달·별)를 바라본 각도 → 거리 계산.
- **풀이 흐름**: 지도 위 두 도시 선택 → 각 점에서 달을 바라본 각도 입력 → AB 기선과 두 각으로 *코사인 법칙* 적용 → 달까지 거리 표시
- **선례**: [NASA Spacemath](https://spacemath.gsfc.nasa.gov/algebra2/CH13v3.pdf) 워크시트, [Plus Magazine Aristarchus](https://plus.maths.org/content/sun-moon-and-trigonometry), [Direct triangulation paper](https://www.researchgate.net/publication/231098247_Determining_the_instantaneous_distance_to_the_moon_by_direct_triangulation). 책 챕터 직접 매칭.
- **초등 적합성 ★**: 어려움. 단위 스케일(km, 광년) + 코사인 법칙 식 모두 부담. 중3~고1 권장. *결과 시연* 만 영상으로 노출이면 ★★★.

### 후보 3 — 코사인 법칙 도구박스 🔧
- **퍼즐 정의**: SAS·SSS 등 삼각형의 *부분 정보* 만 주면 나머지를 구해주는 인터랙티브 도구.
- **풀이 흐름**: 모드(SAS/SSS) 선택 → 슬라이더로 알려진 변·각 입력 → 미지 변·각이 자동 계산되며 삼각형 동적 그려짐
- **선례**: [MiniWebTool Law of Cosines Calculator](https://miniwebtool.com/law-of-cosines-calculator/) 가 사실상 동일 도구. 우리 가치 = 게임화.
- **초등 적합성 ★**: 어려움. 코사인 법칙 자체가 고등. 비추.

### 후보 4 — 거리 추정 게임 (관측 미션) 🔭
- **퍼즐 정의**: 두 관측점에서 *멀리 있는 깃발* 을 본다. 각도 두 개를 측정해 *깃발까지 거리* 를 추정. 정답에 가까울수록 점수.
- **풀이 흐름**: 두 점 선택 → 각도기 도구로 깃발 방향 측정 → 거리 입력 → 정답
- **선례**: 후보 2의 *지구적 스케일이 아닌 운동장 스케일* 변형. 측량술 활동.
- **초등 적합성 ★★★**: 추천. 운동장 스케일이라 직관적, *각도기로 측정* 자체가 즐거움. 5~6학년 가능. 어른 1회 도움이면 OK.

### 후보 5 — 사인↔코사인 변환 게임 🔄
- **퍼즐 정의**: 사인 곡선이 주어졌을 때 *얼마만큼 옆으로 밀면 코사인이 되나?* 슬라이더 90°까지 이동시켜 일치 확인.
- **풀이 흐름**: 두 곡선 표시 → 한 곡선을 슬라이더로 위상 이동 → 일치하는 위치 찾기
- **선례**: 표준 *trig identities* 활동. PhET 단위원에서도 동일 시각.
- **초등 적합성 ★★**: 부분 적합. *위상* 개념이 추상. 6학년~중1 권장. *사인 = 코사인을 90° 옮긴 것* 이라는 한 줄 사실만 노출은 가능.

### 후보 6 — 직각삼각형 비율 매칭 🔺
- **퍼즐 정의**: 직각삼각형 그림 4~6장 (각도 다양). *코사인 = 인접/빗변* 비율을 추정해 카드와 매칭.
- **풀이 흐름**: 그림 보고 비율 추정 (0.3·0.5·0.7·0.9 등) → 정오답
- **선례**: 표준 trig matching. 닮음 학습 친화.
- **초등 적합성 ★★**: 부분 적합. 비율 추정 + 직각삼각형 부담. 6학년 + 도움말. 닮음 학습 후라면 적당.

## 수학의 원리 탭 구현 계획

### 핵심 개념 4개

1. **코사인은 사인의 친척**
   - 직관: 직각삼각형의 *인접변* (밑변)을 빗변으로 나눔
   - 시각: 같은 삼각형에서 sin·cos 동시 표시
   - 자가 점검: cos 0° = ?, cos 90° = ?

2. **사인과 90° 차이**
   - 두 곡선 같은 화면 비교
   - 90° 옮기면 일치
   - 시각: 두 곡선 + 위상 이동 슬라이더

3. **사인²+코사인²=1 (피타고라스의 친척)**
   - 단위원 위 점은 (cos θ, sin θ)
   - 단위원의 정의: x²+y²=1
   - 시각: 단위원 위 점의 좌표를 마우스 따라 표시

4. **코사인 법칙 — 삼각형 풀기**
   - 일반 삼각형 (직각이 아닌)에서 *변·각* 의 관계
   - c² = a² + b² − 2ab·cos C
   - 한 컷 시연: SAS → c 계산

### 시각화 자산
- `CoordPlane` 재사용
- `UnitCircle` 재사용 (단원 5에서 신설)
- 일반 삼각형 동적 렌더링 (단원 7 탄젠트와 공유 가능)

### 자가 점검 질문
1. cos 60° = ? (= 0.5)
2. sin θ = 0.6 일 때 cos θ 의 가능한 값은? (= ±0.8)
3. 두 변이 5, 7이고 사잇각이 60° 인 삼각형의 마지막 변은? (≈ 6.24)

## 결정 메모

- 선정 퍼즐: **후보 4 — 거리 추정 게임 (관측 미션 🔭)** + 최종 레벨을 *후보 2 (천문 삼각측량)* 의 달 관측으로 연결해 책 스토리 직접 매칭. 4개 미션: 운동장 깃발 → 강 건너 나무 → 먼 산봉우리 → 지구에서 달까지.
- 원리 탭 변형: 기획서의 핵심 개념 4개 그대로 — §1 cos = 인접/빗변 (특수각 표), §2 사인 90° 밀기 일치 게임, §3 단위원 (cos θ, sin θ) + cos²+sin²=1, §4 코사인 법칙 SAS (C=90° → 피타고라스 발견 포함), §5 자가 점검 3문.
- 구현 시작일: 2026-06-04 (당일 완료)
- 게임 설계: 망원경 각도 슬라이더 조준 → 기록(2회) → 눈금선 읽고 거리 추정 → 별 0~3 채점. 달 미션은 슬라이더 정밀도 0.01°로 *기선이 길어야 하는 이유* 를 체감.
- 공유 자산: `UnitCircle`(showCos), `CoordPlane`, `StoryHeader` 재사용. 신규 로직은 `src/lib/puzzles/cosine.ts` (코사인 법칙·삼각측량·미션 데이터).
