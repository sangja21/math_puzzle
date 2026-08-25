// 4색 정리 퍼즐 — 게임 로직
// 지도 데이터, 충돌 감지, 힌트 시스템

export type Region = {
  id: string;
  name: string;
  path: string;
  neighbors: string[];
  color: number | null;
  labelX: number;
  labelY: number;
};

export type MapData = {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  regions: Region[];
  viewBox: string;
};

export type GraphEdge = {
  id: string;
  source: Region;
  target: Region;
};

// 4색 팔레트
export const COLOR_PALETTE = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b'];

export const MAP_DATA: MapData[] = [
  // ── 레벨 1: 튜토리얼 (4영역) ──
  {
    id: 'level1',
    name: '레벨 1 (튜토리얼)',
    description: '4가지 색으로 인접한 영역을 다르게 칠해보세요.',
    difficulty: 1,
    viewBox: '0 0 400 400',
    regions: [
      { id: 'r1', name: 'A', path: 'M 50 50 L 350 50 L 350 200 L 200 200 L 50 200 Z', neighbors: ['r2', 'r3', 'r4'], color: null, labelX: 200, labelY: 125 },
      { id: 'r2', name: 'B', path: 'M 50 200 L 150 200 L 150 350 L 50 350 Z', neighbors: ['r1', 'r3'], color: null, labelX: 100, labelY: 275 },
      { id: 'r3', name: 'C', path: 'M 150 200 L 250 200 L 250 350 L 150 350 Z', neighbors: ['r1', 'r2', 'r4'], color: null, labelX: 200, labelY: 275 },
      { id: 'r4', name: 'D', path: 'M 250 200 L 350 200 L 350 350 L 250 350 Z', neighbors: ['r1', 'r3'], color: null, labelX: 300, labelY: 275 },
    ]
  },
  // ── 레벨 2: 심화 (중앙 + 6영역) ──
  {
    id: 'level2',
    name: '레벨 2 (심화)',
    description: '중앙을 둘러싼 영역들을 색칠해보세요.',
    difficulty: 2,
    viewBox: '0 0 500 500',
    regions: [
      { id: 'c1', name: 'Center', path: 'M 200 200 L 300 200 L 350 250 L 300 300 L 200 300 L 150 250 Z', neighbors: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'], color: null, labelX: 250, labelY: 250 },
      { id: 'p1', name: 'P1', path: 'M 200 200 L 100 100 L 250 100 L 300 200 Z', neighbors: ['c1', 'p2', 'p6'], color: null, labelX: 210, labelY: 140 },
      { id: 'p2', name: 'P2', path: 'M 300 200 L 250 100 L 400 100 L 350 250 Z', neighbors: ['c1', 'p1', 'p3'], color: null, labelX: 310, labelY: 170 },
      { id: 'p3', name: 'P3', path: 'M 350 250 L 400 100 L 450 250 L 300 300 Z', neighbors: ['c1', 'p2', 'p4'], color: null, labelX: 380, labelY: 230 },
      { id: 'p4', name: 'P4', path: 'M 300 300 L 450 250 L 400 400 L 200 300 Z', neighbors: ['c1', 'p3', 'p5'], color: null, labelX: 340, labelY: 310 },
      { id: 'p5', name: 'P5', path: 'M 200 300 L 400 400 L 100 400 L 150 250 Z', neighbors: ['c1', 'p4', 'p6'], color: null, labelX: 220, labelY: 340 },
      { id: 'p6', name: 'P6', path: 'M 150 250 L 100 400 L 50 250 L 200 200 Z', neighbors: ['c1', 'p1', 'p5'], color: null, labelX: 130, labelY: 260 },
    ]
  },
  // ── 레벨 3: 남아메리카 ──
  {
    id: 'level3',
    name: '레벨 3 (남미)',
    description: '남아메리카 대륙의 국가들을 칠해보세요.',
    difficulty: 3,
    viewBox: '0 0 400 600',
    regions: [
      { id: 'colombia', name: '콜롬비아', path: 'M 100 100 L 160 100 L 180 150 L 140 200 L 80 160 Z', neighbors: ['venezuela', 'ecuador', 'peru', 'brazil'], color: null, labelX: 130, labelY: 140 },
      { id: 'venezuela', name: '베네수엘라', path: 'M 160 100 L 240 100 L 260 130 L 200 170 L 180 150 Z', neighbors: ['colombia', 'guyana', 'brazil'], color: null, labelX: 200, labelY: 130 },
      { id: 'guyana', name: '가이아나', path: 'M 240 100 L 280 110 L 270 140 L 240 150 L 260 130 Z', neighbors: ['venezuela', 'suriname', 'brazil'], color: null, labelX: 260, labelY: 125 },
      { id: 'suriname', name: '수리남 등', path: 'M 280 110 L 320 130 L 300 160 L 270 140 Z', neighbors: ['guyana', 'brazil'], color: null, labelX: 290, labelY: 135 },
      { id: 'ecuador', name: '에콰도르', path: 'M 80 160 L 110 180 L 100 210 L 60 190 Z', neighbors: ['colombia', 'peru'], color: null, labelX: 85, labelY: 185 },
      { id: 'peru', name: '페루', path: 'M 110 180 L 140 200 L 170 250 L 200 300 L 160 330 L 100 250 L 100 210 Z', neighbors: ['ecuador', 'colombia', 'brazil', 'bolivia', 'chile'], color: null, labelX: 140, labelY: 250 },
      { id: 'brazil', name: '브라질', path: 'M 180 150 L 200 170 L 240 150 L 270 140 L 300 160 L 350 200 L 380 250 L 320 320 L 260 330 L 230 280 L 170 250 L 140 200 Z', neighbors: ['colombia', 'venezuela', 'guyana', 'suriname', 'peru', 'bolivia', 'paraguay', 'argentina', 'uruguay'], color: null, labelX: 270, labelY: 230 },
      { id: 'bolivia', name: '볼리비아', path: 'M 170 250 L 230 280 L 250 320 L 210 350 L 180 320 Z', neighbors: ['peru', 'brazil', 'paraguay', 'argentina', 'chile'], color: null, labelX: 210, labelY: 300 },
      { id: 'paraguay', name: '파라과이', path: 'M 230 280 L 260 330 L 250 360 L 220 340 L 250 320 Z', neighbors: ['bolivia', 'brazil', 'argentina'], color: null, labelX: 245, labelY: 325 },
      { id: 'chile', name: '칠레', path: 'M 160 330 L 180 320 L 180 380 L 160 450 L 130 520 L 120 500 L 140 400 Z', neighbors: ['peru', 'bolivia', 'argentina'], color: null, labelX: 150, labelY: 420 },
      { id: 'argentina', name: '아르헨티나', path: 'M 180 320 L 210 350 L 220 340 L 250 360 L 280 400 L 260 450 L 200 550 L 150 550 L 130 520 L 160 450 L 180 380 Z', neighbors: ['chile', 'bolivia', 'paraguay', 'brazil', 'uruguay'], color: null, labelX: 200, labelY: 430 },
      { id: 'uruguay', name: '우루과이', path: 'M 260 330 L 320 320 L 300 370 L 270 380 Z', neighbors: ['brazil', 'argentina'], color: null, labelX: 290, labelY: 350 }
    ]
  },
  // ── 레벨 4: 유럽 ──
  {
    id: 'level4',
    name: '레벨 4 (유럽)',
    description: '서유럽과 중부유럽의 국가들을 색칠해보세요.',
    difficulty: 4,
    viewBox: '0 0 600 600',
    regions: [
      { id: 'portugal', name: '포르투갈', path: 'M 50 450 L 80 450 L 90 500 L 60 520 Z', neighbors: ['spain'], color: null, labelX: 70, labelY: 480 },
      { id: 'spain', name: '스페인', path: 'M 80 450 L 180 420 L 200 480 L 150 550 L 60 520 L 90 500 Z', neighbors: ['portugal', 'france'], color: null, labelX: 140, labelY: 480 },
      { id: 'france', name: '프랑스', path: 'M 180 420 L 250 350 L 320 380 L 330 450 L 280 480 L 200 480 Z', neighbors: ['spain', 'italy', 'switzerland', 'germany', 'belgium'], color: null, labelX: 250, labelY: 420 },
      { id: 'italy', name: '이탈리아', path: 'M 280 480 L 330 450 L 380 480 L 420 550 L 380 580 L 340 520 Z', neighbors: ['france', 'switzerland', 'austria'], color: null, labelX: 360, labelY: 510 },
      { id: 'switzerland', name: '스위스', path: 'M 320 380 L 360 380 L 380 420 L 330 450 Z', neighbors: ['france', 'germany', 'austria', 'italy'], color: null, labelX: 345, labelY: 410 },
      { id: 'belgium', name: '벨기에', path: 'M 250 350 L 280 310 L 310 320 L 290 360 Z', neighbors: ['france', 'germany', 'netherlands'], color: null, labelX: 280, labelY: 335 },
      { id: 'netherlands', name: '네덜란드', path: 'M 280 310 L 300 270 L 330 280 L 310 320 Z', neighbors: ['belgium', 'germany'], color: null, labelX: 310, labelY: 295 },
      { id: 'germany', name: '독일', path: 'M 290 360 L 310 320 L 330 280 L 380 280 L 420 330 L 400 390 L 360 380 Z', neighbors: ['france', 'belgium', 'netherlands', 'denmark', 'poland', 'czech', 'austria', 'switzerland'], color: null, labelX: 350, labelY: 330 },
      { id: 'denmark', name: '덴마크', path: 'M 330 280 L 340 230 L 370 230 L 380 280 Z', neighbors: ['germany'], color: null, labelX: 355, labelY: 255 },
      { id: 'austria', name: '오스트리아', path: 'M 360 380 L 400 390 L 440 420 L 420 460 L 380 420 Z', neighbors: ['germany', 'czech', 'hungary', 'italy', 'switzerland'], color: null, labelX: 400, labelY: 420 },
      { id: 'czech', name: '체코', path: 'M 400 390 L 420 330 L 460 350 L 440 420 Z', neighbors: ['germany', 'poland', 'austria'], color: null, labelX: 430, labelY: 370 },
      { id: 'poland', name: '폴란드', path: 'M 420 330 L 400 260 L 480 250 L 520 300 L 460 350 Z', neighbors: ['germany', 'czech'], color: null, labelX: 460, labelY: 300 },
      { id: 'hungary', name: '헝가리', path: 'M 440 420 L 480 400 L 520 420 L 500 470 L 420 460 Z', neighbors: ['austria', 'romania'], color: null, labelX: 470, labelY: 440 },
      { id: 'romania', name: '루마니아', path: 'M 520 420 L 580 400 L 600 480 L 540 520 L 500 470 Z', neighbors: ['hungary'], color: null, labelX: 550, labelY: 450 },
      { id: 'uk', name: '영국', path: 'M 180 250 L 220 180 L 260 220 L 250 300 L 200 320 Z', neighbors: ['ireland'], color: null, labelX: 220, labelY: 250 },
      { id: 'ireland', name: '아일랜드', path: 'M 140 240 L 170 200 L 190 240 L 160 280 Z', neighbors: ['uk'], color: null, labelX: 165, labelY: 240 },
      { id: 'sweden', name: '스웨덴', path: 'M 370 200 L 400 100 L 460 120 L 420 220 Z', neighbors: ['norway'], color: null, labelX: 410, labelY: 160 },
      { id: 'norway', name: '노르웨이', path: 'M 350 200 L 370 80 L 400 100 L 370 200 Z', neighbors: ['sweden'], color: null, labelX: 375, labelY: 140 }
    ]
  },
  // ── 레벨 5: 대한민국 행정구역 ──
  {
    id: 'level5',
    name: '레벨 5 (대한민국)',
    description: '우리나라의 17개 행정구역을 칠해보세요.',
    difficulty: 5,
    viewBox: '0 0 500 700',
    regions: [
      { id: 'seoul', name: '서울', path: 'M 170 170 L 190 160 L 210 180 L 190 200 Z', neighbors: ['gyeonggi', 'incheon'], color: null, labelX: 190, labelY: 180 },
      { id: 'incheon', name: '인천', path: 'M 140 160 L 170 170 L 190 200 L 160 210 Z', neighbors: ['gyeonggi', 'seoul'], color: null, labelX: 160, labelY: 185 },
      { id: 'gyeonggi', name: '경기', path: 'M 150 120 L 230 100 L 260 150 L 230 230 L 140 230 L 120 180 L 140 160 L 160 210 L 190 200 L 210 180 L 190 160 L 170 170 Z', neighbors: ['seoul', 'incheon', 'gangwon', 'chungnam', 'chungbuk'], color: null, labelX: 200, labelY: 135 },
      { id: 'gangwon', name: '강원', path: 'M 230 100 L 350 80 L 400 150 L 350 250 L 280 230 L 260 150 Z', neighbors: ['gyeonggi', 'chungbuk', 'gyeongbuk'], color: null, labelX: 320, labelY: 160 },
      { id: 'chungbuk', name: '충북', path: 'M 230 230 L 280 230 L 350 250 L 320 330 L 250 320 L 240 270 Z', neighbors: ['gyeonggi', 'gangwon', 'gyeongbuk', 'chungnam', 'sejong', 'daejeon', 'jeonbuk'], color: null, labelX: 285, labelY: 275 },
      { id: 'chungnam', name: '충남', path: 'M 140 230 L 230 230 L 240 270 L 200 310 L 150 340 L 120 280 Z', neighbors: ['gyeonggi', 'chungbuk', 'sejong', 'daejeon', 'jeonbuk'], color: null, labelX: 170, labelY: 280 },
      { id: 'sejong', name: '세종', path: 'M 210 270 L 230 260 L 240 280 L 220 290 Z', neighbors: ['chungnam', 'chungbuk', 'daejeon'], color: null, labelX: 225, labelY: 275 },
      { id: 'daejeon', name: '대전', path: 'M 220 290 L 240 280 L 250 300 L 230 310 Z', neighbors: ['sejong', 'chungnam', 'chungbuk'], color: null, labelX: 235, labelY: 295 },
      { id: 'jeonbuk', name: '전북', path: 'M 150 340 L 200 310 L 250 320 L 280 380 L 220 420 L 130 390 Z', neighbors: ['chungnam', 'chungbuk', 'gyeongbuk', 'gyeongnam', 'jeonnam'], color: null, labelX: 210, labelY: 370 },
      { id: 'jeonnam', name: '전남', path: 'M 130 390 L 220 420 L 250 470 L 220 540 L 100 500 Z', neighbors: ['jeonbuk', 'gyeongnam', 'gwangju'], color: null, labelX: 170, labelY: 460 },
      { id: 'gwangju', name: '광주', path: 'M 170 430 L 190 420 L 200 440 L 180 450 Z', neighbors: ['jeonnam'], color: null, labelX: 185, labelY: 435 },
      { id: 'gyeongbuk', name: '경북', path: 'M 350 250 L 420 300 L 430 400 L 360 420 L 280 380 L 250 320 L 320 330 Z', neighbors: ['gangwon', 'chungbuk', 'jeonbuk', 'gyeongnam', 'daegu', 'ulsan'], color: null, labelX: 350, labelY: 340 },
      { id: 'daegu', name: '대구', path: 'M 340 370 L 370 360 L 380 390 L 350 400 Z', neighbors: ['gyeongbuk', 'gyeongnam'], color: null, labelX: 360, labelY: 380 },
      { id: 'gyeongnam', name: '경남', path: 'M 280 380 L 360 420 L 370 480 L 300 530 L 250 470 L 220 420 Z', neighbors: ['jeonbuk', 'jeonnam', 'gyeongbuk', 'daegu', 'ulsan', 'busan'], color: null, labelX: 290, labelY: 450 },
      { id: 'ulsan', name: '울산', path: 'M 390 410 L 420 400 L 440 430 L 410 450 Z', neighbors: ['gyeongbuk', 'gyeongnam', 'busan'], color: null, labelX: 415, labelY: 420 },
      { id: 'busan', name: '부산', path: 'M 370 450 L 410 450 L 420 480 L 380 500 Z', neighbors: ['gyeongnam', 'ulsan'], color: null, labelX: 395, labelY: 470 },
      { id: 'jeju', name: '제주', path: 'M 120 600 L 180 580 L 200 620 L 140 640 Z', neighbors: [], color: null, labelX: 160, labelY: 610 }
    ]
  }
];

/** 영역 간 연결 간선(Edge) 목록 반환 (쌍대 그래프용) */
export function getMapEdges(regions: Region[]): GraphEdge[] {
  const edges: GraphEdge[] = [];
  const checked = new Set<string>();

  for (const region of regions) {
    for (const neighborId of region.neighbors) {
      const neighbor = regions.find((r) => r.id === neighborId);
      if (neighbor) {
        const pairId = [region.id, neighborId].sort().join('-');
        if (!checked.has(pairId)) {
          checked.add(pairId);
          edges.push({
            id: pairId,
            source: region,
            target: neighbor,
          });
        }
      }
    }
  }

  return edges;
}

/** 같은 색으로 칠해진 인접 영역 쌍을 반환 */
export function getConflicts(regions: Region[]): [string, string][] {
  const conflicts: [string, string][] = [];
  const checked = new Set<string>();

  for (const region of regions) {
    if (region.color === null) continue;
    
    for (const neighborId of region.neighbors) {
      const neighbor = regions.find(r => r.id === neighborId);
      if (neighbor && neighbor.color === region.color) {
        const pairId = [region.id, neighborId].sort().join('-');
        if (!checked.has(pairId)) {
          conflicts.push([region.id, neighborId]);
          checked.add(pairId);
        }
      }
    }
  }

  return conflicts;
}

/** 모든 영역이 칠해졌고 충돌이 없는지 확인 */
export function isComplete(regions: Region[]): boolean {
  const allColored = regions.every(r => r.color !== null);
  if (!allColored) return false;
  return getConflicts(regions).length === 0;
}

/** 사용된 색의 수 */
export function getUsedColorCount(regions: Region[]): number {
  const colors = new Set<number>();
  for (const region of regions) {
    if (region.color !== null) {
      colors.add(region.color);
    }
  }
  return colors.size;
}

/** 3색으로 칠할 수 있는지 백트래킹으로 확인 */
export function canColorWith3(mapData: MapData): boolean {
  const regions = mapData.regions;
  const colors = new Array(regions.length).fill(null);
  
  const solve = (idx: number): boolean => {
    if (idx === regions.length) return true;
    
    for (let c = 0; c < 3; c++) {
      let canUse = true;
      for (const neighborId of regions[idx].neighbors) {
        const nIdx = regions.findIndex(r => r.id === neighborId);
        if (nIdx < idx && colors[nIdx] === c) {
          canUse = false;
          break;
        }
      }
      
      if (canUse) {
        colors[idx] = c;
        if (solve(idx + 1)) return true;
        colors[idx] = null;
      }
    }
    
    return false;
  };
  
  return solve(0);
}

/** 그리디 방식으로 힌트를 제공 — 이웃이 가장 많이 칠해진 영역부터 */
export function getHint(regions: Region[]): { regionId: string, suggestedColor: number } | null {
  const uncolored = regions.filter(r => r.color === null);
  if (uncolored.length === 0) return null;
  
  let targetRegion = uncolored[0];
  let maxColoredNeighbors = -1;
  
  for (const region of uncolored) {
    const coloredNeighbors = region.neighbors.filter(nId => {
      const neighbor = regions.find(r => r.id === nId);
      return neighbor && neighbor.color !== null;
    }).length;
    
    if (coloredNeighbors > maxColoredNeighbors) {
      maxColoredNeighbors = coloredNeighbors;
      targetRegion = region;
    }
  }
  
  const neighborColors = new Set<number>();
  for (const nId of targetRegion.neighbors) {
    const neighbor = regions.find(r => r.id === nId);
    if (neighbor && neighbor.color !== null) {
      neighborColors.add(neighbor.color);
    }
  }
  
  for (let i = 0; i < 4; i++) {
    if (!neighborColors.has(i)) {
      return { regionId: targetRegion.id, suggestedColor: i };
    }
  }
  
  return null;
}
