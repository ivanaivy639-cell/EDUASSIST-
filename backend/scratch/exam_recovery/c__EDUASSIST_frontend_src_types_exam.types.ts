export interface Exam {
  id: number;
  title: string;
  token: string;
  public_url: string;
  duration_minutes: number;
  max_score: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  submissions_count: number;
  graded_count: number;
  average_score: number | null;
  created_at: string;
}

export interface ExamDetail {
  id: number;
  title: string;
  content: string;
  answer_key: string | null;
  token: string;
  public_url: string;
  duration_minutes: number;
  max_score: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

export interface ExamSubmission {
  id: number;
  student_name: string;
  student_matricule: string;
  score: number | null;
  max_score: number;
  status: 'in_progress' | 'submitted' | 'graded' | 'expired' | 'disqualified';
  tab_switches: number;
  is_auto_submitted: boolean;
  ai_feedback: string | null;
  answers: string | null;
  started_at: string | null;
  submitted_at: string | null;
}

export interface ExamStats {
  total_submissions: number;
  graded: number;
  in_progress: number;
  disqualified: number;
  average_score: number | null;
  max_achieved: number | null;
  min_achieved: number | null;
}

export interface ExamResultsStats {
  total: number;
  graded: number;
  in_progress: number;
  disqualified: number;
  average: number | null;
  median: number | null;
  max_achieved: number | null;
  min_achieved: number | null;
  pass_rate: number | null;
  histogram: Record<string, number>;
}

export interface ExamCreateRequest {
  title: string;
  content: string;
  answer_key?: string;
  duration_minutes: number;
  max_score?: number;
  course_id?: number;
  starts_at?: string;
  ends_at?: string;
}

export interface ExamCreateResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    title: string;
    token: string;
    public_url: string;
    duration_minutes: number;
    max_score: number;
    created_at: string;
  };
}

export interface ExamListResponse {
  success: boolean;
  data: Exam[];
}

export interface ExamDetailResponse {
  success: boolean;
  data: {
    exam: ExamDetail;
    submissions: ExamSubmission[];
    stats: ExamStats;
  };
}

export interface ExamResultsResponse {
  success: boolean;
  data: {
    exam: {
      id: number;
      title: string;
      max_score: number;
      duration_minutes: number;
    };
    stats: ExamResultsStats;
    submissions: ExamSubmission[];
  };
}
