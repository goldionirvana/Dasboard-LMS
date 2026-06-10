/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  division: 'Kitchen' | 'Service' | 'Warehouse' | 'Management';
  branch: 'Malang' | 'Garut' | 'Bandung';
  area: 'Area Barat' | 'Area Timur';
  regional: 'Regional Jawa' | 'Regional Bali';
  role: string;
  dateCreated: string;
  lastLogin: string | null; // Null means "Belum Pernah Login"
  status: 'Active' | 'Inactive';
  learningHours: number;
}

export interface Course {
  id: string;
  title: string;
  category: 'Food Safety' | 'Leadership' | 'SOP' | 'Service Excellence';
  enrollmentCount: number;
  completionRate: number; // in %
  totalAccess: number;
  lastAccess: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  userName: string;
  userDivision: string;
  userBranch: string;
  courseId: string;
  courseTitle: string;
  progress: number; // 0 - 100%
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Overdue';
  quizScore: number | null;
  learningHours: number;
  deadline: string;
}

export interface Activity {
  id: string;
  userName: string;
  userDivision: string;
  type: 'login' | 'course_completed' | 'quiz_finished' | 'cert_issued' | 'course_published';
  detail: string;
  timestamp: string; // ISO string or relative time
}

export interface PrePostTest {
  id: string;
  userName: string;
  className: string;
  preTest: number;
  postTest: number;
}

export interface FeedbackAspect {
  aspect: string;
  score: number; // out of 5
}

export interface FeedbackComment {
  id: string;
  userName: string;
  courseTitle: string;
  comment: string;
  rating: number;
  timestamp: string;
}

export interface TeamMember {
  id: string;
  name: string;
  division: string;
  branch: string;
  progress: number;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Overdue';
  quizScore: number;
  learningHours: number;
  deadline: string;
}

export type DashboardRole = 'admin' | 'manager' | 'trainer';

export interface FilterState {
  periode: 'all' | 'today' | '7days' | '30days';
  branch: 'all' | 'Malang' | 'Garut' | 'Bandung';
  area: 'all' | 'Area Barat' | 'Area Timur';
  regional: 'all' | 'Regional Jawa' | 'Regional Bali';
  division: 'all' | 'Kitchen' | 'Service' | 'Warehouse' | 'Management';
  category: 'all' | 'Food Safety' | 'Leadership' | 'SOP' | 'Service Excellence';
}
