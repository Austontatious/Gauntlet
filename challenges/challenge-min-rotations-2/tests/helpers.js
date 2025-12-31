export function minRotationsRef(a, b) {
  const n = a.length;
  for (let k = 0; k < n; k++) {
    const rotated = a.slice(k) + a.slice(0, k);
    if (matchesPattern(rotated, b)) return k;
  }
  return -1;
}

function matchesPattern(str, pattern) {
  const star = pattern.indexOf("*");
  if (star === -1) return str === pattern;
  const prefix = pattern.slice(0, star);
  const suffix = pattern.slice(star + 1);
  if (!str.startsWith(prefix)) return false;
  if (!str.endsWith(suffix)) return false;
  return prefix.length + suffix.length <= str.length;
}
