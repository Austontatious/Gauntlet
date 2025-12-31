export function parseLogsRef(lines) {
  const sessions = new Map();
  const output = [];

  for (const line of lines) {
    const parts = line.split(" ");
    if (parts.length < 3) continue;
    const ts = Number(parts[0]);
    const sessionId = parts[1];
    const event = parts[2];

    if (event === "START") {
      sessions.set(sessionId, { start: ts, score: 0 });
    } else if (event === "SCORE") {
      if (!sessions.has(sessionId)) continue;
      const value = Number(parts[3]);
      const entry = sessions.get(sessionId);
      entry.score += value;
    } else if (event === "END") {
      if (!sessions.has(sessionId)) continue;
      const entry = sessions.get(sessionId);
      output.push({
        sessionId,
        durationMs: ts - entry.start,
        totalScore: entry.score,
      });
      sessions.delete(sessionId);
    }
  }

  return output;
}
