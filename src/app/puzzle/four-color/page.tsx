'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import {
  MAP_DATA,
  COLOR_PALETTE,
  getConflicts,
  isComplete,
  getUsedColorCount,
  getHint,
  canColorWith3,
  getMapEdges,
  type Region,
} from '@/lib/puzzles/fourColor';
import { playSound, playColorPaintSound, playClearSound } from '@/lib/sound';

const COLOR_NAMES = ['빨강', '파랑', '초록', '노랑'];
type ViewMode = 'map' | 'overlay' | 'graph';

export default function FourColorPage() {
  const [selectedMapId, setSelectedMapId] = useState<string>(MAP_DATA[0].id);
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [regions, setRegions] = useState<Region[]>(() =>
    MAP_DATA[0].regions.map((r) => ({ ...r })),
  );
  const [selectedColorIdx, setSelectedColorIdx] = useState<number>(0);
  const [message, setMessage] = useState<{
    text: string;
    kind: 'good' | 'bad' | 'info';
  }>({ text: '색상을 선택하고 영역을 클릭하세요.', kind: 'info' });
  const [hintRegionId, setHintRegionId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    name: string;
    x: number;
    y: number;
  } | null>(null);
  const [solved, setSolved] = useState(false);

  const currentMap = useMemo(
    () => MAP_DATA.find((m) => m.id === selectedMapId) ?? MAP_DATA[0],
    [selectedMapId],
  );

  const conflicts = useMemo(() => getConflicts(regions), [regions]);
  const conflictSet = useMemo(() => {
    const s = new Set<string>();
    for (const [a, b] of conflicts) {
      s.add(a);
      s.add(b);
    }
    return s;
  }, [conflicts]);

  const puzzleComplete = useMemo(() => isComplete(regions), [regions]);
  const usedColors = useMemo(() => getUsedColorCount(regions), [regions]);
  const coloredCount = useMemo(
    () => regions.filter((r) => r.color !== null).length,
    [regions],
  );

  const threeColorable = useMemo(() => canColorWith3(currentMap), [currentMap]);
  const edges = useMemo(() => getMapEdges(regions), [regions]);

  // 뷰 모드 변경
  const handleViewModeChange = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    playSound('select');
  }, []);

  // 맵 변경 시 리셋
  const handleSelectMap = useCallback(
    (mapId: string) => {
      if (mapId === selectedMapId) return;
      playSound('move');
      setSelectedMapId(mapId);
      const map = MAP_DATA.find((m) => m.id === mapId) ?? MAP_DATA[0];
      setRegions(map.regions.map((r) => ({ ...r })));
      setMessage({ text: '색상을 선택하고 영역을 클릭하세요.', kind: 'info' });
      setHintRegionId(null);
      setSolved(false);
    },
    [selectedMapId],
  );

  // 클리어 시 confetti 및 효과음
  useEffect(() => {
    if (puzzleComplete && !solved) {
      setSolved(true);
      playSound('success');
      setMessage({
        text: `🎉 축하합니다! ${usedColors}색만으로 완성했습니다!`,
        kind: 'good',
      });
      import('canvas-confetti').then((mod) => {
        const fire = mod.default;
        fire({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
        setTimeout(
          () =>
            fire({ particleCount: 80, spread: 100, origin: { y: 0.5 } }),
          300,
        );
      });
    }
  }, [puzzleComplete, solved, usedColors]);

  // 색상 팔레트 선택
  const handleColorSelect = useCallback((idx: number) => {
    setSelectedColorIdx(idx);
    playSound('select');
  }, []);

  // 영역 클릭
  const handleRegionClick = useCallback(
    (regionId: string) => {
      if (solved) return;
      setHintRegionId(null);

      const target = regions.find((r) => r.id === regionId);
      if (target && target.color === selectedColorIdx) {
        playClearSound();
      } else {
        playColorPaintSound(selectedColorIdx);
      }

      setRegions((prev) =>
        prev.map((r) => {
          if (r.id !== regionId) return r;
          // 같은 색 다시 클릭하면 지우기
          if (r.color === selectedColorIdx) {
            return { ...r, color: null };
          }
          return { ...r, color: selectedColorIdx };
        }),
      );

      setMessage({ text: '', kind: 'info' });
    },
    [selectedColorIdx, solved, regions],
  );

  // 전체 지우기
  const handleClear = useCallback(() => {
    playClearSound();
    setRegions((prev) => prev.map((r) => ({ ...r, color: null })));
    setMessage({ text: '모든 색을 지웠습니다.', kind: 'info' });
    setHintRegionId(null);
    setSolved(false);
  }, []);

  // 리셋 (현재 맵 초기화)
  const handleReset = useCallback(() => {
    playClearSound();
    setRegions(currentMap.regions.map((r) => ({ ...r })));
    setMessage({ text: '초기화했습니다.', kind: 'info' });
    setHintRegionId(null);
    setSolved(false);
  }, [currentMap]);

  // 힌트
  const handleHint = useCallback(() => {
    playSound('select');
    const hint = getHint(regions);
    if (!hint) {
      setMessage({ text: '모든 영역이 이미 칠해져 있습니다.', kind: 'info' });
      return;
    }
    const region = regions.find((r) => r.id === hint.regionId);
    setHintRegionId(hint.regionId);
    setSelectedColorIdx(hint.suggestedColor);
    setMessage({
      text: `💡 "${region?.name}" 영역을 ${COLOR_NAMES[hint.suggestedColor]}으로 칠해보세요!`,
      kind: 'info',
    });
  }, [regions]);

  // SVG 마우스 이벤트 (툴팁)
  const handleRegionEnter = useCallback(
    (e: React.MouseEvent, name: string) => {
      const rect = (
        e.currentTarget.closest(`.${styles.svgWrap}`) as HTMLElement
      )?.getBoundingClientRect();
      if (!rect) return;
      setTooltip({
        name,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    },
    [],
  );

  const handleRegionLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.homeBtn}>
        🏠 메인으로
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>
          <span>🗺️</span> 4색 정리
        </h1>
        <p className={styles.subtitle}>
          어떤 지도든 <strong>4가지 색</strong>만으로 인접한 영역을 다르게 칠할
          수 있다 — 1852년부터 124년간 풀리지 않았던 난제를 직접 체험해보세요.
        </p>
      </header>

      {/* 맵 선택 칩 */}
      <div className={styles.mapRow}>
        {MAP_DATA.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`${styles.mapChip} ${selectedMapId === m.id ? styles.mapChipActive : ''}`}
            onClick={() => handleSelectMap(m.id)}
          >
            {'⭐'.repeat(m.difficulty)} {m.name}
          </button>
        ))}
      </div>

      <div className={styles.mainGrid}>
        {/* ── 좌측: 스테이지 ── */}
        <section className={styles.stage}>
          {/* 뷰 모드 전환 탭 */}
          <div className={styles.viewModeRow}>
            <button
              type="button"
              className={`${styles.viewModeBtn} ${viewMode === 'map' ? styles.viewModeBtnActive : ''}`}
              onClick={() => handleViewModeChange('map')}
            >
              🗺️ 지도 모드
            </button>
            <button
              type="button"
              className={`${styles.viewModeBtn} ${viewMode === 'overlay' ? styles.viewModeBtnActive : ''}`}
              onClick={() => handleViewModeChange('overlay')}
            >
              🔀 겹쳐보기 (오버레이)
            </button>
            <button
              type="button"
              className={`${styles.viewModeBtn} ${viewMode === 'graph' ? styles.viewModeBtnActive : ''}`}
              onClick={() => handleViewModeChange('graph')}
            >
              🕸️ 쌍대 그래프 모드
            </button>
          </div>

          {/* 색 팔레트 */}
          <div className={styles.paletteRow}>
            {COLOR_PALETTE.map((color, idx) => (
              <div key={color} style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  className={`${styles.colorBtn} ${selectedColorIdx === idx ? styles.colorBtnActive : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelect(idx)}
                  aria-label={COLOR_NAMES[idx]}
                />
                <div className={styles.colorBtnLabel}>{COLOR_NAMES[idx]}</div>
              </div>
            ))}
          </div>

          {/* SVG 지도 & 그래프 */}
          <div
            className={`${styles.svgWrap} ${viewMode === 'graph' ? styles.svgWrapGraph : ''}`}
          >
            <svg
              className={styles.mapSvg}
              viewBox={currentMap.viewBox}
              preserveAspectRatio="xMidYMid meet"
            >
              {/* 1) 지도 영역 (Map Paths) */}
              {regions.map((region) => {
                const hasConflict = conflictSet.has(region.id);
                const isHint = hintRegionId === region.id;
                const isColored = region.color !== null;
                const isGraphOnly = viewMode === 'graph';
                const fillColor = isGraphOnly
                  ? '#1e293b'
                  : isColored
                    ? COLOR_PALETTE[region.color!]
                    : '#e2e8f0';

                return (
                  <g key={region.id}>
                    <path
                      d={region.path}
                      fill={fillColor}
                      className={`${styles.region} ${isGraphOnly ? styles.regionFaded : ''} ${hasConflict && viewMode === 'map' ? styles.regionConflict : ''}`}
                      style={{
                        fill: fillColor,
                        ...(isHint && viewMode === 'map'
                          ? {
                              stroke: '#fbbf24',
                              strokeWidth: 3.5,
                              strokeDasharray: '8 4',
                            }
                          : {}),
                      }}
                      onClick={() => !isGraphOnly && handleRegionClick(region.id)}
                      onMouseEnter={(e) =>
                        !isGraphOnly && handleRegionEnter(e, region.name)
                      }
                      onMouseLeave={handleRegionLeave}
                    />
                    {viewMode === 'map' && (
                      <text
                        x={region.labelX}
                        y={region.labelY}
                        className={styles.regionLabel}
                        fill={isColored ? '#ffffff' : '#1e293b'}
                      >
                        {region.name}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* 2) 그래프 간선 (Edges: 국경 공유 관계) */}
              {viewMode !== 'map' &&
                edges.map((edge) => {
                  const isConflictEdge =
                    edge.source.color !== null &&
                    edge.source.color === edge.target.color;

                  return (
                    <line
                      key={edge.id}
                      x1={edge.source.labelX}
                      y1={edge.source.labelY}
                      x2={edge.target.labelX}
                      y2={edge.target.labelY}
                      className={`${styles.graphEdge} ${
                        viewMode === 'overlay' ? styles.graphEdgeOverlay : ''
                      } ${isConflictEdge ? styles.graphEdgeConflict : ''}`}
                    />
                  );
                })}

              {/* 3) 그래프 정점 (Vertices / Nodes: 각 영역) */}
              {viewMode !== 'map' &&
                regions.map((region) => {
                  const hasConflict = conflictSet.has(region.id);
                  const isHint = hintRegionId === region.id;
                  const isColored = region.color !== null;
                  const fillColor = isColored
                    ? COLOR_PALETTE[region.color!]
                    : '#475569';

                  return (
                    <g
                      key={`node-${region.id}`}
                      className={styles.graphNode}
                      onClick={() => handleRegionClick(region.id)}
                      onMouseEnter={(e) => handleRegionEnter(e, region.name)}
                      onMouseLeave={handleRegionLeave}
                    >
                      <circle
                        cx={region.labelX}
                        cy={region.labelY}
                        r={17}
                        fill={fillColor}
                        stroke={
                          isHint
                            ? '#fbbf24'
                            : hasConflict
                              ? '#ef4444'
                              : '#f8fafc'
                        }
                        strokeWidth={hasConflict || isHint ? 3.5 : 2}
                        className={hasConflict ? styles.graphNodeConflict : ''}
                      />
                      <text
                        x={region.labelX}
                        y={region.labelY}
                        className={styles.graphNodeLabel}
                        fill={isColored ? '#ffffff' : '#f1f5f9'}
                      >
                        {region.name.length > 3
                          ? region.name.slice(0, 2)
                          : region.name}
                      </text>
                    </g>
                  );
                })}
            </svg>
            {tooltip && (
              <div
                className={styles.tooltip}
                style={{ left: tooltip.x, top: tooltip.y }}
              >
                {tooltip.name}
              </div>
            )}
          </div>

          {/* 진행 상태 */}
          <div className={styles.progressRow}>
            <div
              className={`${styles.progressBox} ${coloredCount === regions.length && conflicts.length === 0 ? styles.progressBoxGood : ''}`}
            >
              <span className={styles.progressLabel}>색칠 진행</span>
              <span className={styles.progressValue}>
                {coloredCount} / {regions.length}
              </span>
            </div>
            <div
              className={`${styles.progressBox} ${conflicts.length > 0 ? styles.progressBoxBad : ''}`}
            >
              <span className={styles.progressLabel}>충돌</span>
              <span className={styles.progressValue}>
                {conflicts.length}건
              </span>
            </div>
            <div className={styles.progressBox}>
              <span className={styles.progressLabel}>사용 색</span>
              <span className={styles.progressValue}>{usedColors}색</span>
            </div>
          </div>

          {/* 메시지 */}
          <div
            className={`${styles.messageBox} ${
              message.kind === 'good'
                ? styles.messageGood
                : message.kind === 'bad'
                  ? styles.messageBad
                  : ''
            }`}
          >
            {message.text ||
              (conflicts.length > 0
                ? `⚠️ 인접한 영역 ${conflicts.length}쌍이 같은 색입니다!`
                : '영역을 클릭하여 색을 칠하세요.')}
          </div>
        </section>

        {/* ── 우측: 패널 ── */}
        <aside className={styles.panel}>
          {/* 이론 판정 */}
          <div className={styles.panelCard}>
            <h3 className={styles.panelTitle}>이론상 판정</h3>
            <div className={styles.statusItem}>
              <span>3색으로 가능?</span>
              <span className={threeColorable ? styles.statusYes : styles.statusNo}>
                {threeColorable ? '✓ 가능' : '✗ 4색 필요'}
              </span>
            </div>
            <div className={styles.statusItem}>
              <span>정점(V) / 간선(E)</span>
              <span>
                {regions.length}개 / {edges.length}개
              </span>
            </div>
            <div className={styles.statusItem}>
              <span>난이도</span>
              <span>{'⭐'.repeat(currentMap.difficulty)}</span>
            </div>
          </div>

          {/* 색칠 현황 */}
          <div className={styles.panelCard}>
            <h3 className={styles.panelTitle}>색칠 현황</h3>
            <div className={styles.regionTable}>
              {regions.map((r) => (
                <div key={r.id} className={styles.regionRow}>
                  <span>{r.name}</span>
                  <span
                    className={styles.regionDot}
                    style={{
                      backgroundColor:
                        r.color !== null ? COLOR_PALETTE[r.color] : '#475569',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className={styles.panelCard}>
            <div className={styles.actionRow}>
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.hintBtn}`}
                onClick={handleHint}
                disabled={solved}
              >
                💡 힌트
              </button>
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.resetBtn}`}
                onClick={handleReset}
              >
                🔄 리셋
              </button>
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.clearBtn}`}
                onClick={handleClear}
              >
                🗑️ 전체 지우기
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* ── 교육 섹션 ── */}
      <details className={styles.help}>
        <summary>4색이면 충분하다 — 지도를 칠하는 수학 🤔</summary>
        <div className={styles.helpBody}>
          <h3>🗺️ 시작은 하나의 질문 (1852년)</h3>
          <p>
            영국의 대학생 <strong>프랜시스 거스리</strong>(Francis Guthrie)는
            잉글랜드 지도를 색칠하다가 문득 궁금해졌습니다. &ldquo;인접한 지역을
            다른 색으로 칠하려면, 어떤 지도든 4가지 색이면 충분할까?&rdquo;
          </p>

          <h3>❌ 왜 3가지 색으로는 부족할까?</h3>
          <p>
            4개의 영역이 모두 서로 인접하는 배치를 생각해보세요. 마치{' '}
            <strong>정사면체</strong>를 위에서 내려다본 모양입니다 — 삼각형
            가운데에 하나의 영역이 있고, 4개 영역 모두가 서로 국경을 공유합니다.
            이 경우 3색으로는 절대 칠할 수 없습니다.
          </p>

          <h3>🖥️ 수학과 컴퓨터의 만남 (1976년)</h3>
          <p>
            124년간 수학자들을 괴롭힌 이 문제를{' '}
            <strong>케네스 아펠(Kenneth Appel)</strong>과{' '}
            <strong>볼프강 하켄(Wolfgang Haken)</strong>이 마침내 해결했습니다.
            모든 가능한 지도를 <strong>1,936가지 유형</strong>으로 분류하고,
            컴퓨터로 각각을 검증했죠. 이것은{' '}
            <strong>컴퓨터를 이용해 증명된 최초의 주요 수학 정리</strong>
            입니다.
          </p>

          <h3>📊 그래프 이론과의 연결</h3>
          <p>수학자들은 지도를 &lsquo;그래프&rsquo;로 바꿔서 생각합니다:</p>
          <ul>
            <li>
              <strong>영역(Region)</strong> → 꼭짓점(Vertex)
            </li>
            <li>
              <strong>국경(Border)</strong> → 간선(Edge)
            </li>
          </ul>
          <p>
            이를 <strong>쌍대 그래프(Dual Graph)</strong>라고 부르며, &ldquo;지도
            색칠하기&rdquo;는 &ldquo;평면 그래프의 정점 색칠하기&rdquo; 문제와
            동치입니다. 쾨니히스베르크의 다리 퍼즐에서 배운 그래프 이론이 여기서도
            빛을 발합니다!
          </p>
        </div>
      </details>
    </div>
  );
}
