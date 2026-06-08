'use client';

import Link from 'next/link';
import styles from './page.module.css';

const START_STEPS = [
  {
    num: 1,
    title: 'tinkercad.com 열기',
    desc: '설치 필요 없음 — 인터넷 브라우저에서 바로 사용',
  },
  {
    num: 2,
    title: '계정 만들기',
    desc: 'Sign Up → 이메일로 가입 (Autodesk 계정)',
  },
  {
    num: 3,
    title: 'New Design 시작',
    desc: '로그인 후 → Create new design 클릭',
  },
  {
    num: 4,
    title: '도형 끌어다 놓기',
    desc: '오른쪽 도형 패널에서 Box(상자)를 작업판으로 드래그',
  },
];

const TIPS = [
  { key: '클릭', label: '선택', desc: '도형 클릭하면 선택됨' },
  { key: '흰 핸들', label: '크기 조절', desc: '모서리 흰 점을 끌면 크기 변경' },
  { key: '검정 핸들', label: '높이 조절', desc: '위 검정 점을 끌면 높이 변경' },
  { key: 'Hole', label: '구멍 만들기', desc: '우측 패널에서 Solid → Hole 전환' },
  { key: 'Ctrl+G', label: '그룹 묶기', desc: '선택 후 그룹 → 구멍이 뚫림' },
  { key: 'Ctrl+Z', label: '되돌리기', desc: '실수했을 때 바로 이것' },
  { key: '우클릭 드래그', label: '회전 (Orbit)', desc: '3D 모델 돌려보기' },
  { key: '스크롤', label: '확대·축소', desc: '마우스 휠로 줌' },
];

export default function DesignPage() {
  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <span className={styles.heroIcon}>⚙️</span>
        <div>
          <h1 className={styles.heroTitle}>설계 공방</h1>
          <p className={styles.heroSub}>Tinkercad으로 3D 설계 시작하기</p>
        </div>
      </header>

      {/* 시작하기 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>🛠️ 시작하기</h2>
        <div className={styles.stepList}>
          {START_STEPS.map((s) => (
            <div key={s.num} className={styles.stepItem}>
              <span className={styles.stepNum}>{s.num}</span>
              <div>
                <div className={styles.stepTitle}>{s.title}</div>
                <div className={styles.stepDesc}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 기본 조작 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>🖱️ 기본 조작</h2>
        <div className={styles.shortcutGrid}>
          {TIPS.map((s) => (
            <div key={s.key} className={styles.shortcutCard}>
              <div className={styles.shortcutKey}>{s.key}</div>
              <div className={styles.shortcutLabel}>{s.label}</div>
              <div className={styles.shortcutDesc}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 다음 수업 */}
      <Link href="/design/week2" className={styles.nextWeekLink}>
        <div className={styles.nextWeekCard}>
          <div>
            <div className={styles.nextWeekLabel}>다음 수업</div>
            <div className={styles.nextWeekTitle}>🔑 내 열쇠고리 만들기</div>
            <div className={styles.nextWeekDesc}>상자 → 크기 조절 → 구멍 뚫기 → 저장</div>
          </div>
          <span className={styles.nextWeekArrow}>→</span>
        </div>
      </Link>
    </div>
  );
}
