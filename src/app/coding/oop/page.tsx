'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

// ─── Types ────────────────────────────────────────────────────────
type PieceType = 'king' | 'knight' | 'bishop' | 'rook' | 'queen';
type PieceColor = 'white' | 'black';
type Phase = 'object' | 'class' | 'inherit';

interface PieceDef {
  type: PieceType;
  glyph: string;
  name: string;
  moveDesc: string;
  attrs: { key: string; value: string }[];
  getMoves: (row: number, col: number, size: number) => [number, number][];
}

interface Instance {
  id: number;
  type: PieceType;
  color: PieceColor;
  glyph: string;
  name: string;
}

// ─── Board helpers ─────────────────────────────────────────────────
function inBounds(r: number, c: number, size: number) {
  return r >= 0 && r < size && c >= 0 && c < size;
}

function slideMoves(row: number, col: number, size: number, dirs: [number, number][]) {
  const moves: [number, number][] = [];
  for (const [dr, dc] of dirs) {
    let r = row + dr, c = col + dc;
    while (inBounds(r, c, size)) {
      moves.push([r, c]);
      r += dr; c += dc;
    }
  }
  return moves;
}

// ─── Piece definitions ─────────────────────────────────────────────
const PIECES: Record<PieceType, PieceDef> = {
  king: {
    type: 'king', glyph: '♚', name: '킹',
    moveDesc: '인접 8방향 1칸',
    attrs: [
      { key: 'name', value: '"킹"' },
      { key: 'color', value: '"white"' },
      { key: 'position', value: '"c3"' },
      { key: 'move()', value: '8방향 1칸' },
    ],
    getMoves: (r, c, sz) => {
      const offsets: [number, number][] = [
        [-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1],
      ];
      return offsets.filter(([dr,dc]) => inBounds(r+dr, c+dc, sz)).map(([dr,dc]) => [r+dr, c+dc]);
    },
  },
  knight: {
    type: 'knight', glyph: '♞', name: '나이트',
    moveDesc: 'L자 이동 (2+1칸)',
    attrs: [
      { key: 'name', value: '"나이트"' },
      { key: 'color', value: '"white"' },
      { key: 'position', value: '"c3"' },
      { key: 'move()', value: 'L자 이동' },
    ],
    getMoves: (r, c, sz) => {
      const offsets: [number, number][] = [
        [-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1],
      ];
      return offsets.filter(([dr,dc]) => inBounds(r+dr, c+dc, sz)).map(([dr,dc]) => [r+dr, c+dc]);
    },
  },
  bishop: {
    type: 'bishop', glyph: '♝', name: '비숍',
    moveDesc: '대각선 무제한',
    attrs: [
      { key: 'name', value: '"비숍"' },
      { key: 'color', value: '"white"' },
      { key: 'position', value: '"c3"' },
      { key: 'move()', value: '대각선 이동' },
    ],
    getMoves: (r, c, sz) => slideMoves(r, c, sz, [[-1,-1],[-1,1],[1,-1],[1,1]]),
  },
  rook: {
    type: 'rook', glyph: '♜', name: '룩',
    moveDesc: '직선 무제한 (상하좌우)',
    attrs: [
      { key: 'name', value: '"룩"' },
      { key: 'color', value: '"white"' },
      { key: 'position', value: '"c3"' },
      { key: 'move()', value: '직선 이동' },
    ],
    getMoves: (r, c, sz) => slideMoves(r, c, sz, [[-1,0],[1,0],[0,-1],[0,1]]),
  },
  queen: {
    type: 'queen', glyph: '♛', name: '퀸',
    moveDesc: '직선 + 대각선 무제한',
    attrs: [
      { key: 'name', value: '"퀸"' },
      { key: 'color', value: '"white"' },
      { key: 'position', value: '"c3"' },
      { key: 'move()', value: '직선 + 대각선' },
    ],
    getMoves: (r, c, sz) => slideMoves(r, c, sz, [
      [-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1],
    ]),
  },
};

const PIECE_ORDER: PieceType[] = ['king','knight','bishop','rook','queen'];

const WHITE_GLYPHS: Record<PieceType, string> = {
  king:'♔', knight:'♘', bishop:'♗', rook:'♖', queen:'♕',
};
const BLACK_GLYPHS: Record<PieceType, string> = {
  king:'♚', knight:'♞', bishop:'♝', rook:'♜', queen:'♛',
};

// ─── Mini Board ────────────────────────────────────────────────────
const BOARD_SIZE = 5;
const PIECE_ROW = 2, PIECE_COL = 2;

