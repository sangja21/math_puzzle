'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { beatFrequency, hasAudibleBeat } from '@/lib/puzzles/sine';
import styles from './SoundLab.module.css';

type Mode = 'single' | 'duet';

interface Preset {
  label: string;
  desc: string;
  f1: number;
  f2: number;
  mode: Mode;
}

const PRESETS: Preset[] = [
  { label: '♪ 단일 사인 (A4)', desc: '440Hz 한 음 — 가장 깨끗한 순음', f1: 440, f2: 440, mode: 'single' },
  { label: '🎵 옥타브 (2:1)', desc: '440 + 880 — 같은 음처럼 완전히 어울려요', f1: 440, f2: 880, mode: 'duet' },
  { label: '🎵 완전5도 (3:2)', desc: '440 + 660 — 가장 화음 같은 정수비', f1: 440, f2: 660, mode: 'duet' },
  { label: '🎵 완전4도 (4:3)', desc: '440 + 587 — 안정적인 협화음', f1: 440, f2: 587, mode: 'duet' },
  { label: '〰️ 단2도 (반음)', desc: '440 + 466 — 부딪치며 빠른 맥놀이', f1: 440, f2: 466, mode: 'duet' },
  { label: '🐢 느린 맥놀이', desc: '440 + 443 — 3Hz 진동, 천천히 부풀고 줄어드는 게 또렷이 들려요', f1: 440, f2: 443, mode: 'duet' },
];

const MASTER_GAIN = 0.18;
const WAVE_W = 640;
const WAVE_H = 200;
const WAVE_SAMPLES = 800;
/** 시각화 윈도우 길이(ms). 한 화면에 보이는 시간 */
const VIS_WINDOW_MS = 20;

