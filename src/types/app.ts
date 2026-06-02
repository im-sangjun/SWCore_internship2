export type UserRole = 'admin' | 'manager' | 'student'

export type ManagerStatus = 'pending' | 'approved' | 'rejected'

export type InternshipTerm = '1학기' | '하계' | '2학기' | '동계'

export type SessionStatus =
  | 'draft'
  | 'open'
  | 'closed'
  | 'matching'
  | 'completed'

export type ApplicationStatus =
  | 'submitted'
  | 'reviewing'
  | 'selected'
  | 'rejected'
  | 'canceled'

export interface Profile {
  id: string
  email: string
  name: string | null
  role: UserRole
  student_no: string | null
  department: string | null
  grade: number | null
  desired_job: string | null
  manager_status: ManagerStatus | null
}
