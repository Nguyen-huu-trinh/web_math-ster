'use client'

import { useMemo, useState } from 'react'
import {
  Search,
  Plus,
  Upload,
  Sheet as SheetIcon,
  MoreHorizontal,
  Eye,
  Pencil,
  Ban,
  Trash2,
  CircleCheckBig,
  Trash,
} from 'lucide-react'
import { toast } from 'sonner'
import { STUDENTS } from '@/lib/mock-data'
import { downloadCsv } from '@/lib/exam-utils'
import type { StudentRecord } from '@/lib/types'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'

const PAGE_SIZE = 8

const ATTENDANCE: Record<StudentRecord['attendance'], { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  present: { label: 'Present', variant: 'default' },
  partial: { label: 'Partial', variant: 'secondary' },
  absent: { label: 'Absent', variant: 'destructive' },
}

function initials(name: string) {
  return name.split(' ').slice(-2).map((n) => n[0]).join('')
}

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentRecord[]>(STUDENTS)
  const [query, setQuery] = useState('')
  const [attendanceFilter, setAttendanceFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<StudentRecord | null>(null)
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  const filtered = useMemo(
    () =>
      students.filter((s) => {
        const matchesQuery =
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.email.toLowerCase().includes(query.toLowerCase()) ||
          s.studentCode.toLowerCase().includes(query.toLowerCase())
        const matchesAttendance =
          attendanceFilter === 'all' || s.attendance === attendanceFilter
        return matchesQuery && matchesAttendance
      }),
    [students, query, attendanceFilter],
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function toggleDisable(student: StudentRecord) {
    setStudents((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, disabled: !s.disabled } : s)),
    )
    toast.success(student.disabled ? 'Student enabled' : 'Student disabled')
  }

  function confirmDelete() {
    if (!deleteTarget) return
    setStudents((prev) => prev.filter((s) => s.id !== deleteTarget.id))
    toast.success('Student deleted')
    setDeleteTarget(null)
  }

  function confirmDeleteAll() {
    setStudents([])
    toast.success('All students removed')
    setDeleteAllOpen(false)
  }

  function handleExport() {
    downloadCsv('mathster-students.csv', [
      ['Student Code', 'Full Name', 'Email', 'Courses', 'Attendance', 'Average Score'],
      ...filtered.map((s) => [
        s.studentCode,
        s.name,
        s.email,
        s.courses,
        ATTENDANCE[s.attendance].label,
        s.averageScore,
      ]),
    ])
    toast.success('Exported to Excel (CSV)')
  }

  function handleAddStudent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const name = String(form.get('name') ?? '').trim()
    const email = String(form.get('email') ?? '').trim()
    if (!name || !email) {
      toast.error('Name and email are required')
      return
    }
    const record: StudentRecord = {
      id: `s-${Date.now()}`,
      studentCode: String(form.get('code') ?? `MS-2027-${Math.floor(Math.random() * 900 + 100)}`),
      name,
      email,
      courses: 0,
      attendance: 'present',
      averageScore: 0,
    }
    setStudents((prev) => [record, ...prev])
    toast.success('Student added')
    setAddOpen(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Student Management"
        description="View, add and manage every student in your classes."
        action={
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger render={<Button />}>
              <Plus data-icon="inline-start" />
              Add student
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add student</DialogTitle>
                <DialogDescription>Create a new student profile.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddStudent} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="add-code">Student code</Label>
                  <Input id="add-code" name="code" placeholder="MS-2027-0200" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="add-name">Full name</Label>
                  <Input id="add-name" name="name" placeholder="Nguyen Van B" required />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="add-email">Email</Label>
                  <Input id="add-email" name="email" type="email" placeholder="student@mathster.edu.vn" required />
                </div>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline" type="button" />}>Cancel</DialogClose>
                  <Button type="submit">Add student</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <InputGroup className="sm:max-w-xs">
            <InputGroupInput
              placeholder="Search students..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
          </InputGroup>

          <Select
            value={attendanceFilter}
            onValueChange={(v) => {
              setAttendanceFilter(v)
              setPage(1)
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All attendance</SelectItem>
              <SelectItem value="present">Present</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="absent">Absent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Dialog open={importOpen} onOpenChange={setImportOpen}>
            <DialogTrigger render={<Button variant="outline" />}>
              <Upload data-icon="inline-start" />
              Import
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import students</DialogTitle>
                <DialogDescription>
                  Upload an Excel (.xlsx) or CSV file to bulk import students.
                </DialogDescription>
              </DialogHeader>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-center transition-colors hover:bg-muted/50">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Upload className="size-6" />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Click to upload or drag & drop</span>
                  <span className="text-xs text-muted-foreground">XLSX or CSV, up to 5MB</span>
                </div>
                <input
                  type="file"
                  accept=".xlsx,.csv"
                  className="hidden"
                  onChange={() => {
                    toast.success('File received — import queued (mock)')
                    setImportOpen(false)
                  }}
                />
              </label>
              <DialogFooter showCloseButton />
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={handleExport}>
            <SheetIcon data-icon="inline-start" />
            Export
          </Button>

          <Button
            variant="destructive"
            onClick={() => setDeleteAllOpen(true)}
            disabled={students.length === 0}
          >
            <Trash data-icon="inline-start" />
            Delete all
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        {pageRows.length === 0 ? (
          <Empty className="border-0 py-16">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Search />
              </EmptyMedia>
              <EmptyTitle>No students found</EmptyTitle>
              <EmptyDescription>
                {students.length === 0
                  ? 'Add a student or import from Excel to get started.'
                  : 'Try a different search term or filter.'}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead className="pl-4">Student</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Courses</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead className="text-right">Avg. Score</TableHead>
                <TableHead className="pr-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((s) => (
                <TableRow key={s.id} className={s.disabled ? 'opacity-55' : undefined}>
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback>{initials(s.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{s.name}</span>
                        {s.disabled ? (
                          <span className="text-xs text-muted-foreground">Disabled</span>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {s.studentCode}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.email}</TableCell>
                  <TableCell className="text-right tabular-nums">{s.courses}</TableCell>
                  <TableCell>
                    <Badge variant={ATTENDANCE[s.attendance].variant}>
                      {ATTENDANCE[s.attendance].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {s.averageScore.toFixed(1)}
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon-sm" aria-label="Student actions" />}
                      >
                        <MoreHorizontal />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => toast.info(`Viewing ${s.name}`)}>
                          <Eye />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.info(`Editing ${s.name}`)}>
                          <Pencil />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toggleDisable(s)}>
                          {s.disabled ? <CircleCheckBig /> : <Ban />}
                          {s.disabled ? 'Enable' : 'Disable'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(s)}>
                          <Trash2 />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {filtered.length > 0 ? (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Showing {(safePage - 1) * PAGE_SIZE + 1}–
            {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} students
          </p>
          <Pagination className="mx-0 w-fit">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setPage((p) => Math.max(1, p - 1))
                  }}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    isActive={i + 1 === safePage}
                    onClick={(e) => {
                      e.preventDefault()
                      setPage(i + 1)
                    }}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    setPage((p) => Math.min(totalPages, p + 1))
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}

      {/* Delete single */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete student?</DialogTitle>
            <DialogDescription>
              This will permanently remove {deleteTarget?.name}. This action cannot be undone.
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

      {/* Delete all */}
      <Dialog open={deleteAllOpen} onOpenChange={setDeleteAllOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete all students?</DialogTitle>
            <DialogDescription>
              This will permanently remove all {students.length} students. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="destructive" onClick={confirmDeleteAll}>
              <Trash data-icon="inline-start" />
              Delete all
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
