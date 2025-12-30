export function minRotRef(a, b) {
  if (a.length !== b.length) return -1;
  if (a === b) return 0;
  const aa = a + a;
  const idx = aa.indexOf(b);
  if (idx === -1 || idx >= a.length) return -1;
  return idx;
}
