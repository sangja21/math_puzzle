// 지수와 로그 — 체스판 쌀알 시뮬레이터 보조 함수

// 칸 번호(1~64)에 그 칸 하나에 놓이는 쌀알 수: 2^(n-1)
export function grainsAt(cell: number): bigint {
  if (cell < 1) return 0n;
  return 1n << BigInt(cell - 1);
}

// 1~cell번 칸까지 누적: 2^cell - 1
export function grainsCumulative(cell: number): bigint {
  if (cell < 1) return 0n;
  return (1n << BigInt(cell)) - 1n;
}

// 쌀 한 톨의 무게 (g) — 일반적 흰쌀 단립종 기준 0.025g/톨
export const GRAIN_WEIGHT_G = 0.025;

// 비유 임계값 — (누적 쌀알 수 기준, 작은 단위부터 큰 단위 순)
export interface Analogy {
  readonly threshold: bigint; // 이 값 이상이면 해당 라벨로 표시
  readonly label: string;
  readonly icon?: string;
}

// 톨 → 사람의 직관 단위
// 1톨 = 0.025g, 1g = 40톨, 1kg = 40,000톨, 1톤 = 4×10⁷톨
export const ANALOGIES: readonly Analogy[] = [
  { threshold: 0n, label: '한 톨', icon: '🌾' },
  { threshold: 100n, label: '한 줌', icon: '✋' },
  { threshold: 8_000n, label: '밥 한 공기 (~200g)', icon: '🍚' },
  { threshold: 400_000n, label: '쌀 한 가마 (~10kg)', icon: '🛍️' },
  { threshold: 40_000_000n, label: '쌀 1톤 — 트럭 한 대', icon: '🚚' },
  { threshold: 4_000_000_000n, label: '쌀 100톤 — 마을 1년치', icon: '🏘️' },
  { threshold: 400_000_000_000n, label: '쌀 1만 톤 — 도시 1년치', icon: '🏙️' },
  { threshold: 40_000_000_000_000n, label: '쌀 100만 톤 — 한 왕국', icon: '🏰' },
  { threshold: 140_000_000_000_000n, label: '한국 1년 쌀 생산량을 넘김', icon: '🇰🇷' },
  { threshold: 20_000_000_000_000_000n, label: '세계 1년 쌀 생산량을 넘김', icon: '🌏' },
  { threshold: 2_000_000_000_000_000_000n, label: '세계 100년치 — 왕국으론 어림없다', icon: '🌌' },
];

export function analogyFor(grains: bigint): Analogy {
  let best = ANALOGIES[0];
  for (const a of ANALOGIES) {
    if (grains >= a.threshold) best = a;
    else break;
  }
  return best;
}

// 왕↔현자 말풍선 단계 (칸 진행에 따른 분위기 변화)
export interface DialogueLine {
  readonly fromCell: number;
  readonly sage: string;
  readonly king: string;
}

export const DIALOGUES: readonly DialogueLine[] = [
  {
    fromCell: 1,
    sage: '폐하, 단지 한 톨만 청합니다.',
    king: '그게 다인가? 허허, 좋다.',
  },
  {
    fromCell: 16,
    sage: '약속하신 대로 계속 두 배씩…',
    king: '음, 슬슬 그릇이 무거워지는군.',
  },
  {
    fromCell: 32,
    sage: '아직 절반입니다, 폐하.',
    king: '잠깐, 창고를 다시 세어보아라!',
  },
  {
    fromCell: 48,
    sage: '64칸의 절반을 막 넘었습니다.',
    king: '왕국의 곳간이 비어가고 있다…',
  },
  {
    fromCell: 64,
    sage: '약속하신 64칸, 모두 받았습니다.',
    king: '내 왕국이… 다 사라졌도다.',
  },
];

export function dialogueAt(cell: number): DialogueLine {
  let best = DIALOGUES[0];
  for (const d of DIALOGUES) {
    if (cell >= d.fromCell) best = d;
    else break;
  }
  return best;
}

// 큰 수 한국어 단위 포맷 — "1.84경 4467조 …" 식이 길어 핵심만
// 자릿수가 4 이하: 그대로. 그 이상: 만/억/조/경 단위로 절삭 (소수 둘째까지)
const KO_UNITS: readonly { value: bigint; name: string }[] = [
  { value: 10_000_000_000_000_000n, name: '경' },
  { value: 1_000_000_000_000n, name: '조' },
  { value: 100_000_000n, name: '억' },
  { value: 10_000n, name: '만' },
];

export function formatKoreanShort(n: bigint): string {
  if (n < 10_000n) return n.toLocaleString('ko-KR');
  for (const u of KO_UNITS) {
    if (n >= u.value) {
      // n / u.value 에 소수 둘째자리까지
      const whole = n / u.value;
      const rem = n % u.value;
      const frac = Number((rem * 100n) / u.value);
      const fracStr = frac < 10 ? `0${frac}` : `${frac}`;
      return `${whole.toLocaleString('ko-KR')}.${fracStr}${u.name}`;
    }
  }
  return n.toLocaleString('ko-KR');
}

