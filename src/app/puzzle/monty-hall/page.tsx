'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import {
  playRound,
  simulateMany,
  simulateBoth,
  type Strategy,
  type RoundState,
} from '@/lib/puzzles/montyHall';

type Phase = 'pick' | 'reveal' | 'decide' | 'result';
type Reveal = 'hidden' | 'goat' | 'car';

interface StratStats {
  wins: number;
  total: number;
}

const ZERO_STATS: StratStats = { wins: 0, total: 0 };

function pct(s: StratStats): string {
  if (s.total === 0) return '—';
  return `${((s.wins / s.total) * 100).toFixed(1)}%`;
}

function rateNum(s: StratStats): number {
  return s.total === 0 ? 0 : s.wins / s.total;
}

interface DoorViewProps {
  index: 0 | 1 | 2;
  reveal: Reveal;
  selected: boolean;
  clickable: boolean;
  highlight?: 'pick' | 'switch' | null;
  onClick?: () => void;
}

function DoorView({ index, reveal, selected, clickable, highlight, onClick }: DoorViewProps) {
  const classes = [styles.door];
  if (selected) classes.push(styles.doorSelected);
  if (reveal === 'goat') classes.push(styles.doorGoat);
  if (reveal === 'car') classes.push(styles.doorCar);
  if (clickable) classes.push(styles.doorClickable);

  return (
    <button
      type="button"
      className={classes.join(' ')}
      onClick={clickable ? onClick : undefined}
      disabled={!clickable}
      aria-label={`${index + 1}번 문`}
    >
      <div className={styles.doorNumber}>{index + 1}</div>
      <div className={styles.doorContent}>
        {reveal === 'goat' && <span className={styles.doorEmoji}>🐐</span>}
        {reveal === 'car' && <span className={styles.doorEmoji}>🚗</span>}
        {reveal === 'hidden' && <span className={styles.doorHidden}>?</span>}
      </div>
      {highlight === 'pick' && <div className={styles.tagPick}>내 선택</div>}
      {highlight === 'switch' && <div className={styles.tagSwitch}>바꿈</div>}
    </button>
  );
}

