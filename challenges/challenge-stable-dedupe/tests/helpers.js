export function stableUniqueRef(lines) {
  const seen = new Set();
  const out = [];
  for (const s of lines) {
    if (!seen.has(s)) {
      seen.add(s);
      out.push(s);
    }
  }
  return out;
}
