'use client';

import { useState } from 'react';
import styles from './page.module.css';

type Tab = 'install' | 'curriculum';

// ─── 데이터 ───────────────────────────────────────────────────────
const UI_SECTIONS = [
  { name: 'Data Panel', pos: '왼쪽 상단 grid 아이콘', role: '클라우드 파일 관리. 프로젝트·폴더 생성·정리' },
  { name: 'Application bar', pos: '최상단', role: '파일 관리 (새로·저장·Export·3D Print). Save·Undo·Redo' },
  { name: 'Toolbar', pos: '상단 도구 영역', role: '실제 모델링 도구. Workspace 선택 → Tabs(Solid·Surface·Mesh)' },
  { name: 'Canvas', pos: '중앙', role: '3D 모델을 보고 만들고 상호작용하는 중심 영역' },
  { name: 'Browser', pos: '왼쪽 패널', role: '목차. 모든 스케치·body 나열. 눈 아이콘으로 표시 토글' },
  { name: 'View Cube', pos: '오른쪽 상단', role: '카메라 제어. 면·모서리 클릭 = 뷰 스냅, 드래그 = 자유 회전' },
  { name: 'Marking Menu', pos: '우클릭 휠', role: '자주 쓰는 명령 모음. 커서 위치에 따라 도구가 달라짐 (contextual)' },
  { name: 'Timeline', pos: '하단', role: '시간여행. 모든 액션 기록. 우클릭 = 이전 단계 편집, Play = 재생' },
  { name: 'Navigation bar', pos: '하단 중앙', role: '줌·팬·궤도 조작. 화면 스타일·조명 변경' },
];

const TERMS = [
  { term: 'Origin (원점)', desc: '디지털 세계의 정확한 중심. X·Y·Z 축이 만나는 고정 좌표점' },
  { term: 'Sketch', desc: '2D 도형 그리기. 3D 모델링의 시작점 — 거의 모든 작업이 여기서 시작' },
  { term: 'Constraints (구속)', desc: '스케치 기하 관계 (수직·수평·접선 등). 형상·크기·위치 고정' },
  { term: 'Fully Defined', desc: '스케치가 완전히 고정된 상태. 파란색 선 → 검은색 선으로 바뀜' },
  { term: 'Parametric', desc: 'Fusion의 핵심 모델링 방식. 모든 단계가 Timeline에 기록 → 언제든 수정 가능' },
  { term: 'Body', desc: '단일 연속 3D 형상. "손에 쥘 수 있는 물리적 객체"' },
  { term: 'Extrude (돌출)', desc: 'Fusion에서 가장 자주 쓰는 도구. 2D 스케치에 두께를 줘서 3D Body 생성' },
  { term: 'Component', desc: '조립품을 구성하는 개별 부품. 업계 용어로 "Part"와 동의어' },
];

const WEEK1 = [
  {
    day: '도입 1',
    title: '퓨전 열기 전에 꼭 봐야 할 8가지 용어',
    duration: '6분',
    skills: ['UI 9개 섹션 파악', '8개 핵심 용어 이해'],
    exercise: 'Fusion 열고 각 섹션 손가락으로 짚어보기. 8개 용어 본인 말로 설명해보기',
    note: '이 영상만 제대로 소화해도 이후 강의가 훨씬 수월해집니다.',
  },
  {
    day: '도입 2',
    title: '2026년 새 워크플로우 — Design Intent',
    duration: '5분',
    skills: ['Part / Assembly / Hybrid 차이', 'Preferences에서 기본값 설정'],
    exercise: 'Part·Assembly·Hybrid 파일 각각 만들어 툴바 차이 확인',
    note: '⚠️ 2026년 이전 튜토리얼 따라하다 화면 다르면 → Hybrid 모드로 전환',
  },
  {
    day: 'Day 1',
    title: '레고 블록 만들기',
    duration: '20분',
    skills: ['스케치 (Sketch)', '돌출 (Extrude) — 단축키 E', '셸 (Shell)', '필렛 (Fillet) — 단축키 F', '사각형 패턴 (Rectangular Pattern)'],
    exercise: '2×4 레고 블록 완성. 치수: 길이 31.8mm × 너비 15.8mm × 높이 9.6mm',
    note: '스케치 선이 파란색 → 검은색이 되어야 "Fully Defined". 원점(0,0)에서 시작하는 습관 들이기',
  },
  {
    day: 'Day 2',
    title: '유리 소다병 만들기',
    duration: '17분',
    skills: ['회전 (Revolve)', '참조 이미지 (Canvas)', '대칭 (Mirror)'],
    exercise: '소다병 실루엣을 스케치하고 축을 중심으로 회전시켜 3D 완성',
    note: '',
  },
  {
    day: 'Day 3',
    title: 'Day 3',
    duration: '10분',
    skills: ['이전 기술 복합 응용'],
    exercise: '강의 예제 따라하기',
    note: '',
  },
  {
    day: 'Day 4',
    title: '사각형 → 원형 전환 (Loft)',
    duration: '17분',
    skills: ['로프트 (Loft) — 두 단면을 부드럽게 연결', '형상 전환 응용'],
    exercise: '사각 단면에서 원 단면으로 매끄럽게 이어지는 형상 만들기',
    note: '',
  },
  {
    day: 'Day 5',
    title: '셸(Shell) 치트키',
    duration: '13분',
    skills: ['Shell 심화 — 선택 면만 비워내기', '복잡한 형상에서 셸 적용 순서'],
    exercise: '컵이나 케이스 형태 만들고 Shell로 내부 비워내기',
    note: '',
  },
  {
    day: 'Day 6',
    title: '나사 도구 제대로 쓰기',
    duration: '13분',
    skills: ['Thread 도구 — 나사산 생성', '암나사 / 수나사 구분'],
    exercise: '볼트 또는 구멍에 나사산 적용해보기',
    note: '',
  },
  {
    day: 'Day 7',
    title: '이렇게 해보세요 (대안 기법)',
    duration: '16분',
    skills: ['미러 (Mirror)', '효율적인 모델링 습관'],
    exercise: '대칭 형상 Mirror로 반만 그리고 복사하기',
    note: '',
  },
];

