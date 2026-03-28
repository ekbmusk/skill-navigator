export interface LiveCheckResult {
  suspicious: boolean;
  reason: string | null;
}

export function runLiveCheck(
  answers: Record<number, number>,
  questionTimestamps: Record<number, number>
): LiveCheckResult {
  const values = Object.values(answers);
  if (values.length < 4) return { suspicious: false, reason: null };

  // Check 1: Straight-lining — same answer for last 4+ questions
  const last4 = values.slice(-4);
  if (last4.every(v => v === last4[0])) {
    return { suspicious: true, reason: "STRAIGHT_LINE" };
  }

  // Check 2: Speed — average < 2s per question for last 4
  const timestamps = Object.values(questionTimestamps);
  if (timestamps.length >= 4) {
    const recent = timestamps.slice(-4);
    const avgMs = recent.reduce((sum, ts, i) => {
      if (i === 0) return 0;
      return sum + (ts - recent[i - 1]);
    }, 0) / (recent.length - 1);
    if (avgMs < 2000 && avgMs > 0) {
      return { suspicious: true, reason: "SPEED" };
    }
  }

  // Check 3: Pattern — alternating or periodic in last 8
  if (values.length >= 8) {
    const last8 = values.slice(-8);
    let periodicMatch = 0;
    for (let i = 2; i < last8.length; i++) {
      if (last8[i] === last8[i - 2]) periodicMatch++;
    }
    if (periodicMatch >= 5) {
      return { suspicious: true, reason: "PATTERN" };
    }
  }

  return { suspicious: false, reason: null };
}
