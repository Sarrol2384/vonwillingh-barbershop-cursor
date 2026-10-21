export const HOUSE_CALL_NOTICE_MS = 24 * 60 * 60 * 1000;

export function parseServiceDuration(duration: string): number {
  const match = duration.match(/(\d+)/);
  const minutes = match ? Number.parseInt(match[1], 10) : 30;
  return Number.isFinite(minutes) && minutes > 0 ? minutes : 30;
}

export function isHouseCallService(name: string): boolean {
  return /\bhouse\s*calls?\b/i.test(name);
}

export function noticeWindowMs(serviceName: string): number {
  return isHouseCallService(serviceName) ? HOUSE_CALL_NOTICE_MS : 0;
}
