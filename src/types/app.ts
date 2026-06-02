export type UserRole = 'admin' | 'manager' | 'student'

export type ManagerStatus = 'pending' | 'approved' | 'rejected'

export type InternshipTerm =
  | '1학기'
  | '하계'
  | '하계_2학기'
  | '2학기'
  | '동계'
  | '동계_1학기'

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

export type MatchingStatus = 'matched' | 'confirmed' | 'canceled'

export type RecruitmentStatus = 'open' | 'reviewing' | 'closed'

export interface Profile {
  id: string
  email: string
  name: string | null
  phone: string | null
  role: UserRole
  student_no: string | null
  department: string | null
  grade: number | null
  desired_job: string | null
  manager_status: ManagerStatus | null
}

export interface InternshipSession {
  id: string
  year: number
  term: InternshipTerm
  name: string
  application_start: string | null
  application_end: string | null
  status: SessionStatus
}

export interface JobCode {
  id: string
  code: string
  name: string
  description: string | null
  is_active: boolean
  sort_order: number
}

export interface Company {
  id: string
  company_name: string
  business_type: string | null
  address: string | null
  contact_name: string | null
  contact_email: string | null
  contact_phone: string | null
  description: string | null
  is_active: boolean
}

export interface Recruitment {
  id: string
  session_id: string
  company_id: string
  job_code_id: string | null
  title: string
  recruit_count: number
  related_departments: string[] | null
  target_grades: number[] | null
  employment_linked: boolean
  is_visible_to_students: boolean
  description: string | null
  requirements: string | null
  status: RecruitmentStatus
  companies?: Company | null
  internship_sessions?: InternshipSession | null
  job_codes?: JobCode | null
}

export interface Application {
  id: string
  session_id: string
  student_id: string
  first_recruitment_id: string | null
  second_recruitment_id: string | null
  status: ApplicationStatus
  memo: string | null
  submitted_at: string
  profiles?: Profile | null
  internship_sessions?: InternshipSession | null
  first_recruitment?: Recruitment | null
  second_recruitment?: Recruitment | null
}

export interface Matching {
  id: string
  session_id: string
  student_id: string
  company_id: string
  recruitment_id: string | null
  status: MatchingStatus
  companies?: Company | null
  internship_recruitments?: Recruitment | null
  internship_sessions?: InternshipSession | null
}
