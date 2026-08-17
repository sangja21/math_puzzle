# 시후의 수학퍼즐 (Sihu's Math Puzzles)

고전 수학 퍼즐, 정수론 문제, 코딩 원리를 인터랙티브 웹 게임으로 구현한 교육용 플랫폼입니다.
마틴 가드너의 클래식 퍼즐부터 알고리즘 시각화까지, 직접 조작하며 수학적 원리를 체험해보세요!

## 프로젝트 개요

| 항목 | 내용 |
|------|------|
| **목적** | 수학적 사고력과 컴퓨팅 사고력을 게임화된 인터랙티브 퍼즐로 학습 |
| **대상** | 초/중등 학생 및 수학에 관심 있는 누구나 |
| **언어** | 한국어 |
| **작성자** | Lee Junyeol |

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | CSS Modules |
| **State** | React Hooks (`useState`, `useReducer`) |
| **DnD** | @dnd-kit (드래그앤드롭) |
| **Effects** | canvas-confetti (축하 효과) |

---

## 콘텐츠 구성

프로젝트는 크게 **3가지 카테고리**로 나뉩니다.

### 1. 수학 퍼즐 (37개)

| 퍼즐 | 경로 | 핵심 개념 | 설명 |
|------|------|-----------|------|
| 모래시계 퍼즐 | `/puzzle/hourglass` | Diophantine Equation | 7분과 11분 모래시계로 정확한 시간 재기 |
| 100개의 문 | `/puzzle/doors` | 약수(Divisors) | 100명의 간수가 문을 토글 - 열린 문은 완전제곱수 |
| 양팔저울 | `/puzzle/balance` | 균형 3진법 | 3의 거듭제곱 추로 모든 무게 측정하기 |
| 강 건너기 | `/puzzle/river` | State Space Search | 늑대/양/양배추 & 선교사/식인종 모드 |
| 가짜 동전 찾기 | `/puzzle/fakecoin` | 삼진 탐색 (Ternary Search) | O(log3 N) 효율로 가짜 동전 찾기 (드래그앤드롭) |
| 요세푸스 퍼즐 | `/puzzle/josephus` | Modular Arithmetic | 원형 제거 문제 시뮬레이션 (AD 67년 고증) |
| 유클리드 게임 | `/puzzle/euclid` | 유클리드 호제법 | 직사각형 자르기 시각화 & AI 대전 |
| 카이사르 암호 | `/puzzle/caesar` | 치환 암호 | 5단계 암호 해독 게임 (빈도 분석 포함) |
| 하노이의 탑 | `/puzzle/hanoi` | 재귀(Recursion) | 3~8개 원판, 자동 풀이 애니메이션 |
| 기사의 여행 | `/puzzle/knight` | 그래프 탐색 | 체스 나이트로 모든 칸 방문 (Warnsdorff 휴리스틱) |
| 마친의 공식 | `/puzzle/machin` | 급수 수렴 | pi 계산 공식 탐험 (최대 1000자리) |
| 마방진 | `/puzzle/magic-square` | 조합론 | N×N 마방진 만들기 (드래그앤드롭) |
| NIM 게임 | `/puzzle/nim` | XOR 전략 | 돌 가져가기 게임 & AI 대전 |
| 암호 자물쇠 | `/puzzle/number-lock` | 회전 치환 | 3단계 다이얼 자물쇠 퍼즐 |
| 에라토스테네스의 체 | `/puzzle/sieve` | 소수 판별 | 단계별 소수 걸러내기 시각화 |
| 완전제곱수의 기하학 | `/puzzle/squares` | 홀수의 합 | n² = 1+3+5+...+(2n-1) 시각적 증명 |
| Mr.P와 Mr.S | `/puzzle/sum_product` | 논리적 추론 | 합과 곱으로 수 추론하는 불가능 퍼즐 |
| 진리표 | `/puzzle/truth-table` | 논리 게이트 | 진리표 완성 퍼즐 (드래그앤드롭) |
| 비밀요원 테스트 | `/puzzle/warmup` | 패턴 인식 | 수 변환 규칙 찾기 (카이사르 암호 입문) |
| 개미수열 | `/puzzle/ant-sequence` | 수열 패턴 | 베르나르 베르베르 소설 기반 수열 퍼즐 |
| 16진수 수열 | `/puzzle/base-16` | 진법 변환 | 다양한 진법에서의 숫자 표현 |
| 연속번호 배치 | `/puzzle/consecutive-node` | 제약 충족 (CSP) | 그래프에 숫자 배치 (백트래킹 시각화) |
| 곱셈 퍼즐 | `/puzzle/multiplication` | 브루트포스 | 곱셈 원리 퀴즈 & 블록 코딩 |
| 100개의 문 블록코딩 | `/puzzle/doors/block-coding` | 비주얼 프로그래밍 | 문 퍼즐을 블록 코딩으로 풀기 |
| 콜라츠 추측 | `/puzzle/collatz` | 수열·미해결 문제 | 짝수÷2, 홀수×3+1 — 언제나 1이 될까? |
| 달력 마법 | `/puzzle/calendar-magic` | 숨겨진 수학 규칙 | 3×3 블록 합계를 즉시 맞히는 마술의 원리 |
| 이상한 주사위 | `/puzzle/strange-dice` | 비이행적 우열 | 가위바위보처럼 승패가 순환하는 주사위 |
| 몬티 홀의 역설 | `/puzzle/monty-hall` | 조건부 확률 | 문을 바꿔야 할까? 직관을 배신하는 확률 |
| N-퀸 | `/puzzle/n-queens` | 백트래킹 | N×N 체스판에 퀸 N개 배치 + 충돌 시각화 |
| 탱그램 | `/puzzle/tangram` | 공간 추론 | 7조각 드래그·회전으로 실루엣 맞추기 |
| 함수 기계 | `/puzzle/function-machine` | 함수 개념 | 입력→규칙→출력 탐구 |
| 라이츠 아웃 | `/puzzle/lights-out` | 선형대수 (GF2) | 버튼 토글로 모든 불 끄기 |
| 생명 게임 | `/puzzle/game-of-life` | 세포 자동자 | 콘웨이 규칙으로 생명 진화 시뮬레이션 |
| 복면산 | `/puzzle/cryptarithmetic` | 제약 충족 | 글자를 숫자로 치환해 식 성립시키기 |
| 쾨니히스베르크의 다리 | `/puzzle/konigsberg` | 오일러 경로 | 7개 다리를 한붓그리기로 — 오일러의 발견 |
| 스도쿠 미니 (4×4) | `/puzzle/sudoku-mini` | 라틴방진 | 4×4 격자에서 1~4 배치 입문 퍼즐 |
| 피타고라스 시각 증명 | `/puzzle/pythagoras` | a²+b²=c² | 조각 재배치로 피타고라스 정리를 눈으로 증명 |
| 마스터마인드 | `/puzzle/mastermind` | Knuth 채점 | 색깔 코드를 6번 안에 깨는 논리 추론 |
| 노노그램 | `/puzzle/nonogram` | 그림 논리 | 가로·세로 단서로 숨은 그림 채우기 |

