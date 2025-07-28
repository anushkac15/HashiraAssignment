const fs = require('fs');

function convertToDecimal(val, base) {
    const b = BigInt(base);
    let res = BigInt(0);
    let pow = BigInt(0);
    
    for (let i = val.length - 1; i >= 0; i--) {
        const ch = val[i];
        let dig;
        
        if (ch >= '0' && ch <= '9') {
            dig = BigInt(ch);
        } else {
            dig = BigInt(ch.charCodeAt(0) - 'a'.charCodeAt(0) + 10);
        }
        
        res += dig * (b ** pow);
        pow++;
    }
    
    return res;
}

function lagrangeInterpolation(pts) {
    const k = pts.length;
    let sec = BigInt(0);
    
    for (let i = 0; i < k; i++) {
        const xi = BigInt(pts[i].x);
        const yi = BigInt(pts[i].y);
        
        let num = BigInt(1);
        let den = BigInt(1);
        
        for (let j = 0; j < k; j++) {
            if (i !== j) {
                const xj = BigInt(pts[j].x);
                num *= (BigInt(0) - xj);
                den *= (xi - xj);
            }
        }
        
        sec += yi * num / den;
    }
    
    return sec;
}

function getCombinations(arr, k) {
    if (k === 1) return arr.map(x => [x]);
    if (k === arr.length) return [arr];
    
    const combos = [];
    
    function gen(start, curr) {
        if (curr.length === k) {
            combos.push([...curr]);
            return;
        }
        
        for (let i = start; i <= arr.length - (k - curr.length); i++) {
            curr.push(arr[i]);
            gen(i + 1, curr);
            curr.pop();
        }
    }
    
    gen(0, []);
    return combos;
}

function getMajoritySecret(secs) {
    const counts = new Map();
    
    for (const sec of secs) {
        const str = sec.toString();
        counts.set(str, (counts.get(str) || 0) + 1);
    }
    
    let maxCount = 0;
    let majoritySecret = secs[0];
    
    for (const [secStr, count] of counts.entries()) {
        if (count > maxCount) {
            maxCount = count;
            majoritySecret = BigInt(secStr);
        }
    }
    
    return { secret: majoritySecret, count: maxCount, total: secs.length };
}

function parseTestCase(data) {
    const k = data.keys.k;
    const pts = [];
    
    for (let key in data) {
        if (key !== 'keys') {
            const x = parseInt(key);
            const base = parseInt(data[key].base);
            const val = data[key].value;
            
            const y = convertToDecimal(val, base);
            
            pts.push({ x: x, y: y });
        }
    }
    
    return {
        allPts: pts,
        k: k
    };
}

function findSecret(filename) {
    const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
    const { allPts, k } = parseTestCase(data);
    
    console.log(`\nProcessing ${filename}:`);
    console.log(`Total points available: ${data.keys.n}, Need: ${k} points for degree ${k-1} polynomial`);
    
    console.log('\nAll decoded points:');
    for (let i = 0; i < allPts.length; i++) {
        console.log(`Point ${i + 1}: (${allPts[i].x}, ${allPts[i].y})`);
    }
    
    const combos = getCombinations(allPts, k);
    console.log(`\nTesting all ${combos.length} combinations of ${k} points:`);
    
    const secs = [];
    for (let i = 0; i < combos.length; i++) {
        const combo = combos[i];
        const sec = lagrangeInterpolation(combo);
        secs.push(sec);
        
        if (i < 5) {
            const ptsStr = combo.map(p => `(${p.x},${p.y})`).join(', ');
            console.log(`Combination ${i + 1}: ${ptsStr}`);
            console.log(`  Secret: ${sec}`);
        }
    }
    
    if (combos.length > 5) {
        console.log(`... (${combos.length - 5} more combinations tested)`);
    }
    
    const { secret: majoritySecret, count, total } = getMajoritySecret(secs);
    
    console.log(`\nMajority Voting Results:`);
    console.log(`Secret ${majoritySecret} appears ${count}/${total} times (${(count/total*100).toFixed(1)}%)`);
    console.log(`Final Secret (majority): ${majoritySecret}`);
    
    return majoritySecret;
}

function main() {
    console.log('Shamir\'s Secret Sharing - Majority Voting Approach');
    console.log('='.repeat(60));
    
    const sec1 = findSecret('testcase1.json');
    const sec2 = findSecret('testcase2.json');
    
    console.log('\n' + '='.repeat(60));
    console.log('FINAL RESULTS (MAJORITY VOTING):');
    console.log(`Test Case 1 Secret: ${sec1}`);
    console.log(`Test Case 2 Secret: ${sec2}`);
}

main(); 