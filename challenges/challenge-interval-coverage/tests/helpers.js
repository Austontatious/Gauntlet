export function coverageRef(intervals) {
  const arr = intervals.slice().sort((a, b) => (a[0] - b[0]) || (a[1] - b[1]));
  let total = 0n;
  let curL = null;
  let curR = null;

  for (const [l, r] of arr) {
    if (curL === null) {
      curL = l;
      curR = r;
      continue;
    }
    if (l > curR + 1) {
      total += BigInt(curR - curL + 1);
      curL = l;
      curR = r;
    } else {
      if (r > curR) curR = r;
    }
  }
  if (curL !== null) total += BigInt(curR - curL + 1);
  return total;
}
