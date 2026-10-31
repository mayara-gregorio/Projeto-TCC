export type Question = {
  id: string;
  content: string;
  createdAt: string;
  confidence: number | null;
};
export type SlideSource = {
  key: string;
  filename: string;
  start: number;
  end: number;
  count: number;
  url: string | null;
};
export type DayCount = { day: string; count: number };