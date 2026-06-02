import type { InternshipSession } from '../types/app'

export function formatSessionLabel(session?: InternshipSession | null) {
  if (!session) return '-'
  return `${session.year}년 ${session.term}`
}
