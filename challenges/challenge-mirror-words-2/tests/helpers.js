export function mirrorRef(s) {
  const tokens = [];
  const n = s.length;
  let i = 0;

  while (i < n) {
    while (i < n && isWhitespace(s[i])) i++;
    if (i >= n) break;

    if (s[i] === '"') {
      i++;
      const start = i;
      while (i < n && s[i] !== '"') i++;
      const phrase = s.slice(start, i);
      tokens.push(`"${reverseString(phrase)}"`);
      if (i < n && s[i] === '"') i++;
    } else {
      const start = i;
      while (i < n && !isWhitespace(s[i])) i++;
      const word = s.slice(start, i);
      tokens.push(reverseString(word));
    }
  }

  return tokens.join(" ");
}

export function hasDoubleSpaceOutsideQuotes(s) {
  let inQuote = false;
  for (let i = 0; i < s.length - 1; i++) {
    if (s[i] === '"') inQuote = !inQuote;
    if (!inQuote && s[i] === " " && s[i + 1] === " ") return true;
  }
  return false;
}

function isWhitespace(ch) {
  return ch === " " || ch === "\t" || ch === "\n" || ch === "\r";
}

function reverseString(str) {
  const out = new Array(str.length);
  for (let i = 0; i < str.length; i++) {
    out[str.length - 1 - i] = str[i];
  }
  return out.join("");
}