// 과학적 표기 — 매우 큰 수 (예: 9.22 × 10¹⁸)
const SUPERS: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
};

export function formatScientific(n: bigint, sigFigs = 3): string {
  if (n === 0n) return '0';
  const s = n.toString();
  const exp = s.length - 1;
  if (exp < sigFigs) return n.toLocaleString('ko-KR');
  const mantissaStr = s.slice(0, sigFigs);
  const mantissa = `${mantissaStr.slice(0, 1)}.${mantissaStr.slice(1)}`;
  const expSuper = exp
    .toString()
    .split('')
    .map((c) => SUPERS[c] ?? c)
    .join('');
  return `${mantissa} × 10${expSuper}`;
}

// 무게 환산 (톨 → g/kg/톤)
export interface WeightLabel {
  readonly value: string; // 숫자 포맷
  readonly unit: string;
}

export function weightOf(grains: bigint): WeightLabel {
  // grams = grains * 0.025 — bigint 정확 곱셈을 위해 grains/40 (g)
  const grams = grains / 40n;
  const remainder = grains % 40n; // 시각상 무의미 (큰 수에서)

  if (grams < 1000n) {
    const g = Number(grams) + Number(remainder) / 40;
    return { value: g.toFixed(g < 10 ? 2 : 0), unit: 'g' };
  }
  const kg = grams / 1000n;
  if (kg < 1000n) {
    return { value: kg.toLocaleString('ko-KR'), unit: 'kg' };
  }
  const tons = kg / 1000n;
  if (tons < 10_000n) {
    return { value: tons.toLocaleString('ko-KR'), unit: '톤' };
  }
  // 1만 톤 이상은 한국어 단위
  return { value: formatKoreanShort(tons), unit: '톤' };
}

// 챌린지: 누적 톨 수가 target을 처음 넘는 칸 — 작은 N이므로 선형 탐색
export function firstCellExceeding(target: bigint): number {
  for (let n = 1; n <= 64; n++) {
    if (grainsCumulative(n) >= target) return n;
  }
  return 64;
}

// 원리 탭 §2 — 막대 차트용: 1·2·4·8·…·2^n
export function powersOfTwo(maxExponent: number): number[] {
  const out: number[] = [];
  for (let i = 0; i <= maxExponent; i++) out.push(2 ** i);
  return out;
}

// 원리 탭 §3 — 사용자가 슬라이더로 곱한 횟수 n을 선택
//   "10을 n번 곱하면 ?" / 거꾸로 "?는 10을 몇 번 곱한 것?"
export function tenToN(n: number): number {
  return 10 ** n;
}

// 원리 탭 §4 — 같은 x에서 2ⁿ / 10ⁿ / eⁿ
export const BASE_2 = 2;
export const BASE_10 = 10;
export const BASE_E = Math.E;

// 자연/기술 속 로그 사례 카드 데이터
export interface LogExample {
  readonly title: string;
  readonly emoji: string;
  readonly formula: string;
  readonly insight: string;
}

export const LOG_EXAMPLES: readonly LogExample[] = [
  {
    title: '데시벨 (소리)',
    emoji: '🔔',
    formula: 'dB = 10·log₁₀(I/I₀)',
    insight: '30dB → 60dB는 *1,000배* 더 큰 에너지',
  },
  {
    title: '리히터 (지진)',
    emoji: '🌋',
    formula: 'M ∝ log₁₀(진폭)',
    insight: '리히터 6과 8의 차이는 *세기 100배*',
  },
  {
    title: 'pH (산성도)',
    emoji: '🧪',
    formula: 'pH = -log₁₀[H⁺]',
    insight: 'pH 5 → pH 3은 *수소 100배* 더 많음',
  },
  {
    title: '별의 등급',
    emoji: '✨',
    formula: '5등급 차 = 100배 밝기',
    insight: '1등성은 6등성보다 *100배* 밝다',
  },
];

// 자가 점검 문항
export interface SelfCheck {
  readonly question: string;
  readonly answer: string;
  readonly hint?: string;
}

export const SELF_CHECKS: readonly SelfCheck[] = [
  {
    question: '2를 10번 곱하면 약 얼마인가요?',
    answer: '약 1,024 (≈ 1,000)',
    hint: '2¹⁰ — 컴퓨터에서 1KB가 1,024B인 이유',
  },
  {
    question: 'log₁₀ 100,000 의 값은?',
    answer: '5',
    hint: '10을 5번 곱하면 100,000',
  },
  {
    question: '리히터 6의 지진과 8의 지진, 세기는 몇 배 차이?',
    answer: '100배',
    hint: '리히터는 1 차이 = 10배, 2 차이 = 100배',
  },
];