export default function MontyHallPage() {
  const [phase, setPhase] = useState<Phase>('pick');
  const [round, setRound] = useState<RoundState | null>(null);
  const [finalPick, setFinalPick] = useState<0 | 1 | 2 | null>(null);
  const [stayStats, setStayStats] = useState<StratStats>(ZERO_STATS);
  const [switchStats, setSwitchStats] = useState<StratStats>(ZERO_STATS);
  const [autoBusy, setAutoBusy] = useState(false);

  // 사회자 공개 타이머 — 언마운트/재시작 시 중복 방지
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePick = useCallback((doorIdx: 0 | 1 | 2) => {
    if (phase !== 'pick') return;
    const r = playRound(doorIdx);
    setRound(r);
    setPhase('reveal');
    if (revealTimer.current) clearTimeout(revealTimer.current);
    revealTimer.current = setTimeout(() => {
      setPhase('decide');
    }, 600);
  }, [phase]);

  const handleDecision = useCallback((strategy: Strategy) => {
    if (phase !== 'decide' || !round) return;
    const chosen = strategy === 'switch' ? round.switchTarget : round.firstPick;
    setFinalPick(chosen);
    const won = chosen === round.carDoor;
    if (strategy === 'switch') {
      setSwitchStats(s => ({ wins: s.wins + (won ? 1 : 0), total: s.total + 1 }));
    } else {
      setStayStats(s => ({ wins: s.wins + (won ? 1 : 0), total: s.total + 1 }));
    }
    setPhase('result');
  }, [phase, round]);

  const handleReset = useCallback(() => {
    if (revealTimer.current) clearTimeout(revealTimer.current);
    setRound(null);
    setFinalPick(null);
    setPhase('pick');
  }, []);

  const handleClearStats = useCallback(() => {
    setStayStats(ZERO_STATS);
    setSwitchStats(ZERO_STATS);
  }, []);

  const runAuto = useCallback((strategy: Strategy | 'both', n: number) => {
    if (autoBusy) return;
    setAutoBusy(true);
    // 결과 패널 갱신을 다음 프레임으로 미뤄 버튼 비활성 표시 보장
    requestAnimationFrame(() => {
      if (strategy === 'both') {
        const both = simulateBoth(n);
        setStayStats(s => ({ wins: s.wins + both.stay.wins, total: s.total + both.stay.total }));
        setSwitchStats(s => ({ wins: s.wins + both.switch.wins, total: s.total + both.switch.total }));
      } else {
        const res = simulateMany(strategy, n);
        if (strategy === 'switch') {
          setSwitchStats(s => ({ wins: s.wins + res.wins, total: s.total + res.total }));
        } else {
          setStayStats(s => ({ wins: s.wins + res.wins, total: s.total + res.total }));
        }
      }
      setAutoBusy(false);
    });
  }, [autoBusy]);

  const doors = useMemo<Array<{
    reveal: Reveal;
    selected: boolean;
    clickable: boolean;
    highlight: 'pick' | 'switch' | null;
  }>>(() => {
    return ([0, 1, 2] as const).map(idx => {
      let reveal: Reveal = 'hidden';
      let selected = false;
      let highlight: 'pick' | 'switch' | null = null;
      let clickable = false;

      if (phase === 'pick') {
        clickable = true;
      } else if (round) {
        if (idx === round.firstPick) selected = true;
        if (phase === 'reveal' || phase === 'decide') {
          if (idx === round.hostOpens) reveal = 'goat';
          if (idx === round.firstPick) highlight = 'pick';
        } else if (phase === 'result' && finalPick !== null) {
          if (idx === round.hostOpens) reveal = 'goat';
          if (idx === round.carDoor) reveal = 'car';
          else if (idx !== round.hostOpens) reveal = 'goat';
          if (idx === round.firstPick) highlight = 'pick';
          if (finalPick !== round.firstPick && idx === finalPick) highlight = 'switch';
        }
      }

      return { reveal, selected, clickable, highlight };
    });
  }, [phase, round, finalPick]);

  const won = phase === 'result' && finalPick !== null && round && finalPick === round.carDoor;
  const switched = phase === 'result' && round && finalPick !== null && finalPick !== round.firstPick;

  const stayRate = rateNum(stayStats);
  const switchRate = rateNum(switchStats);

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.homeBtn}>🏠 메인으로</Link>

      <header className={styles.header}>
        <h1 className={styles.title}>
          <span>🚪</span> 몬티 홀의 역설
        </h1>
        <p className={styles.subtitle}>
          문 3개 중 한 곳에 차, 나머지 둘에는 염소. 한 문을 고른 다음, 사회자가 염소가 있는 문 하나를 열어 보여줘요.
          <br />지금 선택을 <strong>바꾸는 게 유리할까요, 유지하는 게 유리할까요?</strong>
        </p>
      </header>

      <section className={styles.stage}>
        <div className={styles.phaseLabel}>
          {phase === 'pick' && '1단계 — 문을 골라보세요'}
          {phase === 'reveal' && '2단계 — 사회자가 염소 문을 엽니다…'}
          {phase === 'decide' && '3단계 — 바꿀까요, 유지할까요?'}
          {phase === 'result' && '4단계 — 결과 공개!'}
        </div>

        <div className={styles.doorRow}>
          {doors.map((d, i) => (
            <DoorView
              key={i}
              index={i as 0 | 1 | 2}
              reveal={d.reveal}
              selected={d.selected}
              clickable={d.clickable}
              highlight={d.highlight}
              onClick={() => handlePick(i as 0 | 1 | 2)}
            />
          ))}
        </div>

        {phase === 'decide' && (
          <div className={styles.decideRow}>
            <button className={styles.stayBtn} onClick={() => handleDecision('stay')}>
              유지하기
            </button>
            <button className={styles.switchBtn} onClick={() => handleDecision('switch')}>
              바꾸기
            </button>
          </div>
        )}

        {phase === 'result' && round && (
          <div className={styles.resultBlock}>
            <div className={won ? styles.resultWin : styles.resultLose}>
              {won ? '🎉 차를 획득했어요!' : '😅 염소가 나왔어요.'}
            </div>
            <div className={styles.resultSub}>
              전략: <strong>{switched ? '바꾸기' : '유지'}</strong>
            </div>
            <button className={styles.againBtn} onClick={handleReset}>다시 하기</button>
          </div>
        )}
      </section>

      <section className={styles.panels}>
        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>자동 시뮬레이션</h2>
          <p className={styles.panelHint}>여러 번 돌려보면 진짜 확률에 가까워져요.</p>
          <div className={styles.autoBtnGrid}>
            <button
              className={styles.autoBtn}
              disabled={autoBusy}
              onClick={() => runAuto('switch', 100)}
            >
              바꾸기 100회
            </button>
            <button
              className={styles.autoBtn}
              disabled={autoBusy}
              onClick={() => runAuto('stay', 100)}
            >
              유지 100회
            </button>
            <button
              className={`${styles.autoBtn} ${styles.autoBtnBoth}`}
              disabled={autoBusy}
              onClick={() => runAuto('both', 1000)}
            >
              둘 다 1000회
            </button>
          </div>
        </div>

        <div className={styles.panel}>
          <h2 className={styles.panelTitle}>누적 통계</h2>
          <table className={styles.statsTable}>
            <thead>
              <tr>
                <th>전략</th>
                <th>시도</th>
                <th>차 획득</th>
                <th>승률</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><span className={styles.tagStay}>유지</span></td>
                <td>{stayStats.total}</td>
                <td>{stayStats.wins}</td>
                <td>{pct(stayStats)}</td>
              </tr>
              <tr>
                <td><span className={styles.tagSwitchSm}>바꿈</span></td>
                <td>{switchStats.total}</td>
                <td>{switchStats.wins}</td>
                <td>{pct(switchStats)}</td>
              </tr>
            </tbody>
          </table>

          <div className={styles.bars}>
            <div className={styles.barRow}>
              <span className={styles.barLabel}>유지</span>
              <div className={styles.barTrack}>
                <div className={styles.refLine} style={{ left: '33.33%' }} />
                <div className={styles.refLine} style={{ left: '66.67%' }} />
                <div
                  className={`${styles.barFill} ${styles.barFillStay}`}
                  style={{ width: `${stayRate * 100}%` }}
                />
              </div>
              <span className={styles.barVal}>{pct(stayStats)}</span>
            </div>
            <div className={styles.barRow}>
              <span className={styles.barLabel}>바꿈</span>
              <div className={styles.barTrack}>
                <div className={styles.refLine} style={{ left: '33.33%' }} />
                <div className={styles.refLine} style={{ left: '66.67%' }} />
                <div
                  className={`${styles.barFill} ${styles.barFillSwitch}`}
                  style={{ width: `${switchRate * 100}%` }}
                />
              </div>
              <span className={styles.barVal}>{pct(switchStats)}</span>
            </div>
            <div className={styles.refLegend}>
              <span>점선: 33%·67% 기준선</span>
            </div>
          </div>

          <button className={styles.clearBtn} onClick={handleClearStats}>
            통계 초기화
          </button>
        </div>
      </section>

      <details className={styles.help}>
        <summary>왜 바꾸는 게 더 유리할까? 🤔</summary>
        <div className={styles.helpBody}>
          <p>
            <strong>직관:</strong> &ldquo;문 두 개가 남았으니 50대 50 아닌가?&rdquo; 라고 생각하기 쉬워요.
            하지만 이 직관은 틀렸어요.
          </p>
          <p>
            <strong>핵심:</strong> 사회자는 <em>차가 어디 있는지 알고</em>, 일부러 염소 문을 열어요.
            이 정보가 확률 분포를 흔들어 놓아요.
          </p>
          <ul>
            <li>처음 고른 문에 차가 있을 확률: <strong>1/3</strong></li>
            <li>처음 안 고른 두 문 중에 차가 있을 확률: <strong>2/3</strong></li>
            <li>사회자가 그 두 문 중 염소 문을 열어주면, <strong>2/3 확률이 남은 한 문에 모여요</strong>.</li>
          </ul>
          <p>
            <strong>스스로 확인:</strong> 위의 &ldquo;바꾸기 100회&rdquo; 버튼을 눌러보세요.
            승률이 약 <strong>67%</strong> 근처에 모이는 걸 직접 볼 수 있어요. 1000회·10000회로 갈수록 더 정확해져요.
          </p>
        </div>
      </details>
    </div>
  );
}
