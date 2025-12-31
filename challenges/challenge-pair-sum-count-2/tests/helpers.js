export function pairSumCountsRef(arr, queries) {
  const freq = new Map();
  for (const v of arr) freq.set(v, (freq.get(v) || 0) + 1);
  const keys = Array.from(freq.keys());
  const results = [];

  for (const target of queries) {
    let count = 0n;
    for (const x of keys) {
      const y = target - x;
      if (!freq.has(y)) continue;
      if (x < y) {
        count += BigInt(freq.get(x)) * BigInt(freq.get(y));
      } else if (x === y) {
        const f = BigInt(freq.get(x));
        count += (f * (f - 1n)) / 2n;
      }
    }
    results.push(count);
  }

  return results;
}