### 2. 코딩 원리 학습 (14개)

프로그래밍 기초 개념을 시각적 비유로 학습합니다.

#### 알고리즘

| 주제 | 경로 | 설명 |
|------|------|------|
| 버블 정렬 (단계) | `/coding/bubble/steps` | 단계별 정렬 과정 학습 |
| 버블 정렬 (실험실) | `/coding/bubble/lab` | 직접 조작하며 실험 |
| 선택 정렬 (단계) | `/coding/selection/steps` | 최솟값 선택 과정 시각화 |
| 선택 정렬 (실험실) | `/coding/selection/lab` | 인터랙티브 실습 |

#### 기본 문법

| 주제 | 경로 | 비유 |
|------|------|------|
| 변수 | `/coding/variables` | 마법의 상자에 값 넣기 |
| 리스트 | `/coding/lists` | 기차 칸에 데이터 담기 |
| 산술 연산자 | `/coding/operators/arithmetic` | 톱니바퀴 계산기 |
| 조건 연산자 | `/coding/operators/conditional` | 저울로 비교하기 |
| 논리 연산자 | `/coding/operators/logical` | 전구 회로 퍼즐 |

#### 조건문

| 주제 | 경로 | 비유 |
|------|------|------|
| if 문 | `/coding/if` | 신호등 비유 |
| if-else 문 | `/coding/if-else` | 갈림길 비유 |
| 복합 조건문 | `/coding/compound` | 논리 스위치 |

