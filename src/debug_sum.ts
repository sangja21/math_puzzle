
import { solvePuzzle } from './lib/puzzles/sum_product';

const MAX = 20;
console.log(`Checking logic for Max=${MAX}...`);

const result = solvePuzzle(MAX);

console.log('Initial count:', result.initial.length);
console.log('Step 1 count:', result.step1.length);
console.log('Step 2 count:', result.step2.length);
console.log('Step 3 count:', result.step3.length);
console.log('Step 4 count:', result.step4.length);

console.log('Final answers:', result.step4);

// Check (2, 6)
const id = '2-6';
const inInit = result.initial.some(c => c.id === id);
const inS1 = result.step1.some(c => c.id === id);
const inS2 = result.step2.some(c => c.id === id);
const inS3 = result.step3.some(c => c.id === id);
const inS4 = result.step4.some(c => c.id === id);

console.log(`(2, 6) status:`);
console.log(`- Initial: ${inInit}`);
console.log(`- Step 1 (P unknown): ${inS1}`);
console.log(`- Step 2 (S knew P unknown): ${inS2}`);
console.log(`- Step 3 (P knows): ${inS3}`);
console.log(`- Step 4 (S knows): ${inS4}`);

// Why failed Step 2?
if (inS1 && !inS2) {
    const s = 8; // 2+6
    // S=8인 모든 후보 찾기
    const sumCands = result.initial.filter(c => c.s === s);
    console.log(`Candidates with Sum=8 (${sumCands.length}):`);
    sumCands.forEach(c => {
        // Step 1 통과 여부
        const passedS1 = result.step1.some(s1 => s1.id === c.id);
        console.log(`- (${c.x}, ${c.y}) P=${c.p} => Passed Step 1? ${passedS1}`);
    });
}
