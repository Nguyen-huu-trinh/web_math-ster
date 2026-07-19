'use client'

import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  GripVertical,
  CircleDot,
  ToggleLeft,
  Type,
} from 'lucide-react'
import type { QuestionType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { QUESTION_TYPE_LABEL } from '@/lib/exam-utils'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'

export interface DraftQuestion {
  id: string
  type: QuestionType
  prompt: string
  options: string[]
  answer: string
}

const TYPE_ICON: Record<QuestionType, typeof CircleDot> = {
  'multiple-choice': CircleDot,
  'true-false': ToggleLeft,
  'short-answer': Type,
}

export function newQuestion(type: QuestionType = 'multiple-choice'): DraftQuestion {
  return {
    id: `q-${Math.random().toString(36).slice(2, 9)}`,
    type,
    prompt: '',
    options: type === 'true-false' ? ['True', 'False'] : type === 'multiple-choice' ? ['', ''] : [],
    answer: '',
  }
}

export function QuestionBuilder({
  questions,
  onChange,
}: {
  questions: DraftQuestion[]
  onChange: (questions: DraftQuestion[]) => void
}) {
  function update(id: string, patch: Partial<DraftQuestion>) {
    onChange(questions.map((q) => (q.id === id ? { ...q, ...patch } : q)))
  }

  function changeType(id: string, type: QuestionType) {
    const base = newQuestion(type)
    onChange(questions.map((q) => (q.id === id ? { ...base, id: q.id, prompt: q.prompt } : q)))
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir
    if (target < 0 || target >= questions.length) return
    const next = [...questions]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  function remove(id: string) {
    onChange(questions.filter((q) => q.id !== id))
  }

  function addOption(id: string) {
    const q = questions.find((x) => x.id === id)
    if (!q) return
    update(id, { options: [...q.options, ''] })
  }

  function updateOption(id: string, i: number, value: string) {
    const q = questions.find((x) => x.id === id)
    if (!q) return
    const options = q.options.map((o, idx) => (idx === i ? value : o))
    update(id, { options })
  }

  function removeOption(id: string, i: number) {
    const q = questions.find((x) => x.id === id)
    if (!q || q.options.length <= 2) return
    update(id, { options: q.options.filter((_, idx) => idx !== i) })
  }

  if (questions.length === 0) {
    return (
      <Empty className="py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Plus />
          </EmptyMedia>
          <EmptyTitle>No questions yet</EmptyTitle>
          <EmptyDescription>Add your first question to start building this exam.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {questions.map((q, index) => {
        const TypeIcon = TYPE_ICON[q.type]
        return (
          <Card key={q.id} className="overflow-hidden">
            <CardContent className="flex flex-col gap-4 py-1">
              <div className="flex items-center gap-2">
                <GripVertical className="size-4 text-muted-foreground/60" />
                <Badge variant="secondary" className="gap-1">
                  <TypeIcon className="size-3" />
                  Question {index + 1}
                </Badge>
                <div className="ml-auto flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Move up"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ChevronUp />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Move down"
                    disabled={index === questions.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ChevronDown />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Delete question"
                    onClick={() => remove(q.id)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`prompt-${q.id}`}>Question prompt</Label>
                  <Textarea
                    id={`prompt-${q.id}`}
                    placeholder="Type the question..."
                    value={q.prompt}
                    onChange={(e) => update(q.id, { prompt: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Type</Label>
                  <Select
                    value={q.type}
                    onValueChange={(v) => changeType(q.id, v as QuestionType)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(QUESTION_TYPE_LABEL) as QuestionType[]).map((t) => (
                        <SelectItem key={t} value={t}>
                          {QUESTION_TYPE_LABEL[t]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Answer editor per type */}
              {q.type === 'short-answer' ? (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`answer-${q.id}`}>Correct answer</Label>
                  <Input
                    id={`answer-${q.id}`}
                    placeholder="Expected answer"
                    value={q.answer}
                    onChange={(e) => update(q.id, { answer: e.target.value })}
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Label>Options · select the correct one</Label>
                  <RadioGroup
                    value={q.answer}
                    onValueChange={(v) => update(q.id, { answer: v as string })}
                    className="gap-2"
                  >
                    {q.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <RadioGroupItem value={opt || `__${i}`} aria-label={`Mark option ${i + 1} correct`} />
                        {q.type === 'true-false' ? (
                          <span className="flex-1 rounded-md border bg-muted/40 px-3 py-1.5 text-sm">
                            {opt}
                          </span>
                        ) : (
                          <>
                            <Input
                              value={opt}
                              placeholder={`Option ${i + 1}`}
                              onChange={(e) => updateOption(q.id, i, e.target.value)}
                            />
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Remove option"
                              disabled={q.options.length <= 2}
                              onClick={() => removeOption(q.id, i)}
                            >
                              <Trash2 />
                            </Button>
                          </>
                        )}
                      </div>
                    ))}
                  </RadioGroup>
                  {q.type === 'multiple-choice' ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-fit"
                      onClick={() => addOption(q.id)}
                    >
                      <Plus data-icon="inline-start" />
                      Add option
                    </Button>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
