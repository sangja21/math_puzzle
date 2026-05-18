/**
 * 피타고라스 시각 증명 — 4개 직각삼각형 배치를 보간한다.
 *
 * 큰 정사각형 좌표계: 한 변의 길이 s = a + b.
 *   원점 (0,0) 은 좌상단, x 는 오른쪽, y 는 아래 (SVG 관례).
 *
 * 각 삼각형의 *국소 좌표계*:
 *   직각 꼭짓점이 원점, 다리 b 가 +x, 다리 a 가 +y, 빗변은 (b,0)→(0,a).
 *
 * pivot 은 *큰 좌표계에서 직각 꼭짓점의 위치*, rotation 은 SVG `rotate(deg)` 와
 * 동일하게 *화면상 시계방향 양의 각도*. 즉 월드 좌표 변환은
 *   world(p) = pivot + R(rot) · p
 *   R(θ) = [[cos θ, -sin θ], [sin θ, cos θ]]
 * (SVG y 축이 아래로 향하므로 수학의 CCW 가 화면상 CW 가 된다.)
 *
 * 사양에서 "빗변 시작점" 이라 했으나, 회전 중심을 *직각 꼭짓점* 으로 잡는 편이
 * 두 배치 사이 t-보간이 자연스럽다 — 빗변의 두 끝점이 모두 움직이는 반면
 * 직각 꼭짓점은 회전의 자연스러운 축이기 때문.
 */

/** 직각삼각형의 두 다리 길이로부터 빗변 길이. */
export function hypotenuse(a: number, b: number): number {
  return Math.sqrt(a * a + b * b);
}

export interface TriPos {
  /** 큰 정사각형 좌표계에서 직각 꼭짓점의 위치. */
  pivot: { x: number; y: number };
  /** SVG `rotate(deg)` 와 동일한 화면상 시계방향 각도(도). */
  rotation: number;
}

/** 0..1 선형 보간. */
function lerp(p: number, q: number, t: number): number {
  return p + (q - p) * t;
}

function lerpPos(p: TriPos, q: TriPos, t: number): TriPos {
  return {
    pivot: {
      x: lerp(p.pivot.x, q.pivot.x, t),
      y: lerp(p.pivot.y, q.pivot.y, t),
    },
    rotation: lerp(p.rotation, q.rotation, t),
  };
}

/**
 * t=0 ("a²+b²" 배치): 좌상단 a×a 와 우하단 b×b 의 두 정사각형이 흰 공간.
 * 네 삼각형이 우상단·좌하단 직사각형 두 개를 각각 대각선으로 채운다.
 */
export function arrangementSquares(a: number, b: number): [TriPos, TriPos, TriPos, TriPos] {
  return [
    // 우상단 직사각형의 좌하 삼각형 — 직각이 (a,0)
    { pivot: { x: a, y: 0 }, rotation: 0 },
    // 우상단 직사각형의 우상 삼각형 — 직각이 (a+b, a), 180° 회전
    { pivot: { x: a + b, y: a }, rotation: 180 },
    // 좌하단 직사각형의 우상 삼각형 — 직각이 (a, a), 90° 회전
    { pivot: { x: a, y: a }, rotation: 90 },
    // 좌하단 직사각형의 좌하 삼각형 — 직각이 (0, a+b), 270° 회전
    { pivot: { x: 0, y: a + b }, rotation: 270 },
  ];
}

/**
 * t=1 ("c²" 배치): 네 삼각형이 큰 정사각형 네 모서리를 채우고
 * 가운데에 빗변 c 짜리 *기울어진* 정사각형 한 개가 흰 공간으로 남는다.
 */
export function arrangementHypSquare(a: number, b: number): [TriPos, TriPos, TriPos, TriPos] {
  const s = a + b;
  return [
    // 좌상단 모서리 — 직각이 (0,0)
    { pivot: { x: 0, y: 0 }, rotation: 0 },
    // 우상단 모서리 — 직각이 (s, 0), 90°
    { pivot: { x: s, y: 0 }, rotation: 90 },
    // 우하단 모서리 — 직각이 (s, s), 180°
    { pivot: { x: s, y: s }, rotation: 180 },
    // 좌하단 모서리 — 직각이 (0, s), 270°
    { pivot: { x: 0, y: s }, rotation: 270 },
  ];
}

/**
 * 4개 직각삼각형의 배치 — t∈[0,1] 보간.
 * t=0 은 'a²+b²' 배치, t=1 은 'c²' 배치.
 *
 * 두 배치에서 4번째 삼각형(인덱스 3)은 *완전히 동일한 자리* — 그래서
 * 슬라이드 중에도 좌하단 삼각형은 움직이지 않는다 (의도된 시각적 닻).
 */
export function triangleArrangement(a: number, b: number, t: number): TriPos[] {
  const tt = Math.max(0, Math.min(1, t));
  const start = arrangementSquares(a, b);
  const end = arrangementHypSquare(a, b);
  return start.map((p, i) => lerpPos(p, end[i], tt));
}

/**
 * 4 삼각형이 채우지 않은 흰 공간의 면적.
 * (a+b)² - 4 · (ab/2) = (a+b)² - 2ab = a² + b² — 어느 배치든 동일.
 */
export function whiteArea(a: number, b: number): number {
  return a * a + b * b;
}

/**
 * 국소 좌표계의 삼각형 꼭짓점 — 직각이 (0,0), 다리 b 가 +x, 다리 a 가 +y.
 * UI 에서 polygon points 생성 시 사용.
 */
export function localTriangle(a: number, b: number): Array<[number, number]> {
  return [
    [0, 0], // 직각 꼭짓점
    [b, 0], // 다리 b 끝
    [0, a], // 다리 a 끝
  ];
}

/**
 * 빗변 c 정사각형의 *기울기* (도, SVG 시계방향).
 * t=1 배치에서 가운데 c×c 정사각형의 한 변 (꼭짓점 (b,0)→(a+b,b)) 이
 * x 축에 대해 atan2(b, a) 만큼 SVG 시계방향으로 기울어 있다. SVG `rotate(deg)` 에
 * 그대로 넣을 수 있도록 도 단위로 반환.
 */
export function hypSquareTiltDeg(a: number, b: number): number {
  return (Math.atan2(b, a) * 180) / Math.PI;
}
