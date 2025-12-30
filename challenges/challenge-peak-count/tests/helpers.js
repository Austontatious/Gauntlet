export function countPeaksRef(arr) {
  let c = 0;
  for (let i = 1; i + 1 < arr.length; i++) {
    if (arr[i] > arr[i - 1] && arr[i] > arr[i + 1]) c++;
  }
  return c;
}
