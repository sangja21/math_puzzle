'use client';

import Link from 'next/link';
import styles from './page.module.css';

const STEPS = [
  {
    num: 1,
    title: 'New Design 열기',
    action: null,
    desc: 'tinkercad.com → Create new design 클릭',
    tip: null,
  },
  {
    num: 2,
    title: 'Box(상자) 끌어다 놓기',
    action: null,
    desc: '오른쪽 도형 패널 → Box → 작업판 위로 드래그',
    tip: '상자가 하나 생겼으면 성공!',
  },
  {
    num: 3,
    title: '크기 조절',
    action: '흰 핸들',
    desc: '상자 클릭 → 숫자 직접 입력: 가로 40, 세로 20, 높이 3',
    tip: '상자를 클릭하면 세 칸짜리 숫자 입력창이 생겨요',
  },
  {
    num: 4,
    title: 'Cylinder(원기둥) 끌어다 놓기',
    action: null,
    desc: '도형 패널 → Cylinder → 상자 왼쪽 끝 근처에 놓기',
    tip: '이게 구멍이 될 거예요',
  },
  {
    num: 5,
    title: '원기둥 크기 조절',
    action: '흰 핸들',
    desc: '원기둥 클릭 → 지름 5, 높이 4 입력',
    tip: '높이가 상자(3mm)보다 조금 더 높아야 구멍이 완전히 뚫려요',
  },
  {
    num: 6,
    title: '원기둥을 구멍으로 바꾸기',
    action: 'Hole',
    desc: '원기둥 선택 → 우측 패널 Solid 버튼 → Hole 클릭',
    tip: '반투명하게 바뀌면 구멍 모드예요',
  },
  {
    num: 7,
    title: '위치 맞추기',
    action: null,
    desc: '원기둥을 상자 왼쪽 끝, 가운데 높이에 딱 맞게 이동',
    tip: '화면을 돌려가며 위치 확인하세요 (우클릭 드래그)',
  },
  {
    num: 8,
    title: '구멍 뚫기',
    action: 'Ctrl+G',
    desc: '전체 선택 (Ctrl+A) → Ctrl+G 로 그룹 묶기',
    tip: '그룹으로 묶으면 Hole이 진짜 구멍이 돼요!',
  },
  {
    num: 9,
    title: 'STL로 저장',
    action: null,
    desc: '상단 Export 버튼 → For 3D Printing → .STL 다운로드',
    tip: '이 파일을 선생님한테 주면 3D 프린터로 만들어줄게요',
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
          <p className={styles.heroSub}>2주차 · Tinkercad으로 첫 번째 물건 설계하기</p>
        </div>
      </header>

      <div className={styles.goalBox}>
        <div className={styles.goalTitle}>오늘의 목표</div>
        <div className={styles.goalDesc}>
          상자 만들기 → 크기 조절 → 구멍 뚫기 순서로<br />
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
            STL 파일을 선생님한테 주면<br />
            3D 프린터로 실물 열쇠고리로 만들어줄게요
          </div>
        </div>
      </div>
    </div>
  );
}
