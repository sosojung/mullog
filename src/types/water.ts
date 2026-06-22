export type WaterRecord = {
  id: string;
  amount: number;
  timestamp: number;
};

export type WaterState = {
  records: WaterRecord[];
  dailyGoal: number;
};
