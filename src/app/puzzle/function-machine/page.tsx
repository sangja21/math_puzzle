'use client';

import React, { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import {
  STAGES,
  FORMULA_BLOCKS,
  evaluateFormula,
  validateFormula,
} from '@/lib/puzzles/functionMachine';
import styles from './page.module.css';

// ─── 드래그 가능한 숫자 블록 (기계 입력용) ───
function InputBlock({ value }: { value: number }) {
  const id = `input-${value}`;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { type: 'input', value },
  });
  const style: React.CSSProperties = {
    ...(transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : {}),
    opacity: isDragging ? 0.4 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={styles.inputBlock}>
      {value}
    </div>
  );
}

// ─── 기계 드롭 영역 ───
function MachineDropZone({ currentInput }: { currentInput: number | null }) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'machine-input',
    data: { type: 'machine' },
  });
  return (
    <div ref={setNodeRef} className={`${styles.machineSlot} ${isOver ? styles.machineSlotOver : ''}`}>
      {currentInput !== null ? (
        <span className={styles.machineSlotValue}>{currentInput}</span>
      ) : (
        <span className={styles.machineSlotPlaceholder}>여기에 숫자를<br />넣어보세요!</span>
      )}
    </div>
  );
}

// ─── 드래그 가능한 수식 블록 ───
function FormulaBlock({ token, sourceId }: { token: string; sourceId: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: sourceId,
    data: { type: 'formula', token },
  });
  const style: React.CSSProperties = {
    ...(transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : {}),
    opacity: isDragging ? 0.4 : 1,
  };

  const isOperator = ['+', '-', '×', '÷'].includes(token);
  const isVariable = token === '입력';

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${styles.formulaBlock} ${isOperator ? styles.operatorBlock : ''} ${isVariable ? styles.variableBlock : ''}`}
    >
      {token}
    </div>
  );
}

// ─── 수식 조립 드롭 영역 ───
function FormulaDropZone({
  tokens,
  onRemove,
}: {
  tokens: string[];
  onRemove: (index: number) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'formula-zone',
    data: { type: 'formula-zone' },
  });
  return (
    <div ref={setNodeRef} className={`${styles.formulaZone} ${isOver ? styles.formulaZoneOver : ''}`}>
      {tokens.length === 0 ? (
        <span className={styles.formulaPlaceholder}>여기에 블록을 조립하세요!</span>
      ) : (
        tokens.map((token, idx) => {
          const isOperator = ['+', '-', '×', '÷'].includes(token);
          const isVariable = token === '입력';
          return (
            <div
              key={idx}
              className={`${styles.formulaPlaced} ${isOperator ? styles.operatorBlock : ''} ${isVariable ? styles.variableBlock : ''}`}
              onClick={() => onRemove(idx)}
              title="클릭하면 제거됩니다"
            >
              {token}
              <span className={styles.removeX}>×</span>
            </div>
          );
        })
      )}
    </div>
  );
}

// ─── 메인 페이지 ───
type Phase = 'intro' | 'explore' | 'solve' | 'complete';

export default function FunctionMachinePage() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [stageIndex, setStageIndex] = useState(0);
  const [machineInput, setMachineInput] = useState<number | null>(null);
  const [machineOutput, setMachineOutput] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [testHistory, setTestHistory] = useState<{ input: number; output: number }[]>([]);
  const [formulaTokens, setFormulaTokens] = useState<string[]>([]);
  const [answerResult, setAnswerResult] = useState<boolean | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [draggingToken, setDraggingToken] = useState<string | null>(null);
  const [allComplete, setAllComplete] = useState(false);

  const outputTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stage = STAGES[stageIndex];

  const pointerSensor = useSensor(PointerSensor, { activationConstraint: { distance: 5 } });
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } });
  const keyboardSensor = useSensor(KeyboardSensor);
  const sensors = useSensors(pointerSensor, touchSensor, keyboardSensor);

  // 기계에 숫자 넣기
  const feedMachine = useCallback(
    (value: number) => {
      if (isProcessing) return;
      setIsProcessing(true);
      setMachineInput(value);
      setMachineOutput(null);

      // 처리 애니메이션
      if (outputTimerRef.current) clearTimeout(outputTimerRef.current);
      outputTimerRef.current = setTimeout(() => {
        const result = stage.fn(value);
        setMachineOutput(result);
        setTestHistory((prev) => {
          const exists = prev.some((h) => h.input === value);
          if (exists) return prev;
          return [...prev, { input: value, output: result }];
        });
        setIsProcessing(false);
      }, 800);
    },
    [isProcessing, stage]
  );

  // 수식 토큰 추가
  const addFormulaToken = useCallback((token: string) => {
    setFormulaTokens((prev) => [...prev, token]);
    setAnswerResult(null);
  }, []);

  // 수식 토큰 제거
  const removeFormulaToken = useCallback((index: number) => {
    setFormulaTokens((prev) => prev.filter((_, i) => i !== index));
    setAnswerResult(null);
  }, []);

  // 드래그 시작
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as { type: string; token?: string; value?: number };
    if (data.type === 'formula') {
      setDraggingToken(data.token || null);
    } else if (data.type === 'input') {
      setDraggingToken(String(data.value));
    }
  }, []);

  // 드래그 종료
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setDraggingToken(null);
      const { active, over } = event;
      if (!over) return;

      const activeData = active.data.current as { type: string; token?: string; value?: number };
      const overData = over.data.current as { type: string };

      if (activeData.type === 'input' && overData.type === 'machine') {
        feedMachine(activeData.value!);
      } else if (activeData.type === 'formula' && overData.type === 'formula-zone') {
        addFormulaToken(activeData.token!);
      }
    },
    [feedMachine, addFormulaToken]
  );

  // 정답 확인
  const handleCheckAnswer = useCallback(() => {
    const isCorrect = validateFormula(formulaTokens, stage);
    setAnswerResult(isCorrect);

    if (isCorrect) {
      setTimeout(() => {
        if (stageIndex < STAGES.length - 1) {
          setStageIndex((prev) => prev + 1);
          setPhase('explore');
          setMachineInput(null);
          setMachineOutput(null);
          setTestHistory([]);
          setFormulaTokens([]);
          setAnswerResult(null);
          setShowHint(false);
        } else {
          setAllComplete(true);
          setPhase('complete');
        }
      }, 1500);
    }
  }, [formulaTokens, stage, stageIndex]);

  // 수식 초기화
  const handleClearFormula = useCallback(() => {
    setFormulaTokens([]);
    setAnswerResult(null);
  }, []);

  // 수식 미리보기
  const formulaPreview = formulaTokens.length > 0
    ? formulaTokens.join(' ')
    : '???';

  const previewResult = formulaTokens.length > 0 && machineInput !== null
    ? evaluateFormula(formulaTokens, machineInput)
    : null;

  // ─── 인트로 ───
  if (phase === 'intro') {
    return (
      <div className={styles.container}>
        <Link href="/puzzles" className={styles.homeButton}>🏠 목록으로</Link>
        <header className={styles.header}>
          <h1 className={styles.title}>⚙️ 함수 기계</h1>
          <p className={styles.subtitle}>숫자를 넣으면 변환되어 나오는 신비한 기계!</p>
        </header>
        <div className={styles.storyCard}>
          <p>
            여기 <strong>신비한 기계</strong>가 있어요!
          </p>
          <p style={{ marginTop: 12 }}>
            숫자를 넣으면 <strong>어떤 규칙</strong>에 따라 다른 숫자가 나옵니다.
          </p>
          <p style={{ marginTop: 12 }}>
            여러 숫자를 넣어보고 규칙을 찾은 다음,<br />
            <strong>수식 블록을 조립</strong>해서 규칙을 맞혀보세요!
          </p>
          <div className={styles.introExample}>
            <span className={styles.introInput}>3</span>
            <span className={styles.introArrow}>→ ⚙️ →</span>
            <span className={styles.introOutput}>?</span>
          </div>
        </div>
        <button className={styles.startButton} onClick={() => setPhase('explore')}>
          ⚙️ 기계 작동 시작!
        </button>
      </div>
    );
  }

  // ─── 완료 ───
  if (phase === 'complete' && allComplete) {
    return (
      <div className={styles.container}>
        <Link href="/puzzles" className={styles.homeButton}>🏠 목록으로</Link>
        <header className={styles.header}>
          <h1 className={styles.title}>⚙️ 함수 기계</h1>
        </header>
        <div className={styles.completeScreen}>
          <div className={styles.celebrationEmoji}>🎉</div>
          <h2>모든 단계 클리어!</h2>
          <p>축하해요! 함수 기계의 규칙을 모두 찾았어요!</p>
          <div className={styles.summaryBox}>
            <h3>발견한 규칙들</h3>
            {STAGES.map((s) => (
              <div key={s.id} className={styles.summaryRow}>
                <span className={styles.summaryStage}>{s.id}단계</span>
                <span className={styles.summaryFormula}>{s.answerTokens.join(' ')}</span>
              </div>
            ))}
          </div>
          <div className={styles.learnBox}>
            <h3>배운 것</h3>
            <p>
              이런 기계를 프로그래밍에서는 <strong>&quot;함수&quot;</strong>라고 불러요!
            </p>
            <p style={{ marginTop: 8 }}>
              <strong>입력</strong>을 받아서 <strong>정해진 규칙</strong>대로 처리한 뒤
              <strong> 출력</strong>을 내보내는 거예요.
            </p>
            <p style={{ marginTop: 8 }}>
              같은 입력을 넣으면 <strong>항상 같은 출력</strong>이 나오는 게 함수의 특징이에요!
            </p>
          </div>
          <button
            className={styles.restartButton}
            onClick={() => {
              setPhase('intro');
              setStageIndex(0);
              setTestHistory([]);
              setFormulaTokens([]);
              setMachineInput(null);
              setMachineOutput(null);
              setAnswerResult(null);
              setShowHint(false);
              setAllComplete(false);
            }}
          >
            🔄 처음부터 다시
          </button>
        </div>
      </div>
    );
  }

  // ─── 탐색 & 풀기 ───
  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className={styles.container}>
        <Link href="/puzzles" className={styles.homeButton}>🏠 목록으로</Link>
        <span className={styles.stageBadge}>
          {stage.title}
        </span>

        <header className={styles.header}>
          <h1 className={styles.title}>⚙️ 함수 기계</h1>
          <p className={styles.subtitle}>{stage.description}</p>
        </header>

        {/* 진행 표시 */}
        <div className={styles.progressDots}>
          {STAGES.map((_, idx) => (
            <div
              key={idx}
              className={`${styles.dot} ${idx === stageIndex ? styles.active : ''} ${idx < stageIndex ? styles.completed : ''}`}
            />
          ))}
        </div>

        {/* 숫자 블록 팔레트 */}
        <div className={styles.inputPalette}>
          <p className={styles.paletteLabel}>숫자를 기계에 넣어보세요!</p>
          <div className={styles.inputBlocks}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <InputBlock key={n} value={n} />
            ))}
          </div>
        </div>

        {/* 기계 */}
        <div className={styles.machine}>
          <div className={styles.machineBody}>
            <MachineDropZone currentInput={machineInput} />
            <div className={`${styles.machineGear} ${isProcessing ? styles.spinning : ''}`}>
              ⚙️
            </div>
            <div className={styles.machineOutputBox}>
              {isProcessing ? (
                <span className={styles.processingDots}>...</span>
              ) : machineOutput !== null ? (
                <span className={styles.outputValue}>{machineOutput}</span>
              ) : (
                <span className={styles.outputPlaceholder}>?</span>
              )}
            </div>
          </div>
        </div>

        {/* 테스트 기록 */}
        {testHistory.length > 0 && (
          <div className={styles.historySection}>
            <h3 className={styles.sectionTitle}>실험 기록</h3>
            <div className={styles.historyTable}>
              <div className={styles.historyHeader}>
                <span>넣은 수</span>
                <span></span>
                <span>나온 수</span>
              </div>
              {testHistory.map((h, idx) => (
                <div key={idx} className={styles.historyRow}>
                  <span className={styles.histIn}>{h.input}</span>
                  <span className={styles.histArrow}>→</span>
                  <span className={styles.histOut}>{h.output}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 힌트 */}
        {!showHint && testHistory.length >= 2 && (
          <button className={styles.hintButton} onClick={() => setShowHint(true)}>
            💡 힌트 보기
          </button>
        )}
        {showHint && (
          <div className={styles.hintBox}>
            💡 {stage.hint}
          </div>
        )}

        {/* 규칙 찾기 토글 */}
        {testHistory.length >= 2 && phase === 'explore' && (
          <button className={styles.solveButton} onClick={() => setPhase('solve')}>
            ✏️ 규칙 맞추기!
          </button>
        )}

        {/* 수식 조립 영역 */}
        {phase === 'solve' && (
          <div className={styles.solveSection}>
            <h3 className={styles.sectionTitle}>수식을 조립하세요!</h3>
            <p className={styles.solveHint}>블록을 아래 영역에 드래그하세요. 클릭하면 제거됩니다.</p>

            {/* 수식 블록 팔레트 */}
            <div className={styles.formulaPalette}>
              <div className={styles.formulaRow}>
                <FormulaBlock token="입력" sourceId="fp-입력" />
              </div>
              <div className={styles.formulaRow}>
                {FORMULA_BLOCKS.operators.map((op) => (
                  <FormulaBlock key={op} token={op} sourceId={`fp-${op}`} />
                ))}
              </div>
              <div className={styles.formulaRow}>
                {FORMULA_BLOCKS.numbers.map((n) => (
                  <FormulaBlock key={n} token={n} sourceId={`fp-num-${n}`} />
                ))}
              </div>
            </div>

            {/* 조립 영역 */}
            <FormulaDropZone tokens={formulaTokens} onRemove={removeFormulaToken} />

            {/* 미리보기 */}
            {formulaTokens.length > 0 && (
              <div className={styles.preview}>
                <span className={styles.previewLabel}>내 수식:</span>
                <span className={styles.previewFormula}>{formulaPreview}</span>
                {previewResult !== null && machineInput !== null && (
                  <span className={styles.previewCalc}>
                    (입력={machineInput} → {previewResult})
                  </span>
                )}
              </div>
            )}

            {/* 결과 메시지 */}
            {answerResult === true && (
              <div className={`${styles.resultMessage} ${styles.success}`}>
                🎉 정답이에요! 규칙을 찾았어요!
              </div>
            )}
            {answerResult === false && (
              <div className={`${styles.resultMessage} ${styles.error}`}>
                ❌ 이 수식은 기계의 규칙과 달라요. 다시 시도해보세요!
              </div>
            )}

            {/* 버튼 */}
            <div className={styles.controls}>
              <button className={styles.clearButton} onClick={handleClearFormula}>
                🗑️ 초기화
              </button>
              <button className={styles.backToExplore} onClick={() => setPhase('explore')}>
                ← 더 실험하기
              </button>
              <button
                className={styles.checkButton}
                onClick={handleCheckAnswer}
                disabled={formulaTokens.length === 0 || answerResult === true}
              >
                ✅ 정답 확인
              </button>
            </div>
          </div>
        )}

        {/* 드래그 오버레이 */}
        <DragOverlay>
          {draggingToken !== null ? (
            <div className={styles.dragOverlay}>{draggingToken}</div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
