import type {
  User,
  Course,
  Exam,
  StudentRecord,
  LeaderboardEntry,
  AppNotification,
} from './types'

export const MOCK_USERS: Record<string, User> = {
  teacher: {
    id: 'u-teacher',
    name: 'Tran Thi Mai',
    email: 'teacher@mathster.edu.vn',
    role: 'teacher',
    avatar: '/teacher-avatar.png',
    bio: 'Senior Mathematics Teacher · 12 years preparing students for the National Graduation Exam.',
    joinedAt: '2019-08-01',
  },
  student: {
    id: 'u-student',
    name: 'Nguyen Van A',
    email: 'student@mathster.edu.vn',
    role: 'student',
    studentCode: 'MS-2027-0184',
    avatar: '/student-avatar.png',
    bio: 'Grade 12 student aiming for a 9+ in the 2027 Graduation Exam.',
    joinedAt: '2024-09-05',
  },
}

// Countdown target: Vietnam High School Graduation Exam 2027 (late June)
export const EXAM_DATE = new Date('2027-06-26T07:00:00')

export const STUDENT_STATS = [
  { label: 'Lessons Learned', value: 142, total: 180, icon: 'BookOpen', trend: '+8 this week' },
  { label: 'Attendance', value: 96, total: 100, icon: 'CalendarCheck', suffix: '%', trend: 'Excellent' },
  { label: 'Assignments Passed', value: 58, total: 64, icon: 'CircleCheckBig', trend: '90% pass rate' },
  { label: 'Periodic Exams', value: 12, total: 14, icon: 'FileCheck', trend: '2 upcoming' },
  { label: 'Average Score', value: 8.4, total: 10, icon: 'TrendingUp', suffix: '/10', trend: '+0.6 vs last month' },
]

export const TEACHER_STATS = [
  { label: 'Total Students', value: 328, icon: 'Users', trend: '+24 this term' },
  { label: 'Total Courses', value: 9, icon: 'Library', trend: '3 active now' },
  { label: 'Total Lessons', value: 214, icon: 'BookOpen', trend: '+12 published' },
  { label: 'Total Exams', value: 46, icon: 'FileText', trend: '5 scheduled' },
]

export const STUDENT_PROGRESS_CHART = [
  { month: 'Sep', score: 6.8, lessons: 12 },
  { month: 'Oct', score: 7.2, lessons: 18 },
  { month: 'Nov', score: 7.5, lessons: 22 },
  { month: 'Dec', score: 7.9, lessons: 25 },
  { month: 'Jan', score: 8.1, lessons: 28 },
  { month: 'Feb', score: 8.0, lessons: 24 },
  { month: 'Mar', score: 8.4, lessons: 30 },
]

export const TEACHER_ACTIVITY_CHART = [
  { month: 'Sep', submissions: 210, active: 280 },
  { month: 'Oct', submissions: 260, active: 295 },
  { month: 'Nov', submissions: 300, active: 310 },
  { month: 'Dec', submissions: 280, active: 305 },
  { month: 'Jan', submissions: 340, active: 320 },
  { month: 'Feb', submissions: 360, active: 318 },
  { month: 'Mar', submissions: 410, active: 328 },
]

export const LEADERBOARD_OVERALL: LeaderboardEntry[] = [
  { rank: 1, name: 'Le Minh Quan', score: 9.6, change: 0 },
  { rank: 2, name: 'Pham Thu Ha', score: 9.4, change: 2 },
  { rank: 3, name: 'Nguyen Van A', score: 9.1, change: 1 },
  { rank: 4, name: 'Do Gia Bao', score: 8.9, change: -2 },
  { rank: 5, name: 'Vu Khanh Linh', score: 8.7, change: 1 },
]

