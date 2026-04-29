# 지수와 로그 — 두 배의 두 배의 두 배

## 개요

| 항목 | 내용 |
|------|------|
| **책 챕터** | 지수와 로그 — *(체스판 쌀알 류의 두 배 이야기)* |
| **스토리 요약** | (※ 원문 확인 필요) 한 칸에 1톨, 다음 칸에 2톨, 그 다음 4톨... 체스판 64칸이면 천문학적 양. 지수 폭증의 충격을 도입. |
| **핵심 수학** | aˣ · log_a x · 자연상수 e · 지수↔로그 역함수 · 로그 스케일 |

## 교과 맥락

- **한국 정규 교과**: 지수·로그 함수 = **고등학교 수학Ⅰ** ([나무위키 — 로그함수](https://namu.wiki/w/%EB%A1%9C%EA%B7%B8%ED%95%A8%EC%88%98))
- **초등·중학교**: 거듭제곱(지수 표기)은 중학교, 로그는 고등 전까지 등장 안 함
- **그러나**: *Exploring Exponential Growth in Elementary School* (2020, Mathematics Teacher Learning and Teaching PK-12, [ResearchGate](https://www.researchgate.net/publication/346688209_Exploring_Exponential_Growth_in_Elementary_School)) — **초등생도 지수 성장의 양감을 충분히 다룰 수 있다** 는 학술 근거가 있음
- **PBS Cyberchase** — *Harry's chess wager* 라는 어린이 애니메이션 시나리오로 지수 성장 도입 (PK-2학년부터 가능)
- **결론**: *식·로그* 는 어렵지만 *수의 양감과 폭증 직관* 은 초등 친화적. 핵심은 *"숫자가 얼마나 빨리 커지나"* 의 시각·체험 위주.

## 학습 목표

1. *선형 직관* 과 *지수 직관* 의 차이 체험 (한 톨씩 vs 두 배씩)
2. 로그 = "몇 번 곱했나" 의 또 다른 이름 (초보적 직관)
3. 자연·기술 곳곳에 지수·로그가 숨어 있음 (복리, 박테리아, pH, 데시벨)

## 관련 사이트 내 퍼즐

- `collatz` — 짝수면 ÷2, 홀수면 ×3+1. 로그 그래프로 핵심이 드러남
- `hanoi` — 디스크 N개 = 2ⁿ - 1 회 이동. 지수의 가장 유명한 알고리즘 사례
- `fakecoin` — 삼진 탐색 O(log₃ N), 로그의 알고리즘 사례

## 기존 검증된 외부 자산 (참고)

| 자료 | 강점 | 우리에게 시사점 |
|------|------|----------------|
| [PBS Cyberchase — Exponential Growth Introduced](https://www.pbslearningmedia.org/resource/vtl07.math.number.exp.lpgrowth/exponential-growth-introduced/) | 어린이 애니메이션, 체스판 쌀알 시나리오 | **초등 친화 검증된 사례** |
| [Folding Paper to the Moon (Boundless Brilliance)](https://boundlessbrilliance.org/brilliant-blog/foldingpapertothemoon) | 42회 접으면 달까지 — 시각·신체 데모 | 후보 2 (종이접기) 의 가장 강력한 출처 |
| [TED-Ed — How folding paper can get you to the moon](https://ed.ted.com/lessons/how-folding-paper-can-get-you-to-the-moon) | 영상 + 활동지 | 한국어 자막 가능 — 보조 링크 |
| [Wheat & Chessboard (Wikipedia)](https://en.wikipedia.org/wiki/Wheat_and_chessboard_problem) | 2⁶⁴-1 = 약 1.8×10¹⁹ 정확한 숫자 | 후보 1 (체스판) 수치 출처 |
| [Annenberg Learner — Overrun by Skeeters](https://www.learner.org/series/insights-into-algebra-1-teaching-for-learning-2/exponential-functions/lesson-plan-1-overrun-by-skeeters-exponential-growth/) | 모기 개체수 시뮬 lesson plan | 후보 4 (박테리아) 변형 |
| [Math Equals Love — Skittles Exponential Activity](https://mathequalslove.net/exponential-growth-and-decay-skittles-activity/) | 사탕으로 hands-on 모델링 | 디지털 변형 가능 |
| [Mathspace — Logarithmic Scale lessons](https://mathspace.co/textbooks/syllabuses/Syllabus-1058/topics/Topic-20593/subtopics/Subtopic-268758/) | 데시벨·리히터 통합 lesson | 후보 5 (로그 스케일) 출처 |
| [Khan Academy 한국어 — 지수·로그](https://ko.khanacademy.org/math/kor-12th/xe93a5fc47121b1d6:12-1) | 한국어 강의 | 보조 학습 링크 |

## 수학퍼즐 후보 조사

### 후보 1 — 체스판 쌀알 시뮬레이터 ♟️🌾
- **퍼즐 정의**: 체스판 8×8. "다음 칸" 버튼으로 한 칸씩 채우면 누적 쌀알 수가 표시. 화면이 못 다 그릴 만큼 커지는 순간 *척도 변환* 토글로 로그 축 발견.
- **풀이 흐름**: 다음 칸 → 누적 표시 → "이게 얼마야?" 비유 (밥그릇/트럭/지구 생산량) → 64칸 챌린지
- **선례**: PBS Cyberchase, Wikipedia, 인도 *크리슈나-체스* 신화. 가장 유명한 도입 사례.
- **초등 적합성 ★★★**: 추천. 충격 가장 강함, 식 몰라도 *"와 너무 많아!"* 가능. **3~6학년 모두 가능 — PBS Cyberchase 가 PK-2 도입 사례**.

### 후보 2 — 종이접기 척도 사다리 📄🌙
- **퍼즐 정의**: 0.1mm 종이를 한 번씩 접을 때마다 두께 두 배. 접은 횟수 슬라이더(0~50). 우측에 *대수 자(scale ladder)* — 박테리아·사람키·에베레스트·달까지·태양·은하.
- **풀이 흐름**: 슬라이더 이동 → 두께 갱신 → 자에서 어디인지 마커 → "달까지 몇 번 접어야 할까?"
- **선례**: [TED-Ed Adrian Paenza](https://ed.ted.com/lessons/how-folding-paper-can-get-you-to-the-moon) 의 *42회면 달까지* 영상. Boundless Brilliance, Big Think 등 다수.
- **초등 적합성 ★★★**: 추천. 시각적 충격, 자(尺) 비유가 강력. 4~6학년 가능. *42* 라는 신기한 숫자 한 컷이 학습 동기 강력.

### 후보 3 — 복리 vs 단리 비교 💰
- **퍼즐 정의**: 100만원을 연 10% 로 30년. 단리 vs 복리 두 그래프를 같이 그려 차이를 시각화.
- **풀이 흐름**: 연수 슬라이더 → 두 그래프 늘어남 → 30년 차이 보면 충격
- **선례**: 미국 *Personal Finance* 교과 표준 활동. Korean *수학Ⅰ* 단원에서도 자주 등장.
- **초등 적합성 ★★**: 부분 적합. *돈* 이 동기지만 "이자" 개념이 4~5학년에겐 낯설 수 있음. 6학년~중1 추천. *상품 가격* 으로 바꾸면 ★★★.

### 후보 4 — 박테리아·인구 시뮬 🦠
- **퍼즐 정의**: 박테리아 1마리 → 20분 후 2마리 → 40분 후 4마리... 시간 슬라이더로 N분 후 개체수 시각.
- **풀이 흐름**: 시간 슬라이더 → 점이 늘어남 + 카운트 → "1시간에 몇 마리?"
- **선례**: Annenberg Learner *Overrun by Skeeters* (모기 시뮬) — 같은 컨셉의 미국 lesson plan
- **초등 적합성 ★★★**: 추천. 점이 늘어나는 *애니메이션* 자체가 직관. 3~6학년 가능. 박테리아·모기 등 *친숙한 생물* 로 동기.

### 후보 5 — 데시벨·리히터 카드 매칭 🔔
- **퍼즐 정의**: "도서관 30dB / 대화 60dB / 콘서트 110dB" 카드와 *실제 소리 비율* 카드 매칭. 30→60은 1000배, 60→110은 10만배.
- **풀이 흐름**: 카드 짝맞추기 → 비율 충격 → 로그 스케일이 *왜 필요한지* 발견
- **선례**: Mathspace, Purplemath, [Clare-Gladwin Decibels lesson](https://claregladwinresd.glk12.org/mod/book/view.php?id=872&chapterid=402) 등 표준 자료
- **초등 적합성 ★★**: 부분 적합. 비율 곱셈이 4~5학년에겐 어려움. *결과만 충격* 으로 노출이면 ★★★. 5~6학년 + 도움말이면 깊이 학습 가능.

### 후보 6 — Skittles 사탕 모델링 (가상화) 🍬
- **퍼즐 정의**: 화면 위 사탕 N개. "S" 가 적힌 면이 위인 것은 사라짐. 매 라운드 사탕 수가 약 절반으로 줄거나 두 배 늘어남(모드 선택). 그래프로 누적 시각.
- **풀이 흐름**: 모드 선택(성장/붕괴) → 매 라운드 진행 → 그래프에 점 찍힘 → 지수 곡선 발견
- **선례**: [Math Equals Love — Skittles activity](https://mathequalslove.net/exponential-growth-and-decay-skittles-activity/) 의 디지털화. Hands-on 활동을 클래스룸 외 가정에서도 가능하게.
- **초등 적합성 ★★★**: 추천. 사탕·동전 던지기 친숙, 확률 직관. 3~6학년 가능. *지수 붕괴* 까지 같은 도구로 학습 가능 (방사선·약물 등의 보조 도입).

### 후보 7 — 로그 사다리 게임 🪜
- **퍼즐 정의**: 사다리 위 *세로 등간격* 칸. 1단=1, 2단=10, 3단=100, 4단=1000... *주어진 수* 가 어느 칸 사이에 있을지 클릭.
- **풀이 흐름**: "73,000 은 몇 단과 몇 단 사이?" → 클릭 → 정오답
- **선례**: 직접 동일 게임은 적음. *자릿수 추정* 게임 변형. 로그의 *직관적 정의* 와 일치.
- **초등 적합성 ★★**: 부분 적합. 자릿수 세기 사고이므로 *자릿수 게임* 으로 리프레임하면 ★★★. 4~6학년 가능.

## 수학의 원리 탭 구현 계획

### 핵심 개념 4개

1. **두 배씩 늘면 폭발한다 (지수)**
   - 직관: 체스판 쌀알, 종이접기
   - 시각: 1, 2, 4, 8, 16... 막대 그래프 (로그 축으로 토글 가능)

2. **반대로 줄이면 = 로그**
   - 직관: "몇 번 곱했더니 1000이 됐을까?"
   - 정의: log₁₀ 1000 = 3
   - 시각: 사다리 단 = log

3. **밑(base) 이 바뀌면**
   - 2배씩(컴퓨터) / 10배씩(과학) / e배씩(자연)
   - 시각: 같은 시간에 2ⁿ vs 10ⁿ vs eⁿ 비교 그래프

4. **자연·기술 속의 로그**
   - 데시벨·리히터·pH·별의 등급
   - 카드 5장으로 한 컷씩

### 시각화 자산
- `CoordPlane` 재사용 (단, *로그 축 옵션* 추가 필요 — `yScale: 'linear' | 'log'` prop)
- 척도 사다리 컴포넌트 신규 (단원 전용)

### 자가 점검 질문
1. 2를 10번 곱하면 약 얼마인가? (= 1024, 약 1000)
2. log₁₀ 100,000 은 얼마인가?
3. 리히터 6과 8의 지진 *세기 비율* 은? (= 100배)

## 결정 메모

- 선정 퍼즐:
- 원리 탭 변형:
- 구현 시작일:
