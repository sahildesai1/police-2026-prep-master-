
export interface MCQ {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface ResearchData {
  summary: string;
  studyNotes?: string; // HTML string for detailed notes
  mcqs: MCQ[];
  sources: { title: string; uri: string }[];
  type: 'test' | 'study-flash' | 'study-pro';
  imageUrl?: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  RESEARCHING = 'RESEARCHING',
  GENERATING_MCQS = 'GENERATING_MCQS',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface AppState {
  loading: LoadingState;
  data: ResearchData | null;
  error: string | null;
  currentTopic: string;
  mode: 'test' | 'study-flash' | 'study-pro';
}