export const LEADERBOARD_LATEST: LeaderboardEntry[] = [
  { rank: 1, name: 'Pham Thu Ha', score: 9.8, change: 3 },
  { rank: 2, name: 'Nguyen Van A', score: 9.5, change: 1 },
  { rank: 3, name: 'Le Minh Quan', score: 9.2, change: -2 },
  { rank: 4, name: 'Tran Bao Ngoc', score: 9.0, change: 4 },
  { rank: 5, name: 'Hoang Duc Anh', score: 8.8, change: 0 },
]

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    title: 'Lesson not completed',
    description: 'Derivatives — Chapter 2: Rules of Differentiation',
    type: 'lesson',
    time: '2h ago',
  },
  {
    id: 'n2',
    title: 'Attendance assignment pending',
    description: 'Weekly Check-in #24 closes tonight at 22:00',
    type: 'attendance',
    time: '5h ago',
  },
  {
    id: 'n3',
    title: 'Lesson not completed',
    description: 'Integrals — Chapter 1: The Antiderivative',
    type: 'lesson',
    time: '1d ago',
  },
  {
    id: 'n4',
    title: 'Periodic exam scheduled',
    description: 'Midterm — Function Analysis on Mar 28',
    type: 'exam',
    time: '2d ago',
  },
]

const YT = 'ZK3O402wf1c'

export const COURSES: Course[] = [
  {
    id: 'c-algebra',
    title: 'Algebra & Functions',
    description: 'Master functions, equations and inequalities — the backbone of the graduation exam.',
    thumbnail: '/course-algebra.png',
    category: 'Grade 12',
    teacher: 'Tran Thi Mai',
    totalLessons: 24,
    progress: 72,
    color: 'oklch(0.86 0.163 91.5)',
    chapters: [
      {
        id: 'ch-1',
        title: 'Chapter 1 · Functions & Graphs',
        lessons: [
          {
            id: 'l-1',
            title: 'Domain, Range & Notation',
            duration: '18:24',
            youtubeId: YT,
            completed: true,
            description: 'Understand function notation and how to determine domain and range.',
            documents: [
              { id: 'd1', title: 'Functions Cheat Sheet.pdf', type: 'pdf' },
              { id: 'd2', title: 'Practice Set 1.sheet', type: 'sheet' },
            ],
            assignmentId: 'e-1',
          },
          {
            id: 'l-2',
            title: 'Linear & Quadratic Functions',
            duration: '22:10',
            youtubeId: YT,
            completed: true,
            description: 'Graphing and analysing linear and quadratic behaviour.',
            documents: [{ id: 'd3', title: 'Quadratics Slides.slide', type: 'slide' }],
          },
          {
            id: 'l-3',
            title: 'Function Transformations',
            duration: '19:45',
            youtubeId: YT,
            completed: false,
            description: 'Shifts, stretches and reflections of parent functions.',
            documents: [{ id: 'd4', title: 'Transformations.pdf', type: 'pdf' }],
            assignmentId: 'e-2',
          },
        ],
      },
      {
        id: 'ch-2',
        title: 'Chapter 2 · Equations & Inequalities',
        lessons: [
          {
            id: 'l-4',
            title: 'Solving Polynomial Equations',
            duration: '25:02',
            youtubeId: YT,
            completed: false,
            description: 'Techniques for solving higher order polynomial equations.',
            documents: [{ id: 'd5', title: 'Polynomials Workbook.pdf', type: 'pdf' }],
          },
          {
            id: 'l-5',
            title: 'Systems of Inequalities',
            duration: '17:33',
            youtubeId: YT,
            completed: false,
            description: 'Graphical and algebraic solutions to inequality systems.',
            documents: [],
          },
        ],
      },
    ],
  },
  {
    id: 'c-calculus',
    title: 'Calculus Essentials',
    description: 'Limits, derivatives and integrals explained with exam-style worked examples.',
    thumbnail: '/course-calculus.png',
    category: 'Grade 12',
    teacher: 'Tran Thi Mai',
    totalLessons: 30,
    progress: 45,
    color: 'oklch(0.79 0.155 86)',
    chapters: [
      {
        id: 'ch-3',
        title: 'Chapter 1 · Limits & Continuity',
        lessons: [
          {
            id: 'l-6',
            title: 'Introduction to Limits',
            duration: '20:15',
            youtubeId: YT,
            completed: true,
            description: 'The intuition and formal notation behind limits.',
            documents: [{ id: 'd6', title: 'Limits Notes.pdf', type: 'pdf' }],
          },
          {
            id: 'l-7',
            title: 'Continuity of Functions',
            duration: '16:40',
            youtubeId: YT,
            completed: false,
            description: 'Identify discontinuities and test for continuity.',
            documents: [],
            assignmentId: 'e-3',
          },
        ],
      },
      {
        id: 'ch-4',
        title: 'Chapter 2 · Derivatives',
        lessons: [
          {
            id: 'l-8',
            title: 'Rules of Differentiation',
            duration: '28:50',
            youtubeId: YT,
            completed: false,
            description: 'Power, product, quotient and chain rules.',
            documents: [{ id: 'd7', title: 'Derivative Rules.pdf', type: 'pdf' }],
          },
        ],
      },
    ],
  },
  {
    id: 'c-geometry',
    title: 'Analytic Geometry',
    description: 'Coordinate geometry in the plane and in space, vectors and 3D shapes.',
    thumbnail: '/course-geometry.png',
    category: 'Grade 12',
    teacher: 'Tran Thi Mai',
    totalLessons: 20,
    progress: 30,
    color: 'oklch(0.55 0.03 258)',
    chapters: [
      {
        id: 'ch-5',
        title: 'Chapter 1 · Vectors in Space',
        lessons: [
          {
            id: 'l-9',
            title: 'Vectors & Coordinates',
            duration: '21:12',
            youtubeId: YT,
            completed: true,
            description: 'Represent points and vectors in 3D coordinate space.',
            documents: [],
          },
        ],
      },
    ],
  },
  {
    id: 'c-probability',
    title: 'Probability & Statistics',
    description: 'Counting principles, probability rules and statistical reasoning for exam success.',
    thumbnail: '/course-probability.png',
    category: 'Grade 12',
    teacher: 'Tran Thi Mai',
    totalLessons: 16,
    progress: 12,
    color: 'oklch(0.7 0.02 258)',
    chapters: [
      {
        id: 'ch-6',
        title: 'Chapter 1 · Counting & Combinatorics',
        lessons: [
          {
            id: 'l-10',
            title: 'Permutations & Combinations',
            duration: '23:30',
            youtubeId: YT,
            completed: false,
            description: 'The fundamental counting principle and its applications.',
            documents: [{ id: 'd8', title: 'Combinatorics.pdf', type: 'pdf' }],
          },
        ],
      },
    ],
  },
]

