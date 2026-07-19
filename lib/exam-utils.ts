import type { ExamType, ExamStatus, StudentExamStatus, QuestionType } from './types'

export const EXAM_TYPE_LABEL: Record<ExamType, string> = {
  attendance: 'Attendance',
  periodic: 'Periodic',
  free: 'Free',
}

export const EXAM_STATUS_LABEL: Record<ExamStatus, string> = {
  open: 'Open',
  locked: 'Locked',
  draft: 'Draft',
}

export const STUDENT_STATUS_LABEL: Record<StudentExamStatus, string> = {
  passed: 'Passed',
  failed: 'Failed',
  'not-started': 'Not started',
}

export const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  'multiple-choice': 'Multiple choice',
  'true-false': 'True / False',
  'short-answer': 'Short answer',
}

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost'

export function examStatusVariant(status: ExamStatus): BadgeVariant {
  switch (status) {
    case 'open':
      return 'default'
    case 'locked':
      return 'destructive'
    case 'draft':
      return 'secondary'
  }
}

export function studentStatusVariant(status: StudentExamStatus): BadgeVariant {
  switch (status) {
    case 'passed':
      return 'default'
    case 'failed':
      return 'destructive'
    case 'not-started':
      return 'secondary'
  }
}

/** Trigger a client-side CSV download to emulate an Excel export (mock only). */
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
