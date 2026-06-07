'use client';

import Link from 'next/link';
import styles from './page.module.css';

const STEPS = [
  {
    num: 1,
    title: 'New Design 열기',
    action: null,
    desc: '상단 메뉴 → Design → New Design → Part Design 선택',
    tip: null,
  },
  {
    num: 2,
    title: '스케치 시작',
    action: null,
    desc: 'Solid 탭 → Sketch → Create Sketch → XY Plane(바닥면) 클릭',
    tip: '평면을 클릭하면 파란 격자가 생겨요',
  },
  {
    num: 3,
    title: '사각형 그리기',
    action: null,
    desc: 'Sketch 메뉴 → Rectangle → 2-Point Rectangle → 대충 크게 그리기',
    tip: '크기는 나중에 D로 정하니까 지금은 대충 그려도 OK',
  },
  {
    num: 4,
    title: '크기 정하기',
    action: 'D',
    desc: '가로 선 클릭 → 40 입력 → Enter / 세로 선 클릭 → 20 입력 → Enter',
    tip: '단위는 mm — 실제 열쇠고리 크기예요',
  },
  {
    num: 5,
    title: '3D로 올리기',
    action: 'E',
    desc: '사각형 안쪽 면 클릭 → 두께 3 입력 → OK',
    tip: '납작한 판이 생겼다면 성공!',
  },
  {
    num: 6,
    title: '구멍 위치에 원 그리기',
    action: null,
    desc: 'Sketch → 윗면 클릭 → Circle → 왼쪽 끝에서 5mm 안쪽에 원 그리기',
    tip: '열쇠고리 고리가 들어갈 구멍이에요',
  },
  {
    num: 7,
    title: '원 크기 정하기',
    action: 'D',
    desc: '원 클릭 → 지름 5 입력 → Enter → Finish Sketch',
    tip: '지름 5mm = 고리가 딱 맞게 들어가는 크기',
  },
  {
    num: 8,
    title: '구멍 뚫기',
    action: 'E',
    desc: '원 안쪽 클릭 → 방향을 아래로 → Operation: Cut 선택 → Extent: All → OK',
    tip: 'Cut을 선택해야 구멍이 뚫려요!',
  },
  {
    num: 9,
    title: '모서리 둥글게 (선택)',
    action: 'F',
    desc: '날카로운 모서리 선 클릭 → 반지름 2 입력 → OK',
    tip: '이 단계는 건너뛰어도 돼요',
  },
  {
    num: 10,
    title: '저장',
    action: 'Ctrl+S',
    desc: '이름: 내-열쇠고리 로 저장',
    tip: '완성! 나중에 3D 프린터로 실물로 만들 수 있어요',
  },
];

export default function Week2Page() {
  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/design" className={styles.breadcrumbLink}>설계 공방</Link>
        <span className={styles.breadcrumbSep}>›</span>
        <span>2주차</span>
      </div>

      <header className={styles.hero}>
        <span className={styles.heroIcon}>🔑</span>
        <div>
          <h1 className={styles.heroTitle}>내 열쇠고리 만들기</h1>
          <p className={styles.heroSub}>2주차 · Fusion 360으로 첫 번째 물건 설계하기</p>
        </div>
      </header>

      <div className={styles.goalBox}>
        <div className={styles.goalTitle}>오늘의 목표</div>
        <div className={styles.goalDesc}>
          스케치 → 치수 → 돌출 → 구멍 순서로<br />
          실제로 인쇄할 수 있는 열쇠고리를 만든다
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>📐 만드는 순서</h2>
        <div className={styles.stepList}>
          {STEPS.map((s) => (
            <div key={s.num} className={styles.stepItem}>
              <span className={styles.stepNum}>{s.num}</span>
              <div className={styles.stepBody}>
                <div className={styles.stepHeader}>
                  <div className={styles.stepTitle}>{s.title}</div>
                  {s.action && <div className={styles.stepKey}>{s.action}</div>}
                </div>
                <div className={styles.stepDesc}>{s.desc}</div>
                {s.tip && <div className={styles.stepTip}>💡 {s.tip}</div>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className={styles.printBox}>
        <div className={styles.printIcon}>🖨️</div>
        <div>
          <div className={styles.printTitle}>실물로 만들고 싶다면?</div>
          <div className={styles.printDesc}>
            File → Export → STL 로 저장한 뒤<br />
            선생님한테 파일 주면 3D 프린터로 만들어줄게요
          </div>
        </div>
      </div>
    </div>
  );
}
