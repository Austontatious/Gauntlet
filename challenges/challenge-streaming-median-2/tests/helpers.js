export function slidingMedianRef(arr, k) {
  const out = [];
  for (let i = 0; i + k <= arr.length; i++) {
    const window = arr.slice(i, i + k).sort((a, b) => a - b);
    out.push(window[Math.floor((k - 1) / 2)]);
  }
  return out;
}

export function windowMedian(arr, start, k) {
  const window = arr.slice(start, start + k).sort((a, b) => a - b);
  return window[Math.floor((k - 1) / 2)];
}
