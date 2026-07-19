'use client'

import { useState } from 'react'
import { Upload, UserPlus, GraduationCap, Users, Trash2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { COURSES } from '@/lib/mock-data'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

interface Account {
  id: string
  name: string
  email: string
  code?: string
  courses?: string[]
}

const INITIAL_TEACHERS: Account[] = [
  { id: 't1', name: 'Tran Thi Mai', email: 'teacher@mathster.edu.vn' },
  { id: 't2', name: 'Le Hoang Nam', email: 'nam.le@mathster.edu.vn' },
]

const INITIAL_STUDENTS: Account[] = [
  {
    id: 'sa1',
    name: 'Nguyen Van A',
    email: 'student@mathster.edu.vn',
    code: 'MS-2027-0184',
    courses: ['c-algebra', 'c-calculus'],
  },
]

function initials(name: string) {
  return name.split(' ').slice(-2).map((n) => n[0]).join('')
}

function PasswordInput(props: React.ComponentProps<typeof Input>) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input type={show ? 'text' : 'password'} className="pr-9" {...props} />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}

function AccountList({
  accounts,
  onDelete,
}: {
  accounts: Account[]
  onDelete: (id: string) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      {accounts.map((a) => (
        <div key={a.id} className="flex items-center gap-3 rounded-lg border p-3">
          <Avatar className="size-9">
            <AvatarFallback>{initials(a.name)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium">{a.name}</span>
            <span className="truncate text-xs text-muted-foreground">{a.email}</span>
          </div>
          {a.code ? (
            <Badge variant="secondary" className="font-mono">
              {a.code}
            </Badge>
          ) : null}
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${a.name}`}
            onClick={() => onDelete(a.id)}
          >
            <Trash2 />
          </Button>
        </div>
      ))}
    </div>
  )
}

export default function AccountsPage() {
  const [teachers, setTeachers] = useState<Account[]>(INITIAL_TEACHERS)
  const [students, setStudents] = useState<Account[]>(INITIAL_STUDENTS)
  const [assigned, setAssigned] = useState<string[]>([])
  const [importOpen, setImportOpen] = useState(false)

  function toggleCourse(id: string) {
    setAssigned((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  function addTeacher(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const name = String(form.get('name') ?? '').trim()
    const email = String(form.get('email') ?? '').trim()
    if (!name || !email) return toast.error('Please fill in all fields')
    setTeachers((prev) => [{ id: `t-${Date.now()}`, name, email }, ...prev])
    toast.success('Teacher account created')
    e.currentTarget.reset()
  }

  function addStudent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const name = String(form.get('name') ?? '').trim()
    const email = String(form.get('email') ?? '').trim()
    const code = String(form.get('code') ?? '').trim()
    if (!name || !email || !code) return toast.error('Please fill in all fields')
    setStudents((prev) => [
      { id: `s-${Date.now()}`, name, email, code, courses: assigned },
      ...prev,
    ])
    toast.success('Student account created')
    setAssigned([])
    e.currentTarget.reset()
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Account Management"
        description="Create and manage teacher and student accounts."
        action={
          <Dialog open={importOpen} onOpenChange={setImportOpen}>
            <DialogTrigger render={<Button variant="outline" />}>
              <Upload data-icon="inline-start" />
              Bulk import
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk import accounts</DialogTitle>
                <DialogDescription>
                  Upload an Excel (.xlsx) or CSV file to create multiple accounts at once.
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
                    toast.success('File received — accounts queued (mock)')
                    setImportOpen(false)
                  }}
                />
              </label>
              <DialogFooter showCloseButton />
            </DialogContent>
          </Dialog>
        }
      />

      <Tabs defaultValue="teachers">
        <TabsList>
          <TabsTrigger value="teachers">
            <GraduationCap data-icon="inline-start" />
            Teachers
          </TabsTrigger>
          <TabsTrigger value="students">
            <Users data-icon="inline-start" />
            Students
          </TabsTrigger>
        </TabsList>

        {/* Teachers */}
        <TabsContent value="teachers">
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">New teacher</CardTitle>
                <CardDescription>Create a teacher account.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={addTeacher} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="t-name">Full name</Label>
                    <Input id="t-name" name="name" placeholder="Le Hoang Nam" required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="t-email">Email</Label>
                    <Input id="t-email" name="email" type="email" placeholder="teacher@mathster.edu.vn" required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="t-password">Password</Label>
                    <PasswordInput id="t-password" name="password" placeholder="••••••••" required />
                  </div>
                  <Button type="submit">
                    <UserPlus data-icon="inline-start" />
                    Create teacher
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Teachers</CardTitle>
                <CardDescription>{teachers.length} accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <AccountList
                  accounts={teachers}
                  onDelete={(id) => {
                    setTeachers((prev) => prev.filter((t) => t.id !== id))
                    toast.success('Teacher removed')
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Students */}
        <TabsContent value="students">
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">New student</CardTitle>
                <CardDescription>Create a student account and assign courses.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={addStudent} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="s-code">Student code</Label>
                    <Input id="s-code" name="code" placeholder="MS-2027-0200" required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="s-name">Full name</Label>
                    <Input id="s-name" name="name" placeholder="Nguyen Van B" required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="s-email">Email</Label>
                    <Input id="s-email" name="email" type="email" placeholder="student@mathster.edu.vn" required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="s-password">Password</Label>
                    <PasswordInput id="s-password" name="password" placeholder="••••••••" required />
                  </div>

                  <Separator />

                  <div className="flex flex-col gap-2">
                    <Label>Assign courses</Label>
                    <div className="flex flex-col gap-2">
                      {COURSES.map((c) => (
                        <Label
                          key={c.id}
                          className="flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 font-normal transition-colors hover:bg-muted/50"
                        >
                          <Checkbox
                            checked={assigned.includes(c.id)}
                            onCheckedChange={() => toggleCourse(c.id)}
                          />
                          <span className="text-sm">{c.title}</span>
                        </Label>
                      ))}
                    </div>
                  </div>

                  <Button type="submit">
                    <UserPlus data-icon="inline-start" />
                    Create student
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Students</CardTitle>
                <CardDescription>{students.length} accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <AccountList
                  accounts={students}
                  onDelete={(id) => {
                    setStudents((prev) => prev.filter((s) => s.id !== id))
                    toast.success('Student removed')
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