export const EXAMS: Exam[] = [
  {
    id: 'e-1',
    title: 'Functions Attendance Quiz #12',
    type: 'attendance',
    status: 'open',
    attempts: 284,
    attemptLimit: 'one-time',
    highestScore: 10,
    duration: 15,
    passingScore: 5,
    driveLink: 'https://drive.google.com/file/d/example/preview',
    showAnswers: true,
    studentStatus: 'passed',
    attemptsRemaining: 0,
    score: 9,
    topStudents: [
      { name: 'Le Minh Quan', score: 10 },
      { name: 'Pham Thu Ha', score: 10 },
      { name: 'Nguyen Van A', score: 9 },
      { name: 'Do Gia Bao', score: 9 },
      { name: 'Vu Khanh Linh', score: 8 },
    ],
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        prompt: 'What is the domain of f(x) = 1 / (x - 2)?',
        options: ['All real numbers', 'x ≠ 2', 'x > 2', 'x ≠ 0'],
        answer: 'x ≠ 2',
      },
      {
        id: 'q2',
        type: 'true-false',
        prompt: 'A quadratic function always has a maximum value.',
        options: ['True', 'False'],
        answer: 'False',
      },
      {
        id: 'q3',
        type: 'short-answer',
        prompt: 'State the range of f(x) = x^2.',
        answer: 'y ≥ 0',
      },
    ],
  },
  {
    id: 'e-2',
    title: 'Midterm — Function Analysis',
    type: 'periodic',
    status: 'open',
    attempts: 176,
    attemptLimit: 'one-time',
    highestScore: 9.5,
    duration: 90,
    passingScore: 5,
    driveLink: 'https://drive.google.com/file/d/example/preview',
    showAnswers: false,
    studentStatus: 'not-started',
    attemptsRemaining: 1,
    topStudents: [
      { name: 'Pham Thu Ha', score: 9.5 },
      { name: 'Le Minh Quan', score: 9.25 },
      { name: 'Tran Bao Ngoc', score: 9 },
      { name: 'Nguyen Van A', score: 8.75 },
      { name: 'Hoang Duc Anh', score: 8.5 },
    ],
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        prompt: 'The derivative of f(x) = x^3 is:',
        options: ['x^2', '3x^2', '3x', 'x^3/3'],
        answer: '3x^2',
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        prompt: 'Which point is a local minimum of f(x) = x^2 - 4x + 3?',
        options: ['(2, -1)', '(0, 3)', '(1, 0)', '(3, 0)'],
        answer: '(2, -1)',
      },
    ],
  },
  {
    id: 'e-3',
    title: 'Limits Practice (Free)',
    type: 'free',
    status: 'open',
    attempts: 512,
    attemptLimit: 'unlimited',
    highestScore: 10,
    duration: 30,
    passingScore: 4,
    driveLink: 'https://drive.google.com/file/d/example/preview',
    showAnswers: true,
    studentStatus: 'failed',
    attemptsRemaining: 999,
    score: 3.5,
    topStudents: [
      { name: 'Do Gia Bao', score: 10 },
      { name: 'Vu Khanh Linh', score: 10 },
      { name: 'Le Minh Quan', score: 9.5 },
      { name: 'Pham Thu Ha', score: 9.5 },
      { name: 'Tran Bao Ngoc', score: 9 },
    ],
    questions: [
      {
        id: 'q1',
        type: 'true-false',
        prompt: 'The limit of a continuous function equals the function value at that point.',
        options: ['True', 'False'],
        answer: 'True',
      },
    ],
  },
  {
    id: 'e-4',
    title: 'Integrals Attendance Quiz #13',
    type: 'attendance',
    status: 'locked',
    attempts: 0,
    attemptLimit: 'one-time',
    highestScore: 0,
    duration: 15,
    passingScore: 5,
    driveLink: 'https://drive.google.com/file/d/example/preview',
    showAnswers: false,
    studentStatus: 'not-started',
    attemptsRemaining: 1,
    topStudents: [],
    questions: [],
  },
  {
    id: 'e-5',
    title: 'Final Rehearsal — Full Mock Exam',
    type: 'periodic',
    status: 'draft',
    attempts: 0,
    attemptLimit: 'one-time',
    highestScore: 0,
    duration: 120,
    passingScore: 5,
    driveLink: 'https://drive.google.com/file/d/example/preview',
    showAnswers: false,
    studentStatus: 'not-started',
    attemptsRemaining: 1,
    topStudents: [],
    questions: [],
  },
]

