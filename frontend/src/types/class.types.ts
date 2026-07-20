export interface Course {
  id: number;
  teacher_class_id: number;
  name: string;
}

export interface TeacherClass {
  id: number;
  teacher_id: number;
  name: string;
  courses?: Course[];
}

export interface ClassesResponse {
  success: boolean;
  data: TeacherClass[];
  message?: string;
}

export interface ClassResponse {
  success: boolean;
  data: TeacherClass;
  message?: string;
}
export interface CourseResponse {
  success: boolean;
  data: Course;
  message?: string;
}