const WEEK2 = [
  {
    day: 'Day 8',
    title: '3D 프린팅 내보내기 ⭐',
    duration: '13분',
    skills: [
      '얇은 돌출 (Thin Extrude) — 셸 없이 벽체 한 번에',
      '경로 패턴 (Path Pattern)',
      'STEP 내보내기 > STL 권장',
      '3MF (풀컬러일 때만)',
    ],
    exercise: '문지방 고정장치 완성 후 STEP 파일로 내보내기 → 슬라이서에서 열어보기',
    note: '💡 STEP > STL: 원본 수학 곡선 유지 → 표면이 더 매끄럽고 슬라이서가 구멍·피처 인식 가능',
    highlight: true,
  },
  {
    day: 'Day 9',
    title: '형상 전환 방법',
    duration: '11분',
    skills: ['Loft 심화', '형상 간 매끄러운 연결'],
    exercise: '복잡한 형상 전환 예제',
    note: '',
  },
  {
    day: 'Day 10',
    title: 'Day 10',
    duration: '8분',
    skills: ['이전 기술 복합'],
    exercise: '강의 예제 따라하기',
    note: '',
  },
  {
    day: 'Day 11',
    title: '서피스(Surface) 입문',
    duration: '15분',
    skills: ['Surface 모델링 기초', 'Solid vs Surface 차이'],
    exercise: '기본 서피스 형상 만들기',
    note: '서피스는 두께가 없는 면. 복잡한 유기적 형상에 씁니다',
  },
  {
    day: 'Day 12',
    title: '이 팁을 따르세요',
    duration: '16분',
    skills: ['효율적 모델링 팁', '자주 하는 실수 방지'],
    exercise: '강의 예제 따라하기',
    note: '',
  },
  {
    day: 'Day 13',
    title: '컴포넌트와 어셈블리',
    duration: '11분',
    skills: ['Component 생성', 'Assembly 구성', 'Joint 기초'],
    exercise: '두 부품을 별도로 만들고 조립해보기',
    note: '🎯 전환 기준 핵심 항목 — 어셈블리를 이해해야 GPS 케이스(케이스+뚜껑) 설계 가능',
  },
  {
    day: 'Day 14',
    title: 'Day 14',
    duration: '12분',
    skills: ['이전 기술 복합'],
    exercise: '강의 예제 따라하기',
    note: '',
  },
];

const CHECKLIST = [
  { skill: '스케치 (2D·구속·치수)', days: 'Day 1–3, 17', done: false },
  { skill: '압출·회전 (Extrude·Revolve)', days: 'Day 1–4', done: false },
  { skill: '셸·라운드·챔퍼 (Shell·Fillet·Chamfer)', days: 'Day 5', done: false },
  { skill: '컴포넌트·어셈블리 기초', days: 'Day 13, 19, 23', done: false },
  { skill: 'STL / STEP 내보내기', days: 'Day 8, 18', done: false },
];

