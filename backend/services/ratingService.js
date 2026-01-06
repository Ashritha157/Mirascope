function normalizeRating(input) {
  if (!input) return null;

  const num = parseInt(input);
  if (!isNaN(num) && num >= 1 && num <= 5) {
    return num;
  }

  const text = input.toLowerCase().trim();

  if (["excellent", "amazing", "perfect", "outstanding"].some(w => text.includes(w))) return 5;
  if (["very good"].some(w => text.includes(w))) return 4;
  if (["good", "satisfied", "happy"].some(w => text.includes(w))) return 4;
  if (["average", "okay", "ok", "neutral"].some(w => text.includes(w))) return 3;
  if (["bad", "poor", "unsatisfied"].some(w => text.includes(w))) return 2;
  if (["very bad", "terrible", "awful"].some(w => text.includes(w))) return 1;

  return null;
}

module.exports = { normalizeRating };
