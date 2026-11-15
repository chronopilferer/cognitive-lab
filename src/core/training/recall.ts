export function scoreRecall(answer: string[], expected: string[]) {
  return {
    correct: expected.filter((v, i) => v === answer[i]?.trim()).length,
    total: expected.length,
  };
}
