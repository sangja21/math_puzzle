'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

/**
 * 리스트(배열) 학습 체험관 (Lists / Arrays)
 * 
 * 컨셉: 칸이 나뉜 '기차(Train)'에 화물(데이터)을 싣고 내리는 체험
 * 1. append(push): 기차 맨 뒤에 화물칸 추가
 * 2. pop: 기차 맨 뒤 화물칸 제거
 * 3. update: 특정 번째(index) 칸의 화물 변경
 */
export default function ListsPage() {
    const [list, setList] = useState<number[]>([10, 20]);
    const [inputValue, setInputValue] = useState<string>('');

    // 요소 추가 (Push)
    const handlePush = () => {
        const val = parseInt(inputValue, 10);
        if (isNaN(val)) {
            alert('숫자를 입력해주세요!');
            return;
        }
        if (list.length >= 7) {
            alert('기차가 꽉 찼어요! (최대 7개)');
            return;
        }
        setList([...list, val]);
        setInputValue('');
    };

    // 마지막 요소 제거 (Pop)
    const handlePop = () => {
        if (list.length === 0) {
            alert('기차가 이미 비어있어요!');
            return;
        }
        setList(list.slice(0, -1));
    };

    // 특정 인덱스 요소 업데이트
    const handleUpdate = (index: number) => {
        const newValStr = prompt(`[${index}]번째 칸의 값을 무엇으로 바꿀까요?`, String(list[index]));
        if (newValStr === null) return;

        const newVal = parseInt(newValStr, 10);
        if (isNaN(newVal)) {
            alert('숫자만 입력 가능합니다!');
            return;
        }

        const newList = [...list];
        newList[index] = newVal;
        setList(newList);
    };

    return (
        <div className={styles.container}>
            <Link href="/coding" className={styles.backButton}>
                ← 코딩의 원리
            </Link>

            <header className={styles.header}>
                <h1 className={styles.title}>🍡 데이터 기차 (리스트)</h1>
                <p className={styles.subtitle}>
                    여러 개의 데이터를 하나의 이름표로 관리하는 방법, 리스트(배열)를 배워요!
                </p>
            </header>

            <div className={styles.mainContent}>

                {/* 설명 및 코드 매핑 섹션 */}
                <div className={styles.explainPanel}>
                    <h3>📝 리스트(배열)란?</h3>
                    <p>
                        데이터가 많아지면 상자(변수)를 무한정 만들 수 없어요.<br />
                        이럴 때 <strong>데이터 기차(리스트)</strong>를 만들면 하나의 기차 안에 여러 개의 데이터를 0번째, 1번째, 2번째... 줄지어 보관할 수 있습니다.
                    </p>
                    <div className={styles.codeBlock}>
                        <code>
                            let train = [<span className={styles.codeValue}>{list.join(', ')}</span>];<br />
                            <span className={styles.codeComment}>{'// 현재 기차의 길이(length): '}{list.length}</span>
                        </code>
                    </div>
                </div>

                <div className={styles.interactiveArea}>

                    {/* 컨트롤 영역 */}
                    <div className={styles.controlsRow}>
                        <div className={styles.inputGroup}>
                            <input
                                type="number"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="넣을 숫자 입력"
                                className={styles.numInput}
                            />
                            <button className={styles.actionBtn} onClick={handlePush}>
                                ➕ 맨 뒤에 추가 (Push)
                            </button>
                        </div>
                        <button className={`${styles.actionBtn} ${styles.dangerBtn}`} onClick={handlePop}>
                            ❌ 맨 뒤에서 빼기 (Pop)
                        </button>
                    </div>

                    <div className={styles.divider} />

                    {/* 시각화 영역 (데이터 기차) */}
                    <div className={styles.trainStage}>

                        <div className={styles.locomotive}>🚂 변수: train</div>

                        <div className={styles.wagonsContainer}>
                            {list.length === 0 && (
                                <div className={styles.emptyTrainMsg}>기차가 비어있습니다. 데이터를 추가해보세요!</div>
                            )}
                            {list.map((item, index) => (
                                <div key={index} className={styles.wagonWrapper}>
                                    <div className={styles.wagonLink}>🔗</div>
                                    <div
                                        className={styles.wagon}
                                        onClick={() => handleUpdate(index)}
                                        title="클릭해서 값 수정하기"
                                    >
                                        <div className={styles.wagonIndex}>[{index}]</div>
                                        <div className={styles.wagonContent}>{item}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                    <p className={styles.hintText}>💡 화물칸을 클릭하면 값을 직접(Update) 바꿀 수 있어요!</p>
                </div>

            </div>
        </div>
    );
}
