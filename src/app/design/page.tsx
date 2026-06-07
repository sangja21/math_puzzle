'use client';

import Link from 'next/link';
import styles from './page.module.css';

const INSTALL_STEPS = [
  {
    num: 1,
    title: 'Autodesk 계정 만들기',
    desc: 'autodesk.com → 오른쪽 상단 Sign In → Create Account',
  },
  {
    num: 2,
    title: 'Fusion 360 개인용(무료) 다운로드',
    desc: 'Fusion 360 페이지 → "For personal use" 클릭 → 설치 파일 실행',
  },
  {
    num: 3,
    title: '단위 설정',
    desc: '프로필 아이콘 → Preferences → 단위를 mm 로 변경 → Apply',
  },
  {
    num: 4,
    title: '첫 파일 만들기',
    desc: '상단 Design tabs → New Design → Part Design 선택',
  },
];

const SHORTCUTS = [
  { key: 'E', label: '돌출 (Extrude)', desc: '스케치를 3D로 올린다' },
  { key: 'F', label: '둥글게 (Fillet)', desc: '뾰족한 모서리를 깎는다' },
  { key: 'D', label: '치수 (Dimension)', desc: '크기를 숫자로 정한다' },
  { key: 'S', label: '도구 검색', desc: '도구 이름 모를 때 여기서 검색' },
  { key: 'Ctrl+Z', label: '되돌리기', desc: '실수했을 때 바로 이것' },
  { key: '휠 스크롤', label: '확대·축소', desc: '마우스 휠로 줌' },
  { key: '휠 드래그', desc: '화면 이동', label: '화면 이동 (Pan)' },
  { key: 'Shift + 휠', label: '회전 (Orbit)', desc: '3D 모델 돌려보기' },
];

export default function DesignPage() {
  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <span className={styles.heroIcon}>⚙️</span>
        <div>
          <h1 className={styles.heroTitle}>설계 공방</h1>
          <p className={styles.heroSub}>Fusion 360으로 3D 설계 시작하기</p>
        </div>
      </header>

      {/* 설치 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>🛠️ 설치</h2>
        <div className={styles.stepList}>
          {INSTALL_STEPS.map((s) => (
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

      {/* 단축키 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>⌨️ 자주 쓰는 단축키</h2>
        <div className={styles.shortcutGrid}>
          {SHORTCUTS.map((s) => (
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
            <div className={styles.nextWeekDesc}>스케치 → 치수 → 돌출 → 구멍 뚫기</div>
          </div>
          <span className={styles.nextWeekArrow}>→</span>
        </div>
      </Link>
    </div>
  );
}
