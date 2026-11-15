export type TopicSummary = {
  id: string;
  title: string;
  summary: string;
  updatedAt: string;
  originalQuestion?: string | null;
};
export type DayCount = { day: string; count: number };
export type SlideSource = {
  key: string;
  filename: string;
  storagePath: string;
  start: number;
  end: number;
  count: number;
  url: string | null;
};

export type Conversation = {
  id: string;
  title: string | null;
  created_at: string;
};

export type TopicoDisciplina = {
  id: string;
  title: string;
  description: string | null;
};
