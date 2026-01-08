# 🧠 주시후와 함께하는 수학퍼즐 (Math Puzzle)

고전 수학 퍼즐과 정수론 문제들을 인터랙티브한 웹 게임으로 구현한 프로젝트입니다.  
마틴 가드너의 클래식 퍼즐부터 알고리즘 문제까지, 직접 조작하며 수학적 원리를 체험해보세요!

## 🧩 수록된 퍼즐 목록

| 퍼즐 | 핵심 개념 | 특징 |
|------|-----------|------|
| **⏳ 모래시계 퍼즐** | `Diophantine Equation` | 7분과 11분 모래시계로 15분 재기 |
| **🚪 100개의 문** | `Divisors (약수)` | 100명의 간수가 문을 토글하면 열린 문은? |
| **⚖️ 양팔저울** | `Balanced Ternary (균형 3진법)` | 3의 거듭제곱 추로 모든 무게 측정하기 |
| **🚣 강 건너기** | `State Space Search` | 늑대/양/양배추 & 선교사/식인종 모드 |
| **🪙 가짜 동전 찾기** | `Ternary Search (삼진 탐색)` | O(log₃N) 효율로 가짜 동전 찾기 (드래그앤드롭) |
| **🌀 요세푸스 퍼즐** | `Modular Arithmetic (재귀)` | 유대인 저항군 생존 시뮬레이션 (AD 67년 고증) |
| **🧮 유클리드 게임** | `Euclidean Algorithm (호제법)` | 직사각형 자르기 시각화 & AI 대전 |

## 🛠 기술 스택

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules (MetaMask Inspired Theme)
- **State Management**: React Hooks (`useState`, `useReducer`)

## 🚀 실행 방법

이 프로젝트는 `Node.js` 환경이 필요합니다.

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

## 🎨 디자인 특징

- **Light & Modern**: 기존 다크 테마에서 MetaMask 스타일의 깔끔한 화이트/그레이 테마로 리디자인되었습니다.
- **Interactive**: 드래그앤드롭(DnD), 클릭, 실시간 시각화 등 풍부한 사용자 경험을 제공합니다.
- **Micro-Animations**: 퍼즐 해결 시의 시각적 피드백과 부드러운 전환 효과.

---
© 2026 Math Puzzle Project. Created with ❤️ by Lee Junyeol.
