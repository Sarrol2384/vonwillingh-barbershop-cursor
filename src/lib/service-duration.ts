export function parseServiceDuration(duration: string): number {
  const match = duration.match(/(\d+)/);
  return match ? Number.parseInt(match[1], 10) : 30;
}