#### 반복문

| 주제 | 경로 | 비유 |
|------|------|------|
| for 문 | `/coding/loop/for` | 공장 컨베이어 벨트 |
| while 문 | `/coding/loop/while` | 배터리 충전 머신 |

### 3. 퍼즐나라의 앨리스

이상한 나라의 앨리스 세계관 기반 퍼즐 모음입니다.

| 퍼즐 | 경로 | 설명 |
|------|------|------|
| 마법의 쿠키 | `/alice/magic-cookies` | 앨리스 테마 쿠키 퍼즐 |
| 줄어드는 쿠키 | `/alice/shrinking-cookies` | 크기 변환 퍼즐 |

### 4. 수학의 원리 — 함수와 그래프 (10단원)

수업 연계 심화 학습 코스입니다. 각 단원은 **원리 탭** (5섹션 + 자가점검 + CTA) + **미션형 게임 탭**으로 구성됩니다.

| 단원 | 제목 | 경로 | 핵심 개념 | 게임 미션 |
|------|------|------|-----------|-----------|
| 1 | 1차함수의 원리 | `/puzzle/linear-function` | 기울기·절편 | 직선 조작 탐구 |
| 2 | 2차함수의 원리 | `/puzzle/quadratic-function` | 포물선·꼭짓점·근 | 포탄쏘기 4레벨 🎯 |
| 3 | 다항함수의 원리 | `/puzzle/polynomial` | 차수·극값·변곡점 | 아르키메데스 방어전 ⚔️ |
| 4 | 지수와 로그의 원리 | `/puzzle/exp-log` | 지수 폭증·로그 척도 | 체스판 쌀알 시뮬레이터 ♟️ |
| 5 | 벡터의 원리 | `/puzzle/vector` | 벡터 합성·분해 | 제트기류 비행 ✈️ |
| 6 | 사인함수의 원리 | `/puzzle/sine` | 단위원·파동 | 음파 화성 실험 🎵 |
| 7 | 코사인함수의 원리 | `/puzzle/cosine` | 코사인 법칙·삼각측량 | 달 거리 관측 미션 🌙 |
| 8 | 탄젠트함수의 원리 | `/puzzle/tangent` | 경사도·점근선 | 탈레스 그림자 측량 🌅 |
| 9 | 미분의 원리 | `/puzzle/differential` | 순간변화율·극값 탐색 | 롤러코스터 챌린지 🎢 |
| 10 | 적분의 원리 | `/puzzle/integral` | 리만합·미적분 기본정리 | 면적 측량사 🏛️ |

### 5. AI 딥러닝 수학 퍼즐 (시리즈)

딥러닝을 움직이는 수학을 손으로 풀어보는 인터랙티브 퍼즐 시리즈입니다. (`/ai`)
『딥러닝 수학 워크북』을 인터랙티브 게임으로 옮겼습니다.

| 챕터 | 제목 | 경로 | 핵심 개념 | 상태 |
|------|------|------|-----------|------|
| 01 | 내적 — 뉴런의 가중합 | `/ai/dot-product` | Dot Product (뉴런 = 입력·가중치 내적) | ✅ |
| 02 | 행렬 곱셈 — 한 층 전체 | `/ai/matrix` | Matrix Multiplication (한 층 = 내적의 격자) | ✅ |
| 03 | 경사하강법 — 학습의 원리 | — | Gradient Descent | 준비 중 |