export function SoundLab() {
  const [mode, setMode] = useState<Mode>('single');
  const [playing, setPlaying] = useState(false);
  const [f1, setF1] = useState(440);
  const [f2, setF2] = useState(660);
  const [amp1, setAmp1] = useState(0.8);
  const [amp2, setAmp2] = useState(0.8);

  const ctxRef = useRef<AudioContext | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const gain1Ref = useRef<GainNode | null>(null);
  const gain2Ref = useRef<GainNode | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const [audioReady, setAudioReady] = useState(false);

  // ── 오디오 컨텍스트 셋업 (사용자 제스처 이후)
  const ensureAudio = () => {
    if (ctxRef.current) return ctxRef.current;
    const AC: typeof AudioContext =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AC();
    ctxRef.current = ctx;
    const master = ctx.createGain();
    master.gain.value = MASTER_GAIN;
    master.connect(ctx.destination);
    masterRef.current = master;
    setAudioReady(true);
    return ctx;
  };

  // ── 재생 토글
  useEffect(() => {
    if (!playing) {
      // 정지
      [osc1Ref, osc2Ref].forEach((r) => {
        if (r.current) {
          try {
            r.current.stop();
          } catch {
            // 이미 멈춤
          }
          r.current.disconnect();
          r.current = null;
        }
      });
      [gain1Ref, gain2Ref].forEach((r) => {
        if (r.current) {
          r.current.disconnect();
          r.current = null;
        }
      });
      return;
    }

    const ctx = ensureAudio();
    const master = masterRef.current!;

    const make = (freq: number, amp: number): [OscillatorNode, GainNode] => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      // 클릭 노이즈 방지 — 짧은 페이드 인
      g.gain.setValueAtTime(0, ctx.currentTime);
      g.gain.linearRampToValueAtTime(amp, ctx.currentTime + 0.04);
      osc.connect(g);
      g.connect(master);
      osc.start();
      return [osc, g];
    };

    const [o1, g1] = make(f1, amp1);
    osc1Ref.current = o1;
    gain1Ref.current = g1;
    if (mode === 'duet') {
      const [o2, g2] = make(f2, amp2);
      osc2Ref.current = o2;
      gain2Ref.current = g2;
    }

    return () => {
      [osc1Ref, osc2Ref].forEach((r) => {
        if (r.current) {
          try {
            r.current.stop();
          } catch {
            // ignore
          }
          r.current.disconnect();
          r.current = null;
        }
      });
      [gain1Ref, gain2Ref].forEach((r) => {
        if (r.current) {
          r.current.disconnect();
          r.current = null;
        }
      });
    };
    // mode 가 변하면 재구성 필요 (osc 개수 다름)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, mode]);

  // ── 재생 중 실시간 주파수/볼륨 반영
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    if (osc1Ref.current) {
      osc1Ref.current.frequency.setTargetAtTime(f1, ctx.currentTime, 0.02);
    }
    if (gain1Ref.current) {
      gain1Ref.current.gain.setTargetAtTime(amp1, ctx.currentTime, 0.02);
    }
  }, [f1, amp1]);

  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    if (osc2Ref.current) {
      osc2Ref.current.frequency.setTargetAtTime(f2, ctx.currentTime, 0.02);
    }
    if (gain2Ref.current) {
      gain2Ref.current.gain.setTargetAtTime(amp2, ctx.currentTime, 0.02);
    }
  }, [f2, amp2]);

  useEffect(() => {
    return () => {
      if (ctxRef.current) {
        ctxRef.current.close().catch(() => {});
        ctxRef.current = null;
      }
    };
  }, []);

  // ── 파형 시각화 샘플
  const waveSamples = useMemo(() => {
    const out: { x: number; y1: number; y2: number; ys: number }[] = [];
    const Tsec = VIS_WINDOW_MS / 1000;
    for (let i = 0; i < WAVE_SAMPLES; i++) {
      const t = (i / (WAVE_SAMPLES - 1)) * Tsec;
      const v1 = amp1 * Math.sin(2 * Math.PI * f1 * t);
      const v2 = mode === 'duet' ? amp2 * Math.sin(2 * Math.PI * f2 * t) : 0;
      out.push({ x: i / (WAVE_SAMPLES - 1), y1: v1, y2: v2, ys: v1 + v2 });
    }
    return out;
  }, [f1, f2, amp1, amp2, mode]);

  const beat = mode === 'duet' ? beatFrequency(f1, f2) : 0;
  const showBeat = mode === 'duet' && hasAudibleBeat(f1, f2);

  const applyPreset = (p: Preset) => {
    setMode(p.mode);
    setF1(p.f1);
    setF2(p.f2);
    setAmp1(0.8);
    setAmp2(0.8);
  };

  return (
    <main className={styles.tab}>
      <header className={styles.head}>
        <h2 className={styles.headTitle}>🎵 음파 실험실</h2>
        {!audioReady && (
          <div className={styles.warnBox}>
            💡 *재생* 버튼을 처음 누르면 소리가 켜집니다 (브라우저 자동재생 정책)
          </div>
        )}
      </header>

      <div className={styles.modeRow}>
        <button
          type="button"
          className={`${styles.modeBtn} ${mode === 'single' ? styles.modeActive : ''}`}
          onClick={() => setMode('single')}
        >
          ♪ 단일 사인
        </button>
        <button
          type="button"
          className={`${styles.modeBtn} ${mode === 'duet' ? styles.modeActive : ''}`}
          onClick={() => setMode('duet')}
        >
          ♪♪ 두 사인 합치기
        </button>
      </div>

      <div className={styles.waveBox}>
        <div className={styles.waveLabel}>
          <div className={styles.waveLabelLeft}>
            <span style={{ color: '#f472b6' }}>● 사인 1 ({f1}Hz)</span>
            {mode === 'duet' && (
              <>
                <span style={{ color: '#38bdf8' }}>● 사인 2 ({f2}Hz)</span>
                <span style={{ color: '#fbbf24' }}>● 합쳐진 파형</span>
              </>
            )}
          </div>
          {showBeat && (
            <span className={styles.beatChip}>맥놀이 {beat.toFixed(1)} Hz</span>
          )}
        </div>
        <WaveCanvas samples={waveSamples} showSecond={mode === 'duet'} />
        <p
          style={{
            margin: '6px 4px 0',
            fontSize: '0.78rem',
            color: 'rgba(248,250,252,0.42)',
          }}
        >
          가로축 = 시간(약 {VIS_WINDOW_MS}ms 한 창), 세로축 = 공기 진동의 세기
        </p>
      </div>

      <div className={styles.oscRow}>
        <div className={`${styles.oscBox} ${styles.oscBox1}`}>
          <div className={styles.oscHead}>
            <span className={styles.oscTitle}>♪ 사인 1</span>
            <span className={styles.oscFreq}>{f1} Hz</span>
          </div>
          <div className={styles.sliderLabel}>
            <span>주파수</span>
            <span className={styles.sliderValue}>{f1} Hz</span>
          </div>
          <input
            type="range"
            min={80}
            max={1200}
            step={1}
            value={f1}
            onChange={(e) => setF1(Number(e.target.value))}
            className={styles.slider}
          />
          <div className={styles.sliderLabel}>
            <span>볼륨</span>
            <span className={styles.sliderValue}>{(amp1 * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={amp1}
            onChange={(e) => setAmp1(Number(e.target.value))}
            className={styles.slider}
          />
        </div>

        {mode === 'duet' && (
          <div className={`${styles.oscBox} ${styles.oscBox2}`}>
            <div className={styles.oscHead}>
              <span className={styles.oscTitle}>♪ 사인 2</span>
              <span className={styles.oscFreq}>{f2} Hz</span>
            </div>
            <div className={styles.sliderLabel}>
              <span>주파수</span>
              <span className={styles.sliderValue}>{f2} Hz</span>
            </div>
            <input
              type="range"
              min={80}
              max={1200}
              step={1}
              value={f2}
              onChange={(e) => setF2(Number(e.target.value))}
              className={styles.slider}
            />
            <div className={styles.sliderLabel}>
              <span>볼륨</span>
              <span className={styles.sliderValue}>{(amp2 * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={amp2}
              onChange={(e) => setAmp2(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
        )}
      </div>

      <div className={styles.presetSection}>
        <span className={styles.presetLabel}>🎼 빠른 프리셋</span>
        <div className={styles.presetGrid}>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              className={styles.presetChip}
              onClick={() => applyPreset(p)}
            >
              {p.label}
            </button>
          ))}
        </div>
        {(() => {
          const matched = PRESETS.find(
            (p) =>
              p.mode === mode &&
              Math.abs(p.f1 - f1) < 2 &&
              (mode === 'single' || Math.abs(p.f2 - f2) < 2),
          );
          return matched ? (
            <p className={styles.presetDesc}>📝 {matched.desc}</p>
          ) : null;
        })()}
      </div>

      <div className={styles.masterRow}>
        <button
          type="button"
          className={`${styles.playBtn} ${playing ? styles.playBtnOn : ''}`}
          onClick={() => setPlaying((v) => !v)}
        >
          {playing ? '⏸ 정지' : '▶ 재생'}
        </button>
      </div>

      <details className={styles.help}>
        <summary>💡 뭘 들어보면 좋을까요?</summary>
        <div className={styles.helpBody}>
          <p>
            <strong>1.</strong> 먼저 *단일 사인* 모드에서 주파수를 200→1000Hz로
            올려보세요. 높이가 변하는 게 들려요. (피아노 건반과 동일한 원리)
          </p>
          <p>
            <strong>2.</strong> *두 사인 합치기* 로 바꾸고 *옥타브(2:1)* 프리셋을
            눌러요. 두 사인이 *같은 음처럼* 어울리는 게 느껴지나요?
          </p>
          <p>
            <strong>3.</strong> *완전5도(3:2)*, *완전4도(4:3)* 도 들어보세요.
            정수비가 단순할수록 더 *화음* 처럼 들려요.
          </p>
          <p>
            <strong>4.</strong> *느린 맥놀이* 프리셋 (440 + 443) ─ 두 사인이
            가까울 때 *부풀었다 줄었다* 하는 진동이 들려요. 위 파형의{' '}
            <strong style={{ color: '#fbbf24' }}>노란 합쳐진 곡선</strong> 도 그렇게
            출렁여요. 이게 *맥놀이*.
          </p>
          <p>
            <strong>5.</strong> 파형 모양: 단일 사인은 깨끗한 곡선, 두 개 합치면
            새로운 모양이 나와요. *모든 소리는 사인의 합* — 푸리에가 발견한
            비밀이에요.
          </p>
        </div>
      </details>
    </main>
  );
}

function WaveCanvas({
  samples,
  showSecond,
}: {
  samples: { x: number; y1: number; y2: number; ys: number }[];
  showSecond: boolean;
}) {
  const W = WAVE_W;
  const H = WAVE_H;
  const cy = H / 2;
  const yScale = (H / 2) * 0.42; // 진폭 1 → 화면의 42%

  const toPath = (key: 'y1' | 'y2' | 'ys') => {
    return samples
      .map((s, i) => {
        const x = s.x * W;
        const y = cy - s[key] * yScale;
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  };

  return (
    <svg
      className={styles.waveSvg}
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
    >
      <line
        x1={0}
        y1={cy}
        x2={W}
        y2={cy}
        stroke="rgba(255,255,255,0.15)"
        strokeWidth={1}
      />
      {showSecond && (
        <>
          <path
            d={toPath('y1')}
            fill="none"
            stroke="#f472b6"
            strokeWidth={1.6}
            opacity={0.6}
          />
          <path
            d={toPath('y2')}
            fill="none"
            stroke="#38bdf8"
            strokeWidth={1.6}
            opacity={0.6}
          />
          <path
            d={toPath('ys')}
            fill="none"
            stroke="#fbbf24"
            strokeWidth={2.4}
          />
        </>
      )}
      {!showSecond && (
        <path
          d={toPath('y1')}
          fill="none"
          stroke="#f472b6"
          strokeWidth={2.4}
        />
      )}
    </svg>
  );
}