// ─── 설치 탭 ─────────────────────────────────────────────────────
function InstallTab() {
  return (
    <div className={styles.tabContent}>

      {/* 설치 단계 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>1. Fusion 360 설치</h2>
        <div className={styles.stepList}>
          <div className={styles.stepItem}>
            <span className={styles.stepNum}>1</span>
            <div>
              <strong>Autodesk 계정 만들기</strong>
              <p>autodesk.com → 오른쪽 상단 Sign In → Create Account. 이메일 인증까지 완료</p>
            </div>
          </div>
          <div className={styles.stepItem}>
            <span className={styles.stepNum}>2</span>
            <div>
              <strong>개인용 라이선스 선택 (무료)</strong>
              <p>Fusion 360 페이지 → <em>For personal use (free)</em> 클릭. 상업용 아님 주의 — 연 1회 갱신 필요</p>
            </div>
          </div>
          <div className={styles.stepItem}>
            <span className={styles.stepNum}>3</span>
            <div>
              <strong>다운로드 & 설치</strong>
              <p>설치 파일 실행 → Autodesk Desktop App 설치 → Fusion 360 설치. 용량 약 3–5 GB</p>
            </div>
          </div>
          <div className={styles.stepItem}>
            <span className={styles.stepNum}>4</span>
            <div>
              <strong>첫 실행 설정</strong>
              <p>Profile 아이콘 → Preferences → 기본 단위를 <code>mm</code>으로 변경 후 Apply</p>
              <p>같은 화면 General → Default design type → <code>Part</code> 선택</p>
            </div>
          </div>
          <div className={styles.stepItem}>
            <span className={styles.stepNum}>5</span>
            <div>
              <strong>커리큘럼 프로젝트 폴더 만들기</strong>
              <p>Data Panel (왼쪽 상단 grid 아이콘) → New Project → <em>퓨전 30일 배우기</em></p>
              <p>프로젝트 안에 폴더 <em>1–15일</em> 생성. 이후 모든 파일을 여기에 저장</p>
            </div>
          </div>
        </div>
      </section>

      {/* UI 섹션 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>2. UI 9개 섹션</h2>
        <p className={styles.sectionDesc}>Fusion 열고 각 위치를 손가락으로 짚어가며 확인하세요.</p>
        <div className={styles.tableWrap}>
          <table className={styles.uiTable}>
            <thead>
              <tr>
                <th>이름</th>
                <th>위치</th>
                <th>역할</th>
              </tr>
            </thead>
            <tbody>
              {UI_SECTIONS.map((s) => (
                <tr key={s.name}>
                  <td><strong>{s.name}</strong></td>
                  <td className={styles.posCell}>{s.pos}</td>
                  <td>{s.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 핵심 용어 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>3. 핵심 용어 8개</h2>
        <p className={styles.sectionDesc}>다음 강의 들어가기 전에 본인 말로 설명할 수 있어야 합니다.</p>
        <div className={styles.termGrid}>
          {TERMS.map((t) => (
            <div key={t.term} className={styles.termCard}>
              <div className={styles.termName}>{t.term}</div>
              <div className={styles.termDesc}>{t.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 주의사항 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>4. 알아두기</h2>
        <div className={styles.noteBox}>
          <div className={styles.noteItem}>
            <span className={styles.noteIcon}>💡</span>
            <span><strong>2026 이전 튜토리얼 호환:</strong> YouTube에서 오래된 Fusion 영상 따라하다 화면이 다르면 → Browser → Document Settings → Design Type → Hybrid로 변환</span>
          </div>
          <div className={styles.noteItem}>
            <span className={styles.noteIcon}>🌐</span>
            <span><strong>파일 저장 위치:</strong> Fusion은 클라우드 저장 (Autodesk 서버). 인터넷 없으면 접근 불가 — 작업 전 연결 상태 확인</span>
          </div>
          <div className={styles.noteItem}>
            <span className={styles.noteIcon}>⌨️</span>
            <span><strong>핵심 단축키 3개:</strong> <code>E</code> = 돌출 / <code>F</code> = 필렛 / <code>D</code> = 치수. 이 3개만 손에 익혀도 1주차는 OK</span>
          </div>
          <div className={styles.noteItem}>
            <span className={styles.noteIcon}>🤝</span>
            <span><strong>페어 학습:</strong> 같은 강의 같은 진도로. 막힌 곳 각자 기록했다가 수업 시간에 비교</span>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── 커리큘럼 탭 ─────────────────────────────────────────────────
type DayCard = {
  day: string;
  title: string;
  duration: string;
  skills: string[];
  exercise: string;
  note: string;
  highlight?: boolean;
};

function DayCard({ card }: { card: DayCard }) {
  return (
    <div className={`${styles.dayCard} ${card.highlight ? styles.dayCardHighlight : ''}`}>
      <div className={styles.dayHeader}>
        <span className={styles.dayBadge}>{card.day}</span>
        <span className={styles.dayTitle}>{card.title}</span>
        <span className={styles.dayDuration}>{card.duration}</span>
      </div>
      <ul className={styles.skillList}>
        {card.skills.map((s, i) => <li key={i}>{s}</li>)}
      </ul>
      {card.exercise && (
        <div className={styles.exerciseBox}>
          <span className={styles.exerciseLabel}>실습</span>
          <span>{card.exercise}</span>
        </div>
      )}
      {card.note && (
        <div className={styles.noteInCard}>{card.note}</div>
      )}
    </div>
  );
}

function CurriculumTab() {
  const [checks, setChecks] = useState(CHECKLIST.map((c) => c.done));

  const toggle = (i: number) =>
    setChecks((prev) => prev.map((v, idx) => idx === i ? !v : v));

  const doneCount = checks.filter(Boolean).length;

  return (
    <div className={styles.tabContent}>

      {/* 전환 체크리스트 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>🎯 GPS 케이스 전환 기준 — 핵심 5기술</h2>
        <p className={styles.sectionDesc}>5개 모두 체크되면 자전거 GPS 케이스 설계로 넘어갑니다.</p>
        <div className={styles.checklist}>
          {CHECKLIST.map((item, i) => (
            <label key={i} className={styles.checkItem}>
              <input
                type="checkbox"
                checked={checks[i]}
                onChange={() => toggle(i)}
                className={styles.checkInput}
              />
              <span className={`${styles.checkBox} ${checks[i] ? styles.checked : ''}`}>
                {checks[i] ? '✓' : ''}
              </span>
              <div>
                <div className={`${styles.checkSkill} ${checks[i] ? styles.checkDone : ''}`}>{item.skill}</div>
                <div className={styles.checkDays}>{item.days}</div>
              </div>
            </label>
          ))}
          <div className={styles.checkProgress}>
            {doneCount === 5
              ? '✅ 전환 준비 완료! GPS 케이스로 GO 🚀'
              : `${doneCount} / 5 완료`}
          </div>
        </div>
      </section>

      {/* 1주차 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>📅 1주차 — 핵심 기술 입문 (도입 2 + Day 1–7)</h2>
        <div className={styles.dayGrid}>
          {WEEK1.map((card) => <DayCard key={card.day} card={card} />)}
        </div>
      </section>

      {/* 2주차 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>📅 2주차 — 3D 프린팅 & 심화 (Day 8–14)</h2>
        <div className={styles.dayGrid}>
          {WEEK2.map((card) => <DayCard key={card.day} card={card} />)}
        </div>
      </section>

      {/* JLCPCB 미리보기 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>🖨️ 완성 후 — JLCPCB 의뢰 흐름</h2>
        <div className={styles.flowRow}>
          {['STEP 내보내기', 'jlc3dp.com 접속', 'STL / STEP 업로드', '소재 선택 (FDM PLA)', '견적 확인', '배송 주소 + 개인통관번호', '결제 & 주문'].map((step, i, arr) => (
            <div key={i} className={styles.flowStep}>
              <div className={styles.flowBox}>{step}</div>
              {i < arr.length - 1 && <div className={styles.flowArrow}>→</div>}
            </div>
          ))}
        </div>
        <div className={styles.noteBox} style={{ marginTop: '16px' }}>
          <div className={styles.noteItem}>
            <span className={styles.noteIcon}>💰</span>
            <span><strong>학습용 첫 의뢰 예산:</strong> 5×5×3cm FDM PLA 기준 약 $3–8 + 배송 (DHL 권장 $15–30). 총 $20–40 내외</span>
          </div>
          <div className={styles.noteItem}>
            <span className={styles.noteIcon}>📦</span>
            <span><strong>개인통관고유부호 필수:</strong> 관세청 유니패스(unipass.customs.go.kr)에서 발급. 체크아웃 시 입력</span>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── 메인 페이지 ─────────────────────────────────────────────────
export default function DesignPage() {
  const [tab, setTab] = useState<Tab>('install');

  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <div className={styles.heroIcon}>⚙️</div>
        <div>
          <h1 className={styles.heroTitle}>설계 공방</h1>
          <p className={styles.heroSub}>Fusion 360 × JLCPCB — 설계하고, 출력하고, 손에 쥐어보기</p>
        </div>
      </header>

      <div className={styles.tabs}>
        {(['install', 'curriculum'] as Tab[]).map((t) => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'install' ? '🛠️ 설치 가이드' : '📅 2주 커리큘럼'}
          </button>
        ))}
      </div>

      {tab === 'install' ? <InstallTab /> : <CurriculumTab />}
    </div>
  );
}
