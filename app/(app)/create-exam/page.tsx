'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Plus, Save, ListChecks } from 'lucide-react'
import { toast } from 'sonner'
import type { ExamType, QuestionType } from '@/lib/types'
import { COURSES } from '@/lib/mock-data'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  QuestionBuilder,
  newQuestion,
  type DraftQuestion,
} from '@/components/exams/question-builder'

export default function CreateExamPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [courseId, setCourseId] = useState(COURSES[0].id)
  const [description, setDescription] = useState('')
  const [driveLink, setDriveLink] = useState('')
  const [type, setType] = useState<ExamType>('periodic')
  const [attemptLimit, setAttemptLimit] = useState('one-time')
  const [duration, setDuration] = useState('60')
  const [passingScore, setPassingScore] = useState('5')
  const [showAnswers, setShowAnswers] = useState(false)
  const [locked, setLocked] = useState(false)
  const [questions, setQuestions] = useState<DraftQuestion[]>([newQuestion()])

  function addQuestion(qType: QuestionType) {
    setQuestions((prev) => [...prev, newQuestion(qType)])
  }

  function handleSave(asDraft = false) {
    if (!title.trim()) {
      toast.error('Please enter an exam name')
      return
    }
    toast.success(asDraft ? 'Exam saved as draft' : 'Exam published')
    router.push('/manage-exams')
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/manage-exams"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to manage exams
      </Link>

      <PageHeader
        title="Create Exam"
        description="Configure the exam settings and build your question set."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => handleSave(true)}>
              Save draft
            </Button>
            <Button onClick={() => handleSave(false)}>
              <Save data-icon="inline-start" />
              Publish exam
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Main form */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Exam details</CardTitle>
              <CardDescription>Basic information students will see.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="title">Exam name</Label>
                <Input
                  id="title"
                  placeholder="e.g. Midterm — Function Analysis"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="course">Course</Label>
                <Select value={courseId} onValueChange={(v) => setCourseId(v ?? '')}>
                  <SelectTrigger id="course" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSES.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What does this exam cover?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="drive">Google Drive link (exam paper)</Label>
                <Input
                  id="drive"
                  placeholder="https://drive.google.com/file/d/..."
                  value={driveLink}
                  onChange={(e) => setDriveLink(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-base">Questions</CardTitle>
                  <CardDescription>Reorder with the up / down controls.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <ListChecks className="size-4 text-muted-foreground" />
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {questions.length}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <QuestionBuilder questions={questions} onChange={setQuestions} />

              <div className="flex flex-wrap gap-2 border-t pt-4">
                <Button variant="outline" size="sm" onClick={() => addQuestion('multiple-choice')}>
                  <Plus data-icon="inline-start" />
                  Multiple choice
                </Button>
                <Button variant="outline" size="sm" onClick={() => addQuestion('true-false')}>
                  <Plus data-icon="inline-start" />
                  True / False
                </Button>
                <Button variant="outline" size="sm" onClick={() => addQuestion('short-answer')}>
                  <Plus data-icon="inline-start" />
                  Short answer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings sidebar */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label>Exam type</Label>
                <ToggleGroup
                  value={[type]}
                  onValueChange={(v) => setType((v[0] as ExamType) ?? type)}
                  className="w-full"
                >
                  <ToggleGroupItem value="attendance" className="flex-1">
                    Attendance
                  </ToggleGroupItem>
                  <ToggleGroupItem value="periodic" className="flex-1">
                    Periodic
                  </ToggleGroupItem>
                  <ToggleGroupItem value="free" className="flex-1">
                    Free
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Attempt limit</Label>
                <ToggleGroup
                  value={[attemptLimit]}
                  onValueChange={(v) => setAttemptLimit((v[0] as string) ?? attemptLimit)}
                  className="w-full"
                >
                  <ToggleGroupItem value="one-time" className="flex-1">
                    One time
                  </ToggleGroupItem>
                  <ToggleGroupItem value="unlimited" className="flex-1">
                    Unlimited
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="duration">Duration (min)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={1}
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="passing">Passing score</Label>
                  <Input
                    id="passing"
                    type="number"
                    min={0}
                    max={10}
                    step={0.5}
                    value={passingScore}
                    onChange={(e) => setPassingScore(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex flex-col">
                  <Label htmlFor="show-answers" className="cursor-pointer">
                    Show answers
                  </Label>
                  <span className="text-xs text-muted-foreground">Reveal after submission</span>
                </div>
                <Switch id="show-answers" checked={showAnswers} onCheckedChange={setShowAnswers} />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex flex-col">
                  <Label htmlFor="lock-exam" className="cursor-pointer">
                    Lock exam
                  </Label>
                  <span className="text-xs text-muted-foreground">Prevent students starting</span>
                </div>
                <Switch id="lock-exam" checked={locked} onCheckedChange={setLocked} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
