export function peakCountRef(arr) {
  let count = 0;
  const n = arr.length;
  let i = 0;

  while (i < n) {
    const v = arr[i];
    let j = i + 1;
    while (j < n && arr[j] === v) j++;
    const end = j - 1;

    if (i > 0 && end < n - 1 && v > arr[i - 1] && v > arr[end + 1]) {
      count++;
    }
    i = j;
  }

  return count;
}