**01 내적**: 워크북 30문제를 5단계로 재구성 — 순전파(출력 계산)와 가중치 찾기(학습)를
워크북의 박스 UI 그대로 풀며, 각 문제에 "왜 이게 딥러닝인지" 항별 가중합 해설을 곁들입니다.

**02 행렬 곱셈**: 워크북 50개 빈칸을 24개 퍼즐 · 7단계로 재구성. 위쪽 행렬(열)과
왼쪽 행렬(행)이 만나 결과 격자를 만드는 워크북 배치를 그대로 옮겼고, 빈칸을 눌러
하나씩 채웁니다. 결과 칸뿐 아니라 행렬 안쪽 빈칸(가중치 역추적), A·B ≠ B·A,
0/1 행렬의 lookup 성질까지 다룹니다.

---

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx              # 메인 페이지 (히어로 + 카테고리 카드)
│   ├── layout.tsx            # 공통 레이아웃 (사이드바 + Google Analytics)
│   ├── globals.css           # 전역 스타일
│   ├── puzzle/               # 수학 퍼즐 37개
│   │   ├── hanoi/
│   │   ├── knight/
│   │   ├── caesar/
│   │   └── ...
│   ├── puzzles/              # 퍼즐 목록 페이지 (그리드 뷰)
│   ├── principles/           # 수학 원리 목록 페이지
│   ├── coding/               # 코딩 원리 학습 14개
│   │   ├── bubble/
│   │   ├── selection/
│   │   ├── variables/
│   │   ├── loop/
│   │   └── ...
│   └── alice/                # 앨리스 테마 퍼즐
├── components/               # 공유 컴포넌트
│   ├── Sidebar.tsx           # 네비게이션 사이드바
│   ├── Balance.tsx           # 양팔저울 컴포넌트
│   ├── Hourglass.tsx         # 모래시계 시각화
│   ├── BubbleSortStage.tsx   # 버블 정렬 시각화
│   ├── SelectionSortStage.tsx# 선택 정렬 시각화
│   └── AlgorithmTabs.tsx     # 알고리즘 탭 UI
└── lib/
    └── puzzles/              # 퍼즐 로직 (게임 엔진)
        ├── caesar.ts
        ├── hanoi.ts
        ├── knight.ts
        ├── nim.ts
        └── ...
```

---

## 디자인 특징

- **Clean & Modern**: 화이트/그레이 기반의 깔끔한 테마 (Slate 컬러 팔레트)
- **Interactive**: 드래그앤드롭, 클릭, 슬라이더, 실시간 시각화
- **Micro-Animations**: 퍼즐 해결 시 축하 효과 (confetti), 부드러운 전환
- **Responsive**: 데스크톱/모바일 대응
- **Progressive Disclosure**: 힌트와 설명을 단계적으로 공개

---

## 실행 방법

```bash
# 1. 저장소 클론
git clone https://github.com/sangja21/math_puzzle.git
cd math_puzzle

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

---

## 교육적 설계 원칙

1. **게이미피케이션**: 즉각적인 시각 피드백과 난이도 조절로 학습 동기 유발
2. **다중 표현**: 시각적, 인터랙티브, 텍스트 설명을 조합하여 이해도 향상
3. **자기주도 학습**: 자동 풀이 기능으로 알고리즘 동작 과정을 관찰 가능
4. **스토리텔링**: 마친의 보물찾기, 비밀요원 훈련, 앨리스 세계 등 서사적 요소 활용
5. **점진적 난이도**: 쉬운 단계부터 도전적인 문제까지 자연스러운 학습 곡선

---

(c) 2026 시후의 수학퍼즐. Created with care by Lee Junyeol.
