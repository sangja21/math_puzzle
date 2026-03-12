export interface Person {
  name: string;
  statementStr: string;
  evaluate: ((env: Record<string, boolean>) => boolean) | null;
}

export interface TruthTablePuzzleDef {
  id: string;
  title: string;
  desc: string;
  people: Person[];
}

export const truthTablePuzzles: TruthTablePuzzleDef[] = [
  {
    id: 'tt-1',
    title: '레벨 1: 쌍둥이의 비밀',
    desc: '두 쌍둥이 A와 B가 있습니다. A의 말을 듣고 진접표(Truth Table)를 채워 누가 거짓말을 하는지 찾아내세요.',
    people: [
      {
        name: 'A',
        statementStr: 'A: "우리 중 적어도 한 명은 거짓말쟁이입니다."',
        evaluate: (env) => (!env['A'] || !env['B'])
      },
      {
        name: 'B',
        statementStr: 'B: (아무 말도 하지 않음)',
        evaluate: null
      }
    ]
  },
  {
    id: 'tt-2',
    title: '레벨 2: 세 명의 용의자',
    desc: '세 명의 용의자 중 누가 진실을 말하는지 진리표를 통해 분석하세요.',
    people: [
      {
        name: 'A',
        statementStr: 'A: "B는 거짓말을 하고 있다."',
        evaluate: (env) => !env['B']
      },
      {
        name: 'B',
        statementStr: 'B: "C는 거짓말을 하고 있다."',
        evaluate: (env) => !env['C']
      },
      {
        name: 'C',
        statementStr: 'C: "A와 B 중 정확히 한 명만 진실을 말한다."',
        evaluate: (env) => (env['A'] && !env['B']) || (!env['A'] && env['B'])
      }
    ]
  },
  {
    id: 'tt-3',
    title: '레벨 3: 침묵의 방',
    desc: '난이도 높은 문제입니다. 세 사람의 진술이 논리적으로 성립하는 유일한 경우를 찾으세요.',
    people: [
      {
        name: 'A',
        statementStr: 'A: "우리 셋 모두 거짓말쟁이다."',
        evaluate: (env) => !env['A'] && !env['B'] && !env['C']
      },
      {
        name: 'B',
        statementStr: 'B: "우리 중 오직 한 명만 진실을 말한다."',
        evaluate: (env) => {
          let trueCount = 0;
          if (env['A']) trueCount++;
          if (env['B']) trueCount++;
          if (env['C']) trueCount++;
          return trueCount === 1;
        }
      },
      {
        name: 'C',
        statementStr: 'C: (아무 말도 하지 않음)',
        evaluate: null
      }
    ]
  }
];
