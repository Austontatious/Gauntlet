export function intervalCoverageRef(intervals) {
  if (intervals.length === 0) {
    return { covered: 0n, maxOverlap: 0 };
  }

  const sorted = intervals.slice().sort((a, b) => (a[0] - b[0]) || (a[1] - b[1]));

  let covered = 0n;
  let curL = sorted[0][0];
  let curR = sorted[0][1];

  for (let i = 1; i < sorted.length; i++) {
    const [l, r] = sorted[i];
    if (l > curR + 1) {
      covered += BigInt(curR - curL + 1);
      curL = l;
      curR = r;
    } else if (r > curR) {
      curR = r;
    }
  }
  covered += BigInt(curR - curL + 1);

  const events = [];
  for (const [l, r] of intervals) {
    events.push([l, 1]);
    events.push([r + 1, -1]);
  }
  events.sort((a, b) => a[0] - b[0]);

  let maxOverlap = 0;
  let current = 0;
  let idx = 0;
  while (idx < events.length) {
    const pos = events[idx][0];
    let delta = 0;
    while (idx < events.length && events[idx][0] === pos) {
      delta += events[idx][1];
      idx++;
    }
    current += delta;
    if (current > maxOverlap) maxOverlap = current;
  }

  return { covered, maxOverlap };
}
