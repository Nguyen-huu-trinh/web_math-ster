'use client'

import { use, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'
import {
  ChevronLeft,
  Clock,
  FileText,
  Send,
  CircleCheckBig,
  CircleX,
  Home,
  RotateCcw,
} from 'lucide-react'
import { EXAMS } from '@/lib/mock-data'
import type { Exam } from '@/lib/types'
import { EXAM_TYPE_LABEL, QUESTION_TYPE_LABEL } from '@/lib/exam-utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
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
import { cn } from '@/lib/utils'

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function ExamTakingPage({
  params,
}: {
  params: Promise<{ examId: string }>
}) {
  const { examId } = use(params)
  const exam = EXAMS.find((e) => e.id === examId)
  if (!exam) notFound()

  return <ExamRunner exam={exam} />
}

function ExamRunner({ exam }: { exam: Exam }) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [resultOpen, setResultOpen] = useState(false)
  const [timeLeft, setTimeLeft] = useState(exam.duration * 60)
  const [submitted, setSubmitted] = useState(false)
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const total = exam.questions.length
  const answeredCount = Object.values(answers).filter(Boolean).length

  const result = useMemo(() => {
    let correct = 0
    for (const q of exam.questions) {
      if (answers[q.id]?.trim().toLowerCase() === q.answer.trim().toLowerCase()) correct++
    }
    const wrong = total - correct
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0
    const score = total > 0 ? Number(((correct / total) * 10).toFixed(2)) : 0
    const passed = score >= exam.passingScore
    return { correct, wrong, percentage, score, passed }
  }, [answers, exam.questions, exam.passingScore, total])

  useEffect(() => {
    if (submitted || total === 0) return
    if (timeLeft <= 0) {
      handleSubmit()
      return
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, submitted, total])

  function handleSubmit() {
    setSubmitted(true)
    setConfirmOpen(false)
    setResultOpen(true)
  }

  function scrollTo(id: string) {
    questionRefs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const lowTime = timeLeft <= 60

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/student-exams"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Back to exams
      </Link>

      <div className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-balance">
          {exam.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="outline">{EXAM_TYPE_LABEL[exam.type]}</Badge>
          <span>Passing score {exam.passingScore}/10</span>
        </div>
      </div>

      {total === 0 ? (
        <Empty className="py-16">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle>No questions available</EmptyTitle>
            <EmptyDescription>
              This exam has not been published with questions yet.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[360px_1fr]">
          {/* LEFT: PDF + info + timer */}
          <div className="flex flex-col gap-5 lg:sticky lg:top-24">
            {/* Timer */}
            <Card
              className={cn(
                'p-0 ring-1',
                lowTime ? 'ring-destructive/40' : 'ring-foreground/10',
              )}
            >
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className={cn('size-4', lowTime ? 'text-destructive' : 'text-primary')} />
                  Time remaining
                </div>
                <span
                  className={cn(
                    'font-mono text-lg font-semibold tabular-nums',
                    lowTime && 'text-destructive',
                  )}
                >
                  {formatTime(Math.max(timeLeft, 0))}
                </span>
              </div>
            </Card>

            <Card className="p-0">
              <div className="flex aspect-[3/4] flex-col items-center justify-center gap-3 bg-muted text-center">
                <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <FileText className="size-6" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Exam paper (PDF)</p>
                  <p className="max-w-xs text-xs text-muted-foreground">
                    Embedded Google Drive preview placeholder
                  </p>
                </div>
                <Button variant="outline" size="sm" render={<a href={exam.driveLink} target="_blank" rel="noreferrer" />}>
                  Open in Drive
                </Button>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Exam information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <Info label="Type" value={EXAM_TYPE_LABEL[exam.type]} />
                <Info label="Duration" value={`${exam.duration} min`} />
                <Info label="Questions" value={String(total)} />
                <Info label="Passing" value={`${exam.passingScore}/10`} />
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: navigator + answer sheet + submit */}
          <div className="flex flex-col gap-5">
            {/* Question navigator */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Question navigator
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    {answeredCount}/{total} answered
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {exam.questions.map((q, i) => {
                  const answered = !!answers[q.id]
                  return (
                    <button
                      key={q.id}
                      onClick={() => scrollTo(q.id)}
                      className={cn(
                        'flex size-8 items-center justify-center rounded-lg border text-sm font-medium tabular-nums transition-colors',
                        answered
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-background text-muted-foreground hover:bg-muted',
                      )}
                      aria-label={`Go to question ${i + 1}${answered ? ', answered' : ''}`}
                    >
                      {i + 1}
                    </button>
                  )
                })}
              </CardContent>
            </Card>

            {/* Answer sheet */}
            <h2 className="font-serif text-lg font-semibold">Answer sheet</h2>
            {exam.questions.map((q, i) => (
              <Card
                key={q.id}
                ref={(el) => {
                  questionRefs.current[q.id] = el
                }}
              >
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-start gap-2">
                    <Badge variant="secondary" className="shrink-0">
                      {i + 1}
                    </Badge>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-muted-foreground">
                        {QUESTION_TYPE_LABEL[q.type]}
                      </span>
                      <p className="text-sm font-medium leading-relaxed">{q.prompt}</p>
                    </div>
                  </div>

                  {q.type === 'short-answer' ? (
                    <Input
                      placeholder="Your answer"
                      value={answers[q.id] ?? ''}
                      disabled={submitted}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                      }
                    />
                  ) : (
                    <RadioGroup
                      value={answers[q.id] ?? ''}
                      onValueChange={(v) =>
                        setAnswers((prev) => ({ ...prev, [q.id]: v as string }))
                      }
                      className="gap-2"
                      disabled={submitted}
                    >
                      {(q.options ?? []).map((opt, oi) => (
                        <Label
                          key={oi}
                          className="flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 font-normal transition-colors hover:bg-muted/50 has-data-checked:border-primary has-data-checked:bg-primary/5"
                        >
                          <RadioGroupItem value={opt} />
                          {opt}
                        </Label>
                      ))}
                    </RadioGroup>
                  )}
                </CardContent>
              </Card>
            ))}

            <Button
              className="w-full"
              size="lg"
              onClick={() => setConfirmOpen(true)}
              disabled={submitted}
            >
              <Send data-icon="inline-start" />
              Submit exam
            </Button>
          </div>
        </div>
      )}

      {/* Confirm submit */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit your exam?</DialogTitle>
            <DialogDescription>
              You have answered {answeredCount} of {total} questions. You cannot change your answers
              after submitting.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Keep working</DialogClose>
            <Button onClick={handleSubmit}>
              <Send data-icon="inline-start" />
              Submit now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Result */}
      <Dialog open={resultOpen} onOpenChange={setResultOpen}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <div className="flex flex-col items-center gap-3 text-center">
              <div
                className={cn(
                  'flex size-14 items-center justify-center rounded-full',
                  result.passed ? 'bg-primary/15 text-primary' : 'bg-destructive/15 text-destructive',
                )}
              >
                {result.passed ? (
                  <CircleCheckBig className="size-7" />
                ) : (
                  <CircleX className="size-7" />
                )}
              </div>
              <DialogTitle className="text-xl">
                {result.passed ? 'Congratulations!' : 'Keep practising'}
              </DialogTitle>
              <Badge variant={result.passed ? 'default' : 'destructive'}>
                {result.passed ? 'Passed' : 'Failed'}
              </Badge>
            </div>
          </DialogHeader>

          <div className="flex items-center justify-center gap-2">
            <span className="font-serif text-4xl font-bold tabular-nums">
              {result.score.toFixed(1)}
            </span>
            <span className="text-lg text-muted-foreground">/ 10</span>
          </div>

          <Separator />

          <div className="grid grid-cols-3 gap-3 text-center">
            <ResultStat label="Correct" value={result.correct} tone="good" />
            <ResultStat label="Wrong" value={result.wrong} tone="bad" />
            <ResultStat label="Percentage" value={`${result.percentage}%`} />
          </div>

          <DialogFooter className="sm:justify-center">
            <Button variant="outline" onClick={() => setResultOpen(false)}>
              <RotateCcw data-icon="inline-start" />
              Review answers
            </Button>
            <Button render={<Link href="/dashboard" />}>
              <Home data-icon="inline-start" />
              Return home
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function ResultStat({
  label,
  value,
  tone,
}: {
  label: string
  value: string | number
  tone?: 'good' | 'bad'
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border p-3">
      <span
        className={cn(
          'font-serif text-2xl font-bold tabular-nums',
          tone === 'good' && 'text-primary',
          tone === 'bad' && 'text-destructive',
        )}
      >
        {value}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}
