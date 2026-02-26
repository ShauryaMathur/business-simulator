export function formatQuarterLabel(quarter: number) {
  const normalizedQuarter = Math.max(quarter, 1);
  const year = Math.floor((normalizedQuarter - 1) / 4) + 1;
  const quarterInYear = ((normalizedQuarter - 1) % 4) + 1;
  return `Year ${year} Q${quarterInYear}`;
}
