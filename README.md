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

### 1. 수학 퍼즐 (28개)

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

---

## 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx              # 메인 페이지 (히어로 + 카테고리 카드)
│   ├── layout.tsx            # 공통 레이아웃 (사이드바 + Google Analytics)
│   ├── globals.css           # 전역 스타일
│   ├── puzzle/               # 수학 퍼즐 28개
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
