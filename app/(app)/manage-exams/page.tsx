'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Lock,
  LockOpen,
  Trophy,
  Sheet as SheetIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { EXAMS, COURSES } from '@/lib/mock-data'
import {
  EXAM_TYPE_LABEL,
  EXAM_STATUS_LABEL,
  examStatusVariant,
  downloadCsv,
} from '@/lib/exam-utils'
import type { Exam } from '@/lib/types'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { InputGroup, InputGroupInput, InputGroupAddon } from '@/components/ui/input-group'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { TopStudentsDialog } from '@/components/exams/top-students-dialog'

// Mock association of exams to courses
const EXAM_COURSE: Record<string, string> = {
  'e-1': COURSES[0].title,
  'e-2': COURSES[0].title,
  'e-3': COURSES[1].title,
  'e-4': COURSES[1].title,
  'e-5': COURSES[1].title,
}

const CREATED_DATES: Record<string, string> = {
  'e-1': 'Feb 12, 2027',
  'e-2': 'Feb 28, 2027',
  'e-3': 'Mar 04, 2027',
  'e-4': 'Mar 10, 2027',
  'e-5': 'Mar 15, 2027',
}

export default function ManageExamsPage() {
  const [exams, setExams] = useState<Exam[]>(EXAMS)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [topExam, setTopExam] = useState<Exam | null>(null)
  const [topOpen, setTopOpen] = useState(false)
  const [deleteExam, setDeleteExam] = useState<Exam | null>(null)

  const filtered = useMemo(
    () =>
      exams.filter((e) => {
        const matchesQuery = e.title.toLowerCase().includes(query.toLowerCase())
        const matchesType = typeFilter === 'all' || e.type === typeFilter
        const matchesStatus = statusFilter === 'all' || e.status === statusFilter
        return matchesQuery && matchesType && matchesStatus
      }),
    [exams, query, typeFilter, statusFilter],
  )

  function toggleLock(exam: Exam) {
    setExams((prev) =>
      prev.map((e) =>
        e.id === exam.id
          ? { ...e, status: e.status === 'locked' ? 'open' : 'locked' }
          : e,
      ),
    )
    toast.success(exam.status === 'locked' ? 'Exam unlocked' : 'Exam locked')
  }

  function confirmDelete() {
    if (!deleteExam) return
    setExams((prev) => prev.filter((e) => e.id !== deleteExam.id))
    toast.success('Exam deleted')
    setDeleteExam(null)
  }

  function handleExport() {
    downloadCsv(
      'mathster-exams.csv',
      [
        ['Exam Name', 'Type', 'Course', 'Attempts', 'Highest Score', 'Status', 'Created'],
        ...filtered.map((e) => [
          e.title,
          EXAM_TYPE_LABEL[e.type],
          EXAM_COURSE[e.id] ?? '—',
          e.attempts,
          e.highestScore,
          EXAM_STATUS_LABEL[e.status],
          CREATED_DATES[e.id] ?? '—',
        ]),
      ],
    )
    toast.success('Exported to Excel (CSV)')
  }

  function openTop(exam: Exam) {
    setTopExam(exam)
    setTopOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Manage Exams"
        description="Create, lock and review every assessment in your classes."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport}>
              <SheetIcon data-icon="inline-start" />
              Export Excel
            </Button>
            <Button render={<Link href="/create-exam" />}>
              <Plus data-icon="inline-start" />
              New exam
            </Button>
          </div>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <InputGroup className="sm:max-w-xs">
          <InputGroupInput
            placeholder="Search exams..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>

        <div className="flex items-center gap-2">
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? 'all')}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="attendance">Attendance</SelectItem>
              <SelectItem value="periodic">Periodic</SelectItem>
              <SelectItem value="free">Free</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="locked">Locked</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        {filtered.length === 0 ? (
          <Empty className="border-0 py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Search />
              </EmptyMedia>
              <EmptyTitle>No exams found</EmptyTitle>
              <EmptyDescription>Adjust your filters or create a new exam.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="pl-4">Exam Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Course</TableHead>
                <TableHead className="text-right">Attempts</TableHead>
                <TableHead className="text-right">Highest</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="pl-4 font-medium">{exam.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{EXAM_TYPE_LABEL[exam.type]}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {EXAM_COURSE[exam.id] ?? '—'}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{exam.attempts}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {exam.highestScore > 0 ? exam.highestScore.toFixed(2) : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={examStatusVariant(exam.status)}>
                      {EXAM_STATUS_LABEL[exam.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {CREATED_DATES[exam.id] ?? '—'}
                  </TableCell>
                  <TableCell className="pr-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openTop(exam)}
                      >
                        <Trophy data-icon="inline-start" />
                        Top 5
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon-sm" aria-label="Exam actions" />
                          }
                        >
                          <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem render={<Link href={`/exams/${exam.id}`} />}>
                            <Eye />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem render={<Link href="/create-exam" />}>
                            <Pencil />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleLock(exam)}>
                            {exam.status === 'locked' ? <LockOpen /> : <Lock />}
                            {exam.status === 'locked' ? 'Unlock' : 'Lock'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeleteExam(exam)}
                          >
                            <Trash2 />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <TopStudentsDialog exam={topExam} open={topOpen} onOpenChange={setTopOpen} />

      {/* Delete confirmation */}
      <Dialog open={!!deleteExam} onOpenChange={(o) => !o && setDeleteExam(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete exam?</DialogTitle>
            <DialogDescription>
              This will permanently remove &quot;{deleteExam?.title}&quot;. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="destructive" onClick={confirmDelete}>
              <Trash2 data-icon="inline-start" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
