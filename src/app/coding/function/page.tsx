'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

interface FunctionDef {
  name: string;
  emoji: string;
  params: string[];
  body: string;
  fn: (...args: number[]) => number;
}

const FUNCTIONS: FunctionDef[] = [
  {
    name: 'double',
    emoji: '✖️',
    params: ['x'],
    body: 'return x × 2',
    fn: (x) => x * 2,
  },
  {
    name: 'add',
    emoji: '➕',
    params: ['a', 'b'],
    body: 'return a + b',
    fn: (a, b) => a + b,
  },
  {
    name: 'square',
    emoji: '📐',
    params: ['x'],
    body: 'return x × x',
    fn: (x) => x * x,
  },
];

type Phase = 'learn' | 'build' | 'compose';

export default function FunctionPage() {
  const [phase, setPhase] = useState<Phase>('learn');

  // ─── learn 단계: 기계 실험 ───
  const [selectedFn, setSelectedFn] = useState(0);
  const [inputValues, setInputValues] = useState<(number | null)[]>([null]);
  const [output, setOutput] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // ─── build 단계: 나만의 함수 ───
  const [customName, setCustomName] = useState('myFunction');
  const [customParam, setCustomParam] = useState('x');
  const [customOp, setCustomOp] = useState<'+' | '-' | '×' | '÷'>('+');
  const [customNum, setCustomNum] = useState(5);
  const [buildInput, setBuildInput] = useState<number | null>(null);
  const [buildOutput, setBuildOutput] = useState<number | null>(null);

  // ─── compose 단계: 함수 합성 ───
  const [composeInput, setComposeInput] = useState<number | null>(null);
  const [composeSteps, setComposeSteps] = useState<{ fn: string; result: number }[]>([]);
  const [composePipeline, setComposePipeline] = useState<number[]>([0, 2]); // double → square

  const currentFn = FUNCTIONS[selectedFn];

  // 함수 선택 시 초기화
  const handleSelectFn = useCallback((idx: number) => {
    setSelectedFn(idx);
    setInputValues(FUNCTIONS[idx].params.map(() => null));
    setOutput(null);
  }, []);

  // 입력값 설정
  const handleInputChange = useCallback((paramIdx: number, value: number) => {
    setInputValues((prev) => {
      const next = [...prev];
      next[paramIdx] = value;
      return next;
    });
    setOutput(null);
  }, []);

  // 함수 실행
  const handleRun = useCallback(() => {
    if (inputValues.some((v) => v === null)) return;
    setIsProcessing(true);
    setOutput(null);

    setTimeout(() => {
      const result = currentFn.fn(...(inputValues as number[]));
      setOutput(result);
      setIsProcessing(false);
    }, 600);
  }, [inputValues, currentFn]);

  // 나만의 함수 계산
  const computeCustom = useCallback(
    (x: number): number => {
      switch (customOp) {
        case '+': return x + customNum;
        case '-': return x - customNum;
        case '×': return x * customNum;
        case '÷': return customNum !== 0 ? x / customNum : 0;
        default: return x;
      }
    },
    [customOp, customNum]
  );

  const handleBuildRun = useCallback(() => {
    if (buildInput === null) return;
    setBuildOutput(computeCustom(buildInput));
  }, [buildInput, computeCustom]);

  // 합성 실행
  const handleComposeRun = useCallback(() => {
    if (composeInput === null) return;
    const steps: { fn: string; result: number }[] = [];
    let current = composeInput;

    for (const fnIdx of composePipeline) {
      const f = FUNCTIONS[fnIdx];
      const result = f.fn(current, current); // 두 번째 인수는 add일 때만 쓰임 → 자기 자신 + 자기 자신
      const resultActual = f.params.length === 1 ? f.fn(current) : f.fn(current, current);
      steps.push({ fn: `${f.name}(${current})`, result: resultActual });
      current = resultActual;
    }

    setComposeSteps(steps);
  }, [composeInput, composePipeline]);

  const handleAddPipeline = useCallback((fnIdx: number) => {
    setComposePipeline((prev) => [...prev, fnIdx]);
    setComposeSteps([]);
  }, []);

  const handleRemovePipeline = useCallback((idx: number) => {
    setComposePipeline((prev) => prev.filter((_, i) => i !== idx));
    setComposeSteps([]);
  }, []);

  return (
    <div className={styles.container}>
      <Link href="/coding" className={styles.backButton}>
        ← 코딩의 원리
      </Link>

      <header className={styles.header}>
        <h1 className={styles.title}>⚙️ 함수 (Function)</h1>
        <p className={styles.subtitle}>
          입력을 넣으면 정해진 규칙대로 출력을 내보내는 마법 기계! 같은 입력엔 항상 같은 결과가 나와요.
        </p>
      </header>

      {/* 탭 네비게이션 */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${phase === 'learn' ? styles.activeTab : ''}`}
          onClick={() => setPhase('learn')}
        >
          🔬 함수 실험실
        </button>
        <button
          className={`${styles.tab} ${phase === 'build' ? styles.activeTab : ''}`}
          onClick={() => setPhase('build')}
        >
          🛠️ 나만의 함수
        </button>
        <button
          className={`${styles.tab} ${phase === 'compose' ? styles.activeTab : ''}`}
          onClick={() => setPhase('compose')}
        >
          🔗 함수 연결하기
        </button>
      </div>

      {/* ═══════ 1단계: 함수 실험실 ═══════ */}
      {phase === 'learn' && (
        <div className={styles.mainContent}>
          <div className={styles.explainPanel}>
            <h3>📝 함수란?</h3>
            <p>
              함수(Function)는 <strong>입력</strong>을 받아서 <strong>정해진 규칙</strong>대로 처리한 뒤
              <strong> 결과</strong>를 돌려주는 기계예요.
            </p>
            <p style={{ marginTop: 12 }}>
              한번 만들어 놓으면 <strong>이름만 불러서 재사용</strong>할 수 있어요!
            </p>
            <div className={styles.codeBlock}>
              <code>
                <span className={styles.codeKeyword}>function</span>{' '}
                <span className={styles.codeFnName}>{currentFn.name}</span>
                ({currentFn.params.join(', ')}) {'{\n'}
                {'  '}{currentFn.body}{'\n'}
                {'}'}
              </code>
            </div>
            <div className={styles.conceptBox}>
              <div className={styles.conceptRow}>
                <span className={styles.conceptLabel}>입력 (매개변수)</span>
                <span className={styles.conceptValue}>
                  {currentFn.params.map((p, i) => (
                    <span key={p}>
                      {p} = <strong>{inputValues[i] !== null ? inputValues[i] : '?'}</strong>
                      {i < currentFn.params.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </span>
              </div>
              <div className={styles.conceptRow}>
                <span className={styles.conceptLabel}>출력 (반환값)</span>
                <span className={`${styles.conceptValue} ${styles.outputHighlight}`}>
                  {output !== null ? output : '?'}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.interactiveArea}>
            {/* 함수 선택 */}
            <div className={styles.fnSelector}>
              <h3 className={styles.selectorTitle}>함수를 골라보세요</h3>
              <div className={styles.fnCards}>
                {FUNCTIONS.map((fn, idx) => (
                  <button
                    key={fn.name}
                    className={`${styles.fnCard} ${selectedFn === idx ? styles.fnCardActive : ''}`}
                    onClick={() => handleSelectFn(idx)}
                  >
                    <span className={styles.fnEmoji}>{fn.emoji}</span>
                    <span className={styles.fnName}>{fn.name}</span>
                    <span className={styles.fnDesc}>
                      ({fn.params.join(', ')}) → {fn.body.replace('return ', '')}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 기계 시각화 */}
            <div className={styles.machineViz}>
              <div className={styles.machineInputs}>
                {currentFn.params.map((param, idx) => (
                  <div key={param} className={styles.paramGroup}>
                    <label className={styles.paramLabel}>{param}</label>
                    <div className={styles.chipRow}>
                      {[1, 2, 3, 4, 5, 7, 10].map((n) => (
                        <button
                          key={n}
                          className={`${styles.chip} ${inputValues[idx] === n ? styles.chipSelected : ''}`}
                          onClick={() => handleInputChange(idx, n)}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.machineBox}>
                <div className={styles.machineArrowIn}>
                  {inputValues.every((v) => v !== null)
                    ? inputValues.join(', ')
                    : '?'}
                  {' →'}
                </div>
                <div className={`${styles.gear} ${isProcessing ? styles.spinning : ''}`}>
                  ⚙️
                </div>
                <div className={styles.machineArrowOut}>
                  {'→ '}
                  <span className={output !== null ? styles.outputGreen : ''}>
                    {isProcessing ? '...' : output !== null ? output : '?'}
                  </span>
                </div>
              </div>

              <button
                className={styles.runButton}
                onClick={handleRun}
                disabled={inputValues.some((v) => v === null) || isProcessing}
              >
                ▶ 실행!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ 2단계: 나만의 함수 만들기 ═══════ */}
      {phase === 'build' && (
        <div className={styles.mainContent}>
          <div className={styles.explainPanel}>
            <h3>🛠️ 함수 만들기</h3>
            <p>
              이름, 매개변수, 본문(규칙)을 정하면 나만의 함수가 완성돼요!
            </p>
            <div className={styles.codeBlock}>
              <code>
                <span className={styles.codeKeyword}>function</span>{' '}
                <span className={styles.codeFnName}>{customName}</span>
                ({customParam}) {'{\n'}
                {'  '}return {customParam} {customOp} {customNum}{'\n'}
                {'}'}
              </code>
            </div>
            <div className={styles.conceptBox}>
              <div className={styles.conceptRow}>
                <span className={styles.conceptLabel}>함수 이름</span>
                <span className={styles.conceptValue}>{customName}</span>
              </div>
              <div className={styles.conceptRow}>
                <span className={styles.conceptLabel}>매개변수</span>
                <span className={styles.conceptValue}>{customParam}</span>
              </div>
              <div className={styles.conceptRow}>
                <span className={styles.conceptLabel}>규칙</span>
                <span className={styles.conceptValue}>{customParam} {customOp} {customNum}</span>
              </div>
            </div>
          </div>

          <div className={styles.interactiveArea}>
            {/* 함수 설정 */}
            <div className={styles.buildForm}>
              <div className={styles.formRow}>
                <label className={styles.formLabel}>함수 이름</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value.replace(/[^a-zA-Z가-힣0-9_]/g, ''))}
                  maxLength={15}
                />
              </div>
              <div className={styles.formRow}>
                <label className={styles.formLabel}>매개변수</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={customParam}
                  onChange={(e) => setCustomParam(e.target.value.replace(/[^a-zA-Z]/g, ''))}
                  maxLength={5}
                />
              </div>
              <div className={styles.formRow}>
                <label className={styles.formLabel}>연산</label>
                <div className={styles.opSelector}>
                  {(['+', '-', '×', '÷'] as const).map((op) => (
                    <button
                      key={op}
                      className={`${styles.opButton} ${customOp === op ? styles.opActive : ''}`}
                      onClick={() => setCustomOp(op)}
                    >
                      {op}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.formRow}>
                <label className={styles.formLabel}>숫자</label>
                <input
                  type="number"
                  className={styles.formInput}
                  value={customNum}
                  onChange={(e) => setCustomNum(parseInt(e.target.value) || 0)}
                  min={0}
                  max={100}
                />
              </div>
            </div>

            <div className={styles.divider} />

            {/* 테스트 */}
            <div className={styles.buildTest}>
              <h3 className={styles.selectorTitle}>내 함수 테스트하기</h3>
              <div className={styles.chipRow}>
                {[1, 2, 3, 4, 5, 7, 10].map((n) => (
                  <button
                    key={n}
                    className={`${styles.chip} ${buildInput === n ? styles.chipSelected : ''}`}
                    onClick={() => { setBuildInput(n); setBuildOutput(null); }}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className={styles.buildResult}>
                <span className={styles.buildCall}>
                  {customName}({buildInput !== null ? buildInput : '?'})
                </span>
                <span className={styles.buildArrow}>→</span>
                <span className={`${styles.buildOutput} ${buildOutput !== null ? styles.outputGreen : ''}`}>
                  {buildOutput !== null ? buildOutput : '?'}
                </span>
              </div>
              <button
                className={styles.runButton}
                onClick={handleBuildRun}
                disabled={buildInput === null}
              >
                ▶ 실행!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ 3단계: 함수 합성 ═══════ */}
      {phase === 'compose' && (
        <div className={styles.composeLayout}>
          {/* 상단: 설명 */}
          <div className={styles.composeExplain}>
            <h3>🔗 함수 합성이란?</h3>
            <p>
              한 함수의 <strong>출력</strong>을 다른 함수의 <strong>입력</strong>으로 넣는 것을
              <strong> 함수 합성</strong>이라고 해요!
              마치 공장에서 기계를 <strong>파이프라인</strong>처럼 연결하는 거예요.
            </p>
          </div>

          {/* 중단: 파이프라인 조립 */}
          <div className={styles.composeBuilder}>
            <h3 className={styles.selectorTitle}>파이프라인 구성</h3>

            {/* 파이프라인을 세로로 표시 */}
            <div className={styles.pipelineVertical}>
              <div className={styles.pipeInput}>📥 입력</div>
              {composePipeline.map((fnIdx, i) => (
                <div key={i} className={styles.pipeStep}>
                  <span className={styles.pipeArrowDown}>↓</span>
                  <div className={styles.pipeFunction}>
                    <span>{FUNCTIONS[fnIdx].emoji} {FUNCTIONS[fnIdx].name}()</span>
                    <button
                      className={styles.pipeRemove}
                      onClick={() => handleRemovePipeline(i)}
                      title="제거"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              <span className={styles.pipeArrowDown}>↓</span>
              <div className={styles.pipeOutput}>📤 출력</div>
            </div>

            {/* 함수 추가 버튼 */}
            <div className={styles.addFnRow}>
              <span className={styles.addLabel}>함수 추가:</span>
              {FUNCTIONS.map((fn, idx) => (
                <button
                  key={fn.name}
                  className={styles.addFnButton}
                  onClick={() => handleAddPipeline(idx)}
                >
                  {fn.emoji} {fn.name}
                </button>
              ))}
            </div>

            <div className={styles.divider} />

            {/* 숫자 입력 & 실행 */}
            <div className={styles.composeTest}>
              <h3 className={styles.selectorTitle}>숫자를 넣어보세요</h3>
              <div className={styles.chipRow}>
                {[1, 2, 3, 4, 5, 7, 10].map((n) => (
                  <button
                    key={n}
                    className={`${styles.chip} ${composeInput === n ? styles.chipSelected : ''}`}
                    onClick={() => { setComposeInput(n); setComposeSteps([]); }}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <button
                className={styles.runButton}
                onClick={handleComposeRun}
                disabled={composeInput === null || composePipeline.length === 0}
              >
                ▶ 파이프라인 실행!
              </button>
            </div>
          </div>

          {/* 하단: 연산 과정 */}
          {composeSteps.length > 0 && (
            <div className={styles.composeResult}>
              <h3 className={styles.selectorTitle}>연산 과정</h3>
              <div className={styles.composeTrace}>
                <div className={styles.traceRow}>
                  <span className={styles.traceLabel}>📥 입력</span>
                  <span className={styles.traceValue}>{composeInput}</span>
                </div>
                {composeSteps.map((step, i) => (
                  <div key={i} className={styles.traceRow}>
                    <span className={styles.traceLabel}>{step.fn}</span>
                    <span className={`${styles.traceValue} ${i === composeSteps.length - 1 ? styles.traceFinal : ''}`}>
                      {step.result}
                    </span>
                  </div>
                ))}
              </div>
              <div className={styles.codeBlock}>
                <code>
                  {composePipeline.map((fnIdx, i) => {
                    const f = FUNCTIONS[fnIdx];
                    return (
                      <span key={i}>
                        {i === 0 ? '' : ' → '}
                        <span className={styles.codeFnName}>{f.name}</span>()
                      </span>
                    );
                  })}
                </code>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
