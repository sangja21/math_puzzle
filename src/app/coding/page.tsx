'use client';

import Link from 'next/link';
import styles from './coding.module.css';

const ALGORITHM_ITEMS = [
  {
    id: 'bubble',
    title: '버블정렬 (Bubble Sort)',
    emoji: '🫧',
    description:
      '가벼운 거품이 위로 올라가듯, 인접한 두 요소를 비교하며 자리를 바꾸는 정렬 원리를 알아봐요.',
    href: '/coding/bubble/steps',
    tag: '알고리즘',
  },
  {
    id: 'selection',
    title: '선택정렬 (Selection Sort)',
    emoji: '🔍',
    description:
      '전체에서 가장 작은 값을 찾아 정해진 위치로 바로바로 이동시키는 정렬 원리를 알아봐요.',
    href: '/coding/selection/steps',
    tag: '알고리즘',
  },
];

const BASIC_GRAMMAR_ITEMS = [
  {
    id: 'variables',
    title: '변수 (Variables)',
    emoji: '📦',
    description: '이름표가 붙은 마법 상자에 숫자를 넣고 빼보며 변수의 개념을 배워요.',
    href: '/coding/variables',
    tag: '기초 문법',
  },
  {
    id: 'lists',
    title: '리스트 (Lists)',
    emoji: '🍡',
    description: '여러 개의 데이터를 기차처럼 한 줄로 연결해서 저장하고 다루는 방법을 알아봐요.',
    href: '/coding/lists',
    tag: '기초 문법',
  },
  {
    id: 'arithmetic',
    title: '산술 연산자',
    emoji: '⚙️',
    description: '+, -, *, / 그리고 나머지(%)까지! 신기한 톱니바퀴 연산기로 계산해봐요.',
    href: '/coding/operators/arithmetic',
    tag: '기초 문법',
  },
  {
    id: 'conditional',
    title: '조건 연산자',
    emoji: '⚖️',
    description: '크다, 작다, 같다! 양쪽의 무게를 제어하며 판별 저울(True/False)을 움직여요.',
    href: '/coding/operators/conditional',
    tag: '기초 문법',
  },
  {
    id: 'logical',
    title: '논리 연산자',
    emoji: '💡',
    description: 'AND, OR, NOT 문을 열고 닫으며 전구를 켜는 논리 회로 퍼즐을 풀어봐요.',
    href: '/coding/operators/logical',
    tag: '기초 문법',
  },
];

const CONDITIONAL_ITEMS = [
  {
    id: 'if',
    title: 'if 문',
    emoji: '🚦',
    description:
      '신호등처럼! 조건이 참(True)일 때만 코드를 실행해요. 슬라이더로 조건을 직접 바꿔보세요.',
    href: '/coding/if',
    tag: '조건문',
  },
  {
    id: 'if-else',
    title: 'if-else 문',
    emoji: '🏹',
    description:
      '갈림길처럼! 조건이 참이면 A 경로, 거짓이면 반드시 B 경로로 실행됩니다.',
    href: '/coding/if-else',
    tag: '조건문',
  },
  {
    id: 'compound',
    title: '복합 조건문',
    emoji: '💡',
    description:
      'AND(&&), OR(||), NOT(!)을 조합해 더 정교한 조건을 만들어요. 논리 스위치를 켜고 꺼보세요!',
    href: '/coding/compound',
    tag: '조건문',
  },
];

const LOOP_ITEMS = [
  {
    id: 'for',
    title: 'for 문 (지정된 횟수 반복)',
    emoji: '🏭',
    description:
      '정확히 정해진 개수만큼 반복해서 찍어내는 공장의 컨베이어 벨트를 작동시켜봐요!',
    href: '/coding/loop/for',
    tag: '반복문',
  },
  {
    id: 'while',
    title: 'while 문 (조건 만족 시 반복)',
    emoji: '🔋',
    description:
      '배터리가 다 닳을 때까지(조건이 거짓이 될 때까지) 멈추지 않고 계속 작동하는 기계를 조종해요!',
    href: '/coding/loop/while',
    tag: '반복문',
  },
];

const FUNCTION_ITEMS = [
  {
    id: 'function',
    title: '함수 (Function)',
    emoji: '⚙️',
    description:
      '입력을 넣으면 규칙대로 출력이 나오는 마법 기계! 나만의 함수를 만들고, 여러 함수를 연결해봐요!',
    href: '/coding/function',
    tag: '함수',
  },
];

export default function CodingPage() {
  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <h1 className={styles.title}>💻 코딩의 원리</h1>
        <p className={styles.subtitle}>
          알고리즘을 눈으로 보고 손으로 조작하며 이해해보는 공간입니다.
        </p>
      </header>

      <main className={styles.main}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>알고리즘 파트</h2>
          <div className={styles.cardGrid}>
            {ALGORITHM_ITEMS.map((item) => (
              <Link key={item.id} href={item.href} className={styles.card}>
                <span className={styles.cardTag}>{item.tag}</span>
                <div className={styles.cardEmoji}>{item.emoji}</div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardDesc}>{item.description}</p>
                <span className={styles.cardCta}>학습 시작하기 →</span>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>기초 문법 파트</h2>
          <div className={styles.cardGrid}>
            {BASIC_GRAMMAR_ITEMS.map((item) => (
              <Link key={item.id} href={item.href} className={styles.card}>
                <span className={styles.cardTag}>{item.tag}</span>
                <div className={styles.cardEmoji}>{item.emoji}</div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardDesc}>{item.description}</p>
                <span className={styles.cardCta}>학습 시작하기 →</span>
              </Link>
            ))}
          </div>
        </section>
        
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>조건문 파트</h2>
          <div className={styles.cardGrid}>
            {CONDITIONAL_ITEMS.map((item) => (
              <Link key={item.id} href={item.href} className={styles.card}>
                <span className={styles.cardTag}>{item.tag}</span>
                <div className={styles.cardEmoji}>{item.emoji}</div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardDesc}>{item.description}</p>
                <span className={styles.cardCta}>학습 시작하기 →</span>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>반복문 파트</h2>
          <div className={styles.cardGrid}>
            {LOOP_ITEMS.map((item) => (
              <Link key={item.id} href={item.href} className={styles.card}>
                <span className={styles.cardTag}>{item.tag}</span>
                <div className={styles.cardEmoji}>{item.emoji}</div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardDesc}>{item.description}</p>
                <span className={styles.cardCta}>학습 시작하기 →</span>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>함수 파트</h2>
          <div className={styles.cardGrid}>
            {FUNCTION_ITEMS.map((item) => (
              <Link key={item.id} href={item.href} className={styles.card}>
                <span className={styles.cardTag}>{item.tag}</span>
                <div className={styles.cardEmoji}>{item.emoji}</div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardDesc}>{item.description}</p>
                <span className={styles.cardCta}>학습 시작하기 →</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
