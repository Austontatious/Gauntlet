export function medianLower(sorted) {
  const n = sorted.length;
  const mid = Math.floor((n - 1) / 2);
  return sorted[mid];
}

export function runRef(ops) {
  const arr = [];
  const out = [];

  for (const op of ops) {
    if (op === "?") {
      const s = arr.slice().sort((a, b) => a - b);
      out.push(medianLower(s));
      continue;
    }
    const [sign, numStr] = op.split(/\s+/);
    const x = Number(numStr);
    if (sign === "+") {
      arr.push(x);
    } else if (sign === "-") {
      const idx = arr.indexOf(x);
      if (idx === -1) throw new Error("ref: tried to delete missing element");
      arr.splice(idx, 1);
    } else {
      throw new Error("ref: bad op " + op);
    }
  }
  return out;
}
