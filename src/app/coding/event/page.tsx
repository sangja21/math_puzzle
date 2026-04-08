'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

type Phase = 'daily' | 'lab' | 'connect';

// ─── 일상 이벤트 데이터 ───
interface DailyEvent {
  id: string;
  emoji: string;
  trigger: string;
  handler: string;
  triggerLabel: string;
  handlerLabel: string;
}

const DAILY_EVENTS: DailyEvent[] = [
  {
    id: 'doorbell',
    emoji: '🔔',
    trigger: '초인종을 누르면',
    handler: '문을 열어준다',
    triggerLabel: '초인종 버튼 클릭',
    handlerLabel: '문 열기 동작 실행',
  },
  {
    id: 'alarm',
    emoji: '⏰',
    trigger: '알람이 울리면',
    handler: '일어나서 준비한다',
    triggerLabel: '정해진 시간 도달',
    handlerLabel: '기상 루틴 실행',
  },
  {
    id: 'traffic',
    emoji: '🚦',
    trigger: '신호등이 초록불이면',
    handler: '길을 건넌다',
    triggerLabel: '신호 변경 감지',
    handlerLabel: '보행 동작 실행',
  },
  {
    id: 'phone',
    emoji: '📱',
    trigger: '전화가 오면',
    handler: '전화를 받는다',
    triggerLabel: '수신 신호 감지',
    handlerLabel: '통화 연결 실행',
  },
];

// ─── 이벤트 로그 ───
interface EventLog {
  id: number;
  type: string;
  emoji: string;
  detail: string;
  time: string;
}

// ─── 연결 데이터 ───
interface EventSource {
  id: string;
  label: string;
  color: string;
  emoji: string;
}

interface Reaction {
  id: string;
  label: string;
  emoji: string;
  animation: string;
}

const EVENT_SOURCES: EventSource[] = [
  { id: 'red', label: '빨간 버튼', color: '#ef4444', emoji: '🔴' },
  { id: 'green', label: '초록 버튼', color: '#22c55e', emoji: '🟢' },
  { id: 'blue', label: '파란 버튼', color: '#3b82f6', emoji: '🔵' },
];

const REACTIONS: Reaction[] = [
  { id: 'bulb', label: '전구 켜기', emoji: '💡', animation: 'glow' },
  { id: 'bell', label: '벨 울리기', emoji: '🔔', animation: 'shake' },
  { id: 'rocket', label: '로켓 발사', emoji: '🚀', animation: 'launch' },
];

