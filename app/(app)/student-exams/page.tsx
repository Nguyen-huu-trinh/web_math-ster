'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { EXAMS } from '@/lib/mock-data'
import { PageHeader } from '@/components/layout/page-header'
import { StudentExamCard } from '@/components/exams/student-exam-card'
import { InputGroup, InputGroupInput, InputGroupAddon } from '@/components/ui/input-group'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'not-started', label: 'Not started' },
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
]

export default function StudentExamsPage() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')

  // Students only see published exams (not drafts)
  const visible = EXAMS.filter((e) => e.status !== 'draft')

  const filtered = visible.filter((e) => {
    const matchesQuery = e.title.toLowerCase().includes(query.toLowerCase())
    const matchesFilter = filter === 'all' || (e.studentStatus ?? 'not-started') === filter
    return matchesQuery && matchesFilter
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="My Exams"
        description="Take assigned exams and review your results."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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

        <ToggleGroup
          value={[filter]}
          onValueChange={(v) => setFilter((v[0] as string) ?? 'all')}
          className="w-fit"
        >
          {FILTERS.map((f) => (
            <ToggleGroupItem key={f.value} value={f.value}>
              {f.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {filtered.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Search />
            </EmptyMedia>
            <EmptyTitle>No exams found</EmptyTitle>
            <EmptyDescription>Try a different search or filter.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((exam) => (
            <StudentExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      )}
    </div>
  )
}
