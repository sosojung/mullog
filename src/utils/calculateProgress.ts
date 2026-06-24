import { WaterRecord } from '../types/water';

function toDateString(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function todayString(): string {
  return toDateString(Date.now());
}

export function getTodayTotal(records: WaterRecord[]): number {
  const today = todayString();
  return records
    .filter(r => toDateString(r.timestamp) === today)
    .reduce((sum, r) => sum + r.amount, 0);
}

export function getProgressPercent(total: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.min(100, Math.round((total / goal) * 100));
}

export function getStreak(records: WaterRecord[], dailyGoal: number): number {
  if (dailyGoal <= 0) return 0;
  let streak = 0;
  const d = new Date();
  // 오늘 달성 여부 확인 후 역순으로 카운트
  while (true) {
    const dateStr = toDateString(d.getTime());
    const total = records
      .filter(r => toDateString(r.timestamp) === dateStr)
      .reduce((sum, r) => sum + r.amount, 0);
    if (total < dailyGoal) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function getLast7Days(records: WaterRecord[]): { date: string; total: number }[] {
  const days: { date: string; total: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = toDateString(d.getTime());
    const total = records
      .filter(r => toDateString(r.timestamp) === dateStr)
      .reduce((sum, r) => sum + r.amount, 0);
    days.push({ date: dateStr, total });
  }

  return days;
}
