'use client';

import Link from 'next/link';
import styles from './page.module.css';

const PATTERNS = [
  { n: 2, left: '219978', f: '4', result: '879912' },
  { n: 3, left: '2199978', f: '4', result: '8799912' },
  { n: 4, left: '21999978', f: '4', result: '87999912' },
  { n: 5, left: '219999978', f: '4', result: '879999912' },
  { n: 6, left: '2199999978', f: '4', result: '8799999912' },
];

export default function CryptarithmeticMathPage() {
  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <Link href="/puzzle/cryptarithmetic" className={styles.backLink}>
          ← 복면산으로 돌아가기
        </Link>
        <h1 className={styles.title}>🔤 복면산의 수학적 원리</h1>
        <p className={styles.subtitle}>
          알파벳 뒤에 숨은 숫자 — 복면산이 수학과 논리의 교차점인 이유를 알아봅시다.
        </p>
      </header>

      {/* 1. What is Cryptarithmetic */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>1. 복면산이란?</h2>
        <div className={styles.sectionBody}>
          <p>
            복면산(覆面算, Cryptarithmetic)은 숫자 대신 알파벳으로 이루어진 산술 등식 퍼즐입니다.
            각 알파벳은 0~9 중 하나의 숫자를 나타내며, <strong>서로 다른 알파벳은 반드시 서로 다른 숫자</strong>여야 합니다.
          </p>
          <p>
            1924년 영국의 수학자 헨리 듀드니(Henry Dudeney)가 만든 <code>SEND + MORE = MONEY</code>가
            가장 유명한 예입니다. 퍼즐 잡지에 발표된 이 문제는 100년이 지난 지금도 교육 현장에서 널리 사용됩니다.
          </p>
          <div className={styles.eqBlock}>
{`  S E N D
+ M O R E
---------
M O N E Y`}
          </div>
          <div className={styles.infoBox}>
            정답: S=9, E=5, N=6, D=7, M=1, O=0, R=8, Y=2<br />
            → 9567 + 1085 = 10652
          </div>
        </div>
      </section>

      {/* 2. Constraint Satisfaction */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>2. 제약 만족 문제 (CSP)</h2>
        <div className={styles.sectionBody}>
          <p>
            복면산은 컴퓨터 과학에서 <strong>제약 만족 문제(Constraint Satisfaction Problem)</strong>의 전형적인 예입니다.
            주어진 조건(제약)을 모두 만족하는 변수 값의 조합을 찾는 문제입니다.
          </p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>제약 조건</th>
                <th>의미</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>각 문자 ∈ &#123;0..9&#125;</code></td>
                <td>모든 알파벳은 한 자리 숫자</td>
              </tr>
              <tr>
                <td><code>All-Different</code></td>
                <td>서로 다른 알파벳 = 서로 다른 숫자</td>
              </tr>
              <tr>
                <td><code>Leading digit ≠ 0</code></td>
                <td>맨 앞 자리는 0이 될 수 없음</td>
              </tr>
              <tr>
                <td><code>등식 성립</code></td>
                <td>대입했을 때 좌변 = 우변</td>
              </tr>
            </tbody>
          </table>
          <p>
            이 제약들을 모두 만족하는 해를 찾는 가장 단순한 방법은 <strong>완전 탐색(brute force)</strong>:
            10P8 = 1,814,400가지 경우의 수를 모두 대입해보는 것이지만,
            <strong>열별(column-by-column) 추론</strong>으로 훨씬 빠르게 풀 수 있습니다.
          </p>
        </div>
      </section>

      {/* 3. Column by Column Reasoning */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>3. 열별 추론 — 올림수(carry)의 비밀</h2>
        <div className={styles.sectionBody}>
          <p>
            덧셈 복면산은 오른쪽 열부터 차례로 분석할 수 있습니다.
            각 열에서 <strong>합 = 결과 자릿수 + 10 × 올림수</strong>가 성립합니다.
          </p>
          <p>SEND + MORE = MONEY를 예로 들면:</p>
          <ol className={styles.stepList}>
            <li className={styles.stepItem}>
              일의 자리: D + E = Y + 10×c₁ (c₁ = 0 또는 1)
            </li>
            <li className={styles.stepItem}>
              십의 자리: N + R + c₁ = E + 10×c₂
            </li>
            <li className={styles.stepItem}>
              백의 자리: E + O + c₂ = N + 10×c₃
            </li>
            <li className={styles.stepItem}>
              천의 자리: S + M + c₃ = O + 10×c₄ (c₄ = M, 결과가 5자리이므로)
            </li>
          </ol>
          <div className={styles.highlightBox}>
            M이 다섯 번째 자리의 올림수라면 M = 1! 이 하나의 추론으로 가능한 경우의 수가 크게 줄어듭니다.
            이처럼 제약을 하나씩 적용하며 가지를 잘라가는 방법을 <strong>백트래킹(Backtracking)</strong>이라 합니다.
          </div>
        </div>
      </section>

      {/* 4. Level 3 Pattern */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>4. 레벨 3의 비밀 — 무한 패턴</h2>
        <div className={styles.sectionBody}>
          <p>
            <code>219978 × 4 = 879912</code>는 단순한 우연이 아닙니다.
            가운데에 9를 추가할수록 여전히 "앞뒤가 뒤집힌 수"가 됩니다.
          </p>

          <div className={styles.patternGrid}>
            {PATTERNS.map(({ n, left, f, result }) => (
              <div key={n} className={styles.patternRow}>
                <span className={styles.patternNum}>{left}</span>
                <span className={styles.patternArrow}>× {f} =</span>
                <span className={styles.patternResult}>{result}</span>
                <span style={{ color: '#586069', fontSize: '0.8rem' }}>(C 9개: {n}개)</span>
              </div>
            ))}
          </div>

          <p style={{ marginTop: '1rem' }}>
            왜 이렇게 될까요? 핵심은 <strong>9 × 4 = 36</strong>에 있습니다.
          </p>
          <ol className={styles.stepList}>
            <li className={styles.stepItem}>
              가장 오른쪽 열: 8 × 4 = 32, 결과 2, 올림 3
            </li>
            <li className={styles.stepItem}>
              그 다음 열: 7 × 4 + 3 = 31, 결과 1, 올림 3
            </li>
            <li className={styles.stepItem}>
              가운데 9열들: 9 × 4 + 3 = 39, 결과 9, 올림 3 — 올림수가 항상 3으로 유지!
            </li>
            <li className={styles.stepItem}>
              이 패턴이 9가 몇 개든 상관없이 계속되므로 무한히 확장 가능합니다.
            </li>
          </ol>
          <div className={styles.infoBox}>
            이런 성질을 가진 수를 <strong>팔린드롬 곱셈수(Palindromic Multiplier)</strong>라 부릅니다.
            자기 자신의 역수와 일정한 비율 관계를 갖는 특별한 수입니다.
          </div>
        </div>
      </section>

      {/* 5. History */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>5. 복면산의 역사와 현재</h2>
        <div className={styles.sectionBody}>
          <p>
            복면산은 단순한 퍼즐을 넘어 현대 컴퓨터 과학의 여러 분야와 연결됩니다.
          </p>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>분야</th>
                <th>연관성</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>논리 프로그래밍</td>
                <td>Prolog, 제약 논리 프로그래밍(CLP)의 교재 예제</td>
              </tr>
              <tr>
                <td>인공지능 탐색</td>
                <td>백트래킹, 아크 일관성(Arc Consistency) 알고리즘 실습</td>
              </tr>
              <tr>
                <td>SAT 솔버</td>
                <td>부울 논리 제약으로 변환 가능</td>
              </tr>
              <tr>
                <td>수학 교육</td>
                <td>자릿수, 올림수, 경우의 수 개념 직관적 학습</td>
              </tr>
            </tbody>
          </table>
          <div className={styles.highlightBox}>
            단 한 줄의 등식 <code>SEND + MORE = MONEY</code>가 100년간 수학자, 프로그래머, 교사들에게
            사랑받는 이유 — 풀이 과정 자체가 논리적 사고를 훈련시키기 때문입니다.
          </div>
        </div>
      </section>
    </div>
  );
}
