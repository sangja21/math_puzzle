// 사인함수 — 피라미드의 높이는? 단원 보조 로직

// ─── 자연 속 사인 카드 ───────────────────────────
export interface NatureSine {
  emoji: string;
  title: string;
  desc: string;
  /** 카드 색상 강조 */
  accent: string;
}

export const NATURE_SINES: readonly NatureSine[] = [
  {
    emoji: '🌊',
    title: '바다 파도',
    desc: '수면이 위·아래로 같은 주기로 움직이는 모습. 잔잔한 파도일수록 사인에 가깝다.',
    accent: '#38bdf8',
  },
  {
    emoji: '🔊',
    title: '순음(純音) 음파',
    desc: '튜닝포크의 소리. 단 하나의 주파수로 된 사인 파형. 다른 모든 소리는 사인의 합이다.',
    accent: '#f472b6',
  },
  {
    emoji: '🕰️',
    title: '진자의 흔들림',
    desc: '시계추가 좌우로 흔들리는 위치를 시간에 따라 기록하면 사인 곡선이 나온다.',
    accent: '#fbbf24',
  },
  {
    emoji: '💡',
    title: '교류 전기',
    desc: '콘센트에서 나오는 전기는 1초에 60번 방향을 바꾸는 사인파(60Hz).',
    accent: '#a78bfa',
  },
];

// ─── 음정 (Hz) ───────────────────────────────────
export interface ToneStep {
  ratio: number;
  name: string;
  desc: string;
}

/** 기준음(보통 A4=440Hz) 대비 음정 비율 */
export const INTERVALS: readonly ToneStep[] = [
  { ratio: 1, name: '동음 (1:1)', desc: '같은 음 — 완전히 겹쳐 더 큰 한 음으로 들림' },
  { ratio: 16 / 15, name: '단2도 (16:15)', desc: '반음 차이 — 매우 가까워 *맥놀이* 가 들림' },
  { ratio: 9 / 8, name: '장2도 (9:8)', desc: '온음 — 도-레 정도의 거리' },
  { ratio: 4 / 3, name: '완전4도 (4:3)', desc: '도-파 — 안정적인 화음' },
  { ratio: 3 / 2, name: '완전5도 (3:2)', desc: '도-솔 — 가장 단순한 정수비, 가장 화음다움' },
  { ratio: 2, name: '옥타브 (2:1)', desc: '같은 음의 두 배 — 마치 같은 음처럼 어울림' },
];

/** 두 주파수가 *맥놀이(beat)* 를 일으키는지 — 차이 0.5~25Hz 정도 */
export function beatFrequency(f1: number, f2: number): number {
  return Math.abs(f1 - f2);
}

export function hasAudibleBeat(f1: number, f2: number): boolean {
  const d = beatFrequency(f1, f2);
  return d >= 0.5 && d <= 25;
}

// 사인 함수 시각화용 — t∈[0,1] 구간에서 표시
export interface WaveSpec {
  freq: number; // Hz (시각화에서는 cycles per visible window)
  amp: number; // 0..1
  phase?: number; // radians
}

/** 시간 t (0..1 정규화) 에 대한 두 파동 합의 샘플 */
export function waveSamples(
  waves: readonly WaveSpec[],
  count: number,
  cyclesPerWindow = 4,
): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    let y = 0;
    for (const w of waves) {
      const cycles = (w.freq / 440) * cyclesPerWindow;
      y += w.amp * Math.sin(2 * Math.PI * cycles * t + (w.phase ?? 0));
    }
    out.push({ x: t, y });
  }
  return out;
}

// 30·45·60° 같은 표준 각도 sin 값
export const SPECIAL_ANGLES = [
  { deg: 0, sin: 0, label: '0' },
  { deg: 30, sin: 0.5, label: '1/2' },
  { deg: 45, sin: Math.SQRT1_2, label: '√2 / 2 ≈ 0.707' },
  { deg: 60, sin: Math.sqrt(3) / 2, label: '√3 / 2 ≈ 0.866' },
  { deg: 90, sin: 1, label: '1' },
];