function MiniBoard({ moves, glyph }: { moves: [number,number][]; glyph: string }) {
  const moveSet = new Set(moves.map(([r,c]) => `${r},${c}`));
  return (
    <div className={styles.board}>
      {Array.from({ length: BOARD_SIZE }, (_, r) =>
        Array.from({ length: BOARD_SIZE }, (_, c) => {
          const isLight = (r + c) % 2 === 0;
          const isPiece = r === PIECE_ROW && c === PIECE_COL;
          const isMove = moveSet.has(`${r},${c}`);
          let cls = isLight ? styles.cellLight : styles.cellDark;
          if (isPiece) cls = styles.cellPiece;
          else if (isMove) cls = styles.cellHighlight;
          return (
            <div key={`${r},${c}`} className={`${styles.cell} ${cls}`}>
              {isPiece ? glyph : isMove ? '·' : ''}
            </div>
          );
        })
      )}
    </div>
  );
}

// ─── Tab 1: Object ────────────────────────────────────────────────
function ObjectTab() {
  const [selected, setSelected] = useState<PieceType>('knight');
  const piece = PIECES[selected];
  const moves = piece.getMoves(PIECE_ROW, PIECE_COL, BOARD_SIZE);

  return (
    <div className={styles.mainContent}>
      {/* Left: explain */}
      <div className={styles.panel}>
        <h3 className={styles.panelTitle}>♟ 기물 하나 = 하나의 객체</h3>
        <p style={{ color: '#475569', lineHeight: 1.65, fontSize: '0.9rem', margin: 0 }}>
          체스 기물은 <strong>속성(Attribute)</strong>과 <strong>동작(Method)</strong>을 가진
          하나의 객체(Object)예요. 기물을 클릭해서 확인해보세요!
        </p>

        <div className={styles.conceptBox}>
          {piece.attrs.map((a) => (
            <div key={a.key} className={styles.conceptRow}>
              <span className={styles.conceptLabel}>{a.key}</span>
              <span className={styles.conceptValue}>{a.value}</span>
            </div>
          ))}
        </div>

        <div className={styles.codeBlock}>
<span className={styles.cmt}># 객체 (Object)</span>{'\n'}
<span className={styles.cls}>{piece.name.toLowerCase()}</span> = {'{'}
{piece.attrs.map((a, i) => (
  '\n  ' + a.key.replace('()', '') + ': ' + a.value + (i < piece.attrs.length - 1 ? ',' : '')
)).join('')}
{'\n}'}
        </div>

        <div style={{ marginTop: 16, padding: '10px 14px', background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}>
          <span style={{ fontSize: '0.82rem', color: '#15803d', fontWeight: 600 }}>
            💡 속성(Attribute): 기물의 특징 (이름, 색, 위치)<br />
            💡 메서드(Method): 기물의 동작 — move()는 기물마다 달라요!
          </span>
        </div>
      </div>

      {/* Right: interactive */}
      <div className={styles.panel}>
        <h3 className={styles.panelTitle}>기물을 선택해보세요</h3>
        <div className={styles.pieceCards}>
          {PIECE_ORDER.map((pt) => (
            <div
              key={pt}
              className={`${styles.pieceCard} ${selected === pt ? styles.pieceCardActive : ''}`}
              onClick={() => setSelected(pt)}
            >
              <span className={styles.pieceGlyph}>{PIECES[pt].glyph}</span>
              <span className={styles.pieceName}>{PIECES[pt].name}</span>
            </div>
          ))}
        </div>

        <div className={styles.boardWrap} style={{ marginTop: 20 }}>
          <MiniBoard moves={moves} glyph={piece.glyph} />
          <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
            파란 칸 = <strong>{piece.name}</strong>의 이동 가능 칸 | move() = {piece.moveDesc}
          </span>
        </div>

        <div style={{ marginTop: 16, background: '#fffbeb', borderRadius: 10, padding: '10px 14px', border: '1px solid #fde68a' }}>
          <span style={{ fontSize: '0.82rem', color: '#92400e', fontWeight: 600 }}>
            ✨ 모든 기물은 같은 속성 구조를 가지지만<br />
            move()의 실제 동작은 기물마다 달라요!
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Tab 2: Class & Instance ──────────────────────────────────────
let idCounter = 1;

function ClassTab() {
  const [selType, setSelType] = useState<PieceType>('knight');
  const [selColor, setSelColor] = useState<PieceColor>('white');
  const [instances, setInstances] = useState<Instance[]>([]);

  const glyph = selColor === 'white' ? WHITE_GLYPHS[selType] : BLACK_GLYPHS[selType];

  const create = () => {
    if (instances.length >= 4) return;
    setInstances((prev) => [
      ...prev,
      { id: idCounter++, type: selType, color: selColor, glyph, name: PIECES[selType].name },
    ]);
  };

  const remove = (id: number) => setInstances((prev) => prev.filter((i) => i.id !== id));

  return (
    <div className={styles.builderGrid}>
      {/* Blueprint (Class) */}
      <div className={styles.blueprint}>
        <p className={styles.blueprintTitle}>⚙️ ChessPiece 클래스 설계도</p>
        <p className={styles.blueprintLabel}>← 이건 틀(설계도)이에요</p>

        <div className={styles.formRow}>
          <span className={styles.formLabel}>기물 종류</span>
          <select
            className={styles.formSelect}
            value={selType}
            onChange={(e) => setSelType(e.target.value as PieceType)}
          >
            {PIECE_ORDER.map((pt) => (
              <option key={pt} value={pt}>{PIECES[pt].glyph} {PIECES[pt].name}</option>
            ))}
          </select>
        </div>

        <div className={styles.formRow}>
          <span className={styles.formLabel}>색깔</span>
          <div className={styles.colorRow} style={{ flex: 1 }}>
            <button
              className={`${styles.colorBtn} ${selColor === 'white' ? styles.colorBtnActive : ''}`}
              onClick={() => setSelColor('white')}
            >⬜ 흰색</button>
            <button
              className={`${styles.colorBtn} ${selColor === 'black' ? styles.colorBtnActive : ''}`}
              onClick={() => setSelColor('black')}
            >⬛ 검정</button>
          </div>
        </div>

        <div style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 9, border: '1px solid #e2e8f0', textAlign: 'center' }}>
          <span style={{ fontSize: '2rem' }}>{glyph}</span>
          <span style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginTop: 4 }}>
            미리보기: {selColor === 'white' ? '흰색' : '검정'} {PIECES[selType].name}
          </span>
        </div>

        <div className={styles.codeBlock} style={{ fontSize: '0.78rem' }}>
<span className={styles.kw}>class</span> <span className={styles.cls}>ChessPiece</span>:{'\n'}
{'  '}<span className={styles.fn}>def</span> <span className={styles.fn}>__init__</span>(name, color):{'\n'}
{'    '}self.name = <span className={styles.str}>"{PIECES[selType].name}"</span>{'\n'}
{'    '}self.color = <span className={styles.str}>"{selColor === 'white' ? '흰색' : '검정'}"</span>{'\n'}
{'    '}self.move = <span className={styles.str}>"{PIECES[selType].attrs[3].value}"</span>
        </div>

        <button
          className={styles.createBtn}
          onClick={create}
          disabled={instances.length >= 4}
        >
          🏭 기물 만들기 ({instances.length}/4)
        </button>
      </div>

      {/* Instances */}
      <div className={styles.instancesPanel}>
        <h3 className={styles.panelTitle}>생성된 인스턴스</h3>
        {instances.length === 0 && (
          <div className={styles.emptySlot}>
            아직 만들어진 기물이 없어요.<br />왼쪽에서 기물을 만들어보세요!
          </div>
        )}
        {instances.map((inst) => (
          <div key={inst.id} className={styles.instanceCard}>
            <span className={styles.instanceGlyph}>{inst.glyph}</span>
            <div className={styles.instanceInfo}>
              <div className={styles.instanceName}>
                {inst.color === 'white' ? '흰색' : '검정'} {inst.name}
              </div>
              <div className={styles.instanceAttrs}>
                type: {inst.type} · color: {inst.color} · move: {PIECES[inst.type].moveDesc}
              </div>
            </div>
            <button className={styles.instanceRemove} onClick={() => remove(inst.id)}>✕</button>
          </div>
        ))}
        {instances.length > 0 && (
          <div style={{ marginTop: 8, padding: '10px 14px', background: '#eff6ff', borderRadius: 10, border: '1px solid #bfdbfe' }}>
            <span style={{ fontSize: '0.8rem', color: '#1d4ed8', fontWeight: 600 }}>
              💡 같은 클래스(설계도)로 서로 다른 기물(인스턴스)을 {instances.length}개 만들었어요!
              <br />마치 붕어빵 틀로 다양한 붕어빵을 찍어내는 것처럼요!
            </span>
          </div>
        )}
        {Array.from({ length: Math.max(0, 2 - instances.length) }, (_, i) => (
          <div key={`empty-${i}`} className={styles.emptySlot}>빈 슬롯</div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab 3: Inheritance + Abstraction ────────────────────────────
type ChildType = 'rook' | 'bishop' | 'queen';

const PARENT_ATTRS = [
  { key: 'name', desc: '기물 이름', id: 'name' },
  { key: 'color', desc: '기물 색깔', id: 'color' },
  { key: 'position', desc: '현재 위치', id: 'position' },
  { key: 'capture()', desc: '상대 기물 잡기', id: 'capture', isMethod: true },
  { key: 'move() ???', desc: '이동 방식 — 자식이 구현!', id: 'move', isAbstract: true },
];

const CHILDREN: Record<ChildType, {
  glyph: string; name: string; extra: { key: string; desc: string; id: string }[];
}> = {
  rook: {
    glyph: '♜', name: 'Rook (룩)',
    extra: [{ key: 'move()', desc: '직선 이동 ↑↓←→', id: 'move_impl' }],
  },
  bishop: {
    glyph: '♝', name: 'Bishop (비숍)',
    extra: [{ key: 'move()', desc: '대각선 이동 ↗↘', id: 'move_impl' }],
  },
  queen: {
    glyph: '♛', name: 'Queen (퀸)',
    extra: [
      { key: 'move()', desc: '직선 + 대각선', id: 'move_impl' },
    ],
  },
};

const CHILD_ORDER: ChildType[] = ['rook', 'bishop', 'queen'];

function InheritTab() {
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const [activeChild, setActiveChild] = useState<ChildType>('queen');

  const childMoves = PIECES[activeChild].getMoves(PIECE_ROW, PIECE_COL, BOARD_SIZE);
  const childGlyph = PIECES[activeChild].glyph;

  return (
    <div style={{ width: '100%', maxWidth: 980, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div className={styles.treeLayout}>
        {/* Parent: Abstract ChessPiece */}
        <div className={styles.classCard} style={{ borderStyle: 'dashed', borderColor: '#94a3b8', background: '#f8fafc', maxWidth: 260 }}>
          <div className={styles.classCardHeader}>
            <span className={styles.classGlyph}>♟</span>
            <span className={styles.classCardName}>ChessPiece</span>
            <span className={styles.abstractBadge}>추상 클래스</span>
          </div>
          <div className={styles.attrList}>
            {PARENT_ATTRS.map((a) => (
              <div
                key={a.id}
                className={`${styles.attrItem} ${a.isAbstract ? styles.attrItemAbstract : ''} ${highlighted === a.id ? styles.attrItemHighlighted : ''}`}
                onClick={() => setHighlighted(highlighted === a.id ? null : a.id)}
              >
                <span className={styles.attrKey}>{a.key}</span>
                <span className={styles.attrVal}>{a.isAbstract ? '??? 자식이 채워야 함' : a.desc}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center' }}>
            ⚠️ 혼자서는 기물을 만들 수 없어요
          </div>
        </div>

        {/* Connector */}
        <div className={styles.treeConnector} />

        {/* Children row */}
        <div className={styles.childrenRow}>
          {CHILD_ORDER.map((ct) => {
            const child = CHILDREN[ct];
            const isActive = activeChild === ct;
            return (
              <div
                key={ct}
                className={`${styles.classCard} ${styles.classCardChild} ${isActive ? styles.classCardChildActive : ''}`}
                onClick={() => setActiveChild(ct)}
              >
                <div className={styles.classCardHeader}>
                  <span className={styles.classGlyph}>{child.glyph}</span>
                  <span className={styles.classCardName}>{child.name}</span>
                </div>
                <div className={styles.attrList}>
                  {/* Inherited attrs */}
                  {PARENT_ATTRS.filter(a => !a.isAbstract).map((a) => (
                    <div
                      key={a.id}
                      className={`${styles.attrItem} ${styles.attrItemInherited} ${highlighted === a.id ? styles.attrItemHighlighted : ''}`}
                    >
                      <span className={styles.attrKey}>{a.key}</span>
                      <span className={styles.attrInheritedTag}>상속</span>
                    </div>
                  ))}
                  {/* Own methods */}
                  {child.extra.map((e) => (
                    <div key={e.id} className={`${styles.attrItem}`} style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
                      <span className={styles.attrKey} style={{ color: '#15803d' }}>{e.key}</span>
                      <span style={{ fontSize: '0.7rem', color: '#15803d', marginLeft: 'auto' }}>{e.desc}</span>
                      <span className={styles.attrNewTag}>고유</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Board + highlight explanation */}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
        <div className={styles.panel} style={{ maxWidth: 300 }}>
          <h3 className={styles.panelTitle}>선택한 기물의 move()</h3>
          <div className={styles.boardWrap}>
            <MiniBoard moves={childMoves} glyph={childGlyph} />
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {CHILDREN[activeChild].name} — {PIECES[activeChild].moveDesc}
            </span>
          </div>
        </div>

        <div className={styles.panel} style={{ maxWidth: 400, flex: 1 }}>
          <h3 className={styles.panelTitle}>핵심 개념 정리</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.875rem', color: '#475569', lineHeight: 1.65 }}>
            <div style={{ background: '#eff6ff', borderRadius: 10, padding: '10px 14px', border: '1px solid #bfdbfe' }}>
              <strong style={{ color: '#1d4ed8' }}>상속(Inheritance)</strong><br />
              Rook, Bishop, Queen은 ChessPiece의 name, color, capture()를 물려받아요.
              중복 없이 공통 부분을 한 곳에서 관리할 수 있어요!
            </div>
            <div style={{ background: '#fefce8', borderRadius: 10, padding: '10px 14px', border: '1px solid #fef08a' }}>
              <strong style={{ color: '#a16207' }}>추상화(Abstraction)</strong><br />
              부모의 move()는 <em>"이동한다"</em>는 개념만 정의해요. 실제 어떻게 이동하는지는
              각 자식이 직접 구현해요. 같은 이름, 다른 동작!
            </div>
            <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '10px 14px', border: '1px solid #bbf7d0' }}>
              <strong style={{ color: '#15803d' }}>퀸이 가장 강한 이유?</strong><br />
              퀸은 룩의 직선 이동과 비숍의 대각선 이동을 <em>모두</em> 구현했기 때문이에요!
            </div>
          </div>

          <div className={styles.codeBlock} style={{ fontSize: '0.78rem', marginTop: 16 }}>
<span className={styles.kw}>class</span> <span className={styles.cls}>ChessPiece</span>:{'\n'}
{'  '}name, color, position{'\n'}
{'  '}<span className={styles.fn}>def</span> capture(): ...  <span className={styles.cmt}># 공통 구현</span>{'\n'}
{'  '}<span className={styles.fn}>def</span> move(): <span className={styles.str}>???</span>     <span className={styles.cmt}># 추상 메서드</span>{'\n\n'}
<span className={styles.kw}>class</span> <span className={styles.cls}>Rook</span>(<span className={styles.cls}>ChessPiece</span>):{'\n'}
{'  '}<span className={styles.fn}>def</span> move(): 직선 이동{'\n\n'}
<span className={styles.kw}>class</span> <span className={styles.cls}>Bishop</span>(<span className={styles.cls}>ChessPiece</span>):{'\n'}
{'  '}<span className={styles.fn}>def</span> move(): 대각선 이동{'\n\n'}
<span className={styles.kw}>class</span> <span className={styles.cls}>Queen</span>(<span className={styles.cls}>ChessPiece</span>):{'\n'}
{'  '}<span className={styles.fn}>def</span> move(): 직선 + 대각선
          </div>
        </div>
      </div>

      {highlighted && (
        <div style={{ padding: '10px 16px', background: '#fffbeb', borderRadius: 10, border: '1px solid #fde68a', textAlign: 'center', fontSize: '0.85rem', color: '#92400e', fontWeight: 600 }}>
          ✨ <strong>{PARENT_ATTRS.find(a => a.id === highlighted)?.key}</strong> 속성이 자식 클래스에도 하이라이트됐어요 — 상속받은 속성이에요!
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────
export default function OopPage() {
  const [phase, setPhase] = useState<Phase>('object');

  const tabs: { id: Phase; label: string }[] = [
    { id: 'object', label: '🎮 객체란?' },
    { id: 'class', label: '🏭 클래스와 인스턴스' },
    { id: 'inherit', label: '🧬 상속과 추상화' },
  ];

  return (
    <div className={styles.container} style={{ position: 'relative' }}>
      <Link href="/coding" className={styles.backButton}>← 코딩의 원리</Link>

      <div className={styles.header}>
        <h1 className={styles.title}>♟ 객체지향 프로그래밍</h1>
        <p className={styles.subtitle}>
          체스 기물로 배우는 OOP — 속성, 메서드, 클래스, 상속, 추상화를 직접 체험해봐요!
        </p>
      </div>

      <div className={styles.tabs}>
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`${styles.tab} ${phase === t.id ? styles.activeTab : ''}`}
            onClick={() => setPhase(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {phase === 'object' && <ObjectTab />}
      {phase === 'class' && <ClassTab />}
      {phase === 'inherit' && <InheritTab />}
    </div>
  );
}
