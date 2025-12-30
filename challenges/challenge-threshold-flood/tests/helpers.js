export function floodRef(grid, queries) {
  const H = grid.length;
  const W = grid[0].length;
  const res = [];

  const dirs = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  for (const [sr, sc, t] of queries) {
    if (sr < 0 || sr >= H || sc < 0 || sc >= W) {
      res.push(0);
      continue;
    }
    if (grid[sr][sc] < t) {
      res.push(0);
      continue;
    }

    const seen = new Uint8Array(H * W);
    const q = [];
    const start = sr * W + sc;
    seen[start] = 1;
    q.push(start);
    let count = 0;

    while (q.length) {
      const cur = q.pop();
      count++;
      const r = Math.floor(cur / W);
      const c = cur % W;
      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= H || nc < 0 || nc >= W) continue;
        if (grid[nr][nc] < t) continue;
        const ni = nr * W + nc;
        if (seen[ni]) continue;
        seen[ni] = 1;
        q.push(ni);
      }
    }
    res.push(count);
  }
  return res;
}