const FIRST = ['Nguyen', 'Tran', 'Le', 'Pham', 'Hoang', 'Vu', 'Do', 'Bui', 'Dang', 'Ngo']
const MID = ['Van', 'Thi', 'Minh', 'Thu', 'Gia', 'Khanh', 'Bao', 'Duc', 'Hai', 'Ngoc']
const LAST = ['An', 'Binh', 'Chi', 'Dung', 'Ha', 'Linh', 'Nam', 'Quan', 'Trang', 'Yen']

export const STUDENTS: StudentRecord[] = Array.from({ length: 24 }).map((_, i) => {
  const name = `${FIRST[i % FIRST.length]} ${MID[i % MID.length]} ${LAST[i % LAST.length]}`
  const attendanceOpts = ['present', 'present', 'present', 'partial', 'absent'] as const
  return {
    id: `s-${i + 1}`,
    studentCode: `MS-2027-${String(100 + i).padStart(4, '0')}`,
    name,
    email: `${name.toLowerCase().replace(/ /g, '.')}@mathster.edu.vn`,
    courses: 2 + (i % 4),
    attendance: attendanceOpts[i % attendanceOpts.length],
    disabled: i % 11 === 0 && i !== 0,
    averageScore: Number((6.5 + (i % 7) * 0.5).toFixed(1)),
  }
})
