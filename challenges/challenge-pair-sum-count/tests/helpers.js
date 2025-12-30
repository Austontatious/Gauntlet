export function pairCountRef(arr, target) {
  const freq = new Map();
  let count = 0n;
  for (const x of arr) {
    const want = target - x;
    const f = freq.get(want) || 0;
    count += BigInt(f);
    freq.set(x, (freq.get(x) || 0) + 1);
  }
  return count;
}