export default function EventPage() {
  const [phase, setPhase] = useState<Phase>('daily');

  // ─── 일상 이벤트 ───
  const [activatedEvent, setActivatedEvent] = useState<string | null>(null);

  const handleDailyClick = useCallback((id: string) => {
    setActivatedEvent(id);
    setTimeout(() => setActivatedEvent(null), 1500);
  }, []);

  // ─── 실험실 ───
  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);
  const [eventCounts, setEventCounts] = useState<Record<string, number>>({});
  const logIdRef = useRef(0);
  const labBoxRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((type: string, emoji: string, detail: string) => {
    const now = new Date();
    const time = `${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
    logIdRef.current += 1;
    setEventLogs((prev) => [
      { id: logIdRef.current, type, emoji, detail, time },
      ...prev.slice(0, 9),
    ]);
    setEventCounts((prev) => ({
      ...prev,
      [type]: (prev[type] || 0) + 1,
    }));
  }, []);

  const clearLogs = useCallback(() => {
    setEventLogs([]);
    setEventCounts({});
  }, []);

  // ─── 연결하기 ───
  const [connections, setConnections] = useState<Record<string, string>>({});
  const [selectingSource, setSelectingSource] = useState<string | null>(null);
  const [activeReaction, setActiveReaction] = useState<string | null>(null);
  const [lastFiredSource, setLastFiredSource] = useState<string | null>(null);

  const handleSourceClick = useCallback((sourceId: string) => {
    // 연결이 있으면 → 이벤트 발생
    if (connections[sourceId]) {
      setLastFiredSource(sourceId);
      setActiveReaction(connections[sourceId]);
      setTimeout(() => {
        setActiveReaction(null);
        setLastFiredSource(null);
      }, 1000);
    } else {
      // 연결이 없으면 → 연결 모드
      setSelectingSource(sourceId);
    }
  }, [connections]);

  const handleReactionSelect = useCallback((reactionId: string) => {
    if (selectingSource) {
      setConnections((prev) => ({ ...prev, [selectingSource]: reactionId }));
      setSelectingSource(null);
    }
  }, [selectingSource]);

  const clearConnections = useCallback(() => {
    setConnections({});
    setSelectingSource(null);
    setActiveReaction(null);
  }, []);

  return (
    <div className={styles.container}>
      <Link href="/coding" className={styles.backButton}>
        ← 코딩의 원리
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>🔔 이벤트 (Event)</h1>
        <p className={styles.subtitle}>
          &quot;~하면 ~한다&quot; — 어떤 일이 발생하면 정해진 동작을 실행하는 것, 그것이 이벤트!
        </p>
      </header>

      {/* 탭 */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${phase === 'daily' ? styles.activeTab : ''}`}
          onClick={() => setPhase('daily')}
        >
          🔔 이벤트란?
        </button>
        <button
          className={`${styles.tab} ${phase === 'lab' ? styles.activeTab : ''}`}
          onClick={() => setPhase('lab')}
        >
          🧪 실험실
        </button>
        <button
          className={`${styles.tab} ${phase === 'connect' ? styles.activeTab : ''}`}
          onClick={() => setPhase('connect')}
        >
          🔗 연결하기
        </button>
      </div>

      {/* ═══════ 1단계: 일상 속 이벤트 ═══════ */}
      {phase === 'daily' && (
        <div className={styles.mainContent}>
          <div className={styles.explainPanel}>
            <h3>📝 이벤트란?</h3>
            <p>
              이벤트(Event)는 <strong>&quot;어떤 일이 발생하는 것&quot;</strong>이에요.
            </p>
            <p style={{ marginTop: 12 }}>
              프로그래밍에서는 이 이벤트가 발생했을 때 실행할 동작을 미리 정해놓아요.
              이 동작을 <strong>핸들러(Handler)</strong>라고 불러요.
            </p>
            <div className={styles.conceptBox}>
              <div className={styles.conceptRow}>
                <span className={styles.conceptLabel}>이벤트 (Event)</span>
                <span className={styles.conceptValue}>~하면</span>
              </div>
              <div className={styles.conceptRow}>
                <span className={styles.conceptLabel}>핸들러 (Handler)</span>
                <span className={styles.conceptValue}>~한다</span>
              </div>
            </div>
            <div className={styles.codeBlock}>
              <code>
                <span className={styles.codeKeyword}>when</span> 초인종을 누르면 {'{\n'}
                {'  '}문을 열어준다{'\n'}
                {'}'}
              </code>
            </div>
          </div>

          <div className={styles.interactiveArea}>
            <h3 className={styles.selectorTitle}>일상 속 이벤트를 클릭해 보세요!</h3>
            <div className={styles.dailyCards}>
              {DAILY_EVENTS.map((evt) => {
                const isActive = activatedEvent === evt.id;
                return (
                  <button
                    key={evt.id}
                    className={`${styles.dailyCard} ${isActive ? styles.dailyActive : ''}`}
                    onClick={() => handleDailyClick(evt.id)}
                  >
                    <div className={styles.dailyEmoji}>{evt.emoji}</div>
                    <div className={styles.dailyTrigger}>
                      <span className={styles.dailyLabel}>이벤트</span>
                      {evt.trigger}
                    </div>
                    {isActive && (
                      <div className={styles.dailyReaction}>
                        <span className={styles.dailyArrow}>↓</span>
                        <div className={styles.dailyHandler}>
                          <span className={styles.dailyLabel}>핸들러</span>
                          {evt.handler}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className={styles.keyInsight}>
              <strong>핵심:</strong> 이벤트와 핸들러를 미리 연결해 놓으면,
              이벤트가 발생할 때 <strong>자동으로</strong> 핸들러가 실행돼요!
            </div>
          </div>
        </div>
      )}

      {/* ═══════ 2단계: 이벤트 실험실 ═══════ */}
      {phase === 'lab' && (
        <div className={styles.mainContent}>
          <div className={styles.explainPanel}>
            <h3>🧪 브라우저 이벤트</h3>
            <p>
              지금 여러분이 사용하는 브라우저에서도 수많은 이벤트가 발생해요!
            </p>
            <p style={{ marginTop: 12 }}>
              오른쪽 파란 영역에서 다양한 동작을 해보세요. 발생하는 이벤트가 기록됩니다.
            </p>
            <div className={styles.conceptBox}>
              <div className={styles.conceptRow}>
                <span className={styles.conceptLabel}>클릭</span>
                <span className={styles.conceptValue}>마우스 버튼 누름</span>
              </div>
              <div className={styles.conceptRow}>
                <span className={styles.conceptLabel}>더블클릭</span>
                <span className={styles.conceptValue}>빠르게 두 번 클릭</span>
              </div>
              <div className={styles.conceptRow}>
                <span className={styles.conceptLabel}>마우스 진입</span>
                <span className={styles.conceptValue}>영역 안으로 들어옴</span>
              </div>
              <div className={styles.conceptRow}>
                <span className={styles.conceptLabel}>마우스 퇴장</span>
                <span className={styles.conceptValue}>영역 밖으로 나감</span>
              </div>
              <div className={styles.conceptRow}>
                <span className={styles.conceptLabel}>키보드</span>
                <span className={styles.conceptValue}>키를 누름</span>
              </div>
            </div>

            {/* 이벤트 카운터 */}
            {Object.keys(eventCounts).length > 0 && (
              <div className={styles.counterBox}>
                <h4 className={styles.counterTitle}>이벤트 발생 횟수</h4>
                {Object.entries(eventCounts).map(([type, count]) => (
                  <div key={type} className={styles.counterRow}>
                    <span>{type}</span>
                    <span className={styles.counterBadge}>{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.interactiveArea}>
            <h3 className={styles.selectorTitle}>이벤트 감지 영역</h3>

            {/* 이벤트 감지 박스 */}
            <div
              ref={labBoxRef}
              className={styles.labBox}
              tabIndex={0}
              onClick={(e) => {
                const rect = labBoxRef.current?.getBoundingClientRect();
                if (rect) {
                  const x = Math.round(e.clientX - rect.left);
                  const y = Math.round(e.clientY - rect.top);
                  addLog('클릭', '👆', `위치: (${x}, ${y})`);
                }
              }}
              onDoubleClick={() => addLog('더블클릭', '👆👆', '빠르게 두 번!')}
              onMouseEnter={() => addLog('마우스 진입', '➡️', '영역 안으로')}
              onMouseLeave={() => addLog('마우스 퇴장', '⬅️', '영역 밖으로')}
              onKeyDown={(e) => addLog('키보드', '⌨️', `키: ${e.key}`)}
            >
              <div className={styles.labBoxContent}>
                <span className={styles.labBoxEmoji}>🎯</span>
                <span>여기서 클릭, 마우스 이동, 키보드 입력을 해보세요!</span>
                <span className={styles.labBoxHint}>(키보드: 먼저 이 영역을 클릭해서 포커스를 주세요)</span>
              </div>
            </div>

            {/* 이벤트 로그 */}
            <div className={styles.logArea}>
              <div className={styles.logHeader}>
                <h4>이벤트 로그</h4>
                <button className={styles.clearBtn} onClick={clearLogs}>
                  클리어
                </button>
              </div>
              <div className={styles.logList}>
                {eventLogs.length === 0 ? (
                  <div className={styles.logEmpty}>
                    아직 이벤트가 없어요. 위 영역에서 동작해 보세요!
                  </div>
                ) : (
                  eventLogs.map((log) => (
                    <div key={log.id} className={styles.logItem}>
                      <span className={styles.logEmoji}>{log.emoji}</span>
                      <span className={styles.logType}>{log.type}</span>
                      <span className={styles.logDetail}>{log.detail}</span>
                      <span className={styles.logTime}>{log.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ 3단계: 이벤트 연결하기 ═══════ */}
      {phase === 'connect' && (
        <div className={styles.mainContent}>
          <div className={styles.explainPanel}>
            <h3>🔗 이벤트 연결</h3>
            <p>
              프로그래밍에서는 <strong>어떤 이벤트</strong>에 <strong>어떤 핸들러</strong>를
              연결할지 직접 정할 수 있어요!
            </p>
            <p style={{ marginTop: 12 }}>
              1. 먼저 버튼을 클릭해서 이벤트를 선택하고
              <br />
              2. 오른쪽에서 반응을 선택해서 연결하세요!
              <br />
              3. 연결 후 버튼을 다시 클릭하면 반응이 실행됩니다!
            </p>

            {/* 연결 상태 */}
            <div className={styles.conceptBox}>
              {EVENT_SOURCES.map((src) => (
                <div key={src.id} className={styles.conceptRow}>
                  <span className={styles.conceptLabel}>
                    {src.emoji} {src.label}
                  </span>
                  <span className={styles.conceptValue}>
                    {connections[src.id]
                      ? `→ ${REACTIONS.find((r) => r.id === connections[src.id])?.emoji} ${REACTIONS.find((r) => r.id === connections[src.id])?.label}`
                      : '미연결'}
                  </span>
                </div>
              ))}
            </div>

            {/* 블록코딩 미리보기 */}
            {Object.keys(connections).length > 0 && (
              <div className={styles.blockPreview}>
                <h4 className={styles.blockPreviewTitle}>블록코딩으로 보면?</h4>
                {Object.entries(connections).map(([srcId, reactId]) => {
                  const src = EVENT_SOURCES.find((s) => s.id === srcId);
                  const react = REACTIONS.find((r) => r.id === reactId);
                  if (!src || !react) return null;
                  return (
                    <div key={srcId} className={styles.blockRow}>
                      <div className={styles.blockEvent} style={{ borderColor: src.color }}>
                        <span className={styles.codeKeyword}>when</span> {src.label} 클릭
                      </div>
                      <div className={styles.blockHandler}>
                        {react.emoji} {react.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className={styles.interactiveArea}>
            <h3 className={styles.selectorTitle}>
              {selectingSource
                ? `${EVENT_SOURCES.find((s) => s.id === selectingSource)?.emoji} 에 연결할 반응을 선택하세요!`
                : '버튼을 클릭해서 이벤트를 발생시키세요!'}
            </h3>

            {/* 이벤트 소스 버튼 */}
            <div className={styles.sourceArea}>
              <div className={styles.sourceLabel}>이벤트 소스</div>
              <div className={styles.sourceButtons}>
                {EVENT_SOURCES.map((src) => (
                  <button
                    key={src.id}
                    className={`${styles.sourceBtn} ${selectingSource === src.id ? styles.sourcePulsing : ''} ${lastFiredSource === src.id ? styles.sourceFired : ''}`}
                    style={{ backgroundColor: src.color }}
                    onClick={() => handleSourceClick(src.id)}
                  >
                    <span className={styles.sourceBtnEmoji}>{src.emoji}</span>
                    <span className={styles.sourceBtnLabel}>{src.label}</span>
                    {connections[src.id] && (
                      <span className={styles.connectedBadge}>
                        {REACTIONS.find((r) => r.id === connections[src.id])?.emoji}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.connectionArrow}>
              {selectingSource ? '⬇️ 연결할 반응 선택' : '⬇️'}
            </div>

            {/* 반응 대상 */}
            <div className={styles.reactionArea}>
              <div className={styles.sourceLabel}>반응 (핸들러)</div>
              <div className={styles.reactionButtons}>
                {REACTIONS.map((react) => {
                  const isActive = activeReaction === react.id;
                  return (
                    <button
                      key={react.id}
                      className={`${styles.reactionBtn} ${selectingSource ? styles.reactionSelectable : ''} ${isActive ? styles[react.animation] : ''}`}
                      onClick={() => handleReactionSelect(react.id)}
                      disabled={!selectingSource}
                    >
                      <span className={styles.reactionEmoji}>{react.emoji}</span>
                      <span className={styles.reactionLabel}>{react.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button className={styles.clearConnectionBtn} onClick={clearConnections}>
              모든 연결 초기화
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
