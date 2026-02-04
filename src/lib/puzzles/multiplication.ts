
/**
 * 곱셈 암호 (Multiplication Cipher) 및 유클리드 호제법 시각화 로직
 */

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

// --- 기본 수학 유틸리티 ---

/**
 * 최대공약수 (GCD) 계산
 */
export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * 모듈러 역원 계산 (확장 유클리드 호제법)
 * a * x ≡ 1 (mod m) 인 x를 찾음
 * 만약 서로소가 아니라면 null 반환
 */
export function getModularInverse(a: number, m: number = 26): number | null {
  let t = 0;
  let newT = 1;
  let r = m;
  let newR = a;

  while (newR !== 0) {
    const quotient = Math.floor(r / newR);
    [t, newT] = [newT, t - quotient * newT];
    [r, newR] = [newR, r - quotient * newR];
  }

  if (r > 1) return null; // 역원이 존재하지 않음 (서로소가 아님)
  if (t < 0) t = t + m;
  return t;
}

/**
 * 서로소 판별
 */
export function isCoprime(a: number, b: number = 26): boolean {
  return gcd(a, b) === 1;
}

// --- 기하학적 유클리드 호제법 (블록 채우기) ---

export interface EuclidRect {
  x: number;
  y: number;
  size: number; // 정사각형의 한 변의 길이
  colorIndex: number; // 시각적 구분을 위한 색상 인덱스
}

export interface EuclidStep {
  width: number;
  height: number;
  rects: EuclidRect[];
  remainderWidth: number;
  remainderHeight: number;
}

/**
 * 직사각형을 정사각형들로 채우는 과정 생성 (유클리드 호제법 시각화)
 * width x height 직사각형을 가장 큰 정사각형으로 채워나감
 */
export function getEuclidTiling(width: number, height: number): EuclidRect[] {
  const rects: EuclidRect[] = [];
  let w = width;
  let h = height;
  let x = 0;
  let y = 0;
  let colorIdx = 0;

  // w나 h가 0이 될 때까지 반복
  while (w > 0 && h > 0) {
    if (w < 1 || h < 1) break; // 안전장치

    if (w >= h) {
      // 가로가 더 길면 가로로 정사각형 배치
      const size = h;
      const count = Math.floor(w / h);
      for (let i = 0; i < count; i++) {
        rects.push({ x, y, size, colorIndex: colorIdx });
        x += size;
      }
      w -= size * count;
    } else {
      // 세로가 더 길면 세로로 정사각형 배치
      const size = w;
      const count = Math.floor(h / w);
      for (let i = 0; i < count; i++) {
        rects.push({ x, y, size, colorIndex: colorIdx });
        y += size;
      }
      h -= size * count;
    }
    colorIdx++;
  }

  return rects;
}

// --- 암호화 로직 ---

export interface CipherResult {
  char: string;
  originalIndex: number; // 0~25
  multIndex: number; // (originalIndex * key)
  modIndex: number; // (originalIndex * key) % 26
  encryptedChar: string;
}

/**
 * 곱셈 암호 매핑 테이블 생성
 */
export function getMultiplicationTable(key: number): CipherResult[] {
  const table: CipherResult[] = [];
  for (let i = 0; i < 26; i++) {
    const mult = i * key;
    const mod = mult % 26;
    table.push({
      char: ALPHABET[i],
      originalIndex: i,
      multIndex: mult,
      modIndex: mod,
      encryptedChar: ALPHABET[mod],
    });
  }
  return table;
}

/**
 * 충돌(Collision) 분석: 암호화 결과가 겹치는 알파벳들이 있는지 확인
 * 26과 서로소가 아닌 키를 사용했을 때 발생
 */
export function analyzeCollisions(key: number): Map<string, string[]> {
  const map = new Map<string, string[]>(); // EncryptedChar -> [OriginalChars...]
  
  for (let i = 0; i < 26; i++) {
    const originalChar = ALPHABET[i];
    const modIndex = (i * key) % 26;
    const encryptedChar = ALPHABET[modIndex];

    if (!map.has(encryptedChar)) {
      map.set(encryptedChar, []);
    }
    map.get(encryptedChar)!.push(originalChar);
  }

  // 겹치는 것만 필터링
  const collisions = new Map<string, string[]>();
  map.forEach((originals, encrypted) => {
    if (originals.length > 1) {
      collisions.set(encrypted, originals);
    }
  });

  return collisions;
}

// --- 퀴즈 및 블록코딩 데이터 ---

export interface MulQuiz {
  id: number;
  level: number;
  cipherText: string;
  plainText: string; // 정답
  key: number; // 암호화 키
  hint: string;
}

export const QUIZ_DATA: MulQuiz[] = [
  { id: 1, level: 1, cipherText: 'D', plainText: 'B', key: 3, hint: '3을 곱해서 3(D)이 되는 숫자는 1(B)이야!' },
  { id: 2, level: 1, cipherText: 'G', plainText: 'C', key: 3, hint: '3을 곱해서 6(G)이 되는 숫자는 2(C)야.' },
  { id: 3, level: 2, cipherText: 'Khoor', plainText: 'Hello', key: 3, hint: '표를 보고 하나씩 찾아보자.' }, 
  // Hello -> 7,4,11,11,14 -> *3 -> 21,12,33(7),33(7),42(16) -> V,M,H,H,Q ??
  // Wait, let's verify encryption. 
  // H(7)*3 = 21(V). E(4)*3 = 12(M). L(11)*3 = 33%26 = 7(H). O(14)*3=42%26=16(Q).
  // VMHHQ is the cipher.
];

// Helper to generate a random quiz
export function generateQuiz(level: number): MulQuiz {
  const key = 3; // Start with key 3 for simplicity
  const words = ['CAT', 'DOG', 'BAT', 'ANT', 'EGG'];
  const word = words[Math.floor(Math.random() * words.length)];
  
  // Encrypt
  let cipher = '';
  for(let i=0; i<word.length; i++) {
    const pIdx = ALPHABET.indexOf(word[i]);
    const cIdx = (pIdx * key) % 26;
    cipher += ALPHABET[cIdx];
  }

  return {
    id: Date.now(),
    level,
    cipherText: cipher,
    plainText: word,
    key,
    hint: `Key는 ${key}야! 표를 거꾸로 따라가 봐!`
  };
}

export interface BlockPuzzle {
  id: number;
  story: string;
  startPos: number; // 0 ~ modulo-1
  targetPos: number; 
  modulo: number; // Track size (e.g. 12 or 26)
  options: number[]; // Choices for 'move' block
  correctAnswer: number;
}

export const BLOCK_PUZZLES: BlockPuzzle[] = [
  {
    id: 1,
    story: "시계 로봇이 12시에 있어요(0). 3시(3)로 가고 싶대요. 시계는 12칸입니다.",
    startPos: 0,
    targetPos: 3,
    modulo: 12,
    options: [3, 13, 24, 15], // 3 or 15. 15%12=3.
    correctAnswer: 15
  },
  {
    id: 2,
    story: "로봇이 10번 칸에 있어요. 2번 칸으로 가려면 몇 칸을 더 가야 할까요? (전체 12칸)",
    startPos: 10,
    targetPos: 2,
    modulo: 12,
    options: [2, 4, 8, 12], // (10+4)%12 = 14%12=2.
    correctAnswer: 4
  }
];
